import React from 'react';
import { Check, X, Shield } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export interface PasswordScore {
  score: number; // 0 to 4
  label: string;
  colorClass: string;
  barColor: string;
  hasMinLength: boolean;
  hasNumbers: boolean;
  hasMixedCase: boolean;
  hasSpecialChar: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordScore {
  const hasMinLength = password.length >= 6;
  const hasNumbers = /\d/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasMixedCase = hasLower && hasUpper;
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length === 0) {
    return {
      score: 0,
      label: 'Sin contraseña',
      colorClass: 'text-zinc-500',
      barColor: 'bg-zinc-800',
      hasMinLength: false,
      hasNumbers: false,
      hasMixedCase: false,
      hasSpecialChar: false,
    };
  }

  if (hasMinLength) score += 1;
  if (hasNumbers) score += 1;
  if (hasMixedCase || password.length >= 8) score += 1;
  if (hasSpecialChar && password.length >= 8) score += 1;

  let label = 'Débil';
  let colorClass = 'text-rose-400';
  let barColor = 'bg-rose-500';

  if (score === 2) {
    label = 'Media';
    colorClass = 'text-amber-400';
    barColor = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Buena';
    colorClass = 'text-cyan-400';
    barColor = 'bg-cyan-500';
  } else if (score >= 4) {
    label = 'Excelente';
    colorClass = 'text-emerald-400';
    barColor = 'bg-emerald-500';
  }

  return {
    score,
    label,
    colorClass,
    barColor,
    hasMinLength,
    hasNumbers,
    hasMixedCase,
    hasSpecialChar,
  };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const evalResult = evaluatePasswordStrength(password);

  return (
    <div className="mt-2 space-y-2 p-2.5 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md">
      {/* Top row: Label and score */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-zinc-500" />
          Seguridad de la clave:
        </span>
        <span className={`font-semibold tracking-wide ${evalResult.colorClass}`}>
          {evalResult.label}
        </span>
      </div>

      {/* Progress Bars (4 segments) */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isFilled = evalResult.score >= step;
          return (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                isFilled ? evalResult.barColor : 'bg-white/10'
              }`}
            />
          );
        })}
      </div>

      {/* Criteria checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
        <div className={`flex items-center gap-1 ${evalResult.hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {evalResult.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Mínimo 6 caracteres</span>
        </div>
        <div className={`flex items-center gap-1 ${evalResult.hasNumbers ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {evalResult.hasNumbers ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Incluye números</span>
        </div>
      </div>
    </div>
  );
};
