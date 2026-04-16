/**
 * Main Layout Component - Persistent sidebar navigation
 * Design: Minimalist Functional - Clean sidebar with essential navigation
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Clock,
  Copy,
  Menu,
  X,
  PieChart,
  Settings as SettingsIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Accounts', href: '/accounts', icon: <Wallet className="w-5 h-5" /> },
  { label: 'Transactions', href: '/transactions', icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Scheduled Payments', href: '/autopay', icon: <Clock className="w-5 h-5" /> },
  { label: 'Templates', href: '/templates', icon: <Copy className="w-5 h-5" /> },
  { label: 'Budgets', href: '/budgets', icon: <PieChart className="w-5 h-5" /> },
  { label: 'Settings', href: '/settings', icon: <SettingsIcon className="w-5 h-5" /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-900">Finance</h1>
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Personal Finance Tracker</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              All data stored locally
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Works offline
            </p>
            <p className="text-xs text-slate-400 mt-2">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <h1 className="font-bold text-slate-900">Finance Tracker</h1>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
