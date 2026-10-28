import React, { useState, useMemo } from 'react';
import { Product, Transaction, TransactionFormData, TransactionType } from '../types/inventory';
import {
  groupTransactionsByDate,
  filterTransactionsByDateRange,
  DateFilterRange,
} from '../services/inventory-rules';
import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  Plus,
  Search,
  X,
  Package,
  Calendar,
  Clock,
} from 'lucide-react';

interface TransactionsPageProps {
  products: Product[];
  transactions: Transaction[];
  loading: boolean;
  onRecordTransaction: (data: TransactionFormData) => Promise<void>;
  onOpenStockMovement?: (type: TransactionType, product?: Product | null) => void;
  onViewDetails?: (product: Product) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  products,
  transactions,
  loading,
  onOpenStockMovement,
  onViewDetails,
}) => {
  // Transaction history filters
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [dateRange, setDateRange] = useState<DateFilterRange>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions by type, search query, and date range
  const filteredTransactions = useMemo(() => {
    const afterSearchAndType = transactions.filter((tx) => {
      const matchesType =
        filterType === 'ALL' ? true : tx.type === filterType;
      const matchesSearch =
        searchQuery.trim() === '' ||
        tx.productTitle.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesType && matchesSearch;
    });

    return filterTransactionsByDateRange(afterSearchAndType, dateRange);
  }, [transactions, filterType, searchQuery, dateRange]);

  // Group filtered transactions by dates with IN/OUT subtotals per day
  const dateGroups = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  return (
    <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto">
      {/* Top Header: Title and Record Movement Button Side by Side with Plus Icon */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Activity History
          </h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/25">
            {transactions.length} {transactions.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {/* Action Button: Only Plus Icon */}
        <button
          type="button"
          onClick={() => (onOpenStockMovement ? onOpenStockMovement('IN') : undefined)}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-all cursor-pointer border border-blue-400/30 shrink-0"
          title="Record Movement"
          aria-label="Record Movement"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Transactions Activity History List (Full Width) */}
      <div className="w-full">
        <div className="space-y-3.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                {filteredTransactions.length === transactions.length
                  ? `Showing all ${transactions.length} records`
                  : `Showing ${filteredTransactions.length} of ${transactions.length} records`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto pb-0.5 self-start sm:self-auto scrollbar-none">
              {/* Date Range Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-xl border border-black/[0.04] dark:border-white/[0.08] shrink-0">
                {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((r) => {
                  const labels: Record<DateFilterRange, string> = {
                    ALL: 'All Dates',
                    TODAY: 'Today',
                    WEEK: '7 Days',
                    MONTH: '30 Days',
                  };
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDateRange(r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        dateRange === r
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {labels[r]}
                    </button>
                  );
                })}
              </div>

              {/* Filter Tabs: ALL / IN / OUT */}
              <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-xl border border-black/[0.04] dark:border-white/[0.08] shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'ALL'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('IN')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'IN'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('OUT')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'OUT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Input for Transactions */}
          {transactions.length > 2 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter movements by product..."
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

          {loading && transactions.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs">Loading movements...</span>
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <div className="py-12 text-center text-slate-500 dark:text-neutral-400">
              <p className="text-xs font-medium">No stock movements recorded yet.</p>
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                Record your first movement using the pop up form to start tracking inventory flow.
              </p>
              <button
                type="button"
                onClick={() => (onOpenStockMovement ? onOpenStockMovement('IN') : undefined)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/25 border border-blue-400/30"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Record First Movement</span>
              </button>
            </div>
          )}

          {!loading && transactions.length > 0 && filteredTransactions.length === 0 && (
            <div className="py-8 text-center text-slate-500 dark:text-neutral-400 text-xs">
              No movements match your selected filter or search query.
            </div>
          )}

          {/* Grouped by Dates Ledger */}
          {!loading && filteredTransactions.length > 0 && (
            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-0.5">
              {dateGroups.map((group) => (
                <div key={group.dateKey} className="space-y-2">
                  {/* Date Header: Title & Daily IN/OUT Badges */}
                  <div className="sticky top-0 z-10 flex items-center justify-between py-2 px-3.5 rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {group.dateLabel}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 hidden sm:inline truncate">
                        • {group.formattedDate}
                      </span>
                    </div>

                    {/* Day IN / OUT summary badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {group.totalIn > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                          +{group.totalIn} In
                        </span>
                      )}
                      {group.totalOut > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                          <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                          -{group.totalOut} Out
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 pl-0.5 font-medium">
                        ({group.transactions.length})
                      </span>
                    </div>
                  </div>

                  {/* Movements list for this specific date */}
                  <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06] rounded-2xl glass-card border border-black/[0.04] dark:border-white/[0.06] overflow-hidden px-1">
                    {group.transactions.map((tx) => {
                      const isIn = tx.type === 'IN';
                      const matchingProd = products.find((p) => p.productId === tx.productId);
                      const timeStr = tx.timestamp
                        ? new Date(tx.timestamp).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent';

                      const cleanId = tx.transactionId.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase();

                      const handleRowClick = () => {
                        if (matchingProd) {
                          onViewDetails?.(matchingProd);
                        } else {
                          onViewDetails?.({
                            productId: tx.productId,
                            title: tx.productTitle,
                            quantity: tx.quantity,
                            createdAt: tx.timestamp,
                            updatedAt: tx.timestamp,
                            description: 'Historical movement record from transactions ledger.',
                          });
                        }
                      };

                      return (
                        <div
                          key={tx.transactionId}
                          onClick={handleRowClick}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleRowClick();
                            }
                          }}
                          aria-label={`View product details for ${tx.productTitle}`}
                          className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.05] rounded-xl px-2.5 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Product Image Thumbnail with movement direction badge */}
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-800 shrink-0 border border-black/[0.06] dark:border-white/[0.1] flex items-center justify-center">
                              {matchingProd?.imageUrl ? (
                                <img
                                  src={matchingProd.imageUrl}
                                  alt={tx.productTitle}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400 dark:text-neutral-500 stroke-[1.6]" />
                              )}
                              <span
                                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-tl-md flex items-center justify-center text-[8px] font-bold text-white ${
                                  isIn ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              >
                                {isIn ? '+' : '-'}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-white block truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {tx.productTitle}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-neutral-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                                  {timeStr}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-[10px]">REF-{cleanId}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-sm font-bold block ${
                                isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
                              {isIn ? 'Stock In' : 'Stock Out'}
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
    </div>
  );
};
