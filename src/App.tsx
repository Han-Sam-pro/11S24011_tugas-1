import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Navbar, 
  TabType 
} from './components/Navbar';
import { KPICards } from './components/KPICards';
import { QuickTemplatesBar } from './components/QuickTemplatesBar';
import { TransactionList } from './components/TransactionList';
import { MonthlyReport } from './components/MonthlyReport';
import { AutomationManager } from './components/AutomationManager';
import { WalletManager } from './components/WalletManager';
import { TransactionModal } from './components/TransactionModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import { 
  Transaction, 
  RecurringRule, 
  QuickTemplate, 
  Wallet 
} from './types/finance';

import { 
  loadStoredTransactions, 
  saveStoredTransactions,
  loadStoredRecurringRules,
  saveStoredRecurringRules,
  loadStoredTemplates,
  saveStoredTemplates,
  loadStoredWallets,
  saveStoredWallets,
  calculateMonthlyReport,
  resetAllData
} from './services/storage';

import { runAutomatedRecurringEngine } from './services/automationEngine';
import { 
  getCurrentYearMonthString, 
  formatMonthYear, 
  formatRupiah, 
  formatDateIndo, 
  getTodayDateString 
} from './utils/formatters';

import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight,
  Plus
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(getCurrentYearMonthString());
  
  // Data stores
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [templates, setTemplates] = useState<QuickTemplate[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Modals & feedback
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [autoRunCount, setAutoRunCount] = useState<number>(0);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initial load & seed
  useEffect(() => {
    const loadedTx = loadStoredTransactions();
    const loadedRules = loadStoredRecurringRules();
    const loadedTpl = loadStoredTemplates();
    const loadedWallets = loadStoredWallets();

    setTransactions(loadedTx);
    setRecurringRules(loadedRules);
    setTemplates(loadedTpl);
    setWallets(loadedWallets);
    setIsInitialized(true);
  }, []);

  // Run automated recurring transaction engine once stores are initialized
  useEffect(() => {
    if (!isInitialized) return;

    const result = runAutomatedRecurringEngine(recurringRules, wallets, transactions);

    if (result.executedCount > 0) {
      const mergedTransactions = [...transactions, ...result.newTransactions];
      setTransactions(mergedTransactions);
      saveStoredTransactions(mergedTransactions);

      setRecurringRules(result.updatedRules);
      saveStoredRecurringRules(result.updatedRules);

      setWallets(result.updatedWallets);
      saveStoredWallets(result.updatedWallets);

      setAutoRunCount(result.executedCount);

      addToast({
        type: 'info',
        title: 'Otomasi Berhasil Dijalankan',
        message: `${result.executedCount} transaksi rutin otomatis dicatat ke buku kas hari ini.`,
      });
    }
  }, [isInitialized]);

  // Total balance across all wallets
  const totalBalance = useMemo(() => {
    return wallets.reduce((acc, w) => acc + w.balance, 0);
  }, [wallets]);

  // Monthly report calculation
  const monthlyReport = useMemo(() => {
    return calculateMonthlyReport(selectedYearMonth, transactions);
  }, [selectedYearMonth, transactions]);

  // Manual Trigger for Automation Engine
  const handleTriggerManualAutomation = () => {
    const result = runAutomatedRecurringEngine(recurringRules, wallets, transactions);
    if (result.executedCount > 0) {
      const mergedTransactions = [...transactions, ...result.newTransactions];
      setTransactions(mergedTransactions);
      saveStoredTransactions(mergedTransactions);

      setRecurringRules(result.updatedRules);
      saveStoredRecurringRules(result.updatedRules);

      setWallets(result.updatedWallets);
      saveStoredWallets(result.updatedWallets);

      addToast({
        type: 'success',
        title: 'Pemeriksaan Otomasi Selesai',
        message: `Berhasil mencatat ${result.executedCount} transaksi berulang yang jatuh tempo.`,
      });
    } else {
      addToast({
        type: 'info',
        title: 'Semua Transaksi Sudah Tercatat',
        message: 'Tidak ada jadwal transaksi berulang yang jatuh tempo saat ini.',
      });
    }
  };

  // Execute quick template
  const handleExecuteTemplate = (template: QuickTemplate) => {
    const today = getTodayDateString();
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: template.type,
      amount: template.amount,
      category: template.category,
      walletId: template.walletId,
      date: today,
      note: `[Cepat] ${template.name}`,
      isAutomated: false,
      createdAt: Date.now(),
    };

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);
    saveStoredTransactions(updatedTxList);

    // Update wallet balance
    const updatedWallets = wallets.map(w => {
      if (w.id === template.walletId) {
        return {
          ...w,
          balance: template.type === 'income' ? w.balance + template.amount : w.balance - template.amount,
        };
      }
      return w;
    });
    setWallets(updatedWallets);
    saveStoredWallets(updatedWallets);

    addToast({
      type: 'success',
      title: `${template.name} Tercatat`,
      message: `${template.type === 'income' ? '+' : '-'}${formatRupiah(template.amount)} berhasil disimpan.`,
      onUndo: () => {
        // Undo this transaction
        setTransactions(prev => {
          const undone = prev.filter(t => t.id !== newTx.id);
          saveStoredTransactions(undone);
          return undone;
        });
        setWallets(prev => {
          const reverted = prev.map(w => {
            if (w.id === template.walletId) {
              return {
                ...w,
                balance: template.type === 'income' ? w.balance - template.amount : w.balance + template.amount,
              };
            }
            return w;
          });
          saveStoredWallets(reverted);
          return reverted;
        });
        addToast({
          type: 'info',
          title: 'Dibatalkan',
          message: `Transaksi ${template.name} telah dibatalkan.`,
        });
      },
    });
  };

  // Save transaction (add or edit)
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    saveAsTemplate?: boolean
  ) => {
    if (editingTransaction) {
      // Revert previous wallet impact
      let tempWallets = wallets.map(w => {
        if (w.id === editingTransaction.walletId) {
          return {
            ...w,
            balance: editingTransaction.type === 'income' 
              ? w.balance - editingTransaction.amount 
              : w.balance + editingTransaction.amount,
          };
        }
        return w;
      });

      // Apply new wallet impact
      tempWallets = tempWallets.map(w => {
        if (w.id === txData.walletId) {
          return {
            ...w,
            balance: txData.type === 'income' ? w.balance + txData.amount : w.balance - txData.amount,
          };
        }
        return w;
      });

      const updatedList = transactions.map(t => {
        if (t.id === editingTransaction.id) {
          return {
            ...t,
            ...txData,
          };
        }
        return t;
      });

      setTransactions(updatedList);
      saveStoredTransactions(updatedList);
      setWallets(tempWallets);
      saveStoredWallets(tempWallets);

      addToast({
        type: 'success',
        title: 'Transaksi Diperbarui',
        message: 'Perubahan data transaksi berhasil disimpan.',
      });
    } else {
      const newTx: Transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...txData,
        createdAt: Date.now(),
      };

      const updatedList = [newTx, ...transactions];
      setTransactions(updatedList);
      saveStoredTransactions(updatedList);

      const updatedWallets = wallets.map(w => {
        if (w.id === txData.walletId) {
          return {
            ...w,
            balance: txData.type === 'income' ? w.balance + txData.amount : w.balance - txData.amount,
          };
        }
        return w;
      });
      setWallets(updatedWallets);
      saveStoredWallets(updatedWallets);

      // If requested to save as template
      if (saveAsTemplate) {
        const newTemplate: QuickTemplate = {
          id: `tpl_${Date.now()}`,
          name: txData.note || txData.category,
          type: txData.type,
          amount: txData.amount,
          category: txData.category,
          walletId: txData.walletId,
          icon: 'Tag',
        };
        const updatedTpl = [...templates, newTemplate];
        setTemplates(updatedTpl);
        saveStoredTemplates(updatedTpl);
      }

      addToast({
        type: 'success',
        title: 'Transaksi Berhasil Dicatat',
        message: `${formatRupiah(txData.amount)} berhasil masuk ke buku kas.`,
      });
    }

    setEditingTransaction(null);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    // Revert wallet balance
    const updatedWallets = wallets.map(w => {
      if (w.id === target.walletId) {
        return {
          ...w,
          balance: target.type === 'income' ? w.balance - target.amount : w.balance + target.amount,
        };
      }
      return w;
    });

    const updatedTx = transactions.filter(t => t.id !== id);
    setTransactions(updatedTx);
    saveStoredTransactions(updatedTx);
    setWallets(updatedWallets);
    saveStoredWallets(updatedWallets);

    addToast({
      type: 'info',
      title: 'Transaksi Dihapus',
      message: 'Data transaksi telah dihapus dari buku kas.',
    });
  };

  // Recurring Rule Handlers
  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    const updated = recurringRules.map(r => r.id === ruleId ? { ...r, isActive } : r);
    setRecurringRules(updated);
    saveStoredRecurringRules(updated);
    addToast({
      type: 'info',
      title: isActive ? 'Aturan Diaktifkan' : 'Aturan Dinonaktifkan',
    });
  };

  const handleSaveRule = (ruleData: Omit<RecurringRule, 'id' | 'createdAt'>, ruleId?: string) => {
    if (ruleId) {
      const updated = recurringRules.map(r => r.id === ruleId ? { ...r, ...ruleData } : r);
      setRecurringRules(updated);
      saveStoredRecurringRules(updated);
      addToast({ type: 'success', title: 'Aturan Otomasi Diperbarui' });
    } else {
      const newRule: RecurringRule = {
        id: `rule_${Date.now()}`,
        ...ruleData,
        createdAt: Date.now(),
      };
      const updated = [...recurringRules, newRule];
      setRecurringRules(updated);
      saveStoredRecurringRules(updated);
      addToast({ type: 'success', title: 'Aturan Otomasi Baru Ditambahkan' });
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = recurringRules.filter(r => r.id !== ruleId);
    setRecurringRules(updated);
    saveStoredRecurringRules(updated);
    addToast({ type: 'info', title: 'Aturan Otomasi Dihapus' });
  };

  // Wallet Handlers
  const handleSaveWallet = (walletData: Omit<Wallet, 'id'>, walletId?: string) => {
    if (walletId) {
      const updated = wallets.map(w => w.id === walletId ? { ...w, ...walletData } : w);
      setWallets(updated);
      saveStoredWallets(updated);
      addToast({ type: 'success', title: 'Dompet Diperbarui' });
    } else {
      const newWallet: Wallet = {
        id: `w_${Date.now()}`,
        ...walletData,
      };
      const updated = [...wallets, newWallet];
      setWallets(updated);
      saveStoredWallets(updated);
      addToast({ type: 'success', title: 'Dompet Baru Ditambahkan' });
    }
  };

  const handleDeleteWallet = (walletId: string) => {
    const updated = wallets.filter(w => w.id !== walletId);
    setWallets(updated);
    saveStoredWallets(updated);
    addToast({ type: 'info', title: 'Dompet Dihapus' });
  };

  const handleTransfer = (sourceId: string, destId: string, amount: number, note?: string) => {
    const source = wallets.find(w => w.id === sourceId);
    const dest = wallets.find(w => w.id === destId);
    if (!source || !dest) return;

    const today = getTodayDateString();
    const txOut: Transaction = {
      id: `tx_trf_out_${Date.now()}`,
      type: 'expense',
      amount,
      category: 'Lainnya',
      walletId: sourceId,
      date: today,
      note: note ? `Transfer keluar ke ${dest.name}: ${note}` : `Transfer keluar ke ${dest.name}`,
      isAutomated: false,
      createdAt: Date.now(),
    };
    const txIn: Transaction = {
      id: `tx_trf_in_${Date.now() + 1}`,
      type: 'income',
      amount,
      category: 'Pemasukan Lain',
      walletId: destId,
      date: today,
      note: note ? `Transfer masuk dari ${source.name}: ${note}` : `Transfer masuk dari ${source.name}`,
      isAutomated: false,
      createdAt: Date.now() + 1,
    };

    const updatedTx = [txIn, txOut, ...transactions];
    setTransactions(updatedTx);
    saveStoredTransactions(updatedTx);

    const updatedWallets = wallets.map(w => {
      if (w.id === sourceId) return { ...w, balance: w.balance - amount };
      if (w.id === destId) return { ...w, balance: w.balance + amount };
      return w;
    });
    setWallets(updatedWallets);
    saveStoredWallets(updatedWallets);

    addToast({
      type: 'success',
      title: 'Transfer Sukses',
      message: `${formatRupiah(amount)} dipindahkan dari ${source.name} ke ${dest.name}.`,
    });
  };

  // Template Handlers
  const handleSaveTemplate = (tpl: QuickTemplate) => {
    const exists = templates.some(t => t.id === tpl.id);
    let updated: QuickTemplate[];
    if (exists) {
      updated = templates.map(t => t.id === tpl.id ? tpl : t);
    } else {
      updated = [...templates, tpl];
    }
    setTemplates(updated);
    saveStoredTemplates(updated);
    addToast({ type: 'success', title: 'Template Disimpan' });
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveStoredTemplates(updated);
    addToast({ type: 'info', title: 'Template Dihapus' });
  };

  const handleResetData = () => {
    if (confirm('Kembalikan semua data ke pengaturan dan simulasi awal Sakuku?')) {
      const reset = resetAllData();
      setTransactions(reset.transactions);
      setRecurringRules(reset.recurringRules);
      setTemplates(reset.templates);
      setWallets(reset.wallets);
      addToast({
        type: 'info',
        title: 'Data Direset',
        message: 'Data simulasi keuangan telah dipulihkan.',
      });
    }
  };

  const walletMap = useMemo(() => new Map(wallets.map(w => [w.id, w.name])), [wallets]);
  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        automatedNotificationCount={autoRunCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* DASHBOARD TAB */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards Strip */}
            <KPICards
              totalBalance={totalBalance}
              report={monthlyReport}
              monthName={formatMonthYear(selectedYearMonth)}
            />

            {/* Quick 1-Click Templates Bar */}
            <QuickTemplatesBar
              templates={templates}
              wallets={wallets}
              onExecuteTemplate={handleExecuteTemplate}
              onOpenTemplateManager={() => setIsTemplateModalOpen(true)}
            />

            {/* 2-Column Split: Recent Ledger & Monthly Analytics Teaser */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recent Transactions Ledger */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Transaksi Terbaru
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Catatan pemasukan & pengeluaran hari ini dan sebelumnya
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('transactions')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Belum ada transaksi tercatat.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentTransactions.map(tx => {
                      const isExp = tx.type === 'expense';
                      return (
                        <div
                          key={tx.id}
                          className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isExp ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                              }`}
                            >
                              {isExp ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{tx.note || tx.category}</span>
                                {tx.isAutomated && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                                    <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                                    Otomatis
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>{formatDateIndo(tx.date)}</span>
                                <span aria-hidden="true">·</span>
                                <span>{tx.category}</span>
                                <span aria-hidden="true">·</span>
                                <span className="text-slate-400">{walletMap.get(tx.walletId) || tx.walletId}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`font-mono font-bold tabular-nums text-xs whitespace-nowrap ${isExp ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isExp ? '-' : '+'}
                            {formatRupiah(tx.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Monthly Snapshot & Wallets */}
              <div className="lg:col-span-5 space-y-6">
                {/* Monthly Health Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>Arus Kas Bulan Ini</span>
                    </h3>
                    <button
                      onClick={() => setCurrentTab('reports')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Buka Laporan
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Pemasukan Bulan Ini</span>
                      <span className="font-mono font-bold text-emerald-600 tabular-nums">
                        {formatRupiah(monthlyReport.totalIncome)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Pengeluaran Bulan Ini</span>
                      <span className="font-mono font-bold text-rose-600 tabular-nums">
                        {formatRupiah(monthlyReport.totalExpense)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Net Arus Kas</span>
                      <span className={`font-mono tabular-nums ${monthlyReport.netCashflow >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        {formatRupiah(monthlyReport.netCashflow, { withSign: true })}
                      </span>
                    </div>
                  </div>

                  {/* Top Spending Category Preview */}
                  {monthlyReport.expenseCategories.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Pengeluaran Terbesar:
                      </div>
                      <div className="space-y-2">
                        {monthlyReport.expenseCategories.slice(0, 3).map(cat => (
                          <div key={cat.category} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className="text-slate-700">{cat.category}</span>
                            </div>
                            <span className="font-mono text-slate-600 tabular-nums font-medium">
                              {cat.percentage}% ({formatRupiah(cat.amount)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Wallets Quick Snapshot */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Rekap Dompet & Rekening
                    </h3>
                    <button
                      onClick={() => setCurrentTab('wallets')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Kelola
                    </button>
                  </div>

                  <div className="space-y-2">
                    {wallets.map(w => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }} />
                          <span className="font-semibold text-slate-800">{w.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatRupiah(w.balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {currentTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            wallets={wallets}
            onEditTransaction={tx => {
              setEditingTransaction(tx);
              setIsTransactionModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
          />
        )}

        {/* MONTHLY REPORT TAB */}
        {currentTab === 'reports' && (
          <MonthlyReport
            report={monthlyReport}
            allTransactions={transactions}
            wallets={wallets}
            selectedYearMonth={selectedYearMonth}
            onSelectYearMonth={setSelectedYearMonth}
          />
        )}

        {/* AUTOMATION TAB */}
        {currentTab === 'automation' && (
          <AutomationManager
            rules={recurringRules}
            wallets={wallets}
            onToggleRule={handleToggleRule}
            onSaveRule={handleSaveRule}
            onDeleteRule={handleDeleteRule}
            onTriggerManualRun={handleTriggerManualAutomation}
          />
        )}

        {/* WALLETS TAB */}
        {currentTab === 'wallets' && (
          <WalletManager
            wallets={wallets}
            onSaveWallet={handleSaveWallet}
            onDeleteWallet={handleDeleteWallet}
            onTransfer={handleTransfer}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-indigo-700 tracking-tight">Sakuku</span>
            <span aria-hidden="true">·</span>
            <span>Aplikasi Pengaturan Keuangan Harian & Bulanan Otomatis</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Reset data ke simulasi awal"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tersimpan di Browser Anda</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        wallets={wallets}
      />

      <TemplateManagerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={templates}
        wallets={wallets}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
