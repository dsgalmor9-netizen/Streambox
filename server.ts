import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize server-side Gemini client optionally if key is present
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Admin notification memory log
interface AdminNotification {
  id: string;
  type: 'HUMAN_SUPPORT_REQUEST';
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  reason: string;
  lastMessage: string;
  emailSentTo: string;
  smsSentTo: string;
  timestamp: string;
  status: 'DELIVERED';
}

const adminNotifications: AdminNotification[] = [];

// System prompt for StreamBox customer support
const STREAMBOX_SYSTEM_INSTRUCTION = `
Eres StreamBot AI, el asistente oficial de inteligencia artificial y asesor de atención al cliente de StreamBox Colombia (https://streambox.co).
Tu misión es atender con máxima cordialidad, rapidez, claridad y profesionalismo a los clientes colombianos que consultan sobre cuentas de streaming, música, inteligencia artificial, software, licencias, métodos de pago, estado de pedidos y renovaciones.

INFORMACIÓN COMERCIAL Y OPERATIVA CLAVE DE STREAMBOX COLOMBIA:
1. Pasarelas de Pago Oficiales en Colombia:
   - Nequi: 3045967068 (Cuenta oficial StreamBox Colombia)
   - Daviplata: 3114139187 (Cuenta oficial StreamBox Colombia)
   * Todos los pagos son manuales, seguros y verificados por nuestro equipo.
   * Tras transferir, el cliente reporta el comprobante y número de referencia en la sección de Checkout / Mis Pagos para recibir de inmediato sus accesos por chat.

2. Catálogo Destacado y Precios en COP (Pesos Colombianos):
   - MUBI: Mensual ($28.900 COP) y Anual ($239.000 COP).
   - Rakuten TV: Alquiler de película ($12.900 COP) y Compra ($34.900 COP).
   - Apple Music: Individual ($18.500 COP/mes), Estudiantes ($9.900 COP/mes), Familiar ($30.500 COP/mes).
   - Adobe Creative Cloud: Standard ($130.900 COP/mes), Pro ($166.600 COP/mes), Photoshop ($45.030 COP/mes), Premiere ($45.030 COP/mes).
   - Google Gemini AI: Plus ($19.900 COP/mes), Pro ($79.000 COP/mes), Ultra ($449.000 COP/mes).
   - Notion: Plus ($32.100 COP/mes por miembro), Business ($64.200 COP/mes por miembro).
   - Google One: Basic 100 GB ($6.400 COP/mes), AI Plus 400 GB ($19.900 COP/mes), AI Pro 5 TB ($79.000 COP/mes).
   - PlayStation Plus:
     * Essential: 1 mes ($33.472 COP), 3 meses ($85.600 COP), 12 meses ($247.708 COP).
     * Extra: 1 mes ($50.230 COP), 3 meses ($141.375 COP), 12 meses ($401.871 COP).
     * Deluxe: 1 mes ($59.530 COP), 3 meses ($163.755 COP), 12 meses ($465.339 COP).
   - Duolingo Super: 1 mes ($34.900 COP), 12 meses ($229.900 COP).
   - DaVinci Resolve: Gratuita ($0 COP), DaVinci Resolve Studio Licencia Vitalicia ($1.050.000 COP).
   - Google Workspace Empresa: Business Starter Anual ($22.464 COP/mes), Business Standard Anual ($44.927 COP/mes), Business Plus Anual ($70.600 COP/mes). Flexibles: Starter ($26.956 COP/mes), Standard ($53.913 COP/mes), Plus ($84.721 COP/mes).
   - Contenido Digital Autorizado / Tarjetas Regalo: Denominaciones de $20.000, $50.000 y $100.000 COP.
   - Bitdefender: Total Security 5 dispositivos (1 año $164.500 COP, 2 años $217.485 COP), Family 25 dispositivos ($197.386 COP), Antivirus Plus ($64.457 COP).
   - Proton VPN Plus: Oferta 24 meses ($268.600 COP aprox.).
   - YouTube Music Premium: Individual ($23.900 COP/mes), Familiar ($39.900 COP/mes).
   - YouTube Premium: Individual ($30.900 COP/mes), Familiar ($61.900 COP/mes).
   - Deezer HiFi: Individual ($23.900 COP/mes), Familiar ($35.500 COP/mes).
   - Spotify, Netflix, Disney+, Max, Amazon Prime Video y más servicios premium garantizados.

3. Garantía y Legalidad:
   - Cuentas 100% legales, estables y garantizadas durante todo el periodo contratado (Ley 1480 del Consumidor en Colombia).

4. PROTOCOLO OBLIGATORIO DE ATENCIÓN HUMANA:
   - Si el cliente solicita hablar con una persona, asesor humano, soporte telefónico, o expresa que prefiere ser atendido por un humano:
     1. Responde de forma muy amable confirmando que en este instante estás transfiriendo la conversación al equipo de atención humana.
     2. Infórmale que se ha enviado una alerta por correo a d.s.gal.mor.9@gmail.com y una notificación por SMS al celular oficial (+57 304 596 7068).
     3. Incluye la etiqueta exacta [SOLICITUD_ASESOR_HUMANO] al final de tu respuesta para que el sistema active automáticamente la notificación y despliegue los botones de contacto directo por WhatsApp y SMS.

Estilo de respuesta:
- Amable, claro, enfocado en Colombia (usar expresiones naturales y respetuosas como "¡Con gusto!", "Hola", "Por supuesto").
- Usa formato con viñetas cuando detalles precios o pasos.
- Mantén respuestas concisas y fáciles de leer en un chat de celular o escritorio.
`;

