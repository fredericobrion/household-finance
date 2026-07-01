import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';

function alertError(e: unknown) {
  const message = e instanceof Error ? e.message : 'Falha ao acessar os dados.';
  Alert.alert('Erro', message);
}

import { currentMonthKey } from '@/lib/month';
import { DEFAULT_GOALS } from '@/theme/categories';
import type {
  Expense,
  Goals,
  Income,
  MonthKey,
  NewExpense,
  NewIncome,
} from '@/types/budget';
import type { BudgetRepository } from './repository';
import { SupabaseRepository } from './supabaseRepository';

// 🔁 Ponto único de troca da fonte de dados.
//    Local (offline):  const repository = new LocalRepository();
//    Supabase (nuvem): const repository = new SupabaseRepository();
const repository: BudgetRepository = new SupabaseRepository();

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
  const [goals, setGoals] = useState<Goals>({ ...DEFAULT_GOALS });
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
      try {
        const g = await repository.getGoals();
        if (!active) return;
        setGoals(g);
        await refreshMonth(month);
      } catch (e) {
        if (active) alertError(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [month, refreshMonth]);

  const saveGoals = useCallback(async (g: Goals) => {
    try {
      await repository.saveGoals(g);
      setGoals(g);
    } catch (e) {
      alertError(e);
      throw e;
    }
  }, []);

  const addExpense = useCallback(
    async (input: NewExpense) => {
      try {
        await repository.addExpense(input);
        await refreshMonth(month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [month, refreshMonth],
  );

  const updateExpense = useCallback(
    async (id: string, patch: Partial<NewExpense>) => {
      try {
        await repository.updateExpense(id, patch);
        await refreshMonth(month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [month, refreshMonth],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        await repository.deleteExpense(id);
        await refreshMonth(month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [month, refreshMonth],
  );

  const addIncome = useCallback(
    async (input: NewIncome) => {
      try {
        await repository.addIncome(input);
        await refreshMonth(month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [month, refreshMonth],
  );

  const deleteIncome = useCallback(
    async (id: string) => {
      try {
        await repository.deleteIncome(id);
        await refreshMonth(month);
      } catch (e) {
        alertError(e);
        throw e;
      }
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
