import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, Tag, Wallet as WalletIcon, FileText } from 'lucide-react';
import { Transaction, TransactionType, Wallet } from '../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { getTodayDateString, formatRupiah } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, saveAsTemplate?: boolean) => void;
  initialData?: Transaction | null;
  wallets: Wallet[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  wallets,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [saveAsTemplate, setSaveAsTemplate] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(String(initialData.amount));
      setCategory(initialData.category);
      setWalletId(initialData.walletId);
      setDate(initialData.date);
      setNote(initialData.note || '');
      setSaveAsTemplate(false);
    } else {
      setType('expense');
      setAmountStr('');
      setCategory(EXPENSE_CATEGORIES[0]?.name || '');
      setWalletId(wallets[0]?.id || '');
      setDate(getTodayDateString());
      setNote('');
      setSaveAsTemplate(false);
    }
    setError('');
  }, [initialData, isOpen, wallets]);

  useEffect(() => {
    // When switching type, reset category to first valid one
    if (!initialData) {
      const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      if (!availableCategories.some(c => c.name === category)) {
        setCategory(availableCategories[0]?.name || '');
      }
    }
  }, [type]);

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Masukkan jumlah nominal yang valid');
      return;
    }
    if (!category) {
      setError('Pilih kategori transaksi');
      return;
    }
    if (!walletId) {
      setError('Pilih dompet atau rekening sumber');
      return;
    }
    if (!date) {
      setError('Pilih tanggal transaksi');
      return;
    }

    onSave(
      {
        type,
        amount: parsedAmount,
        category,
        walletId,
        date,
        note: note.trim() || undefined,
        isAutomated: initialData?.isAutomated || false,
        recurringRuleId: initialData?.recurringRuleId,
      },
      saveAsTemplate
    );
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setAmountStr(rawVal);
    setError('');
  };

  const parsedAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'Ubah Catatan Transaksi' : 'Catat Transaksi Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector (Segmented control) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Jumlah Nominal (IDR)
            </label>
            <div className="relative rounded-xl border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 overflow-hidden transition-all">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                Rp
              </span>
              <input
                type="text"
                value={amountStr ? parseInt(amountStr, 10).toLocaleString('id-ID') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className="w-full pl-11 pr-4 py-3 text-xl font-bold font-mono tabular-nums text-slate-900 placeholder:text-slate-300 focus:outline-none"
              />
            </div>
            {parsedAmount > 0 && (
              <p className="mt-1 text-xs text-slate-500 font-mono">
                Terbaca: {formatRupiah(parsedAmount)}
              </p>
            )}
          </div>

          {/* Category & Wallet Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Kategori</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
              >
                {currentCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Wallet */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <WalletIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Dompet / Rekening</span>
              </label>
              <select
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Note Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Catatan (Opsional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="cth: Makan siang bakso urat"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Quick template checkbox (only for new transaction) */}
          {!initialData && (
            <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={e => setSaveAsTemplate(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Simpan transaksi ini sebagai tombol Template Cepat</span>
            </label>
          )}

          {error && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
              {error}
            </p>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {initialData ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
