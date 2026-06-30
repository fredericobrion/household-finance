import type { MonthKey } from '@/types/budget';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function currentMonthKey(): MonthKey {
  const now = new Date();
  return toMonthKey(now.getFullYear(), now.getMonth() + 1);
}

export function toMonthKey(year: number, month1to12: number): MonthKey {
  return `${year}-${String(month1to12).padStart(2, '0')}`;
}

export function parseMonthKey(key: MonthKey): { year: number; month: number } {
  const [year, month] = key.split('-').map(Number);
  return { year, month };
}

/** Avança/retrocede `delta` meses. */
export function addMonths(key: MonthKey, delta: number): MonthKey {
  const { year, month } = parseMonthKey(key);
  const zeroBased = month - 1 + delta;
  const newYear = year + Math.floor(zeroBased / 12);
  const newMonth = ((zeroBased % 12) + 12) % 12;
  return toMonthKey(newYear, newMonth + 1);
}

/** Ex.: '2026-06' -> 'Junho 2026'. */
export function monthLabel(key: MonthKey): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Ex.: '2026-06' -> 'Junho de 2026' (mais formal). */
export function monthLabelLong(key: MonthKey): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTH_NAMES[month - 1]} de ${year}`;
}
