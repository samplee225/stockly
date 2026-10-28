import React, { useState } from 'react';
import { Product } from '../types/inventory';
import { Package, ChevronDown, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TargetProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onSelect: (productId: string) => void;
  disabled?: boolean;
}

export const TargetProductSelector: React.FC<TargetProductSelectorProps> = ({
  products,
  selectedProductId,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeProduct = products.find((p) => p.productId === selectedProductId) || products[0] || null;

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (products.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300">
        No products in catalog. Add a product first.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
          Target Product <span className="text-rose-500 dark:text-rose-400">*</span>
        </label>
        {activeProduct && (
          <span className="text-xs text-slate-500 dark:text-neutral-400">
            Available: <strong className="text-slate-900 dark:text-white font-semibold">{activeProduct.quantity} units</strong>
          </span>
        )}
      </div>

      {/* Selected Product Card (Always displays the selected product's image & details with design) */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`glass-panel rounded-2xl p-3 sm:p-3.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
            : 'hover:border-blue-500/40 hover:shadow-md'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        role="button"
        aria-expanded={isOpen}
        aria-label="Select target product"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Product Image Thumbnail */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-900 shrink-0 border border-black/[0.06] dark:border-white/[0.1] flex items-center justify-center">
            {activeProduct?.imageUrl ? (
              <img
                src={activeProduct.imageUrl}
                alt={activeProduct.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Package className="w-6 h-6 text-slate-400 dark:text-neutral-500 stroke-[1.6]" />
            )}
          </div>

          {/* Product Details */}
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {activeProduct?.title || 'Choose a product'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 truncate mt-0.5">
              {activeProduct?.description || 'No description provided'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  (activeProduct?.quantity || 0) <= 0
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {activeProduct?.quantity || 0} in stock
              </span>
            </div>
          </div>
        </div>

        {/* Change / Dropdown Indicator Button */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="hidden sm:inline text-xs font-semibold text-blue-600 dark:text-blue-400">
            {isOpen ? 'Close' : 'Change'}
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-neutral-400 bg-black/[0.04] dark:bg-white/[0.06] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Expandable Product Selector Picker Drawer with Product Images */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="glass-panel rounded-2xl p-3 border border-black/[0.08] dark:border-white/[0.12] shadow-xl space-y-2 mt-2">
              {/* Filter search if more than 3 products */}
              {products.length > 3 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search product..."
                    className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-hidden"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white absolute right-2.5 top-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Product Cards Options List with Images */}
              <div className="max-h-48 sm:max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredProducts.map((p) => {
                  const isSelected = p.productId === activeProduct?.productId;
                  return (
                    <button
                      key={p.productId}
                      type="button"
                      onClick={() => {
                        onSelect(p.productId);
                        setIsOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/15 border border-blue-500/40 text-blue-900 dark:text-white'
                          : 'bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border border-transparent text-slate-800 dark:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Image Thumbnail */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-neutral-800 shrink-0 border border-black/[0.05] dark:border-white/[0.08] flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                          )}
                        </div>

                        {/* Title and details */}
                        <div className="min-w-0">
                          <span className="font-semibold text-xs block truncate text-slate-900 dark:text-white">
                            {p.title}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-neutral-400 block truncate">
                            {p.quantity} units available
                          </span>
                        </div>
                      </div>

                      {/* Selected checkmark */}
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                            Select
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-500 dark:text-neutral-400">
                    No products found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
