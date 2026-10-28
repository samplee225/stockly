import React, { useState } from 'react';
import { Product } from '../types/inventory';
import { Package, ArrowDownRight, ArrowUpRight, Edit2, Trash2 } from 'lucide-react';

interface ProductListItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onQuickMovement: (product: Product, type: 'IN' | 'OUT') => void;
  onViewDetails?: (product: Product) => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onEdit,
  onDelete,
  onQuickMovement,
  onViewDetails,
}) => {
  const [imgError, setImgError] = useState(false);

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity < 5;

  return (
    <div
      onClick={() => onViewDetails?.(product)}
      className="glass-card rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:border-blue-500/40 hover:shadow-md transition-all group cursor-pointer"
    >
      {/* Product Image & Info */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-900 shrink-0 border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center relative">
          {product.imageUrl && !imgError ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
              loading="lazy"
            />
          ) : (
            <Package className="w-5 h-5 text-slate-400 dark:text-neutral-500 stroke-[1.6]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate min-w-0 flex-1" title={product.title}>
              {product.title}
            </h3>
            <span
              className={`shrink-0 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
                isOutOfStock
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25'
                  : isLowStock
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
              }`}
            >
              {isOutOfStock ? '0 stock' : `${product.quantity} units`}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
            {product.description || 'No description provided'}
          </p>
        </div>
      </div>

      {/* Action Controls: Steppers + Edit/Delete */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 sm:gap-2 shrink-0"
      >
        {/* Quick Stepper Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-0.5 sm:p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickMovement(product, 'OUT');
            }}
            disabled={product.quantity <= 0}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 disabled:opacity-25 transition-colors cursor-pointer"
            title="Stock Out (-)"
            aria-label={`Stock Out for ${product.title}`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickMovement(product, 'IN');
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors cursor-pointer"
            title="Stock In (+)"
            aria-label={`Stock In for ${product.title}`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Edit & Delete Actions */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-400 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
          title="Edit"
          aria-label={`Edit ${product.title}`}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product);
          }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-400 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Delete"
          aria-label={`Delete ${product.title}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
