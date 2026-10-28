import { useRef, useEffect } from 'react';

export type SwipeDirection = 'left' | 'right' | null;

export function calculateSwipeDirection(
  deltaX: number,
  deltaY: number,
  elapsedTime: number,
  minDistance: number = 50,
  maxTime: number = 550
): SwipeDirection {
  if (elapsedTime > maxTime) return null;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  if (absX >= minDistance && absX > absY * 1.4) {
    return deltaX > 0 ? 'left' : 'right';
  }
  return null;
}

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
  minDistance?: number;
  maxTime?: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
  minDistance = 45,
  maxTime = 550,
}: SwipeGestureOptions) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const isInputOrSlider = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof Element)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return true;
      }
      return !!target.closest('input, textarea, select, [data-no-swipe]');
    };

    const startSwipe = (clientX: number, clientY: number, target: EventTarget | null) => {
      if (isInputOrSlider(target)) {
        startX.current = null;
        startY.current = null;
        return;
      }
      startX.current = clientX;
      startY.current = clientY;
      startTime.current = Date.now();
    };

    const endSwipe = (clientX: number, clientY: number) => {
      if (startX.current === null || startY.current === null) return;
      const deltaX = startX.current - clientX;
      const deltaY = startY.current - clientY;
      const elapsedTime = Date.now() - startTime.current;

      startX.current = null;
      startY.current = null;

      const direction = calculateSwipeDirection(deltaX, deltaY, elapsedTime, minDistance, maxTime);
      if (direction === 'left') {
        onSwipeLeft?.();
      } else if (direction === 'right') {
        onSwipeRight?.();
      }
    };

    // Touch events for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) startSwipe(t.clientX, t.clientY, e.target);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (t) endSwipe(t.clientX, t.clientY);
    };

    // Pointer events for desktop and hybrid devices
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startSwipe(e.clientX, e.clientY, e.target);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      endSwipe(e.clientX, e.clientY);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [enabled, minDistance, maxTime, onSwipeLeft, onSwipeRight]);

  return {};
}
