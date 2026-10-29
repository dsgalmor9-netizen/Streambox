import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Check, X, Sparkles, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface PasswordStrengthMeterProps {
  password: string;
  showTips?: boolean;
}

export type SecurityLevel = 'empty' | 'weak' | 'fair' | 'strong';

export interface PasswordScore {
  level: SecurityLevel;
  score: number; // 0 to 3
  label: string; // Weak, Fair, Strong
  localizedLabel: string;
  colorClass: string;
  barColor: string;
  glowColor: string;
  recommendation: string;
  criteria: {
    minLength: boolean;
    hasNumbers: boolean;
    hasLetters: boolean;
    hasMixedCase: boolean;
    hasSpecial: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordScore {
  if (!password || password.length === 0) {
    return {
      level: 'empty',
      score: 0,
      label: 'None',
      localizedLabel: 'Sin contraseña',
      colorClass: 'text-zinc-500',
      barColor: 'bg-zinc-800',
      glowColor: '',
      recommendation: 'Crea una contraseña segura combinando letras, números y símbolos.',
      criteria: {
        minLength: false,
        hasNumbers: false,
        hasLetters: false,
        hasMixedCase: false,
        hasSpecial: false,
      },
    };
  }

  const minLength = password.length >= 6;
  const goodLength = password.length >= 8;
  const hasNumbers = /\d/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLetters = hasLower || hasUpper;
  const hasMixedCase = hasLower && hasUpper;
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Strength score computation (0-3 scale for Weak, Fair, Strong)
  let rawScore = 0;
  if (minLength) rawScore += 1;
  if (hasNumbers && hasLetters) rawScore += 1;
  if (goodLength && (hasMixedCase || hasSpecial)) rawScore += 1;
  if (goodLength && hasMixedCase && hasSpecial) rawScore += 1;

  // Map to Weak, Fair, Strong
  if (rawScore <= 1 || password.length < 6) {
    return {
      level: 'weak',
      score: 1,
      label: 'Weak',
      localizedLabel: 'Débil (Weak)',
      colorClass: 'text-rose-400',
      barColor: 'bg-rose-500',
      glowColor: 'shadow-[0_0_12px_rgba(244,63,94,0.45)]',
      recommendation: 'Contraseña vulnerable: Usa al menos 6 caracteres combinando letras y números.',
      criteria: { minLength, hasNumbers, hasLetters, hasMixedCase, hasSpecial },
    };
  }

  if (rawScore === 2 || (rawScore === 3 && password.length < 8)) {
    return {
      level: 'fair',
      score: 2,
      label: 'Fair',
      localizedLabel: 'Media (Fair)',
      colorClass: 'text-amber-400',
      barColor: 'bg-amber-500',
      glowColor: 'shadow-[0_0_12px_rgba(245,158,11,0.45)]',
      recommendation: 'Seguridad aceptable: Añade letras mayúsculas o símbolos (!@#$) para hacerla fuerte.',
      criteria: { minLength, hasNumbers, hasLetters, hasMixedCase, hasSpecial },
    };
  }

  return {
    level: 'strong',
    score: 3,
    label: 'Strong',
    localizedLabel: 'Fuerte (Strong)',
    colorClass: 'text-emerald-400',
    barColor: 'bg-emerald-500',
    glowColor: 'shadow-[0_0_14px_rgba(16,185,129,0.5)]',
    recommendation: '¡Excelente nivel de seguridad! Tu cuenta está protegida contra accesos no autorizados.',
    criteria: { minLength, hasNumbers, hasLetters, hasMixedCase, hasSpecial },
  };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showTips = true,
}) => {
  if (!password) return null;

  const evaluation = evaluatePasswordStrength(password);
  const totalBars = 3; // 3 segments for Weak, Fair, Strong

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-2.5 p-3 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-xl shadow-inner space-y-2.5 text-left font-sans"
      role="status"
      aria-live="polite"
    >
      {/* Header: Security Level Indicator */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
          {evaluation.level === 'strong' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : evaluation.level === 'fair' ? (
            <Shield className="w-4 h-4 text-amber-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          )}
          <span>Nivel de seguridad:</span>
        </span>

        {/* Badge with Weak, Fair, Strong */}
        <span
          className={`font-bold tracking-wide flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
            evaluation.level === 'weak'
              ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
              : evaluation.level === 'fair'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
          }`}
        >
          {evaluation.label === 'Strong' && <Sparkles className="w-3 h-3 text-emerald-300" />}
          <span>{evaluation.label}</span>
          <span className="text-zinc-400 font-normal">({evaluation.localizedLabel.split(' ')[0]})</span>
        </span>
      </div>

      {/* 3 Color-Coded Progress Bars (Weak, Fair, Strong) */}
      <div
        className="grid grid-cols-3 gap-1.5 h-2"
        role="progressbar"
        aria-valuenow={evaluation.score}
        aria-valuemin={0}
        aria-valuemax={3}
        aria-label={`Seguridad de contraseña: ${evaluation.label}`}
      >
        {[1, 2, 3].map((barIndex) => {
          const isActive = evaluation.score >= barIndex;

          // Color calculation:
          // bar 1 filled: Weak (Red)
          // bar 1 & 2 filled: Fair (Amber)
          // bar 1, 2 & 3 filled: Strong (Emerald)
          const barStyle = isActive
            ? `${evaluation.barColor} ${evaluation.glowColor}`
            : 'bg-white/10';

          return (
            <div
              key={barIndex}
              className={`h-full rounded-full transition-all duration-300 ${barStyle}`}
            />
          );
        })}
      </div>

      {/* Legend below bars */}
      <div className="flex justify-between text-[10px] text-zinc-500 font-medium px-0.5">
        <span className={evaluation.score >= 1 ? 'text-rose-400 font-semibold' : ''}>1. Weak</span>
        <span className={evaluation.score >= 2 ? 'text-amber-400 font-semibold' : ''}>2. Fair</span>
        <span className={evaluation.score >= 3 ? 'text-emerald-400 font-semibold' : ''}>3. Strong</span>
      </div>

      {/* Actionable security guidance to encourage better practices */}
      {showTips && (
        <div className="pt-1 border-t border-white/5 space-y-1.5">
          <p className="text-[11px] text-zinc-300 leading-snug flex items-start gap-1.5">
            <Info className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${evaluation.colorClass}`} />
            <span>{evaluation.recommendation}</span>
          </p>

          {/* Micro-checklist for security compliance */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
            <div
              className={`flex items-center gap-1 transition-colors ${
                evaluation.criteria.minLength ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              {evaluation.criteria.minLength ? (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-3 h-3 text-zinc-600 shrink-0" />
              )}
              <span>Mínimo 6 caracteres</span>
            </div>

            <div
              className={`flex items-center gap-1 transition-colors ${
                evaluation.criteria.hasNumbers ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              {evaluation.criteria.hasNumbers ? (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-3 h-3 text-zinc-600 shrink-0" />
              )}
              <span>Incluye números (0-9)</span>
            </div>

            <div
              className={`flex items-center gap-1 transition-colors ${
                evaluation.criteria.hasMixedCase ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              {evaluation.criteria.hasMixedCase ? (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-3 h-3 text-zinc-600 shrink-0" />
              )}
              <span>Mayúsculas y minúsculas</span>
            </div>

            <div
              className={`flex items-center gap-1 transition-colors ${
                evaluation.criteria.hasSpecial ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              {evaluation.criteria.hasSpecial ? (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-3 h-3 text-zinc-600 shrink-0" />
              )}
              <span>Símbolos especiales (!@#$)</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
