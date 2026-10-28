import React from 'react';
import { InventorySummary, Product, ActivePage, TransactionType } from '../types/inventory';
import { Package, Layers, ArrowRight, Clock, Plus, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HomePageProps {
  summary: InventorySummary | null;
  loading: boolean;
  error: string | null;
  onNavigate: (page: ActivePage) => void;
  onOpenStockMovement: (type: TransactionType, product?: Product | null) => void;
  onOpenAddModal: () => void;
  onViewDetails?: (product: Product) => void;
  onRetry: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  summary,
  loading,
  error,
  onNavigate,
  onOpenStockMovement,
  onOpenAddModal,
  onViewDetails,
  onRetry,
}) => {
  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 dark:text-neutral-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs font-medium">Loading inventory...</span>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="p-6 max-w-lg mx-auto glass-card rounded-3xl text-center space-y-3 my-8">
        <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Unable to load inventory</h3>
        <p className="text-xs text-slate-500 dark:text-neutral-400">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-500 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalProducts = summary?.totalProducts ?? 0;
  const totalQuantity = summary?.totalQuantity ?? 0;
  const recentProducts = summary?.recentProducts ?? [];

  return (
    <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto">
      {/* Overview Header with Quick Add */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Overview
          </h1>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer border border-blue-400/30 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>New Product</span>
        </button>
      </div>

      {/* TOP ACTIONS: Prominent Stock In (+) & Stock Out (-) Buttons (At the top of screen) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Quick Actions
          </span>
          <span className="text-[10px] text-slate-400 dark:text-neutral-500">
            Tap to record movement
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Stock In Button */}
          <button
            onClick={() => onOpenStockMovement('IN')}
            className="glass-card rounded-2xl p-2.5 sm:p-3 text-left flex items-center justify-between group hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer border border-emerald-500/25 bg-emerald-500/10 dark:bg-emerald-950/30 hover:bg-emerald-500/15 dark:hover:bg-emerald-950/45 active:scale-[0.98]"
            aria-label="Stock In: Receive and add inventory"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-transform border border-emerald-400/30 shrink-0">
                <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate leading-tight">
                  Stock In (+)
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block truncate leading-tight mt-0.5">
                  Add inventory
                </span>
              </div>
            </div>
            <div className="hidden sm:flex w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0">
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Stock Out Button */}
          <button
            onClick={() => onOpenStockMovement('OUT')}
            className="glass-card rounded-2xl p-2.5 sm:p-3 text-left flex items-center justify-between group hover:border-rose-500/40 hover:shadow-md transition-all cursor-pointer border border-rose-500/25 bg-rose-500/10 dark:bg-rose-950/30 hover:bg-rose-500/15 dark:hover:bg-rose-950/45 active:scale-[0.98]"
            aria-label="Stock Out: Deduct and dispatch inventory"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm shadow-rose-500/30 group-hover:scale-105 transition-transform border border-rose-400/30 shrink-0">
                <ArrowDownRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate leading-tight">
                  Stock Out (-)
                </span>
                <span className="text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-medium block truncate leading-tight mt-0.5">
                  Deduct inventory
                </span>
              </div>
            </div>
            <div className="hidden sm:flex w-6 h-6 rounded-full bg-rose-500/20 items-center justify-center text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform shrink-0">
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden glass-reflection">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 truncate">
              Total Products
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30 shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalProducts}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 block truncate">
            Distinct catalog items
          </span>
        </div>

        {/* Total Stock Quantity */}
        <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden glass-reflection">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 truncate">
              Total Units
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalQuantity}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 block truncate">
            Across all products
          </span>
        </div>
      </div>

      {/* Complete Stock List Shortcut */}
      <button
        onClick={() => onNavigate('stock')}
        className="w-full glass-card rounded-3xl p-4 sm:p-4.5 text-left flex items-center justify-between group hover:border-blue-500/40 hover:shadow-xl transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform border border-blue-400/30">
            <Package className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white block">
              View Complete Stock List
            </span>
            <span className="text-xs text-slate-500 dark:text-neutral-400">
              Browse, search, edit, or manage products
            </span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 dark:text-neutral-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
      </button>

      {/* Recently Updated Products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recently Updated Products
            </h2>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            See all
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center text-slate-500 dark:text-neutral-400">
            <p className="text-xs">No products in inventory yet.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/25 hover:bg-blue-500 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-3xl divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden">
            {recentProducts.map((product) => (
              <div
                key={product.productId}
                onClick={() => onViewDetails?.(product)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onViewDetails?.(product);
                  }
                }}
                aria-label={`View details for ${product.title}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-900 shrink-0 border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                      {product.description || 'No description'}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs font-semibold text-slate-700 dark:text-neutral-200">
                    {product.quantity} units
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenStockMovement('OUT', product);
                      }}
                      disabled={product.quantity <= 0}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium bg-black/[0.04] dark:bg-white/[0.05] hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 transition-colors border border-black/[0.04] dark:border-white/[0.06] cursor-pointer"
                      title="Quick Stock Out"
                      aria-label={`Stock Out for ${product.title}`}
                    >
                      -
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenStockMovement('IN', product);
                      }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium bg-black/[0.04] dark:bg-white/[0.05] hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-black/[0.04] dark:border-white/[0.06] cursor-pointer"
                      title="Quick Stock In"
                      aria-label={`Stock In for ${product.title}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
