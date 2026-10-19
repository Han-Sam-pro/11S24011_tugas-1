import { 
  Transaction, 
  RecurringRule, 
  QuickTemplate, 
  Wallet, 
  MonthlyReportData,
  DailyStat,
  CategoryBreakdown
} from '../types/finance';
import { DEFAULT_WALLETS, DEFAULT_TEMPLATES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { getTodayDateString, getCurrentYearMonthString, getPreviousYearMonthString } from '../utils/formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'sakuku_transactions_v1',
  RECURRING_RULES: 'sakuku_recurring_v1',
  TEMPLATES: 'sakuku_templates_v1',
  WALLETS: 'sakuku_wallets_v1',
  LAST_AUTO_RUN: 'sakuku_last_auto_run_v1',
};

export const getInitialRecurringRules = (): RecurringRule[] => {
  const today = getTodayDateString();
  const [year, month] = today.split('-');
  
  return [
    {
      id: 'rule_gaji',
      title: 'Gaji Bulanan',
      type: 'income',
      amount: 8500000,
      category: 'Gaji Pokok',
      walletId: 'w_bca',
      frequency: 'monthly',
      dayOfMonth: 25,
      nextDueDate: `${year}-${month}-25`,
      lastRunDate: `${getPreviousYearMonthString(getCurrentYearMonthString())}-25`,
      isActive: true,
      autoExecute: true,
      createdAt: Date.now() - 30 * 86400000,
    },
    {
      id: 'rule_wifi',
      title: 'Langganan Internet & Wi-Fi',
      type: 'expense',
      amount: 385000,
      category: 'Tagihan & Utilitas',
      walletId: 'w_bca',
      frequency: 'monthly',
      dayOfMonth: 10,
      nextDueDate: `${year}-${month}-10`,
      lastRunDate: `${year}-${month}-10`,
      isActive: true,
      autoExecute: true,
      createdAt: Date.now() - 30 * 86400000,
    },
    {
      id: 'rule_listrik',
      title: 'Listrik PLN Bulanan',
      type: 'expense',
      amount: 450000,
      category: 'Tagihan & Utilitas',
      walletId: 'w_mandiri',
      frequency: 'monthly',
      dayOfMonth: 5,
      nextDueDate: `${year}-${month}-05`,
      lastRunDate: `${year}-${month}-05`,
      isActive: true,
      autoExecute: true,
      createdAt: Date.now() - 30 * 86400000,
    },
    {
      id: 'rule_makan_harian',
      title: 'Alokasi Uang Makan Harian',
      type: 'expense',
      amount: 40000,
      category: 'Makanan & Minuman',
      walletId: 'w_cash',
      frequency: 'daily',
      nextDueDate: today,
      lastRunDate: today,
      isActive: true,
      autoExecute: true,
      createdAt: Date.now() - 14 * 86400000,
    },
    {
      id: 'rule_bensin_mingguan',
      title: 'Isi Bensin Mingguan',
      type: 'expense',
      amount: 60000,
      category: 'Transportasi & Bensin',
      walletId: 'w_cash',
      frequency: 'weekly',
      dayOfWeek: 1, // Senin
      nextDueDate: today,
      lastRunDate: undefined,
      isActive: true,
      autoExecute: true,
      createdAt: Date.now() - 20 * 86400000,
    }
  ];
};

