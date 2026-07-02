import type { MonthKey } from '@/types/budget';
import type { FunEntry, Person } from '@/types/fun';

/**
 * Contrato da carteira "Besteira". Cada pessoa tem sua própria carteira.
 * Hoje: LocalFunRepository (AsyncStorage). Depois: SupabaseFunRepository.
 */
export interface FunRepository {
  listPeople(): Promise<Person[]>;
  addPerson(name: string): Promise<Person>;
  deletePerson(id: string): Promise<void>;

  listEntries(personId: string, month: MonthKey): Promise<FunEntry[]>;
  /** Saldo acumulado da pessoa até o fim do mês anterior (carrega de mês a mês). */
  balanceBefore(personId: string, month: MonthKey): Promise<number>;
  addSaldo(
    personId: string,
    month: MonthKey,
    amount: number,
    description: string,
  ): Promise<void>;
  addGasto(
    personId: string,
    month: MonthKey,
    total: number,
    description: string,
    installments: number,
  ): Promise<void>;
  /** Remove o lançamento; se for parcelado, remove todas as parcelas do grupo. */
  deleteEntry(entry: FunEntry): Promise<void>;
}
