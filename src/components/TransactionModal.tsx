import React, { useState, useEffect } from 'react';
import { Product, TransactionFormData, TransactionType } from '../types/inventory';
import { calculateStockMovement } from '../services/inventory-rules';
import { TargetProductSelector } from './TargetProductSelector';
import { X, ArrowDownRight, ArrowUpRight, Loader2, Minus, Plus, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionModalProps {
  isOpen: boolean;
  products: Product[];
  selectedProduct?: Product | null;
  initialType?: TransactionType;
  onClose: () => void;
  onSubmit: (formData: TransactionFormData) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  products,
  selectedProduct,
  initialType = 'IN',
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setType(initialType);
    setQuantity(1);
    setError(null);
    if (selectedProduct) {
      setProductId(selectedProduct.productId);
    } else if (products.length > 0) {
      setProductId(products[0].productId);
    } else {
      setProductId('');
    }
  }, [initialType, selectedProduct, products, isOpen]);

  if (!isOpen) return null;

  const activeProduct = products.find((p) => p.productId === productId) || selectedProduct || null;
  const currentStock = activeProduct ? activeProduct.quantity : 0;
  const numQty = Number(quantity);
  const isValidQty = !isNaN(numQty) && numQty > 0 && Number.isInteger(numQty);
  const calc = activeProduct && isValidQty
    ? calculateStockMovement(currentStock, type, numQty)
    : { success: false, newStock: currentStock, error: 'Enter quantity' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!activeProduct) {
      setError('Please select a product from inventory.');
      return;
    }

    if (!calc.success) {
      setError(calc.error || 'Invalid stock movement');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        productId: activeProduct.productId,
        type,
        quantity: numQty,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md transition-opacity">
        <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg glass-panel rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] border border-black/[0.08] dark:border-white/[0.14] glass-reflection"
          role="dialog"
          aria-modal="true"
        >
          {/* iOS Sheet Grab Handle for mobile gesture feel */}
          <div className="pt-3 pb-1 sm:hidden flex justify-center shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-white/25" />
          </div>

          {/* Modal Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                  type === 'IN'
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 dark:border-emerald-500/30'
                    : 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/25 dark:border-rose-500/30'
                }`}
              >
                {type === 'IN' ? (
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {type === 'IN' ? 'Stock In Movement' : 'Stock Out Movement'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400 truncate">
                  {type === 'IN' ? 'Record inventory arriving into stock' : 'Record inventory dispatched from stock'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body - Scrollable with safe mobile padding */}
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto overscroll-contain flex-1 touch-pan-y"
          >
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/25 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Segmented Type Switcher */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5">
                Movement Direction
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/[0.04] dark:bg-white/[0.04] rounded-2xl border border-black/[0.05] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    setType('IN');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                    type === 'IN'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/30'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                  <span>Stock In (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('OUT');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                    type === 'OUT'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-400/30'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 stroke-[2.2]" />
                  <span>Stock Out (-)</span>
                </button>
              </div>
            </div>

            {/* Target Product Selector */}
            <TargetProductSelector
              products={products}
              selectedProductId={productId}
              onSelect={(id) => {
                setProductId(id);
                setError(null);
              }}
              disabled={submitting}
            />

            {/* Quantity Stepper Field (Responsive Layout) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="tx-modal-qty"
                  className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300"
                >
                  Quantity Units <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                  Current: <strong className="text-slate-900 dark:text-white">{currentStock}</strong>
                </span>
              </div>

              {/* Stepper Inputs Row */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}
                  className="w-12 h-12 rounded-2xl glass-input flex items-center justify-center text-slate-700 dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0 border border-black/[0.08] dark:border-white/[0.12]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <input
                  id="tx-modal-qty"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setError(null);
                  }}
                  className="flex-1 min-w-0 px-3 py-2.5 sm:py-3 text-center text-xl font-bold rounded-2xl glass-input text-slate-900 dark:text-white border border-black/[0.08] dark:border-white/[0.12] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Number(quantity) + 1)}
                  className="w-12 h-12 rounded-2xl glass-input flex items-center justify-center text-slate-700 dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0 border border-black/[0.08] dark:border-white/[0.12]"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Quick Presets Row - Cleanly separated below */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium mr-0.5 shrink-0 uppercase tracking-wider">
                  Quick:
                </span>
                {[1, 5, 10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setQuantity(preset);
                      setError(null);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border min-h-[32px] ${
                      Number(quantity) === preset
                        ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                        : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-600 dark:text-neutral-300 border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/10'
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Projected Stock Balance Preview Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.08] text-xs flex items-center justify-between gap-3">
              <div>
                <span className="text-slate-500 dark:text-neutral-400 block text-[11px]">
                  Projected Balance:
                </span>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
                  {currentStock}{' '}
                  {type === 'IN'
                    ? `+ ${isValidQty ? numQty : 0}`
                    : `- ${isValidQty ? numQty : 0}`}
                </span>
              </div>
              <span
                className={`text-xs sm:text-sm font-bold text-right ${
                  !isValidQty
                    ? 'text-slate-400 dark:text-neutral-500'
                    : !calc.success
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {!isValidQty
                  ? 'Enter quantity'
                  : calc.success
                  ? `${calc.newStock} units`
                  : 'Insufficient stock'}
              </span>
            </div>

            {/* Mobile-first Action Buttons Footer */}
            <div className="pt-2 sm:pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer text-center min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !calc.success || products.length === 0}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-2xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer min-h-[46px] disabled:opacity-40 disabled:cursor-not-allowed ${
                  type === 'IN'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25 border border-emerald-400/30 active:scale-[0.98]'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/25 border border-rose-400/30 active:scale-[0.98]'
                }`}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>Record {type === 'IN' ? 'Stock In (+)' : 'Stock Out (-)'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
