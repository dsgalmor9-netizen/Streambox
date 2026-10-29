import React, { useState } from 'react';
import { PaymentRequest, Order } from '../../types';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Copy,
  Check,
  Search,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Download,
  Filter,
} from 'lucide-react';
import { buildWhatsAppUrl, getCustomerSupportWhatsApp } from '../../lib/whatsapp';
import { useStore } from '../../context/StoreContext';

interface PaymentHistoryWidgetProps {
  payments: PaymentRequest[];
  orders: Order[];
  onSelectOrderForInvoice: (order: Order) => void;
  onNavigateToChat?: () => void;
}

export const PaymentHistoryWidget: React.FC<PaymentHistoryWidgetProps> = ({
  payments,
  orders,
  onSelectOrderForInvoice,
  onNavigateToChat,
}) => {
  const { settings } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(id);
    setTimeout(() => setCopiedRef(null), 1500);
  };

  const filteredPayments = payments.filter((pay) => {
    // Status filter
    if (filterStatus === 'VERIFIED' && pay.status !== 'PAGO_CONFIRMADO') return false;
    if (filterStatus === 'PENDING' && pay.status !== 'PAGO_REPORTADO' && pay.status !== 'PENDIENTE') return false;
    if (filterStatus === 'REJECTED' && pay.status !== 'PAGO_RECHAZADO') return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchRef = pay.referenceNumber?.toLowerCase().includes(term);
      const matchId = pay.id.toLowerCase().includes(term);
      const matchOrderId = pay.orderId.toLowerCase().includes(term);
      const matchMethod = pay.paymentMethod.toLowerCase().includes(term);
      if (!matchRef && !matchId && !matchOrderId && !matchMethod) return false;
    }

    return true;
  });

  // Calculate statistics
  const verifiedCount = payments.filter((p) => p.status === 'PAGO_CONFIRMADO').length;
  const pendingCount = payments.filter((p) => p.status === 'PAGO_REPORTADO' || p.status === 'PENDIENTE').length;
  const totalPaidCOP = payments
    .filter((p) => p.status === 'PAGO_CONFIRMADO')
    .reduce((acc, p) => acc + p.totalCOP, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="cinema-glass-card rounded-2xl p-4 sm:p-5 border border-white/8 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Pagos Verificados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {verifiedCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Transacciones auditadas</p>
        </div>

        <div className="cinema-glass-card rounded-2xl p-4 sm:p-5 border border-white/8 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>En Revisión / Pendientes</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300">
            {pendingCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Tiempo medio de validación: 5-15 min</p>
        </div>

        <div className="cinema-glass-card rounded-2xl p-4 sm:p-5 border border-white/8 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Total Pagado Acumulado</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ${totalPaidCOP.toLocaleString('es-CO')} <span className="text-xs text-neutral-400 font-sans font-normal">COP</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Garantía 100% activa</p>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0d0d14]/80 border border-white/8">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: `Todos (${payments.length})` },
            { id: 'VERIFIED', label: `Verificados (${verifiedCount})` },
            { id: 'PENDING', label: `En Revisión (${pendingCount})` },
            { id: 'REJECTED', label: 'Rechazados' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                filterStatus === tab.id
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Ref o Pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/60 border border-white/8 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono transition-colors"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3.5">
        {filteredPayments.length === 0 ? (
          <div className="cinema-glass-card p-12 text-center rounded-3xl border border-white/8">
            <CreditCard className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">
              No se encontraron pagos con los filtros seleccionados
            </h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Tus comprobantes reportados de Nequi, Daviplata o Bancolombia aparecerán aquí con su estado y recibo PDF.
            </p>
          </div>
        ) : (
          filteredPayments.map((pay) => {
            const correspondingOrder = orders.find((o) => o.id === pay.orderId);
            const isVerified = pay.status === 'PAGO_CONFIRMADO';
            const isPending = pay.status === 'PAGO_REPORTADO' || pay.status === 'PENDIENTE';
            const isRejected = pay.status === 'PAGO_RECHAZADO';

            // Method visual color
            const isNequi = pay.paymentMethod === 'NEQUI';
            const isDaviplata = pay.paymentMethod === 'DAVIPLATA';

            return (
              <div
                key={pay.id}
                className="cinema-glass-card rounded-2xl p-5 border border-white/8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-amber-500/25"
              >
                {/* Left: Transaction Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Method Tag */}
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                        isNequi
                          ? 'bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-800/60'
                          : isDaviplata
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {pay.paymentMethod}
                    </span>

                    <span className="font-mono text-xs font-bold text-white">
                      Ref: {pay.referenceNumber || 'Pendiente de asignación'}
                    </span>

                    {pay.referenceNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(pay.referenceNumber!, pay.id)}
                        className="text-neutral-500 hover:text-white p-1 rounded transition-colors cursor-pointer"
                        title="Copiar referencia"
                      >
                        {copiedRef === pay.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <span className="text-neutral-500 text-xs">·</span>

                    <span className="text-neutral-400 text-xs font-mono">
                      Pedido #{pay.orderId}
                    </span>
                  </div>

                  {/* Products purchased in this order if available */}
                  {correspondingOrder && correspondingOrder.items.length > 0 && (
                    <div className="text-xs text-neutral-300 flex items-center gap-2">
                      <span className="text-neutral-500">Servicio:</span>
                      <span className="font-semibold text-white">
                        {correspondingOrder.items.map((i) => `${i.productName} (${i.modalityName})`).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Metadata and Notes */}
                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 flex-wrap">
                    <span>
                      Registrado:{' '}
                      {new Date(pay.createdAt).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {pay.phoneOrigin && (
                      <>
                        <span>·</span>
                        <span>Móvil: <strong className="font-mono text-neutral-300">{pay.phoneOrigin}</strong></span>
                      </>
                    )}

                    {pay.voucherNote && (
                      <>
                        <span>·</span>
                        <span className="text-neutral-400 italic">"{pay.voucherNote}"</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Status badge & Actions */}
                <div className="flex items-end md:items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/6">
                  {/* Amount & Status Badge */}
                  <div className="text-left md:text-right">
                    <div className="text-base sm:text-lg font-extrabold font-mono text-white">
                      ${pay.totalCOP.toLocaleString('es-CO')} COP
                    </div>

                    <div className="mt-1">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PAGO VERIFICADO</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>EN VERIFICACIÓN</span>
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>PAGO RECHAZADO</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-zinc-800 text-zinc-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span>PENDIENTE</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {correspondingOrder && (
                      <button
                        type="button"
                        onClick={() => onSelectOrderForInvoice(correspondingOrder)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 text-neutral-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Descargar o imprimir comprobante PDF oficial"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Recibo PDF</span>
                        <span className="sm:hidden">PDF</span>
                      </button>
                    )}

                    <a
                      href={buildWhatsAppUrl(
                        settings.supportPhone || '3045967068',
                        getCustomerSupportWhatsApp(pay.orderId, 'Comprobante de Pago')
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] transition-colors cursor-pointer active:scale-95"
                      title="Consultar asesor oficial por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
