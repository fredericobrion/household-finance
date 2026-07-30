import { supabase } from '@/lib/supabase';
import { addMonths } from '@/lib/month';
import { addMonthsToDate } from '@/lib/installments';
import { CATEGORY_KEYS, EMPTY_GOALS } from '@/theme/categories';
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
  RecurringExpense,
} from '@/types/budget';
import type { BudgetRepository } from './repository';

// 'YYYY-MM' <-> 'YYYY-MM-01' (reference_month é o 1º dia do mês)
function monthToDate(month: MonthKey): string {
  return `${month}-01`;
}
function dateToMonth(date: string): MonthKey {
  return date.slice(0, 7);
}
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ExpenseRow {
  id: string;
  reference_month: string;
  category: CategoryKey;
  description: string | null;
  amount: number | string;
  occurred_on: string;
  group_id: string | null;
  installment_index: number;
  installment_count: number;
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
    date: row.occurred_on,
    groupId: row.group_id,
    installmentIndex: row.installment_index,
    installmentCount: row.installment_count,
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

interface RecurringRow {
  id: string;
  description: string;
  category: CategoryKey;
  base_amount: number | string | null;
  created_at: string;
}

function toRecurring(row: RecurringRow): RecurringExpense {
  return {
    id: row.id,
    description: row.description,
    category: row.category,
    baseAmount: row.base_amount === null ? null : Number(row.base_amount),
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

  async listExpenseSuggestions(): Promise<ExpenseSuggestion[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('description, category')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw error;
    const seen = new Set<string>();
    const out: ExpenseSuggestion[] = [];
    for (const r of data ?? []) {
      const d = (r.description ?? '').trim();
      const key = d.toLowerCase();
      if (d && !seen.has(key)) {
        seen.add(key);
        out.push({ description: d, category: r.category as CategoryKey });
      }
    }
    return out;
  }

  async listExpenses(month: MonthKey): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('id, reference_month, category, description, amount, occurred_on, group_id, installment_index, installment_count, created_at')
      .eq('reference_month', monthToDate(month))
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toExpense);
  }

  async addExpense(input: NewExpense, installments = 1): Promise<Expense> {
    const n = Math.max(1, Math.floor(installments));
    const groupId = n > 1 ? uid() : null;
    const perInstallment = Math.round((input.amount / n) * 100) / 100;
    const rows = Array.from({ length: n }, (_, i) => ({
      reference_month: monthToDate(addMonths(input.month, i)),
      category: input.category,
      description: input.description,
      amount:
        i === n - 1
          ? Math.round((input.amount - perInstallment * (n - 1)) * 100) / 100
          : perInstallment,
      occurred_on: addMonthsToDate(input.date, i),
      group_id: groupId,
      installment_index: i + 1,
      installment_count: n,
    }));
    const { data, error } = await supabase
      .from('expenses')
      .insert(rows)
      .select('id, reference_month, category, description, amount, occurred_on, group_id, installment_index, installment_count, created_at');
    if (error) throw error;
    return toExpense(data[0]);
  }

  async updateExpense(id: string, patch: Partial<NewExpense>): Promise<Expense> {
    const update: Record<string, unknown> = {};
    if (patch.month !== undefined) update.reference_month = monthToDate(patch.month);
    if (patch.category !== undefined) update.category = patch.category;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.amount !== undefined) update.amount = patch.amount;
    if (patch.date !== undefined) update.occurred_on = patch.date;

    const { data, error } = await supabase
      .from('expenses')
      .update(update)
      .eq('id', id)
      .select('id, reference_month, category, description, amount, occurred_on, group_id, installment_index, installment_count, created_at')
      .single();
    if (error) throw error;
    return toExpense(data);
  }

  async deleteExpense(id: string): Promise<void> {
    const { data, error: findError } = await supabase
      .from('expenses')
      .select('group_id')
      .eq('id', id)
      .single();
    if (findError) throw findError;
    const query = supabase.from('expenses').delete();
    const { error } = data.group_id
      ? await query.eq('group_id', data.group_id)
      : await query.eq('id', id);
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

  async listRecurring(): Promise<RecurringExpense[]> {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('id, description, category, base_amount, created_at')
      .order('description', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toRecurring);
  }

  async addRecurring(input: NewRecurring): Promise<RecurringExpense> {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert({
        description: input.description,
        category: input.category,
        base_amount: input.baseAmount,
      })
      .select('id, description, category, base_amount, created_at')
      .single();
    if (error) throw error;
    return toRecurring(data);
  }

  async updateRecurring(
    id: string,
    patch: Partial<NewRecurring>,
  ): Promise<RecurringExpense> {
    const update: Record<string, unknown> = {};
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.category !== undefined) update.category = patch.category;
    if (patch.baseAmount !== undefined) update.base_amount = patch.baseAmount;

    const { data, error } = await supabase
      .from('recurring_expenses')
      .update(update)
      .eq('id', id)
      .select('id, description, category, base_amount, created_at')
      .single();
    if (error) throw error;
    return toRecurring(data);
  }

  async deleteRecurring(id: string): Promise<void> {
    const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
    if (error) throw error;
  }
}
