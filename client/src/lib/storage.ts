/**
 * localStorage service for Personal Finance Tracker
 * Handles all data persistence with fallback for offline use
 */

import type {
  Account,
  AppState,
  AutoPay,
  Notification,
  Reconciliation,
  Template,
  Transaction,
} from './types';

const STORAGE_KEY = 'pft_app_state';
const STORAGE_VERSION = '1.0';

// Initialize empty state
const defaultState: AppState = {
  accounts: [],
  transactions: [],
  autoPays: [],
  templates: [],
  budgets: [],
  notifications: [],
  reconciliations: [],
  lastSyncDate: Date.now(),
};

/**
 * Get the complete app state from localStorage
 */
export function getState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    const parsed = JSON.parse(stored);
    return parsed as AppState;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return defaultState;
  }
}

/**
 * Save the complete app state to localStorage
 */
export function setState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

/**
 * Account operations
 */
export function addAccount(account: Account): void {
  const state = getState();
  state.accounts.push(account);
  setState(state);
}

export function updateAccount(id: string, updates: Partial<Account>): void {
  const state = getState();
  const account = state.accounts.find((a) => a.id === id);
  if (account) {
    Object.assign(account, updates);
    setState(state);
  }
}

export function deleteAccount(id: string): void {
  const state = getState();
  state.accounts = state.accounts.filter((a) => a.id !== id);
  // Also remove related data
  state.transactions = state.transactions.filter((t) => t.accountId !== id);
  state.autoPays = state.autoPays.filter((ap) => ap.accountId !== id);
  state.templates = state.templates.filter((t) => t.accountId !== id);
  setState(state);
}

export function getAccounts(): Account[] {
  return getState().accounts;
}

export function getAccount(id: string): Account | undefined {
  return getState().accounts.find((a) => a.id === id);
}

/**
 * Transaction operations
 */
export function addTransaction(transaction: Transaction): void {
  const state = getState();
  state.transactions.push(transaction);
  setState(state);
}

export function updateTransaction(id: string, updates: Partial<Transaction>): void {
  const state = getState();
  const transaction = state.transactions.find((t) => t.id === id);
  if (transaction) {
    Object.assign(transaction, updates);
    setState(state);
  }
}

export function deleteTransaction(id: string): void {
  const state = getState();
  state.transactions = state.transactions.filter((t) => t.id !== id);
  setState(state);
}

export function getTransactions(accountId?: string): Transaction[] {
  const state = getState();
  if (!accountId) return state.transactions;
  return state.transactions.filter((t) => t.accountId === accountId);
}

export function getTransactionsByDateRange(
  accountId: string,
  startDate: number,
  endDate: number
): Transaction[] {
  return getTransactions(accountId).filter((t) => t.date >= startDate && t.date <= endDate);
}

/**
 * AutoPay operations
 */
export function addAutoPay(autoPay: AutoPay): void {
  const state = getState();
  state.autoPays.push(autoPay);
  setState(state);
}

export function updateAutoPay(id: string, updates: Partial<AutoPay>): void {
  const state = getState();
  const autoPay = state.autoPays.find((ap) => ap.id === id);
  if (autoPay) {
    Object.assign(autoPay, updates);
    setState(state);
  }
}

export function deleteAutoPay(id: string): void {
  const state = getState();
  state.autoPays = state.autoPays.filter((ap) => ap.id !== id);
  setState(state);
}

export function getAutoPays(accountId?: string): AutoPay[] {
  const state = getState();
  if (!accountId) return state.autoPays;
  return state.autoPays.filter((ap) => ap.accountId === accountId);
}

export function getActiveAutoPays(accountId?: string): AutoPay[] {
  return getAutoPays(accountId).filter((ap) => ap.isActive);
}

/**
 * Template operations
 */
export function addTemplate(template: Template): void {
  const state = getState();
  state.templates.push(template);
  setState(state);
}

export function updateTemplate(id: string, updates: Partial<Template>): void {
  const state = getState();
  const template = state.templates.find((t) => t.id === id);
  if (template) {
    Object.assign(template, updates);
    setState(state);
  }
}

export function deleteTemplate(id: string): void {
  const state = getState();
  state.templates = state.templates.filter((t) => t.id !== id);
  setState(state);
}

export function getTemplates(accountId?: string): Template[] {
  const state = getState();
  if (!accountId) return state.templates;
  return state.templates.filter((t) => t.accountId === accountId);
}

/**
 * Budget operations
 */
export function addBudget(budget: any): void {
  const state = getState();
  state.budgets.push(budget);
  setState(state);
}

export function updateBudget(id: string, updates: any): void {
  const state = getState();
  const budget = state.budgets.find((b: any) => b.id === id);
  if (budget) {
    Object.assign(budget, updates);
    setState(state);
  }
}

export function deleteBudget(id: string): void {
  const state = getState();
  state.budgets = state.budgets.filter((b: any) => b.id !== id);
  setState(state);
}

export function getBudgets(accountId?: string): any[] {
  const state = getState();
  if (!accountId) return state.budgets;
  return state.budgets.filter((b: any) => b.accountId === accountId);
}

/**
 * Notification operations
 */
export function addNotification(notification: Notification): void {
  const state = getState();
  state.notifications.push(notification);
  setState(state);
}

export function updateNotification(id: string, updates: Partial<Notification>): void {
  const state = getState();
  const notification = state.notifications.find((n) => n.id === id);
  if (notification) {
    Object.assign(notification, updates);
    setState(state);
  }
}

export function deleteNotification(id: string): void {
  const state = getState();
  state.notifications = state.notifications.filter((n) => n.id !== id);
  setState(state);
}

export function getNotifications(): Notification[] {
  return getState().notifications;
}

export function getUnreadNotifications(): Notification[] {
  return getNotifications().filter((n) => !n.isRead);
}

export function getPendingNotifications(): Notification[] {
  return getNotifications().filter((n) => !n.isCompleted && !n.isRead);
}

/**
 * Reconciliation operations
 */
export function addReconciliation(reconciliation: Reconciliation): void {
  const state = getState();
  state.reconciliations.push(reconciliation);
  setState(state);
}

export function getReconciliations(autoPayId?: string): Reconciliation[] {
  const state = getState();
  if (!autoPayId) return state.reconciliations;
  return state.reconciliations.filter((r) => r.autoPayId === autoPayId);
}

/**
 * Utility functions
 */
export function calculateAccountBalance(accountId: string): number {
  const account = getAccount(accountId);
  if (!account) return 0;

  const transactions = getTransactions(accountId);
  let balance = account.initialBalance;

  transactions.forEach((t) => {
    if (t.type === 'income') {
      balance += t.amount;
    } else {
      balance -= t.amount;
    }
  });

  return balance;
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportData(): string {
  const state = getState();
  return JSON.stringify(state, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    // Basic validation
    if (
      data.accounts &&
      data.transactions &&
      data.autoPays &&
      data.templates &&
      data.notifications
    ) {
      setState(data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