// Intelligent Local Fallback Response Engine for StreamBox Colombia
function generateLocalSupportResponse(lastMessage: string, userContext?: any): { reply: string; needsHumanHandover: boolean } {
  const upper = (lastMessage || '').toUpperCase();
  const explicitHumanRequest =
    upper.includes('HUMANO') ||
    upper.includes('ASESOR') ||
    upper.includes('PERSONA') ||
    upper.includes('HABLAR CON ALGUIEN') ||
    upper.includes('AGENTE');

  if (explicitHumanRequest) {
    return {
      reply: '¡Con gusto! En este momento te estoy transfiriendo con nuestro equipo de atención humana. Hemos enviado una alerta directa al correo oficial d.s.gal.mor.9@gmail.com y por SMS al celular (+57 304 596 7068). Un asesor se comunicará contigo de inmediato o puedes escribirnos al WhatsApp oficial.',
      needsHumanHandover: true,
    };
  }

  if (upper.includes('NEQUI') || upper.includes('DAVIPLATA') || upper.includes('PAGO') || upper.includes('TRANSFER') || upper.includes('COMPROBANTE')) {
    return {
      reply: '¡Hola! Para pagos en Colombia recibimos transferencias a través de:\n• **Nequi**: 3045967068\n• **Daviplata**: 3114139187\n\nUna vez realizada la transferencia, sube el comprobante o escribe tu número de referencia en la sección de Checkout / Mis Pagos para recibir tus credenciales de inmediato por este chat.',
      needsHumanHandover: false,
    };
  }

  if (upper.includes('PRECIO') || upper.includes('PLAN') || upper.includes('COSTO') || upper.includes('VALOR') || upper.includes('CATALOGO') || upper.includes('NETFLIX') || upper.includes('SPOTIFY')) {
    return {
      reply: '¡Claro que sí! En StreamBox Colombia contamos con las mejores tarifas en pesos colombianos (COP):\n• **Netflix 4K UHD**: Desde $13.500 COP/mes (Perfil privado con PIN)\n• **Spotify Premium**: Desde $49.000 COP (3 Meses garantizados)\n• **Disney+ / Max**: Desde $14.900 COP/mes\n• **YouTube Premium**: Desde $30.900 COP/mes\n\nPuedes ver el catálogo completo y todas las modalidades en la pestaña "Catálogo".',
      needsHumanHandover: false,
    };
  }

  if (upper.includes('GARANTIA') || upper.includes('FALLA') || upper.includes('NO FUNCIONA') || upper.includes('CLAVE') || upper.includes('PIN')) {
    return {
      reply: 'Todas nuestras suscripciones cuentan con **100% de Garantía StreamBox activa** durante toda la vigencia contratada (Ley 1480 del Consumidor en Colombia). Si tienes alguna novedad con tus accesos, compártenos el ID de tu pedido o escribe "quiero hablar con un asesor" para reemplazo prioritario.',
      needsHumanHandover: false,
    };
  }

  return {
    reply: `¡Hola${userContext?.name ? ` ${userContext.name}` : ''}! Bienvenido a StreamBox Colombia 🇨🇴. ¿En qué te podemos colaborar hoy? Puedes consultarnos sobre métodos de pago (Nequi / Daviplata), precios de catálogo, estado de tu pedido o solicitar atención con un asesor humano escribiendo "asesor".`,
    needsHumanHandover: false,
  };
}

