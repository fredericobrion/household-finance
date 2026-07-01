import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { GoalSlider } from '@/components/GoalSlider';
import { useBudget } from '@/data/BudgetProvider';
import { CATEGORIES, DEFAULT_GOALS } from '@/theme/categories';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { CategoryKey, Goals } from '@/types/budget';

export default function GoalsScreen() {
  const { goals, saveGoals } = useBudget();
  const [draft, setDraft] = useState<Goals>(() => ({ ...goals }));

  useEffect(() => {
    setDraft({ ...goals });
  }, [goals]);

  const total = useMemo(
    () => CATEGORIES.reduce((acc, c) => acc + (draft[c.key] ?? 0), 0),
    [draft],
  );
  const valid = total === 100;

  function setOne(key: CategoryKey, value: number) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleReset() {
    setDraft({ ...DEFAULT_GOALS });
  }

  async function handleSave() {
    if (!valid) return;
    try {
      await saveGoals(draft);
      Alert.alert('Pronto', 'Metas salvas com sucesso.');
    } catch {
      // erro já exibido pelo provider
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Metas de orçamento</Text>
        <Text style={styles.subheading}>
          Arraste para definir o percentual da renda de cada categoria. A soma deve ser 100%.
        </Text>

        <Card>
          {CATEGORIES.map((c) => (
            <GoalSlider
              key={c.key}
              label={c.label}
              color={c.color}
              value={draft[c.key] ?? 0}
              onChange={(v) => setOne(c.key, v)}
            />
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text
              style={[styles.totalValue, { color: valid ? Colors.positive : Colors.negative }]}>
              {total}%
            </Text>
          </View>
        </Card>

        {!valid ? (
          <Text style={styles.warning}>
            A soma precisa ser exatamente 100% para salvar (atual: {total}%).
          </Text>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.reset]} onPress={handleReset}>
            <Text style={styles.resetText}>Resetar valores</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.save, !valid && styles.disabled]}
            onPress={handleSave}
            disabled={!valid}>
            <Text style={styles.saveText}>Salvar metas</Text>
          </TouchableOpacity>
        </View>
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
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  reset: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  save: {
    backgroundColor: Colors.accent,
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
