import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Tag, Utensils, Coffee, Car, Fuel, ShoppingBag, Smartphone, Briefcase } from 'lucide-react';
import { QuickTemplate, Wallet, TransactionType } from '../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { formatRupiah } from '../utils/formatters';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: QuickTemplate[];
  wallets: Wallet[];
  onSaveTemplate: (template: QuickTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Utensils', label: 'Makanan' },
  { name: 'Coffee', label: 'Kopi / Minuman' },
  { name: 'Car', label: 'Mobil / Parkir' },
  { name: 'Fuel', label: 'Bensin' },
  { name: 'ShoppingBag', label: 'Belanja' },
  { name: 'Smartphone', label: 'Pulsa / Data' },
  { name: 'Briefcase', label: 'Kerja' },
  { name: 'Tag', label: 'Lainnya' },
];

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  templates,
  wallets,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [editingTemplate, setEditingTemplate] = useState<QuickTemplate | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]?.name || '');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [icon, setIcon] = useState('Utensils');
  const [isFormVisible, setIsFormVisible] = useState(false);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setName('');
    setType('expense');
    setAmountStr('25000');
    setCategory(EXPENSE_CATEGORIES[0]?.name || '');
    setWalletId(wallets[0]?.id || '');
    setIcon('Utensils');
    setIsFormVisible(true);
  };

  const handleOpenEdit = (tpl: QuickTemplate) => {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setType(tpl.type);
    setAmountStr(String(tpl.amount));
    setCategory(tpl.category);
    setWalletId(tpl.walletId);
    setIcon(tpl.icon);
    setIsFormVisible(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (!name.trim() || !amount) return;

    onSaveTemplate({
      id: editingTemplate ? editingTemplate.id : `tpl_${Date.now()}`,
      name: name.trim(),
      type,
      amount,
      category,
      walletId,
      icon,
    });

    setIsFormVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kelola Tombol Catat Cepat
            </h3>
            <p className="text-xs text-slate-500">
              Sesuaikan nominal dan daftar template 1-klik Anda
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* List of existing templates */}
          <div className="space-y-2">
            {templates.map(tpl => (
              <div
                key={tpl.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {tpl.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-semibold text-indigo-700">
                      {formatRupiah(tpl.amount)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{tpl.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(tpl)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                    title="Ubah template"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(tpl.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                    title="Hapus template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!isFormVisible && (
            <button
              onClick={handleOpenAdd}
              className="w-full py-2.5 border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Template Cepat Baru</span>
            </button>
          )}

          {/* Form Create/Edit */}
          {isFormVisible && (
            <form onSubmit={handleSaveSubmit} className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {editingTemplate ? 'Ubah Template' : 'Template Cepat Baru'}
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="cth: Makan Siang, Bensin, Parkir"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nominal (IDR)
                  </label>
                  <input
                    type="text"
                    value={amountStr ? parseInt(amountStr, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setAmountStr(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Ikon
                  </label>
                  <select
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    {AVAILABLE_ICONS.map(i => (
                      <option key={i.name} value={i.name}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Dompet
                  </label>
                  <select
                    value={walletId}
                    onChange={e => setWalletId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs cursor-pointer"
                >
                  Simpan Template
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
