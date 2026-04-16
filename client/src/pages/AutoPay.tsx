/**
 * AutoPay Page - Manage scheduled recurring payments
 * Design: Minimalist Functional - Clear distinction between constant and non-constant bills
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { calculateNextDueDate, formatCurrency, formatDate, formatRelativeTime, generateId } from '@/lib/utils';
import type { AutoPay } from '@/lib/types';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { useState } from 'react';
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
  'Other',
];

export default function AutoPayPage() {
  const { accounts, autoPays, addAutoPay, updateAutoPay, deleteAutoPay } = useApp();
  const [open, setOpen] = useState(false);
  const [isNonConstant, setIsNonConstant] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    name: '',
    amount: '',
    frequency: 'monthly' as const,
    category: '',
    customNotificationMessage: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '17:00',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId) {
      toast.error('Please select an account');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Payment name is required');
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

    const amount = parseFloat(formData.amount);
    const startDate = new Date(formData.startDate);
    const [hours, minutes] = formData.startTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes));
    const nextDueDate = calculateNextDueDate(startDate.getTime(), formData.frequency);

    const newAutoPay: AutoPay = {
      id: generateId(),
      accountId: formData.accountId,
      name: formData.name,
      amount,
      frequency: formData.frequency,
      category: formData.category,
      isNonConstant,
      defaultAmount: amount,
      customNotificationMessage: isNonConstant ? formData.customNotificationMessage : undefined,
      nextDueDate,
      isActive: true,
      createdAt: Date.now(),
      startDate: startDate.getTime(),
      endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
      timeOfDay: formData.startTime,
    };

    addAutoPay(newAutoPay);
    toast.success('Scheduled payment created');
    setFormData({
      accountId: '',
      name: '',
      amount: '',
      frequency: 'monthly',
      category: '',
      customNotificationMessage: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '17:00',
      endDate: '',
    });
    setIsNonConstant(false);
    setOpen(false);
  };

  const handleDelete = (autoPayId: string, name: string) => {
    if (window.confirm(`Delete scheduled payment "${name}"?`)) {
      deleteAutoPay(autoPayId);
      toast.success('Scheduled payment deleted');
    }
  };

  const handleToggleActive = (autoPayId: string, isActive: boolean) => {
    updateAutoPay(autoPayId, { isActive: !isActive });
  };

  // Group by account
  const autoPaysByAccount = accounts.map((account) => ({
    account,
    autoPays: autoPays.filter((ap) => ap.accountId === account.id),
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Scheduled Payments</h1>
            <p className="text-slate-600">Manage recurring bills and automatic payments</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Scheduled Payment</DialogTitle>
                <DialogDescription>Set up a recurring bill or payment</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="name">Payment Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Netflix, Rent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Default Amount</Label>
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
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger id="frequency">
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

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="nonConstant"
                    checked={isNonConstant}
                    onCheckedChange={(checked) => setIsNonConstant(checked as boolean)}
                  />
                  <Label htmlFor="nonConstant" className="cursor-pointer">
                    Amount varies (non-constant)
                  </Label>
                </div>

                {isNonConstant && (
                  <div>
                    <Label htmlFor="customMessage">Custom Reminder Message (optional)</Label>
                    <Textarea
                      id="customMessage"
                      placeholder="e.g., Check your electricity bill before confirming"
                      value={formData.customNotificationMessage}
                      onChange={(e) => setFormData({ ...formData, customNotificationMessage: e.target.value })}
                      className="min-h-20"
                    />
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Schedule Details</h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Time of Day</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date (optional - leave empty for indefinite)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Create Payment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* AutoPays by Account */}
        {autoPaysByAccount.every((apa) => apa.autoPays.length === 0) ? (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-4">No scheduled payments yet</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Create your first payment</Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {autoPaysByAccount.map(({ account, autoPays: aps }) => {
              if (aps.length === 0) return null;

              return (
                <Card key={account.id} className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aps.map((ap) => (
                        <div
                          key={ap.id}
                          className={`p-4 border rounded-lg transition-opacity ${
                            ap.isActive
                              ? 'border-slate-200 bg-white'
                              : 'border-slate-100 bg-slate-50 opacity-60'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-slate-900">{ap.name}</h3>
                                {ap.isNonConstant && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                                    <AlertCircle className="w-3 h-3" />
                                    Non-constant
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-3">
                                <div>
                                  <p className="text-xs text-slate-500">Amount</p>
                                  <p className="font-mono font-bold text-slate-900">
                                    {formatCurrency(ap.defaultAmount, account.currency)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Frequency</p>
                                  <p className="capitalize">{ap.frequency}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Category</p>
                                  <p>{ap.category}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Next Due</p>
                                  <p className="font-semibold text-teal-700">
                                    {formatRelativeTime(ap.nextDueDate)}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-xs mb-3 p-2 bg-slate-50 rounded">
                                <div>
                                  <p className="text-slate-500">Start Date</p>
                                  <p className="text-slate-900 font-semibold">{formatDate(ap.startDate)}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Time</p>
                                  <p className="text-slate-900 font-semibold">{ap.timeOfDay}</p>
                                </div>
                                {ap.endDate && (
                                  <div className="col-span-2">
                                    <p className="text-slate-500">Ends</p>
                                    <p className="text-slate-900 font-semibold">{formatDate(ap.endDate)}</p>
                                  </div>
                                )}
                              </div>

                              {ap.customNotificationMessage && (
                                <div className="p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                                  {ap.customNotificationMessage}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleToggleActive(ap.id, ap.isActive)}
                                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                                  ap.isActive
                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                {ap.isActive ? 'Active' : 'Paused'}
                              </button>
                              <button
                                onClick={() => handleDelete(ap.id, ap.name)}
                                className="text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