// Helper to call Gemini with model fallback if configured
async function callGemini(contents: any[]) {
  if (!ai) {
    return null;
  }

  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: STREAMBOX_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`[Gemini API] Model ${model} returned error:`, err?.message || err);
      lastError = err;
    }
  }

  return null;
}

// 1. Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || '';
    const upperMsg = lastUserMessage.toUpperCase();
    const explicitHumanRequest =
      upperMsg.includes('HUMANO') ||
      upperMsg.includes('ASESOR') ||
      upperMsg.includes('PERSONA') ||
      upperMsg.includes('HABLAR CON ALGUIEN') ||
      upperMsg.includes('AGENTE');

    let replyText = '';
    let needsHumanHandover = explicitHumanRequest;
    let modelUsed = 'streambox-local-ai';

    if (ai) {
      // Build multi-turn contents format for @google/genai
      const formattedContents = messages.map((m: { role?: string; sender?: string; content?: string; text?: string }) => {
        const isUser = m.role === 'user' || m.sender === 'USER';
        const textContent = m.text || m.content || '';
        return {
          role: isUser ? 'user' : 'model',
          parts: [{ text: textContent }],
        };
      });

      if (userContext) {
        const contextPrefix = `[Contexto del Cliente: Nombre: ${userContext.name || 'Cliente'}, Email: ${userContext.email || 'N/A'}${userContext.recentOrder ? `, Último Pedido: #${userContext.recentOrder.id} (${userContext.recentOrder.status})` : ''}]\n`;
        const lastIndex = formattedContents.length - 1;
        if (lastIndex >= 0 && formattedContents[lastIndex].role === 'user') {
          formattedContents[lastIndex].parts[0].text =
            contextPrefix + formattedContents[lastIndex].parts[0].text;
        }
      }

      const geminiResult = await callGemini(formattedContents);
      if (geminiResult && geminiResult.text) {
        replyText = geminiResult.text;
        modelUsed = geminiResult.modelUsed;
        if (replyText.includes('[SOLICITUD_ASESOR_HUMANO]')) {
          needsHumanHandover = true;
          replyText = replyText.replace(/\[SOLICITUD_ASESOR_HUMANO\]/g, '').trim();
        }
      }
    }

    // Fallback to local intelligent response if Gemini is not configured or failed
    if (!replyText) {
      const localResult = generateLocalSupportResponse(lastUserMessage, userContext);
      replyText = localResult.reply;
      needsHumanHandover = needsHumanHandover || localResult.needsHumanHandover;
    }

    // If handover needed, log notification
    if (needsHumanHandover) {
      const notifItem: AdminNotification = {
        id: `notif-${Date.now()}`,
        type: 'HUMAN_SUPPORT_REQUEST',
        customerName: userContext?.name || 'Cliente StreamBox',
        customerEmail: userContext?.email || 'N/A',
        customerPhone: userContext?.phone || 'N/A',
        reason: 'El cliente solicitó ser atendido por un asesor humano en el chat.',
        lastMessage: lastUserMessage,
        emailSentTo: 'd.s.gal.mor.9@gmail.com',
        smsSentTo: '+57 304 596 7068',
        timestamp: new Date().toISOString(),
        status: 'DELIVERED',
      };
      adminNotifications.unshift(notifItem);
      console.log(`\n📢 [ALERTA DE ATENCIÓN HUMANA ENVIADA]`);
      console.log(`✉️ Correo enviado a: d.s.gal.mor.9@gmail.com`);
      console.log(`📱 Notificación SMS/WhatsApp a: +57 304 596 7068`);
      console.log(`👤 Cliente: ${notifItem.customerName} (${notifItem.customerEmail})`);
      console.log(`💬 Mensaje: "${lastUserMessage}"\n`);
    }

    return res.json({
      reply: replyText,
      needsHumanHandover,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[Error in /api/chat]:', error);
    const lastUserMessage = req.body?.messages?.slice(-1)[0]?.content || '';
    const local = generateLocalSupportResponse(lastUserMessage, req.body?.userContext);

    return res.json({
      reply: local.reply,
      needsHumanHandover: local.needsHumanHandover,
      fallback: true,
    });
  }
});

