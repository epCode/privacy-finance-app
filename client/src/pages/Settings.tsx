/**
 * Settings Page - Data management, export/import, and app information
 * Design: Minimalist Functional - Simple settings interface
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import * as storage from '@/lib/storage';
import { Download, Upload, Trash2, Info } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Settings() {
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    try {
      const data = storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (storage.importData(content)) {
          toast.success('Data imported successfully');
          window.location.reload();
        } else {
          toast.error('Invalid backup file format');
        }
      } catch (error) {
        toast.error('Failed to import data');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'This will permanently delete all data. This action cannot be undone. Are you sure?'
      )
    ) {
      storage.clearAllData();
      toast.success('All data cleared');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your data and application preferences</p>
        </div>

        {/* App Information */}
        <Card className="border-slate-200 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-slate-600" />
              <CardTitle>About</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-slate-500">Application</Label>
              <p className="text-slate-900 font-semibold">Personal Finance Tracker</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Version</Label>
              <p className="text-slate-900">1.0.0</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Storage</Label>
              <p className="text-slate-900">Local Browser Storage (IndexedDB)</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Privacy</Label>
              <p className="text-slate-900">All data is stored locally on your device. No data is sent to any server.</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-slate-200 mb-6">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export, import, or clear your financial data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Export Data</Label>
              <p className="text-sm text-slate-600 mb-3">
                Download a backup of all your data as a JSON file. You can use this to restore your data later.
              </p>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Backup
              </Button>
            </div>

            <div className="border-t border-slate-200 pt-4">
              {/* Import */}
              <Label className="text-sm font-semibold mb-2 block">Import Data</Label>
              <p className="text-sm text-slate-600 mb-3">
                Restore data from a previously exported backup file.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="import"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => document.getElementById('import')?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Import Backup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Danger Zone</CardTitle>
            <CardDescription className="text-red-800">
              Irreversible actions that will permanently delete your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleClearAll}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
