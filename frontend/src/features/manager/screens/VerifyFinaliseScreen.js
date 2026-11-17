import { useState, useEffect } from 'react';
import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    Modal, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../components/StatusBadge';
import { colors } from '../theme';
import {
    getInspectionDetails,
    completeInspection,
    rejectInspection,
} from '../services/managerService';
import { calculateDiscrepancy } from '../utils/discrepancy';

const MAX_COMMENT = 500;

function QuantityField({ label, required, value, onChangeText }) {
    return (
        <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel} numberOfLines={1} adjustsFontSizeToFit>
                {label}
                {required ? ' *' : ''}
            </Text>
            <View style={styles.inputBox}>
                <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                />
                <Text style={styles.unit}>units</Text>
            </View>
        </View>
    );
}

export default function VerifyFinaliseScreen({ navigation, route }) {
    const inspectionId = route?.params?.inspectionId;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [verified, setVerified] = useState('');
    const [damaged, setDamaged] = useState('');
    const [missing, setMissing] = useState('');
    const [comments, setComments] = useState('');
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        let alive = true;
        (async () => {
            if (!inspectionId) {
                setError('No inspection selected.');
                setLoading(false);
                return;
            }
            try {
                const result = await getInspectionDetails(inspectionId);
                if (!alive) return;
                if (!result) setError('Inspection not found.');
                setData(result);
            } catch (e) {
                console.log('getInspectionDetails error:', e);
                if (alive) setError(e?.message ?? 'Could not load inspection.');
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [inspectionId]);

    const Header = (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack?.()}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verify & Finalise</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                {Header}
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    if (error || !data) {
        return (
            <SafeAreaView style={styles.safe}>
                {Header}
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error || 'Inspection not found.'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const hasVerified = verified !== '';
    const verifiedNum = Number(verified) || 0;
    const { quantityDifference } = calculateDiscrepancy(data.expectedQuantity, verifiedNum);

    const goBackToQueue = () => navigation?.navigate?.('PendingQueue');

    const handleComplete = async () => {
        if (!hasVerified) {
            Alert.alert('Missing quantity', 'Please enter the verified physical quantity.');
            return;
        }
        if (comments.trim() === '') {
            Alert.alert('Missing comments', 'Please add manager comments.');
            return;
        }
        try {
            setSaving(true);
            await completeInspection({
                inspectionId: data.inspectionId,
                expectedQuantity: data.expectedQuantity,
                verifiedQuantity: verifiedNum,
                damagedQuantity: Number(damaged) || 0,
                missingQuantity: Number(missing) || 0,
                comments: comments.trim(),
            });
            Alert.alert('Review completed', `${data.displayId} has been finalised.`, [
                { text: 'OK', onPress: goBackToQueue },
            ]);
        } catch (e) {
            console.log('completeInspection error:', e);
            Alert.alert('Could not save', e?.message ?? 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleReject = async () => {
        if (rejectReason.trim() === '') {
            Alert.alert('Reason required', 'Please enter a reason for rejecting.');
            return;
        }
        try {
            setSaving(true);
            await rejectInspection({
                inspectionId: data.inspectionId,
                reason: rejectReason.trim(),
            });
            setRejectOpen(false);
            setRejectReason('');
            Alert.alert('Inspection rejected', `${data.displayId} has been rejected.`, [
                { text: 'OK', onPress: goBackToQueue },
            ]);
        } catch (e) {
            console.log('rejectInspection error:', e);
            Alert.alert('Could not save', e?.message ?? 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            {Header}

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.summary}>
                    <View style={styles.summaryIcon}>
                        <Ionicons name="clipboard-outline" size={26} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.summaryId}>{data.displayId}</Text>
                        <Text style={styles.summarySub}>
                            {data.productName}  |  {data.staffName}
                        </Text>
                    </View>
                    <StatusBadge status={data.hasIssues ? 'issues' : 'pending'} />
                </View>

                <Text style={styles.sectionTitle}>Verification</Text>
                <View style={styles.card}>
                    <QuantityField label="Verified Physical Quantity" required value={verified} onChangeText={setVerified} />
                    <QuantityField label="Damaged Items" value={damaged} onChangeText={setDamaged} />
                    <QuantityField label="Missing Items" value={missing} onChangeText={setMissing} />
                </View>

                <View style={styles.discrepancyCard}>
                    <View style={styles.discHeader}>
                        <Ionicons name="stats-chart-outline" size={20} color={colors.primary} />
                        <Text style={styles.discTitle}>Discrepancy Summary</Text>
                    </View>
                    <View style={styles.discRow}>
                        <Text style={styles.discLabel}>Expected Quantity</Text>
                        <Text style={styles.discValue}>{data.expectedQuantity}</Text>
                    </View>
                    <View style={styles.discRow}>
                        <Text style={styles.discLabel}>Verified Quantity</Text>
                        <Text style={styles.discValue}>{hasVerified ? verifiedNum : '-'}</Text>
                    </View>
                    <View style={[styles.discRow, styles.discTotal]}>
                        <Text style={styles.discTotalLabel}>Total Discrepancy</Text>
                        <Text
                            style={[
                                styles.discTotalValue,
                                { color: hasVerified && quantityDifference > 0 ? colors.rejectText : colors.successText },
                            ]}
                        >
                            {hasVerified ? quantityDifference : '-'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Manager Comments *</Text>
                <View style={styles.commentBox}>
                    <TextInput
                        style={styles.commentInput}
                        multiline
                        maxLength={MAX_COMMENT}
                        value={comments}
                        onChangeText={setComments}
                        placeholder="Add your comments here..."
                        placeholderTextColor={colors.muted}
                        textAlignVertical="top"
                    />
                    <Text style={styles.counter}>
                        {comments.length}/{MAX_COMMENT}
                    </Text>
                </View>

                <View style={styles.btnRow}>
                    <TouchableOpacity
                        style={[styles.rejectBtn, saving && styles.disabled]}
                        activeOpacity={0.85}
                        disabled={saving}
                        onPress={() => setRejectOpen(true)}
                    >
                        <Ionicons name="close-circle-outline" size={20} color={colors.rejectText} />
                        <Text style={styles.rejectText}>Reject{'\n'}Inspection</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.completeBtn, saving && styles.disabled]}
                        activeOpacity={0.85}
                        disabled={saving}
                        onPress={handleComplete}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={22} color="#fff" />
                                <Text style={styles.completeText}>Complete{'\n'}Review</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={rejectOpen} transparent animationType="fade" onRequestClose={() => setRejectOpen(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Reject Inspection</Text>
                        <Text style={styles.modalSub}>Please enter a reason for rejecting {data.displayId}.</Text>
                        <TextInput
                            style={styles.modalInput}
                            multiline
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            placeholder="Rejection reason..."
                            placeholderTextColor={colors.muted}
                            textAlignVertical="top"
                        />
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity
                                style={styles.modalCancel}
                                onPress={() => {
                                    setRejectOpen(false);
                                    setRejectReason('');
                                }}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalConfirm, saving && styles.disabled]}
                                disabled={saving}
                                onPress={handleReject}
                            >
                                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalConfirmText}>Reject</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    errorBox: { margin: 18, padding: 16, backgroundColor: colors.rejectBg, borderRadius: 14 },
    errorText: { color: colors.rejectText, fontSize: 14 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    container: { paddingHorizontal: 18, paddingBottom: 40 },
    summary: {
        backgroundColor: colors.primaryLight,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    summaryIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    summaryId: { fontSize: 18, fontWeight: '700', color: colors.text },
    summarySub: { fontSize: 12, color: '#374151', marginTop: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 18,
    },
    fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    fieldLabel: { flex: 1, fontSize: 13, color: colors.text, marginRight: 8 },
    inputBox: {
        width: 105,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D5E2D8',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
    },
    input: { flex: 1, fontSize: 15, color: colors.text, padding: 0 },
    unit: { fontSize: 13, color: colors.muted },
    discrepancyCard: { backgroundColor: colors.successBg, borderRadius: 16, padding: 14, marginBottom: 20 },
    discHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    discTitle: { marginLeft: 8, fontSize: 16, fontWeight: '700', color: colors.text },
    discRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    discLabel: { fontSize: 14, color: '#374151' },
    discValue: { fontSize: 14, fontWeight: '600', color: colors.text },
    discTotal: { borderTopWidth: 1, borderTopColor: '#B7DFC2', marginTop: 4, paddingTop: 10 },
    discTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
    discTotalValue: { fontSize: 18, fontWeight: '800' },
    commentBox: { backgroundColor: colors.card, borderRadius: 14, padding: 12, marginBottom: 20 },
    commentInput: { minHeight: 90, fontSize: 14, color: colors.text, padding: 0 },
    counter: { alignSelf: 'flex-end', fontSize: 12, color: colors.muted, marginTop: 6 },
    btnRow: { flexDirection: 'row' },
    rejectBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.rejectText,
        borderRadius: 14,
        paddingVertical: 14,
        backgroundColor: '#fff',
        marginRight: 12,
    },
    rejectText: { marginLeft: 8, color: colors.rejectText, fontWeight: '700', fontSize: 15, textAlign: 'center' },
    completeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 14,
    },
    completeText: { marginLeft: 8, color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
    disabled: { opacity: 0.6 },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 18, padding: 18 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    modalSub: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 12 },
    modalInput: {
        minHeight: 90,
        borderWidth: 1,
        borderColor: '#D5E2D8',
        borderRadius: 10,
        padding: 10,
        fontSize: 14,
        color: colors.text,
    },
    modalBtnRow: { flexDirection: 'row', marginTop: 14 },
    modalCancel: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.background,
        alignItems: 'center',
        marginRight: 10,
    },
    modalCancelText: { fontWeight: '700', color: colors.text },
    modalConfirm: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.rejectText,
        alignItems: 'center',
    },
    modalConfirmText: { fontWeight: '700', color: '#fff' },
});