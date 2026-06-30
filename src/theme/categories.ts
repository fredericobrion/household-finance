import type { CategoryKey } from '@/types/budget';

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  color: string;
}

/** Ordem e cores das categorias (base no exemplo do gráfico de rosca). */
export const CATEGORIES: CategoryMeta[] = [
  { key: 'custos_fixos', label: 'Custos fixos', color: '#4DA6FF' },
  { key: 'conforto', label: 'Conforto', color: '#2DD4BF' },
  { key: 'metas', label: 'Metas', color: '#FACC15' },
  { key: 'prazeres', label: 'Prazeres', color: '#E879F9' },
  { key: 'liberdade_financeira', label: 'Liberdade financeira', color: '#6366F1' },
  { key: 'conhecimento', label: 'Conhecimento', color: '#F97316' },
];

export const CATEGORY_KEYS: CategoryKey[] = CATEGORIES.map((c) => c.key);

const byKey: Record<CategoryKey, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.key] = c;
    return acc;
  },
  {} as Record<CategoryKey, CategoryMeta>,
);

export function categoryMeta(key: CategoryKey): CategoryMeta {
  return byKey[key];
}

export const EMPTY_GOALS = CATEGORY_KEYS.reduce(
  (acc, k) => {
    acc[k] = 0;
    return acc;
  },
  {} as Record<CategoryKey, number>,
);

/** Distribuição padrão das metas (soma = 100%). */
export const DEFAULT_GOALS: Record<CategoryKey, number> = {
  custos_fixos: 30,
  conforto: 15,
  metas: 15,
  prazeres: 10,
  liberdade_financeira: 25,
  conhecimento: 5,
};
