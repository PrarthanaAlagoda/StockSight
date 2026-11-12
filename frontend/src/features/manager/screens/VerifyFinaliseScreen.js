import { useState } from 'react';
import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    Modal, Alert, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../components/StatusBadge';
import { colors } from '../theme';
import { inspectionDetails } from '../data/mockData';
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
    const inspectionId = route?.params?.inspectionId ?? 'INS-0032';
    const data = inspectionDetails[inspectionId];

    const [verified, setVerified] = useState('');
    const [damaged, setDamaged] = useState('');
    const [missing, setMissing] = useState('');
    const [comments, setComments] = useState('');
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    if (!data) {
        return (
            <SafeAreaView style={styles.safe}>
                <Text style={styles.notFound}>Inspection not found.</Text>
            </SafeAreaView>
        );
    }

    const hasVerified = verified !== '';
    const verifiedNum = Number(verified) || 0;
    const { quantityDifference, discrepancyType } = calculateDiscrepancy(
        data.expectedQuantity,
        verifiedNum
    );

    const goBackToQueue = () => navigation?.navigate?.('PendingQueue');

    const handleComplete = () => {
        if (!hasVerified) {
            Alert.alert('Missing quantity', 'Please enter the verified physical quantity.');
            return;
        }
        if (comments.trim() === '') {
            Alert.alert('Missing comments', 'Please add manager comments.');
            return;
        }

        // TODO: save this to Firestore (ANALYSIS collection) when the backend is ready.
        const analysis = {
            inspectionId: data.inspectionId,
            verifiedQuantity: verifiedNum,
            damagedQuantity: Number(damaged) || 0,
            missingQuantity: Number(missing) || 0,
            quantityDifference,
            discrepancyType,
            managerComments: comments.trim(),
            status: 'COMPLETED',
        };
        console.log('Analysis to save:', analysis);

        Alert.alert('Review completed', `${data.inspectionId} has been finalised.`, [
            { text: 'OK', onPress: goBackToQueue },
        ]);
    };

    const handleReject = () => {
        if (rejectReason.trim() === '') {
            Alert.alert('Reason required', 'Please enter a reason for rejecting.');
            return;
        }

        // TODO: save status 'REJECTED' and rejectionReason to Firestore.
        console.log('Rejected:', {
            inspectionId: data.inspectionId,
            status: 'REJECTED',
            rejectionReason: rejectReason.trim(),
        });

        setRejectOpen(false);
        setRejectReason('');
        Alert.alert('Inspection rejected', `${data.inspectionId} has been rejected.`, [
            { text: 'OK', onPress: goBackToQueue },
        ]);
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack?.()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verify & Finalise</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {/* Summary */}
                <View style={styles.summary}>
                    <View style={styles.summaryIcon}>
                        <Ionicons name="clipboard-outline" size={26} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.summaryId}>{data.inspectionId}</Text>
                        <Text style={styles.summarySub}>
                            {data.productName}  |  {data.staffName}
                        </Text>
                    </View>
                    <StatusBadge status={data.status} />
                </View>

                {/* Verification */}
                <Text style={styles.sectionTitle}>Verification</Text>
                <View style={styles.card}>
                    <QuantityField
                        label="Verified Physical Quantity"
                        required
                        value={verified}
                        onChangeText={setVerified}
                    />
                    <QuantityField label="Damaged Items" value={damaged} onChangeText={setDamaged} />
                    <QuantityField label="Missing Items" value={missing} onChangeText={setMissing} />
                </View>

                {/* Discrepancy summary */}
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

                {/* Comments */}
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

                {/* Buttons */}
                <View style={styles.btnRow}>
                    <TouchableOpacity
                        style={styles.rejectBtn}
                        activeOpacity={0.85}
                        onPress={() => setRejectOpen(true)}
                    >
                        <Ionicons name="close-circle-outline" size={20} color={colors.rejectText} />
                        <Text style={styles.rejectText}>Reject{'\n'}Inspection</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.completeBtn}
                        activeOpacity={0.85}
                        onPress={handleComplete}
                    >
                        <Ionicons name="checkmark" size={22} color="#fff" />
                        <Text style={styles.completeText}>Complete{'\n'}Review</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Reject reason popup */}
            <Modal
                visible={rejectOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setRejectOpen(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Reject Inspection</Text>
                        <Text style={styles.modalSub}>Please enter a reason for rejecting {data.inspectionId}.</Text>
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
                            <TouchableOpacity style={styles.modalConfirm} onPress={handleReject}>
                                <Text style={styles.modalConfirmText}>Reject</Text>
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
    notFound: { textAlign: 'center', marginTop: 60, color: colors.muted },
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
        width: 115,
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
    discrepancyCard: {
        backgroundColor: colors.successBg,
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
    },
    discHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    discTitle: { marginLeft: 8, fontSize: 16, fontWeight: '700', color: colors.text },
    discRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    discLabel: { fontSize: 14, color: '#374151' },
    discValue: { fontSize: 14, fontWeight: '600', color: colors.text },
    discTotal: { borderTopWidth: 1, borderTopColor: '#B7DFC2', marginTop: 4, paddingTop: 10 },
    discTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
    discTotalValue: { fontSize: 18, fontWeight: '800' },
    commentBox: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 12,
        marginBottom: 20,
    },
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