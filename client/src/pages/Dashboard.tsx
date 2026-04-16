/**
 * Dashboard Page - Overview of accounts, upcoming bills, and financial summary
 * Design: Minimalist Functional - Clear at-a-glance financial status
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getMonthStart,
  getMonthEnd,
} from '@/lib/utils';
import { AlertCircle, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { accounts, transactions, autoPays, calculateBalance } = useApp();
  const [, navigate] = useLocation();

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + calculateBalance(account.id);
  }, 0);

  // Get current month transactions
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();
  const monthTransactions = transactions.filter(
    (t) => t.date >= monthStart && t.date <= monthEnd
  );

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get upcoming bills (next 7 days)
  const now = Date.now();
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
  const upcomingBills = autoPays
    .filter((ap) => ap.isActive && ap.nextDueDate >= now && ap.nextDueDate <= sevenDaysFromNow)
    .sort((a, b) => a.nextDueDate - b.nextDueDate);

  // Get non-constant bills due soon
  const nonConstantBillsDue = autoPays.filter(
    (ap) => ap.isActive && ap.isNonConstant && ap.nextDueDate <= sevenDaysFromNow
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Your financial overview</p>
        </div>

        {/* Top Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {/* Total Balance */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-3xl font-mono font-bold ${
                  totalBalance < 0 ? 'text-red-600' : 'text-slate-900'
                }`}
              >
                {formatCurrency(totalBalance)}
              </p>
            </CardContent>
          </Card>

          {/* Month Income */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">This Month Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <p className="text-3xl font-mono font-bold text-green-600">
                  {formatCurrency(monthIncome)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Month Expenses */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                This Month Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <p className="text-3xl font-mono font-bold text-red-600">
                  {formatCurrency(monthExpenses)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Accounts Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Bills Alert */}
            {nonConstantBillsDue.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-amber-900">Action Required</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-800 mb-3">
                    {nonConstantBillsDue.length} non-constant bill
                    {nonConstantBillsDue.length !== 1 ? 's' : ''} need your confirmation:
                  </p>
                  <ul className="space-y-2">
                    {nonConstantBillsDue.map((bill) => {
                      return (
                        <li key={bill.id} className="text-sm text-amber-800">
                          <strong>{bill.name}</strong> on {formatDate(bill.nextDueDate)}
                          {bill.customNotificationMessage && (
                            <p className="text-xs mt-1 italic">{bill.customNotificationMessage}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/autopay')}
                    className="mt-4 border-amber-300 text-amber-900 hover:bg-amber-100"
                  >
                    Review Bills
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Accounts */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No accounts created yet</p>
                    <Button variant="outline" onClick={() => navigate('/accounts')}>
                      Create Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accounts.map((account) => {
                      const balance = calculateBalance(account.id);
                      return (
                        <div
                          key={account.id}
                          className="flex justify-between items-center p-3 bg-slate-50 rounded"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{account.name}</p>
                            <p className="text-xs text-slate-500">{account.type}</p>
                          </div>
                          <p
                            className={`font-mono font-bold ${
                              balance < 0 ? 'text-red-600' : 'text-slate-900'
                            }`}
                          >
                            {formatCurrency(balance, account.currency)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Bills */}
          <Card className="border-slate-200 h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-lg">Upcoming Bills</CardTitle>
              </div>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBills.length === 0 ? (
                <p className="text-sm text-slate-600 text-center py-4">No bills due soon</p>
              ) : (
                <div className="space-y-3">
                  {upcomingBills.map((bill) => {
                    const account = accounts.find((a) => a.id === bill.accountId);
                    return (
                      <div key={bill.id} className="p-3 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-slate-900 text-sm">{bill.name}</p>
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                            {bill.frequency}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{bill.category}</p>
                        <div className="flex justify-between items-center">
                          <p className="font-mono font-bold text-sm text-slate-900">
                            {formatCurrency(bill.defaultAmount, account?.currency)}
                          </p>
                          <p className="text-xs text-teal-700 font-semibold">
                            {formatRelativeTime(bill.nextDueDate)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/autopay')}
                className="w-full mt-4"
              >
                Manage Bills
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
