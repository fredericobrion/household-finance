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
  date: string; // dia do gasto, 'YYYY-MM-DD'
  groupId: string | null;
  installmentIndex: number;
  installmentCount: number;
  createdAt: string; // ISO
}

export interface Income {
  id: string;
  month: MonthKey;
  description: string;
  amount: number;
  createdAt: string; // ISO
}

/** Custo profissional do mês, abatido da renda disponível para o orçamento. */
export interface WorkExpense {
  id: string;
  month: MonthKey;
  description: string;
  amount: number;
  createdAt: string; // ISO
}

/** Percentual (0–100) por categoria. A soma deve ser 100. */
export type Goals = Record<CategoryKey, number>;

export type NewExpense = Omit<
  Expense,
  'id' | 'createdAt' | 'groupId' | 'installmentIndex' | 'installmentCount'
>;
export type NewIncome = Omit<Income, 'id' | 'createdAt'>;
export type NewWorkExpense = Omit<WorkExpense, 'id' | 'createdAt'>;

/** Sugestão de autocomplete: descrição já usada + a categoria correspondente. */
export interface ExpenseSuggestion {
  description: string;
  category: CategoryKey;
}

export interface RecurringExpense {
  id: string;
  description: string;
  category: CategoryKey;
  baseAmount: number | null;
  createdAt: string;
}

export type NewRecurring = Omit<RecurringExpense, 'id' | 'createdAt'>;