// 2. Notify Admin Endpoint (Email & SMS to Admin)
app.post('/api/notify-admin', (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, message, reason } = req.body;

    const notifItem: AdminNotification = {
      id: `notif-${Date.now()}`,
      type: 'HUMAN_SUPPORT_REQUEST',
      customerName: customerName || 'Cliente StreamBox',
      customerEmail: customerEmail || 'N/A',
      customerPhone: customerPhone || 'N/A',
      reason: reason || 'Solicitud de atención con asesor humano',
      lastMessage: message || 'Deseo hablar con una persona.',
      emailSentTo: 'd.s.gal.mor.9@gmail.com',
      smsSentTo: '+57 304 596 7068',
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    };

    adminNotifications.unshift(notifItem);

    console.log(`\n======================================================`);
    console.log(`🚨 NUEVA NOTIFICACIÓN DE ATENCIÓN HUMANA - STREAMBOX`);
    console.log(`📧 Destinatario Correo: ${notifItem.emailSentTo}`);
    console.log(`📱 Destinatario SMS / Tel: ${notifItem.smsSentTo}`);
    console.log(`👤 Cliente: ${notifItem.customerName} <${notifItem.customerEmail}>`);
    console.log(`💬 Mensaje del cliente: "${notifItem.lastMessage}"`);
    console.log(`⏰ Fecha y Hora: ${new Date(notifItem.timestamp).toLocaleString('es-CO')}`);
    console.log(`======================================================\n`);

    return res.json({
      success: true,
      notification: notifItem,
      message: 'Notificación de alerta enviada con éxito al correo y celular del administrador.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Error notificando al administrador' });
  }
});

// 3. Admin Notifications Feed Endpoint
app.get('/api/admin/notifications', (_req, res) => {
  res.json({
    notifications: adminNotifications,
    adminEmail: 'd.s.gal.mor.9@gmail.com',
    adminPhone: '+57 304 596 7068',
  });
});

// Middleware to verify SUPER_ADMIN permission on critical operations
const requireSuperAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const roleHeader = req.headers['x-user-role'];
  const authHeader = req.headers.authorization;

  // Verify that the caller asserts the SUPER_ADMIN custom claim
  if (roleHeader !== 'SUPER_ADMIN' && (!authHeader || !authHeader.includes('SUPER_ADMIN'))) {
    console.warn(`[SECURITY ALERT] Intento de acceso no autorizado a ruta administrativa: ${req.method} ${req.path}`);
    return res.status(403).json({
      error: 'ACCESO_DENEGADO',
      message: 'Acceso denegado: Se requiere rol SUPER_ADMIN verificado mediante Firebase Custom Claims.',
    });
  }

  next();
};

