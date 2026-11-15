
import {
  getFilteredDocuments,
  getDocuments,
  getDocumentById,
  updateDocument,
} from '../../services/firestore';

import { COLLECTIONS } from '../../utils/constants';

import {
  createInspectionModel,
  createImageModel,
} from '../../models/inspection';

import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../../services/firebase';

// ==========================================
// PRODUCT FUNCTIONS
// ==========================================

// Get all active products
export async function getProducts() {
  try {
    const products = await getDocuments(COLLECTIONS.PRODUCT);

    return products.filter(
      (product) => product.status === 'ACTIVE'
    );
  } catch (error) {
    console.error('Error retrieving products:', error);
    throw error;
  }
}

// Get a product by its document ID
export async function getProductById(documentId) {
  try {
    return await getDocumentById(
      COLLECTIONS.PRODUCT,
      documentId
    );
  } catch (error) {
    console.error('Error retrieving product:', error);
    throw error;
  }
}

// ==========================================
// INVENTORY FUNCTIONS
// ==========================================

// Get inventory records for a specific product
export async function getInventoryByProductId(productId) {
  try {
    return await getFilteredDocuments(
      COLLECTIONS.INVENTORY,
      [
        {
          field: 'product_id',
          operator: '==',
          value: productId,
        },
      ]
    );
  } catch (error) {
    console.error('Error retrieving product inventory:', error);
    throw error;
  }
}

// Get inventory records for a specific shelf section
export async function getInventoryBySectionId(sectionId) {
  try {
    return await getFilteredDocuments(
      COLLECTIONS.INVENTORY,
      [
        {
          field: 'section_id',
          operator: '==',
          value: sectionId,
        },
      ]
    );
  } catch (error) {
    console.error('Error retrieving section inventory:', error);
    throw error;
  }
}

// Get shelf section details by document ID
export async function getShelfSectionById(sectionId) {
  try {
    const sections = await getDocuments(COLLECTIONS.SHELF_SECTION);

    return sections.find(
      (section) => section.section_id === sectionId
    ) || null;
  } catch (error) {
    console.error('Error retrieving shelf section:', error);
    throw error;
  }
}

// ==========================================
// INSPECTION FUNCTIONS
// ==========================================

