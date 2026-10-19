import { CategoryItem, Wallet, QuickTemplate } from '../types/finance';

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'cat_food', name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#F97316' },
  { id: 'cat_transport', name: 'Transportasi & Bensin', type: 'expense', icon: 'Car', color: '#3B82F6' },
  { id: 'cat_groceries', name: 'Belanja Harian', type: 'expense', icon: 'ShoppingCart', color: '#10B981' },
  { id: 'cat_bills', name: 'Tagihan & Utilitas', type: 'expense', icon: 'Receipt', color: '#EF4444' },
  { id: 'cat_entertainment', name: 'Hiburan & Liburan', type: 'expense', icon: 'Film', color: '#8B5CF6' },
  { id: 'cat_health', name: 'Kesehatan & Medis', type: 'expense', icon: 'HeartPulse', color: '#EC4899' },
  { id: 'cat_education', name: 'Pendidikan & Buku', type: 'expense', icon: 'GraduationCap', color: '#06B6D4' },
  { id: 'cat_housing', name: 'Sewa & Rumah Tangga', type: 'expense', icon: 'Home', color: '#6366F1' },
  { id: 'cat_other_exp', name: 'Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#64748B' },
];

export const INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'cat_salary', name: 'Gaji Pokok', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 'cat_business', name: 'Usaha & Bisnis', type: 'income', icon: 'Store', color: '#059669' },
  { id: 'cat_bonus', name: 'Bonus & Freelance', type: 'income', icon: 'Sparkles', color: '#3B82F6' },
  { id: 'cat_investment', name: 'Investasi & Bunga', type: 'income', icon: 'TrendingUp', color: '#8B5CF6' },
  { id: 'cat_gift', name: 'Hadiah & Bantuan', type: 'income', icon: 'Gift', color: '#EC4899' },
  { id: 'cat_other_inc', name: 'Pemasukan Lain', type: 'income', icon: 'PlusCircle', color: '#64748B' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const DEFAULT_WALLETS: Wallet[] = [
  { id: 'w_cash', name: 'Dompet Tunai', type: 'cash', balance: 750000, color: '#10B981' },
  { id: 'w_bca', name: 'Bank BCA', type: 'bank', balance: 8450000, color: '#2563EB', accountNumber: '8820-192-334' },
  { id: 'w_mandiri', name: 'Bank Mandiri', type: 'bank', balance: 3200000, color: '#D97706', accountNumber: '137-00-9821-44' },
  { id: 'w_gopay', name: 'GoPay / OVO', type: 'ewallet', balance: 420000, color: '#06B6D4', accountNumber: '0812-9843-1120' },
];

export const DEFAULT_TEMPLATES: QuickTemplate[] = [
  { id: 'tpl_1', name: 'Makan Siang', type: 'expense', amount: 25000, category: 'Makanan & Minuman', walletId: 'w_cash', icon: 'Utensils' },
  { id: 'tpl_2', name: 'Kopi & Snack', type: 'expense', amount: 20000, category: 'Makanan & Minuman', walletId: 'w_gopay', icon: 'Coffee' },
  { id: 'tpl_3', name: 'Bensin Motor', type: 'expense', amount: 35000, category: 'Transportasi & Bensin', walletId: 'w_cash', icon: 'Fuel' },
  { id: 'tpl_4', name: 'Parkir Harian', type: 'expense', amount: 5000, category: 'Transportasi & Bensin', walletId: 'w_cash', icon: 'Car' },
  { id: 'tpl_5', name: 'Belanja Sayur/Pasar', type: 'expense', amount: 65000, category: 'Belanja Harian', walletId: 'w_cash', icon: 'ShoppingBag' },
  { id: 'tpl_6', name: 'Pulsa / Paket Data', type: 'expense', amount: 100000, category: 'Tagihan & Utilitas', walletId: 'w_bca', icon: 'Smartphone' },
];
