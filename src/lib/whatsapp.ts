// WhatsApp Web & API Utility for StreamBox Colombia
// Formats professional, compliance-friendly notification templates for customers

import { Order, PaymentRequest } from '../types';

/**
 * Formats a Colombian phone number into international E.164 format for WhatsApp (57XXXXXXXXXX)
 */
export function formatColombiaPhoneForWhatsApp(phone?: string): string {
  if (!phone) return '573045967068';
  // Remove non-digits
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('57') && clean.length === 12) {
    return clean;
  }
  if (clean.length === 10) {
    return `57${clean}`;
  }
  return clean;
}

/**
 * Builds direct WhatsApp URL with URL-encoded message
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const formattedPhone = formatColombiaPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * WhatsApp Template: Order Confirmation & Payment Instructions
 */
export function getOrderPaymentInstructionsWhatsApp(
  order: Order,
  payment: PaymentRequest,
  nequiNumber: string,
  daviplataNumber: string
): string {
  const methodNumber = order.paymentMethod === 'NEQUI' ? nequiNumber : daviplataNumber;
  return `*¡HOLA! BIENVENIDO A STREAMBOX COLOMBIA* 🎬✨

Hemos recibido tu pedido *#${order.id}*.
━━━━━━━━━━━━━━━━━━━━━
🛒 *Resumen del Pedido:*
${order.items.map((i) => `• ${i.productName} (${i.modalityName}) - $${(i.priceCOP * i.quantity).toLocaleString('es-CO')} COP`).join('\n')}

💰 *Total a Transferir:* $${order.totalCOP.toLocaleString('es-CO')} COP
💳 *Método:* ${order.paymentMethod}
📱 *Número de Cuenta:* ${methodNumber}
━━━━━━━━━━━━━━━━━━━━━
📌 *Paso siguiente:*
1. Realiza la transferencia por tu app ${order.paymentMethod}.
2. Envíanos una captura o el número de referencia del comprobante.
3. Te entregaremos tus accesos y activación en minutos.

¡Gracias por elegir entretenimiento oficial con garantía!`;
}

/**
 * WhatsApp Template: Official Credentials Delivery & Warranty Activation
 */
export function getCredentialsDeliveryWhatsApp(order: Order): string {
  const firstItem = order.items[0];
  const formattedExpiry = order.expiresAt
    ? new Date(order.expiresAt).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Período Activo';

  return `*¡TU PEDIDO HA SIDO ENTREGADO CON ÉXITO!* 🚀🎉
━━━━━━━━━━━━━━━━━━━━━
🆔 *Pedido:* #${order.id}
👤 *Cliente:* ${order.userName}
📺 *Servicio:* ${firstItem?.productName || 'Suscripción Digital'}
⏳ *Duración:* ${firstItem?.duration || '1 Mes'}
📅 *Garantía activa hasta:* ${formattedExpiry}
━━━━━━━━━━━━━━━━━━━━━
🔑 *DATOS DE ACCESO:*
${order.credentialsDelivered || 'Credenciales activadas en plataforma'}

📋 *INSTRUCCIONES DE USO:*
${order.deliveryInstructions || '1. Inicia sesión en la plataforma oficial.\n2. Disfruta tu contenido sin restricciones.\n3. Prohibido cambiar correo o contraseña.'}
━━━━━━━━━━━━━━━━━━━━━
🛡️ *Garantía StreamBox:*
Cuentas con soporte técnico directo durante la totalidad de tu suscripción. Si necesitas ayuda, responde a este mensaje o contáctanos por nuestro chat interno.`;
}

/**
 * WhatsApp Template: Expiration Alert & Renewal Reminder
 */
export function getRenewalReminderWhatsApp(order: Order, daysRemaining: number): string {
  const firstItem = order.items[0];
  const urgency = daysRemaining <= 0
    ? '⚠️ *¡TU SUSCRIPCIÓN HA VENCIDO HOY!*'
    : daysRemaining === 1
    ? '⏰ *¡TU SUSCRIPCIÓN VENCE MAÑANA!*'
    : `⏰ *¡TU SUSCRIPCIÓN VENCE EN ${daysRemaining} DÍAS!*`;

  return `${urgency} 🍿

Hola *${order.userName.split(' ')[0]}*, esperamos que estés disfrutando tu entretenimiento.

Tu suscripción de:
📺 *${firstItem?.productName || 'Suscripción Digital'}* (${firstItem?.modalityName || 'Plan'})
Pedido anterior: *#${order.id}*

Para evitar cortes de servicio o perder tus listas y perfiles guardados, puedes renovar ahora mismo por solo *$${order.totalCOP.toLocaleString('es-CO')} COP*.

📲 *¿Deseas que te renovemos la cuenta de inmediato?* Responde "SÍ RENOVAR" y te enviaremos el enlace de pago directo.

_StreamBox Colombia · Entretenimiento sin Límites_`;
}

/**
 * WhatsApp Template: Customer Support Quick Inquiry
 */
export function getCustomerSupportWhatsApp(orderId?: string, userEmail?: string): string {
  let msg = `Hola StreamBox Colombia 👋, necesito asistencia`;
  if (orderId) msg += ` con mi pedido *#${orderId}*`;
  if (userEmail) msg += ` (Cuenta: ${userEmail})`;
  msg += `. ¿Podrían ayudarme por favor?`;
  return msg;
}
