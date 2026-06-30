import type {
  Expense,
  Goals,
  Income,
  MonthKey,
  NewExpense,
  NewIncome,
} from '@/types/budget';

/**
 * Contrato de acesso a dados. As telas só falam com esta interface.
 * Hoje: LocalRepository (AsyncStorage). Depois: SupabaseRepository.
 */
export interface BudgetRepository {
  getGoals(): Promise<Goals>;
  saveGoals(goals: Goals): Promise<void>;

  listExpenses(month: MonthKey): Promise<Expense[]>;
  addExpense(input: NewExpense): Promise<Expense>;
  updateExpense(id: string, patch: Partial<NewExpense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  listIncomes(month: MonthKey): Promise<Income[]>;
  addIncome(input: NewIncome): Promise<Income>;
  deleteIncome(id: string): Promise<void>;
}
