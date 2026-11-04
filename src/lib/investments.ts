import type { Contribution, Investment, InvestmentCategory, InvestmentFilters } from '../types/investment';

export function investmentTotals(contributions: Contribution[], currentValue: number) {
  const invested = Math.round(contributions.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
  const quantity = contributions.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const gain = Math.round((currentValue - invested) * 100) / 100;
  return { invested, quantity, average: quantity > 0 ? invested / quantity : 0,
    gain, gainPercent: invested > 0 ? gain / invested * 100 : null };
}

/** Quantidades usam vírgula decimal, sem separador de milhar. */
export function parseQuantity(text: string): number {
  return /^\d+(?:[,.]\d{1,8})?$/.test(text) ? Number(text.replace(',', '.')) : NaN;
}

export function changeFilterCategory(filters: InvestmentFilters, category: InvestmentCategory | ''): InvestmentFilters {
  return { ...filters, category, type: '', maturityYear: '' };
}

/** Filtros combinados; campos dependentes só são usados na categoria correspondente. */
export function filterInvestments(items: Investment[], filters: InvestmentFilters): Investment[] {
  return items.filter(item => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.institutionId && item.institution_id !== filters.institutionId) return false;
    if (filters.category && filters.type && item.investment_type !== filters.type) return false;
    if (filters.category === 'fixa' && filters.maturityYear) {
      if (filters.maturityYear === 'none') return item.maturity_date === null;
      return item.maturity_date?.slice(0, 4) === filters.maturityYear;
    }
    return true;
  });
}