export const generateSeedTransactions = (): Transaction[] => {
  const currentYM = getCurrentYearMonthString();
  const prevYM = getPreviousYearMonthString(currentYM);
  const [currY, currM] = currentYM.split('-');
  const [prevY, prevM] = prevYM.split('-');
  const now = Date.now();

  const seed: Transaction[] = [
    // Previous Month Data
    {
      id: 'tx_prev_1',
      type: 'income',
      amount: 8500000,
      category: 'Gaji Pokok',
      walletId: 'w_bca',
      date: `${prevY}-${prevM}-25`,
      note: 'Gaji bulanan reguler',
      isAutomated: true,
      recurringRuleId: 'rule_gaji',
      createdAt: now - 35 * 86400000,
    },
    {
      id: 'tx_prev_2',
      type: 'income',
      amount: 1200000,
      category: 'Bonus & Freelance',
      walletId: 'w_bca',
      date: `${prevY}-${prevM}-18`,
      note: 'Desain logo proyek sampingan',
      isAutomated: false,
      createdAt: now - 38 * 86400000,
    },
    {
      id: 'tx_prev_3',
      type: 'expense',
      amount: 1500000,
      category: 'Sewa & Rumah Tangga',
      walletId: 'w_bca',
      date: `${prevY}-${prevM}-01`,
      note: 'Sewa kost bulanan',
      isAutomated: false,
      createdAt: now - 45 * 86400000,
    },
    {
      id: 'tx_prev_4',
      type: 'expense',
      amount: 450000,
      category: 'Tagihan & Utilitas',
      walletId: 'w_mandiri',
      date: `${prevY}-${prevM}-05`,
      note: 'Token listrik PLN',
      isAutomated: true,
      createdAt: now - 42 * 86400000,
    },
    {
      id: 'tx_prev_5',
      type: 'expense',
      amount: 385000,
      category: 'Tagihan & Utilitas',
      walletId: 'w_bca',
      date: `${prevY}-${prevM}-10`,
      note: 'Internet IndiHome',
      isAutomated: true,
      createdAt: now - 40 * 86400000,
    },
    {
      id: 'tx_prev_6',
      type: 'expense',
      amount: 1250000,
      category: 'Makanan & Minuman',
      walletId: 'w_cash',
      date: `${prevY}-${prevM}-15`,
      note: 'Akumulasi makan & ngopi',
      isAutomated: false,
      createdAt: now - 36 * 86400000,
    },
    {
      id: 'tx_prev_7',
      type: 'expense',
      amount: 600000,
      category: 'Belanja Harian',
      walletId: 'w_gopay',
      date: `${prevY}-${prevM}-20`,
      note: 'Supermarket bulanan',
      isAutomated: false,
      createdAt: now - 32 * 86400000,
    },

    // Current Month Data
    {
      id: 'tx_curr_1',
      type: 'income',
      amount: 8500000,
      category: 'Gaji Pokok',
      walletId: 'w_bca',
      date: `${currY}-${currM}-01`,
      note: 'Gaji awal bulan',
      isAutomated: true,
      recurringRuleId: 'rule_gaji',
      createdAt: now - 14 * 86400000,
    },
    {
      id: 'tx_curr_2',
      type: 'expense',
      amount: 1500000,
      category: 'Sewa & Rumah Tangga',
      walletId: 'w_bca',
      date: `${currY}-${currM}-02`,
      note: 'Pembayaran sewa kost',
      isAutomated: false,
      createdAt: now - 13 * 86400000,
    },
    {
      id: 'tx_curr_3',
      type: 'expense',
      amount: 450000,
      category: 'Tagihan & Utilitas',
      walletId: 'w_mandiri',
      date: `${currY}-${currM}-05`,
      note: 'Listrik PLN otomatis',
      isAutomated: true,
      recurringRuleId: 'rule_listrik',
      createdAt: now - 10 * 86400000,
    },
    {
      id: 'tx_curr_4',
      type: 'expense',
      amount: 385000,
      category: 'Tagihan & Utilitas',
      walletId: 'w_bca',
      date: `${currY}-${currM}-10`,
      note: 'Tagihan Wi-Fi otomatis',
      isAutomated: true,
      recurringRuleId: 'rule_wifi',
      createdAt: now - 5 * 86400000,
    },
    {
      id: 'tx_curr_5',
      type: 'expense',
      amount: 145000,
      category: 'Belanja Harian',
      walletId: 'w_gopay',
      date: `${currY}-${currM}-08`,
      note: 'Belanja bahan dapur & buah',
      isAutomated: false,
      createdAt: now - 7 * 86400000,
    },
    {
      id: 'tx_curr_6',
      type: 'income',
      amount: 1750000,
      category: 'Bonus & Freelance',
      walletId: 'w_bca',
      date: `${currY}-${currM}-11`,
      note: 'Proyek website toko roti',
      isAutomated: false,
      createdAt: now - 4 * 86400000,
    },
    {
      id: 'tx_curr_7',
      type: 'expense',
      amount: 55000,
      category: 'Makanan & Minuman',
      walletId: 'w_cash',
      date: `${currY}-${currM}-12`,
      note: 'Makan siang ayam geprek + es teh',
      isAutomated: false,
      createdAt: now - 3 * 86400000,
    },
    {
      id: 'tx_curr_8',
      type: 'expense',
      amount: 40000,
      category: 'Makanan & Minuman',
      walletId: 'w_cash',
      date: `${currY}-${currM}-13`,
      note: 'Alokasi uang makan otomatis',
      isAutomated: true,
      recurringRuleId: 'rule_makan_harian',
      createdAt: now - 2 * 86400000,
    },
    {
      id: 'tx_curr_9',
      type: 'expense',
      amount: 35000,
      category: 'Transportasi & Bensin',
      walletId: 'w_cash',
      date: `${currY}-${currM}-14`,
      note: 'Bensin Pertamax motor',
      isAutomated: false,
      createdAt: now - 1 * 86400000,
    },
    {
      id: 'tx_curr_10',
      type: 'expense',
      amount: 40000,
      category: 'Makanan & Minuman',
      walletId: 'w_cash',
      date: `${currY}-${currM}-15`,
      note: 'Alokasi uang makan harian',
      isAutomated: true,
      recurringRuleId: 'rule_makan_harian',
      createdAt: now - 10000,
    },
  ];

  return seed;
};

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      const initial = generateSeedTransactions();
      saveStoredTransactions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions from localStorage', e);
    return generateSeedTransactions();
  }
};

export const saveStoredTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage', e);
  }
};

