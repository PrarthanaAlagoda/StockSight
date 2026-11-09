import { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import InspectionCard from '../components/InspectionCard';
import { colors } from '../theme';
import { pendingInspections } from '../data/mockData';

export default function PendingQueueScreen({ navigation }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'issues'

    const pendingCount = pendingInspections.filter((i) => i.status === 'pending').length;
    const issuesCount = pendingInspections.filter((i) => i.status === 'issues').length;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return pendingInspections.filter((i) => {
            const matchesFilter = filter === 'all' || i.status === filter;
            const matchesSearch =
                q === '' ||
                i.inspectionId.toLowerCase().includes(q) ||
                i.productName.toLowerCase().includes(q) ||
                i.staffName.toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
        });
    }, [search, filter]);

    const chips = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: `Pending (${pendingCount})` },
        { key: 'issues', label: `Issues (${issuesCount})` },
    ];

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack?.()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending Inspection Queue</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={18} color={colors.muted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by inspection ID, product or staff..."
                        placeholderTextColor={colors.muted}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="funnel-outline" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Filter chips */}
            <View style={styles.chipRow}>
                {chips.map((c) => {
                    const active = filter === c.key;
                    return (
                        <TouchableOpacity
                            key={c.key}
                            onPress={() => setFilter(c.key)}
                            style={[styles.chip, active && styles.chipActive]}
                        >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.inspectionId}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <InspectionCard
                        item={item}
                        onPress={() =>
                            navigation?.navigate?.('InspectionReview', { inspectionId: item.inspectionId })
                        }
                    />
                )}
                ListEmptyComponent={<Text style={styles.empty}>No inspections found.</Text>}
            />
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
    searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 46,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: colors.text },
    filterBtn: {
        width: 46,
        height: 46,
        borderRadius: 12,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    chipRow: { flexDirection: 'row', paddingHorizontal: 18, marginVertical: 14 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.card,
        marginRight: 10,
    },
    chipActive: { backgroundColor: colors.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
    chipTextActive: { color: '#fff' },
    list: { paddingHorizontal: 18, paddingBottom: 30 },
    empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});