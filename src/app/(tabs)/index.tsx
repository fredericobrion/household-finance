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
import { RecurringPickerModal } from '@/components/RecurringPickerModal';
import { SummaryTable } from '@/components/SummaryTable';
import { useBudget } from '@/data/BudgetProvider';
import { computeSummary } from '@/lib/budget';
import { formatCurrency, ymdToBR } from '@/lib/format';
import { CATEGORIES, categoryMeta } from '@/theme/categories';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { CategoryKey, Expense, RecurringExpense } from '@/types/budget';

export default function BudgetScreen() {
  const {
    month,
    setMonth,
    loading,
    goals,
    incomes,
    expenses,
    expenseSuggestions,
    recurring,
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
  const [pickerVisible, setPickerVisible] = useState(false);
  const [includeItem, setIncludeItem] = useState<RecurringExpense | null>(null);

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

  // agrupa gastos de mesmo nome no mês (descrição vazia nunca agrupa)
  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    const order: string[] = [];
    for (const e of filteredExpenses) {
      const name = e.description.trim();
      const key = name ? `n:${name.toLowerCase()}` : `id:${e.id}`;
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(e);
    }
    return order.map((key) => {
      const entries = map.get(key)!;
      return {
        key,
        name: entries[0].description || categoryMeta(entries[0].category).label,
        entries,
        total: entries.reduce((acc, e) => acc + e.amount, 0),
        grouped: entries.length > 1,
      };
    });
  }, [filteredExpenses]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  function toggleGroup(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function openNewExpense() {
    setEditing(null);
    setExpenseModal(true);
  }

  function openEditExpense(expense: Expense) {
    setEditing(expense);
    setExpenseModal(true);
  }

  async function submitExpense(values: ExpenseFormValues) {
    const payload = { ...values, month: values.date.slice(0, 7) };
    try {
      if (editing) {
        await updateExpense(editing.id, payload);
      } else {
        await addExpense(payload);
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

  async function submitInclude(values: ExpenseFormValues) {
    try {
      await addExpense({ ...values, month: values.date.slice(0, 7) });
      setIncludeItem(null);
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

  function renderExpenseRow(exp: Expense, showName: boolean, indent = false) {
    const meta = categoryMeta(exp.category);
    return (
      <TouchableOpacity
        key={exp.id}
        style={[styles.expenseRow, indent && styles.indentRow]}
        activeOpacity={0.7}
        onPress={() => openEditExpense(exp)}>
        <View style={[styles.dot, { backgroundColor: meta.color }]} />
        <View style={styles.expenseInfo}>
          {showName ? (
            <Text style={styles.expenseDesc} numberOfLines={1}>
              {exp.description || meta.label}
            </Text>
          ) : null}
          <Text style={styles.expenseCat}>
            {meta.label} · {ymdToBR(exp.date)}
          </Text>
        </View>
        <Text style={styles.expenseAmount}>{formatCurrency(exp.amount)}</Text>
        <TouchableOpacity onPress={() => confirmDeleteExpense(exp)} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
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
              {groups.length === 0 ? (
                <Text style={styles.empty}>Nenhum gasto neste filtro.</Text>
              ) : (
                groups.map((g) =>
                  g.grouped ? (
                    <View key={g.key}>
                      <TouchableOpacity
                        style={styles.groupRow}
                        activeOpacity={0.7}
                        onPress={() => toggleGroup(g.key)}>
                        <Ionicons
                          name={expanded[g.key] ? 'chevron-down' : 'chevron-forward'}
                          size={18}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.groupName} numberOfLines={1}>
                          {g.name}
                        </Text>
                        <View style={styles.countBadge}>
                          <Text style={styles.countText}>{g.entries.length}x</Text>
                        </View>
                        <Text style={styles.expenseAmount}>{formatCurrency(g.total)}</Text>
                      </TouchableOpacity>
                      {expanded[g.key]
                        ? g.entries.map((exp) => renderExpenseRow(exp, false, true))
                        : null}
                    </View>
                  ) : (
                    renderExpenseRow(g.entries[0], true, false)
                  ),
                )
              )}
              <TouchableOpacity style={styles.addButton} onPress={openNewExpense}>
                <Ionicons name="add" size={20} color="#000" />
                <Text style={styles.addButtonText}>Adicionar gasto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.includeButton}
                onPress={() => setPickerVisible(true)}>
                <Ionicons name="repeat-outline" size={18} color={Colors.accent} />
                <Text style={styles.includeButtonText}>Incluir recorrente</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}
      </ScrollView>

      <ExpenseFormModal
        visible={expenseModal}
        initial={editing}
        suggestions={expenseSuggestions}
        defaultMonth={month}
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
      <RecurringPickerModal
        visible={pickerVisible}
        recurring={recurring}
        onClose={() => setPickerVisible(false)}
        onPick={(item) => {
          setPickerVisible(false);
          setIncludeItem(item);
        }}
      />
      <ExpenseFormModal
        visible={includeItem !== null}
        lockedCategory={includeItem?.category}
        presetDescription={includeItem?.description}
        presetAmount={includeItem?.baseAmount ?? undefined}
        title="Incluir recorrente"
        existingNames={expenses.map((e) => e.description)}
        defaultMonth={month}
        onClose={() => setIncludeItem(null)}
        onSubmit={submitInclude}
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
  indentRow: {
    paddingLeft: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  groupName: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  countText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
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
  includeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  includeButtonText: {
    color: Colors.accent,
    fontWeight: '600',
    fontSize: 15,
  },
});
