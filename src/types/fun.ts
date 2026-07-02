import type { MonthKey } from './budget';

export type FunType = 'saldo' | 'gasto';

export interface Person {
  id: string;
  name: string;
  createdAt: string;
}

export interface FunEntry {
  id: string;
  personId: string;
  month: MonthKey;
  type: FunType;
  description: string;
  amount: number;
  groupId: string | null;
  installmentIndex: number;
  installmentCount: number;
  createdAt: string;
}
