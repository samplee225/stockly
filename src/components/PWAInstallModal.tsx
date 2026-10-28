import React from 'react';
import { X, Download, Share, PlusSquare, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isIOS,
  onInstall,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-opacity">
        <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md glass-panel rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.14] z-10 flex flex-col p-6 space-y-5"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30 shrink-0">
                <Download className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Install StockFlow
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Fast standalone app on your home screen
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Benefits list */}
          <div className="space-y-2 py-1">
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Instant launching from home screen / dock</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full screen without browser search bars</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Works offline with local inventory cache</span>
            </div>
          </div>

          {/* Direct Install Button (if browser prompt available) */}
          {isInstallable && (
            <button
              onClick={async () => {
                const installed = await onInstall();
                if (installed) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 cursor-pointer active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.4]" />
              <span>Install Directly</span>
            </button>
          )}

          {/* Instructions for iOS Safari or other browsers */}
          <div className="rounded-2xl p-4 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              {isIOS ? (
                <>
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span>How to install on iPhone & iPad</span>
                </>
              ) : (
                <>
                  <Monitor className="w-4 h-4 text-blue-500" />
                  <span>Manual Installation Instructions</span>
                </>
              )}
            </div>

            {isIOS ? (
              <ol className="text-xs text-slate-600 dark:text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-semibold shrink-0">1.</span>
                  <span>
                    Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 mx-0.5 text-blue-500 -mt-0.5" /> in Safari's bottom toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold shrink-0">2.</span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-0.5 text-blue-500 -mt-0.5" />.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold shrink-0">3.</span>
                  <span>Tap <strong>Add</strong> in the top-right corner to finish.</span>
                </li>
              </ol>
            ) : (
              <ol className="text-xs text-slate-600 dark:text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-semibold shrink-0">1.</span>
                  <span>Tap the browser menu <strong>(⋮ or ⋯)</strong> or address bar install icon.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold shrink-0">2.</span>
                  <span>Select <strong>Install StockFlow</strong> or <strong>Add to Home screen</strong>.</span>
                </li>
              </ol>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-700 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
