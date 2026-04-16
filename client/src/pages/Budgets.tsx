import { useState, useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface BudgetFormData {
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
}

export default function Budgets() {
  const { budgets, transactions, addBudget, deleteBudget, updateBudget } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, watch, setValue } = useForm<BudgetFormData>({
    defaultValues: {
      period: 'monthly',
    },
  });

  const period = watch('period');

  // Calculate spending for each budget
  const budgetSpending = useMemo(() => {
    const now = new Date();
    const spending: Record<string, number> = {};

    budgets.forEach((budget) => {
      const startDate = budget.period === 'monthly' ? startOfMonth(now) : startOfYear(now);
      const endDate = budget.period === 'monthly' ? endOfMonth(now) : endOfYear(now);

      const categorySpending = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.category === budget.category &&
            new Date(t.date) >= startDate &&
            new Date(t.date) <= endDate
        )
        .reduce((sum, t) => sum + t.amount, 0);

      spending[budget.id!] = categorySpending;
    });

    return spending;
  }, [budgets, transactions]);

  const onSubmit = async (data: BudgetFormData) => {
    if (editingId) {
      await updateBudget(editingId, data);
      setEditingId(null);
    } else {
      await addBudget(data);
    }
    reset();
    setIsOpen(false);
  };

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
    setValue('category', budget.category);
    setValue('limit', budget.limit);
    setValue('period', budget.period);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingId(null);
      reset();
    }
    setIsOpen(open);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-1">Set and track spending limits</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              New Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update your budget' : 'Set a spending limit for a category'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Groceries"
                  {...register('category', { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="limit">Spending Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('limit', { valueAsNumber: true, required: true })}
                />
              </div>
              <div>
                <Label htmlFor="period">Period</Label>
                <Select defaultValue="monthly" onValueChange={(value) => setValue('period', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingId ? 'Update Budget' : 'Create Budget'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const spent = budgetSpending[budget.id!] || 0;
          const percentage = (spent / budget.limit) * 100;
          const isOverBudget = spent > budget.limit;

          return (
            <Card key={budget.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                    <CardDescription className="capitalize">{budget.period}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(budget.id!)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Spent</span>
                    <span className={`text-sm font-semibold ${isOverBudget ? 'text-destructive' : ''}`}>
                      {spent.toFixed(2)} / {budget.limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverBudget ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
                {isOverBudget && (
                  <p className="text-sm text-destructive font-medium">
                    Over budget by {(spent - budget.limit).toFixed(2)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No budgets yet. Create your first budget to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
