import { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, Image, TouchableOpacity,
    Modal, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../components/StatusBadge';
import DetailRow from '../components/DetailRow';
import { colors } from '../theme';
import { getInspectionDetails } from '../services/managerService';

export default function InspectionReviewScreen({ navigation, route }) {
    const inspectionId = route?.params?.inspectionId;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewerUri, setViewerUri] = useState(null);

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
            <Text style={styles.headerTitle}>Inspection Review & Evidence</Text>
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

    return (
        <SafeAreaView style={styles.safe}>
            {Header}

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.summary}>
                    <View style={styles.summaryIcon}>
                        <Ionicons name="clipboard-outline" size={26} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.summaryId}>{data.displayId}</Text>
                        <Text style={styles.summarySub}>Submitted: {data.submittedLabel}</Text>
                    </View>
                    <StatusBadge status={data.hasIssues ? 'issues' : 'pending'} />
                </View>

                <Text style={styles.sectionTitle}>Inspection Details</Text>
                <View style={styles.card}>
                    <DetailRow icon="person-outline" label="Staff Inspector" value={data.staffName} />
                    <DetailRow icon="cube-outline" label="Product" value={data.productName} />
                    <DetailRow icon="layers-outline" label="Expected Quantity" value={data.expectedQuantity} />
                    <DetailRow icon="images-outline" label="Photos Submitted" value={data.photos.length} />
                    <DetailRow icon="location-outline" label="Location" value={data.location} isLast />
                </View>

                <View style={styles.photoHeader}>
                    <Text style={styles.sectionTitle}>Photo Evidence ({data.photos.length})</Text>
                    {data.photos.length > 0 && (
                        <TouchableOpacity
                            style={styles.reviewBtn}
                            onPress={() => setViewerUri(data.photos[0].url)}
                        >
                            <Ionicons name="eye-outline" size={16} color={colors.primary} />
                            <Text style={styles.reviewBtnText}>Review Photos</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {data.photos.length === 0 ? (
                    <Text style={styles.empty}>No photos were uploaded for this inspection.</Text>
                ) : (
                    <View style={styles.photoRow}>
                        {data.photos.map((photo) => (
                            <TouchableOpacity
                                key={photo.id}
                                style={styles.photoBox}
                                activeOpacity={0.85}
                                onPress={() => setViewerUri(photo.url)}
                            >
                                <Image source={{ uri: photo.url }} style={styles.photo} />
                                <View style={styles.expandBtn}>
                                    <Ionicons name="expand-outline" size={16} color={colors.text} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.sectionTitle}>Staff Observation</Text>
                <View style={styles.quoteBox}>
                    <Ionicons name="chatbox-ellipses" size={20} color={colors.primary} />
                    <Text style={styles.quoteText}>
                        {data.observation || 'No observation was added by staff.'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.continueBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation?.navigate?.('VerifyFinalise', { inspectionId: data.inspectionId })}
                >
                    <Text style={styles.continueText}>Continue to Verification</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </ScrollView>

            {/* Full-screen photo viewer */}
            <Modal visible={!!viewerUri} transparent animationType="fade" onRequestClose={() => setViewerUri(null)}>
                <View style={styles.viewer}>
                    <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerUri(null)}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    {viewerUri && <Image source={{ uri: viewerUri }} style={styles.viewerImg} resizeMode="contain" />}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    errorBox: { margin: 18, padding: 16, backgroundColor: colors.rejectBg, borderRadius: 14 },
    errorText: { color: colors.rejectText, fontSize: 14 },
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
    card: { backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 14, marginBottom: 20 },
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
    empty: { color: colors.muted, marginBottom: 20 },
    photoRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    photoBox: {
        width: '48%',
        height: 150,
        borderRadius: 14,
        backgroundColor: '#DCE8DF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '2%',
        marginBottom: 10,
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
    viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center' },
    viewerClose: { position: 'absolute', top: 50, right: 20, zIndex: 2, padding: 6 },
    viewerImg: { width: '100%', height: '80%' },
});