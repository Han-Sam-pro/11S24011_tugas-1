export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  walletId: string;
  date: string; // YYYY-MM-DD
  note?: string;
  isAutomated?: boolean;
  recurringRuleId?: string;
  createdAt: number;
}

export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface RecurringRule {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: string;
  walletId: string;
  frequency: FrequencyType;
  dayOfMonth?: number; // 1-31 for monthly
  dayOfWeek?: number; // 0 (Sun) - 6 (Sat) for weekly
  nextDueDate: string; // YYYY-MM-DD
  lastRunDate?: string; // YYYY-MM-DD
  isActive: boolean;
  autoExecute: boolean;
  createdAt: number;
}

export interface QuickTemplate {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  category: string;
  walletId: string;
  icon: string;
}

export type WalletType = 'cash' | 'bank' | 'ewallet';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  accountNumber?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface DailyStat {
  day: number;
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface MonthlyReportData {
  yearMonth: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRate: number; // percentage (0 - 100)
  transactionCount: number;
  automatedCount: number;
  dailyStats: DailyStat[];
  expenseCategories: CategoryBreakdown[];
  incomeCategories: CategoryBreakdown[];
  prevMonthDiff: {
    incomeDiffPct: number;
    expenseDiffPct: number;
    netDiffPct: number;
  };
}
