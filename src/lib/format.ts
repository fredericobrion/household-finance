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
