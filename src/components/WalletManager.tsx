import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  Building2, 
  Smartphone, 
  Plus, 
  ArrowRightLeft, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  CreditCard
} from 'lucide-react';
import { Wallet, WalletType } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface WalletManagerProps {
  wallets: Wallet[];
  onSaveWallet: (wallet: Omit<Wallet, 'id'>, id?: string) => void;
  onDeleteWallet: (id: string) => void;
  onTransfer: (sourceWalletId: string, destWalletId: string, amount: number, note?: string) => void;
}

export const WalletManager: React.FC<WalletManagerProps> = ({
  wallets,
  onSaveWallet,
  onDeleteWallet,
  onTransfer,
}) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  // Wallet form state
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [balanceStr, setBalanceStr] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#2563EB');

  // Transfer form state
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [transferAmountStr, setTransferAmountStr] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferError, setTransferError] = useState('');

  const handleOpenAddWallet = () => {
    setEditingWallet(null);
    setName('');
    setType('bank');
    setBalanceStr('');
    setAccountNumber('');
    setColor('#2563EB');
    setIsWalletModalOpen(true);
  };

  const handleOpenEditWallet = (w: Wallet) => {
    setEditingWallet(w);
    setName(w.name);
    setType(w.type);
    setBalanceStr(String(w.balance));
    setAccountNumber(w.accountNumber || '');
    setColor(w.color || '#2563EB');
    setIsWalletModalOpen(true);
  };

  const handleSaveWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const balance = parseInt(balanceStr.replace(/\D/g, ''), 10) || 0;

    onSaveWallet(
      {
        name: name.trim(),
        type,
        balance,
        accountNumber: accountNumber.trim() || undefined,
        color,
      },
      editingWallet?.id
    );

    setIsWalletModalOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromWalletId || !toWalletId || fromWalletId === toWalletId) {
      setTransferError('Pilih dompet asal dan dompet tujuan yang berbeda');
      return;
    }
    const amount = parseInt(transferAmountStr.replace(/\D/g, ''), 10);
    if (!amount || amount <= 0) {
      setTransferError('Masukkan nominal transfer yang valid');
      return;
    }

    const source = wallets.find(w => w.id === fromWalletId);
    if (source && source.balance < amount) {
      setTransferError(`Saldo ${source.name} tidak mencukupi (${formatRupiah(source.balance)})`);
      return;
    }

    onTransfer(fromWalletId, toWalletId, amount, transferNote.trim() || undefined);
    setIsTransferModalOpen(false);
    setTransferAmountStr('');
    setTransferNote('');
    setTransferError('');
  };

  const getWalletIcon = (wType: WalletType) => {
    switch (wType) {
      case 'bank': return <Building2 className="w-5 h-5" />;
      case 'ewallet': return <Smartphone className="w-5 h-5" />;
      default: return <WalletIcon className="w-5 h-5" />;
    }
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Dompet & Rekening Keuangan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola saldo tunai, rekening bank, serta e-wallet aktif Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          {wallets.length >= 2 && (
            <button
              onClick={() => {
                setFromWalletId(wallets[0]?.id || '');
                setToWalletId(wallets[1]?.id || '');
                setTransferAmountStr('');
                setTransferNote('');
                setTransferError('');
                setIsTransferModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Antar Dompet</span>
            </button>
          )}

          <button
            onClick={handleOpenAddWallet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Akun / Dompet</span>
          </button>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wallets.map(w => {
          const percentage = totalBalance > 0 ? Math.round((w.balance / totalBalance) * 100) : 0;
          return (
            <div
              key={w.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: w.color }}
                  >
                    {getWalletIcon(w.type)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditWallet(w)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="Ubah dompet"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {wallets.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus dompet "${w.name}"?`)) {
                            onDeleteWallet(w.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Hapus dompet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {w.name}
                </h3>
                {w.accountNumber && (
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {w.accountNumber}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">
                  Saldo Saat Ini
                </span>
                <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {formatRupiah(w.balance)}
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Porsi dari total:</span>
                  <span className="font-mono font-semibold text-slate-700">{percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wallet Edit/Add Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingWallet ? 'Ubah Informasi Dompet' : 'Tambah Dompet / Rekening'}
              </h3>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWalletSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Nama Dompet / Rekening
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="cth: Bank Mandiri, Dompet Tunai, OVO"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Jenis
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as WalletType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="bank">Rekening Bank</option>
                    <option value="cash">Tunai / Dompet Fisik</option>
                    <option value="ewallet">E-Wallet (GoPay/OVO/Dana)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Warna Kartu
                  </label>
                  <div className="flex items-center gap-2 py-1.5">
                    {['#2563EB', '#10B981', '#D97706', '#06B6D4', '#8B5CF6', '#EC4899'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                          color === c ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Nomor Rekening / HP (Opsional)
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="cth: 537-293-110 atau 0812-xxxx-xxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Saldo Saat Ini (IDR)
                </label>
                <div className="relative rounded-xl border border-slate-300">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={balanceStr ? parseInt(balanceStr, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setBalanceStr(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 text-base font-bold font-mono tabular-nums text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Simpan Dompet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Transfer Saldo Antar Dompet
              </h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Dari Dompet
                  </label>
                  <select
                    value={fromWalletId}
                    onChange={e => setFromWalletId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatRupiah(w.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Ke Dompet
                  </label>
                  <select
                    value={toWalletId}
                    onChange={e => setToWalletId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id} disabled={w.id === fromWalletId}>
                        {w.name} ({formatRupiah(w.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Nominal Transfer (IDR)
                </label>
                <div className="relative rounded-xl border border-slate-300">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={transferAmountStr ? parseInt(transferAmountStr, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setTransferAmountStr(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 text-base font-bold font-mono tabular-nums text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={e => setTransferNote(e.target.value)}
                  placeholder="cth: Tarik tunai ATM, Top up e-wallet"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              {transferError && (
                <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-lg">
                  {transferError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Kirim Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
