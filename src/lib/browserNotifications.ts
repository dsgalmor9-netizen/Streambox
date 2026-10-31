/**
 * StreamBox - Browser Web Notification API Integration
 * Manages push notifications for order delivery, credential arrivals, and subscription expiration alerts.
 */

import { Order } from '../types';

// High-resolution SVG Data URI for StreamBox notification icon
const STREAMBOX_NOTIF_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f0f17"/><stop offset="100%" stop-color="%23050508"/></linearGradient><linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fbbf24"/><stop offset="100%" stop-color="%23f59e0b"/></linearGradient></defs><rect width="128" height="128" rx="28" fill="url(%23bg)" stroke="%23f59e0b" stroke-width="4"/><polygon points="50,40 92,64 50,88" fill="url(%23accent)"/><circle cx="64" cy="64" r="54" fill="none" stroke="%23fbbf24" stroke-width="2" stroke-dasharray="6 4" opacity="0.4"/></svg>`;

/**
 * Checks if Notification API is supported by the current browser environment.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Returns current permission status ('granted', 'denied', or 'default').
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Prompts the user to grant push notification permissions.
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    // Legacy browser fallback
    return new Promise((resolve) => {
      Notification.requestPermission((perm) => resolve(perm));
    });
  }
}

/**
 * Plays a discrete, pleasant cinema-grade audio tone using Web Audio API
 */
export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: Gentle chime (F#5 - 739.99 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(739.99, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: Harmonic resolution (B5 - 987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.09);
    gain2.gain.setValueAtTime(0.09, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.55);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
}

export interface BrowserNotificationResult {
  success: boolean;
  permission: NotificationPermission;
  delivered: boolean;
  message?: string;
}

/**
 * Sends a browser notification with StreamBox branding and fallback event.
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions & { playSound?: boolean; onClickUrl?: string }
): BrowserNotificationResult {
  if (!isNotificationSupported()) {
    return {
      success: false,
      permission: 'denied',
      delivered: false,
      message: 'Las notificaciones no están soportadas en este navegador.',
    };
  }

  const permission = Notification.permission;
  if (permission !== 'granted') {
    return {
      success: false,
      permission,
      delivered: false,
      message: 'Permiso de notificaciones no concedido.',
    };
  }

  try {
    const notification = new Notification(title, {
      icon: STREAMBOX_NOTIF_ICON,
      badge: STREAMBOX_NOTIF_ICON,
      ...options,
    });

    if (options?.playSound !== false) {
      playNotificationSound();
    }

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();

      // Trigger custom app event for navigation if listener is present
      window.dispatchEvent(
        new CustomEvent('streambox:notification-click', {
          detail: { title, options },
        })
      );
    };

    return {
      success: true,
      permission: 'granted',
      delivered: true,
    };
  } catch (err) {
    return {
      success: false,
      permission: 'granted',
      delivered: false,
      message: err instanceof Error ? err.message : 'Error al despachar notificación',
    };
  }
}

/**
 * Dispatches an Order Delivery notification when credentials have arrived.
 * Deduplicates to prevent spamming for the same order.
 */
export function notifyOrderDelivered(order: Order, force = false): boolean {
  if (!order || order.orderStatus !== 'ENTREGADO') return false;

  const dedupKey = `sb_notif_delivered_${order.id}`;
  if (!force && typeof window !== 'undefined' && localStorage.getItem(dedupKey)) {
    return false; // Already sent notification for this delivery
  }

  const productNames = order.items.map((i) => i.productName).join(', ') || 'Servicio Digital';
  const title = `🚀 ¡Tu pedido #${order.id} ha sido entregado!`;
  const body = `Las credenciales de ${productNames} ya están listas en tu Portal de Cliente. Toca para ver tus datos de acceso.`;

  const res = sendBrowserNotification(title, {
    body,
    tag: `sb-order-delivered-${order.id}`,
    requireInteraction: true,
  });

  if (res.delivered && typeof window !== 'undefined') {
    try {
      localStorage.setItem(dedupKey, new Date().toISOString());
    } catch {
      // Ignore storage errors
    }
  }

  return res.delivered;
}

/**
 * Dispatches an Expiring Soon notification for subscriptions within 3 days of expiration.
 * Deduplicated once per day per order.
 */
export function notifySubscriptionExpiringSoon(
  order: Order,
  daysRemaining: number,
  force = false
): boolean {
  if (!order || !order.expiresAt) return false;

  const todayStr = new Date().toISOString().slice(0, 10);
  const dedupKey = `sb_notif_expiring_${order.id}_${todayStr}`;
  if (!force && typeof window !== 'undefined' && localStorage.getItem(dedupKey)) {
    return false; // Already notified today
  }

  const productName = order.items[0]?.productName || 'Suscripción StreamBox';
  let title = `⏳ Próximo a Vencer: ${productName}`;
  let body = '';

  if (daysRemaining <= 0) {
    title = `⚠️ Servicio Vencido: ${productName}`;
    body = `Tu suscripción venció hoy. Renueva ahora con 1 clic para no perder tus perfiles y configuraciones.`;
  } else if (daysRemaining === 1) {
    body = `Tu suscripción vence MAÑANA. Renueva con anticipación para mantener tu entretenimiento ininterrumpido.`;
  } else {
    body = `Tu suscripción vence en ${daysRemaining} días. Renueva en tu portal con Nequi o Daviplata.`;
  }

  const res = sendBrowserNotification(title, {
    body,
    tag: `sb-order-expiring-${order.id}-${todayStr}`,
    requireInteraction: false,
  });

  if (res.delivered && typeof window !== 'undefined') {
    try {
      localStorage.setItem(dedupKey, todayStr);
    } catch {
      // Ignore storage errors
    }
  }

  return res.delivered;
}

/**
 * Triggers an interactive test notification so the user can test the push system immediately.
 */
export function sendTestNotification(type: 'delivery' | 'expiring'): BrowserNotificationResult {
  if (type === 'delivery') {
    return sendBrowserNotification('🚀 ¡Prueba: Pedido Entregado!', {
      body: '¡Excelente! Tus notificaciones push de StreamBox están funcionando. Aquí recibirás tus credenciales y pines de acceso.',
      tag: `sb-test-delivery-${Date.now()}`,
      requireInteraction: false,
    });
  } else {
    return sendBrowserNotification('⏳ ¡Prueba: Alerta de Vencimiento!', {
      body: 'Tu cuenta de Netflix UHD vence en 2 días. Este aviso te llegará automáticamente para renovar a tiempo.',
      tag: `sb-test-expiring-${Date.now()}`,
      requireInteraction: false,
    });
  }
}
