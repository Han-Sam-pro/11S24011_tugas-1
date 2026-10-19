import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowDownRight, 
  ArrowUpRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { RecurringRule, TransactionType, FrequencyType, Wallet } from '../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { formatRupiah, formatDateIndo, getTodayDateString } from '../utils/formatters';

interface AutomationManagerProps {
  rules: RecurringRule[];
  wallets: Wallet[];
  onToggleRule: (ruleId: string, isActive: boolean) => void;
  onSaveRule: (rule: Omit<RecurringRule, 'id' | 'createdAt'>, ruleId?: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onTriggerManualRun: () => void;
}

export const AutomationManager: React.FC<AutomationManagerProps> = ({
  rules,
  wallets,
  onToggleRule,
  onSaveRule,
  onDeleteRule,
  onTriggerManualRun,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('');
  const [walletId, setWalletId] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // 1 = Monday
  const [autoExecute, setAutoExecute] = useState(true);
  const [error, setError] = useState('');

  const walletMap = new Map(wallets.map(w => [w.id, w.name]));
  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setTitle('');
    setType('expense');
    setAmountStr('');
    setCategory(EXPENSE_CATEGORIES[0]?.name || '');
    setWalletId(wallets[0]?.id || '');
    setFrequency('monthly');
    setDayOfMonth(1);
    setDayOfWeek(1);
    setAutoExecute(true);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: RecurringRule) => {
    setEditingRule(rule);
    setTitle(rule.title);
    setType(rule.type);
    setAmountStr(String(rule.amount));
    setCategory(rule.category);
    setWalletId(rule.walletId);
    setFrequency(rule.frequency);
    setDayOfMonth(rule.dayOfMonth || 1);
    setDayOfWeek(rule.dayOfWeek || 1);
    setAutoExecute(rule.autoExecute);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (!title.trim()) {
      setError('Masukkan nama jadwal transaksi');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Masukkan nominal transaksi yang valid');
      return;
    }
    if (!category) {
      setError('Pilih kategori transaksi');
      return;
    }
    if (!walletId) {
      setError('Pilih dompet / rekening tujuan');
      return;
    }

    const today = getTodayDateString();
    const [y, m] = today.split('-');
    let nextDueDate = today;
    if (frequency === 'monthly') {
      nextDueDate = `${y}-${m}-${String(dayOfMonth).padStart(2, '0')}`;
    }

    onSaveRule(
      {
        title: title.trim(),
        type,
        amount,
        category,
        walletId,
        frequency,
        dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
        dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
        nextDueDate,
        lastRunDate: editingRule?.lastRunDate,
        isActive: true,
        autoExecute,
      },
      editingRule?.id
    );

    setIsModalOpen(false);
  };

  const daysOfWeekLabels = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <div className="space-y-6">
      {/* Top Banner Explaining the Engine */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Otomasi Pencatatan Harian & Rutin
              </h2>
              <p className="text-xs text-slate-600 max-w-xl mt-0.5 leading-relaxed">
                Sakuku secara otomatis mengevaluasi jadwal rutin Anda setiap hari. Tagihan bulanan, alokasi uang makan harian, 
                atau gaji otomatis dicatat ke buku kas begitu tanggal jatuh tempo tiba tanpa perlu repot mencatat ulang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={onTriggerManualRun}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
              title="Periksa dan catat transaksi yang jatuh tempo sekarang"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Jalankan Cek Hari Ini</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Aturan Rutin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Daftar Jadwal Transaksi Otomatis ({rules.length})
          </span>
          <span className="text-xs text-slate-500">
            Aktif: {rules.filter(r => r.isActive).length} aturan
          </span>
        </div>

        {rules.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada jadwal transaksi otomatis. Buat aturan pertama Anda sekarang.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rules.map(rule => {
              const isExp = rule.type === 'expense';
              return (
                <div
                  key={rule.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    rule.isActive ? 'hover:bg-slate-50/80' : 'bg-slate-50/40 opacity-60'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isExp ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isExp ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {rule.title}
                        </h4>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {rule.frequency === 'daily' && 'Harian (Setiap Hari)'}
                          {rule.frequency === 'weekly' && `Mingguan (Hari ${daysOfWeekLabels[rule.dayOfWeek ?? 1]})`}
                          {rule.frequency === 'monthly' && `Bulanan (Tanggal ${rule.dayOfMonth ?? 1})`}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-1">
                        <span>{rule.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{walletMap.get(rule.walletId) || rule.walletId}</span>
                        {rule.lastRunDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-indigo-600 font-medium">
                              Terakhir jalan: {formatDateIndo(rule.lastRunDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Nominal & Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                    <div className="text-right">
                      <div className={`font-mono font-bold tabular-nums text-sm ${isExp ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isExp ? '-' : '+'}
                        {formatRupiah(rule.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {rule.isActive ? 'Otomatis aktif' : 'Dinonaktifkan'}
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <button
                      onClick={() => onToggleRule(rule.id, !rule.isActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.isActive ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                      role="switch"
                      aria-checked={rule.isActive}
                      title={rule.isActive ? 'Klik untuk matikan' : 'Klik untuk aktifkan'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          rule.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(rule)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Ubah aturan"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus aturan otomatis "${rule.title}"?`)) {
                            onDeleteRule(rule.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Hapus aturan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add/Edit Rule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingRule ? 'Ubah Aturan Otomasi' : 'Tambah Jadwal Transaksi Otomatis'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Pengeluaran Rutin
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Pemasukan Rutin
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Nama Jadwal Transaksi
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="cth: Tagihan Listrik PLN, Uang Makan Siang, Gaji Bulanan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Nominal (IDR)
                </label>
                <div className="relative rounded-xl border border-slate-300 focus-within:border-indigo-500">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={amountStr ? parseInt(amountStr, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setAmountStr(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 text-base font-bold font-mono tabular-nums text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Frequency Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Frekuensi Eksekusi
                  </label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as FrequencyType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="daily">Harian (Setiap Hari)</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>

                {frequency === 'monthly' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Setiap Tanggal (1-31)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={dayOfMonth}
                      onChange={e => setDayOfMonth(Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none font-mono"
                    />
                  </div>
                )}

                {frequency === 'weekly' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Hari Setiap Minggu
                    </label>
                    <select
                      value={dayOfWeek}
                      onChange={e => setDayOfWeek(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                    >
                      {daysOfWeekLabels.map((dayName, idx) => (
                        <option key={idx} value={idx}>
                          {dayName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Category & Wallet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {currentCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Dompet Sumber / Tujuan
                  </label>
                  <select
                    value={walletId}
                    onChange={e => setWalletId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkbox auto execute */}
              <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoExecute}
                  onChange={e => setAutoExecute(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Eksekusi langsung ke buku transaksi tanpa perlu konfirmasi manual</span>
              </label>

              {error && (
                <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
