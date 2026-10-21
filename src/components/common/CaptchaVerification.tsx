import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface CaptchaVerificationProps {
  onVerify: (isValid: boolean) => void;
  isVerified: boolean;
}

export const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({
  onVerify,
  isVerified,
}) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isBotDetected, setIsBotDetected] = useState(false);

  const generateChallenge = () => {
    const a = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const b = Math.floor(Math.random() * 8) + 1; // 1 to 8
    setNum1(a);
    setNum2(b);
    setUserAnswer('');
    setHasAttempted(false);
    onVerify(false);
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  const handleInputChange = (val: string) => {
    setUserAnswer(val);
    setHasAttempted(true);

    const parsed = parseInt(val.trim(), 10);
    if (!isNaN(parsed) && parsed === num1 + num2) {
      setIsBotDetected(false);
      onVerify(true);
    } else {
      onVerify(false);
    }
  };

  const handleCheckboxClick = () => {
    if (isVerified) return;
    // When clicking checkbox directly, prompt for numeric solve
    const parsed = parseInt(userAnswer.trim(), 10);
    if (!isNaN(parsed) && parsed === num1 + num2) {
      onVerify(true);
    } else {
      setHasAttempted(true);
    }
  };

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-3 select-none">
      <div className="flex items-center justify-between gap-3">
        {/* Checkbox item */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCheckboxClick}
            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
              isVerified
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-zinc-800 border-zinc-600 hover:border-purple-400'
            }`}
          >
            {isVerified && <CheckCircle2 className="w-4 h-4" />}
          </button>
          <div className="text-left">
            <span className="text-xs font-semibold text-zinc-200 block">
              {isVerified ? 'Verificación exitosa: Eres humano' : 'No soy un robot (CAPTCHA)'}
            </span>
            <span className="text-[10px] text-zinc-500 block">
              Protección anti-bot de StreamBox Colombia
            </span>
          </div>
        </div>

        {/* Brand security badge */}
        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-mono">Security</span>
        </div>
      </div>

      {/* Challenge puzzle if not verified yet */}
      {!isVerified && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-300 font-bold bg-purple-950/80 border border-purple-800/60 px-2 py-1 rounded-md">
              ¿Cuánto es {num1} + {num2}?
            </span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Resultado"
              value={userAnswer}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-20 bg-black/60 border border-zinc-700 rounded-md px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="button"
            onClick={generateChallenge}
            title="Cambiar desafío"
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {hasAttempted && !isVerified && (
        <div className="mt-2 text-[10px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>Resuelve la suma para validar que eres una persona real.</span>
        </div>
      )}
    </div>
  );
};
