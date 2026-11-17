import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    where,
    writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../../../services/firebase';
import { calculateDiscrepancy } from '../utils/discrepancy';

// If the staff module uses different status values, change them here only.
export const STATUS = {
    PENDING: 'PENDING_REVIEW',
    UNDER_REVIEW: 'UNDER_REVIEW',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
};
const REVIEWABLE = [STATUS.PENDING, STATUS.UNDER_REVIEW];

// Staff observation text that suggests a problem (heuristic).
const ISSUE_WORDS = /damag|missing|mismatch/i;

const toDate = (ts) => (ts && typeof ts.toDate === 'function' ? ts.toDate() : null);

function formatWhen(date) {
    if (!date) return '';
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startYesterday = new Date(startToday);
    startYesterday.setDate(startYesterday.getDate() - 1);
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (date >= startToday) return `Today, ${time}`;
    if (date >= startYesterday) return `Yesterday, ${time}`;
    const day = date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    return `${day}, ${time}`;
}

// Finds the first document where field == value. Cached per request.
function findOne(collectionName, field, value, cache) {
    if (!value) return Promise.resolve(null);
    const key = `${collectionName}:${field}:${value}`;
    if (!cache.has(key)) {
        cache.set(
            key,
            (async () => {
                const snap = await getDocs(
                    query(collection(db, collectionName), where(field, '==', value), limit(1))
                );
                return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
            })()
        );
    }
    return cache.get(key);
}

