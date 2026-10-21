import React from 'react';
import { StreamBoxLogo } from '../common/StreamBoxLogo';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, MessageSquare, Phone, Mail, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  return (
    <footer className="w-full bg-[#07070B] border-t border-zinc-800/80 pt-16 pb-24 md:pb-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-800/60">
          
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4 md:col-span-1">
            <StreamBoxLogo size="md" />
            <p className="text-sm text-zinc-400 leading-relaxed">
              Tu portal confiable de suscripciones digitales, entretenimiento y licencias tecnológicas en Colombia. Entregas garantizadas con verificación directa.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Garantía 100% activa durante todo el período</span>
            </div>
          </div>

          {/* Col 2: Categorías Directas */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Categorías
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('catalogo')} className="hover:text-white transition-colors">
                  Películas & Series 4K
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalogo')} className="hover:text-white transition-colors">
                  Música & Podcasts Hi-Fi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalogo')} className="hover:text-white transition-colors">
                  Inteligencia Artificial (GPT / Claude)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalogo')} className="hover:text-white transition-colors">
                  Diseño Gráfico & Video (Canva / CapCut)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalogo')} className="hover:text-white transition-colors">
                  VPN, Privacidad & Gaming
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Métodos de Pago Colombia */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Pagos en Colombia
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-200 font-semibold mb-1">
                  <span className="text-fuchsia-400">Nequi</span>
                  <span className="font-mono text-white text-xs">{settings.nequiNumber}</span>
                </div>
                <p className="text-zinc-500 text-[11px]">Transferencia directa sin comisión</p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-200 font-semibold mb-1">
                  <span className="text-rose-400">Daviplata</span>
                  <span className="font-mono text-white text-xs">{settings.daviplataNumber}</span>
                </div>
                <p className="text-zinc-500 text-[11px]">Acreditación manual verificada</p>
              </div>
            </div>
          </div>

          {/* Col 4: Atención & Soporte */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Atención al Cliente
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                <button onClick={() => onNavigate('chat')} className="hover:text-white transition-colors text-left">
                  Chat en vivo con StreamBot y asesores
                </button>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-mono text-zinc-300">{settings.supportEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-zinc-300">{settings.supportPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Horario de soporte: Lun - Dom (8am a 11pm)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} StreamBox Colombia. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button onClick={() => onNavigate('terminos')} className="hover:text-zinc-400 transition-colors cursor-pointer">
              Términos de Servicio
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('reembolsos')} className="hover:text-zinc-400 transition-colors cursor-pointer">
              Política de Reembolsos y Retracto
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('privacidad')} className="hover:text-zinc-400 transition-colors cursor-pointer">
              Tratamiento de Datos (Ley 1581)
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('cookies')} className="hover:text-zinc-400 transition-colors cursor-pointer">
              Cookies y Consentimiento
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('giveaway')} className="hover:text-zinc-400 transition-colors cursor-pointer">
              Sorteos Oficiales
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
