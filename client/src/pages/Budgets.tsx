/**
 * Budgets Page - Set and monitor spending limits
 * Design: Minimalist Functional - Clear budget status and progress tracking
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, generateId } from '@/lib/utils';
import type { Budget } from '@/lib/types';
import { Trash2, Plus, AlertTriangle, TrendingDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

const CATEGORIES = [
  'Utilities',
  'Rent/Mortgage',
  'Insurance',
  'Subscription',
  'Loan',
  'Phone',
  'Internet',
  'Gym',
  'Groceries',
  'Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Other',
];

export default function BudgetsPage() {
  const { accounts, transactions, budgets, addBudget, deleteBudget } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    category: '',
    limit: '',
    period: 'monthly' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId) {
      toast.error('Please select an account');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      toast.error('Budget limit must be greater than 0');
      return;
    }

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const year = String(now.getFullYear());

    const newBudget: Budget = {
      id: generateId(),
      accountId: formData.accountId,
      category: formData.category,
      limit: parseFloat(formData.limit),
      period: formData.period,
      month: (formData.period as string) === 'monthly' ? month : undefined,
      year: (formData.period as string) === 'yearly' ? year : undefined,
      createdAt: Date.now(),
      isActive: true,
    };

    addBudget(newBudget);
    toast.success('Budget created');
    setFormData({
      accountId: '',
      category: '',
      limit: '',
      period: 'monthly',
    });
    setOpen(false);
  };

  const handleDelete = (budgetId: string, category: string) => {
    if (window.confirm(`Delete budget for "${category}"?`)) {
      deleteBudget(budgetId);
      toast.success('Budget deleted');
    }
  };

  // Calculate spending for each budget
  const budgetStatus = useMemo(() => {
    return budgets
      .filter((b: any) => b.isActive)
      .map((budget: any) => {
        const now = new Date();
        let relevantTransactions = transactions.filter(
          (t) =>
            t.accountId === budget.accountId &&
            t.category === budget.category &&
            t.type === 'expense'
        );

        // Filter by period
        if (budget.period === 'monthly' && budget.month) {
          const [year, month] = budget.month.split('-');
          relevantTransactions = relevantTransactions.filter((t) => {
            const tDate = new Date(t.date);
            return (
              tDate.getFullYear() === parseInt(year) &&
              tDate.getMonth() === parseInt(month) - 1
            );
          });
        } else if (budget.period === 'yearly' && budget.year) {
          relevantTransactions = relevantTransactions.filter((t) => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === parseInt(budget.year!);
          });
        }

        const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget.limit - spent;
        const percentUsed = (spent / budget.limit) * 100;
        const isOverBudget = spent > budget.limit;

        return {
          budget,
          spent,
          remaining,
          percentUsed,
          isOverBudget,
        };
      });
  }, [budgets, transactions]);

  // Group by account
  const budgetsByAccount = accounts.map((account) => ({
    account,
    budgets: budgetStatus.filter((bs: any) => bs.budget.accountId === account.id),
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Budgets</h1>
            <p className="text-slate-600">Set spending limits and track progress</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Budget</DialogTitle>
                <DialogDescription>Set a spending limit for a category</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="account">Account</Label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                  >
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="limit">Monthly Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value: any) => setFormData({ ...formData, period: value })}
                  >
                    <SelectTrigger id="period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Create Budget
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Budgets by Account */}
        {budgetsByAccount.every((ba) => ba.budgets.length === 0) ? (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-4">No budgets created yet</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Create your first budget</Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {budgetsByAccount.map(({ account, budgets: bs }: any) => {
              if (bs.length === 0) return null;

              return (
                <Card key={account.id} className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bs.map(({ budget, spent, remaining, percentUsed, isOverBudget }: any) => (
                        <div
                          key={budget.id}
                          className={`p-4 border rounded-lg ${
                            isOverBudget
                              ? 'border-red-200 bg-red-50'
                              : percentUsed > 80
                                ? 'border-amber-200 bg-amber-50'
                                : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900">{budget.category}</h3>
                                {isOverBudget && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                    <AlertTriangle className="w-3 h-3" />
                                    Over Budget
                                  </span>
                                )}
                                {!isOverBudget && percentUsed > 80 && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                    <TrendingDown className="w-3 h-3" />
                                    {Math.round(percentUsed)}% Used
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                {budget.period === 'monthly' ? 'Monthly' : 'Yearly'} limit
                              </p>
                            </div>

                            <button
                              onClick={() => handleDelete(budget.id, budget.category)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Progress bar */}
                          <div className="mb-3">
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  isOverBudget
                                    ? 'bg-red-600'
                                    : percentUsed > 80
                                      ? 'bg-amber-500'
                                      : 'bg-teal-600'
                                }`}
                                style={{ width: `${Math.min(percentUsed, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Budget details */}
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-slate-500 text-xs">Spent</p>
                              <p className="font-mono font-bold text-slate-900">
                                {formatCurrency(spent, account.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs">Limit</p>
                              <p className="font-mono font-bold text-slate-900">
                                {formatCurrency(budget.limit, account.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs">
                                {isOverBudget ? 'Over by' : 'Remaining'}
                              </p>
                              <p
                                className={`font-mono font-bold ${
                                  isOverBudget ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                {formatCurrency(Math.abs(remaining), account.currency)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
