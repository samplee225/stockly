import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Transaction, InventorySummary, ActivePage, ProductFormData, TransactionFormData, TransactionType } from './types/inventory';
import { inventoryApi, isUsingLiveBackend } from './services/api';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { StockPage } from './pages/StockPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProductFormModal } from './components/ProductFormModal';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { TransactionModal } from './components/TransactionModal';
import { SetupModal } from './components/SetupModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Toast, ToastMessage } from './components/Toast';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import { motion, AnimatePresence } from 'motion/react';

const PAGE_ORDER: ActivePage[] = ['home', 'stock', 'transactions'];

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Appearance: Light Mode vs OLED Dark Mode (persisted)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stockflow_theme');
      if (saved) return saved === 'dark';
      return true; // Default to OLED Dark mode as requested
    }
    return true;
  });

  // Synchronize document dark class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('stockflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('stockflow_theme', 'light');
    }
  }, [isDark]);

  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [movementModalState, setMovementModalState] = useState<{
    isOpen: boolean;
    type: TransactionType;
    product: Product | null;
  }>({
    isOpen: false,
    type: 'IN',
    product: null,
  });
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Keep detailProduct synchronized with latest product state
  useEffect(() => {
    if (detailProduct) {
      const latest = products.find((p) => p.productId === detailProduct.productId);
      if (latest) {
        setDetailProduct(latest);
      }
    }
  }, [products]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Primary data loader
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, summ, txs] = await Promise.all([
        inventoryApi.getProducts(),
        inventoryApi.getSummary(),
        inventoryApi.getTransactions(30),
      ]);
      setProducts(prods);
      setSummary(summ);
      setTransactions(txs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch inventory';
      setError(msg);
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CRUD Handlers
  const handleSaveProduct = async (formData: ProductFormData) => {
    if (editingProduct) {
      const updated = await inventoryApi.updateProduct(editingProduct.productId, formData);
      setProducts((prev) =>
        prev.map((p) => (p.productId === updated.productId ? updated : p))
      );
      addToast('success', `"${updated.title}" updated successfully.`);
    } else {
      const created = await inventoryApi.createProduct(formData);
      setProducts((prev) => [created, ...prev]);
      addToast('success', `"${created.title}" added to inventory.`);
    }
    const newSummary = await inventoryApi.getSummary();
    setSummary(newSummary);
  };

  const handleDeleteProduct = async (productId: string) => {
    await inventoryApi.deleteProduct(productId);
    setProducts((prev) => prev.filter((p) => p.productId !== productId));
    addToast('success', 'Product deleted from inventory.');
    const newSummary = await inventoryApi.getSummary();
    setSummary(newSummary);
  };

  const handleRecordTransaction = async (formData: TransactionFormData) => {
    const tx = await inventoryApi.createTransaction(formData);
    addToast(
      'success',
      `Stock ${tx.type === 'IN' ? 'added' : 'deducted'}: ${tx.quantity} units for "${tx.productTitle}".`
    );
    const [updatedProds, newSummary, updatedTxs] = await Promise.all([
      inventoryApi.getProducts(),
      inventoryApi.getSummary(),
      inventoryApi.getTransactions(30),
    ]);
    setProducts(updatedProds);
    setSummary(newSummary);
    setTransactions(updatedTxs);
  };

  // Swipe page shift logic
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const isAnyModalOpen =
    isAddModalOpen ||
    !!editingProduct ||
    !!deletingProduct ||
    movementModalState.isOpen ||
    isSetupModalOpen ||
    !!detailProduct;

  const handlePageShift = useCallback(
    (direction: 'next' | 'prev') => {
      const currentIndex = PAGE_ORDER.indexOf(activePage);
      if (currentIndex === -1) {
        if (direction === 'prev') {
          setSlideDirection('right');
          setActivePage('transactions');
        }
        return;
      }
      if (direction === 'next' && currentIndex < PAGE_ORDER.length - 1) {
        setSlideDirection('left');
        setActivePage(PAGE_ORDER[currentIndex + 1]);
      } else if (direction === 'prev' && currentIndex > 0) {
        setSlideDirection('right');
        setActivePage(PAGE_ORDER[currentIndex - 1]);
      }
    },
    [activePage]
  );

  useSwipeGesture({
    onSwipeLeft: () => handlePageShift('next'),
    onSwipeRight: () => handlePageShift('prev'),
    enabled: !isAnyModalOpen,
    minDistance: 45,
  });

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-black text-slate-900 dark:text-white selection:bg-blue-600/30 selection:text-blue-500 transition-colors duration-200 overflow-x-hidden touch-pan-y">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Navigation */}
      <Navigation
        activePage={activePage}
        onNavigate={(page) => {
          const currentIndex = PAGE_ORDER.indexOf(activePage);
          const targetIndex = PAGE_ORDER.indexOf(page);
          setSlideDirection(targetIndex >= currentIndex ? 'left' : 'right');
          setActivePage(page);
        }}
        isLiveBackend={isUsingLiveBackend()}
        onOpenSetup={() => setIsSetupModalOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Container - Mobile-first padding with safe-area offset */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6 pb-28 sm:pb-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activePage}
            initial={{ opacity: 0, x: slideDirection === 'left' ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection === 'left' ? -24 : 24 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {activePage === 'home' && (
              <HomePage
                summary={summary}
                loading={loading}
                error={error}
                onNavigate={(page) => {
                  const currentIndex = PAGE_ORDER.indexOf(activePage);
                  const targetIndex = PAGE_ORDER.indexOf(page);
                  setSlideDirection(targetIndex >= currentIndex ? 'left' : 'right');
                  setActivePage(page);
                }}
                onOpenStockMovement={(type, product) =>
                  setMovementModalState({
                    isOpen: true,
                    type,
                    product: product || null,
                  })
                }
                onOpenAddModal={() => {
                  setEditingProduct(null);
                  setIsAddModalOpen(true);
                }}
                onViewDetails={(p) => setDetailProduct(p)}
                onRetry={loadData}
              />
            )}

            {activePage === 'stock' && (
              <StockPage
                products={products}
                loading={loading}
                error={error}
                onAddProduct={() => {
                  setEditingProduct(null);
                  setIsAddModalOpen(true);
                }}
                onEditProduct={(p) => {
                  setEditingProduct(p);
                  setIsAddModalOpen(true);
                }}
                onDeleteProduct={(p) => setDeletingProduct(p)}
                onQuickMovement={(product, type) =>
                  setMovementModalState({
                    isOpen: true,
                    type,
                    product,
                  })
                }
                onViewDetails={(p) => setDetailProduct(p)}
                onRetry={loadData}
              />
            )}

            {activePage === 'transactions' && (
              <TransactionsPage
                products={products}
                transactions={transactions}
                loading={loading}
                onRecordTransaction={handleRecordTransaction}
                onOpenStockMovement={(type = 'IN', product = null) =>
                  setMovementModalState({
                    isOpen: true,
                    type,
                    product,
                  })
                }
                onViewDetails={(p) => setDetailProduct(p)}
              />
            )}

            {activePage === 'settings' && (
              <SettingsPage
                isDark={isDark}
                onToggleTheme={() => setIsDark(!isDark)}
                isLiveBackend={isUsingLiveBackend()}
                onOpenSetup={() => setIsSetupModalOpen(true)}
                summary={summary}
                totalTransactions={transactions.length}
                onRefreshData={loadData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals and Overlays */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialProduct={editingProduct}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingProduct}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
      />

      {/* Stock In & Stock Out Movement Popup Form */}
      <TransactionModal
        isOpen={movementModalState.isOpen}
        products={products}
        selectedProduct={movementModalState.product}
        initialType={movementModalState.type}
        onClose={() =>
          setMovementModalState((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        onSubmit={handleRecordTransaction}
      />

      {/* Product Details & Movement History Modal */}
      <ProductDetailModal
        isOpen={!!detailProduct}
        product={detailProduct}
        transactions={transactions}
        onClose={() => setDetailProduct(null)}
        onEdit={(p) => {
          setDetailProduct(null);
          setEditingProduct(p);
          setIsAddModalOpen(true);
        }}
        onDelete={(p) => {
          setDetailProduct(null);
          setDeletingProduct(p);
        }}
        onStockMovement={(type, p) => {
          setMovementModalState({
            isOpen: true,
            type,
            product: p,
          });
        }}
      />

      <SetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onConnectionChanged={() => {
          loadData();
          addToast('info', 'Database connection updated.');
        }}
      />

      {/* Floating Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
