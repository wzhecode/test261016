export type TransactionType = 'expense' | 'income';

export type AccountId = 'bank' | 'alipay' | 'wechat' | 'cash' | 'other';

export interface AccountInfo {
  id: AccountId;
  name: string;
  iconName: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  color: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  accountId: AccountId;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  createdAt: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  dailyAverageExpense: number;
}

export interface LedgerConfig {
  initialBaseAsset: number;
  hideAssetAmounts: boolean;
  monthlyBudget: number;
}
