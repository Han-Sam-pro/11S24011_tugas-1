import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { MonthlyReportData } from '../types/finance';

interface KPICardsProps {
  totalBalance: number;
  report: MonthlyReportData;
  monthName: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ totalBalance, report, monthName }) => {
  const isNetPositive = report.netCashflow >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Balance Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Total Saldo Aktif
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {formatRupiah(totalBalance)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>Terkumpul di semua dompet & rekening</span>
        </div>
      </div>

      {/* Income Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-700">
            Pemasukan ({monthName.split(' ')[0]})
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-600 font-mono tabular-nums">
          {formatRupiah(report.totalIncome)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          {report.prevMonthDiff.incomeDiffPct >= 0 ? (
            <span className="text-emerald-600 font-semibold flex items-center">
              +{report.prevMonthDiff.incomeDiffPct}%
            </span>
          ) : (
            <span className="text-rose-600 font-semibold flex items-center">
              {report.prevMonthDiff.incomeDiffPct}%
            </span>
          )}
          <span className="text-slate-400">·</span>
          <span>dibanding bulan lalu</span>
        </div>
      </div>

      {/* Expense Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-rose-700">
            Pengeluaran ({monthName.split(' ')[0]})
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-rose-600 font-mono tabular-nums">
          {formatRupiah(report.totalExpense)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          {report.prevMonthDiff.expenseDiffPct <= 0 ? (
            <span className="text-emerald-600 font-semibold flex items-center">
              {report.prevMonthDiff.expenseDiffPct}%
            </span>
          ) : (
            <span className="text-rose-600 font-semibold flex items-center">
              +{report.prevMonthDiff.expenseDiffPct}%
            </span>
          )}
          <span className="text-slate-400">·</span>
          <span>dibanding bulan lalu</span>
        </div>
      </div>

      {/* Net Cashflow & Savings Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-700">
            Arus Kas Bersih
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            {isNetPositive ? <TrendingUp className="w-4 h-4" /> : <PiggyBank className="w-4 h-4" />}
          </div>
        </div>
        <div className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${isNetPositive ? 'text-indigo-600' : 'text-rose-600'}`}>
          {formatRupiah(report.netCashflow, { withSign: true })}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="font-semibold text-slate-700">
            {report.savingsRate}% rasio tabungan
          </span>
          <span className="text-slate-400">·</span>
          <span>{isNetPositive ? 'Surplus' : 'Defisit'}</span>
        </div>
      </div>
    </div>
  );
};
