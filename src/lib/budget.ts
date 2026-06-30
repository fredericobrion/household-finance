import { CATEGORIES } from '@/theme/categories';
import type { CategoryKey, Expense, Goals, Income } from '@/types/budget';

export interface SummaryRow {
  key: CategoryKey;
  label: string;
  color: string;
  goalPct: number;
  spent: number;
  shouldSpend: number; // renda total * meta%
  usedPct: number; // spent / shouldSpend
  totalPct: number; // spent / renda total
}

export interface BudgetSummary {
  rows: SummaryRow[];
  totalIncome: number;
  totalSpent: number;
  usedPct: number; // totalSpent / totalIncome
}

export function sumAmounts(list: { amount: number }[]): number {
  return list.reduce((acc, x) => acc + x.amount, 0);
}

export function computeSummary(
  goals: Goals,
  incomes: Income[],
  expenses: Expense[],
): BudgetSummary {
  const totalIncome = sumAmounts(incomes);
  const totalSpent = sumAmounts(expenses);

  const rows: SummaryRow[] = CATEGORIES.map(({ key, label, color }) => {
    const spent = sumAmounts(expenses.filter((e) => e.category === key));
    const goalPct = goals[key] ?? 0;
    const shouldSpend = (totalIncome * goalPct) / 100;
    const usedPct = shouldSpend > 0 ? (spent / shouldSpend) * 100 : 0;
    const totalPct = totalIncome > 0 ? (spent / totalIncome) * 100 : 0;
    return { key, label, color, goalPct, spent, shouldSpend, usedPct, totalPct };
  });

  const usedPct = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
  return { rows, totalIncome, totalSpent, usedPct };
}

export function goalsSum(goals: Goals): number {
  return CATEGORIES.reduce((acc, c) => acc + (goals[c.key] ?? 0), 0);
}
