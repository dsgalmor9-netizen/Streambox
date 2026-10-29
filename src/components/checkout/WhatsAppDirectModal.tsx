import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { WhatsAppOrderDetails, formatWhatsAppOrderMessage, generateWhatsAppLink } from '../../lib/whatsappCheckout';
import { useToast } from '../common/Toast';

interface WhatsAppDirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: WhatsAppOrderDetails | null;
}

export const WhatsAppDirectModal: React.FC<WhatsAppDirectModalProps> = ({
  isOpen,
  onClose,
  orderDetails,
}) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !orderDetails) return null;

  const formattedMessage = formatWhatsAppOrderMessage(orderDetails);
  const waUrl = generateWhatsAppLink(orderDetails);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    success('Mensaje estructurado copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop with dark cinema blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl rounded-2xl bg-[#0d0d14] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.06)] overflow-hidden z-10 my-8"
        >
          {/* Subtle Ambient Halo */}
          <div className="absolute top-0 right-0 w-80 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-1" />

          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Checkout Directo por WhatsApp
                </h3>
                <p className="text-xs text-neutral-400">
                  Despacho prioritario · Asesor en línea 24/7 en Colombia
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Summary card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-white/5">
                <span>Total a Pagar</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {orderDetails.totalText}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-300">
                {orderDetails.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="truncate pr-2">
                      {it.quantity}x {it.productName} ({it.modalityName})
                    </span>
                    <span className="font-mono text-white shrink-0 font-medium">{it.priceText}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Message Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Mensaje Formateado para WhatsApp:
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer active:scale-95 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar texto</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/6 font-mono text-[11px] text-neutral-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed select-all">
                {formattedMessage}
              </div>
            </div>

            {/* Payment Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="block text-[11px] font-bold text-white">Nequi</span>
                <span className="text-[10px] text-neutral-500 font-mono">304 596 7068</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="block text-[11px] font-bold text-white">Daviplata</span>
                <span className="text-[10px] text-neutral-500 font-mono">311 413 9187</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="block text-[11px] font-bold text-white">Bancolombia</span>
                <span className="text-[10px] text-neutral-500">Transferencia</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="block text-[11px] font-bold text-white">Binance / Tarjeta</span>
                <span className="text-[10px] text-neutral-500">USDT / PSE</span>
              </div>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="p-5 sm:p-6 border-t border-white/8 bg-black/40 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-sm text-black bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Enviar Pedido a WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 transition-colors cursor-pointer active:scale-95"
            >
              Seguir en la tienda
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