// Create a new staff inspection
// Generates references: INS-0001, INS-0002...
export async function createInspection(inspectionData) {
  try {
    // Get existing inspection records
    const inspections = await getDocuments(
      COLLECTIONS.INSPECTION
    );

    // Find the highest existing inspection number
    const existingNumbers = inspections.map((inspection) => {
      const match = inspection.inspection_number?.match(
        /^INS-(\d+)$/
      );

      return match ? Number(match[1]) : 0;
    });

    const highestNumber = Math.max(0, ...existingNumbers);
    const nextNumber = highestNumber + 1;

    // Generate the next inspection reference
    const inspectionNumber =
      `INS-${String(nextNumber).padStart(4, '0')}`;

    // Create a new inspection document
    const inspectionRef = doc(
      collection(db, COLLECTIONS.INSPECTION)
    );

    const inspectionRecord = createInspectionModel({
      ...inspectionData,
      inspectionId: inspectionRef.id,
    });

    inspectionRecord.inspection_number = inspectionNumber;

    await setDoc(inspectionRef, inspectionRecord);

    return inspectionRef.id;
  } catch (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
}

// ==========================================
// OBSERVATION FUNCTIONS
// ==========================================

// Save a staff observation
export async function saveObservation({
  inspectionId,
  employeeId,
  description,
  type = 'TEXT',
}) {
  try {
    const observationRef = await addDoc(
      collection(db, COLLECTIONS.OBSERVATION),
      {
        observation_id: '',
        inspection_id: inspectionId,
        employee_id: employeeId,
        description,
        type,
        created_at: serverTimestamp(),
      }
    );

    await updateDocument(
      COLLECTIONS.OBSERVATION,
      observationRef.id,
      {
        observation_id: observationRef.id,
      }
    );

    return observationRef.id;
  } catch (error) {
    console.error('Error saving observation:', error);
    throw error;
  }
}

// ==========================================
// IMAGE FUNCTIONS
// ==========================================

// Save uploaded image details to Firestore
export async function saveInspectionImage({
  inspectionId,
  imageUrl,
  publicId,
}) {
  try {
    const imageRef = doc(
      collection(db, COLLECTIONS.IMAGE)
    );

    const imageRecord = createImageModel({
      imageId: imageRef.id,
      inspectionId,
      imageUrl,
      publicId,
    });

    await setDoc(imageRef, imageRecord);

    return imageRef.id;
  } catch (error) {
    console.error('Error saving inspection image:', error);
    throw error;
  }
}

// ==========================================
// INSPECTION HISTORY
// ==========================================

// Get inspection history for a staff member
export async function getInspectionHistory(employeeId) {
  try {
    const inspections = await getFilteredDocuments(
      COLLECTIONS.INSPECTION,
      [
        {
          field: 'employee_id',
          operator: '==',
          value: employeeId,
        },
      ]
    );

    return inspections.sort((a, b) => {
      const dateA = a.submitted_at?.toMillis?.() || 0;
      const dateB = b.submitted_at?.toMillis?.() || 0;

      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error retrieving inspection history:', error);
    throw error;
  }
}

// ==========================================
// SUBMIT INSPECTION
// ==========================================

// Submit an inspection for manager review
export async function submitInspection(inspectionId) {
  try {
    await updateDocument(
      COLLECTIONS.INSPECTION,
      inspectionId,
      {
        status: 'PENDING_REVIEW',
        submitted_at: serverTimestamp(),
      }
    );

    return true;
  } catch (error) {
    console.error('Error submitting inspection:', error);
    throw error;
  }
}

// ==========================================
// TEST PRODUCT RETRIEVAL
// ==========================================

export async function testProductRetrieval() {
  try {
    const products = await getProducts();

    console.log('Products retrieved from Firebase:', products);

    return products;
  } catch (error) {
    console.error('Product retrieval failed:', error);
    throw error;
  }
}

// ==========================================
// STAFF DASHBOARD DATA
// ==========================================

export async function getStaffDashboardData(employeeId) {
  try {
    // Get inspections belonging to this employee
    const inspections = await getInspectionHistory(employeeId);

    // Get analysis records
    const analyses = await getDocuments(COLLECTIONS.ANALYSIS);

    // Get today's date using local time
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    // Count inspections submitted today
    const inspectedToday = inspections.filter((inspection) => {
      const submittedAt = inspection.submitted_at?.toDate?.();

      return (
        submittedAt &&
        submittedAt >= startOfToday &&
        submittedAt < startOfTomorrow
      );
    }).length;

    // Get IDs of this employee's inspections
    const inspectionIds = new Set(
      inspections.map((inspection) => inspection.inspection_id)
    );

    // Keep only analysis records belonging to this employee
    const employeeAnalyses = analyses.filter((analysis) =>
      inspectionIds.has(analysis.inspection_id)
    );

    // Calculate damaged and missing quantities
    const damagedItems = employeeAnalyses.reduce(
      (total, analysis) =>
        total + Number(analysis.damaged_quantity || 0),
      0
    );

    const missingItems = employeeAnalyses.reduce(
      (total, analysis) =>
        total + Number(analysis.missing_quantity || 0),
      0
    );

    // Get the three most recent inspections
    const recentInspections = [...inspections]
      .sort((a, b) => {
        const dateA = a.submitted_at?.toMillis?.() || 0;
        const dateB = b.submitted_at?.toMillis?.() || 0;

        return dateB - dateA;
      })
      .slice(0, 3);

    return {
      totalInspected: inspections.length,
      inspectedToday,
      damagedItems,
      missingItems,
      recentInspections,
    };
  } catch (error) {
    console.error('Error retrieving staff dashboard data:', error);
    throw error;
  }
}
