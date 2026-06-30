export type CategoryKey =
  | 'custos_fixos'
  | 'conforto'
  | 'metas'
  | 'prazeres'
  | 'liberdade_financeira'
  | 'conhecimento';

/** Mês de referência no formato 'YYYY-MM' (ex.: '2026-06'). */
export type MonthKey = string;

export interface Expense {
  id: string;
  month: MonthKey;
  category: CategoryKey;
  description: string;
  amount: number;
  createdAt: string; // ISO
}

export interface Income {
  id: string;
  month: MonthKey;
  description: string;
  amount: number;
  createdAt: string; // ISO
}

/** Percentual (0–100) por categoria. A soma deve ser 100. */
export type Goals = Record<CategoryKey, number>;

export type NewExpense = Omit<Expense, 'id' | 'createdAt'>;
export type NewIncome = Omit<Income, 'id' | 'createdAt'>;
