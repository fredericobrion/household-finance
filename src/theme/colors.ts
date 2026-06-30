/** Paleta escura do app (base nos exemplos das telas). */
export const Colors = {
  background: '#000000',
  surface: '#121316',
  surfaceAlt: '#1A1C20',
  border: '#26282D',
  text: '#FFFFFF',
  textSecondary: '#9BA1A9',
  textMuted: '#6B7079',
  accent: '#F5A623', // títulos "Gastos"/"Resumo" em dourado
  positive: '#4ADE80',
  negative: '#F87171',
  neutral: '#FFFFFF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;
