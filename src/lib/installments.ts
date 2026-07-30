/** Mantém o dia de compra quando possível; em meses menores usa o último dia. */
export function addMonthsToDate(date: string, months: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const source = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(source.getFullYear(), source.getMonth() + 1, 0).getDate();
  const targetDay = Math.min(day, lastDay);
  return `${source.getFullYear()}-${String(source.getMonth() + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
}
