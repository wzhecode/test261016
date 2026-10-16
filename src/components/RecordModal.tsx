import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Calendar, Plus, Wallet, FileText, Sparkles } from 'lucide-react';
import { Transaction, TransactionType, Category, AccountId } from '../types/ledger';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_ACCOUNTS } from '../utils/constants';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  editingTransaction?: Transaction | null;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  onAddCategory,
  editingTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<AccountId>('wechat');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatIcon, setNewCatIcon] = useState<string>('Tag');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form state when opened or editing
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmountStr(editingTransaction.amount.toString());
        setSelectedCategoryId(editingTransaction.categoryId);
        setSelectedAccountId(editingTransaction.accountId);
        setDate(editingTransaction.date);
        setNote(editingTransaction.note || '');
      } else {
        const today = new Date().toISOString().split('T')[0];
        setType('expense');
        setAmountStr('');
        setDate(today);
        setNote('');
        // select first category of expense
        const defaultCat = categories.find((c) => c.type === 'expense');
        if (defaultCat) setSelectedCategoryId(defaultCat.id);
        setSelectedAccountId('wechat');
      }
      setShowAddCategory(false);
      setErrorMsg('');

      // Focus amount input
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, editingTransaction, categories]);

  // When type changes, ensure category matches the current type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = categories.filter((c) => c.type === newType);
    if (available.length > 0) {
      setSelectedCategoryId(available[0].id);
    }
  };

  // Filtered categories
  const activeCategories = categories.filter((c) => c.type === type);

  // Quick preset amount increment
  const handleAddAmount = (add: number) => {
    const cur = parseFloat(amountStr) || 0;
    const next = (cur + add).toFixed(cur % 1 === 0 && add % 1 === 0 ? 0 : 2);
    setAmountStr(next);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr);
    if (!val || isNaN(val) || val <= 0) {
      setErrorMsg('请输入有效的正数金额');
      amountInputRef.current?.focus();
      return;
    }

    const category = categories.find((c) => c.id === selectedCategoryId) || activeCategories[0];
    if (!category) {
      setErrorMsg('请选择一个分类');
      return;
    }

    const nowTime = new Date().toTimeString().slice(0, 5);

    onSave(
      {
        type,
        amount: Math.round(val * 100) / 100,
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.iconName,
        accountId: selectedAccountId,
        date: date || new Date().toISOString().split('T')[0],
        time: editingTransaction?.time || nowTime,
        note: note.trim(),
      },
      editingTransaction?.id
    );

    onClose();
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: `custom_${Date.now()}`,
      name: newCatName.trim(),
      type,
      iconName: newCatIcon,
      color: type === 'expense' ? '#F43F5E' : '#10B981',
      isCustom: true,
    };

    onAddCategory(newCat);
    setSelectedCategoryId(newCat.id);
    setNewCatName('');
    setShowAddCategory(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900">
              {editingTransaction ? '编辑账目明细' : '记一笔'}
            </h2>
            <span className="text-xs text-neutral-600">
              {type === 'expense' ? '记录日常消费' : '记录收入进账'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 1. Transaction Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              支出 (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              收入 (Income)
            </button>
          </div>

          {/* 2. Amount Input Box */}
          <div className="relative">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              记账金额
            </label>
            <div className="relative flex items-center">
              <span
                className={`absolute left-4 text-2xl font-bold ${
                  type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                ¥
              </span>
              <input
                ref={amountInputRef}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setErrorMsg('');
                }}
                className={`w-full pl-10 pr-4 py-3 text-3xl font-bold font-mono-numbers rounded-xl border bg-neutral-50/50 focus:bg-white transition-all outline-none ${
                  errorMsg
                    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                } ${type === 'expense' ? 'text-neutral-900' : 'text-neutral-900'}`}
              />
            </div>
            {errorMsg && <p className="mt-1 text-xs text-red-500">{errorMsg}</p>}

            {/* Quick Amount Preset Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-xs">
              <span className="text-neutral-600 text-[11px] shrink-0">快捷:</span>
              {[10, 20, 50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmount(val)}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md font-mono-numbers shrink-0 transition-colors"
                >
                  +{val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2 py-1 text-neutral-600 hover:text-neutral-800 text-[11px] shrink-0 transition-colors ml-auto"
              >
                清空
              </button>
            </div>
          </div>

          {/* 3. Category Selector Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-neutral-600">
                选择分类
              </label>
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-xs text-neutral-700 hover:text-neutral-950 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddCategory ? '收起自定义' : '新建分类'}</span>
              </button>
            </div>

            {/* Add Custom Category Form */}
            {showAddCategory && (
              <div className="mb-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                <span className="text-xs font-medium text-neutral-700">添加自定义分类</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="分类名称（如：奶茶咖啡）"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-neutral-200 bg-white outline-none focus:border-neutral-900"
                    maxLength={10}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCatName.trim()}
                    className="px-3 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg disabled:opacity-40 transition-opacity whitespace-nowrap"
                  >
                    添加
                  </button>
                </div>
              </div>
            )}

            {/* Category Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
              {activeCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-100 bg-neutral-50/70 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                        isSelected ? 'bg-white/20 text-white' : 'text-neutral-700'
                      }`}
                    >
                      <CategoryIcon name={cat.iconName} size={16} />
                    </div>
                    <span className="text-[11px] font-medium truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Account Selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              支出/结算账户
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEFAULT_ACCOUNTS.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-100 text-neutral-900 font-semibold'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <CategoryIcon name={acc.iconName} size={14} className="shrink-0" />
                    <span className="truncate">{acc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Date & Note Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-600">记账日期</label>
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDate(new Date().toISOString().split('T')[0])}
                    className="text-neutral-500 hover:text-neutral-900"
                  >
                    今天
                  </button>
                  <span className="text-neutral-300">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      setDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-neutral-500 hover:text-neutral-900"
                  >
                    昨天
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono-numbers rounded-lg border border-neutral-200 bg-white outline-none focus:border-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                备注说明（可选）
              </label>
              <input
                type="text"
                placeholder="例如：和朋友聚餐、买咖啡"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={40}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-white outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-lg shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? '保存修改' : '确认入账'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
