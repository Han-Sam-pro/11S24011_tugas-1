import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Download, 
  PieChart as PieIcon, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent,
  Sparkles
} from 'lucide-react';
import { MonthlyReportData, Transaction, Wallet } from '../types/finance';
import { 
  formatRupiah, 
  formatMonthYear, 
  getPreviousYearMonthString, 
  getNextYearMonthString, 
  exportTransactionsToCSV 
} from '../utils/formatters';

interface MonthlyReportProps {
  report: MonthlyReportData;
  allTransactions: Transaction[];
  wallets: Wallet[];
  selectedYearMonth: string;
  onSelectYearMonth: (ym: string) => void;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  report,
  allTransactions,
  wallets,
  selectedYearMonth,
  onSelectYearMonth,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'expense' | 'income'>('expense');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categories = activeCategoryTab === 'expense' ? report.expenseCategories : report.incomeCategories;
  const totalAmountForTab = activeCategoryTab === 'expense' ? report.totalExpense : report.totalIncome;

  // Month navigation
  const handlePrevMonth = () => {
    onSelectYearMonth(getPreviousYearMonthString(selectedYearMonth));
  };
  const handleNextMonth = () => {
    onSelectYearMonth(getNextYearMonthString(selectedYearMonth));
  };

  // SVG Chart calculation for Daily Trend
  const maxDailyValue = Math.max(
    100000,
    ...report.dailyStats.map(d => Math.max(d.income, d.expense))
  );

  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 24;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;

  const barGroupWidth = graphWidth / report.dailyStats.length;
  const barWidth = Math.max(3, barGroupWidth * 0.35);

  // SVG Donut Chart Calculation
  const donutSize = 220;
  const strokeWidth = 32;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const donutSegments = categories.map(cat => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += cat.percentage;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const hoveredDayData = hoveredDay !== null ? report.dailyStats.find(d => d.day === hoveredDay) : null;
  const activeCategoryData = hoveredCategory 
    ? categories.find(c => c.category === hoveredCategory) 
    : categories[0];

  const daysPassed = report.dailyStats.filter(d => d.income > 0 || d.expense > 0).length || 1;
  const avgDailyExpense = Math.round(report.totalExpense / Math.max(1, daysPassed));

  return (
    <div className="space-y-6">
      {/* Month Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Laporan Keuangan Bulanan
            </h2>
            <p className="text-xs text-slate-500">
              Periode {formatMonthYear(selectedYearMonth)}
            </p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-sm font-bold text-slate-800 font-mono">
            {formatMonthYear(selectedYearMonth)}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Bulan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          <button
            onClick={() => exportTransactionsToCSV(
              allTransactions.filter(t => t.date.startsWith(selectedYearMonth)),
              wallets
            )}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Laporan CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Pemasukan</div>
          <div className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
            {formatRupiah(report.totalIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {report.incomeCategories.length} kategori pemasukan
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Pengeluaran</div>
          <div className="text-xl font-bold font-mono text-rose-600 tabular-nums">
            {formatRupiah(report.totalExpense)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {report.expenseCategories.length} kategori pengeluaran
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Arus Kas Bersih (Net)</div>
          <div className={`text-xl font-bold font-mono tabular-nums ${report.netCashflow >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {formatRupiah(report.netCashflow, { withSign: true })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {report.netCashflow >= 0 ? 'Surplus Keuangan' : 'Defisit Anggaran'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Rata-rata Pengeluaran</div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatRupiah(avgDailyExpense)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            per hari aktif transaksi
          </div>
        </div>
      </div>

      {/* Main Chart Section: Daily Trend Bar & Area */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Grafik Tren Harian Arus Kas</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan pemasukan vs pengeluaran per tanggal di bulan {formatMonthYear(selectedYearMonth)}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
              <span className="text-slate-600 font-medium">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
              <span className="text-slate-600 font-medium">Pengeluaran</span>
            </div>
          </div>
        </div>

        {/* Hover info tooltip box */}
        <div className="min-h-[38px] mb-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
          {hoveredDayData ? (
            <>
              <span className="font-semibold text-slate-800">
                Tanggal: {hoveredDayData.date} (Hari ke-{hoveredDayData.day})
              </span>
              <div className="flex items-center gap-3 font-mono tabular-nums">
                <span className="text-emerald-700">Masuk: {formatRupiah(hoveredDayData.income)}</span>
                <span className="text-slate-300">|</span>
                <span className="text-rose-700">Keluar: {formatRupiah(hoveredDayData.expense)}</span>
                <span className="text-slate-300">|</span>
                <span className={hoveredDayData.net >= 0 ? 'text-indigo-700 font-bold' : 'text-rose-700 font-bold'}>
                  Net: {formatRupiah(hoveredDayData.net, { withSign: true })}
                </span>
              </div>
            </>
          ) : (
            <span className="text-slate-500">
              Arahkan kursor / sentuh batang tanggal di bawah untuk melihat rincian pemasukan & pengeluaran harian.
            </span>
          )}
        </div>

        {/* SVG Graphic */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[550px] select-none"
          >
            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingY + graphHeight * (1 - ratio);
              const val = Math.round(maxDailyValue * ratio);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray={ratio === 0 ? undefined : '3 3'}
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {val >= 1000000 ? `${(val / 1000000).toFixed(1)}jt` : `${Math.round(val / 1000)}k`}
                  </text>
                </g>
              );
            })}

