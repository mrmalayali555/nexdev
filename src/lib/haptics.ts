'use client';

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const triggerHaptic = async (type: 'light' | 'medium' | 'success' | 'warning' = 'light') => {
  try {
    if (typeof window === 'undefined') return;
    
    if (type === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (type === 'warning') {
      await Haptics.notification({ type: NotificationType.Warning });
    } else if (type === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch {
    // If running in pure desktop browser without vibration hardware, fail silently
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(type === 'success' ? [50, 50, 50] : 30);
      } catch {}
    }
  }
};

