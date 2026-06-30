import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { useBudget } from '@/data/BudgetProvider';
import { CATEGORIES } from '@/theme/categories';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { CategoryKey, Goals } from '@/types/budget';

type Draft = Record<CategoryKey, string>;

function goalsToDraft(goals: Goals): Draft {
  return CATEGORIES.reduce((acc, c) => {
    acc[c.key] = String(goals[c.key] ?? 0);
    return acc;
  }, {} as Draft);
}

function parseNum(text: string): number {
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export default function GoalsScreen() {
  const { goals, saveGoals } = useBudget();
  const [draft, setDraft] = useState<Draft>(() => goalsToDraft(goals));

  useEffect(() => {
    setDraft(goalsToDraft(goals));
  }, [goals]);

  const total = useMemo(
    () => CATEGORIES.reduce((acc, c) => acc + parseNum(draft[c.key]), 0),
    [draft],
  );

  const valid = Math.abs(total - 100) < 0.001;

  async function handleSave() {
    if (!valid) return;
    const next = CATEGORIES.reduce((acc, c) => {
      acc[c.key] = parseNum(draft[c.key]);
      return acc;
    }, {} as Goals);
    await saveGoals(next);
    Alert.alert('Pronto', 'Metas salvas com sucesso.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Metas de orçamento</Text>
        <Text style={styles.subheading}>
          Defina o percentual da renda para cada categoria. A soma deve ser 100%.
        </Text>

        <Card>
          {CATEGORIES.map((c) => (
            <View key={c.key} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: c.color }]} />
              <Text style={styles.label}>{c.label}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={draft[c.key]}
                onChangeText={(text) => setDraft((d) => ({ ...d, [c.key]: text }))}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.percent}>%</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text
              style={[
                styles.totalValue,
                { color: valid ? Colors.positive : Colors.negative },
              ]}>
              {total.toFixed(total % 1 === 0 ? 0 : 2)}%
            </Text>
          </View>
        </Card>

        {!valid ? (
          <Text style={styles.warning}>
            A soma precisa ser exatamente 100% para salvar (atual: {total.toFixed(2)}%).
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, !valid && styles.disabled]}
          onPress={handleSave}
          disabled={!valid}>
          <Text style={styles.saveText}>Salvar metas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  heading: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subheading: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: -Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  input: {
    width: 64,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontSize: 16,
    textAlign: 'right',
  },
  percent: {
    color: Colors.textSecondary,
    fontSize: 15,
    width: 16,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
  },
  totalLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  warning: {
    color: Colors.negative,
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.4,
  },
});
