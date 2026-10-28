import {
  Product,
  Transaction,
  InventorySummary,
  ApiResponse,
  ProductFormData,
  TransactionFormData,
} from '../types/inventory';
import { validateProductInput, validateTransactionInput, calculateStockMovement } from './inventory-rules';

const STORAGE_KEY_PRODUCTS = 'stockflow_products_v1';
const STORAGE_KEY_TRANSACTIONS = 'stockflow_transactions_v1';
const STORAGE_KEY_API_URL = 'stockflow_apps_script_url';

// Curated initial demo items if local store is empty
const INITIAL_DEMO_PRODUCTS: Product[] = [
  {
    productId: 'prod-001',
    title: 'Classic Necklace',
    quantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    description: 'Traditional necklace design crafted in sterling silver with delicate chain.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    productId: 'prod-002',
    title: 'Minimalist Gold Ring',
    quantity: 14,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    description: '18K polished yellow gold band with subtle satin finish.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    productId: 'prod-003',
    title: 'Ceramic Studio Mug',
    quantity: 38,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    description: 'Hand-thrown stoneware mug with matte speckled glaze, 350ml.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    productId: 'prod-004',
    title: 'Leather Cardholder',
    quantity: 9,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    description: 'Vegetable-tanned saddle leather wallet with 4 quick-access card slots.',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    transactionId: 'tx-001',
    productId: 'prod-001',
    productTitle: 'Classic Necklace',
    type: 'IN',
    quantity: 25,
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    transactionId: 'tx-002',
    productId: 'prod-002',
    productTitle: 'Minimalist Gold Ring',
    type: 'IN',
    quantity: 20,
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    transactionId: 'tx-003',
    productId: 'prod-002',
    productTitle: 'Minimalist Gold Ring',
    type: 'OUT',
    quantity: 6,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

/**
 * Returns configured Google Apps Script Web App URL.
 * Checks localStorage first, then VITE_GOOGLE_APPS_SCRIPT_URL env var.
 */
export function getAppsScriptUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_API_URL);
    if (saved && saved.trim() !== '') return saved.trim();
  }
  const envUrl = (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string) || '';
  return envUrl.trim();
}

export function setAppsScriptUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim() !== '') {
      localStorage.setItem(STORAGE_KEY_API_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_API_URL);
    }
  }
}

export function isUsingLiveBackend(): boolean {
  return getAppsScriptUrl().length > 0;
}

// ---------------------------------------------------------------------------
// LocalStorage Bridge Implementation (Self-contained fallback)
// ---------------------------------------------------------------------------

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_DEMO_PRODUCTS));
    return [...INITIAL_DEMO_PRODUCTS];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalProducts(products: Product[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }
}

function getLocalTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
    return [...INITIAL_DEMO_TRANSACTIONS];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalTransactions(txs: Transaction[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(txs));
  }
}

// ---------------------------------------------------------------------------
// Remote Google Apps Script Fetch Helpers
// ---------------------------------------------------------------------------

async function fetchFromAppsScript<T>(
  action: string,
  method: 'GET' | 'POST' = 'GET',
  data?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const baseUrl = getAppsScriptUrl();
  if (!baseUrl) {
    throw new Error('Google Apps Script URL is not configured.');
  }

  let url = baseUrl;
  let options: RequestInit = {
    redirect: 'follow',
  };

  if (method === 'GET') {
    const params = new URLSearchParams();
    params.set('action', action);
    if (data) {
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v));
      });
    }
    url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
    options.method = 'GET';
  } else {
    // Note: Content-Type text/plain avoids CORS preflight OPTIONS in Apps Script
    options.method = 'POST';
    options.headers = {
      'Content-Type': 'text/plain;charset=utf-8',
    };
    options.body = JSON.stringify({ action, data });
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    const json = (await response.json()) as ApiResponse<T>;
    return json;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      data: null,
      message: errorMsg,
    };
  }
}

// ---------------------------------------------------------------------------
// Unified Public API Service
// ---------------------------------------------------------------------------

