import Dexie, { Table } from 'dexie';

// Type definitions
export interface Account {
  id?: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id?: string;
  accountId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  note?: string;
  isTemplate?: boolean;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id?: string;
  name: string;
  category: string;
  defaultAmount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringPayment {
  id?: string;
  accountId: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  isConstant: boolean;
  startDate: Date;
  endDate?: Date;
  lastProcessed?: Date;
  notificationMessage?: string;
  defaultAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id?: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id?: string;
  recurringPaymentId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Database class
export class FinanceDB extends Dexie {
  accounts!: Table<Account>;
  transactions!: Table<Transaction>;
  templates!: Table<Template>;
  recurringPayments!: Table<RecurringPayment>;
  budgets!: Table<Budget>;
  notifications!: Table<Notification>;

  constructor() {
    super('PrivacyFinanceDB');
    this.version(1).stores({
      accounts: '++id, createdAt',
      transactions: '++id, accountId, date, category, createdAt',
      templates: '++id, category, createdAt',
      recurringPayments: '++id, accountId, frequency, createdAt',
      budgets: '++id, category, period, createdAt',
      notifications: '++id, recurringPaymentId, createdAt',
    });
  }
}

// Export singleton instance
export const db = new FinanceDB();
