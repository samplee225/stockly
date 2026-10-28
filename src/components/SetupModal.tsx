import React, { useState } from 'react';
import { getAppsScriptUrl, setAppsScriptUrl, inventoryApi } from '../services/api';
import { X, Database, CheckCircle2, AlertCircle, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChanged: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  onConnectionChanged,
}) => {
  const currentUrl = getAppsScriptUrl();
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!urlInput.trim()) {
      setAppsScriptUrl('');
      setTestResult({ success: true, message: 'Switched to Local Test Mode.' });
      onConnectionChanged();
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await inventoryApi.testConnection(urlInput.trim());
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      setAppsScriptUrl(urlInput.trim());
      onConnectionChanged();
    }
  };

  const handleResetToDemo = () => {
    setUrlInput('');
    setAppsScriptUrl('');
    setTestResult({ success: true, message: 'Reset to Local Test Mode with demo inventory.' });
    onConnectionChanged();
  };

  const handleCopyCode = () => {
    fetch('/apps-script/Code.gs')
      .then((res) => res.text())
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2500);
      })
      .catch(() => {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2500);
      });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl overflow-hidden border border-white/[0.14] z-10 flex flex-col max-h-[90vh] glass-reflection"
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Database & Google Sheets Setup
                </h2>
                <p className="text-xs text-neutral-400">
                  Configure Google Apps Script backend deployment
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Close setup modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-5">
            {/* Current Status Banner */}
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                currentUrl
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
              }`}
            >
              {currentUrl ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">
                <strong className="font-semibold block mb-0.5">
                  {currentUrl ? 'Google Sheet Connected' : 'Local Test Mode Active'}
                </strong>
                {currentUrl
                  ? 'Inventory and transactions read & write persistently to your Google Spreadsheet via Google Apps Script.'
                  : 'Operating in self-contained browser storage. All CRUD and stock movements work immediately. Connect your Google Apps Script URL below to sync with live Google Sheets.'}
              </div>
            </div>

            {/* URL Input Form */}
            <div>
              <label htmlFor="script-url" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Google Apps Script Web App URL
              </label>
              <input
                id="script-url"
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-4 py-3 rounded-2xl glass-input text-xs text-white placeholder:text-neutral-500 focus:outline-hidden"
              />
              <p className="mt-1.5 text-[11px] text-neutral-500">
                Leave blank or click reset to use Local Test Mode.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Test & Save Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleResetToDemo}
                className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                Reset to Local Mode
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestAndSave}
                  disabled={testing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all cursor-pointer border border-blue-400/30"
                >
                  {testing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{urlInput.trim() ? 'Test & Connect' : 'Apply'}</span>
                </button>
              </div>
            </div>

            {/* Deployment Steps Guide */}
            <div className="pt-4 border-t border-white/[0.08] text-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-white">
                  Quick Deployment Guide
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 text-[11px] font-medium transition-colors cursor-pointer border border-white/[0.08]"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Code Copied!' : 'Copy Code.gs'}</span>
                </button>
              </div>

              <ol className="space-y-2 text-neutral-400 pl-4 list-decimal marker:text-blue-400 leading-relaxed text-[11px]">
                <li>
                  Create a new spreadsheet at{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 inline-flex items-center gap-0.5 hover:underline"
                  >
                    sheets.new <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
                <li>Paste the provided <code>Code.gs</code> code into the script editor.</li>
                <li>Click <strong>Deploy &gt; New deployment</strong> &gt; Select type: <strong>Web app</strong>.</li>
                <li>
                  Set <em>Execute as:</em> <strong>Me</strong> and <em>Who has access:</em> <strong>Anyone</strong>.
                </li>
                <li>Copy the generated Web App URL and paste it into the field above.</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
