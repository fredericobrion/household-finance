import { CATEGORIES } from '@/theme/categories';
import type { CategoryKey, Expense, Goals, Income, WorkExpense } from '@/types/budget';

export interface SummaryRow {
  key: CategoryKey;
  label: string;
  color: string;
  goalPct: number;
  spent: number;
  shouldSpend: number; // renda disponível * meta%
  usedPct: number; // spent / shouldSpend
  totalPct: number; // spent / renda disponível
}

export interface BudgetSummary {
  rows: SummaryRow[];
  totalIncome: number;
  totalWorkExpenses: number;
  availableIncome: number;
  totalSpent: number;
  usedPct: number; // totalSpent / availableIncome
}

export function sumAmounts(list: { amount: number }[]): number {
  return list.reduce((acc, x) => acc + x.amount, 0);
}

export function computeSummary(
  goals: Goals,
  incomes: Income[],
  expenses: Expense[],
  workExpenses: WorkExpense[] = [],
): BudgetSummary {
  const totalIncome = sumAmounts(incomes);
  const totalWorkExpenses = sumAmounts(workExpenses);
  const availableIncome = totalIncome - totalWorkExpenses;
  const totalSpent = sumAmounts(expenses);

  const rows: SummaryRow[] = CATEGORIES.map(({ key, label, color }) => {
    const spent = sumAmounts(expenses.filter((e) => e.category === key));
    const goalPct = goals[key] ?? 0;
    const shouldSpend = (Math.max(0, availableIncome) * goalPct) / 100;
    const usedPct = shouldSpend > 0 ? (spent / shouldSpend) * 100 : 0;
    const totalPct = availableIncome > 0 ? (spent / availableIncome) * 100 : 0;
    return { key, label, color, goalPct, spent, shouldSpend, usedPct, totalPct };
  });

  const usedPct = availableIncome > 0 ? (totalSpent / availableIncome) * 100 : 0;
  return { rows, totalIncome, totalWorkExpenses, availableIncome, totalSpent, usedPct };
}

export function goalsSum(goals: Goals): number {
  return CATEGORIES.reduce((acc, c) => acc + (goals[c.key] ?? 0), 0);
}
