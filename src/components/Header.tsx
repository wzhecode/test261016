import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Upload, RotateCcw, Trash2, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentTab: 'transactions' | 'analytics' | 'accounts';
  onTabChange: (tab: 'transactions' | 'analytics' | 'accounts') => void;
  onOpenRecordModal: () => void;
  onOpenAssetAdjustModal: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onResetDemo: () => void;
  onClearAll: () => void;
  selectedMonth: { year: number; month: number };
  onMonthChange: (diff: number) => void;
  onResetToCurrentMonth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenRecordModal,
  onOpenAssetAdjustModal,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onResetDemo,
  onClearAll,
  selectedMonth,
  onMonthChange,
  onResetToCurrentMonth,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const isCurrentMonth =
    selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth() + 1;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xl font-bold tracking-tight text-neutral-900 whitespace-nowrap">
              极简记账
            </span>
            <span className="hidden sm:inline-block text-xs font-mono tracking-wider text-neutral-600 uppercase">
              SimpleLedger
            </span>
          </div>

          {/* Zone 2: Navigation Links / View Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange('transactions')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                currentTab === 'transactions'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              流水明细
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                currentTab === 'analytics'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              收支统计
            </button>
            <button
              onClick={() => onTabChange('accounts')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                currentTab === 'accounts'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              账户资产
            </button>
          </nav>

          {/* Zone 3: Actions - Primary '记一笔' button + Data utilities */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Primary Action Button */}
            <button
              onClick={onOpenRecordModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>记一笔</span>
            </button>

            {/* Overflow & Data Management */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                title="数据与设置"
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-40 text-xs text-neutral-700 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => {
                      onOpenAssetAdjustModal();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                    <span>设置资产基准</span>
                  </button>
                  <div className="my-1 border-t border-neutral-100" />
                  <button
                    onClick={() => {
                      onExportCSV();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                    <span>导出 CSV 表格</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportJSON();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                    <span>备份 JSON 数据</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-neutral-500" />
                    <span>导入 JSON 备份</span>
                  </button>
                  <div className="my-1 border-t border-neutral-100" />
                  <button
                    onClick={() => {
                      onResetDemo();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 text-neutral-600 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                    <span>恢复示例数据</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确认清空所有记账数据？此操作不可逆。')) {
                        onClearAll();
                        setMenuOpen(false);
                      }
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>清空所有数据</span>
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
