import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { addMonths, monthLabel } from '@/lib/month';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { MonthKey } from '@/types/budget';

interface MonthSelectorProps {
  month: MonthKey;
  onChange: (month: MonthKey) => void;
}

export function MonthSelector({ month, onChange }: MonthSelectorProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.arrow}
        onPress={() => onChange(addMonths(month, -1))}
        hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.label}>{monthLabel(month)}</Text>
      <TouchableOpacity
        style={styles.arrow}
        onPress={() => onChange(addMonths(month, 1))}
        hitSlop={8}>
        <Ionicons name="chevron-forward" size={22} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  arrow: {
    padding: Spacing.sm,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
