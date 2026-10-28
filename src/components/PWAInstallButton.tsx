import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'settings' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed and running standalone, do not clutter UI
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (variant === 'settings') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className="w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] hover:border-blue-500/50 hover:bg-blue-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Download className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Install as Mobile App (PWA)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                Add to your home screen for quick offline access
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-blue-600 text-white shadow-xs">
            Install
          </span>
        </button>

        <PWAInstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          isInstallable={isInstallable}
          isIOS={isIOS}
          onInstall={install}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Install StockFlow as App"
        aria-label="Install StockFlow as App"
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 transition-all cursor-pointer border border-blue-500/30 text-xs font-semibold shrink-0"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.4]" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isInstallable={isInstallable}
        isIOS={isIOS}
        onInstall={install}
      />
    </>
  );
};
