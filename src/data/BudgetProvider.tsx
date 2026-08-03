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
  CategoryKey,
  Expense,
  ExpenseSuggestion,
  Goals,
  Income,
  MonthKey,
  NewExpense,
  NewIncome,
  NewRecurring,
  NewWorkExpense,
  RecurringExpense,
  WorkExpense,
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
  workExpenses: WorkExpense[];
  expenses: Expense[];
  expenseSuggestions: ExpenseSuggestion[];
  recurring: RecurringExpense[];
  saveGoals: (g: Goals) => Promise<void>;
  addExpense: (input: NewExpense, installments?: number) => Promise<void>;
  updateExpense: (id: string, patch: Partial<NewExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addIncome: (input: NewIncome) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addWorkExpense: (input: NewWorkExpense) => Promise<void>;
  deleteWorkExpense: (id: string) => Promise<void>;
  addRecurring: (input: NewRecurring) => Promise<void>;
  updateRecurring: (id: string, patch: Partial<NewRecurring>) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [goals, setGoals] = useState<Goals>({ ...DEFAULT_GOALS });
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [workExpenses, setWorkExpenses] = useState<WorkExpense[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseSuggestions, setExpenseSuggestions] = useState<ExpenseSuggestion[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const mergeSuggestion = useCallback((desc: string, category: CategoryKey) => {
    const d = desc.trim();
    if (!d) return;
    setExpenseSuggestions((prev) => {
      const rest = prev.filter((s) => s.description.toLowerCase() !== d.toLowerCase());
      return [{ description: d, category }, ...rest];
    });
  }, []);

  const refreshMonth = useCallback(async (m: MonthKey) => {
    const [inc, exp, work] = await Promise.all([
      repository.listIncomes(m),
      repository.listExpenses(m),
      repository.listWorkExpenses(m),
    ]);
    setIncomes(inc);
    setExpenses(exp);
    setWorkExpenses(work);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [g, sugg, rec] = await Promise.all([
          repository.getGoals(),
          repository.listExpenseSuggestions(),
          repository.listRecurring(),
        ]);
        if (!active) return;
        setGoals(g);
        setExpenseSuggestions(sugg);
        setRecurring(rec);
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
    async (input: NewExpense, installments = 1) => {
      try {
        await repository.addExpense(input, installments);
        mergeSuggestion(input.description, input.category);
        await refreshMonth(month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [month, refreshMonth, mergeSuggestion],
  );

  const updateExpense = useCallback(
    async (id: string, patch: Partial<NewExpense>) => {
      try {
        const updated = await repository.updateExpense(id, patch);
        mergeSuggestion(updated.description, updated.category);
        await refreshMonth(month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [month, refreshMonth, mergeSuggestion],
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

  const addWorkExpense = useCallback(
    async (input: NewWorkExpense) => {
      try {
        await repository.addWorkExpense(input);
        await refreshMonth(month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [month, refreshMonth],
  );

  const deleteWorkExpense = useCallback(
    async (id: string) => {
      try {
        await repository.deleteWorkExpense(id);
        await refreshMonth(month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [month, refreshMonth],
  );

  const addRecurring = useCallback(async (input: NewRecurring) => {
    try {
      await repository.addRecurring(input);
      setRecurring(await repository.listRecurring());
    } catch (e) {
      alertError(e);
      throw e;
    }
  }, []);

  const updateRecurring = useCallback(
    async (id: string, patch: Partial<NewRecurring>) => {
      try {
        await repository.updateRecurring(id, patch);
        setRecurring(await repository.listRecurring());
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [],
  );

  const deleteRecurring = useCallback(async (id: string) => {
    try {
      await repository.deleteRecurring(id);
      setRecurring(await repository.listRecurring());
    } catch (e) {
      alertError(e);
      throw e;
    }
  }, []);

  const value = useMemo<BudgetContextValue>(
    () => ({
      month,
      setMonth,
      loading,
      goals,
      incomes,
      workExpenses,
      expenses,
      expenseSuggestions,
      recurring,
      saveGoals,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      deleteIncome,
      addWorkExpense,
      deleteWorkExpense,
      addRecurring,
      updateRecurring,
      deleteRecurring,
    }),
    [
      month,
      loading,
      goals,
      incomes,
      workExpenses,
      expenses,
      expenseSuggestions,
      recurring,
      saveGoals,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      deleteIncome,
      addWorkExpense,
      deleteWorkExpense,
      addRecurring,
      updateRecurring,
      deleteRecurring,
    ],
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget deve ser usado dentro de <BudgetProvider>');
  return ctx;
}