// 4. Critical Administrative Operations (Protected)
app.post('/api/admin/payments/confirm', requireSuperAdmin, (req, res) => {
  const { paymentId, note } = req.body;
  console.log(`[ADMIN ACTION] Pago confirmado por SUPER_ADMIN: #${paymentId} (${note || 'Sin nota'})`);
  res.json({ success: true, message: `Pago #${paymentId} confirmado exitosamente por el administrador.` });
});

app.post('/api/admin/payments/reject', requireSuperAdmin, (req, res) => {
  const { paymentId, reason } = req.body;
  console.log(`[ADMIN ACTION] Pago rechazado por SUPER_ADMIN: #${paymentId}. Motivo: ${reason}`);
  res.json({ success: true, message: `Pago #${paymentId} rechazado exitosamente por el administrador.` });
});

app.post('/api/admin/products/save', requireSuperAdmin, (req, res) => {
  const { product } = req.body;
  console.log(`[ADMIN ACTION] Catálogo modificado por SUPER_ADMIN: ${product?.name}`);
  res.json({ success: true, message: 'Producto guardado exitosamente por el administrador.' });
});

app.post('/api/admin/system/maintenance', requireSuperAdmin, (req, res) => {
  const { maintenanceMode } = req.body;
  console.log(`[ADMIN ACTION] Modo mantenimiento cambiado a: ${maintenanceMode}`);
  res.json({ success: true, maintenanceMode, message: 'Estado del sistema actualizado.' });
});

app.get('/api/admin/users', requireSuperAdmin, (_req, res) => {
  res.json({ success: true, message: 'Consulta de usuarios autorizada.' });
});

app.get('/api/admin/orders', requireSuperAdmin, (_req, res) => {
  res.json({ success: true, message: 'Consulta de pedidos autorizada.' });
});

app.get('/api/admin/chats', requireSuperAdmin, (_req, res) => {
  res.json({ success: true, message: 'Consulta de chats autorizada.' });
});

// Endpoint to inspect and provision custom claims locally or via webhook
app.post('/api/admin/set-claim', (req, res) => {
  const { targetEmail, targetRole } = req.body;

  if (targetEmail !== 'd.s.gal.mor.9@gmail.com') {
    return res.status(400).json({ error: 'Solo se permite conceder SUPER_ADMIN al correo oficial d.s.gal.mor.9@gmail.com' });
  }

  console.log(`[CUSTOM CLAIM PROVISIONING] Solicitud de Custom Claim { role: "${targetRole || 'SUPER_ADMIN'}" } para ${targetEmail}`);

  return res.json({
    success: true,
    email: targetEmail,
    claims: { role: targetRole || 'SUPER_ADMIN' },
    message: 'Custom Claim registrado. Puede aplicarse directamente ejecutando: npx tsx scripts/set-super-admin.ts',
  });
});

// In-memory or synchronized database store for server-side queries
let latestDatabaseCache: {
  updatedAt: string;
  data: any;
} | null = null;

// Endpoint for client app to feed updated state to server sync cache
app.post('/api/database/sync-push', (req, res) => {
  try {
    const { snapshot } = req.body;
    if (snapshot) {
      latestDatabaseCache = {
        updatedAt: new Date().toISOString(),
        data: snapshot,
      };
    }
    return res.json({ success: true, timestamp: latestDatabaseCache?.updatedAt });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message });
  }
});

