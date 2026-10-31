import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  Smartphone,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  ArrowUpDown,
  CreditCard,
  Layers,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, PaymentRequest, PaymentMethod } from '../../types';
import { buildWhatsAppUrl } from '../../lib/whatsapp';

interface PendingPaymentsMonitorProps {
  onNavigateToTab?: (tab: string) => void;
}

export const PendingPaymentsMonitor: React.FC<PendingPaymentsMonitorProps> = ({
  onNavigateToTab,
}) => {
  const {
    orders,
    paymentRequests,
    verifyOrderByAdmin,
    cancelOrderByAdmin,
    createInstantOrder,
    products,
  } = useStore();

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDIENTE' | 'PAGO_REPORTADO'>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'NEQUI' | 'DAVIPLATA'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');

  // UI States
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    id: string;
    text: string;
    type: 'success' | 'cancelled';
  } | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  // Filter all orders with pending payment status
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) => o.paymentStatus === 'PENDIENTE' || o.paymentStatus === 'PAGO_REPORTADO'
    );
  }, [orders]);

  // Aggregate Metrics for HUD Ribbon
  const metrics = useMemo(() => {
    const totalCount = pendingOrders.length;
    const totalAmountCOP = pendingOrders.reduce((sum, o) => sum + o.totalCOP, 0);
    const reportedCount = pendingOrders.filter((o) => o.paymentStatus === 'PAGO_REPORTADO').length;
    const waitingReportCount = pendingOrders.filter((o) => o.paymentStatus === 'PENDIENTE').length;
    const nequiCount = pendingOrders.filter((o) => o.paymentMethod === 'NEQUI').length;
    const daviplataCount = pendingOrders.filter((o) => o.paymentMethod === 'DAVIPLATA').length;

    return {
      totalCount,
      totalAmountCOP,
      reportedCount,
      waitingReportCount,
      nequiCount,
      daviplataCount,
    };
  }, [pendingOrders]);

  // Filtered and Sorted Orders List
  const filteredOrders = useMemo(() => {
    let result = pendingOrders.filter((ord) => {
      // Status filter
      if (statusFilter !== 'ALL' && ord.paymentStatus !== statusFilter) {
        return false;
      }

      // Method filter
      if (methodFilter !== 'ALL' && ord.paymentMethod !== methodFilter) {
        return false;
      }

      // Search Query filter (matches ID, customer name, email, phone, items, reference)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchedPay = paymentRequests.find((p) => p.id === ord.paymentRequestId);
        const refNumber = matchedPay?.referenceNumber?.toLowerCase() || '';
        const orderId = ord.id.toLowerCase();
        const userName = (ord.userName || '').toLowerCase();
        const userEmail = (ord.userEmail || '').toLowerCase();
        const userPhone = (ord.customerPhone || '').toLowerCase();
        const itemsNames = ord.items.map((i) => i.productName.toLowerCase()).join(' ');

        const matches =
          orderId.includes(query) ||
          userName.includes(query) ||
          userEmail.includes(query) ||
          userPhone.includes(query) ||
          itemsNames.includes(query) ||
          refNumber.includes(query);

        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'HIGHEST') {
        return b.totalCOP - a.totalCOP;
      }
      if (sortBy === 'LOWEST') {
        return a.totalCOP - b.totalCOP;
      }
      return 0;
    });

    return result;
  }, [pendingOrders, statusFilter, methodFilter, searchQuery, sortBy, paymentRequests]);

  // 1-Click Action: Marcar como Verificada
  const handleVerifyOneClick = (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const success = verifyOrderByAdmin(
        orderId,
        'Verificado con 1-clic desde Monitor de Pagos Pendientes'
      );
      if (success) {
        setActionFeedback({
          id: orderId,
          text: `¡Orden #${orderId} verificada exitosamente! Se entregaron credenciales y se notificó al cliente.`,
          type: 'success',
        });
        setTimeout(() => setActionFeedback(null), 4500);
      }
    } catch (err) {
      console.error('Error verifying order:', err);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // 1-Click Action: Marcar como Cancelada
  const handleCancelOneClick = (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const success = cancelOrderByAdmin(
        orderId,
        'Cancelado con 1-clic por el administrador desde el Monitor de Pagos'
      );
      if (success) {
        setActionFeedback({
          id: orderId,
          text: `Orden #${orderId} marcada como Cancelada. Se actualizó el estado y se notificó al usuario.`,
          type: 'cancelled',
        });
        setTimeout(() => setActionFeedback(null), 4500);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Helper to copy text to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Helper to create a quick test order if empty
  const handleCreateTestPendingOrder = () => {
    const testProd = products[0] || {
      id: 'prod-netflix',
      name: 'Netflix Perfil 4K UHD',
      brand: 'Netflix',
      modalities: [{ id: 'mod-1', name: 'Perfil Pantalla 1 Mes', duration: '1 Mes', priceCOP: 15000 }],
    };
    const method: PaymentMethod = Math.random() > 0.5 ? 'NEQUI' : 'DAVIPLATA';
    createInstantOrder(testProd as any, testProd.modalities[0].id, method);
    setActionFeedback({
      id: 'test-order',
      text: '¡Orden de prueba generada! Ahora puedes probar la verificación o cancelación con un solo clic.',
      type: 'success',
    });
    setTimeout(() => setActionFeedback(null), 4500);
  };

  // Format relative time helper
  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return new Date(isoString).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-6 rounded-2xl bg-[#14141F] border border-amber-900/40 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Luminous Glow Ambient Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* 1. Header & Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Monitor de Pagos Pendientes
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                {metrics.totalCount} {metrics.totalCount === 1 ? 'ORDEN' : 'ÓRDENES'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Control en tiempo real de órdenes pendientes de pago y validación de transferencias Nequi / Daviplata.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('pagos')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-400" />
              <span>Ver Módulo Pagos ({paymentRequests.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCreateTestPendingOrder}
            className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-800/60 text-amber-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Crear una orden de prueba para ensayar la verificación o cancelación con 1-clic"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simular Orden de Prueba</span>
          </button>
        </div>
      </div>

      {/* 2. Global Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between font-mono shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/90 border border-emerald-700 text-emerald-200'
              : 'bg-rose-950/90 border border-rose-700 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer ml-3"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 3. Real-Time HUD Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Monto Pendiente</span>
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            ${metrics.totalAmountCOP.toLocaleString('es-CO')}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">COP por auditar</div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Con Comprobante</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {metrics.reportedCount}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Esperando verificación</div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Por Reportar</span>
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {metrics.waitingReportCount}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">En proceso de pago</div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Distribución</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-center gap-3 text-sm font-bold font-mono">
            <span className="text-cyan-400">{metrics.nequiCount} Nequi</span>
            <span className="text-rose-400">{metrics.daviplataCount} Daviplata</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Pasarelas activas</div>
        </div>
      </div>

      {/* 4. Filter Toolbar & Search Bar */}
      <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID de orden (ORD-SB-...), cliente, email, celular o referencia..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Todas ({metrics.totalCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PAGO_REPORTADO')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  statusFilter === 'PAGO_REPORTADO'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Reportadas ({metrics.reportedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDIENTE')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  statusFilter === 'PENDIENTE'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Por Reportar ({metrics.waitingReportCount})
              </button>
            </div>

            {/* Gateway Filter Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setMethodFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  methodFilter === 'ALL'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Pasarelas: Todas
              </button>
              <button
                type="button"
                onClick={() => setMethodFilter('NEQUI')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  methodFilter === 'NEQUI'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Nequi ({metrics.nequiCount})
              </button>
              <button
                type="button"
                onClick={() => setMethodFilter('DAVIPLATA')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  methodFilter === 'DAVIPLATA'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Daviplata ({metrics.daviplataCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Ordenar órdenes pendientes"
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-amber-500"
              >
                <option value="NEWEST">Más recientes primero</option>
                <option value="OLDEST">Más antiguas primero</option>
                <option value="HIGHEST">Mayor valor COP</option>
                <option value="LOWEST">Menor valor COP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Tags Indicator */}
        {(statusFilter !== 'ALL' || methodFilter !== 'ALL' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
            <span>Filtros activos:</span>
            {statusFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                Estado: {statusFilter}
              </span>
            )}
            {methodFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                Método: {methodFilter}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                Búsqueda: "{searchQuery}"
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setMethodFilter('ALL');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:underline ml-2 cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* 5. Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-12 px-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">¡No hay pagos pendientes bajo estos filtros!</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                {pendingOrders.length === 0
                  ? 'Todas las órdenes han sido verificadas o atendidas. No hay comprobantes por auditar en este momento.'
                  : 'No se encontraron órdenes que coincidan con la búsqueda o filtros aplicados.'}
              </p>
            </div>
            {pendingOrders.length === 0 && (
              <button
                type="button"
                onClick={handleCreateTestPendingOrder}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Crear Orden de Prueba para Verificar</span>
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const matchedPay = paymentRequests.find((p) => p.id === ord.paymentRequestId);
            const isReported = ord.paymentStatus === 'PAGO_REPORTADO';
            const isProcessing = processingOrderId === ord.id;
            const customerPhone = ord.customerPhone || matchedPay?.phoneOrigin;
            const refNumber = matchedPay?.referenceNumber;
            const voucherNote = matchedPay?.voucherNote;

            const isNequi = ord.paymentMethod === 'NEQUI';
            const gatewayColor = isNequi ? '#00D2C4' : '#ED1C24';
            const gatewayAccount = isNequi ? '3045967068' : '3114139187';

            return (
              <div
                key={ord.id}
                className={`p-4 rounded-xl border transition-all ${
                  isReported
                    ? 'bg-gradient-to-r from-amber-950/30 via-zinc-950 to-zinc-950 border-amber-900/50 hover:border-amber-700/80 shadow-md'
                    : 'bg-zinc-950/90 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Order & Customer Information */}
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Header line: Order ID, Status Badge, Time */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg text-xs font-mono font-bold text-white">
                        <span>{ord.id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ord.id, ord.id)}
                          className="text-zinc-500 hover:text-white p-0.5 cursor-pointer"
                          title="Copiar ID de Orden"
                        >
                          {copiedOrderId === ord.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Status Badge */}
                      {isReported ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          COMPROBANTE REPORTADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          PENDIENTE DE REPORTE
                        </span>
                      )}

                      {/* Gateway Badge */}
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1"
                        style={{
                          backgroundColor: `${gatewayColor}15`,
                          color: gatewayColor,
                          border: `1px solid ${gatewayColor}40`,
                        }}
                      >
                        <Smartphone className="w-3 h-3" />
                        {ord.paymentMethod} ({gatewayAccount})
                      </span>

                      {/* Time ago */}
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {getRelativeTime(ord.createdAt)}
                      </span>
                    </div>

                    {/* Customer & Item Line */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{ord.userName || 'Cliente StreamBox'}</span>
                        <span className="text-zinc-500 font-mono text-[11px]">({ord.userEmail})</span>
                      </div>

                      {customerPhone && (
                        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{customerPhone}</span>
                          <a
                            href={buildWhatsAppUrl(customerPhone, `Hola ${ord.userName || ''}, nos comunicamos de StreamBox Colombia sobre tu orden #${ord.id}.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-0.5"
                            title="Chatear en WhatsApp"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Services/Items Purchased */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-zinc-500 text-[11px]">Servicio:</span>
                      {ord.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300"
                        >
                          <strong className="text-white">{item.productName}</strong>
                          <span className="text-zinc-500 ml-1">({item.modalityName || item.duration})</span>
                          {item.quantity > 1 && <span className="text-cyan-400 ml-1">x{item.quantity}</span>}
                        </span>
                      ))}
                    </div>

                    {/* Payment Reference Details if reported */}
                    {refNumber && (
                      <div className="p-2 rounded-lg bg-black/40 border border-amber-900/30 text-[11px] font-mono flex items-center gap-3 text-amber-200">
                        <span>
                          Referencia Reportada:{' '}
                          <strong className="text-amber-400 font-bold">{refNumber}</strong>
                        </span>
                        {voucherNote && (
                          <span className="text-zinc-400 truncate max-w-xs">
                            Nota: "{voucherNote}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Amount & 1-Click Verification / Cancellation Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800/80">
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 block font-mono">
                        Total por Validar
                      </span>
                      <span className="text-lg sm:text-xl font-mono font-extrabold text-cyan-400">
                        ${ord.totalCOP.toLocaleString('es-CO')} <span className="text-xs text-zinc-400">COP</span>
                      </span>
                    </div>

                    {/* 1-Click Actions Bar */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* One-Click Verify Button */}
                      <button
                        type="button"
                        onClick={() => handleVerifyOneClick(ord.id)}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Verificar pago y entregar servicio con un solo clic"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Marcar Verificada</span>
                      </button>

                      {/* One-Click Cancel Button */}
                      <button
                        type="button"
                        onClick={() => handleCancelOneClick(ord.id)}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white font-bold text-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Cancelar orden y requerimiento de pago con un solo clic"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Marcar Cancelada</span>
                      </button>

                      {/* View Details Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => setSelectedDetailOrder(ord)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Ver detalles completos de la orden"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Order Details Inspection Modal */}
      {selectedDetailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#14141F] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">Detalle de Orden #{selectedDetailOrder.id}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailOrder(null)}
                className="text-zinc-500 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-zinc-300 font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px]">CLIENTE</span>
                  <span className="font-bold text-white">{selectedDetailOrder.userName}</span>
                  <span className="text-[10px] text-zinc-400 block">{selectedDetailOrder.userEmail}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px]">VALOR TOTAL</span>
                  <span className="font-bold text-cyan-400 text-sm">
                    ${selectedDetailOrder.totalCOP.toLocaleString('es-CO')} COP
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Vía {selectedDetailOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
                <span className="text-zinc-500 font-mono text-[10px] uppercase block">Ítems de Suscripción</span>
                {selectedDetailOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-white">
                    <span>
                      {item.productName} · <span className="text-zinc-400">{item.modalityName}</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">
                      ${item.priceCOP.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1 text-zinc-400 font-mono text-[11px]">
                <div>Fecha de Creación: {new Date(selectedDetailOrder.createdAt).toLocaleString('es-CO')}</div>
                <div>Estado de Pago: {selectedDetailOrder.paymentStatus}</div>
                <div>Estado de Orden: {selectedDetailOrder.orderStatus}</div>
                {selectedDetailOrder.customerPhone && (
                  <div>Teléfono Reportado: {selectedDetailOrder.customerPhone}</div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedDetailOrder(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCancelOneClick(selectedDetailOrder.id);
                  setSelectedDetailOrder(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold cursor-pointer"
              >
                Marcar Cancelada (1 Clic)
              </button>
              <button
                type="button"
                onClick={() => {
                  handleVerifyOneClick(selectedDetailOrder.id);
                  setSelectedDetailOrder(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Marcar Verificada (1 Clic)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
