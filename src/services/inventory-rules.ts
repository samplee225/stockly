import { ProductFormData, TransactionFormData } from '../types/inventory';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  field?: string;
}

/**
 * Validates product creation and editing fields.
 * Rules:
 * - Title is required and non-empty
 * - Quantity must be a valid whole number >= 0
 * - Optional image URL must be a valid HTTPS url if provided
 */
export function validateProductInput(data: Partial<ProductFormData>): ValidationResult {
  if (!data.title || data.title.trim() === '') {
    return { valid: false, field: 'title', error: 'Product title is required.' };
  }

  if (data.title.trim().length > 120) {
    return { valid: false, field: 'title', error: 'Product title cannot exceed 120 characters.' };
  }

  if (data.category && data.category.trim().length > 60) {
    return { valid: false, field: 'category', error: 'Category name cannot exceed 60 characters.' };
  }

  if (data.quantity === undefined || data.quantity === null || isNaN(Number(data.quantity))) {
    return { valid: false, field: 'quantity', error: 'Quantity must be a valid whole number.' };
  }

  const num = Number(data.quantity);
  if (!Number.isInteger(num)) {
    return { valid: false, field: 'quantity', error: 'Quantity must be an integer (whole number).' };
  }

  if (num < 0) {
    return { valid: false, field: 'quantity', error: 'Quantity cannot be negative.' };
  }

  if (data.imageUrl && data.imageUrl.trim() !== '') {
    const trimmed = data.imageUrl.trim();
    if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://') && !trimmed.startsWith('data:image/')) {
      return { valid: false, field: 'imageUrl', error: 'Image URL should start with https:// or be a valid image link.' };
    }
  }

  return { valid: true };
}

/**
 * Validates transaction inputs.
 * Rules:
 * - Product ID is required
 * - Type must be 'IN' or 'OUT'
 * - Quantity must be an integer >= 1
 */
export function validateTransactionInput(data: Partial<TransactionFormData>): ValidationResult {
  if (!data.productId || data.productId.trim() === '') {
    return { valid: false, field: 'productId', error: 'Please select a product.' };
  }

  if (data.type !== 'IN' && data.type !== 'OUT') {
    return { valid: false, field: 'type', error: "Transaction type must be 'IN' or 'OUT'." };
  }

  if (data.quantity === undefined || data.quantity === null || isNaN(Number(data.quantity))) {
    return { valid: false, field: 'quantity', error: 'Quantity must be a valid number.' };
  }

  const qty = Number(data.quantity);
  if (!Number.isInteger(qty) || qty <= 0) {
    return { valid: false, field: 'quantity', error: 'Quantity must be a positive whole number (at least 1).' };
  }

  return { valid: true };
}

/**
 * Calculates new stock quantity after a movement and verifies stock availability.
 * Rejects negative resulting stock.
 */
export function calculateStockMovement(
  currentStock: number,
  type: 'IN' | 'OUT',
  movementQty: number
): { success: boolean; newStock: number; error?: string } {
  if (movementQty <= 0 || !Number.isInteger(movementQty)) {
    return { success: false, newStock: currentStock, error: 'Movement quantity must be a positive integer.' };
  }

  if (type === 'IN') {
    return { success: true, newStock: currentStock + movementQty };
  }

  if (type === 'OUT') {
    if (movementQty > currentStock) {
      return {
        success: false,
        newStock: currentStock,
        error: `Insufficient stock. Current stock is ${currentStock}, requested out is ${movementQty}.`,
      };
    }
    return { success: true, newStock: currentStock - movementQty };
  }

  return { success: false, newStock: currentStock, error: 'Invalid transaction type.' };
}

/**
 * Returns clean categorical stock status based on inventory level
 */
export function getProductStockStatus(quantity: number): 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK' {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity < 5) return 'LOW_STOCK';
  return 'IN_STOCK';
}

/**
 * Filters transaction list to all records pertaining to a specific product
 */
export function filterTransactionsForProduct<T extends { productId: string; productTitle: string }>(
  transactions: T[],
  productId: string,
  productTitle: string
): T[] {
  const normTitle = productTitle.trim().toLowerCase();
  return transactions.filter(
    (tx) => tx.productId === productId || tx.productTitle.trim().toLowerCase() === normTitle
  );
}

export interface DateGroupedTransactions<T> {
  dateKey: string;
  dateLabel: string;
  formattedDate: string;
  totalIn: number;
  totalOut: number;
  transactions: T[];
}

export type DateFilterRange = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';

/**
 * Groups movements by date with aggregate IN and OUT counts for each day
 */
export function groupTransactionsByDate<T extends { timestamp: string; type: 'IN' | 'OUT'; quantity: number }>(
  transactions: T[]
): DateGroupedTransactions<T>[] {
  const groups: Map<string, { label: string; formatted: string; totalIn: number; totalOut: number; list: T[] }> = new Map();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  transactions.forEach((tx) => {
    let key = 'unknown';
    let label = 'Unknown Date';
    let formatted = 'Unknown Date';

    if (tx.timestamp) {
      const d = new Date(tx.timestamp);
      if (!isNaN(d.getTime())) {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (key === todayStr) {
          label = 'Today';
        } else if (key === yesterdayStr) {
          label = 'Yesterday';
        } else {
          label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        }
        formatted = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
    }

    if (!groups.has(key)) {
      groups.set(key, {
        label,
        formatted,
        totalIn: 0,
        totalOut: 0,
        list: [],
      });
    }

    const group = groups.get(key)!;
    group.list.push(tx);
    if (tx.type === 'IN') {
      group.totalIn += tx.quantity;
    } else {
      group.totalOut += tx.quantity;
    }
  });

  return Array.from(groups.entries()).map(([dateKey, val]) => ({
    dateKey,
    dateLabel: val.label,
    formattedDate: val.formatted,
    totalIn: val.totalIn,
    totalOut: val.totalOut,
    transactions: val.list,
  }));
}

/**
 * Filters transactions based on date time ranges (Today, 7 days, 30 days, or all)
 */
export function filterTransactionsByDateRange<T extends { timestamp: string }>(
  transactions: T[],
  range: DateFilterRange
): T[] {
  if (range === 'ALL') return transactions;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  if (range === 'TODAY') {
    return transactions.filter((t) => {
      const time = new Date(t.timestamp).getTime();
      return !isNaN(time) && time >= startOfToday;
    });
  }

  if (range === 'WEEK') {
    const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
    return transactions.filter((t) => {
      const time = new Date(t.timestamp).getTime();
      return !isNaN(time) && time >= sevenDaysAgo;
    });
  }

  if (range === 'MONTH') {
    const thirtyDaysAgo = startOfToday - 30 * 24 * 60 * 60 * 1000;
    return transactions.filter((t) => {
      const time = new Date(t.timestamp).getTime();
      return !isNaN(time) && time >= thirtyDaysAgo;
    });
  }

  return transactions;
}
