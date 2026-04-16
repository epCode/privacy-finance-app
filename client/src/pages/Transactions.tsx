/**
 * Transactions Page - View and manage one-time transactions
 * Design: Minimalist Functional - Table-based with template usage
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
import { formatCurrency, formatDate, generateId } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { Trash2, Plus, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const EXPENSE_CATEGORIES = [
  'Groceries',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Dining',
  'Shopping',
  'Other',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Bonus', 'Other'];

export default function Transactions() {
  const { accounts, transactions, templates, addTransaction, deleteTransaction } = useApp();
  const [open, setOpen] = useState(false);
  const [templateMode, setTemplateMode] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const categories =
    transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId) {
      toast.error('Please select an account');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    const newTransaction: Transaction = {
      id: generateId(),
      accountId: formData.accountId,
      type: transactionType,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: new Date(formData.date).getTime(),
    };

    addTransaction(newTransaction);
    toast.success('Transaction added');
    setFormData({
      accountId: '',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setTemplateMode(false);
    setOpen(false);
  };

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setTemplateMode(true);
    setTransactionType(template.type);
    setFormData({
      accountId: template.accountId,
      amount: template.amount.toString(),
      category: template.category,
      description: template.description,
      date: new Date().toISOString().split('T')[0],
    });
    setOpen(true);
  };

  const handleDelete = (transactionId: string) => {
    if (window.confirm('Delete this transaction?')) {
      deleteTransaction(transactionId);
      toast.success('Transaction deleted');
    }
  };

  // Group transactions by account
  const transactionsByAccount = accounts.map((account) => ({
    account,
    transactions: transactions.filter((t) => t.accountId === account.id).sort((a, b) => b.date - a.date),
  }));

  // Get templates for current account
  const currentAccountId = formData.accountId;
  const relevantTemplates = templates.filter(
    (t) => t.accountId === currentAccountId && t.type === transactionType && t.isActive
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Transactions</h1>
            <p className="text-slate-600">Track income and expenses</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {templateMode ? 'Use Template' : 'Add Transaction'}
                </DialogTitle>
                <DialogDescription>
                  {templateMode
                    ? 'Edit template values before creating transaction'
                    : 'Record a one-time income or expense'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={transactionType} onValueChange={(value: any) => {
                    setTransactionType(value);
                    setFormData({ ...formData, category: '' });
                  }}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="account">Account</Label>
                  <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
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
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Add notes"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                {/* Show templates if account is selected */}
                {formData.accountId && relevantTemplates.length > 0 && !templateMode && (
                  <div className="border-t border-slate-200 pt-4">
                    <Label className="text-sm font-semibold mb-2 block">Quick Templates</Label>
                    <div className="space-y-2">
                      {relevantTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleUseTemplate(template.id)}
                          className="w-full text-left p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm text-slate-900">{template.name}</p>
                              <p className="text-xs text-slate-500">{template.category}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-mono font-bold text-sm text-slate-900">
                                {formatCurrency(template.amount)}
                              </p>
                              <Copy className="w-4 h-4 text-teal-600" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  {templateMode ? 'Create from Template' : 'Add Transaction'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transactions by Account */}
        {transactionsByAccount.every((ta) => ta.transactions.length === 0) ? (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-4">No transactions yet</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Create your first transaction</Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {transactionsByAccount.map(({ account, transactions: txns }) => {
              if (txns.length === 0) return null;

              return (
                <Card key={account.id} className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-3 font-semibold text-slate-900">Date</th>
                            <th className="text-left py-2 px-3 font-semibold text-slate-900">Description</th>
                            <th className="text-left py-2 px-3 font-semibold text-slate-900">Category</th>
                            <th className="text-right py-2 px-3 font-semibold text-slate-900">Amount</th>
                            <th className="text-center py-2 px-3 font-semibold text-slate-900">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {txns.map((txn) => (
                            <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-3 text-slate-600">{formatDate(txn.date)}</td>
                              <td className="py-3 px-3 text-slate-900 font-medium">{txn.description || '—'}</td>
                              <td className="py-3 px-3 text-slate-600">{txn.category}</td>
                              <td className={`py-3 px-3 font-mono font-bold text-right ${
                                txn.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount, account.currency)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleDelete(txn.id)}
                                  className="text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
