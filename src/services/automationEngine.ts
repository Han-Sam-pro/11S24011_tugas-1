import { Transaction, RecurringRule, Wallet } from '../types/finance';
import { getTodayDateString, getCurrentYearMonthString, getNextYearMonthString } from '../utils/formatters';

export interface AutomationExecutionResult {
  executedCount: number;
  newTransactions: Transaction[];
  updatedRules: RecurringRule[];
  updatedWallets: Wallet[];
  messages: string[];
}

export const runAutomatedRecurringEngine = (
  rules: RecurringRule[],
  wallets: Wallet[],
  existingTransactions: Transaction[]
): AutomationExecutionResult => {
  const today = getTodayDateString();
  const currentYM = getCurrentYearMonthString();
  const [currYear, currMonth, currDay] = today.split('-').map(Number);
  const todayDateObj = new Date(today + 'T00:00:00');
  const todayDayOfWeek = todayDateObj.getDay();

  const newTransactions: Transaction[] = [];
  const updatedRules: RecurringRule[] = [...rules];
  const walletMap = new Map<string, Wallet>(wallets.map(w => [w.id, { ...w }]));
  const messages: string[] = [];

  for (let i = 0; i < updatedRules.length; i++) {
    const rule = updatedRules[i];
    if (!rule.isActive || !rule.autoExecute) continue;

    let shouldExecute = false;
    let executionDate = today;

    if (rule.frequency === 'daily') {
      // If rule has not run today
      if (rule.lastRunDate !== today) {
        shouldExecute = true;
        executionDate = today;
      }
    } else if (rule.frequency === 'weekly') {
      const targetDayOfWeek = rule.dayOfWeek ?? 1; // default Monday
      // If today matches target day of week and hasn't run today
      if (todayDayOfWeek === targetDayOfWeek && rule.lastRunDate !== today) {
        shouldExecute = true;
        executionDate = today;
      } else if (rule.nextDueDate && rule.nextDueDate <= today && rule.lastRunDate !== today) {
        shouldExecute = true;
        executionDate = today;
      }
    } else if (rule.frequency === 'monthly') {
      const targetDay = rule.dayOfMonth ?? 1;
      // Has it already run in this month?
      const hasRunThisMonth = rule.lastRunDate && rule.lastRunDate.startsWith(currentYM);
      
      // If current day is >= targetDay and hasn't run this month
      if (currDay >= targetDay && !hasRunThisMonth) {
        shouldExecute = true;
        // Schedule date: targetDay of this month
        const validDay = Math.min(targetDay, new Date(currYear, currMonth, 0).getDate());
        executionDate = `${currYear}-${String(currMonth).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
      }
    }

    if (shouldExecute) {
      // Check for duplicate transaction already existing for this rule on this date
      const isAlreadyRecorded = existingTransactions.some(
        t => t.recurringRuleId === rule.id && t.date === executionDate
      ) || newTransactions.some(
        t => t.recurringRuleId === rule.id && t.date === executionDate
      );

      if (!isAlreadyRecorded) {
        const newTx: Transaction = {
          id: `tx_auto_${rule.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: rule.type,
          amount: rule.amount,
          category: rule.category,
          walletId: rule.walletId,
          date: executionDate,
          note: `[Otomatis] ${rule.title}`,
          isAutomated: true,
          recurringRuleId: rule.id,
          createdAt: Date.now(),
        };

        newTransactions.push(newTx);

        // Update target wallet balance
        const targetWallet = walletMap.get(rule.walletId);
        if (targetWallet) {
          if (rule.type === 'income') {
            targetWallet.balance += rule.amount;
          } else {
            targetWallet.balance -= rule.amount;
          }
        }

        messages.push(`Tercatat otomatis: ${rule.title} (${rule.type === 'income' ? '+' : '-'}Rp ${rule.amount.toLocaleString('id-ID')})`);
      }

      // Compute next due date
      let nextDue = today;
      if (rule.frequency === 'daily') {
        const nextD = new Date(todayDateObj);
        nextD.setDate(nextD.getDate() + 1);
        nextDue = nextD.toISOString().split('T')[0];
      } else if (rule.frequency === 'weekly') {
        const nextW = new Date(todayDateObj);
        nextW.setDate(nextW.getDate() + 7);
        nextDue = nextW.toISOString().split('T')[0];
      } else if (rule.frequency === 'monthly') {
        const nextYM = getNextYearMonthString(currentYM);
        const [nY, nM] = nextYM.split('-').map(Number);
        const targetDay = rule.dayOfMonth ?? 1;
        const maxDays = new Date(nY, nM, 0).getDate();
        const validDay = Math.min(targetDay, maxDays);
        nextDue = `${nY}-${String(nM).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
      }

      updatedRules[i] = {
        ...rule,
        lastRunDate: today,
        nextDueDate: nextDue,
      };
    }
  }

  return {
    executedCount: newTransactions.length,
    newTransactions,
    updatedRules,
    updatedWallets: Array.from(walletMap.values()),
    messages,
  };
};
