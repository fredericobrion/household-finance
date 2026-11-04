import { supabase } from '@/lib/supabase';
import type { ContributionInput, Institution, Investment, NewInvestment } from '@/types/investment';

export class InvestmentRepository {
  async list(): Promise<Investment[]> {
    const { data, error } = await supabase.from('investments')
      .select('id, name, objective, category, investment_type, institution_id, current_value, valued_at, maturity_date, contributions:investment_contributions(id, investment_id, amount, quantity, occurred_on, created_at)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(row => ({ ...row, current_value: Number(row.current_value),
      contributions: row.contributions.map(item => ({ ...item, amount: Number(item.amount),
        quantity: item.quantity === null ? null : Number(item.quantity) })) })) as Investment[];
  }
  async institutions(): Promise<Institution[]> {
    const { data, error } = await supabase.from('investment_institutions').select('id, name').order('name');
    if (error) throw error;
    return data ?? [];
  }
  async create(input: NewInvestment): Promise<void> {
    const { error } = await supabase.rpc('create_investment', {
      p_name: input.name, p_objective: input.objective, p_category: input.category,
      p_type: input.investment_type, p_institution: input.institution_id,
      p_maturity_date: input.maturity_date,
      p_amount: input.initial.amount, p_quantity: input.initial.quantity, p_date: input.initial.occurred_on,
    });
    if (error) throw error;
  }
  async saveContribution(investmentId: string, input: ContributionInput, id?: string): Promise<void> {
    const query = id
      ? supabase.from('investment_contributions').update(input).eq('id', id).eq('investment_id', investmentId)
      : supabase.from('investment_contributions').insert({ ...input, investment_id: investmentId });
    const { error } = await query.select('id').single();
    if (error) throw error;
  }
  async maturity(id: string, maturityDate: string | null): Promise<void> {
    const { error } = await supabase.from('investments').update({ maturity_date: maturityDate })
      .eq('id', id).eq('category', 'fixa').select('id').single();
    if (error) throw error;
  }
  async deleteInvestment(id: string): Promise<void> {
    // A FK do banco remove os aportes na mesma transação.
    const { error } = await supabase.from('investments').delete().eq('id', id).select('id').single();
    if (error) throw error;
  }
  async deleteContribution(id: string): Promise<void> {
    const { error } = await supabase.from('investment_contributions').delete().eq('id', id).select('id').single();
    if (error) throw error;
  }
  async value(id: string, currentValue: number): Promise<void> {
    const { error } = await supabase.from('investments').update({ current_value: currentValue, valued_at: new Date().toISOString() })
      .eq('id', id).select('id').single();
    if (error) throw error;
  }
}