export const inventoryApi = {
  /**
   * Tests connection to a given Google Apps Script URL.
   */
  async testConnection(testUrl: string): Promise<{ success: boolean; message: string }> {
    if (!testUrl || !testUrl.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'URL must start with https://script.google.com/',
      };
    }
    try {
      const url = `${testUrl}${testUrl.includes('?') ? '&' : '?'}action=GET_SUMMARY`;
      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) {
        return { success: false, message: `Server responded with HTTP ${response.status}` };
      }
      const data = await response.json();
      if (data && data.success !== undefined) {
        return { success: true, message: 'Connected to Google Sheet successfully!' };
      }
      return { success: false, message: 'Invalid response from Google Apps Script.' };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Network error testing URL',
      };
    }
  },

  /**
   * Loads all products.
   */
  async getProducts(): Promise<Product[]> {
    if (isUsingLiveBackend()) {
      const res = await fetchFromAppsScript<Product[]>('GET_PRODUCTS', 'GET');
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to fetch products from Google Sheets');
    }

    // LocalStorage fallback - instant zero-delay read
    return getLocalProducts();
  },

  /**
   * Fetches single product by ID.
   */
  async getProduct(productId: string): Promise<Product | null> {
    if (isUsingLiveBackend()) {
      const res = await fetchFromAppsScript<Product>('GET_PRODUCT', 'GET', { productId });
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    }

    const items = getLocalProducts();
    return items.find((p) => p.productId === productId) || null;
  },

  /**
   * Creates a new product.
   */
  async createProduct(formData: ProductFormData): Promise<Product> {
    const val = validateProductInput(formData);
    if (!val.valid) {
      throw new Error(val.error || 'Invalid product input');
    }

    if (isUsingLiveBackend()) {
      try {
        const res = await fetchFromAppsScript<Product>(
          'CREATE_PRODUCT',
          'POST',
          formData as unknown as Record<string, unknown>
        );
        if (res.success && res.data) {
          const products = getLocalProducts();
          saveLocalProducts([res.data, ...products.filter((p) => p.productId !== res.data!.productId)]);
          return res.data;
        }
        console.warn('Google Sheets API did not complete creation, saving locally:', res.message);
      } catch (err: unknown) {
        console.warn('Network error reaching Google Sheets, falling back to local storage:', err);
      }
    }

    const products = getLocalProducts();
    const now = new Date().toISOString();
    const newProduct: Product = {
      productId: 'prod-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      title: formData.title.trim(),
      quantity: Number(formData.quantity),
      imageUrl: formData.imageUrl?.trim() || '',
      description: formData.description?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    products.unshift(newProduct);
    saveLocalProducts(products);
    return newProduct;
  },

  /**
   * Updates an existing product.
   */
  async updateProduct(productId: string, formData: Partial<ProductFormData>): Promise<Product> {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const val = validateProductInput(formData);
    if (!val.valid) {
      throw new Error(val.error || 'Invalid product data');
    }

    if (isUsingLiveBackend()) {
      try {
        const payload = { productId, ...formData };
        const res = await fetchFromAppsScript<Product>(
          'UPDATE_PRODUCT',
          'POST',
          payload as unknown as Record<string, unknown>
        );
        if (res.success && res.data) {
          const products = getLocalProducts();
          const updatedList = products.map((p) => (p.productId === productId ? res.data! : p));
          saveLocalProducts(updatedList);
          return res.data;
        }
        console.warn('Google Sheets API did not complete update, saving locally:', res.message);
      } catch (err: unknown) {
        console.warn('Network error reaching Google Sheets, falling back to local storage:', err);
      }
    }

    const products = getLocalProducts();
    const index = products.findIndex((p) => p.productId === productId);
    if (index === -1) {
      throw new Error('Product not found');
    }

    const current = products[index];
    const now = new Date().toISOString();
    const updated: Product = {
      ...current,
      title: formData.title !== undefined ? formData.title.trim() : current.title,
      quantity: formData.quantity !== undefined ? Number(formData.quantity) : current.quantity,
      imageUrl: formData.imageUrl !== undefined ? formData.imageUrl.trim() : current.imageUrl,
      description: formData.description !== undefined ? formData.description.trim() : current.description,
      updatedAt: now,
    };

    products[index] = updated;
    saveLocalProducts(products);
    return updated;
  },

  /**
   * Deletes a product.
   */
  async deleteProduct(productId: string): Promise<boolean> {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    if (isUsingLiveBackend()) {
      const res = await fetchFromAppsScript<{ productId: string }>('DELETE_PRODUCT', 'POST', { productId });
      if (res.success) {
        return true;
      }
      throw new Error(res.message || 'Failed to delete product in Google Sheets');
    }

    const products = getLocalProducts();
    const filtered = products.filter((p) => p.productId !== productId);
    if (filtered.length === products.length) {
      throw new Error('Product not found');
    }
    saveLocalProducts(filtered);
    return true;
  },

  /**
   * Retrieves transactions history.
   */
  async getTransactions(limit = 50): Promise<Transaction[]> {
    if (isUsingLiveBackend()) {
      const res = await fetchFromAppsScript<Transaction[]>('GET_TRANSACTIONS', 'GET', { limit });
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to fetch transactions from Google Sheets');
    }

    // Instant local read
    const txs = getLocalTransactions();
    return txs.slice(0, limit);
  },

  /**
   * Creates a stock movement transaction (Stock In or Stock Out).
   */
  async createTransaction(formData: TransactionFormData): Promise<Transaction> {
    const val = validateTransactionInput(formData);
    if (!val.valid) {
      throw new Error(val.error || 'Invalid transaction input');
    }

    if (isUsingLiveBackend()) {
      try {
        const res = await fetchFromAppsScript<Transaction>(
          'CREATE_TRANSACTION',
          'POST',
          formData as unknown as Record<string, unknown>
        );
        if (res.success && res.data) {
          return res.data;
        }
        console.warn('Google Sheets API did not complete transaction, recording locally:', res.message);
      } catch (err: unknown) {
        console.warn('Network error reaching Google Sheets, falling back to local storage:', err);
      }
    }

    const products = getLocalProducts();
    const product = products.find((p) => p.productId === formData.productId);
    if (!product) {
      throw new Error('Selected product does not exist.');
    }

    const calc = calculateStockMovement(product.quantity, formData.type, Number(formData.quantity));
    if (!calc.success) {
      throw new Error(calc.error || 'Stock calculation error');
    }

    // Apply movement locally
    const now = new Date().toISOString();
    product.quantity = calc.newStock;
    product.updatedAt = now;
    saveLocalProducts(products);

    const transactions = getLocalTransactions();
    const newTx: Transaction = {
      transactionId: 'tx-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      productId: product.productId,
      productTitle: product.title,
      type: formData.type,
      quantity: Number(formData.quantity),
      timestamp: now,
    };

    transactions.unshift(newTx);
    saveLocalTransactions(transactions);

    return newTx;
  },

  /**
   * Gets inventory summary for the Home page.
   */
  async getSummary(): Promise<InventorySummary> {
    if (isUsingLiveBackend()) {
      const res = await fetchFromAppsScript<InventorySummary>('GET_SUMMARY', 'GET');
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to fetch summary from Google Sheets');
    }

    const products = getLocalProducts();
    const totalQuantity = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

    const sorted = [...products].sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );

    return {
      totalProducts: products.length,
      totalQuantity,
      recentProducts: sorted.slice(0, 5),
    };
  },
};
