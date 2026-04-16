import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

interface TransactionFormData {
  accountId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  note?: string;
}

export default function Transactions() {
  const { accounts, selectedAccount, transactions, addTransaction, deleteTransaction, updateTransaction, templates } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [useTemplate, setUseTemplate] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<TransactionFormData>({
    defaultValues: {
      accountId: selectedAccount?.id || '',
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const accountId = watch('accountId');
  const filteredTransactions = accountId
    ? transactions.filter((t) => t.accountId === accountId)
    : transactions;

  const onSubmit = async (data: TransactionFormData) => {
    const transactionData = {
      ...data,
      date: new Date(data.date),
    };
    if (editingId) {
      await updateTransaction(editingId, transactionData);
      setEditingId(null);
    } else {
      await addTransaction(transactionData);
    }
    reset();
    setIsOpen(false);
  };

  const handleEdit = (transaction: any) => {
    setEditingId(transaction.id);
    setValue('accountId', transaction.accountId);
    setValue('amount', transaction.amount);
    setValue('type', transaction.type);
    setValue('category', transaction.category);
    setValue('date', format(new Date(transaction.date), 'yyyy-MM-dd'));
    setValue('note', transaction.note);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const handleUseTemplate = (template: any) => {
    setValue('amount', template.defaultAmount);
    setValue('category', template.category);
    setValue('note', template.note);
    setUseTemplate(false);
    setIsOpen(true);
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
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">Track your income and expenses</p>
        </div>
        <div className="flex gap-2">
          {templates.length > 0 && (
            <Dialog open={useTemplate} onOpenChange={setUseTemplate}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Copy size={20} />
                  Use Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select a Template</DialogTitle>
                  <DialogDescription>Choose a template to auto-fill your transaction</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <div>
                        <div className="font-semibold">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.category} - {template.defaultAmount.toFixed(2)}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={20} />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update your transaction' : 'Record a new transaction'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="accountId">Account</Label>
                  <Select value={accountId} onValueChange={(value) => setValue('accountId', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id!}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select defaultValue="expense" onValueChange={(value) => setValue('type', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
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
                      {...register('amount', { valueAsNumber: true, required: true })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Groceries, Salary"
                    {...register('category', { required: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date', { required: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Input
                    id="note"
                    placeholder="Add a note..."
                    {...register('note')}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? 'Update Transaction' : 'Add Transaction'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{transaction.category}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    {transaction.note && ` • ${transaction.note}`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount.toFixed(2)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id!)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No transactions yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
