import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Zap, Lock, RefreshCw, Smartphone } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const STREAMBOX_FAQS: FaqItem[] = [
  {
    id: 'perfiles',
    question: '¿Se pierden mis perfiles o historial de reproducción al renovar?',
    answer:
      'No. Al renovar con StreamBox antes o durante la fecha de vencimiento, mantenemos tu mismo perfil, lista de favoritos e historial intactos sin que tengas que volver a configurar nada. Recomendamos renovar con 24-48 horas de anticipación.',
    icon: RefreshCw,
  },
  {
    id: 'garantia',
    question: '¿Cómo reclamo la garantía en caso de caída o actualización de proveedor?',
    answer:
      'Cuentas con 100% de garantía durante todo el periodo contratado. Puedes abrir un ticket de soporte directamente en tu panel de cliente o escribirnos por WhatsApp. Nuestro equipo de soporte humano valida el inconveniente y restablece tus credenciales en un lapso de 5 a 15 minutos.',
    icon: ShieldCheck,
  },
  {
    id: 'contrasena',
    question: '¿Puedo cambiar la contraseña o correo del perfil asignado?',
    answer:
      'Para garantizar la estabilidad del servicio y la vigencia de la garantía, está prohibido modificar la contraseña general o correo de las cuentas compartidas o perfiles. Si adquiriste una cuenta completa familiar o privada a tu nombre, sí podrás gestionar tus propias credenciales.',
    icon: Lock,
  },
  {
    id: 'entrega',
    question: '¿Cómo funciona la entrega inmediata en 5 a 15 minutos?',
    answer:
      'Tras realizar tu transferencia por Nequi o Daviplata y reportar el comprobante, nuestro sistema de verificación audita la referencia bancaria y despacha automáticamente tus datos de acceso en la pestaña "Mi Chat" y por WhatsApp.',
    icon: Zap,
  },
  {
    id: 'pagos',
    question: '¿Qué métodos de pago aceptan en Colombia e internacionalmente?',
    answer:
      'En Colombia aceptamos Nequi, Daviplata, transferencias Bancolombia y pagos QR. Para compras internacionales aceptamos Binance Pay (USDT) y pasarelas en USD/MXN con conversión de divisas en tiempo real.',
    icon: Smartphone,
  },
];

export const TactileFaqAccordion: React.FC = () => {
  const [openIds, setOpenIds] = useState<string[]>(['perfiles', 'garantia']);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      {STREAMBOX_FAQS.map((faq) => {
        const isOpen = openIds.includes(faq.id);
        const Icon = faq.icon || HelpCircle;

        return (
          <div
            key={faq.id}
            className={`rounded-2xl transition-all border duration-200 overflow-hidden ${
              isOpen
                ? 'bg-[#0d0d14] border-amber-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(245,158,11,0.06)]'
                : 'bg-black/40 border-white/6 hover:border-white/12'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleItem(faq.id)}
              aria-expanded={isOpen}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isOpen
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-white/5 text-neutral-400 group-hover:text-white border border-white/8'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {faq.question}
                </h4>
              </div>

              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 group-hover:text-white transition-transform shrink-0"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {/* Collapsible Content with CSS grid smooth expansion */}
            <div
              className="grid transition-all"
              style={{
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 220ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-white/4">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
