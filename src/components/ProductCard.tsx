import React, { useState } from 'react';
import { Product } from '../types/inventory';
import { Package, MoreHorizontal, ArrowDownRight, ArrowUpRight, Edit2, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onQuickMovement: (product: Product, type: 'IN' | 'OUT') => void;
  onViewDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
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
      className="relative group glass-card rounded-3xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:border-blue-500/40 cursor-pointer"
    >
      <div>
        {/* Product Image Thumbnail */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-900 mb-3 sm:mb-3.5 flex items-center justify-center border border-black/[0.04] dark:border-white/[0.08]">
          {product.imageUrl && !imgError ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
              <Package className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[10px] tracking-wider mt-1 uppercase font-medium">No Image</span>
            </div>
          )}

          {/* Category Badge Overlay */}
          {product.category && (
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold backdrop-blur-md shadow-md bg-black/60 text-white border border-white/20">
                {product.category}
              </span>
            </div>
          )}

          {/* Stock Badge Overlay */}
          <div className="absolute top-2.5 right-2.5">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-md shadow-md border ${
                isOutOfStock
                  ? 'bg-rose-500/90 text-white border-rose-400/40'
                  : isLowStock
                  ? 'bg-amber-500/90 text-white border-amber-400/40'
                  : 'bg-white/90 dark:bg-black/85 text-slate-900 dark:text-white border-black/10 dark:border-white/20'
              }`}
            >
              {isOutOfStock ? '0 In Stock' : `${product.quantity} Units`}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white tracking-tight truncate" title={product.title}>
              {product.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed">
              {product.description || 'No description provided.'}
            </p>
          </div>

          {/* More Actions Dropdown Menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label={`Options for ${product.title}`}
              aria-haspopup="true"
              aria-expanded={showMenu}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-9 z-30 w-36 glass-panel rounded-2xl shadow-2xl py-1.5 border border-black/[0.08] dark:border-white/[0.14] text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(product);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(product);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Footer: Stock In & Stock Out */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-3.5 sm:mt-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between gap-2"
      >
        <span className="text-[11px] text-slate-400 dark:text-neutral-400 font-medium">
          Quick Adjust
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickMovement(product, 'OUT');
            }}
            disabled={product.quantity <= 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 bg-black/[0.04] dark:bg-white/[0.05] hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-all border border-black/[0.05] dark:border-white/[0.08] cursor-pointer"
            title="Stock Out (-)"
            aria-label={`Stock Out for ${product.title}`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Out</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickMovement(product, 'IN');
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 bg-black/[0.04] dark:bg-white/[0.05] hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-black/[0.05] dark:border-white/[0.08] cursor-pointer"
            title="Stock In (+)"
            aria-label={`Stock In for ${product.title}`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
