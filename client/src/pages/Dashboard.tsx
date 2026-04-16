import { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function Dashboard() {
  const { accounts, transactions, recurringPayments, notifications, markNotificationAsRead } = useFinance();

  // Calculate totals
  const totals = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const thisMonth = new Date();
    const monthStart = startOfMonth(thisMonth);
    const monthEnd = endOfMonth(thisMonth);

    const monthlyIncome = transactions
      .filter(
        (t) =>
          t.type === 'income' &&
          new Date(t.date) >= monthStart &&
          new Date(t.date) <= monthEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.date) >= monthStart &&
          new Date(t.date) <= monthEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlyNet: monthlyIncome - monthlyExpenses,
    };
  }, [accounts, transactions]);

  // Get recent transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  // Get unread notifications
  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !n.isRead);
  }, [notifications]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your finances</p>
      </div>

      {/* Alerts */}
      {unreadNotifications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Pending Actions</h3>
                <p className="text-sm text-blue-800 mt-1">
                  You have {unreadNotifications.length} notification{unreadNotifications.length > 1 ? 's' : ''} requiring attention.
                </p>
                <div className="mt-3 space-y-2">
                  {unreadNotifications.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="flex items-start justify-between">
                      <div className="text-sm">{notif.message}</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markNotificationAsRead(notif.id!)}
                      >
                        Done
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totals.monthlyIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown size={16} className="text-red-600" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totals.monthlyExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.monthlyNet.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>Quick view of all your accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Wallet size={20} className="text-muted-foreground" />
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{account.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{account.balance.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{account.currency}</div>
                </div>
              </div>
            ))}
          </div>
          {accounts.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No accounts yet. <Link href="/accounts" className="text-primary hover:underline">Create one</Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <div className="font-medium">{transaction.category}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          {recentTransactions.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No transactions yet. <Link href="/transactions" className="text-primary hover:underline">Add one</Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      {recurringPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recurring Payments</CardTitle>
            <CardDescription>Your scheduled payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recurringPayments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <div className="font-medium">{payment.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {payment.frequency} • {payment.isConstant ? 'Auto' : 'Manual'}
                    </div>
                  </div>
                  <div className="font-semibold">{payment.defaultAmount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
