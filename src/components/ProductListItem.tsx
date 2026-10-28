import React, { useState } from 'react';
import { Product } from '../types/inventory';
import { Package, ArrowDownRight, ArrowUpRight, Edit2, Trash2, MoreVertical, Eye } from 'lucide-react';

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
  const [showMenu, setShowMenu] = useState(false);

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
            {product.category && (
              <span className="shrink-0 text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {product.category}
              </span>
            )}
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

      {/* Action Controls: Steppers + Three-Dot Dropdown */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 sm:gap-2 shrink-0"
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

        {/* Three-Dot Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              showMenu
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
            }`}
            title="Options"
            aria-label={`Options for ${product.title}`}
            aria-haspopup="true"
            aria-expanded={showMenu}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              {/* Invisible backdrop to dismiss menu on outside click */}
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div
                className="absolute right-0 top-9 sm:top-10 z-40 w-40 glass-panel rounded-2xl shadow-2xl py-1 border border-black/[0.08] dark:border-white/[0.14] text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {onViewDetails && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onViewDetails(product);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>View Details</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit(product);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                  <span>Edit Details</span>
                </button>
                <div className="my-1 border-t border-black/[0.05] dark:border-white/[0.08]" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete(product);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete Product</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
