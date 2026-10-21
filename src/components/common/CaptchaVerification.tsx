import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react';

interface CaptchaVerificationProps {
  onVerify: (isValid: boolean) => void;
  isVerified: boolean;
}

export const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({
  onVerify,
  isVerified,
}) => {
  const [status, setStatus] = useState<'verifying' | 'verified'>(isVerified ? 'verified' : 'verifying');
  const [dots, setDots] = useState('');
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  // Automatic Cloudflare Turnstile simulation: verifies automatically in 600ms without cancelling while typing
  useEffect(() => {
    if (isVerified) {
      setStatus('verified');
      return;
    }

    const timer = setTimeout(() => {
      setStatus('verified');
      onVerifyRef.current(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [isVerified]);

  // Subtle animated dots for the "Verificando..." text
  useEffect(() => {
    if (status !== 'verifying') return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);
    return () => clearInterval(interval);
  }, [status]);

  const handleManualTrigger = () => {
    if (status === 'verifying') return;
    setStatus('verifying');
    setTimeout(() => {
      setStatus('verified');
      onVerify(true);
    }, 900);
  };

  return (
    <div className="w-full bg-[#111119] border border-zinc-700/80 hover:border-zinc-600 rounded-xl p-3 shadow-md transition-all select-none relative overflow-hidden">
      {/* Top subtle glow bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 transition-all duration-700 ${
          status === 'verified'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 opacity-100'
            : 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 animate-pulse opacity-80'
        }`}
      />

      <div className="flex items-center justify-between gap-3">
        {/* Left: Checkbox / Spinner & Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleManualTrigger}
            title={status === 'verified' ? 'Verificación activa' : 'Verificar'}
            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
              status === 'verified'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-zinc-800/80 border-orange-500/60 text-orange-400'
            }`}
          >
            {status === 'verified' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in zoom-in-50 duration-300" />
            ) : (
              <RotateCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
            )}
          </button>

          <div className="text-left">
            <span className="text-xs font-semibold text-zinc-200 block">
              {status === 'verified'
                ? 'Verificación completada: Eres humano'
                : `Verificando que eres humano${dots}`}
            </span>
            <span className="text-[10px] text-zinc-400 block">
              {status === 'verified'
                ? 'Protegido por Cloudflare Turnstile'
                : 'Comprobación de seguridad automática'}
            </span>
          </div>
        </div>

        {/* Right: Cloudflare Turnstile Branding */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
            {/* Cloudflare logo icon style */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
                fill="#F38020"
              />
              <path
                d="M19 14h-4l2-4h-3l4-5v3h3l-2 6z"
                fill="#FAAE40"
              />
            </svg>
            <div className="leading-tight text-right hidden sm:block">
              <span className="font-bold text-zinc-300 block text-[9px] uppercase tracking-wide">
                Cloudflare
              </span>
              <span className="text-[8px] text-zinc-500 block">Turnstile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
