import { useRef, useCallback } from 'react';

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

/**
 * Swipe hook — uses pointer events for left/right swipe detection.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeCallbacks) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isTracking = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isTracking.current = true;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isTracking.current) return;
    isTracking.current = false;

    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;

    // Only trigger if horizontal movement > vertical movement
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  }, [onSwipeLeft, onSwipeRight, threshold]);

  const handlePointerMove = useCallback((_e: React.PointerEvent) => {
    // Could add real-time visual feedback here if needed
  }, []);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerMove: handlePointerMove,
  };
}
