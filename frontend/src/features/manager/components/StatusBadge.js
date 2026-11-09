import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function StatusBadge({ status }) {
    const isIssues = status === 'issues';
    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: isIssues ? colors.rejectBg : colors.pendingBg },
            ]}
        >
            <Text
                style={[
                    styles.text,
                    { color: isIssues ? colors.rejectText : colors.pendingText },
                ]}
            >
                {isIssues ? 'Issues' : 'Pending'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    text: { fontSize: 12, fontWeight: '700' },
});