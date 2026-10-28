import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Database,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  Package,
  Download,
} from 'lucide-react';
import { InventorySummary } from '../types/inventory';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface SettingsPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  isLiveBackend: boolean;
  onOpenSetup: () => void;
  summary: InventorySummary | null;
  totalTransactions: number;
  onRefreshData: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDark,
  onToggleTheme,
  isLiveBackend,
  onOpenSetup,
  summary,
  totalTransactions,
  onRefreshData,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);
    try {
      await onRefreshData();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2500);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
          Manage appearance, database sync, and app preferences.
        </p>
      </div>

      {/* Appearance Section */}
      <section className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl border border-black/[0.05] dark:border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Appearance
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Choose your preferred interface theme
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Light Mode Option */}
          <button
            type="button"
            onClick={() => {
              if (isDark) onToggleTheme();
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              !isDark
                ? 'bg-white border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Sun className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Light Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Clean crisp paper style
                </span>
              </div>
            </div>
            {!isDark && (
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            )}
          </button>

          {/* OLED Dark Mode Option */}
          <button
            type="button"
            onClick={() => {
              if (!isDark) onToggleTheme();
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              isDark
                ? 'bg-neutral-900/90 border-blue-500 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20'
                : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  OLED Dark Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  True black & high contrast
                </span>
              </div>
            </div>
            {isDark && (
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            )}
          </button>
        </div>
      </section>

      {/* Database & Sync Section */}
      <section className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl border border-black/[0.05] dark:border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Database & Cloud Sync
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Manage data persistence and Google Sheets backend
            </p>
          </div>
        </div>

        {/* Current Connection Status Box */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isLiveBackend
              ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20'
              : 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full mt-1 sm:mt-0 shrink-0 animate-pulse ${
                isLiveBackend ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isLiveBackend ? 'Connected to Google Sheets' : 'Local Test Mode (Browser Storage)'}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isLiveBackend
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isLiveBackend ? 'Live Cloud' : 'Local'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                {isLiveBackend
                  ? 'All inventory products and movements synchronize automatically with your spreadsheet.'
                  : 'Changes are currently saved locally in browser storage. Connect a Google Sheets Web App to sync across devices.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-slate-700 dark:text-neutral-200 text-xs font-semibold transition-all cursor-pointer border border-black/[0.05] dark:border-white/[0.08] disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`}
              />
              <span>{isRefreshing ? 'Syncing...' : refreshSuccess ? 'Synced!' : 'Sync Now'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenSetup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer border border-blue-400/30"
            >
              <span>Configure Sheet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Overview & Statistics */}
      <section className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl border border-black/[0.05] dark:border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Data Summary
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Overview of stored inventory records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-1">
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
              Products
            </span>
            <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
              {summary?.totalProducts ?? 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
              Total Stock
            </span>
            <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
              {summary?.totalQuantity ?? 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
              Movements
            </span>
            <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
              {totalTransactions}
            </span>
          </div>
        </div>
      </section>

      {/* App Installation (PWA) */}
      <section className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl border border-black/[0.05] dark:border-white/[0.08] space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Install as Application
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Run StockFlow on your desktop, iPhone, iPad, or Android home screen
            </p>
          </div>
        </div>

        <PWAInstallButton variant="settings" />
      </section>

      {/* Navigation & Mobile Gestures */}
      <section className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl border border-black/[0.05] dark:border-white/[0.08] space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Mobile Gestures
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Fast swipe navigation enabled
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] text-xs text-slate-600 dark:text-neutral-300 flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-blue-500 shrink-0" />
          <span>
            Swipe <strong>Left</strong> or <strong>Right</strong> on mobile to smoothly shift between Home, Stock, and Activity History.
          </span>
        </div>
      </section>

      {/* App Info Footer */}
      <div className="text-center pt-2 text-[11px] text-slate-400 dark:text-neutral-500">
        <p className="font-semibold text-slate-500 dark:text-neutral-400">
          StockFlow • Minimal Inventory System
        </p>
        <p className="mt-0.5">Fast, zero-latency local-first architecture with Google Sheets cloud sync.</p>
      </div>
    </div>
  );
};
