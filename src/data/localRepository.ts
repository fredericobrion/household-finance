import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_GOALS } from '@/theme/categories';
import type {
  Expense,
  Goals,
  Income,
  MonthKey,
  NewExpense,
  NewIncome,
  NewRecurring,
  RecurringExpense,
} from '@/types/budget';
import type { BudgetRepository } from './repository';

const K_GOALS = 'budget:goals';
const K_EXPENSES = 'budget:expenses';
const K_INCOMES = 'budget:incomes';
const K_RECURRING = 'budget:recurring';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function byNewestFirst<T extends { createdAt: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Implementação local (no aparelho) — sobrevive ao recarregar o app. */
export class LocalRepository implements BudgetRepository {
  async getGoals(): Promise<Goals> {
    return readJson<Goals>(K_GOALS, { ...DEFAULT_GOALS });
  }

  async saveGoals(goals: Goals): Promise<void> {
    await writeJson(K_GOALS, goals);
  }

  async listExpenseNames(): Promise<string[]> {
    const all = byNewestFirst(await readJson<Expense[]>(K_EXPENSES, []));
    const seen = new Set<string>();
    const out: string[] = [];
    for (const e of all) {
      const d = e.description.trim();
      const key = d.toLowerCase();
      if (d && !seen.has(key)) {
        seen.add(key);
        out.push(d);
      }
    }
    return out;
  }

  async listExpenses(month: MonthKey): Promise<Expense[]> {
    const all = await readJson<Expense[]>(K_EXPENSES, []);
    return byNewestFirst(all.filter((e) => e.month === month));
  }

  async addExpense(input: NewExpense): Promise<Expense> {
    const all = await readJson<Expense[]>(K_EXPENSES, []);
    const expense: Expense = { ...input, id: uid(), createdAt: new Date().toISOString() };
    all.push(expense);
    await writeJson(K_EXPENSES, all);
    return expense;
  }

  async updateExpense(id: string, patch: Partial<NewExpense>): Promise<Expense> {
    const all = await readJson<Expense[]>(K_EXPENSES, []);
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Gasto não encontrado');
    all[idx] = { ...all[idx], ...patch };
    await writeJson(K_EXPENSES, all);
    return all[idx];
  }

  async deleteExpense(id: string): Promise<void> {
    const all = await readJson<Expense[]>(K_EXPENSES, []);
    await writeJson(
      K_EXPENSES,
      all.filter((e) => e.id !== id),
    );
  }

  async listIncomes(month: MonthKey): Promise<Income[]> {
    const all = await readJson<Income[]>(K_INCOMES, []);
    return byNewestFirst(all.filter((i) => i.month === month));
  }

  async addIncome(input: NewIncome): Promise<Income> {
    const all = await readJson<Income[]>(K_INCOMES, []);
    const income: Income = { ...input, id: uid(), createdAt: new Date().toISOString() };
    all.push(income);
    await writeJson(K_INCOMES, all);
    return income;
  }

  async deleteIncome(id: string): Promise<void> {
    const all = await readJson<Income[]>(K_INCOMES, []);
    await writeJson(
      K_INCOMES,
      all.filter((i) => i.id !== id),
    );
  }

  async listRecurring(): Promise<RecurringExpense[]> {
    const all = await readJson<RecurringExpense[]>(K_RECURRING, []);
    return [...all].sort((a, b) => a.description.localeCompare(b.description));
  }

  async addRecurring(input: NewRecurring): Promise<RecurringExpense> {
    const all = await readJson<RecurringExpense[]>(K_RECURRING, []);
    const item: RecurringExpense = {
      ...input,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    all.push(item);
    await writeJson(K_RECURRING, all);
    return item;
  }

  async updateRecurring(
    id: string,
    patch: Partial<NewRecurring>,
  ): Promise<RecurringExpense> {
    const all = await readJson<RecurringExpense[]>(K_RECURRING, []);
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Recorrente não encontrado');
    all[idx] = { ...all[idx], ...patch };
    await writeJson(K_RECURRING, all);
    return all[idx];
  }

  async deleteRecurring(id: string): Promise<void> {
    const all = await readJson<RecurringExpense[]>(K_RECURRING, []);
    await writeJson(
      K_RECURRING,
      all.filter((r) => r.id !== id),
    );
  }
}
