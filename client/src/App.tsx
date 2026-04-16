import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FinanceProvider } from "@/contexts/FinanceContext";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Accounts from "@/pages/Accounts";
import Transactions from "@/pages/Transactions";
import Templates from "@/pages/Templates";
import RecurringPayments from "@/pages/RecurringPayments";
import Budgets from "@/pages/Budgets";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Accounts", href: "/accounts" },
    { label: "Transactions", href: "/transactions" },
    { label: "Templates", href: "/templates" },
    { label: "Recurring Payments", href: "/recurring" },
    { label: "Budgets", href: "/budgets" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-50 transform transition-transform md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">Privacy Finance</h1>
          <p className="text-xs text-muted-foreground mt-1">Local • Offline • Secure</p>
        </div>

        <nav className="space-y-2 px-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={onClose}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/accounts"} component={Accounts} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/templates"} component={Templates} />
      <Route path={"/recurring"} component={RecurringPayments} />
      <Route path={"/budgets"} component={Budgets} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-background border-b border-border z-40 md:hidden">
          <div className="flex items-center justify-between p-4">
            <h1 className="font-bold">Privacy Finance</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Router />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <FinanceProvider>
            <Toaster />
            <AppContent />
          </FinanceProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
