export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  created_at: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

export interface TransactionInsert {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Other Income",
] as const;

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Groceries",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Dining Out",
  "Cats",
  "Clothing",
  "Savings",
  "Other",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
