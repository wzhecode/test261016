import React from 'react';
import { Transaction } from '../types/ledger';
import { DEFAULT_ACCOUNTS } from '../utils/constants';
import { CategoryIcon } from './CategoryIcon';
import { CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface AccountsViewProps {
  transactions: Transaction[];
  initialBaseAsset: number;
  totalAssets: number;
  hideAmounts: boolean;
  onOpenAssetAdjustModal: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  transactions,
  initialBaseAsset,
  totalAssets,
  hideAmounts,
  onOpenAssetAdjustModal,
}) => {
  // Calculate per account inflows, outflows, and net changes
  const accountMetrics = DEFAULT_ACCOUNTS.map((acc, index) => {
    const accTransactions = transactions.filter((t) => t.accountId === acc.id);
    const income = accTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = accTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;

    // Distribute baseline proportionally or allocate primarily to bank/wechat/alipay
    // Bank gets ~50%, Alipay ~30%, WeChat ~15%, Cash ~5%
    const weights: Record<string, number> = {
      bank: 0.55,
      alipay: 0.25,
      wechat: 0.15,
      cash: 0.05,
      other: 0,
    };
    const allocatedBase = initialBaseAsset * (weights[acc.id] || 0);
    const estimatedBalance = allocatedBase + net;

    return {
      ...acc,
      transactionCount: accTransactions.length,
      income,
      expense,
      estimatedBalance,
    };
  });

  const formatMoney = (amount: number) => {
    if (hideAmounts) return '••••••';
    return amount.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
          <div>
            <span className="text-xs font-medium text-neutral-600">全账本净资产估算</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-neutral-400">¥</span>
              <span className="text-3xl font-bold font-mono-numbers text-neutral-900">
                {formatMoney(totalAssets)}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenAssetAdjustModal}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            校准基准资产
          </button>
        </div>

        {/* Accounts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {accountMetrics.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: acc.color }}
                  >
                    <CategoryIcon name={acc.iconName} size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">{acc.name}</h4>
                    <span className="text-[11px] text-neutral-600">
                      累计 {acc.transactionCount} 笔流水
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-neutral-600">当前余额</div>
                  <div className="text-base font-bold font-mono-numbers text-neutral-900">
                    ¥ {formatMoney(acc.estimatedBalance)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-200/60 text-xs">
                <div>
                  <span className="text-neutral-600 block text-[11px]">累计流入</span>
                  <span className="text-emerald-600 font-bold font-mono-numbers">
                    +¥ {formatMoney(acc.income)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600 block text-[11px]">累计流出</span>
                  <span className="text-rose-600 font-bold font-mono-numbers">
                    -¥ {formatMoney(acc.expense)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
