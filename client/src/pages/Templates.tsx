/**
 * Templates Page - Create and manage reusable transaction templates
 * Design: Minimalist Functional - Quick access to common transactions
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
import type { Template, Transaction } from '@/lib/types';
import { Trash2, Plus, Play } from 'lucide-react';
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

export default function Templates() {
  const { accounts, templates, addTemplate, deleteTemplate, addTransaction } = useApp();
  const [open, setOpen] = useState(false);
  const [templateType, setTemplateType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    accountId: '',
    name: '',
    amount: '',
    category: '',
    description: '',
  });

  const categories = templateType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId) {
      toast.error('Please select an account');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Template name is required');
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

    const newTemplate: Template = {
      id: generateId(),
      accountId: formData.accountId,
      name: formData.name,
      type: templateType,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      isActive: true,
      createdAt: Date.now(),
      usageCount: 0,
    };

    addTemplate(newTemplate);
    toast.success('Template created');
    setFormData({
      accountId: '',
      name: '',
      amount: '',
      category: '',
      description: '',
    });
    setOpen(false);
  };

  const handleUseTemplate = (template: Template) => {
    const transaction: Transaction = {
      id: generateId(),
      accountId: template.accountId,
      type: template.type,
      amount: template.amount,
      category: template.category,
      description: template.description,
      date: Date.now(),
      templateId: template.id,
    };

    addTransaction(transaction);
    toast.success(`Transaction created from "${template.name}"`);
  };

  const handleDelete = (templateId: string, templateName: string) => {
    if (window.confirm(`Delete template "${templateName}"?`)) {
      deleteTemplate(templateId);
      toast.success('Template deleted');
    }
  };

  // Group by account
  const templatesByAccount = accounts.map((account) => ({
    account,
    templates: templates.filter((t) => t.accountId === account.id),
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Templates</h1>
            <p className="text-slate-600">Create reusable transaction templates for quick entry</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Template</DialogTitle>
                <DialogDescription>
                  Save a transaction pattern for quick reuse
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={templateType} onValueChange={(value: any) => {
                    setTemplateType(value);
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
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Weekly Groceries"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
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
                    placeholder="e.g., Whole Foods"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Template
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates by Account */}
        {templatesByAccount.every((ta) => ta.templates.length === 0) ? (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-4">No templates yet</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Create your first template</Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {templatesByAccount.map(({ account, templates: tmps }) => {
              if (tmps.length === 0) return null;

              return (
                <Card key={account.id} className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {tmps.map((template) => (
                        <div
                          key={template.id}
                          className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-slate-900">{template.name}</h3>
                              <p className="text-xs text-slate-500 mt-1">{template.category}</p>
                            </div>
                            <button
                              onClick={() => handleDelete(template.id, template.name)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mb-4 p-3 bg-slate-50 rounded">
                            <p className="text-xs text-slate-500">Amount</p>
                            <p className={`text-lg font-mono font-bold ${template.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {template.type === 'income' ? '+' : '−'}
                              {formatCurrency(template.amount, account.currency)}
                            </p>
                          </div>

                          {template.description && (
                            <p className="text-xs text-slate-600 mb-3">{template.description}</p>
                          )}

                          <Button
                            onClick={() => handleUseTemplate(template)}
                            size="sm"
                            className="w-full gap-2"
                          >
                            <Play className="w-3 h-3" />
                            Use Template
                          </Button>
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
