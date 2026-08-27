import React, { useState } from 'react';
import { AppSettings } from '../types';
import { getSettings, saveSettings, exportDatabaseBackup, importDatabaseBackup, resetDatabaseToDefault, addAuditLog } from '../services/db';
import { AlertCircle, CheckCircle2, Download, Moon, Database, RefreshCw, Settings as SettingsIcon, Sun, Upload, Wifi, WifiOff, HardDrive } from 'lucide-react';

interface SettingsViewProps {
  currentUserEmail?: string;
  currentUserId?: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUserEmail = 'system@hikmarisk.med',
  currentUserId = 'system',
  darkMode,
  onToggleDarkMode,
  onRefresh,
}) => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'failed'; message?: string }>({
    status: 'idle',
  });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    addAuditLog(currentUserId, currentUserEmail, 'SETTINGS_UPDATED', `App mode: ${newSettings.mode}, API: ${newSettings.apiUrl}`);
    onRefresh();
  };

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing' });
    try {
      const endpoint = settings.apiUrl.endsWith('/') ? `${settings.apiUrl}health` : `${settings.apiUrl}/health`;
      const res = await fetch(endpoint);
      if (res.ok) {
        setTestResult({ status: 'success', message: 'API connection successful! Server is responsive.' });
      } else {
        setTestResult({ status: 'failed', message: `Server responded with status HTTP ${res.status}` });
      }
    } catch (err: any) {
      setTestResult({
        status: 'failed',
        message: `Connection failed: ${err.message || 'Network unreachable'}. Check URL or ensure server is running.`,
      });
    }
  };

  const handleDownloadBackup = () => {
    const backupJson = exportDatabaseBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hikmarisk_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importDatabaseBackup(content)) {
        setImportStatus('Backup restored successfully!');
        onRefresh();
      } else {
        setImportStatus('Failed to restore backup: Invalid JSON schema.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all data to default seed settings? All custom screenings will be cleared.')) {
      await resetDatabaseToDefault();
      setSettings(getSettings());
      onRefresh();
      alert('Database re-seeded with initial defaults.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-white dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2.5 rounded-2xl bg-[#3B4D8C]/10 text-[#3B4D8C] dark:text-[#5A7BD5]">
              <SettingsIcon className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Application Configuration &amp; Storage</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage online FastAPI backend connections, local storage persistence, theme preferences, and data backups.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection & Mode Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-white dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-[#3B4D8C]" />
            <span>Server Connection Settings</span>
          </h3>

          {/* API Endpoint URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Backend API Endpoint URL</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={settings.apiUrl}
                onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                placeholder="e.g. /api or http://localhost:8000"
                className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-[#3B4D8C] font-mono"
              />
              <button
                onClick={() => handleSaveSettings(settings)}
                className="px-5 py-2.5 bg-[#3B4D8C] hover:bg-[#2c3a69] text-white font-bold text-xs rounded-2xl transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Default express API path: <code>/api</code> or FastAPI <code>http://localhost:8000</code></p>
          </div>

          {/* Test Connection */}
          <div className="pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testResult.status === 'testing'}
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${testResult.status === 'testing' ? 'animate-spin' : ''}`} />
              <span>{testResult.status === 'testing' ? 'Pinging Server...' : 'Test Server Health Connection'}</span>
            </button>

            {testResult.status === 'success' && (
              <div className="mt-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{testResult.message}</span>
              </div>
            )}

            {testResult.status === 'failed' && (
              <div className="mt-2.5 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Database & Theme Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-white dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center space-x-2">
            <Database className="h-4 w-4 text-[#2ECC71]" />
            <span>Database Backup &amp; Appearance</span>
          </h3>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Dark Theme Atmosphere</div>
              <div className="text-[11px] text-slate-400">Toggle dark visual canvas mode</div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-[#3B4D8C]" />}
            </button>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">LocalStorage Database Management</div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadBackup}
                className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Backup</span>
              </button>

              <label className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors">
                <Upload className="h-4 w-4" />
                <span>Import Backup</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {importStatus && <div className="text-xs text-emerald-600 font-bold">{importStatus}</div>}

            {/* Reset Database */}
            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full py-3 px-3 rounded-2xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <HardDrive className="h-4 w-4" />
                <span>Reset Database to Initial Seeds</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
