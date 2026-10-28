import React, { useState, useMemo } from 'react';
import { Product } from '../types/inventory';
import { ProductCard } from '../components/ProductCard';
import { ProductListItem } from '../components/ProductListItem';
import { Search, Plus, X, Package, Loader2, AlertCircle, LayoutGrid, List } from 'lucide-react';

interface StockPageProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onQuickMovement: (product: Product, type: 'IN' | 'OUT') => void;
  onViewDetails?: (product: Product) => void;
  onRetry: () => void;
}

export const StockPage: React.FC<StockPageProps> = ({
  products,
  loading,
  error,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onQuickMovement,
  onViewDetails,
  onRetry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => p.title.toLowerCase().includes(q));
  }, [products, searchQuery]);

  const itemCountText = `${products.length} ${products.length === 1 ? 'item' : 'items'}`;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Top Header: Title and Add Product Button Side by Side */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Stock
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 font-medium">
            {itemCountText}
          </p>
        </div>

        {/* Primary Add Stock Action Button (Side by side with Title) */}
        <button
          onClick={onAddProduct}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all cursor-pointer shrink-0 border border-blue-400/30"
          aria-label="Add new product"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Input Bar + List/Grid View Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 glass-panel rounded-2xl p-1 sm:p-1.5 flex items-center shadow-xs">
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 dark:text-neutral-500 shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-hidden py-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors mr-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grid vs List View Segmented Switch */}
        <div className="glass-panel p-1 rounded-2xl flex items-center gap-1 shrink-0 shadow-xs border border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={() => setViewMode('grid')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                : 'text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="Grid View"
            aria-label="Switch to Grid View"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                : 'text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="List View"
            aria-label="Switch to List View"
            aria-pressed={viewMode === 'list'}
          >
            <List className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 dark:text-neutral-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-medium">Loading products...</span>
        </div>
      )}

      {/* Error state */}
      {error && products.length === 0 && (
        <div className="p-8 max-w-md mx-auto glass-card rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Failed to load products
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-500 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products Display (Grid View or List View) */}
      {!loading && filteredProducts.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  onQuickMovement={onQuickMovement}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5">
              {filteredProducts.map((product) => (
                <ProductListItem
                  key={product.productId}
                  product={product}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  onQuickMovement={onQuickMovement}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty States */}
      {!loading && products.length === 0 && (
        <div className="glass-card rounded-3xl p-10 sm:p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/20 dark:border-blue-500/30">
            <Package className="w-7 h-7 stroke-[1.6]" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Inventory is empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
            No products have been added to the catalog yet. Add your first item to begin tracking stock.
          </p>
          <button
            onClick={onAddProduct}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      )}

      {!loading && products.length > 0 && filteredProducts.length === 0 && (
        <div className="glass-card rounded-3xl p-10 text-center max-w-sm mx-auto space-y-2">
          <Search className="w-8 h-8 text-slate-400 dark:text-neutral-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No matching products
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            No items matched "{searchQuery}". Try a different search term.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline pt-2 font-medium cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};
