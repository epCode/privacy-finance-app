import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit2, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

interface RecurringPaymentFormData {
  accountId: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  isConstant: boolean;
  startDate: string;
  startTime: string;
  endDate?: string;
  notificationMessage?: string;
  defaultAmount: number;
}

export default function RecurringPayments() {
  const { accounts, recurringPayments, addRecurringPayment, deleteRecurringPayment, updateRecurringPayment } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, watch, setValue } = useForm<RecurringPaymentFormData>({
    defaultValues: {
      isConstant: true,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '17:00',
      frequency: 'monthly',
    },
  });

  const isConstant = watch('isConstant');

  const onSubmit = async (data: RecurringPaymentFormData) => {
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
    const paymentData = {
      ...data,
      startDate: startDateTime,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    };

    if (editingId) {
      await updateRecurringPayment(editingId, paymentData);
      setEditingId(null);
    } else {
      await addRecurringPayment(paymentData);
    }
    reset();
    setIsOpen(false);
  };

  const handleEdit = (payment: any) => {
    setEditingId(payment.id);
    setValue('accountId', payment.accountId);
    setValue('name', payment.name);
    setValue('amount', payment.amount);
    setValue('frequency', payment.frequency);
    setValue('isConstant', payment.isConstant);
    setValue('startDate', format(new Date(payment.startDate), 'yyyy-MM-dd'));
    setValue('startTime', format(new Date(payment.startDate), 'HH:mm'));
    if (payment.endDate) {
      setValue('endDate', format(new Date(payment.endDate), 'yyyy-MM-dd'));
    }
    setValue('notificationMessage', payment.notificationMessage);
    setValue('defaultAmount', payment.defaultAmount);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring payment?')) {
      await deleteRecurringPayment(id);
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
          <h1 className="text-3xl font-bold">Recurring Payments</h1>
          <p className="text-muted-foreground mt-1">Manage automatic and scheduled payments</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              New Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Payment' : 'Create Recurring Payment'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update your recurring payment' : 'Set up a new recurring payment'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="accountId">Account</Label>
                <Select defaultValue="" onValueChange={(value) => setValue('accountId', value)}>
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
              <div>
                <Label htmlFor="name">Payment Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Monthly Rent"
                  {...register('name', { required: true })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select defaultValue="monthly" onValueChange={(value) => setValue('frequency', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate', { required: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register('startTime', { required: true })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isConstant"
                  checked={isConstant}
                  onCheckedChange={(checked) => setValue('isConstant', checked as boolean)}
                />
                <Label htmlFor="isConstant" className="cursor-pointer">
                  Constant amount (auto-process without confirmation)
                </Label>
              </div>
              {!isConstant && (
                <div>
                  <Label htmlFor="notificationMessage">Custom Notification Message</Label>
                  <Input
                    id="notificationMessage"
                    placeholder="e.g., Check your bill and confirm amount"
                    {...register('notificationMessage')}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="defaultAmount">Default Amount</Label>
                <Input
                  id="defaultAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('defaultAmount', { valueAsNumber: true, required: true })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? 'Update Payment' : 'Create Payment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {recurringPayments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <Clock className="text-muted-foreground mt-1" size={20} />
                  <div>
                    <div className="font-semibold">{payment.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.frequency.charAt(0).toUpperCase() + payment.frequency.slice(1)} • {' '}
                      {payment.isConstant ? 'Auto-process' : 'Requires confirmation'}
                    </div>
                    {!payment.isConstant && payment.notificationMessage && (
                      <div className="text-sm text-blue-600 mt-1">{payment.notificationMessage}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-lg font-bold text-right">{payment.defaultAmount.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground text-right">
                      {format(new Date(payment.startDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(payment)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(payment.id!)}
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

      {recurringPayments.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No recurring payments yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
