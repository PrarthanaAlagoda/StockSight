import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { colors } from '../theme';

export default function InspectionCard({ item, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.topRow}>
                <View style={styles.thumb}>
                    <Ionicons name={`${item.icon}-outline`} size={30} color={colors.primary} />
                </View>

                <View style={styles.info}>
                    <View style={styles.titleRow}>
                        <Text style={styles.id}>{item.inspectionId}</Text>
                        <StatusBadge status={item.status} />
                    </View>
                    <View style={styles.line}>
                        <Ionicons name="person-outline" size={15} color={colors.muted} />
                        <Text style={styles.lineText}>{item.staffName}</Text>
                    </View>
                    <View style={styles.line}>
                        <Ionicons name="cube-outline" size={15} color={colors.muted} />
                        <Text style={styles.lineText}>{item.productName}</Text>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </View>

            <View style={styles.qtyStrip}>
                <Text style={styles.qtyText}>
                    Expected: <Text style={styles.qtyBold}>{item.expectedQuantity}</Text>
                </Text>
                <Text style={styles.divider}>|</Text>
                <Text style={styles.qtyText}>
                    Staff Reported: <Text style={styles.qtyBold}>{item.staffReportedQuantity}</Text>
                </Text>
            </View>

            <View style={styles.line}>
                <Ionicons name="time-outline" size={15} color={colors.muted} />
                <Text style={styles.lineText}>Submitted: {item.submittedAt}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        marginBottom: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    topRow: { flexDirection: 'row', alignItems: 'center' },
    thumb: {
        width: 58,
        height: 58,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    id: { fontSize: 17, fontWeight: '700', color: colors.text },
    line: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    lineText: { marginLeft: 6, fontSize: 13, color: '#374151' },
    qtyStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 10,
    },
    qtyText: { fontSize: 13, color: '#374151' },
    qtyBold: { fontWeight: '700', color: colors.text },
    divider: { marginHorizontal: 10, color: colors.muted },
});