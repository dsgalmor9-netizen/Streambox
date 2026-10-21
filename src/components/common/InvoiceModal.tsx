import React from 'react';
import { Order, GlobalSettings } from '../../types';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle,
  FileText,
  Calendar,
  CreditCard,
  User,
  Sparkles,
} from 'lucide-react';
import { StreamBoxLogo } from './StreamBoxLogo';

interface InvoiceModalProps {
  order: Order | null;
  settings: GlobalSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const invoiceNumber = `FAC-${order.id.replace('ORD-', '')}`;
  const issueDate = new Date(order.createdAt).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const issueTime = new Date(order.createdAt).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-[#0F0F17] print:bg-white text-zinc-100 print:text-black rounded-2xl border border-zinc-800 print:border-none shadow-2xl overflow-hidden print:shadow-none my-8">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#141422] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Comprobante Oficial de Compra
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 print:p-6 space-y-6" id="printable-invoice">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-800 print:border-zinc-300">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StreamBoxLogo size="sm" />
              </div>
              <p className="text-[11px] text-zinc-400 print:text-zinc-600">
                {settings.legalBusinessName || 'StreamBox Colombia Digital Services'}
              </p>
              <p className="text-[11px] text-zinc-400 print:text-zinc-600">
                NIT: {settings.legalNIT || '901.849.201-4'} · {settings.legalCity || 'Bogotá D.C., Colombia'}
              </p>
              <p className="text-[11px] text-zinc-400 print:text-zinc-600">
                Línea oficial: {settings.supportPhone} · {settings.supportEmail}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-950/80 print:bg-zinc-100 text-purple-300 print:text-black border border-purple-800/60 print:border-zinc-300 mb-1">
                FACTURA SIMPLIFICADA
              </span>
              <h2 className="text-xl font-extrabold font-mono text-white print:text-black">
                {invoiceNumber}
              </h2>
              <p className="text-xs text-zinc-400 print:text-zinc-600 mt-0.5">
                {issueDate} · {issueTime}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                Pedido: #{order.id}
              </p>
            </div>
          </div>

          {/* Client & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/60 print:bg-zinc-50 border border-zinc-800/80 print:border-zinc-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-zinc-600 block mb-1">
                Datos del Adquirente
              </span>
              <p className="font-bold text-white print:text-black text-sm">{order.userName}</p>
              <p className="text-zinc-300 print:text-zinc-700">{order.userEmail}</p>
              {order.customerPhone && (
                <p className="text-zinc-400 print:text-zinc-600">Tel: {order.customerPhone}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-zinc-600 block mb-1">
                Forma de Pago & Estado
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white print:text-black">
                  Transferencia {order.paymentMethod}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  order.paymentStatus === 'PAGO_CONFIRMADO'
                    ? 'bg-emerald-950 text-emerald-300 print:bg-emerald-100 print:text-emerald-800 border border-emerald-800/50'
                    : 'bg-amber-950 text-amber-300 print:bg-amber-100 print:text-amber-800'
                }`}>
                  {order.paymentStatus === 'PAGO_CONFIRMADO' ? 'PAGADO Y VERIFICADO' : order.paymentStatus}
                </span>
              </div>
              <p className="text-zinc-400 print:text-zinc-600 mt-1">
                Entrega: Chat Oficial StreamBox
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 print:border-zinc-300 text-zinc-400 print:text-zinc-600 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Descripción del Servicio</th>
                  <th className="py-2.5 font-semibold text-center">Cant.</th>
                  <th className="py-2.5 font-semibold text-right">Precio Unit.</th>
                  <th className="py-2.5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 print:divide-zinc-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="text-zinc-200 print:text-black">
                    <td className="py-3 pr-2">
                      <p className="font-bold text-white print:text-black">{item.productName}</p>
                      <p className="text-[11px] text-zinc-400 print:text-zinc-600">
                        {item.modalityName} · Duración: {item.duration}
                      </p>
                    </td>
                    <td className="py-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 text-right font-mono text-zinc-300 print:text-zinc-700">
                      ${item.priceCOP.toLocaleString('es-CO')} COP
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white print:text-black">
                      ${(item.priceCOP * item.quantity).toLocaleString('es-CO')} COP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="pt-4 border-t border-zinc-800 print:border-zinc-300 flex flex-col items-end gap-1.5 text-xs">
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-zinc-400 print:text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-200 print:text-black">
                  ${order.subtotalCOP.toLocaleString('es-CO')} COP
                </span>
              </div>

              {order.discountCOP > 0 && (
                <div className="flex justify-between text-purple-400 print:text-purple-700 font-semibold">
                  <span>Descuento {order.appliedCoupon ? `(${order.appliedCoupon})` : ''}:</span>
                  <span className="font-mono">
                    -${order.discountCOP.toLocaleString('es-CO')} COP
                  </span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400 print:text-zinc-600">
                <span>IVA (0% Régimen Simple / Ley 1480):</span>
                <span className="font-mono text-zinc-300 print:text-zinc-700">$0 COP</span>
              </div>

              <div className="pt-2 border-t border-zinc-700 print:border-zinc-400 flex justify-between text-base font-extrabold text-white print:text-black">
                <span>Total Pagado:</span>
                <span className="font-mono text-cyan-400 print:text-black">
                  ${order.totalCOP.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>
          </div>

          {/* Guarantee & Legal Notice */}
          <div className="p-3 rounded-xl bg-zinc-950 print:bg-zinc-100 border border-zinc-800/70 print:border-zinc-200 text-[10px] text-zinc-400 print:text-zinc-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-300 print:text-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-700" />
              <span>Garantía Oficial StreamBox Colombia (Ley 1480 de 2011)</span>
            </div>
            <p>
              Este comprobante certifica la compra legal de acceso a servicios digitales. Se encuentra amparado por el derecho de retracto y política de garantías en caso de fallas de servicio.
            </p>
            <p className="font-mono text-[9px] text-zinc-500">
              Hash de Seguridad: SB-SEC-{Math.abs(order.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) * 8941).toString(16).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Footer actions (Hidden when printing) */}
        <div className="p-4 bg-[#141422] border-t border-zinc-800 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
