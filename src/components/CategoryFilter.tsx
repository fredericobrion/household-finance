import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CATEGORIES } from '@/theme/categories';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { CategoryKey } from '@/types/budget';

interface CategoryFilterProps {
  selected: CategoryKey | 'all';
  onSelect: (value: CategoryKey | 'all') => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      <Chip label="Todas" active={selected === 'all'} onPress={() => onSelect('all')} />
      {CATEGORIES.map((c) => (
        <Chip
          key={c.key}
          label={c.label}
          color={c.color}
          active={selected === c.key}
          onPress={() => onSelect(c.key)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.7}>
      {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    borderColor: Colors.text,
    backgroundColor: Colors.surface,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  chipTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
