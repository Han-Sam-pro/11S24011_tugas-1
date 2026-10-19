import React from 'react';
import { Wallet, Sparkles, PlusCircle } from 'lucide-react';

export type TabType = 'dashboard' | 'transactions' | 'reports' | 'automation' | 'wallets';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenNewTransaction: () => void;
  automatedNotificationCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTransaction,
  automatedNotificationCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Sakuku
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Clean single line typography with active indicator) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'dashboard'
                  ? 'text-indigo-700 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Ringkasan
            </button>

            <button
              onClick={() => onSelectTab('transactions')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'transactions'
                  ? 'text-indigo-700 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Buku Transaksi
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'reports'
                  ? 'text-indigo-700 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Laporan Bulanan
            </button>

            <button
              onClick={() => onSelectTab('automation')}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentTab === 'automation'
                  ? 'text-indigo-700 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Otomasi Harian</span>
              {automatedNotificationCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" title="Ada aktivitas otomasi" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('wallets')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'wallets'
                  ? 'text-indigo-700 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dompet & Rekening
            </button>
          </nav>

          {/* Zone 3: Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'transactions' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Transaksi
          </button>
          <button
            onClick={() => onSelectTab('reports')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'reports' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Laporan
          </button>
          <button
            onClick={() => onSelectTab('automation')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'automation' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Otomasi
          </button>
          <button
            onClick={() => onSelectTab('wallets')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'wallets' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Dompet
          </button>
        </div>
      </div>
    </header>
  );
};
