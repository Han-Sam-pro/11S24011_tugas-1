import { Transaction, Wallet } from '../types/finance';

export const formatRupiah = (amount: number, options?: { withSign?: boolean; type?: 'income' | 'expense' }): string => {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  if (options?.withSign) {
    if (options.type === 'income' || amount > 0) {
      return `+${formatted}`;
    }
    if (options.type === 'expense' || amount < 0) {
      return `-${formatted}`;
    }
  }

  return formatted;
};

export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthIdx = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${months[monthIdx] || month} ${year}`;
};

export const formatFullDateIndo = (dateStr: string): string => {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr + 'T00:00:00');
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayName = days[dateObj.getDay()];
  const dayNum = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
};

export const formatMonthYear = (yearMonth: string): string => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthIdx = parseInt(month, 10) - 1;
  return `${months[monthIdx] || month} ${year}`;
};

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentYearMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getPreviousYearMonthString = (yearMonth: string): string => {
  const [y, m] = yearMonth.split('-').map(Number);
  if (m === 1) {
    return `${y - 1}-12`;
  }
  return `${y}-${String(m - 1).padStart(2, '0')}`;
};

export const getNextYearMonthString = (yearMonth: string): string => {
  const [y, m] = yearMonth.split('-').map(Number);
  if (m === 12) {
    return `${y + 1}-01`;
  }
  return `${y}-${String(m + 1).padStart(2, '0')}`;
};

export const exportTransactionsToCSV = (transactions: Transaction[], wallets: Wallet[]): void => {
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));
  
  const headers = ['Tanggal', 'Jenis', 'Kategori', 'Jumlah (IDR)', 'Dompet/Rekening', 'Catatan', 'Otomatis'];
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    `"${t.category.replace(/"/g, '""')}"`,
    t.amount,
    `"${(walletMap.get(t.walletId) || t.walletId).replace(/"/g, '""')}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
    t.isAutomated ? 'Ya' : 'Tidak'
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Sakuku_Laporan_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
