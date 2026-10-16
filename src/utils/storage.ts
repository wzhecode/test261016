import { Transaction, LedgerConfig, Category } from '../types/ledger';
import { INITIAL_BASE_ASSET } from './constants';

const STORAGE_KEYS = {
  TRANSACTIONS: 'simple_ledger_transactions_v2',
  CONFIG: 'simple_ledger_config_v2',
  CUSTOM_CATEGORIES: 'simple_ledger_custom_categories_v2',
};

const DEFAULT_CONFIG: LedgerConfig = {
  initialBaseAsset: INITIAL_BASE_ASSET,
  hideAssetAmounts: false,
  monthlyBudget: 6000,
};

// Generate initial demo data centered around current month
function generateDemoTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = now.getDate();

  const padDay = (d: number) => String(Math.max(1, Math.min(28, d))).padStart(2, '0');

  return [
    {
      id: 'demo-1',
      type: 'income',
      amount: 18500,
      categoryId: 'c_salary',
      categoryName: '职业薪资',
      categoryIcon: 'Briefcase',
      accountId: 'bank',
      date: `${year}-${month}-${padDay(10)}`,
      time: '10:00',
      note: '10月份基本工资及绩效',
      createdAt: Date.now() - 40000000,
    },
    {
      id: 'demo-2',
      type: 'expense',
      amount: 3500,
      categoryId: 'c_housing',
      categoryName: '房租房贷',
      categoryIcon: 'Home',
      accountId: 'bank',
      date: `${year}-${month}-${padDay(1)}`,
      time: '09:30',
      note: '公寓月度房租',
      createdAt: Date.now() - 35000000,
    },
    {
      id: 'demo-3',
      type: 'income',
      amount: 2200,
      categoryId: 'c_freelance',
      categoryName: '副业兼职',
      categoryIcon: 'Laptop',
      accountId: 'alipay',
      date: `${year}-${month}-${padDay(8)}`,
      time: '18:20',
      note: '界面UI设计项目尾款',
      createdAt: Date.now() - 30000000,
    },
    {
      id: 'demo-4',
      type: 'expense',
      amount: 142.5,
      categoryId: 'c_shopping',
      categoryName: '购物百货',
      categoryIcon: 'ShoppingBag',
      accountId: 'wechat',
      date: `${year}-${month}-${padDay(day > 2 ? day - 2 : 1)}`,
      time: '19:40',
      note: '盒马鲜生日用品采购',
      createdAt: Date.now() - 20000000,
    },
    {
      id: 'demo-5',
      type: 'expense',
      amount: 45.0,
      categoryId: 'c_dining',
      categoryName: '餐饮美食',
      categoryIcon: 'Utensils',
      accountId: 'alipay',
      date: `${year}-${month}-${padDay(day > 1 ? day - 1 : 1)}`,
      time: '12:20',
      note: '工作日商务定食',
      createdAt: Date.now() - 10000000,
    },
    {
      id: 'demo-6',
      type: 'expense',
      amount: 28.0,
      categoryId: 'c_dining',
      categoryName: '餐饮美食',
      categoryIcon: 'Utensils',
      accountId: 'wechat',
      date: `${year}-${month}-${padDay(day)}`,
      time: '14:15',
      note: '手冲美式咖啡',
      createdAt: Date.now() - 5000000,
    },
    {
      id: 'demo-7',
      type: 'expense',
      amount: 65.0,
      categoryId: 'c_transport',
      categoryName: '交通出行',
      categoryIcon: 'Car',
      accountId: 'alipay',
      date: `${year}-${month}-${padDay(day)}`,
      time: '08:45',
      note: '滴滴打车去客户公司',
      createdAt: Date.now() - 2000000,
    },
  ];
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      const demo = generateDemoTransactions();
      saveTransactions(demo);
      return demo;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load transactions:', err);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
}

export function loadConfig(): LedgerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      saveConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: LedgerConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save config:', err);
  }
}

export function loadCustomCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function saveCustomCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save custom categories:', err);
  }
}

export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['ID', '类型', '金额', '分类', '账户', '日期', '时间', '备注'];
  const rows = transactions.map((t) => [
    t.id,
    t.type === 'expense' ? '支出' : '收入',
    t.amount.toFixed(2),
    `"${t.categoryName}"`,
    t.accountId,
    t.date,
    t.time || '',
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function resetToDemo(): Transaction[] {
  const demo = generateDemoTransactions();
  saveTransactions(demo);
  saveConfig(DEFAULT_CONFIG);
  return demo;
}

export function clearData(): void {
  saveTransactions([]);
}
