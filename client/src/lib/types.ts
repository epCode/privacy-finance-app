/**
 * Core data model for Personal Finance Tracker
 * All data is stored in localStorage and works offline
 */

// Account represents a bank account or financial account
export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
  initialBalance: number;
  currency: string; // ISO 4217 code (e.g., 'USD')
  createdAt: number; // timestamp
  color?: string; // optional color for UI
  isActive: boolean;
}

// Transaction represents a single money movement
export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: number; // timestamp
  templateId?: string; // if created from a template
  isReconciled?: boolean; // for tracking against real account
  notes?: string;
}

// AutoPay represents a scheduled recurring payment
export interface AutoPay {
  id: string;
  accountId: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  isNonConstant: boolean; // if true, user must confirm amount each time
  defaultAmount: number; // fallback amount for non-constant payments
  customNotificationMessage?: string; // custom reminder text for non-constant
  nextDueDate: number; // timestamp of next scheduled payment
  lastExecutedDate?: number; // timestamp of last execution
  isActive: boolean;
  createdAt: number;
  notes?: string;
  // New scheduling fields
  startDate: number; // when the recurring payment begins
  endDate?: number; // optional end date; if not set, recurs indefinitely
  timeOfDay: string; // HH:MM format (e.g., "17:00" for 5pm)
}

// Template represents a reusable transaction pattern
export interface Template {
  id: string;
  accountId: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  isActive: boolean;
  createdAt: number;
  usageCount?: number; // track how often used
}

// Budget represents spending limits for categories
export interface Budget {
  id: string;
  accountId: string;
  category: string;
  limit: number; // monthly spending limit
  period: 'monthly' | 'yearly'; // budget period
  month?: string; // YYYY-MM for monthly budgets
  year?: string; // YYYY for yearly budgets
  createdAt: number;
  isActive: boolean;
  notes?: string;
}

// Notification for pending bills and reminders
export interface Notification {
  id: string;
  type: 'autopay_due' | 'autopay_nonconst' | 'budget_alert' | 'reminder';
  autoPayId?: string;
  budgetId?: string;
  accountId?: string;
  title: string;
  message: string;
  dueDate: number; // timestamp
  isRead: boolean;
  isCompleted: boolean;
  createdAt: number;
  customMessage?: string;
}

// Reconciliation record for tracking actual vs tracked amounts
export interface Reconciliation {
  id: string;
  accountId: string;
  autoPayId: string;
  scheduledAmount: number;
  actualAmount: number;
  date: number; // timestamp when reconciliation occurred
  notes?: string;
}

// App state summary for dashboard
export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  autoPays: AutoPay[];
  templates: Template[];
  budgets: Budget[];
  notifications: Notification[];
  reconciliations: Reconciliation[];
  lastSyncDate: number; // for offline tracking
}

// Helper type for monthly/yearly summaries
export interface FinancialSummary {
  period: string; // 'YYYY-MM' or 'YYYY'
  income: number;
  expenses: number;
  net: number;
  byCategory: Record<string, number>;
}

// Budget status for display
export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
}
