import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatCard({ icon, iconColor, bg, value, label }) {
    return (
        <View style={[styles.card, { backgroundColor: bg }]}>
            <Ionicons name={icon} size={30} color={iconColor} />
            <View style={styles.textBox}>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%',
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    textBox: { marginLeft: 12 },
    value: { fontSize: 22, fontWeight: '700', color: '#0F1F14' },
    label: { fontSize: 13, color: '#374151' },
});