import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { CategoryFilter } from '@/components/CategoryFilter';
import { DonutChart } from '@/components/DonutChart';
import { ExpenseFormModal, type ExpenseFormValues } from '@/components/ExpenseFormModal';
import { IncomeFormModal, type IncomeFormValues } from '@/components/IncomeFormModal';
import { MonthSelector } from '@/components/MonthSelector';
import { SummaryTable } from '@/components/SummaryTable';
import { useBudget } from '@/data/BudgetProvider';
import { computeSummary } from '@/lib/budget';
import { formatCurrency } from '@/lib/format';
import { CATEGORIES, categoryMeta } from '@/theme/categories';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { CategoryKey, Expense } from '@/types/budget';

export default function BudgetScreen() {
  const {
    month,
    setMonth,
    loading,
    goals,
    incomes,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
  } = useBudget();

  const [filter, setFilter] = useState<CategoryKey | 'all'>('all');
  const [expenseModal, setExpenseModal] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [incomeModal, setIncomeModal] = useState(false);

  const summary = useMemo(
    () => computeSummary(goals, incomes, expenses),
    [goals, incomes, expenses],
  );

  const donutData = useMemo(
    () => summary.rows.map((r) => ({ key: r.key, color: r.color, value: r.spent })),
    [summary],
  );

  const filteredExpenses = useMemo(
    () => (filter === 'all' ? expenses : expenses.filter((e) => e.category === filter)),
    [expenses, filter],
  );

  function openNewExpense() {
    setEditing(null);
    setExpenseModal(true);
  }

  function openEditExpense(expense: Expense) {
    setEditing(expense);
    setExpenseModal(true);
  }

  async function submitExpense(values: ExpenseFormValues) {
    try {
      if (editing) {
        await updateExpense(editing.id, values);
      } else {
        await addExpense({ ...values, month });
      }
      setExpenseModal(false);
      setEditing(null);
    } catch {
      // erro já exibido pelo provider; mantém o modal aberto
    }
  }

  async function submitIncome(values: IncomeFormValues) {
    try {
      await addIncome({ ...values, month });
      setIncomeModal(false);
    } catch {
      // erro já exibido pelo provider; mantém o modal aberto
    }
  }

  function confirmDeleteExpense(expense: Expense) {
    Alert.alert('Excluir gasto', `Remover "${expense.description || 'gasto'}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteExpense(expense.id).catch(() => {});
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MonthSelector month={month} onChange={setMonth} />

        {loading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: Spacing.xl }} />
        ) : (
          <>
            {/* Renda */}
            <Card title="Renda do mês">
              <Text style={styles.incomeTotal}>{formatCurrency(summary.totalIncome)}</Text>
              {incomes.map((inc) => (
                <View key={inc.id} style={styles.lineItem}>
                  <Text style={styles.lineDesc} numberOfLines={1}>
                    {inc.description || 'Renda'}
                  </Text>
                  <Text style={styles.lineAmount}>{formatCurrency(inc.amount)}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      deleteIncome(inc.id).catch(() => {});
                    }}
                    hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addInline} onPress={() => setIncomeModal(true)}>
                <Ionicons name="add" size={18} color={Colors.accent} />
                <Text style={styles.addInlineText}>Lançar renda</Text>
              </TouchableOpacity>
            </Card>

            {/* Gráfico */}
            <Card title="Gastos">
              <View style={styles.chartWrap}>
                <DonutChart
                  data={donutData}
                  centerValue={formatCurrency(summary.totalSpent)}
                />
              </View>
              <View style={styles.legend}>
                {CATEGORIES.map((c) => (
                  <View key={c.key} style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: c.color }]} />
                    <Text style={styles.legendText}>{c.label}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Resumo */}
            <Card title="Resumo">
              <SummaryTable summary={summary} />
            </Card>

            {/* Lista de gastos */}
            <Card title="Gastos lançados">
              <CategoryFilter selected={filter} onSelect={setFilter} />
              {filteredExpenses.length === 0 ? (
                <Text style={styles.empty}>Nenhum gasto neste filtro.</Text>
              ) : (
                filteredExpenses.map((exp) => {
                  const meta = categoryMeta(exp.category);
                  return (
                    <TouchableOpacity
                      key={exp.id}
                      style={styles.expenseRow}
                      activeOpacity={0.7}
                      onPress={() => openEditExpense(exp)}>
                      <View style={[styles.dot, { backgroundColor: meta.color }]} />
                      <View style={styles.expenseInfo}>
                        <Text style={styles.expenseDesc} numberOfLines={1}>
                          {exp.description || meta.label}
                        </Text>
                        <Text style={styles.expenseCat}>{meta.label}</Text>
                      </View>
                      <Text style={styles.expenseAmount}>{formatCurrency(exp.amount)}</Text>
                      <TouchableOpacity onPress={() => confirmDeleteExpense(exp)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
              )}
              <TouchableOpacity style={styles.addButton} onPress={openNewExpense}>
                <Ionicons name="add" size={20} color="#000" />
                <Text style={styles.addButtonText}>Adicionar gasto</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}
      </ScrollView>

      <ExpenseFormModal
        visible={expenseModal}
        initial={editing}
        onClose={() => {
          setExpenseModal(false);
          setEditing(null);
        }}
        onSubmit={submitExpense}
      />
      <IncomeFormModal
        visible={incomeModal}
        onClose={() => setIncomeModal(false)}
        onSubmit={submitIncome}
      />
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
  incomeTotal: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  lineDesc: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  lineAmount: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  addInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  addInlineText: {
    color: Colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  chartWrap: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDesc: {
    color: Colors.text,
    fontSize: 15,
  },
  expenseCat: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});