            {/* Bars for each day */}
            {report.dailyStats.map((stat, idx) => {
              const xCenter = paddingX + idx * barGroupWidth + barGroupWidth / 2;
              const isHovered = hoveredDay === stat.day;

              // Calculate bar heights
              const incomeHeight = maxDailyValue > 0 ? (stat.income / maxDailyValue) * graphHeight : 0;
              const expenseHeight = maxDailyValue > 0 ? (stat.expense / maxDailyValue) * graphHeight : 0;

              const incomeY = paddingY + graphHeight - incomeHeight;
              const expenseY = paddingY + graphHeight - expenseHeight;

              return (
                <g
                  key={stat.day}
                  onMouseEnter={() => setHoveredDay(stat.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="cursor-pointer transition-opacity"
                >
                  {/* Background hover column highlight */}
                  <rect
                    x={paddingX + idx * barGroupWidth}
                    y={paddingY}
                    width={barGroupWidth}
                    height={graphHeight}
                    fill={isHovered ? '#EEF2FF' : 'transparent'}
                    rx={2}
                  />

                  {/* Income Bar (Green) */}
                  {stat.income > 0 && (
                    <rect
                      x={xCenter - barWidth - 1}
                      y={incomeY}
                      width={barWidth}
                      height={incomeHeight}
                      fill="#10B981"
                      rx={2}
                      className={isHovered ? 'filter brightness-110' : ''}
                    />
                  )}

                  {/* Expense Bar (Rose) */}
                  {stat.expense > 0 && (
                    <rect
                      x={xCenter + 1}
                      y={expenseY}
                      width={barWidth}
                      height={expenseHeight}
                      fill="#F43F5E"
                      rx={2}
                      className={isHovered ? 'filter brightness-110' : ''}
                    />
                  )}

                  {/* Day label on X axis (Show every 2 or 3 days or if hovered) */}
                  {(stat.day === 1 || stat.day % 3 === 0 || stat.day === report.dailyStats.length || isHovered) && (
                    <text
                      x={xCenter}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className={`text-[9px] font-mono ${
                        isHovered ? 'fill-indigo-600 font-bold' : 'fill-slate-400'
                      }`}
                    >
                      {stat.day}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Category Breakdown & Donut Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Donut Visualization */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                <span>Proporsi per Kategori</span>
              </h3>

              {/* Segmented control for Expense vs Income */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
                <button
                  onClick={() => setActiveCategoryTab('expense')}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    activeCategoryTab === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  onClick={() => setActiveCategoryTab('income')}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    activeCategoryTab === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Distribusi total {activeCategoryTab === 'expense' ? 'pengeluaran' : 'pemasukan'}:{' '}
              <strong className="font-mono text-slate-800">{formatRupiah(totalAmountForTab)}</strong>
            </p>
          </div>

          {/* Donut graphic with Center Text */}
          <div className="flex flex-col items-center justify-center my-2">
            {categories.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Belum ada transaksi {activeCategoryTab === 'expense' ? 'pengeluaran' : 'pemasukan'} tercatat di bulan ini.
              </div>
            ) : (
              <div className="relative">
                <svg
                  width={donutSize}
                  height={donutSize}
                  viewBox={`0 0 ${donutSize} ${donutSize}`}
                  className="rotate-[-90deg] select-none"
                >
                  {/* Background Track */}
                  <circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth={strokeWidth}
                  />

                  {/* Slices */}
                  {donutSegments.map((segment, idx) => {
                    const isHovered = hoveredCategory === segment.category;
                    return (
                      <circle
                        key={idx}
                        cx={donutSize / 2}
                        cy={donutSize / 2}
                        r={radius}
                        fill="transparent"
                        stroke={segment.color}
                        strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                        strokeDasharray={segment.strokeDasharray}
                        strokeDashoffset={segment.strokeDashoffset}
                        onMouseEnter={() => setHoveredCategory(segment.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                </svg>

                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
                  {activeCategoryData ? (
                    <>
                      <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[130px]">
                        {activeCategoryData.category}
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                        {formatRupiah(activeCategoryData.amount)}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 font-mono">
                        {activeCategoryData.percentage}%
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      Pilih Kategori
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-center text-slate-400 mt-2">
            Arahkan kursor pada lingkaran donat untuk melihat detail
          </div>
        </div>

        {/* Right Column: Ranked Category List */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">
              Rincian Kategori Terbesar ({activeCategoryTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'})
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              {categories.length} Kategori
            </span>
          </div>

          {categories.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada data kategori untuk ditampilkan.
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {categories.map((cat, idx) => {
                const isHovered = hoveredCategory === cat.category;
                return (
                  <div
                    key={cat.category}
                    onMouseEnter={() => setHoveredCategory(cat.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isHovered
                        ? 'border-indigo-300 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-slate-800">
                          {cat.category}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({cat.count} transaksi)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-900 tabular-nums">
                          {formatRupiah(cat.amount)}
                        </span>
                        <span className="w-10 text-right font-mono text-slate-500 text-[11px] font-semibold">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress visual bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(2, cat.percentage)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Insights Note */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-slate-200 p-4 flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 font-semibold block mb-0.5">
            Analisis Kesehatan Finansial Bulan {formatMonthYear(selectedYearMonth)}:
          </strong>
          {report.netCashflow >= 0 ? (
            <span>
              Kondisi keuangan bulan ini berada dalam kategori <strong>Surplus Positif</strong> dengan rasio tabungan sebesar{' '}
              <strong>{report.savingsRate}%</strong> dari total pemasukan. Pertahankan pengeluaran harian rata-rata di kisaran{' '}
              <strong>{formatRupiah(avgDailyExpense)}</strong> agar target tabungan tetap tercapai.
            </span>
          ) : (
            <span>
              Pengeluaran bulan ini melebihi pemasukan sebesar <strong>{formatRupiah(Math.abs(report.netCashflow))}</strong>. 
              Evaluasi kategori dengan porsi pengeluaran terbesar di atas untuk menekan pos belanja non-primer pada bulan berikutnya.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
