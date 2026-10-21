import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Cookie, ShieldCheck, X } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPreferences: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPreferences }) => {
  const { consentSettings, updateConsentSettings } = useStore();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const hasDecided = localStorage.getItem('sb_cookie_banner_closed');
    if (!hasDecided) {
      setDismissed(false);
    }
  }, []);

  const handleAcceptAll = () => {
    updateConsentSettings({
      analyticsCookies: true,
      marketingCommunications: true,
    });
    localStorage.setItem('sb_cookie_banner_closed', 'true');
    setDismissed(true);
  };

  const handleAcceptEssentialOnly = () => {
    updateConsentSettings({
      analyticsCookies: false,
      marketingCommunications: false,
    });
    localStorage.setItem('sb_cookie_banner_closed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#14141F]/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-2xl space-y-3 text-xs animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cookie className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 className="font-bold text-white text-xs">Aviso de Privacidad y Cookies</h4>
        </div>
        <button
          onClick={handleAcceptEssentialOnly}
          className="text-zinc-500 hover:text-white cursor-pointer"
          title="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-zinc-300 leading-relaxed">
        Utilizamos cookies esenciales para la seguridad de tu sesión y compras. Puedes elegir autorizar métricas anónimas y comunicaciones conforme a la <strong>Ley 1581 de 2012</strong>.
      </p>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
        <button
          onClick={onOpenPreferences}
          className="text-[11px] text-purple-400 hover:underline font-semibold cursor-pointer"
        >
          Preferencias
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAcceptEssentialOnly}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300 cursor-pointer"
          >
            Solo Esenciales
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-[11px] font-bold text-white cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
