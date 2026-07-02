import { supabase } from '@/lib/supabase';
import { addMonths } from '@/lib/month';
import type { MonthKey } from '@/types/budget';
import type { FunEntry, FunType, Person } from '@/types/fun';
import type { FunRepository } from './funRepository';

function monthToDate(month: MonthKey): string {
  return `${month}-01`;
}
function dateToMonth(date: string): MonthKey {
  return date.slice(0, 7);
}
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface FunRow {
  id: string;
  person_id: string;
  reference_month: string;
  type: FunType;
  description: string | null;
  amount: number | string;
  group_id: string | null;
  installment_index: number;
  installment_count: number;
  created_at: string;
}

function toEntry(row: FunRow): FunEntry {
  return {
    id: row.id,
    personId: row.person_id,
    month: dateToMonth(row.reference_month),
    type: row.type,
    description: row.description ?? '',
    amount: Number(row.amount),
    groupId: row.group_id,
    installmentIndex: row.installment_index,
    installmentCount: row.installment_count,
    createdAt: row.created_at,
  };
}

const COLS =
  'id, person_id, reference_month, type, description, amount, group_id, installment_index, installment_count, created_at';

export class SupabaseFunRepository implements FunRepository {
  async listPeople(): Promise<Person[]> {
    const { data, error } = await supabase
      .from('persons')
      .select('id, name, created_at')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((p) => ({ id: p.id, name: p.name, createdAt: p.created_at }));
  }

  async addPerson(name: string): Promise<Person> {
    const { data, error } = await supabase
      .from('persons')
      .insert({ name })
      .select('id, name, created_at')
      .single();
    if (error) throw error;
    return { id: data.id, name: data.name, createdAt: data.created_at };
  }

  async deletePerson(id: string): Promise<void> {
    const { error } = await supabase.from('persons').delete().eq('id', id);
    if (error) throw error;
  }

  async listEntries(personId: string, month: MonthKey): Promise<FunEntry[]> {
    const { data, error } = await supabase
      .from('fun_entries')
      .select(COLS)
      .eq('person_id', personId)
      .eq('reference_month', monthToDate(month))
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toEntry);
  }

  async balanceBefore(personId: string, month: MonthKey): Promise<number> {
    const { data, error } = await supabase
      .from('fun_entries')
      .select('type, amount')
      .eq('person_id', personId)
      .lt('reference_month', monthToDate(month));
    if (error) throw error;
    return (data ?? []).reduce((acc, r) => {
      const v = Number(r.amount);
      return acc + (r.type === 'saldo' ? v : -v);
    }, 0);
  }

  async addSaldo(
    personId: string,
    month: MonthKey,
    amount: number,
    description: string,
  ): Promise<void> {
    const { error } = await supabase.from('fun_entries').insert({
      person_id: personId,
      reference_month: monthToDate(month),
      type: 'saldo',
      description,
      amount,
    });
    if (error) throw error;
  }

  async addGasto(
    personId: string,
    month: MonthKey,
    total: number,
    description: string,
    installments: number,
  ): Promise<void> {
    const n = Math.max(1, Math.floor(installments));

    if (n === 1) {
      const { error } = await supabase.from('fun_entries').insert({
        person_id: personId,
        reference_month: monthToDate(month),
        type: 'gasto',
        description,
        amount: total,
      });
      if (error) throw error;
      return;
    }

    const per = Math.round((total / n) * 100) / 100;
    const groupId = uid();
    const rows = Array.from({ length: n }, (_, i) => ({
      person_id: personId,
      reference_month: monthToDate(addMonths(month, i)),
      type: 'gasto' as const,
      description,
      amount: i === n - 1 ? Math.round((total - per * (n - 1)) * 100) / 100 : per,
      group_id: groupId,
      installment_index: i + 1,
      installment_count: n,
    }));

    const { error } = await supabase.from('fun_entries').insert(rows);
    if (error) throw error;
  }

  async deleteEntry(entry: FunEntry): Promise<void> {
    const query = supabase.from('fun_entries').delete();
    const { error } = entry.groupId
      ? await query.eq('group_id', entry.groupId)
      : await query.eq('id', entry.id);
    if (error) throw error;
  }
}
