/**
 * Minimal Stock Inventory Types
 * Matches Google Sheets schema:
 * Products: productId | title | quantity | imageUrl | description | createdAt | updatedAt
 * Transactions: transactionId | productId | productTitle | type | quantity | timestamp
 */

export interface Product {
  productId: string;
  title: string;
  category?: string;
  quantity: number;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  transactionId: string;
  productId: string;
  productTitle: string;
  type: TransactionType;
  quantity: number;
  timestamp: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalQuantity: number;
  recentProducts: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

export interface ProductFormData {
  title: string;
  category?: string;
  quantity: number;
  imageUrl?: string;
  description?: string;
}

export const DEFAULT_CATEGORIES = [
  'General',
  'Electronics',
  'Apparel',
  'Accessories',
  'Office',
  'Food & Beverage',
  'Health & Beauty',
  'Tools & Hardware',
] as const;

export interface TransactionFormData {
  productId: string;
  type: TransactionType;
  quantity: number;
}

export type ActivePage = 'home' | 'stock' | 'transactions' | 'settings';
