import React from 'react';
import { Home, Package, ArrowLeftRight, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivePage } from '../types/inventory';

interface NavigationProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isLiveBackend: boolean;
  onOpenSetup: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onNavigate,
}) => {
  const navItems: { id: ActivePage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'transactions', label: 'Movements', icon: ArrowLeftRight },
  ];

  return (
    <>
      {/* Top Glass Navigation Bar (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-black/[0.05] dark:border-white/[0.08] transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between">
          {/* Logo / App Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-white block leading-tight">
                StockFlow
              </span>
            </div>
          </div>

          {/* Desktop Destination Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.08]" aria-label="Desktop Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-active-pill"
                      className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30 border border-blue-400/30"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Header Action: Settings Navigation Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('settings')}
              title="Settings"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                activePage === 'settings'
                  ? 'bg-blue-600 text-white border-blue-400/30 shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] border-black/[0.06] dark:border-white/[0.08]'
              }`}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Liquid Glass Bottom Navigation Dock */}
      <nav
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm md:hidden glass-pill rounded-full shadow-2xl transition-all"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-full min-h-[50px] transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-pill"
                    className="absolute inset-0 bg-blue-600 rounded-full shadow-lg shadow-blue-600/40 border border-blue-400/30"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-1">
                  <Icon className="w-5 h-5 stroke-[2]" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase leading-none">
                    {item.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
