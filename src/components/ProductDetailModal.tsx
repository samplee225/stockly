import React, { useState, useEffect, useMemo } from 'react';
import { Product, Transaction, TransactionType } from '../types/inventory';
import { groupTransactionsByDate } from '../services/inventory-rules';
import {
  X,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  isOpen: boolean;
  product: Product | null;
  transactions: Transaction[];
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onStockMovement: (type: TransactionType, product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  product,
  transactions,
  onClose,
  onEdit,
  onDelete,
  onStockMovement,
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset img error state when product changes
  useEffect(() => {
    setImgError(false);
  }, [product?.productId, product?.imageUrl]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter transactions for this specific product (unconditional hook call)
  const productTransactions = useMemo(() => {
    if (!product) return [];
    return transactions.filter(
      (tx) =>
        tx.productId === product.productId ||
        tx.productTitle.trim().toLowerCase() === product.title.trim().toLowerCase()
    );
  }, [transactions, product]);

  const dateGroups = useMemo(() => {
    return groupTransactionsByDate(productTransactions);
  }, [productTransactions]);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity < 5;

  const cleanProductId = product.productId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();

  const formattedCreated = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  const formattedUpdated = product.updatedAt
    ? new Date(product.updatedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl glass-panel rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.14] z-10 flex flex-col max-h-[92vh] glass-reflection"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-title"
        >
          {/* iOS Sheet Grab Handle for mobile gesture feel */}
          <div className="pt-3 pb-1 sm:hidden flex justify-center">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
          </div>

          {/* Modal Header */}
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Product Details
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08] text-slate-600 dark:text-neutral-300 border border-black/[0.05] dark:border-white/[0.08]">
                ID-{cleanProductId}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Close product details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Scrollable Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Hero Card: Image + Title + Status */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Product Image */}
              <div className="relative w-full sm:w-36 h-40 sm:h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-900 border border-black/[0.08] dark:border-white/[0.1] shrink-0 flex items-center justify-center">
                {product.imageUrl && !imgError ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
                    <Package className="w-10 h-10 stroke-[1.4]" />
                    <span className="text-[10px] font-medium tracking-wider uppercase mt-1">No Image</span>
                  </div>
                )}

                {/* Stock Level Badge on Image */}
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold backdrop-blur-md shadow-md border ${
                      isOutOfStock
                        ? 'bg-rose-500/90 text-white border-rose-400/40'
                        : isLowStock
                        ? 'bg-amber-500/90 text-white border-amber-400/40'
                        : 'bg-emerald-600/90 text-white border-emerald-400/40'
                    }`}
                  >
                    {isOutOfStock ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : isLowStock ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}</span>
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 min-w-0 space-y-2">
                <h1
                  id="product-detail-title"
                  className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug break-words"
                >
                  {product.title}
                </h1>

                {/* Large Quantity Display */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {product.quantity}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-neutral-400">
                    Units in Stock
                  </span>
                </div>

                {/* Timestamps */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                    <span>Added: {formattedCreated}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                    <span>Updated: {formattedUpdated}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="glass-card rounded-2xl p-4 border border-black/[0.05] dark:border-white/[0.08] space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                Description
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-200 leading-relaxed break-words whitespace-pre-wrap">
                {product.description?.trim() ? product.description : 'No description provided for this product.'}
              </p>
            </div>

            {/* Quick Actions Bar - Icon Only */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                Quick Actions
              </span>
              <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                {/* Stock In Icon Button */}
                <button
                  type="button"
                  onClick={() => onStockMovement('IN', product)}
                  title="Stock In (+)"
                  aria-label="Stock In (+)"
                  className="h-11 sm:h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30"
                >
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Stock Out Icon Button */}
                <button
                  type="button"
                  onClick={() => onStockMovement('OUT', product)}
                  disabled={product.quantity <= 0}
                  title={product.quantity <= 0 ? 'Out of stock' : 'Stock Out (-)'}
                  aria-label="Stock Out (-)"
                  className="h-11 sm:h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-md shadow-rose-500/20 disabled:opacity-35 disabled:pointer-events-none transition-all cursor-pointer border border-rose-400/30"
                >
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Edit Details Icon Button */}
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  title="Edit Product Details"
                  aria-label="Edit Product Details"
                  className="h-11 sm:h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 active:scale-95 text-slate-700 dark:text-neutral-200 flex items-center justify-center transition-all cursor-pointer border border-black/[0.06] dark:border-white/[0.08]"
                >
                  <Edit2 className="w-4 h-4 stroke-[2.2]" />
                </button>

                {/* Delete Icon Button */}
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  title="Delete Product"
                  aria-label="Delete Product"
                  className="h-11 sm:h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 active:scale-95 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-all cursor-pointer border border-black/[0.06] dark:border-white/[0.08]"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Movement Transaction History Ledger */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Movement History
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                    {productTransactions.length}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                  All recorded changes
                </span>
              </div>

              {productTransactions.length === 0 ? (
                <div className="glass-card rounded-2xl p-6 text-center space-y-2 border border-black/[0.04] dark:border-white/[0.06]">
                  <Clock className="w-7 h-7 text-slate-400 dark:text-neutral-500 mx-auto" />
                  <p className="text-xs font-medium text-slate-700 dark:text-neutral-300">
                    No movements recorded for this product yet.
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-neutral-500 max-w-xs mx-auto">
                    Stock in or stock out actions performed on this product will appear here in chronological order.
                  </p>
                  <button
                    type="button"
                    onClick={() => onStockMovement('IN', product)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Record First Stock In</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-0.5">
                  {dateGroups.map((group) => (
                    <div key={group.dateKey} className="space-y-1.5">
                      {/* Compact Date Header with In/Out by Date */}
                      <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {group.dateLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-neutral-500 hidden sm:inline truncate">
                            • {group.formattedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {group.totalIn > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                              <ArrowUpRight className="w-2.5 h-2.5 stroke-[2.5]" />
                              +{group.totalIn} In
                            </span>
                          )}
                          {group.totalOut > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                              <ArrowDownRight className="w-2.5 h-2.5 stroke-[2.5]" />
                              -{group.totalOut} Out
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Movements on this date */}
                      <div className="glass-card rounded-2xl divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden border border-black/[0.05] dark:border-white/[0.08]">
                        {group.transactions.map((tx) => {
                          const isIn = tx.type === 'IN';
                          const timeFormatted = tx.timestamp
                            ? new Date(tx.timestamp).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recent';

                          const refCode = tx.transactionId.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase();

                          return (
                            <div
                              key={tx.transactionId}
                              className="p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                                    isIn
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25'
                                  }`}
                                >
                                  {isIn ? (
                                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
                                  ) : (
                                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.2]" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-semibold text-slate-900 dark:text-white block text-[11px] sm:text-xs">
                                    {isIn ? 'Stock In (Received)' : 'Stock Out (Dispatched)'}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" />
                                      {timeFormatted}
                                    </span>
                                    <span>•</span>
                                    <span className="font-mono">REF-{refCode}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span
                                  className={`text-xs sm:text-sm font-bold block ${
                                    isIn
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  {isIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-neutral-500">
                                  Units
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-700 dark:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
