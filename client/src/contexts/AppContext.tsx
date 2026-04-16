/**
 * Global app context for managing finance tracker state
 * Design: Minimalist Functional - Focus on clarity and performance
 */

import React, { createContext, useCallback, useContext, useState } from 'react';
import type {
  Account,
  AppState,
  AutoPay,
  Budget,
  Notification,
  Template,
  Transaction,
} from '@/lib/types';
import * as storage from '@/lib/storage';

interface AppContextType {
  // State
  accounts: Account[];
  transactions: Transaction[];
  autoPays: AutoPay[];
  templates: Template[];
  budgets: Budget[];
  notifications: Notification[];

  // Account operations
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Transaction operations
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // AutoPay operations
  addAutoPay: (autoPay: AutoPay) => void;
  updateAutoPay: (id: string, updates: Partial<AutoPay>) => void;
  deleteAutoPay: (id: string) => void;

  // Template operations
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;

  // Budget operations
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Notification operations
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;

  // Utility functions
  calculateBalance: (accountId: string) => number;
  refreshState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(storage.getState());

  // Refresh state from localStorage
  const refreshState = useCallback(() => {
    setState(storage.getState());
  }, []);

  // Account operations
  const addAccount = useCallback((account: Account) => {
    storage.addAccount(account);
    refreshState();
  }, [refreshState]);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    storage.updateAccount(id, updates);
    refreshState();
  }, [refreshState]);

  const deleteAccount = useCallback((id: string) => {
    storage.deleteAccount(id);
    refreshState();
  }, [refreshState]);

  // Transaction operations
  const addTransaction = useCallback((transaction: Transaction) => {
    storage.addTransaction(transaction);
    refreshState();
  }, [refreshState]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    storage.updateTransaction(id, updates);
    refreshState();
  }, [refreshState]);

  const deleteTransaction = useCallback((id: string) => {
    storage.deleteTransaction(id);
    refreshState();
  }, [refreshState]);

  // AutoPay operations
  const addAutoPay = useCallback((autoPay: AutoPay) => {
    storage.addAutoPay(autoPay);
    refreshState();
  }, [refreshState]);

  const updateAutoPay = useCallback((id: string, updates: Partial<AutoPay>) => {
    storage.updateAutoPay(id, updates);
    refreshState();
  }, [refreshState]);

  const deleteAutoPay = useCallback((id: string) => {
    storage.deleteAutoPay(id);
    refreshState();
  }, [refreshState]);

  // Template operations
  const addTemplate = useCallback((template: Template) => {
    storage.addTemplate(template);
    refreshState();
  }, [refreshState]);

  const updateTemplate = useCallback((id: string, updates: Partial<Template>) => {
    storage.updateTemplate(id, updates);
    refreshState();
  }, [refreshState]);

  const deleteTemplate = useCallback((id: string) => {
    storage.deleteTemplate(id);
    refreshState();
  }, [refreshState]);

  // Budget operations
  const addBudget = useCallback((budget: Budget) => {
    storage.addBudget(budget);
    refreshState();
  }, [refreshState]);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    storage.updateBudget(id, updates);
    refreshState();
  }, [refreshState]);

  const deleteBudget = useCallback((id: string) => {
    storage.deleteBudget(id);
    refreshState();
  }, [refreshState]);

  // Notification operations
  const addNotification = useCallback((notification: Notification) => {
    storage.addNotification(notification);
    refreshState();
  }, [refreshState]);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    storage.updateNotification(id, updates);
    refreshState();
  }, [refreshState]);

  const deleteNotification = useCallback((id: string) => {
    storage.deleteNotification(id);
    refreshState();
  }, [refreshState]);

  // Utility functions
  const calculateBalance = useCallback((accountId: string): number => {
    return storage.calculateAccountBalance(accountId);
  }, []);

  const value: AppContextType = {
    accounts: state.accounts,
    transactions: state.transactions,
    autoPays: state.autoPays,
    templates: state.templates,
    budgets: state.budgets,
    notifications: state.notifications,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAutoPay,
    updateAutoPay,
    deleteAutoPay,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addBudget,
    updateBudget,
    deleteBudget,
    addNotification,
    updateNotification,
    deleteNotification,
    calculateBalance,
    refreshState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
