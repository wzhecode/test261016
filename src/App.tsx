/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { OverviewCards } from './components/OverviewCards';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';
import { AccountsView } from './components/AccountsView';
import { RecordModal } from './components/RecordModal';
import { AssetAdjustModal } from './components/AssetAdjustModal';
import { Toast, ToastMessage } from './components/Toast';
import { Plus } from 'lucide-react';

import {
  Transaction,
  LedgerConfig,
  Category,
  MonthSummary,
} from './types/ledger';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from './utils/constants';
import {
  loadTransactions,
  saveTransactions,
  loadConfig,
  saveConfig,
  loadCustomCategories,
  saveCustomCategories,
  exportToCSV,
  resetToDemo,
  clearData,
} from './utils/storage';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [config, setConfig] = useState<LedgerConfig>(loadConfig);
  const [customCategories, setCustomCategories] = useState<Category[]>(loadCustomCategories);
  const [currentTab, setCurrentTab] = useState<'transactions' | 'analytics' | 'accounts'>(
    'transactions'
  );

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number }>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAssetAdjustModalOpen, setIsAssetAdjustModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize transactions from localStorage
  useEffect(() => {
    const loaded = loadTransactions();
    setTransactions(loaded);
  }, []);

  // Show Toast Helper
  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Combine standard and custom categories
  const allCategories = useMemo(() => {
    return [
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...DEFAULT_INCOME_CATEGORIES,
      ...customCategories,
    ];
  }, [customCategories]);

  // Overall calculations for Total Assets
  const { allIncome, allExpense, totalAssets } = useMemo(() => {
    let incomeSum = 0;
    let expenseSum = 0;
    for (const t of transactions) {
      if (t.type === 'income') incomeSum += t.amount;
      else expenseSum += t.amount;
    }
    const net = incomeSum - expenseSum;
    return {
      allIncome: incomeSum,
      allExpense: expenseSum,
      totalAssets: config.initialBaseAsset + net,
    };
  }, [transactions, config.initialBaseAsset]);

  // Monthly Summary calculations
  const monthSummary: MonthSummary = useMemo(() => {
    const monthStr = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`;
    const monthlyList = transactions.filter((t) => t.date.startsWith(monthStr));

    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of monthlyList) {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    }

    const isCurrent =
      selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth() + 1;
    const daysDivider = isCurrent
      ? Math.max(1, now.getDate())
      : new Date(selectedMonth.year, selectedMonth.month, 0).getDate();

    return {
      year: selectedMonth.year,
      month: selectedMonth.month,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: monthlyList.length,
      dailyAverageExpense: totalExpense / daysDivider,
    };
  }, [transactions, selectedMonth, now]);

  // Handlers for Transactions
  const handleSaveTransaction = (
    transactionData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Transaction[];
    if (existingId) {
      // Editing existing
      updated = transactions.map((t) =>
        t.id === existingId ? { ...t, ...transactionData } : t
      );
      showToast('已更新账目记录');
    } else {
      // New transaction
      const newTransaction: Transaction = {
        ...transactionData,
        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      updated = [newTransaction, ...transactions];
      showToast(
        `记下了一笔 ${transactionData.type === 'expense' ? '支出' : '收入'} ¥${transactionData.amount.toFixed(2)}`
      );
    }

    setTransactions(updated);
    saveTransactions(updated);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
    showToast('记录已删除', 'info');
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsRecordModalOpen(true);
  };

  // Add custom category
  const handleAddCategory = (newCat: Category) => {
    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    saveCustomCategories(updated);
    showToast(`新建分类「${newCat.name}」成功`);
  };

  // Base asset adjustment
  const handleSaveBaseAsset = (newBase: number) => {
    const newConfig = { ...config, initialBaseAsset: newBase };
    setConfig(newConfig);
    saveConfig(newConfig);
    showToast('总资产基准已成功校准');
  };

  // Monthly Budget update
  const handleUpdateBudget = (newBudget: number) => {
    const newConfig = { ...config, monthlyBudget: newBudget };
    setConfig(newConfig);
    saveConfig(newConfig);
    showToast(`月度预算已设置为 ¥${newBudget.toFixed(2)}`);
  };

  // Toggle hide amounts
  const handleToggleHideAmounts = () => {
    const newConfig = { ...config, hideAssetAmounts: !config.hideAssetAmounts };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  // Month shifting
  const handleMonthChange = (diff: number) => {
    setSelectedMonth((prev) => {
      let nextMonth = prev.month + diff;
      let nextYear = prev.year;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      } else if (nextMonth < 1) {
        nextMonth = 12;
        nextYear -= 1;
      }
      return { year: nextYear, month: nextMonth };
    });
  };

  const handleResetToCurrentMonth = () => {
    setSelectedMonth({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  };

  // Export & Import
  const handleExportCSV = () => {
    const csv = exportToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `极简记账_导出_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出 CSV 格式数据');
  };

  const handleExportJSON = () => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      config,
      customCategories,
      transactions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `极简记账_备份_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出 JSON 完整备份');
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
          saveTransactions(parsed.transactions);
          if (parsed.config) {
            setConfig(parsed.config);
            saveConfig(parsed.config);
          }
          if (Array.isArray(parsed.customCategories)) {
            setCustomCategories(parsed.customCategories);
            saveCustomCategories(parsed.customCategories);
          }
          showToast(`已成功导入 ${parsed.transactions.length} 条记录`);
        } else {
          showToast('导入文件格式不正确', 'error');
        }
      } catch (err) {
        showToast('解析 JSON 文件失败', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    const demo = resetToDemo();
    setTransactions(demo);
    showToast('已恢复预设示例账本数据');
  };

  const handleClearAll = () => {
    clearData();
    setTransactions([]);
    showToast('所有流水已清空', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      {/* 1. Header with Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenRecordModal={() => {
          setEditingTransaction(null);
          setIsRecordModalOpen(true);
        }}
        onOpenAssetAdjustModal={() => setIsAssetAdjustModalOpen(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onResetDemo={handleResetDemo}
        onClearAll={handleClearAll}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onResetToCurrentMonth={handleResetToCurrentMonth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 2. Overview Cards (当前总资产, 本月支出, 本月收入) */}
        <OverviewCards
          totalAssets={totalAssets}
          monthSummary={monthSummary}
          hideAmounts={config.hideAssetAmounts}
          onToggleHideAmounts={handleToggleHideAmounts}
          onOpenAssetAdjustModal={() => setIsAssetAdjustModalOpen(true)}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          onResetToCurrentMonth={handleResetToCurrentMonth}
        />

        {/* 3. Tab Contents */}
        {currentTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            categories={allCategories}
            selectedMonth={selectedMonth}
            onEdit={handleEditClick}
            onDelete={handleDeleteTransaction}
            onOpenRecordModal={() => {
              setEditingTransaction(null);
              setIsRecordModalOpen(true);
            }}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            categories={allCategories}
            selectedMonth={selectedMonth}
            monthSummary={monthSummary}
            monthlyBudget={config.monthlyBudget}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {currentTab === 'accounts' && (
          <AccountsView
            transactions={transactions}
            initialBaseAsset={config.initialBaseAsset}
            totalAssets={totalAssets}
            hideAmounts={config.hideAssetAmounts}
            onOpenAssetAdjustModal={() => setIsAssetAdjustModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Action Button for Mobile Users */}
      <div className="fixed bottom-6 right-6 md:hidden z-30">
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsRecordModalOpen(true);
          }}
          aria-label="记一笔"
          className="w-14 h-14 bg-neutral-900 text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Modals & Dialogs */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={allCategories}
        onAddCategory={handleAddCategory}
        editingTransaction={editingTransaction}
      />

      <AssetAdjustModal
        isOpen={isAssetAdjustModalOpen}
        onClose={() => setIsAssetAdjustModalOpen(false)}
        currentTotalAsset={totalAssets}
        initialBaseAsset={config.initialBaseAsset}
        totalIncome={allIncome}
        totalExpense={allExpense}
        onSaveBaseAsset={handleSaveBaseAsset}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
