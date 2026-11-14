import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function DetailRow({ icon, label, value, isLast }) {
    return (
        <View style={[styles.row, !isLast && styles.border]}>
            <Ionicons name={icon} size={20} color={colors.text} />
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    border: { borderBottomWidth: 1, borderBottomColor: '#E5EEE7' },
    label: { flex: 1, marginLeft: 12, fontSize: 14, color: colors.text },
    value: { fontSize: 14, fontWeight: '700', color: colors.text },
});