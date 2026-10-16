import React, { useMemo, useState } from 'react';
import { Transaction, Category, MonthSummary } from '../types/ledger';
import { CategoryIcon } from './CategoryIcon';
import { PieChart, TrendingDown, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: { year: number; month: number };
  monthSummary: MonthSummary;
  monthlyBudget: number;
  onUpdateBudget: (budget: number) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
  selectedMonth,
  monthSummary,
  monthlyBudget,
  onUpdateBudget,
}) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(monthlyBudget.toString());

  const monthPrefix = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`;

  // Filter current month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(monthPrefix));
  }, [transactions, monthPrefix]);

  // Aggregate by category
  const categoryStats = useMemo(() => {
    const list = monthTransactions.filter((t) => t.type === activeTab);
    const totalAmount = list.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, { categoryId: string; name: string; icon: string; amount: number; count: number }>();

    for (const t of list) {
      if (!map.has(t.categoryId)) {
        map.set(t.categoryId, {
          categoryId: t.categoryId,
          name: t.categoryName,
          icon: t.categoryIcon,
          amount: 0,
          count: 0,
        });
      }
      const entry = map.get(t.categoryId)!;
      entry.amount += t.amount;
      entry.count += 1;
    }

    const items = Array.from(map.values())
      .map((item) => ({
        ...item,
        percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { items, totalAmount };
  }, [monthTransactions, activeTab]);

  // Daily Spending distribution (Day 1 to days in month)
  const dailyDistribution = useMemo(() => {
    const daysInMonth = new Date(selectedMonth.year, selectedMonth.month, 0).getDate();
    const dayTotals = new Array(daysInMonth).fill(0);

    for (const t of monthTransactions) {
      if (t.type === 'expense') {
        const day = parseInt(t.date.split('-')[2], 10);
        if (day >= 1 && day <= daysInMonth) {
          dayTotals[day - 1] += t.amount;
        }
      }
    }

    const maxDayTotal = Math.max(...dayTotals, 100);
    return { dayTotals, maxDayTotal, daysInMonth };
  }, [monthTransactions, selectedMonth]);

  const budgetUsagePercent =
    monthlyBudget > 0 ? Math.min(100, (monthSummary.totalExpense / monthlyBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Monthly Budget Card */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">月度预算管理</h3>
            <p className="text-xs text-neutral-600">
              合理规划每月开销，保持健康的储蓄习惯
            </p>
          </div>
          <div>
            {isEditingBudget ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  className="w-24 px-2 py-1 text-xs border rounded-md font-mono-numbers"
                  placeholder="预算金额"
                />
                <button
                  onClick={() => {
                    const b = parseFloat(budgetValue) || 0;
                    onUpdateBudget(b);
                    setIsEditingBudget(false);
                  }}
                  className="px-2.5 py-1 text-xs bg-neutral-900 text-white rounded-md font-medium"
                >
                  保存
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setBudgetValue(monthlyBudget.toString());
                  setIsEditingBudget(true);
                }}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline font-medium"
              >
                设置预算 (当前: ¥{monthlyBudget})
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5 font-mono-numbers">
            <span className="text-neutral-600">
              已支出: <strong className="text-neutral-900">¥ {monthSummary.totalExpense.toFixed(2)}</strong>
            </span>
            <span className="text-neutral-600">
              预算总额: ¥ {monthlyBudget.toFixed(2)} (使用率 {budgetUsagePercent.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercent > 90
                  ? 'bg-rose-500'
                  : budgetUsagePercent > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetUsagePercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-neutral-600 mt-2">
            <span>
              {monthlyBudget - monthSummary.totalExpense >= 0 ? (
                <>剩余可用预算: <strong className="text-emerald-600 font-mono-numbers">¥ {(monthlyBudget - monthSummary.totalExpense).toFixed(2)}</strong></>
              ) : (
                <>已超出预算: <strong className="text-rose-600 font-mono-numbers">¥ {(monthSummary.totalExpense - monthlyBudget).toFixed(2)}</strong></>
              )}
            </span>
            <span>日均可用: ¥ {Math.max(0, (monthlyBudget - monthSummary.totalExpense) / Math.max(1, 30 - new Date().getDate())).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Daily Spending Trend Chart */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              {selectedMonth.month}月每日支出走势
            </h3>
            <span className="text-xs text-neutral-600">柱高代表当天支出金额</span>
          </div>
          <span className="text-xs font-mono-numbers text-neutral-600">
            峰值: ¥{dailyDistribution.maxDayTotal.toFixed(0)}
          </span>
        </div>

        {/* SVG/Bar Histogram */}
        <div className="h-36 flex items-end gap-1 sm:gap-1.5 pt-4 pb-2 border-b border-neutral-100">
          {dailyDistribution.dayTotals.map((amount, idx) => {
            const heightPercent =
              dailyDistribution.maxDayTotal > 0
                ? Math.max(4, (amount / dailyDistribution.maxDayTotal) * 100)
                : 4;
            const isToday =
              selectedMonth.month === new Date().getMonth() + 1 &&
              selectedMonth.year === new Date().getFullYear() &&
              idx + 1 === new Date().getDate();

            return (
              <div
                key={idx}
                className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-1 z-20 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded shadow-md whitespace-nowrap font-mono-numbers transition-opacity">
                  {idx + 1}日: ¥{amount.toFixed(2)}
                </div>

                {/* Bar */}
                <div
                  className={`w-full rounded-t-xs transition-all ${
                    amount > 0
                      ? isToday
                        ? 'bg-neutral-900'
                        : 'bg-neutral-300 hover:bg-neutral-600'
                      : 'bg-neutral-100'
                  }`}
                  style={{ height: `${amount > 0 ? heightPercent : 4}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X Axis ticks */}
        <div className="flex justify-between text-[10px] text-neutral-600 pt-1.5 font-mono-numbers">
          <span>1日</span>
          <span>7日</span>
          <span>15日</span>
          <span>22日</span>
          <span>{dailyDistribution.daysInMonth}日</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">分类收支占比</h3>
            <span className="text-xs text-neutral-600">
              本月{activeTab === 'expense' ? '支出' : '收入'}按分类聚合分析
            </span>
          </div>

          {/* Toggle Type */}
          <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('expense')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'expense'
                  ? 'bg-white text-rose-600 font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              支出占比
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'income'
                  ? 'bg-white text-emerald-600 font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              收入占比
            </button>
          </div>
        </div>

        {categoryStats.items.length === 0 ? (
          <div className="py-10 text-center text-xs text-neutral-600">
            本月暂无{activeTab === 'expense' ? '支出' : '收入'}分类数据
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Multi-Segment Proportional Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-neutral-100">
              {categoryStats.items.map((item, i) => {
                const colors = [
                  'bg-neutral-900',
                  'bg-neutral-700',
                  'bg-neutral-500',
                  'bg-neutral-400',
                  'bg-neutral-300',
                ];
                return (
                  <div
                    key={item.categoryId}
                    className={`h-full ${colors[i % colors.length]}`}
                    style={{ width: `${item.percentage}%` }}
                    title={`${item.name}: ${item.percentage.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Category List */}
            <div className="divide-y divide-neutral-100 pt-1">
              {categoryStats.items.map((item) => (
                <div
                  key={item.categoryId}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                      <CategoryIcon name={item.icon} size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">{item.name}</div>
                      <div className="text-[11px] text-neutral-600">{item.count} 笔记录</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-neutral-900 font-mono-numbers">
                      ¥ {item.amount.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-neutral-600 font-mono-numbers">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
