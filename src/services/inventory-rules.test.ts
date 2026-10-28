import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateProductInput,
  validateTransactionInput,
  calculateStockMovement,
} from './inventory-rules';

test('validateProductInput rejects empty title', () => {
  const result = validateProductInput({ title: '   ', quantity: 10 });
  assert.equal(result.valid, false);
  assert.equal(result.field, 'title');
});

test('validateProductInput rejects negative quantity', () => {
  const result = validateProductInput({ title: 'Diamond Ring', quantity: -5 });
  assert.equal(result.valid, false);
  assert.equal(result.field, 'quantity');
});

test('validateProductInput rejects non-integer quantity', () => {
  const result = validateProductInput({ title: 'Diamond Ring', quantity: 4.5 });
  assert.equal(result.valid, false);
  assert.equal(result.field, 'quantity');
});

test('validateProductInput accepts valid product with 0 quantity and category', () => {
  const result = validateProductInput({
    title: 'Silver Chain',
    category: 'Accessories',
    quantity: 0,
    description: 'Fine sterling silver chain',
  });
  assert.equal(result.valid, true);
});

test('validateProductInput rejects category exceeding 60 characters', () => {
  const result = validateProductInput({
    title: 'Gold Ring',
    category: 'A'.repeat(65),
    quantity: 5,
  });
  assert.equal(result.valid, false);
  assert.equal(result.field, 'category');
});

test('validateTransactionInput rejects missing productId', () => {
  const result = validateTransactionInput({
    productId: '',
    type: 'IN',
    quantity: 5,
  });
  assert.equal(result.valid, false);
  assert.equal(result.field, 'productId');
});

test('validateTransactionInput rejects non-positive quantity', () => {
  const result = validateTransactionInput({
    productId: 'p-123',
    type: 'IN',
    quantity: 0,
  });
  assert.equal(result.valid, false);
  assert.equal(result.field, 'quantity');
});

test('calculateStockMovement increases stock for Stock In', () => {
  const result = calculateStockMovement(25, 'IN', 10);
  assert.equal(result.success, true);
  assert.equal(result.newStock, 35);
});

test('calculateStockMovement decreases stock for Stock Out when sufficient', () => {
  const result = calculateStockMovement(25, 'OUT', 10);
  assert.equal(result.success, true);
  assert.equal(result.newStock, 15);
});

test('calculateStockMovement rejects Stock Out when quantity exceeds available stock', () => {
  const result = calculateStockMovement(10, 'OUT', 15);
  assert.equal(result.success, false);
  assert.equal(result.newStock, 10);
  assert.match(result.error || '', /Insufficient stock/i);
});

test('calculateStockMovement allows Stock Out reducing to exact zero', () => {
  const result = calculateStockMovement(10, 'OUT', 10);
  assert.equal(result.success, true);
  assert.equal(result.newStock, 0);
});

test('getProductStockStatus correctly determines status categories', async () => {
  const { getProductStockStatus } = await import('./inventory-rules');
  assert.equal(getProductStockStatus(0), 'OUT_OF_STOCK');
  assert.equal(getProductStockStatus(-2), 'OUT_OF_STOCK');
  assert.equal(getProductStockStatus(1), 'LOW_STOCK');
  assert.equal(getProductStockStatus(4), 'LOW_STOCK');
  assert.equal(getProductStockStatus(5), 'IN_STOCK');
  assert.equal(getProductStockStatus(120), 'IN_STOCK');
});

test('filterTransactionsForProduct matches both by ID and normalized Title', async () => {
  const { filterTransactionsForProduct } = await import('./inventory-rules');
  const txs = [
    { transactionId: 't1', productId: 'p1', productTitle: 'Gold Ring', type: 'IN', quantity: 10, timestamp: '2026-10-27T10:00:00Z' },
    { transactionId: 't2', productId: 'p2', productTitle: 'Silver Chain', type: 'IN', quantity: 5, timestamp: '2026-10-27T11:00:00Z' },
    { transactionId: 't3', productId: 'p1', productTitle: 'Gold Ring', type: 'OUT', quantity: 2, timestamp: '2026-10-27T12:00:00Z' },
    { transactionId: 't4', productId: 'p-custom', productTitle: 'gold ring', type: 'IN', quantity: 3, timestamp: '2026-10-27T13:00:00Z' },
  ];

  const filtered = filterTransactionsForProduct(txs, 'p1', 'Gold Ring');
  assert.equal(filtered.length, 3);
  assert.deepEqual(filtered.map(t => t.transactionId), ['t1', 't3', 't4']);

  const emptyFilter = filterTransactionsForProduct(txs, 'p999', 'Non-existent item');
  assert.equal(emptyFilter.length, 0);
});

test('groupTransactionsByDate calculates daily totalIn and totalOut correctly', async () => {
  const { groupTransactionsByDate } = await import('./inventory-rules');
  const txs = [
    { transactionId: 't1', productId: 'p1', productTitle: 'Item A', type: 'IN' as const, quantity: 15, timestamp: '2026-10-27T10:00:00Z' },
    { transactionId: 't2', productId: 'p1', productTitle: 'Item A', type: 'OUT' as const, quantity: 5, timestamp: '2026-10-27T12:00:00Z' },
    { transactionId: 't3', productId: 'p2', productTitle: 'Item B', type: 'IN' as const, quantity: 8, timestamp: '2026-10-26T09:00:00Z' },
  ];

  const groups = groupTransactionsByDate(txs);
  assert.equal(groups.length, 2);

  const oct27Group = groups.find((g) => g.dateKey.includes('2026-10-27'));
  assert.ok(oct27Group);
  assert.equal(oct27Group.totalIn, 15);
  assert.equal(oct27Group.totalOut, 5);
  assert.equal(oct27Group.transactions.length, 2);

  const oct26Group = groups.find((g) => g.dateKey.includes('2026-10-26'));
  assert.ok(oct26Group);
  assert.equal(oct26Group.totalIn, 8);
  assert.equal(oct26Group.totalOut, 0);
  assert.equal(oct26Group.transactions.length, 1);
});

test('filterTransactionsByDateRange filters properly', async () => {
  const { filterTransactionsByDateRange } = await import('./inventory-rules');
  const now = new Date();
  const todayIso = now.toISOString();
  const past3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const past40Days = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString();

  const txs = [
    { transactionId: 'today', timestamp: todayIso },
    { transactionId: '3days', timestamp: past3Days },
    { transactionId: '40days', timestamp: past40Days },
  ];

  assert.equal(filterTransactionsByDateRange(txs, 'ALL').length, 3);
  assert.equal(filterTransactionsByDateRange(txs, 'TODAY').length, 1);
  assert.equal(filterTransactionsByDateRange(txs, 'WEEK').length, 2);
  assert.equal(filterTransactionsByDateRange(txs, 'MONTH').length, 2);
});

test('MAX_IMAGE_DATA_URL_LENGTH does not exceed Google Sheets 50,000 character cell limit', async () => {
  const { MAX_IMAGE_DATA_URL_LENGTH } = await import('../utils/image-helpers');
  assert.ok(MAX_IMAGE_DATA_URL_LENGTH < 50000);
  assert.equal(MAX_IMAGE_DATA_URL_LENGTH, 38000);
});


