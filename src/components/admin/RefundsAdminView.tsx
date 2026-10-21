import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { RefundRequest, RefundStatus } from '../../types';
import {
  RefreshCw,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const RefundsAdminView: React.FC = () => {
  const { refundRequests, updateRefundStatus, currentUser } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Decision Modal
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [targetStatus, setTargetStatus] = useState<RefundStatus>('UNDER_REVIEW');
  const [adminNote, setAdminNote] = useState('');
  const [solutionOffer, setSolutionOffer] = useState('');
  const [refundedAmountCOP, setRefundedAmountCOP] = useState<number | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredRefunds = refundRequests.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.reasonTitle.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const pendingCount = refundRequests.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW' || r.status === 'REFUND_PROCESSING'
  ).length;

  const handleOpenDecisionModal = (refund: RefundRequest, nextStatus: RefundStatus) => {
    setSelectedRefund(refund);
    setTargetStatus(nextStatus);
    setAdminNote('');
    setSolutionOffer(refund.resolutionOffer || '');
    setRefundedAmountCOP(refund.requestedAmountCOP);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefund) return;
    setErrorMsg(null);

    // Rule: Rejections must contain a motivated justification
    if (targetStatus === 'REJECTED' && (!adminNote.trim() || adminNote.trim().length < 10)) {
      setErrorMsg('Debe proporcionarse una justificación motivada y detallada de al menos 10 caracteres para rechazar la solicitud.');
      return;
    }

    if (!adminNote.trim()) {
      setErrorMsg('Por favor ingresa una nota explicativa para el registro de auditoría.');
      return;
    }

    const numericAmount = refundedAmountCOP !== '' ? Number(refundedAmountCOP) : undefined;

    updateRefundStatus(
      selectedRefund.id,
      targetStatus,
      adminNote.trim(),
      solutionOffer.trim() || undefined,
      numericAmount
    );

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">
              Gestión de Reclamaciones y Solicitudes de Reembolso
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Control de resoluciones conforme a la Ley 1480 de 2011 (Estatuto del Consumidor). Cada decisión genera una entrada trazable en la bitácora de auditoría y notifica al cliente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-bold font-mono">
            {pendingCount} Pendientes de Trámite
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#14141F] border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por ID (REF-SB-XXXX), orden, cliente o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none"
          >
            <option value="ALL">Todos los Estados ({refundRequests.length})</option>
            <option value="SUBMITTED">SUBMITTED (Recibidas)</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW (En Revisión)</option>
            <option value="NEED_MORE_INFO">NEED_MORE_INFO (Info Requerida)</option>
            <option value="APPROVED">APPROVED (Aprobadas)</option>
            <option value="REFUND_PROCESSING">REFUND_PROCESSING (En Trámite)</option>
            <option value="REFUNDED">REFUNDED (Reintegradas)</option>
            <option value="REJECTED">REJECTED (Rechazadas)</option>
            <option value="CLOSED">CLOSED (Finalizadas)</option>
          </select>
        </div>
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {filteredRefunds.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#14141F] border border-zinc-800 text-zinc-400">
            <p className="text-sm font-bold text-white">No hay reclamaciones con los filtros aplicados</p>
          </div>
        ) : (
          filteredRefunds.map((refund) => {
            const statusConfig: Record<RefundStatus, { label: string; bg: string; text: string; border: string }> = {
              SUBMITTED: { label: 'Recibida', bg: 'bg-zinc-800', text: 'text-zinc-300', border: 'border-zinc-700' },
              UNDER_REVIEW: { label: 'En Revisión Técnica', bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-800' },
              NEED_MORE_INFO: { label: 'Requiere Información', bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-800' },
              APPROVED: { label: 'Reembolso Aprobado', bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-800' },
              REJECTED: { label: 'Rechazada con Justificación', bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-800' },
              REFUND_PROCESSING: { label: 'Devolución en Trámite Bancario', bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-800' },
              REFUNDED: { label: 'Reintegro Confirmado', bg: 'bg-emerald-900', text: 'text-emerald-200', border: 'border-emerald-600' },
              CLOSED: { label: 'Caso Finalizado', bg: 'bg-zinc-900', text: 'text-zinc-500', border: 'border-zinc-800' },
            };

            const cfg = statusConfig[refund.status] || statusConfig.SUBMITTED;

            return (
              <div
                key={refund.id}
                className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{refund.id}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-zinc-400 font-mono text-xs">Orden: {refund.orderId}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-zinc-400 text-xs">
                        Cliente: <strong>{refund.userName}</strong> ({refund.userEmail})
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{refund.reasonTitle}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="font-mono font-bold text-xs text-white">
                      ${refund.requestedAmountCOP.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-300 space-y-2">
                  <p className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <strong className="text-zinc-400 block mb-0.5">Descripción del Incidente:</strong>
                    {refund.reasonDescription}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Medio de Contacto Preferido:</span>
                      <span className="font-semibold text-white">{refund.preferredContact}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Fecha del Incidente:</span>
                      <span className="font-semibold text-white">{refund.incidentDate}</span>
                    </div>
                  </div>

                  {refund.adminNotes && (
                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/50 text-purple-200">
                      <strong className="text-purple-300 block mb-0.5">Última Respuesta Administrativa:</strong>
                      {refund.adminNotes}
                    </div>
                  )}

                  {refund.resolutionOffer && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-emerald-200">
                      <strong className="text-emerald-300 block mb-0.5">Solución Registrada:</strong>
                      {refund.resolutionOffer}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-zinc-500">
                    Radicado: {new Date(refund.createdAt).toLocaleDateString('es-CO')}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {refund.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleOpenDecisionModal(refund, 'UNDER_REVIEW')}
                        className="px-3 py-1.5 rounded-lg bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-800 text-xs font-semibold cursor-pointer"
                      >
                        Poner en Revisión
                      </button>
                    )}

                    {refund.status !== 'NEED_MORE_INFO' && refund.status !== 'REFUNDED' && (
                      <button
                        onClick={() => handleOpenDecisionModal(refund, 'NEED_MORE_INFO')}
                        className="px-3 py-1.5 rounded-lg bg-blue-950 text-blue-300 hover:bg-blue-900 border border-blue-800 text-xs font-semibold cursor-pointer"
                      >
                        Pedir Más Info
                      </button>
                    )}

                    {refund.status !== 'APPROVED' && refund.status !== 'REFUNDED' && (
                      <button
                        onClick={() => handleOpenDecisionModal(refund, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-xs font-semibold cursor-pointer"
                      >
                        Aprobar Reembolso
                      </button>
                    )}

                    {refund.status === 'APPROVED' && (
                      <button
                        onClick={() => handleOpenDecisionModal(refund, 'REFUND_PROCESSING')}
                        className="px-3 py-1.5 rounded-lg bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-800 text-xs font-semibold cursor-pointer"
                      >
                        Tramitar en Banco
                      </button>
                    )}

                    {refund.status === 'REFUND_PROCESSING' && (
                      <button
                        onClick={() => handleOpenDecisionModal(refund, 'REFUNDED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 text-xs font-bold cursor-pointer"
                      >
                        Confirmar Reintegro
                      </button>
                    )}

                    {refund.status !== 'REJECTED' && refund.status !== 'REFUNDED' && (
                      <button
                        onClick={() => handleOpenDecisionModal(refund, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs font-semibold cursor-pointer"
                      >
                        Rechazar con Justificación
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Decision Modal */}
      {showModal && selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#14141F] border border-zinc-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Transición de Estado: <span className="text-purple-400">{targetStatus}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDecision} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Reclamación:</span>
                <span className="font-bold text-white">{selectedRefund.id} ({selectedRefund.reasonTitle})</span>
                <span className="text-zinc-500 block mt-0.5 font-mono">
                  Monto: ${selectedRefund.requestedAmountCOP.toLocaleString('es-CO')} COP
                </span>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  Nota Explicativa / Justificación Legal: *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    targetStatus === 'REJECTED'
                      ? 'Indica el motivo legal o fáctico motivado por el cual no procede la reclamación...'
                      : 'Indica los pasos a seguir o detalles de la validación técnica realizada...'
                  }
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {targetStatus === 'APPROVED' && (
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    Solución Ofrecida (Reintegro o Reemplazo):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Reversión total a cuenta Nequi 315..."
                    value={solutionOffer}
                    onChange={(e) => setSolutionOffer(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white cursor-pointer"
                >
                  Confirmar Transición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
