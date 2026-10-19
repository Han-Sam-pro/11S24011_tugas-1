import React from 'react';
import { QuickTemplate, Wallet } from '../types/finance';
import { formatRupiah } from '../utils/formatters';
import { 
  Utensils, 
  Coffee, 
  Car, 
  Fuel, 
  ShoppingBag, 
  Smartphone, 
  Zap, 
  Plus, 
  Briefcase, 
  Tag
} from 'lucide-react';

interface QuickTemplatesBarProps {
  templates: QuickTemplate[];
  wallets: Wallet[];
  onExecuteTemplate: (template: QuickTemplate) => void;
  onOpenTemplateManager: () => void;
}

const renderTemplateIcon = (iconName: string) => {
  const iconProps = { className: 'w-4 h-4' };
  switch (iconName) {
    case 'Utensils': return <Utensils {...iconProps} />;
    case 'Coffee': return <Coffee {...iconProps} />;
    case 'Car': return <Car {...iconProps} />;
    case 'Fuel': return <Fuel {...iconProps} />;
    case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
    case 'Smartphone': return <Smartphone {...iconProps} />;
    case 'Briefcase': return <Briefcase {...iconProps} />;
    default: return <Tag {...iconProps} />;
  }
};

export const QuickTemplatesBar: React.FC<QuickTemplatesBarProps> = ({
  templates,
  wallets,
  onExecuteTemplate,
  onOpenTemplateManager,
}) => {
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            Catat Cepat (1-Klik Template Harian)
          </h3>
          <span className="text-xs text-slate-500 hidden sm:inline">
            · Klik tombol untuk mencatat pengeluaran instan
          </span>
        </div>
        <button
          onClick={onOpenTemplateManager}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Atur Template</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        {templates.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => onExecuteTemplate(tpl)}
            className="group flex items-center gap-2.5 px-3 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-left transition-all active:scale-95 shrink-0 cursor-pointer shadow-xs"
            title={`Klik untuk catat ${tpl.name} dari ${walletMap.get(tpl.walletId) || 'Dompet'}`}
          >
            <div className="w-7 h-7 rounded-md bg-white group-hover:bg-indigo-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-indigo-600 flex items-center justify-center transition-colors">
              {renderTemplateIcon(tpl.icon)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900 leading-tight whitespace-nowrap">
                {tpl.name}
              </span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 group-hover:text-indigo-700 leading-tight">
                {formatRupiah(tpl.amount)}
              </span>
            </div>
          </button>
        ))}

        <button
          onClick={onOpenTemplateManager}
          className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 hover:border-indigo-400 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors text-xs font-medium shrink-0 cursor-pointer h-[46px]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </div>
    </div>
  );
};
