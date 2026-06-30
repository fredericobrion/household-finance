const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

/** Ex.: 31.05 -> "31.05%" (1 casa: "74%" quando inteiro arredondado). */
export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/** Converte texto digitado ("1.655,50" ou "1655.50") em número. */
export function parseAmount(input: string): number {
  if (!input) return 0;
  const normalized = input
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
