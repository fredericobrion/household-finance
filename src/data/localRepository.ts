import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_GOALS } from '@/theme/categories';
import type {
  Expense,
  Goals,
  Income,
  MonthKey,
  NewExpense,
  NewIncome,
} from '@/types/budget';
import type { BudgetRepository } from './repository';

const K_GOALS = 'budget:goals';
const K_EXPENSES = 'budget:expenses';
const K_INCOMES = 'budget:incomes';

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
    return readJson<Goals>(K_GOALS, { ...EMPTY_GOALS });
  }

  async saveGoals(goals: Goals): Promise<void> {
    await writeJson(K_GOALS, goals);
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
}
