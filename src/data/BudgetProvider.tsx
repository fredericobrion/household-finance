import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { currentMonthKey } from '@/lib/month';
import { EMPTY_GOALS } from '@/theme/categories';
import type {
  Expense,
  Goals,
  Income,
  MonthKey,
  NewExpense,
  NewIncome,
} from '@/types/budget';
import { LocalRepository } from './localRepository';
import type { BudgetRepository } from './repository';

// 🔁 Ponto único de troca quando formos pro Supabase:
//    const repository = new SupabaseRepository();
const repository: BudgetRepository = new LocalRepository();

interface BudgetContextValue {
  month: MonthKey;
  setMonth: (m: MonthKey) => void;
  loading: boolean;
  goals: Goals;
  incomes: Income[];
  expenses: Expense[];
  saveGoals: (g: Goals) => Promise<void>;
  addExpense: (input: NewExpense) => Promise<void>;
  updateExpense: (id: string, patch: Partial<NewExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addIncome: (input: NewIncome) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [goals, setGoals] = useState<Goals>({ ...EMPTY_GOALS });
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMonth = useCallback(async (m: MonthKey) => {
    const [inc, exp] = await Promise.all([
      repository.listIncomes(m),
      repository.listExpenses(m),
    ]);
    setIncomes(inc);
    setExpenses(exp);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const g = await repository.getGoals();
      if (!active) return;
      setGoals(g);
      await refreshMonth(month);
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [month, refreshMonth]);

  const saveGoals = useCallback(async (g: Goals) => {
    await repository.saveGoals(g);
    setGoals(g);
  }, []);

  const addExpense = useCallback(
    async (input: NewExpense) => {
      await repository.addExpense(input);
      await refreshMonth(month);
    },
    [month, refreshMonth],
  );

  const updateExpense = useCallback(
    async (id: string, patch: Partial<NewExpense>) => {
      await repository.updateExpense(id, patch);
      await refreshMonth(month);
    },
    [month, refreshMonth],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await repository.deleteExpense(id);
      await refreshMonth(month);
    },
    [month, refreshMonth],
  );

  const addIncome = useCallback(
    async (input: NewIncome) => {
      await repository.addIncome(input);
      await refreshMonth(month);
    },
    [month, refreshMonth],
  );

  const deleteIncome = useCallback(
    async (id: string) => {
      await repository.deleteIncome(id);
      await refreshMonth(month);
    },
    [month, refreshMonth],
  );

  const value = useMemo<BudgetContextValue>(
    () => ({
      month,
      setMonth,
      loading,
      goals,
      incomes,
      expenses,
      saveGoals,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      deleteIncome,
    }),
    [
      month,
      loading,
      goals,
      incomes,
      expenses,
      saveGoals,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      deleteIncome,
    ],
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget deve ser usado dentro de <BudgetProvider>');
  return ctx;
}
