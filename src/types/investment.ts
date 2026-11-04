export const INVESTMENT_OBJECTIVES = {
  liberdade_financeira: 'Liberdade financeira',
  apartamento: 'Apartamento',
  metas: 'Metas',
} as const;
export type InvestmentObjective = keyof typeof INVESTMENT_OBJECTIVES;
export const INVESTMENT_TYPES = {
  fixa: ['CDB', 'RDB', 'LCI', 'LCA', 'LC', 'Tesouro Direto', 'Debênture', 'CRI', 'CRA', 'Poupança', 'Outros'],
  variavel: ['Ação', 'FII', 'ETF', 'BDR', 'Outros'],
} as const;
export type InvestmentCategory = keyof typeof INVESTMENT_TYPES;
export interface Institution { id: string; name: string }
export interface Contribution {
  id: string;
  investment_id: string;
  amount: number;
  quantity: number | null;
  occurred_on: string;
  created_at: string;
}
export interface Investment {
  id: string;
  name: string;
  objective: InvestmentObjective;
  category: InvestmentCategory;
  investment_type: string;
  institution_id: string;
  current_value: number;
  valued_at: string | null;
  maturity_date: string | null;
  contributions: Contribution[];
}
export interface ContributionInput { amount: number; quantity: number | null; occurred_on: string }
export interface NewInvestment {
  name: string;
  objective: InvestmentObjective;
  category: InvestmentCategory;
  investment_type: string;
  institution_id: string;
  maturity_date: string | null;
  initial: ContributionInput;
}

export interface MaturityInput { maturity_date: string | null }
export interface InvestmentFilters {
  category: InvestmentCategory | '';
  institutionId: string;
  type: string;
  maturityYear: string;
}
export const EMPTY_INVESTMENT_FILTERS: InvestmentFilters = {
  category: '', institutionId: '', type: '', maturityYear: '',
};
