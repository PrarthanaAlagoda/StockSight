import { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatCard from '../components/StatCard';
import { colors } from '../theme';
import { getDashboardData } from '../services/managerService';

const EMPTY = { stats: { pending: 0, completedToday: 0, issuesFound: 0, rejected: 0 }, recentActivity: [] };

export default function ManagerDashboardScreen({ navigation, onLogout }) {
    const [dash, setDash] = useState(EMPTY);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            setError('');
            setDash(await getDashboardData());
        } catch (e) {
            console.log('getDashboardData error:', e);
            setError(e?.message ?? 'Could not load dashboard data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (navigation?.addListener) return navigation.addListener('focus', load);
        load();
    }, [navigation, load]);

    const goToQueue = () => navigation?.navigate?.('PendingQueue');
    const { stats, recentActivity } = dash;

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            load();
                        }}
                    />
                }
            >
                <View style={styles.headerRow}>
                    <View style={styles.logoRow}>
                        <Ionicons name="cube-outline" size={28} color={colors.primary} />
                        <Text style={styles.logoText}>StockSight</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <View style={{ marginRight: 16 }}>
                            <Ionicons name="notifications-outline" size={26} color={colors.text} />
                            <View style={styles.redDot} />
                        </View>
                        {onLogout && (
                            <TouchableOpacity onPress={onLogout}>
                                <Ionicons name="log-out-outline" size={26} color={colors.text} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.greetRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>MA</Text>
                    </View>
                    <View>
                        <Text style={styles.hello}>Hello, Manager!</Text>
                        <Text style={styles.role}>Warehouse Manager</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.banner} onPress={goToQueue} activeOpacity={0.85}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bannerTitle}>Review warehouse inspections</Text>
                        <Text style={styles.bannerSub}>
                            Verify stock, resolve discrepancies and finalise inspections.
                        </Text>
                    </View>
                    <View style={styles.bannerArrow}>
                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                {error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
                ) : (
                    <View style={styles.statsGrid}>
                        <StatCard icon="document-text-outline" iconColor={colors.primary}
                            bg={colors.primaryLight} value={stats.pending} label={'Pending\nReviews'} />
                        <StatCard icon="checkbox-outline" iconColor={colors.successText}
                            bg={colors.card} value={stats.completedToday} label={'Completed\nToday'} />
                        <StatCard icon="warning-outline" iconColor={colors.issueText}
                            bg={colors.pendingBg} value={stats.issuesFound} label={'Issues\nFound'} />
                        <StatCard icon="close-circle-outline" iconColor={colors.rejectText}
                            bg={colors.rejectBg} value={stats.rejected} label="Rejected" />
                    </View>
                )}

                <TouchableOpacity style={styles.mainBtn} onPress={goToQueue} activeOpacity={0.85}>
                    <Ionicons name="clipboard-outline" size={22} color="#fff" />
                    <Text style={styles.mainBtnText}>Review Pending Inspections</Text>
                    <Ionicons name="arrow-forward" size={22} color="#fff" />
                </TouchableOpacity>

                <View style={styles.activityHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <Text style={styles.seeAll}>See All</Text>
                </View>

                {!loading && recentActivity.length === 0 && (
                    <Text style={styles.empty}>No completed or rejected inspections yet.</Text>
                )}

                {recentActivity.map((item) => {
                    const done = item.status === 'completed';
                    return (
                        <View key={item.id} style={styles.activityRow}>
                            <View style={[styles.activityIcon,
                            { backgroundColor: done ? colors.successBg : colors.rejectBg }]}>
                                <Ionicons name={done ? 'checkmark' : 'close'} size={18}
                                    color={done ? colors.successText : colors.rejectText} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.activityTitle}>
                                    <Text style={{ fontWeight: '700' }}>{item.displayId}</Text> {item.status}
                                </Text>
                                <Text style={styles.activityTime}>{item.timeAgo}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { padding: 18, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerIcons: { flexDirection: 'row', alignItems: 'center' },
    logoRow: { flexDirection: 'row', alignItems: 'center' },
    logoText: { fontSize: 22, fontWeight: '800', color: colors.primary, marginLeft: 8 },
    redDot: { position: 'absolute', top: 0, right: 2, width: 9, height: 9, borderRadius: 5, backgroundColor: 'red' },
    greetRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { fontWeight: '700', color: colors.primary, fontSize: 16 },
    hello: { fontSize: 20, fontWeight: '700', color: colors.text },
    role: { fontSize: 14, color: colors.muted },
    banner: { backgroundColor: colors.primary, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
    bannerSub: { color: '#D1E7D6', fontSize: 13 },
    bannerArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
    errorBox: { padding: 14, backgroundColor: colors.rejectBg, borderRadius: 14, marginBottom: 14 },
    errorText: { color: colors.rejectText, fontSize: 13 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    mainBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
    mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    seeAll: { color: colors.primary, fontWeight: '600' },
    empty: { color: colors.muted, marginTop: 6 },
    activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#DDE8DF' },
    activityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    activityTitle: { fontSize: 15, color: colors.text },
    activityTime: { fontSize: 12, color: colors.muted },

});