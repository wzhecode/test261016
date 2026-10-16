import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
} from 'lucide-react';
import { Transaction, TransactionType, Category, AccountId } from '../types/ledger';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_ACCOUNTS } from '../utils/constants';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: { year: number; month: number };
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenRecordModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  selectedMonth,
  onEdit,
  onDelete,
  onOpenRecordModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');

  const accountMap = useMemo(() => {
    return DEFAULT_ACCOUNTS.reduce((acc, cur) => {
      acc[cur.id] = cur.name;
      return acc;
    }, {} as Record<string, string>);
  }, []);

  // Filter transactions for current view
  const filteredTransactions = useMemo(() => {
    const monthPrefix = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`;

    return transactions
      .filter((t) => {
        // month check
        if (!t.date.startsWith(monthPrefix)) return false;

        // type check
        if (filterType !== 'all' && t.type !== filterType) return false;

        // category check
        if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false;

        // account check
        if (filterAccount !== 'all' && t.accountId !== filterAccount) return false;

        // search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNote = (t.note || '').toLowerCase().includes(q);
          const matchCat = t.categoryName.toLowerCase().includes(q);
          const matchAmount = t.amount.toString().includes(q);
          if (!matchNote && !matchCat && !matchAmount) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by date desc, then created desc
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [transactions, selectedMonth, filterType, filterCategory, filterAccount, searchQuery]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: Transaction[]; dayExpense: number; dayIncome: number }[] =
      [];
    const map = new Map<string, Transaction[]>();

    for (const t of filteredTransactions) {
      if (!map.has(t.date)) {
        map.set(t.date, []);
      }
      map.get(t.date)!.push(t);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    for (const [date, items] of map.entries()) {
      let dayExpense = 0;
      let dayIncome = 0;
      items.forEach((item) => {
        if (item.type === 'expense') dayExpense += item.amount;
        else dayIncome += item.amount;
      });

      groups.push({
        date,
        items,
        dayExpense,
        dayIncome,
      });
    }

    return groups;
  }, [filteredTransactions]);

  const formatDateHeader = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const d = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekdayStr = weekdays[d.getDay()];

    if (dateStr === todayStr) {
      return `今天 · ${dateStr.slice(5)} (${weekdayStr})`;
    }
    if (dateStr === yesterdayStr) {
      return `昨天 · ${dateStr.slice(5)} (${weekdayStr})`;
    }
    return `${dateStr.slice(5)} · ${weekdayStr}`;
  };

  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'expense'
                ? 'bg-white text-rose-600 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            支出
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'income'
                ? 'bg-white text-emerald-600 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            收入
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 max-w-md ml-auto">
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[140px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索分类、备注或金额..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white rounded-lg border border-neutral-200 focus:border-neutral-900 outline-none transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-700 outline-none focus:border-neutral-900 cursor-pointer"
          >
            <option value="all">全部分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Stream List */}
      <div className="mt-4 divide-y divide-neutral-100">
        {groupedByDate.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-1">
              {searchQuery || filterCategory !== 'all' || filterType !== 'all'
                ? '未找到匹配的流水记录'
                : `${selectedMonth.month} 月暂无记账数据`}
            </h3>
            <p className="text-xs text-neutral-600 max-w-xs mx-auto mb-4">
              记录每笔收支，让钱花的明明白白。数据自动保存在本地浏览器中。
            </p>
            <button
              onClick={onOpenRecordModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>记第一笔</span>
            </button>
          </div>
        ) : (
          groupedByDate.map((group) => (
            <div key={group.date} className="py-3 first:pt-0 last:pb-0">
              {/* Day Header with Subtotal */}
              <div className="flex items-center justify-between text-xs py-1.5 mb-1.5">
                <span className="font-semibold text-neutral-800">
                  {formatDateHeader(group.date)}
                </span>
                <div className="flex items-center gap-2 text-neutral-400 font-mono-numbers">
                  {group.dayExpense > 0 && (
                    <span>支 ¥{group.dayExpense.toFixed(2)}</span>
                  )}
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-600">收 ¥{group.dayIncome.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Day Transactions */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isExpense = item.type === 'expense';
                  return (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50/90 transition-colors border border-transparent hover:border-neutral-200/60"
                    >
                      {/* Left: Icon & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isExpense
                              ? 'bg-neutral-100 text-neutral-800 group-hover:bg-rose-50 group-hover:text-rose-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <CategoryIcon name={item.categoryIcon} size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-900 truncate">
                              {item.categoryName}
                            </span>
                            {item.note && (
                              <span className="text-xs text-neutral-500 truncate max-w-[140px] sm:max-w-xs">
                                · {item.note}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-600 mt-0.5">
                            <span>{accountMap[item.accountId] || item.accountId}</span>
                            {item.time && <span>{item.time}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-sm sm:text-base font-bold font-mono-numbers ${
                            isExpense ? 'text-neutral-900' : 'text-emerald-600'
                          }`}
                        >
                          {isExpense ? '-' : '+'}¥ {item.amount.toFixed(2)}
                        </span>

                        {/* Action buttons (hidden on mobile, visible on group hover) */}
                        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(item)}
                            title="编辑修改"
                            className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`确定删除这笔 ${item.categoryName} ¥${item.amount} 记录吗？`)) {
                                onDelete(item.id);
                              }
                            }}
                            title="删除记录"
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