export const loadStoredRecurringRules = (): RecurringRule[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECURRING_RULES);
    if (!raw) {
      const initial = getInitialRecurringRules();
      saveStoredRecurringRules(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load recurring rules from localStorage', e);
    return getInitialRecurringRules();
  }
};

export const saveStoredRecurringRules = (rules: RecurringRule[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECURRING_RULES, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save recurring rules to localStorage', e);
  }
};

export const loadStoredTemplates = (): QuickTemplate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!raw) {
      saveStoredTemplates(DEFAULT_TEMPLATES);
      return DEFAULT_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load templates from localStorage', e);
    return DEFAULT_TEMPLATES;
  }
};

export const saveStoredTemplates = (templates: QuickTemplate[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage', e);
  }
};

export const loadStoredWallets = (): Wallet[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLETS);
    if (!raw) {
      saveStoredWallets(DEFAULT_WALLETS);
      return DEFAULT_WALLETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load wallets from localStorage', e);
    return DEFAULT_WALLETS;
  }
};

export const saveStoredWallets = (wallets: Wallet[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  } catch (e) {
    console.error('Failed to save wallets to localStorage', e);
  }
};

export const calculateMonthlyReport = (
  yearMonth: string,
  transactions: Transaction[]
): MonthlyReportData => {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  
  // Total days in target month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Filter transactions for this month
  const monthTransactions = transactions.filter(t => t.date.startsWith(yearMonth));

  let totalIncome = 0;
  let totalExpense = 0;
  let automatedCount = 0;

  // Daily map
  const dailyMap = new Map<number, { income: number; expense: number }>();
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap.set(d, { income: 0, expense: 0 });
  }

  // Category maps
  const expCatMap = new Map<string, { amount: number; count: number }>();
  const incCatMap = new Map<string, { amount: number; count: number }>();

  monthTransactions.forEach(t => {
    const day = parseInt(t.date.split('-')[2], 10);
    const dayData = dailyMap.get(day) || { income: 0, expense: 0 };

    if (t.isAutomated) {
      automatedCount++;
    }

    if (t.type === 'income') {
      totalIncome += t.amount;
      dayData.income += t.amount;
      const cat = incCatMap.get(t.category) || { amount: 0, count: 0 };
      cat.amount += t.amount;
      cat.count += 1;
      incCatMap.set(t.category, cat);
    } else {
      totalExpense += t.amount;
      dayData.expense += t.amount;
      const cat = expCatMap.get(t.category) || { amount: 0, count: 0 };
      cat.amount += t.amount;
      cat.count += 1;
      expCatMap.set(t.category, cat);
    }

    dailyMap.set(day, dayData);
  });

  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  const dailyStats: DailyStat[] = Array.from(dailyMap.entries()).map(([day, val]) => {
    const dateFormatted = `${yearMonth}-${String(day).padStart(2, '0')}`;
    return {
      day,
      date: dateFormatted,
      income: val.income,
      expense: val.expense,
      net: val.income - val.expense,
    };
  });

  // Category breakdown calculation
  const getCatColor = (catName: string, isExp: boolean) => {
    const list = isExp ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const found = list.find(c => c.name === catName);
    return found ? found.color : '#64748B';
  };

  const expenseCategories: CategoryBreakdown[] = Array.from(expCatMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
      color: getCatColor(category, true),
    }))
    .sort((a, b) => b.amount - a.amount);

  const incomeCategories: CategoryBreakdown[] = Array.from(incCatMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalIncome > 0 ? Math.round((data.amount / totalIncome) * 100) : 0,
      color: getCatColor(category, false),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Compare with previous month
  const prevYM = getPreviousYearMonthString(yearMonth);
  const prevTransactions = transactions.filter(t => t.date.startsWith(prevYM));
  let prevIncome = 0;
  let prevExpense = 0;
  prevTransactions.forEach(t => {
    if (t.type === 'income') prevIncome += t.amount;
    else prevExpense += t.amount;
  });
  const prevNet = prevIncome - prevExpense;

  const calcDiff = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    yearMonth,
    totalIncome,
    totalExpense,
    netCashflow,
    savingsRate,
    transactionCount: monthTransactions.length,
    automatedCount,
    dailyStats,
    expenseCategories,
    incomeCategories,
    prevMonthDiff: {
      incomeDiffPct: calcDiff(totalIncome, prevIncome),
      expenseDiffPct: calcDiff(totalExpense, prevExpense),
      netDiffPct: calcDiff(netCashflow, prevNet),
    },
  };
};

export const resetAllData = (): {
  transactions: Transaction[];
  recurringRules: RecurringRule[];
  templates: QuickTemplate[];
  wallets: Wallet[];
} => {
  const transactions = generateSeedTransactions();
  const recurringRules = getInitialRecurringRules();
  const templates = DEFAULT_TEMPLATES;
  const wallets = DEFAULT_WALLETS;

  saveStoredTransactions(transactions);
  saveStoredRecurringRules(recurringRules);
  saveStoredTemplates(templates);
  saveStoredWallets(wallets);

  return { transactions, recurringRules, templates, wallets };
};
