import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Copy,
  CheckCircle,
  Database,
  ExternalLink,
  ShieldCheck,
  Table,
  Zap,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export const ExcelDatabaseManagerView: React.FC = () => {
  const {
    orders,
    paymentRequests,
    allUsers,
    products,
    giveaways,
    refundRequests,
    auditLogs,
    downloadFullExcelDatabase,
    downloadExcelWebQueryConnector,
    getExcelFeedUrl,
  } = useStore();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);

  const feedUrl = getExcelFeedUrl();

  const totalGiveawayParticipants = giveaways.reduce(
    (acc, g) => acc + (g.participants?.length || 0),
    0
  );

  const totalConfirmedVolumeCOP = paymentRequests
    .filter((p) => p.status === 'PAGO_CONFIRMADO')
    .reduce((acc, p) => acc + p.totalCOP, 0);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    } catch {
      // Fallback
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    }
  };

  const handleDownloadFullCSV = () => {
    downloadFullExcelDatabase();
    setDownloadSuccessToast('Base de datos completa descargada para Excel (.CSV con codificación UTF-8 BOM)');
    setTimeout(() => setDownloadSuccessToast(null), 5000);
  };

  const handleDownloadIQY = () => {
    downloadExcelWebQueryConnector();
    setDownloadSuccessToast('Conector de Consulta Web (.IQY) descargado. Ábrelo en Excel para activar la retroalimentación automática.');
    setTimeout(() => setDownloadSuccessToast(null), 6000);
  };

  const handleForceSyncFeed = async () => {
    setIsRefreshingFeed(true);
    try {
      await fetch('/api/database/sync-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot: {
            orders,
            payments: paymentRequests,
            users: allUsers,
            products,
            giveaways,
            refundRequests,
            auditLogs,
          },
        }),
      });
      setDownloadSuccessToast('¡Retroalimentación sincronizada con el servidor! Los libros de Excel conectados se actualizarán con estos datos.');
      setTimeout(() => setDownloadSuccessToast(null), 5000);
    } catch (e) {
      console.warn('Error syncing:', e);
    } finally {
      setIsRefreshingFeed(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{downloadSuccessToast}</span>
          </div>
          <button
            onClick={() => setDownloadSuccessToast(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-0.5"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-[#14141F] border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/80 text-emerald-300 text-xs font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Base de Datos Maestra y Retroalimentación Automática</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Exportación y Conexión en Vivo para Microsoft Excel
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Descarga la base de datos completa de StreamBox o conéctala directamente en Excel mediante el conector web.
              Cada cambio, venta, reporte de pago o participante de sorteo se retroalimenta automáticamente sin intervención manual.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadFullCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Base para Excel (.CSV)</span>
            </button>

            <button
              onClick={handleDownloadIQY}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
              title="Descarga el conector automático que actualiza Excel periódicamente"
            >
              <Zap className="w-4 h-4" />
              <span>Descargar Conector Auto-Refresh (.IQY)</span>
            </button>

            <button
              onClick={handleForceSyncFeed}
              disabled={isRefreshingFeed}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
              title="Forzar actualización inmediata del canal de datos"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshingFeed ? 'animate-spin' : ''}`} />
              <span>{isRefreshingFeed ? 'Sincronizando...' : 'Forzar Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics of the Active Live Database */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#14141F] border border-zinc-800">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
            <span>Pedidos</span>
            <Table className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{orders.length}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Transacciones</div>
        </div>

        <div className="p-4 rounded-xl bg-[#14141F] border border-zinc-800">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
            <span>Pagos Auditados</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{paymentRequests.length}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">${totalConfirmedVolumeCOP.toLocaleString('es-CO')} COP</div>
        </div>

        <div className="p-4 rounded-xl bg-[#14141F] border border-zinc-800">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
            <span>Clientes</span>
            <Database className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{allUsers.length}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Usuarios registrados</div>
        </div>

        <div className="p-4 rounded-xl bg-[#14141F] border border-zinc-800">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
            <span>Catálogo Activo</span>
            <Table className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{products.length}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Servicios y planes</div>
        </div>

        <div className="p-4 rounded-xl bg-[#14141F] border border-zinc-800">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
            <span>Sorteo / Tickets</span>
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{totalGiveawayParticipants}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Turnos asignados</div>
        </div>

        <div className="p-4 rounded-xl bg-[#14141F] border border-zinc-800">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
            <span>Logs Seguridad</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{auditLogs.length}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Eventos auditables</div>
        </div>
      </div>

      {/* Guide to Auto-Refresh in Microsoft Excel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1: Web Query URL Connection */}
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Método 1: Conexión Web en Excel (Power Query)</h3>
              <p className="text-[11px] text-zinc-400">Retroalimentación continua en segundo plano</p>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Copia el siguiente enlace oficial. En Microsoft Excel ve a la pestaña{' '}
            <strong className="text-emerald-400">Datos &gt; Obtener Datos &gt; Desde otras fuentes &gt; Desde la Web</strong> (o <em>From Web</em>),
            pega la URL y guarda la consulta.
          </p>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-cyan-300 truncate select-all">{feedUrl}</span>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar URL</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Configuración de Frecuencia de Retroalimentación en Excel:</span>
            </div>
            <p>1. En Excel, haz clic derecho sobre la tabla conectada &gt; <em>Propiedades de la conexión</em>.</p>
            <p>2. Marca la casilla <strong className="text-emerald-300">"Actualizar cada [X] minutos"</strong> (ej: 5 minutos) y <strong className="text-emerald-300">"Actualizar al abrir el archivo"</strong>.</p>
            <p>3. Excel consultará este servidor y actualizará todas las filas automáticamente.</p>
          </div>
        </div>

        {/* Method 2: 1-Click IQY File */}
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-300 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Método 2: Archivo Conector Directo (.IQY)</h3>
              <p className="text-[11px] text-zinc-400">Sin copiar URLs, doble clic y listo</p>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Descarga el archivo conector inteligente <code className="text-purple-300">streambox-retroalimentacion-automatica.iqy</code>.
            Al abrirlo con Excel, este creará automáticamente la hoja de cálculo vinculada con los campos estructurados.
          </p>

          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-white text-xs">streambox-retroalimentacion-automatica.iqy</div>
              <div className="text-[11px] text-purple-300">Microsoft Excel Web Query preconfigurado</div>
            </div>
            <button
              onClick={handleDownloadIQY}
              className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Descargar Conector .IQY
            </button>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>¿Qué información contiene la base de datos descargable?</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-zinc-400">
              <li><strong>Tabla de Pedidos:</strong> ID, cliente, valor COP, estado de pago, entrega de credenciales.</li>
              <li><strong>Tabla de Pagos Auditados:</strong> Nequi/Daviplata, referencia bancaria, comprobante, hora.</li>
              <li><strong>Tabla de Clientes:</strong> Nombres, correos, teléfonos y roles.</li>
              <li><strong>Tabla de Sorteos:</strong> Turnos de participación, códigos de ticket oficiales y sellos de tiempo.</li>
              <li><strong>Tabla de Catálogo:</strong> 17 categorías, precios en COP y estado de verificación.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Live Preview Table of the Database */}
      <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-400" />
              Vista Previa de Registros Recientes en Base de Datos
            </h3>
            <p className="text-xs text-zinc-400">Muestra de datos sincronizados que se alimentan al archivo Excel</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-mono">
              Total filas activas: {orders.length + paymentRequests.length + allUsers.length + totalGiveawayParticipants}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-zinc-800 rounded-xl">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Módulo</th>
                <th className="py-2.5 px-3">ID / Código</th>
                <th className="py-2.5 px-3">Usuario / Titular</th>
                <th className="py-2.5 px-3">Detalle / Operación</th>
                <th className="py-2.5 px-3">Valor COP</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {orders.slice(0, 4).map((o) => (
                <tr key={o.id} className="hover:bg-zinc-900/40">
                  <td className="py-2 px-3 text-cyan-400 font-bold">PEDIDO</td>
                  <td className="py-2 px-3 text-white">{o.id}</td>
                  <td className="py-2 px-3">{o.userName}</td>
                  <td className="py-2 px-3 text-zinc-400">{o.items?.[0]?.productName || 'Servicio'}</td>
                  <td className="py-2 px-3 text-emerald-400">${o.totalCOP.toLocaleString('es-CO')}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-zinc-500">{new Date(o.createdAt).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}

              {paymentRequests.slice(0, 4).map((p) => (
                <tr key={p.id} className="hover:bg-zinc-900/40">
                  <td className="py-2 px-3 text-emerald-400 font-bold">PAGO</td>
                  <td className="py-2 px-3 text-white">{p.id}</td>
                  <td className="py-2 px-3">{p.userName}</td>
                  <td className="py-2 px-3 text-zinc-400">{p.paymentMethod} (Ref: {p.referenceNumber || 'N/A'})</td>
                  <td className="py-2 px-3 text-emerald-400">${p.totalCOP.toLocaleString('es-CO')}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-zinc-500">{new Date(p.createdAt).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}

              {giveaways.flatMap((g) => (g.participants || []).slice(0, 3)).map((part, idx) => (
                <tr key={`part-${idx}`} className="hover:bg-zinc-900/40">
                  <td className="py-2 px-3 text-rose-400 font-bold">SORTEO</td>
                  <td className="py-2 px-3 text-white">{part.ticketCode}</td>
                  <td className="py-2 px-3">{part.userName}</td>
                  <td className="py-2 px-3 text-zinc-400">Turno oficial #{part.ticketNumber}</td>
                  <td className="py-2 px-3 text-zinc-500">$0</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                      PARTICIPANDO
                    </span>
                  </td>
                  <td className="py-2 px-3 text-zinc-500">{new Date(part.joinedAt).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
