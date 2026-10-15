/**
 * Haptic feedback utility for mobile navigation and interactive feedback.
 * Adheres to accessibility guidelines with safe fallbacks.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light'): void {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(30);
          break;
        case 'success':
          navigator.vibrate([25, 40, 30]);
          break;
        case 'warning':
          navigator.vibrate([40, 50, 40]);
          break;
      }
    } catch {
      // Ignore vibration error if blocked by browser policy
    }
  }
}
