import { supabase } from '@/lib/supabase';
import { CATEGORY_KEYS, EMPTY_GOALS } from '@/theme/categories';
import type {
  CategoryKey,
  Expense,
  Goals,
  Income,
  MonthKey,
  NewExpense,
  NewIncome,
} from '@/types/budget';
import type { BudgetRepository } from './repository';

// 'YYYY-MM' <-> 'YYYY-MM-01' (reference_month é o 1º dia do mês)
function monthToDate(month: MonthKey): string {
  return `${month}-01`;
}
function dateToMonth(date: string): MonthKey {
  return date.slice(0, 7);
}

interface ExpenseRow {
  id: string;
  reference_month: string;
  category: CategoryKey;
  description: string | null;
  amount: number | string;
  created_at: string;
}

interface IncomeRow {
  id: string;
  reference_month: string;
  description: string | null;
  amount: number | string;
  created_at: string;
}

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    month: dateToMonth(row.reference_month),
    category: row.category,
    description: row.description ?? '',
    amount: Number(row.amount),
    createdAt: row.created_at,
  };
}

function toIncome(row: IncomeRow): Income {
  return {
    id: row.id,
    month: dateToMonth(row.reference_month),
    description: row.description ?? '',
    amount: Number(row.amount),
    createdAt: row.created_at,
  };
}

/**
 * Implementação com Supabase. household_id é preenchido automaticamente
 * pelo default `auth_household_id()` no banco, então não passamos aqui.
 */
export class SupabaseRepository implements BudgetRepository {
  async getGoals(): Promise<Goals> {
    const { data, error } = await supabase.from('goals').select('category, percentage');
    if (error) throw error;
    const goals: Goals = { ...EMPTY_GOALS };
    for (const row of data ?? []) {
      goals[row.category as CategoryKey] = Number(row.percentage);
    }
    return goals;
  }

  async saveGoals(goals: Goals): Promise<void> {
    // As 6 linhas já existem (semeadas no cadastro); atualizamos cada uma.
    for (const key of CATEGORY_KEYS) {
      const { error } = await supabase
        .from('goals')
        .update({ percentage: goals[key] })
        .eq('category', key);
      if (error) throw error;
    }
  }

  async listExpenses(month: MonthKey): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('id, reference_month, category, description, amount, created_at')
      .eq('reference_month', monthToDate(month))
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toExpense);
  }

  async addExpense(input: NewExpense): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        reference_month: monthToDate(input.month),
        category: input.category,
        description: input.description,
        amount: input.amount,
      })
      .select('id, reference_month, category, description, amount, created_at')
      .single();
    if (error) throw error;
    return toExpense(data);
  }

  async updateExpense(id: string, patch: Partial<NewExpense>): Promise<Expense> {
    const update: Record<string, unknown> = {};
    if (patch.month !== undefined) update.reference_month = monthToDate(patch.month);
    if (patch.category !== undefined) update.category = patch.category;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.amount !== undefined) update.amount = patch.amount;

    const { data, error } = await supabase
      .from('expenses')
      .update(update)
      .eq('id', id)
      .select('id, reference_month, category, description, amount, created_at')
      .single();
    if (error) throw error;
    return toExpense(data);
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  }

  async listIncomes(month: MonthKey): Promise<Income[]> {
    const { data, error } = await supabase
      .from('incomes')
      .select('id, reference_month, description, amount, created_at')
      .eq('reference_month', monthToDate(month))
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toIncome);
  }

  async addIncome(input: NewIncome): Promise<Income> {
    const { data, error } = await supabase
      .from('incomes')
      .insert({
        reference_month: monthToDate(input.month),
        description: input.description,
        amount: input.amount,
      })
      .select('id, reference_month, description, amount, created_at')
      .single();
    if (error) throw error;
    return toIncome(data);
  }

  async deleteIncome(id: string): Promise<void> {
    const { error } = await supabase.from('incomes').delete().eq('id', id);
    if (error) throw error;
  }
}
