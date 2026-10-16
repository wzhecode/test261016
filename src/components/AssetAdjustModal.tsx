import React, { useState, useEffect } from 'react';
import { X, Check, Wallet, Info } from 'lucide-react';

interface AssetAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTotalAsset: number;
  initialBaseAsset: number;
  totalIncome: number;
  totalExpense: number;
  onSaveBaseAsset: (newBaseAsset: number) => void;
}

export const AssetAdjustModal: React.FC<AssetAdjustModalProps> = ({
  isOpen,
  onClose,
  currentTotalAsset,
  initialBaseAsset,
  totalIncome,
  totalExpense,
  onSaveBaseAsset,
}) => {
  // Can either set target total asset directly or set base asset
  const [targetTotalStr, setTargetTotalStr] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTargetTotalStr(currentTotalAsset.toFixed(2));
    }
  }, [isOpen, currentTotalAsset]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetTotalStr);
    if (isNaN(target)) return;

    // targetTotal = newBaseAsset + totalIncome - totalExpense
    // => newBaseAsset = target - (totalIncome - totalExpense)
    const netFlow = totalIncome - totalExpense;
    const calculatedBase = target - netFlow;

    onSaveBaseAsset(calculatedBase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">校准当前总资产</h2>
              <span className="text-xs text-neutral-600">设置当前实际拥有的净资产总额</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              当前实际总资产 (¥)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-neutral-400">
                ¥
              </span>
              <input
                type="number"
                step="0.01"
                value={targetTotalStr}
                onChange={(e) => setTargetTotalStr(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-xl font-bold font-mono-numbers rounded-xl border border-neutral-200 focus:border-neutral-900 outline-none"
                placeholder="0.00"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-neutral-700">
              <Info className="w-3.5 h-3.5 text-neutral-500" />
              <span>资产计算原理</span>
            </div>
            <p>
              当前总资产 = 初始基准资产 + 历史总收入 (¥{totalIncome.toFixed(2)}) - 历史总支出 (¥{totalExpense.toFixed(2)})。
            </p>
            <p className="text-[11px] text-neutral-600">
              校准后，系统将自动对齐您的基础资产，后续每记一笔都将精准累计。
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>确认校准</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
