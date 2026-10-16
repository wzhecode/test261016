import { Category, AccountInfo } from '../types/ledger';

export const DEFAULT_ACCOUNTS: AccountInfo[] = [
  { id: 'bank', name: '银行储蓄卡', iconName: 'CreditCard', color: '#2563EB' },
  { id: 'alipay', name: '支付宝', iconName: 'Zap', color: '#0284C7' },
  { id: 'wechat', name: '微信支付', iconName: 'MessageSquare', color: '#16A34A' },
  { id: 'cash', name: '现金钱包', iconName: 'Banknote', color: '#D97706' },
  { id: 'other', name: '其它账户', iconName: 'Layers', color: '#64748B' },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'c_dining', name: '餐饮美食', type: 'expense', iconName: 'Utensils', color: '#EF4444' },
  { id: 'c_transport', name: '交通出行', type: 'expense', iconName: 'Car', color: '#F97316' },
  { id: 'c_shopping', name: '购物百货', type: 'expense', iconName: 'ShoppingBag', color: '#EC4899' },
  { id: 'c_entertainment', name: '休闲娱乐', type: 'expense', iconName: 'Gamepad2', color: '#8B5CF6' },
  { id: 'c_housing', name: '房租房贷', type: 'expense', iconName: 'Home', color: '#3B82F6' },
  { id: 'c_utilities', name: '水电宽带', type: 'expense', iconName: 'Zap', color: '#06B6D4' },
  { id: 'c_clothing', name: '服饰装扮', type: 'expense', iconName: 'Shirt', color: '#10B981' },
  { id: 'c_medical', name: '医疗健康', type: 'expense', iconName: 'HeartPulse', color: '#E11D48' },
  { id: 'c_education', name: '学习进修', type: 'expense', iconName: 'GraduationCap', color: '#6366F1' },
  { id: 'c_social', name: '人情社交', type: 'expense', iconName: 'Users', color: '#F59E0B' },
  { id: 'c_pet', name: '宠物爱宠', type: 'expense', iconName: 'Dog', color: '#14B8A6' },
  { id: 'c_other_exp', name: '其它支出', type: 'expense', iconName: 'MoreHorizontal', color: '#6B7280' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'c_salary', name: '职业薪资', type: 'income', iconName: 'Briefcase', color: '#10B981' },
  { id: 'c_freelance', name: '副业兼职', type: 'income', iconName: 'Laptop', color: '#3B82F6' },
  { id: 'c_investment', name: '理财投资', type: 'income', iconName: 'TrendingUp', color: '#8B5CF6' },
  { id: 'c_bonus', name: '奖金红包', type: 'income', iconName: 'Gift', color: '#F59E0B' },
  { id: 'c_refund', name: '报销退款', type: 'income', iconName: 'RefreshCw', color: '#06B6D4' },
  { id: 'c_other_inc', name: '其它收入', type: 'income', iconName: 'Wallet', color: '#6B7280' },
];

export const INITIAL_BASE_ASSET = 35800; // Baseline initial balance before records
