import React from 'react';
import { Eye, EyeOff, SlidersHorizontal, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { MonthSummary } from '../types/ledger';

interface OverviewCardsProps {
  totalAssets: number;
  monthSummary: MonthSummary;
  hideAmounts: boolean;
  onToggleHideAmounts: () => void;
  onOpenAssetAdjustModal: () => void;
  selectedMonth: { year: number; month: number };
  onMonthChange: (diff: number) => void;
  onResetToCurrentMonth: () => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  totalAssets,
  monthSummary,
  hideAmounts,
  onToggleHideAmounts,
  onOpenAssetAdjustModal,
  selectedMonth,
  onMonthChange,
  onResetToCurrentMonth,
}) => {
  const now = new Date();
  const isCurrentMonth =
    selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth() + 1;

  const formatMoney = (amount: number, showSign = false) => {
    if (hideAmounts) return '••••••';
    const absStr = Math.abs(amount).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (showSign) {
      return amount >= 0 ? `+${absStr}` : `-${absStr}`;
    }
    return absStr;
  };

  return (
    <div className="space-y-4">
      {/* Date & Month Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-neutral-200/80 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onMonthChange(-1)}
            aria-label="上一月"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900 tracking-tight">
              {selectedMonth.year}年 {selectedMonth.month}月
            </span>
            {!isCurrentMonth && (
              <button
                onClick={onResetToCurrentMonth}
                className="text-xs px-2 py-0.5 rounded text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                回到当月
              </button>
            )}
          </div>
          <button
            onClick={() => onMonthChange(1)}
            aria-label="下一月"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <button
            onClick={onToggleHideAmounts}
            className="flex items-center gap-1 hover:text-neutral-900 px-2 py-1 rounded transition-colors"
            title={hideAmounts ? '显示金额' : '隐藏敏感金额'}
          >
            {hideAmounts ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                <span>金额已隐藏</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                <span>隐藏金额</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Financial Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 当前总资产 (Total Net Assets) */}
        <div className="relative bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-neutral-500">当前总资产</span>
            </div>
            <button
              onClick={onOpenAssetAdjustModal}
              className="text-xs text-neutral-400 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              title="调整基础资产"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>校准</span>
            </button>
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-sm font-semibold text-neutral-400">¥</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-mono-numbers">
              {formatMoney(totalAssets)}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>净资产累计</span>
            <span className="text-neutral-700 font-medium font-mono-numbers">
              {hideAmounts ? '••••' : `含基础储备`}
            </span>
          </div>
        </div>

        {/* Card 2: 本月支出 (This Month Expense) */}
        <div className="relative bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-neutral-500">本月支出</span>
            </div>
            <span className="text-xs text-neutral-400">
              {monthSummary.transactionCount} 笔流水
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1 text-rose-600">
            <span className="text-sm font-semibold">¥</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight font-mono-numbers">
              {formatMoney(monthSummary.totalExpense)}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>日均支出</span>
            <span className="text-neutral-700 font-mono-numbers font-medium">
              ¥ {formatMoney(monthSummary.dailyAverageExpense)}
            </span>
          </div>
        </div>

        {/* Card 3: 本月收入 (This Month Income) */}
        <div className="relative bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-neutral-500">本月收入</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium">
              <span className="text-neutral-400">结余:</span>
              <span
                className={`font-mono-numbers ${
                  monthSummary.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {monthSummary.netBalance >= 0 ? '+' : ''}
                {formatMoney(monthSummary.netBalance)}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mt-1 text-emerald-600">
            <span className="text-sm font-semibold">¥</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight font-mono-numbers">
              {formatMoney(monthSummary.totalIncome)}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>收支结余率</span>
            <span className="text-neutral-700 font-mono-numbers font-medium">
              {monthSummary.totalIncome > 0
                ? `${Math.max(
                    0,
                    Math.round(
                      ((monthSummary.totalIncome - monthSummary.totalExpense) /
                        monthSummary.totalIncome) *
                        100
                    )
                  )}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
