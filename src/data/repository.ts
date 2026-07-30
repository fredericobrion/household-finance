import type {
  Expense,
  ExpenseSuggestion,
  Goals,
  Income,
  MonthKey,
  NewExpense,
  NewIncome,
  NewRecurring,
  RecurringExpense,
} from '@/types/budget';

/**
 * Contrato de acesso a dados. As telas só falam com esta interface.
 * Hoje: LocalRepository (AsyncStorage). Depois: SupabaseRepository.
 */
export interface BudgetRepository {
  getGoals(): Promise<Goals>;
  saveGoals(goals: Goals): Promise<void>;

  /** Descrições distintas já usadas + sua categoria, mais recentes primeiro. */
  listExpenseSuggestions(): Promise<ExpenseSuggestion[]>;
  listExpenses(month: MonthKey): Promise<Expense[]>;
  addExpense(input: NewExpense, installments?: number): Promise<Expense>;
  updateExpense(id: string, patch: Partial<NewExpense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  listIncomes(month: MonthKey): Promise<Income[]>;
  addIncome(input: NewIncome): Promise<Income>;
  deleteIncome(id: string): Promise<void>;

  listRecurring(): Promise<RecurringExpense[]>;
  addRecurring(input: NewRecurring): Promise<RecurringExpense>;
  updateRecurring(id: string, patch: Partial<NewRecurring>): Promise<RecurringExpense>;
  deleteRecurring(id: string): Promise<void>;
}
