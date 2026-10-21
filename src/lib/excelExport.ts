// Database Schema & Excel Feed Generator for StreamBox Colombia
// Generates fully structured, multi-sheet compatible Excel/CSV data with auto-refresh web feed capability

export interface DatabaseFeedMetadata {
  generatedAt: string;
  totalRecords: number;
  environment: string;
  superAdmin: string;
  syncIntervalSeconds: number;
}

export interface LiveDatabaseSnapshot {
  metadata: DatabaseFeedMetadata;
  orders: any[];
  payments: any[];
  users: any[];
  catalog: any[];
  giveawayParticipants: any[];
  refunds: any[];
  auditLogs: any[];
}

/**
 * Escapes fields for CSV / TSV / Excel format
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an Excel-ready CSV (with UTF-8 BOM so Excel opens with proper accents and currency symbols)
 */
export function generateExcelDatabaseCSV(data: {
  orders: any[];
  payments: any[];
  users: any[];
  products: any[];
  giveaways: any[];
  refundRequests: any[];
  auditLogs: any[];
}): string {
  const now = new Date().toISOString();
  const BOM = '\uFEFF'; // UTF-8 BOM for Microsoft Excel

  const sections: string[] = [];

  // ==========================================
  // SHEET 1: RESUMEN EJECUTIVO Y METADATOS
  // ==========================================
  sections.push([
    '# =========================================================================',
    '# BASE DE DATOS MAESTRA STREAMBOX COLOMBIA — RETROALIMENTACIÓN AUTOMÁTICA',
    '# =========================================================================',
    `Fecha de Emisión / Sync,${now}`,
    `Super Administrador Autorizado,d.s.gal.mor.9@gmail.com`,
    `Total Pedidos Registrados,${data.orders.length}`,
    `Total Pagos Auditados,${data.payments.length}`,
    `Total Clientes en Base de Datos,${data.users.length}`,
    `Total Servicios en Catálogo,${data.products.length}`,
    `Participantes en Sorteos Oficiales,${data.giveaways.reduce((acc, g) => acc + (g.participants?.length || 0), 0)}`,
    `Reclamaciones / Reembolsos (Ley 1480),${data.refundRequests.length}`,
    `Registros de Auditoría de Seguridad,${data.auditLogs.length}`,
    `URL Endpoint de Auto-Retroalimentación Web (Excel Web Query),https://${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/database/excel-feed`,
    ''
  ].join('\n'));

  // ==========================================
  // SHEET 2: PEDIDOS Y TRANSACCIONES
  // ==========================================
  const orderHeaders = [
    'ID_PEDIDO',
    'CLIENTE_NOMBRE',
    'CLIENTE_EMAIL',
    'PRODUCTO',
    'MARCA',
    'MODALIDAD',
    'DURACION',
    'TOTAL_COP',
    'METODO_PAGO',
    'ESTADO_PAGO',
    'ESTADO_PEDIDO',
    'FECHA_CREACION',
    'FECHA_VENCIMIENTO',
    'CREDENCIALES_ENTREGADAS'
  ];
  const orderRows = [orderHeaders.map(escapeCsv).join(',')];

  data.orders.forEach((o) => {
    const item = o.items?.[0] || {};
    orderRows.push([
      escapeCsv(o.id),
      escapeCsv(o.userName || 'N/A'),
      escapeCsv(o.userEmail || 'N/A'),
      escapeCsv(item.productName || 'Servicio Digital'),
      escapeCsv(item.brand || 'StreamBox'),
      escapeCsv(item.modalityName || 'Plan'),
      escapeCsv(item.duration || '1 Mes'),
      escapeCsv(o.totalCOP || 0),
      escapeCsv(o.paymentMethod || 'NEQUI'),
      escapeCsv(o.paymentStatus || 'PENDIENTE'),
      escapeCsv(o.orderStatus || 'PENDIENTE'),
      escapeCsv(o.createdAt || now),
      escapeCsv(o.expiresAt || 'N/A'),
      escapeCsv(o.deliveredCredentials || 'Pendiente de entrega')
    ].join(','));
  });

  sections.push('# --- TABLA: PEDIDOS Y FACTURACION ---\n' + orderRows.join('\n') + '\n');

  // ==========================================
  // SHEET 3: PAGOS AUDITADOS (NEQUI & DAVIPLATA)
  // ==========================================
  const paymentHeaders = [
    'ID_PAGO',
    'ID_PEDIDO',
    'USUARIO',
    'EMAIL',
    'MONTO_COP',
    'PASARELA',
    'NUM_REFERENCIA',
    'CELULAR_ORIGEN',
    'ESTADO',
    'COMPROBANTE_URL',
    'FECHA_REPORTE',
    'FECHA_CONFIRMACION',
    'AUDITADO_POR'
  ];
  const paymentRows = [paymentHeaders.map(escapeCsv).join(',')];

  data.payments.forEach((p) => {
    paymentRows.push([
      escapeCsv(p.id),
      escapeCsv(p.orderId),
      escapeCsv(p.userName),
      escapeCsv(p.userEmail),
      escapeCsv(p.totalCOP),
      escapeCsv(p.paymentMethod),
      escapeCsv(p.referenceNumber || 'N/A'),
      escapeCsv(p.phoneOrigin || 'N/A'),
      escapeCsv(p.status),
      escapeCsv(p.voucherUrl || 'Cargado en plataforma'),
      escapeCsv(p.createdAt),
      escapeCsv(p.confirmedAt || 'N/A'),
      escapeCsv(p.confirmedBy || 'N/A')
    ].join(','));
  });

  sections.push('# --- TABLA: REPORTE DE PAGOS Y CAJA ---\n' + paymentRows.join('\n') + '\n');

  // ==========================================
  // SHEET 4: USUARIOS Y CLIENTES REGISTRADOS
  // ==========================================
  const userHeaders = [
    'ID_USUARIO',
    'NOMBRE_COMPLETO',
    'CORREO_ELECTRONICO',
    'TELEFONO',
    'ROL_SISTEMA',
    'FECHA_REGISTRO',
    'ESTADO_ACTIVO'
  ];
  const userRows = [userHeaders.map(escapeCsv).join(',')];

  data.users.forEach((u) => {
    userRows.push([
      escapeCsv(u.id),
      escapeCsv(u.name),
      escapeCsv(u.email),
      escapeCsv(u.phone || 'N/A'),
      escapeCsv(u.role),
      escapeCsv(u.createdAt || now),
      escapeCsv(u.active ? 'ACTIVO' : 'INACTIVO')
    ].join(','));
  });

  sections.push('# --- TABLA: BASE DE DATOS DE CLIENTES ---\n' + userRows.join('\n') + '\n');

  // ==========================================
  // SHEET 5: PARTICIPANTES DE SORTEO (TICKETS Y TURNOS)
  // ==========================================
  const giveawayHeaders = [
    'SORTEO_ID',
    'SORTEO_TITULO',
    'TURNO_NUMERO',
    'CODIGO_TICKET',
    'USUARIO_ID',
    'USUARIO_NOMBRE',
    'USUARIO_EMAIL',
    'FECHA_PARTICIPACION'
  ];
  const giveawayRows = [giveawayHeaders.map(escapeCsv).join(',')];

  data.giveaways.forEach((g) => {
    (g.participants || []).forEach((part: any) => {
      giveawayRows.push([
        escapeCsv(g.id),
        escapeCsv(g.title),
        escapeCsv(part.ticketNumber),
        escapeCsv(part.ticketCode),
        escapeCsv(part.userId),
        escapeCsv(part.userName),
        escapeCsv(part.userEmail),
        escapeCsv(part.joinedAt)
      ].join(','));
    });
  });

  sections.push('# --- TABLA: PARTICIPANTES Y TICKETS DE SORTEO ---\n' + giveawayRows.join('\n') + '\n');

  // ==========================================
  // SHEET 6: CATALOGO COMERCIAL Y TARIFAS
  // ==========================================
  const catalogHeaders = [
    'ID_PRODUCTO',
    'NOMBRE_PRODUCTO',
    'MARCA',
    'CATEGORIA',
    'SUBCATEGORIA',
    'MODALIDAD_ID',
    'MODALIDAD_NOMBRE',
    'DURACION',
    'PRECIO_COP',
    'ESTADO_PRECIO',
    'ESTADO_PRODUCTO',
    'FUENTE_VERIFICACION'
  ];
  const catalogRows = [catalogHeaders.map(escapeCsv).join(',')];

  data.products.forEach((p) => {
    p.modalities?.forEach((m: any) => {
      catalogRows.push([
        escapeCsv(p.id),
        escapeCsv(p.name),
        escapeCsv(p.brand),
        escapeCsv(p.category),
        escapeCsv(p.subcategory),
        escapeCsv(m.id),
        escapeCsv(m.name),
        escapeCsv(m.duration),
        escapeCsv(m.priceCOP !== null ? m.priceCOP : 'PENDIENTE'),
        escapeCsv(m.priceStatus),
        escapeCsv(p.status),
        escapeCsv(p.verificationSource || 'StreamBox Colombia')
      ].join(','));
    });
  });

  sections.push('# --- TABLA: CATALOGO Y PRECIOS ---\n' + catalogRows.join('\n') + '\n');

  // ==========================================
  // SHEET 7: RECLAMACIONES Y REEMBOLSOS (LEY 1480)
  // ==========================================
  const refundHeaders = [
    'RADICADO_ID',
    'PEDIDO_ID',
    'CLIENTE_NOMBRE',
    'CLIENTE_EMAIL',
    'MOTIVO',
    'TITULO',
    'DESCRIPCION',
    'MONTO_RECLAMADO_COP',
    'ESTADO',
    'CONTACTO_PREFERIDO',
    'FECHA_RADICACION'
  ];
  const refundRows = [refundHeaders.map(escapeCsv).join(',')];

  data.refundRequests.forEach((r) => {
    refundRows.push([
      escapeCsv(r.id),
      escapeCsv(r.orderId),
      escapeCsv(r.userName),
      escapeCsv(r.userEmail),
      escapeCsv(r.reason),
      escapeCsv(r.reasonTitle),
      escapeCsv(r.reasonDescription),
      escapeCsv(r.requestedAmountCOP),
      escapeCsv(r.status),
      escapeCsv(r.preferredContact),
      escapeCsv(r.createdAt)
    ].join(','));
  });

  sections.push('# --- TABLA: RECLAMACIONES Y GARANTIAS ---\n' + refundRows.join('\n') + '\n');

  // ==========================================
  // SHEET 8: AUDITORIA DE SEGURIDAD
  // ==========================================
  const auditHeaders = [
    'ID_LOG',
    'ACCION',
    'MODULO_OBJETIVO',
    'DETALLES',
    'ACTOR_EMAIL',
    'ROL',
    'EXITO',
    'TIMESTAMP'
  ];
  const auditRows = [auditHeaders.map(escapeCsv).join(',')];

  data.auditLogs.slice(0, 150).forEach((l) => {
    auditRows.push([
      escapeCsv(l.id),
      escapeCsv(l.action),
      escapeCsv(l.target),
      escapeCsv(l.details),
      escapeCsv(l.actorEmail),
      escapeCsv(l.actorRole),
      escapeCsv(l.success ? 'SI' : 'NO'),
      escapeCsv(l.timestamp)
    ].join(','));
  });

  sections.push('# --- TABLA: AUDITORIA DE SISTEMA Y SEGURIDAD ---\n' + auditRows.join('\n'));

  return BOM + sections.join('\n');
}

/**
 * Generates an Excel IQY (Internet Query) File
 * When the user double-clicks this .iqy file, Microsoft Excel automatically links
 * to the web endpoint and retroalimenta / refreshes data on a recurring background schedule or on click!
 */
export function generateExcelWebQueryIQY(feedUrl: string): string {
  return [
    'WEB',
    '1',
    feedUrl,
    '',
    'Selection=EntirePage',
    'Formatting=All',
    'PreFormattedTextToColumns=True',
    'ConsecutiveDelimitersAsOne=True',
    'SingleBlockTextImport=False',
    'DisableDateRecognition=False',
    'DisableRedirections=False'
  ].join('\r\n');
}

/**
 * Downloads a text/csv/iqy payload as a file in the browser
 */
export function triggerBrowserDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
