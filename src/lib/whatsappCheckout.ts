/**
 * WhatsApp Direct Checkout Formatter for StreamBox Colombia
 * Formats a high-conversion, professional order breakdown to send directly to WhatsApp support.
 */

export interface WhatsAppOrderItem {
  productName: string;
  brand?: string;
  modalityName: string;
  duration: string;
  priceText: string;
  quantity: number;
}

export interface WhatsAppOrderDetails {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: WhatsAppOrderItem[];
  subtotalText: string;
  discountText?: string;
  totalText: string;
  currency: string;
  billingPeriod?: 'MONTHLY' | 'ANNUAL';
  paymentMethodPreference?: string;
  orderId?: string;
}

export const STREAMBOX_WHATSAPP_NUMBER = '573045967068';

export function formatWhatsAppOrderMessage(details: WhatsAppOrderDetails): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const periodLabel = details.billingPeriod === 'ANNUAL' ? 'PLAN ANUAL (-25% dto)' : 'PLAN MENSUAL';

  let text = `🎬 *STREAMBOX COLOMBIA — ORDEN DE SUSCRIPCIÓN* 🎬\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `👤 *Cliente:* ${details.customerName || 'Cliente StreamBox'}\n`;
  if (details.customerEmail) text += `📧 *Correo:* ${details.customerEmail}\n`;
  text += `📅 *Fecha:* ${dateStr} · ${timeStr}\n`;
  if (details.orderId) text += `🔖 *Orden ID:* \`${details.orderId}\`\n`;
  text += `⏱ *Periodicidad:* ${periodLabel}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📦 *DESGLOSE DE SERVICIOS:*\n`;

  details.items.forEach((item, idx) => {
    text += `${idx + 1}. *${item.productName}* (${item.brand || 'Digital'})\n`;
    text += `   • Modalidad: ${item.modalityName}\n`;
    text += `   • Duración: ${item.duration}\n`;
    text += `   • Cantidad: ${item.quantity}\n`;
    text += `   • Valor: ${item.priceText}\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (details.discountText) {
    text += `Subtotal: ${details.subtotalText}\n`;
    text += `Descuento Aplicado: -${details.discountText}\n`;
  }
  text += `💰 *TOTAL A CANCELAR: ${details.totalText}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💳 *MÉTODOS DE PAGO DISPONIBLES:*\n`;
  text += `• *Nequi:* 304 596 7068\n`;
  text += `• *Daviplata:* 311 413 9187\n`;
  text += `• *Bancolombia:* A la Mano / Transferencia\n`;
  text += `• *Binance Pay / USDT:* ID 849201923\n`;
  text += `• *Tarjeta Débito/Crédito / PSE:* Enlace seguro Wompi\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚡ *Entrega Inmediata:* 5 a 15 min tras enviar comprobante\n`;
  text += `🛡 *Garantía:* 100% activa durante todo el período\n\n`;
  text += `¡Hola equipo StreamBox! Deseo confirmar la disponibilidad y activar mi suscripción de inmediato. 🙌`;

  return text;
}

export function generateWhatsAppLink(details: WhatsAppOrderDetails): string {
  const message = formatWhatsAppOrderMessage(details);
  return `https://wa.me/${STREAMBOX_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
