import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../components/StatusBadge';
import DetailRow from '../components/DetailRow';
import { colors } from '../theme';
import { inspectionDetails } from '../data/mockData';

export default function InspectionReviewScreen({ navigation, route }) {
    const inspectionId = route?.params?.inspectionId ?? 'INS-0032';
    const data = inspectionDetails[inspectionId];

    if (!data) {
        return (
            <SafeAreaView style={styles.safe}>
                <Text style={styles.notFound}>Inspection not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack?.()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inspection Review & Evidence</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Summary card */}
                <View style={styles.summary}>
                    <View style={styles.summaryIcon}>
                        <Ionicons name="clipboard-outline" size={26} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.summaryId}>{data.inspectionId}</Text>
                        <Text style={styles.summarySub}>Submitted: {data.submittedAt}</Text>
                    </View>
                    <StatusBadge status={data.status} />
                </View>

                {/* Inspection details */}
                <Text style={styles.sectionTitle}>Inspection Details</Text>
                <View style={styles.card}>
                    <DetailRow icon="person-outline" label="Staff Inspector" value={data.staffName} />
                    <DetailRow icon="cube-outline" label="Product" value={data.productName} />
                    <DetailRow icon="layers-outline" label="Expected Quantity" value={data.expectedQuantity} />
                    <DetailRow icon="document-text-outline" label="Staff-Reported Actual" value={data.staffReportedQuantity} />
                    <DetailRow icon="location-outline" label="Warehouse Location" value={data.warehouseLocation} isLast />
                </View>

                {/* Photo evidence */}
                <View style={styles.photoHeader}>
                    <Text style={styles.sectionTitle}>Photo Evidence ({data.photos.length})</Text>
                    <TouchableOpacity style={styles.reviewBtn}>
                        <Ionicons name="eye-outline" size={16} color={colors.primary} />
                        <Text style={styles.reviewBtnText}>Review Photos</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.photoRow}>
                    {data.photos.map((photo) => (
                        <View key={photo.id} style={styles.photoBox}>
                            {photo.url ? (
                                <Image source={{ uri: photo.url }} style={styles.photo} />
                            ) : (
                                <Ionicons name="image-outline" size={40} color={colors.muted} />
                            )}
                            <View style={styles.expandBtn}>
                                <Ionicons name="expand-outline" size={16} color={colors.text} />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Staff observation */}
                <Text style={styles.sectionTitle}>Staff Observation</Text>
                <View style={styles.quoteBox}>
                    <Ionicons name="chatbox-ellipses" size={20} color={colors.primary} />
                    <Text style={styles.quoteText}>{data.observation}</Text>
                </View>

                {/* Continue button */}
                <TouchableOpacity
                    style={styles.continueBtn}
                    activeOpacity={0.85}
                    onPress={() =>
                        navigation?.navigate?.('VerifyFinalise', { inspectionId: data.inspectionId })
                    }
                >
                    <Text style={styles.continueText}>Continue to Verification</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </ScrollView>
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
    summarySub: { fontSize: 13, color: '#374151', marginTop: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        paddingHorizontal: 14,
        marginBottom: 20,
    },
    photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryLight,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 10,
    },
    reviewBtnText: { marginLeft: 6, fontSize: 13, fontWeight: '600', color: colors.primary },
    photoRow: { flexDirection: 'row', marginBottom: 20 },
    photoBox: {
        flex: 1,
        height: 150,
        borderRadius: 14,
        backgroundColor: '#DCE8DF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        overflow: 'hidden',
    },
    photo: { width: '100%', height: '100%' },
    expandBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quoteBox: {
        backgroundColor: colors.primaryLight,
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    quoteText: { flex: 1, marginLeft: 10, fontSize: 14, color: colors.text },
    continueBtn: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    continueText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});