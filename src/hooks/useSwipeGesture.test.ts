import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSwipeDirection } from './useSwipeGesture.ts';

test('swipe left when horizontal delta exceeds threshold quickly', () => {
  const result = calculateSwipeDirection(80, 10, 200, 50, 550);
  assert.equal(result, 'left');
});

test('swipe right when negative horizontal delta exceeds threshold', () => {
  const result = calculateSwipeDirection(-80, 15, 220, 50, 550);
  assert.equal(result, 'right');
});

test('no swipe triggered on vertical scrolling', () => {
  const result = calculateSwipeDirection(20, 120, 200, 50, 550);
  assert.equal(result, null);
});

test('no swipe triggered when horizontal dominance is insufficient', () => {
  const result = calculateSwipeDirection(60, 55, 200, 50, 550);
  assert.equal(result, null);
});

test('no swipe triggered if gesture takes too long', () => {
  const result = calculateSwipeDirection(100, 10, 650, 50, 550);
  assert.equal(result, null);
});

test('no swipe triggered if distance is below minimum threshold', () => {
  const result = calculateSwipeDirection(30, 5, 150, 50, 550);
  assert.equal(result, null);
});