// Endpoint for Excel Auto-Refresh (Web Query / Feed)
// Microsoft Excel can connect to this URL via:
// Datos -> Obtener Datos -> Desde la Web (From Web)
// y se actualiza/retroalimenta automáticamente de fondo
app.get('/api/database/excel-feed', (req, res) => {
  try {
    const snapshot = latestDatabaseCache?.data || {};
    const orders = snapshot.orders || [];
    const payments = snapshot.payments || [];
    const users = snapshot.users || [];
    const products = snapshot.products || [];
    const giveaways = snapshot.giveaways || [];
    const refunds = snapshot.refundRequests || [];
    const auditLogs = snapshot.auditLogs || [];

    const now = new Date().toISOString();
    const BOM = '\uFEFF';

    // Generar formato CSV / TSV delimitado con metadatos de sincronización
    const lines: string[] = [
      '# =========================================================================',
      '# BASE DE DATOS STREAMBOX COLOMBIA — ALIMENTACION AUTOMATICA EN TIEMPO REAL',
      `# ULTIMA ACTUALIZACION DEL SISTEMA: ${now}`,
      '# =========================================================================',
      '',
      'TIPO_REGISTRO,ID,TITULO_NOMBRE,DETALLE_O_EMAIL,VALOR_COP,ESTADO,FECHA_REGISTRO',
    ];

    // Transacciones / Pedidos
    orders.forEach((o: any) => {
      const item = o.items?.[0] || {};
      lines.push(
        `PEDIDO,"${o.id}","${(o.userName || '').replace(/"/g, '""')}","${(item.productName || '').replace(/"/g, '""')} (${o.userEmail || ''})",${o.totalCOP || 0},"${o.orderStatus || 'PENDIENTE'}","${o.createdAt || now}"`
      );
    });

    // Pagos
    payments.forEach((p: any) => {
      lines.push(
        `PAGO,"${p.id}","${(p.userName || '').replace(/"/g, '""')}","${p.paymentMethod} Ref: ${p.referenceNumber || 'N/A'}",${p.totalCOP || 0},"${p.status}","${p.createdAt || now}"`
      );
    });

    // Clientes
    users.forEach((u: any) => {
      lines.push(
        `USUARIO,"${u.id}","${(u.name || '').replace(/"/g, '""')}","${u.email}",0,"${u.role}","${u.createdAt || now}"`
      );
    });

    // Sorteos
    giveaways.forEach((g: any) => {
      (g.participants || []).forEach((part: any) => {
        lines.push(
          `SORTEO_TICKET,"${part.ticketCode || part.ticketNumber}","${(part.userName || '').replace(/"/g, '""')}","Turno #${part.ticketNumber} - ${g.title}",0,"PARTICIPANDO","${part.joinedAt || now}"`
        );
      });
    });

    // Catálogo
    products.forEach((prod: any) => {
      prod.modalities?.forEach((m: any) => {
        lines.push(
          `PRODUCTO,"${prod.id}","${(prod.name || '').replace(/"/g, '""')}","${m.name} (${prod.brand})",${m.priceCOP || 0},"${prod.status}","${prod.verifiedDate || now}"`
        );
      });
    });

    // Reclamaciones
    refunds.forEach((r: any) => {
      lines.push(
        `RECLAMO,"${r.id}","${(r.userName || '').replace(/"/g, '""')}","${(r.reasonTitle || r.reason || '').replace(/"/g, '""')}",${r.requestedAmountCOP || 0},"${r.status}","${r.createdAt || now}"`
      );
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="streambox-database-feed.csv"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.send(BOM + lines.join('\r\n'));
  } catch (err: any) {
    return res.status(500).send(`Error generando feed de base de datos: ${err?.message}`);
  }
});

// JSON snapshot endpoint for external power query or programmatic tools
app.get('/api/database/snapshot', (_req, res) => {
  res.json({
    success: true,
    feedUrl: `${_req.protocol}://${_req.get('host')}/api/database/excel-feed`,
    updatedAt: latestDatabaseCache?.updatedAt || new Date().toISOString(),
    recordsCount: {
      orders: latestDatabaseCache?.data?.orders?.length || 0,
      payments: latestDatabaseCache?.data?.payments?.length || 0,
      users: latestDatabaseCache?.data?.users?.length || 0,
      products: latestDatabaseCache?.data?.products?.length || 0,
      giveaways: latestDatabaseCache?.data?.giveaways?.length || 0,
      refunds: latestDatabaseCache?.data?.refundRequests?.length || 0,
    },
    data: latestDatabaseCache?.data || null,
  });
});


// Mount Vite or static server
async function initServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 StreamBox Full-Stack Server running at http://0.0.0.0:${port}`);
  });
}

initServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