async function findWarehouse(warehouseId, cache) {
    if (!warehouseId) return null;
    const byField = await findOne('WAREHOUSE', 'warehouse_id', warehouseId, cache);
    if (byField) return byField;
    const snap = await getDoc(doc(db, 'WAREHOUSE', warehouseId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Turns one INSPECTION document into everything the screens need.
async function buildSummary(id, data, cache) {
    const [staff, inventory, section, obsSnap, imgSnap] = await Promise.all([
        findOne('EMPLOYEE', 'employee_id', data.employee_id, cache),
        findOne('INVENTORY', 'inventory_id', data.inventory_id, cache),
        findOne('SHELF_SECTION', 'section_id', data.section_id, cache),
        getDocs(query(collection(db, 'OBSERVATION'), where('inspection_id', '==', id))),
        getDocs(query(collection(db, 'IMAGE'), where('inspection_id', '==', id))),
    ]);

    const [product, shelf] = await Promise.all([
        findOne('PRODUCT', 'product_id', inventory?.product_id, cache),
        findOne('SHELF', 'shelf_id', section?.shelf_id, cache),
    ]);
    const warehouse = await findWarehouse(shelf?.warehouse_id, cache);

    const observation = obsSnap.docs
        .map((d) => d.data())
        .sort((a, b) => (toDate(a.created_at)?.getTime() || 0) - (toDate(b.created_at)?.getTime() || 0))
        .map((o) => o.description)
        .filter(Boolean)
        .join('\n');

    const photos = imgSnap.docs
        .map((d) => ({ id: d.id, url: d.data().image_url }))
        .filter((p) => p.url);

    const locationParts = [];
    if (warehouse) {
        locationParts.push([warehouse.location, warehouse.name].filter(Boolean).join(' – '));
    }
    if (shelf) locationParts.push(shelf.shelf_name || shelf.shelf_code);
    if (section) locationParts.push(section.section_code);

    const submittedAt = toDate(data.submitted_at) || toDate(data.created_at);

    return {
        inspectionId: id,
        displayId: `INS-${id.slice(0, 6).toUpperCase()}`,
        status: data.status,
        staffName: staff?.name ?? data.employee_id ?? 'Unknown staff',
        productName: product?.product_name ?? 'Unknown product',
        expectedQuantity: data.expected_quantity ?? inventory?.expected_quantity ?? 0,
        location: locationParts.join(' • ') || 'Unknown location',
        observation,
        hasIssues: ISSUE_WORDS.test(observation),
        photos,
        submittedAt,
        submittedLabel: formatWhen(submittedAt),
    };
}

// Inspections waiting for the manager (newest first).
export async function getPendingInspections() {
    const snap = await getDocs(
        query(collection(db, 'INSPECTION'), where('status', 'in', REVIEWABLE))
    );
    const cache = new Map();
    const items = await Promise.all(snap.docs.map((d) => buildSummary(d.id, d.data(), cache)));
    return items.sort(
        (a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0)
    );
}

// One inspection with photos and observation. Returns null if not found.
export async function getInspectionDetails(inspectionId) {
    const snap = await getDoc(doc(db, 'INSPECTION', inspectionId));
    if (!snap.exists()) return null;
    return buildSummary(snap.id, snap.data(), new Map());
}

// The logged-in manager's employee_id (EMPLOYEE doc id equals the auth uid).
async function getCurrentManagerId() {
    const user = auth.currentUser;
    if (!user) throw new Error('You are not logged in.');
    const snap = await getDoc(doc(db, 'EMPLOYEE', user.uid));
    return snap.exists() ? snap.data().employee_id : user.uid;
}

// Saves the ANALYSIS record and marks the inspection COMPLETED (all or nothing).
export async function completeInspection({
    inspectionId,
    expectedQuantity,
    verifiedQuantity,
    damagedQuantity,
    missingQuantity,
    comments,
}) {
    const managerId = await getCurrentManagerId();
    const { quantityDifference, discrepancyType } = calculateDiscrepancy(
        expectedQuantity,
        verifiedQuantity
    );

    const batch = writeBatch(db);
    const analysisRef = doc(collection(db, 'ANALYSIS'));
    batch.set(analysisRef, {
        analysis_id: analysisRef.id,
        inspection_id: inspectionId,
        expected_quantity: expectedQuantity,
        verified_quantity: verifiedQuantity,
        damaged_quantity: damagedQuantity,
        missing_quantity: missingQuantity,
        comments,
        quantity_difference: quantityDifference,
        discrepancy_type: discrepancyType,
        manager_id: managerId,
        analysed_at: serverTimestamp(),
    });
    batch.update(doc(db, 'INSPECTION', inspectionId), {
        status: STATUS.COMPLETED,
        reviewed_by: managerId,
        completed_at: serverTimestamp(),
        rejection_reason: '',
    });
    await batch.commit();
}

export async function rejectInspection({ inspectionId, reason }) {
    const managerId = await getCurrentManagerId();
    const batch = writeBatch(db);
    batch.update(doc(db, 'INSPECTION', inspectionId), {
        status: STATUS.REJECTED,
        reviewed_by: managerId,
        completed_at: serverTimestamp(),
        rejection_reason: reason,
    });
    await batch.commit();
}

function timeAgo(date) {
    if (!date) return '';
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}

// Numbers and recent activity for the dashboard.
export async function getDashboardData() {
    const [inspSnap, obsSnap] = await Promise.all([
        getDocs(collection(db, 'INSPECTION')),
        getDocs(collection(db, 'OBSERVATION')),
    ]);

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = (d) => d && d >= startToday;

    const issueIds = new Set(
        obsSnap.docs
            .map((d) => d.data())
            .filter((o) => ISSUE_WORDS.test(o.description || ''))
            .map((o) => o.inspection_id)
    );

    const inspections = inspSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const pending = inspections.filter((i) => REVIEWABLE.includes(i.status));
    const finished = inspections
        .filter((i) => i.status === STATUS.COMPLETED || i.status === STATUS.REJECTED)
        .map((i) => ({ ...i, doneAt: toDate(i.completed_at) }));

    return {
        stats: {
            pending: pending.length,
            completedToday: finished.filter((i) => i.status === STATUS.COMPLETED && isToday(i.doneAt)).length,
            issuesFound: pending.filter((i) => issueIds.has(i.id)).length,
            rejected: finished.filter((i) => i.status === STATUS.REJECTED && isToday(i.doneAt)).length,
        },
        recentActivity: finished
            .filter((i) => i.doneAt)
            .sort((a, b) => b.doneAt - a.doneAt)
            .slice(0, 3)
            .map((i) => ({
                id: i.id,
                displayId: `INS-${i.id.slice(0, 6).toUpperCase()}`,
                status: i.status === STATUS.COMPLETED ? 'completed' : 'rejected',
                timeAgo: timeAgo(i.doneAt),
            })),
    };
}