import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Download,
  Filter,
  Plus
} from 'lucide-react';
import { Transaction, Wallet } from '../types/finance';
import { formatRupiah, formatDateIndo, exportTransactionsToCSV } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  wallets,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [walletFilter, setWalletFilter] = useState<string>('all');
  const [autoFilter, setAutoFilter] = useState<'all' | 'auto' | 'manual'>('all');

  const walletMap = useMemo(() => new Map(wallets.map(w => [w.id, w.name])), [wallets]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      // Wallet filter
      if (walletFilter !== 'all' && t.walletId !== walletFilter) return false;
      // Auto filter
      if (autoFilter === 'auto' && !t.isAutomated) return false;
      if (autoFilter === 'manual' && t.isAutomated) return false;
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCategory = t.category.toLowerCase().includes(query);
        const matchesNote = (t.note || '').toLowerCase().includes(query);
        const matchesWallet = (walletMap.get(t.walletId) || '').toLowerCase().includes(query);
        const matchesDate = t.date.includes(query);
        if (!matchesCategory && !matchesNote && !matchesWallet && !matchesDate) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // Sort newest date first, then newest createdAt
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });
  }, [transactions, typeFilter, walletFilter, autoFilter, searchTerm, walletMap]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari transaksi berdasarkan catatan, kategori, dompet..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={() => exportTransactionsToCSV(filteredTransactions, wallets)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Unduh data dalam format CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Catat Baru</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Type Segmented Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Jenis
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === 'expense' ? 'bg-rose-50 text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === 'income' ? 'bg-emerald-50 text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Secondary Filters: Wallet & Automated */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Dompet:</span>
            </div>
            <select
              value={walletFilter}
              onChange={e => setWalletFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Dompet</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={autoFilter}
              onChange={e => setAutoFilter(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Sumber</option>
              <option value="auto">Hanya Otomatis</option>
              <option value="manual">Hanya Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              Tidak ada catatan transaksi ditemukan
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || typeFilter !== 'all' || walletFilter !== 'all'
                ? 'Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.'
                : 'Mulai kelola keuangan harianmu dengan mencatat transaksi pertama sekarang.'}
            </p>
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              + Catat Transaksi Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">Tanggal</th>
                  <th scope="col" className="px-4 py-3">Transaksi & Kategori</th>
                  <th scope="col" className="px-4 py-3">Dompet</th>
                  <th scope="col" className="px-4 py-3 text-right">Nominal</th>
                  <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(tx => {
                  const isExp = tx.type === 'expense';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Tanggal */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-slate-500 font-mono">
                        {formatDateIndo(tx.date)}
                      </td>

                      {/* Transaksi & Kategori (Zero-Pill Metadata) */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isExp ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            {isExp ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span>{tx.note || tx.category}</span>
                              {tx.isAutomated && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-xs leading-none">
                                  <Sparkles className="w-3 h-3 text-indigo-500" />
                                  Otomatis
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{tx.category}</span>
                              {tx.note && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-slate-400">Catatan tersimpan</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dompet */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {walletMap.get(tx.walletId) || tx.walletId}
                      </td>

                      {/* Nominal */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-bold tabular-nums text-sm">
                        <span className={isExp ? 'text-rose-600' : 'text-emerald-600'}>
                          {isExp ? '-' : '+'}
                          {formatRupiah(tx.amount)}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Ubah transaksi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Yakin ingin menghapus transaksi ini?')) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary Strip */}
        {filteredTransactions.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Menampilkan {filteredTransactions.length} transaksi
            </span>
            <span className="font-mono tabular-nums">
              Total tercatat: {formatRupiah(
                filteredTransactions.reduce((acc, curr) => 
                  acc + (curr.type === 'income' ? curr.amount : -curr.amount), 0
                ),
                { withSign: true }
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
