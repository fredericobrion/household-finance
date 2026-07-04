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

/** Minúsculas sem acento, para comparação/busca. */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Hoje em 'YYYY-MM-DD' (horário local). */
export function ymdToday(): string {
  return dateToYmd(new Date());
}

/** Date -> 'YYYY-MM-DD' (local). */
export function dateToYmd(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** 'YYYY-MM-DD' -> Date local (meia-noite). */
export function ymdToDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 'YYYY-MM-DD' -> 'DD/MM/YY' (sem depender de fuso). */
export function ymdToBR(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y.slice(-2)}`;
}

/** ISO -> "DD/MM/YY". */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

/** Mantém só dígitos (para o input em centavos). */
export function onlyDigits(input: string): string {
  return input.replace(/\D/g, '');
}

/** Dígitos como centavos -> valor. Ex.: "2500" -> 25.00, "5" -> 0.05. */
export function centsToAmount(digits: string): number {
  return digits ? Number(digits) / 100 : 0;
}

/** Valor -> string de centavos (para pré-preencher ao editar). Ex.: 25 -> "2500". */
export function amountToCents(amount: number): string {
  if (!amount) return '';
  return String(Math.round(amount * 100));
}
