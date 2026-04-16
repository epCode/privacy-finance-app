import { RecurringPayment, Transaction, db } from './db';
import { addDays, addWeeks, addMonths, addQuarters, addYears, startOfDay } from 'date-fns';

export type FrequencyType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Calculate the next due date for a recurring payment
 */
export function getNextDueDate(
  lastProcessed: Date | undefined,
  frequency: FrequencyType,
  startDate: Date
): Date {
  const baseDate = lastProcessed || startDate;

  switch (frequency) {
    case 'daily':
      return addDays(baseDate, 1);
    case 'weekly':
      return addWeeks(baseDate, 1);
    case 'biweekly':
      return addWeeks(baseDate, 2);
    case 'monthly':
      return addMonths(baseDate, 1);
    case 'quarterly':
      return addQuarters(baseDate, 1);
    case 'yearly':
      return addYears(baseDate, 1);
    default:
      return baseDate;
  }
}

/**
 * Check if a recurring payment is due today
 */
export function isPaymentDue(payment: RecurringPayment): boolean {
  const today = startOfDay(new Date());
  const nextDue = getNextDueDate(payment.lastProcessed, payment.frequency, payment.startDate);
  const nextDueNormalized = startOfDay(nextDue);

  // Check if end date has passed
  if (payment.endDate) {
    const endDateNormalized = startOfDay(payment.endDate);
    if (today > endDateNormalized) {
      return false;
    }
  }

  return today.getTime() === nextDueNormalized.getTime();
}

/**
 * Process a recurring payment (create transaction and update last processed date)
 */
export async function processRecurringPayment(
  payment: RecurringPayment,
  actualAmount?: number
): Promise<Transaction> {
  const amount = actualAmount !== undefined ? actualAmount : payment.defaultAmount;

  const transaction: Transaction = {
    accountId: payment.accountId,
    amount,
    type: 'expense',
    category: payment.name,
    date: new Date(),
    note: `Auto-processed: ${payment.name}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transactionId = await db.transactions.add(transaction);

  // Update the recurring payment's lastProcessed date
  await db.recurringPayments.update(payment.id!, {
    lastProcessed: new Date(),
  });

  // Update account balance
  const account = await db.accounts.get(payment.accountId);
  if (account) {
    await db.accounts.update(payment.accountId, {
      balance: account.balance - amount,
      updatedAt: new Date(),
    });
  }

  return { ...transaction, id: transactionId as string };
}

/**
 * Get all payments due today
 */
export async function getPaymentsDueToday(): Promise<RecurringPayment[]> {
  const allPayments = await db.recurringPayments.toArray();
  return allPayments.filter(isPaymentDue);
}

/**
 * Get upcoming payments (next 7 days)
 */
export async function getUpcomingPayments(daysAhead: number = 7): Promise<RecurringPayment[]> {
  const allPayments = await db.recurringPayments.toArray();
  const today = startOfDay(new Date());
  const futureDate = addDays(today, daysAhead);

  return allPayments.filter((payment) => {
    if (payment.endDate && startOfDay(payment.endDate) < today) {
      return false;
    }

    const nextDue = getNextDueDate(payment.lastProcessed, payment.frequency, payment.startDate);
    const nextDueNormalized = startOfDay(nextDue);

    return nextDueNormalized >= today && nextDueNormalized <= futureDate;
  });
}
