import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db, Account, Transaction, Template, RecurringPayment, Budget, Notification } from '@/lib/db';
import { processRecurringPayment, getPaymentsDueToday } from '@/lib/scheduler';
import { toast } from 'sonner';

interface FinanceContextType {
  // Accounts
  accounts: Account[];
  selectedAccount: Account | null;
  setSelectedAccount: (account: Account | null) => void;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  loadAccounts: () => Promise<void>;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadTransactions: (accountId?: string) => Promise<void>;

  // Templates
  templates: Template[];
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  loadTemplates: () => Promise<void>;

  // Recurring Payments
  recurringPayments: RecurringPayment[];
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecurringPayment: (id: string, updates: Partial<RecurringPayment>) => Promise<void>;
  deleteRecurringPayment: (id: string) => Promise<void>;
  loadRecurringPayments: () => Promise<void>;
  processPayment: (paymentId: string, actualAmount?: number) => Promise<void>;

  // Budgets
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  loadBudgets: () => Promise<void>;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  loadNotifications: () => Promise<void>;

  // General
  loading: boolean;
  error: string | null;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account operations
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.accounts.toArray();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  const addAccount = useCallback(async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAccount: Account = {
        ...account,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.accounts.add(newAccount);
      await loadAccounts();
      toast.success('Account created');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      toast.error(message);
    }
  }, [loadAccounts]);

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    try {
      await db.accounts.update(id, { ...updates, updatedAt: new Date() });
      await loadAccounts();
      toast.success('Account updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update account';
      setError(message);
      toast.error(message);
    }
  }, [loadAccounts]);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      await db.accounts.delete(id);
      await db.transactions.where('accountId').equals(id).delete();
      await db.recurringPayments.where('accountId').equals(id).delete();
      await loadAccounts();
      setSelectedAccount(null);
      toast.success('Account deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      setError(message);
      toast.error(message);
    }
  }, [loadAccounts]);

  // Transaction operations
  const loadTransactions = useCallback(async (accountId?: string) => {
    try {
      setLoading(true);
      let query = db.transactions.toArray();
      if (accountId) {
        query = db.transactions.where('accountId').equals(accountId).toArray();
      }
      const data = await query;
      setTransactions(data.sort((a, b) => b.date.getTime() - a.date.getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.transactions.add(newTransaction);

      // Update account balance
      const account = await db.accounts.get(transaction.accountId);
      if (account) {
        const newBalance = transaction.type === 'income'
          ? account.balance + transaction.amount
          : account.balance - transaction.amount;
        await db.accounts.update(transaction.accountId, {
          balance: newBalance,
          updatedAt: new Date(),
        });
      }

      await loadTransactions(transaction.accountId);
      await loadAccounts();
      toast.success('Transaction added');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add transaction';
      setError(message);
      toast.error(message);
    }
  }, [loadTransactions, loadAccounts]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      const transaction = await db.transactions.get(id);
      if (!transaction) throw new Error('Transaction not found');

      await db.transactions.update(id, { ...updates, updatedAt: new Date() });
      await loadTransactions(transaction.accountId);
      await loadAccounts();
      toast.success('Transaction updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(message);
      toast.error(message);
    }
  }, [loadTransactions, loadAccounts]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const transaction = await db.transactions.get(id);
      if (!transaction) throw new Error('Transaction not found');

      // Reverse the balance change
      const account = await db.accounts.get(transaction.accountId);
      if (account) {
        const newBalance = transaction.type === 'income'
          ? account.balance - transaction.amount
          : account.balance + transaction.amount;
        await db.accounts.update(transaction.accountId, {
          balance: newBalance,
          updatedAt: new Date(),
        });
      }

      await db.transactions.delete(id);
      await loadTransactions(transaction.accountId);
      await loadAccounts();
      toast.success('Transaction deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(message);
      toast.error(message);
    }
  }, [loadTransactions, loadAccounts]);

  // Template operations
  const loadTemplates = useCallback(async () => {
    try {
      const data = await db.templates.toArray();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    }
  }, []);

  const addTemplate = useCallback(async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTemplate: Template = {
        ...template,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.templates.add(newTemplate);
      await loadTemplates();
      toast.success('Template created');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create template';
      setError(message);
      toast.error(message);
    }
  }, [loadTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await db.templates.delete(id);
      await loadTemplates();
      toast.success('Template deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete template';
      setError(message);
      toast.error(message);
    }
  }, [loadTemplates]);

  // Recurring Payment operations
  const loadRecurringPayments = useCallback(async () => {
    try {
      const data = await db.recurringPayments.toArray();
      setRecurringPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recurring payments');
    }
  }, []);

  const addRecurringPayment = useCallback(async (payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPayment: RecurringPayment = {
        ...payment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.recurringPayments.add(newPayment);
      await loadRecurringPayments();
      toast.success('Recurring payment created');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create recurring payment';
      setError(message);
      toast.error(message);
    }
  }, [loadRecurringPayments]);

  const updateRecurringPayment = useCallback(async (id: string, updates: Partial<RecurringPayment>) => {
    try {
      await db.recurringPayments.update(id, { ...updates, updatedAt: new Date() });
      await loadRecurringPayments();
      toast.success('Recurring payment updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update recurring payment';
      setError(message);
      toast.error(message);
    }
  }, [loadRecurringPayments]);

  const deleteRecurringPayment = useCallback(async (id: string) => {
    try {
      await db.recurringPayments.delete(id);
      await loadRecurringPayments();
      toast.success('Recurring payment deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete recurring payment';
      setError(message);
      toast.error(message);
    }
  }, [loadRecurringPayments]);

  const processPayment = useCallback(async (paymentId: string, actualAmount?: number) => {
    try {
      const payment = await db.recurringPayments.get(paymentId);
      if (!payment) throw new Error('Payment not found');

      await processRecurringPayment(payment, actualAmount);
      await loadRecurringPayments();
      await loadAccounts();
      await loadTransactions(payment.accountId);
      toast.success('Payment processed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process payment';
      setError(message);
      toast.error(message);
    }
  }, [loadRecurringPayments, loadAccounts, loadTransactions]);

  // Budget operations
  const loadBudgets = useCallback(async () => {
    try {
      const data = await db.budgets.toArray();
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    }
  }, []);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBudget: Budget = {
        ...budget,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.budgets.add(newBudget);
      await loadBudgets();
      toast.success('Budget created');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create budget';
      setError(message);
      toast.error(message);
    }
  }, [loadBudgets]);

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    try {
      await db.budgets.update(id, { ...updates, updatedAt: new Date() });
      await loadBudgets();
      toast.success('Budget updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update budget';
      setError(message);
      toast.error(message);
    }
  }, [loadBudgets]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await db.budgets.delete(id);
      await loadBudgets();
      toast.success('Budget deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete budget';
      setError(message);
      toast.error(message);
    }
  }, [loadBudgets]);

  // Notification operations
  const loadNotifications = useCallback(async () => {
    try {
      const data = await db.notifications.toArray();
      setNotifications(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  }, []);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const newNotification: Notification = {
        ...notification,
        createdAt: new Date(),
      };
      await db.notifications.add(newNotification);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add notification');
    }
  }, [loadNotifications]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await db.notifications.update(id, { isRead: true });
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, [loadNotifications]);

  // Initialize data on mount
  useEffect(() => {
    loadAccounts();
    loadTransactions();
    loadTemplates();
    loadRecurringPayments();
    loadBudgets();
    loadNotifications();
  }, [loadAccounts, loadTransactions, loadTemplates, loadRecurringPayments, loadBudgets, loadNotifications]);

  const value: FinanceContextType = {
    accounts,
    selectedAccount,
    setSelectedAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    loadAccounts,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loadTransactions,
    templates,
    addTemplate,
    deleteTemplate,
    loadTemplates,
    recurringPayments,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    loadRecurringPayments,
    processPayment,
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    loadBudgets,
    notifications,
    addNotification,
    markNotificationAsRead,
    loadNotifications,
    loading,
    error,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
}
