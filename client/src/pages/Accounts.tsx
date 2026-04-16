import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface AccountFormData {
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
}

export default function Accounts() {
  const { accounts, selectedAccount, setSelectedAccount, addAccount, deleteAccount, updateAccount } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, watch, setValue } = useForm<AccountFormData>({
    defaultValues: {
      currency: 'USD',
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    if (editingId) {
      await updateAccount(editingId, data);
      setEditingId(null);
    } else {
      await addAccount(data);
    }
    reset();
    setIsOpen(false);
  };

  const handleEdit = (account: any) => {
    setEditingId(account.id);
    setValue('name', account.name);
    setValue('type', account.type);
    setValue('balance', account.balance);
    setValue('currency', account.currency);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      await deleteAccount(id);
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
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your financial accounts</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              New Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Account' : 'Create New Account'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update your account details' : 'Add a new account to track your finances'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Checking Account"
                  {...register('name', { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="type">Account Type</Label>
                <Select defaultValue="checking" onValueChange={(value) => setValue('type', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('balance', { valueAsNumber: true, required: true })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="USD"
                  {...register('currency', { required: true })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? 'Update Account' : 'Create Account'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card
            key={account.id}
            className={`cursor-pointer transition-all ${
              selectedAccount?.id === account.id
                ? 'ring-2 ring-primary'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedAccount(account)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  <CardDescription className="capitalize">{account.type}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(account);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(account.id!);
                    }}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {account.balance.toFixed(2)} {account.currency}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No accounts yet. Create your first account to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
