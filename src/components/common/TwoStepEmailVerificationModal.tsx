import React, { useState, useRef, useEffect } from 'react';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCw,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { validateStrictEmail, validateOTPCode } from '../../lib/validationRules';

interface TwoStepEmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onVerified?: (email: string) => void;
}

export const TwoStepEmailVerificationModal: React.FC<TwoStepEmailVerificationModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onVerified,
}) => {
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'SUCCESS'>('EMAIL');
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<string | null>(null);

  // 6 digits OTP array
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [shakeField, setShakeField] = useState<'email' | 'otp' | null>(null);

  // 60-second cooldown timer
  const [cooldown, setCooldown] = useState(0);

  // Simulated expected OTP (in dev/demo mode, code 482910 is provided as demo hint)
  const [generatedCode, setGeneratedCode] = useState('482910');

  // Input refs for 6 digits
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  if (!isOpen) return null;

  const triggerShake = (field: 'email' | 'otp') => {
    setShakeField(field);
    setTimeout(() => setShakeField(null), 350);
  };

  const handleSendCode = () => {
    setEmailError(null);
    const result = validateStrictEmail(email);
    if (!result.isValid) {
      setEmailError(result.errorMessage || 'Correo inválido');
      triggerShake('email');
      return;
    }

    setIsSendingCode(true);
    setTimeout(() => {
      // Generate a 6-digit random code (or use 482910 for reliable demo testing)
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(randomCode);
      setCooldown(60);
      setIsSendingCode(false);
      setStep('OTP');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(null);

      // Auto-focus first digit
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 150);
    }, 600);
  };

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numbers
    const cleanChar = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto-focus next input
    if (cleanChar && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move back and clear previous
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        digitInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData.length > 0) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pasteData.length; i++) {
        newDigits[i] = pasteData[i];
      }
      setOtpDigits(newDigits);
      setOtpError(null);

      // Focus last filled index or next empty
      const targetIndex = Math.min(pasteData.length, 5);
      digitInputRefs.current[targetIndex]?.focus();
    }
  };

  const fullEnteredOtp = otpDigits.join('');
  const isOtpComplete = fullEnteredOtp.length === 6;

  const handleVerifyOtp = () => {
    setOtpError(null);
    const validResult = validateOTPCode(fullEnteredOtp);
    if (!validResult.isValid) {
      setOtpError(validResult.errorMessage || 'Código incompleto');
      triggerShake('otp');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      // Verify match (accept generatedCode or master demo key 482910)
      if (fullEnteredOtp === generatedCode || fullEnteredOtp === '482910') {
        setStep('SUCCESS');
        if (onVerified) {
          onVerified(email.trim().toLowerCase());
        }
      } else {
        setOtpError('Código incorrecto o expirado. Por favor verifica los 6 dígitos.');
        triggerShake('otp');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="w-full max-w-md bg-[#0d0d14] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.1)] relative overflow-hidden">
        {/* Amber cinematic accent halo */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-[70px] pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer active:scale-95"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Verificación Segura en 2 Pasos
            </h3>
            <p className="text-xs text-neutral-400">StreamBox Colombia · Código OTP Oficial</p>
          </div>
        </div>

        {/* STEP 1: Email input & RFC validation */}
        {step === 'EMAIL' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              Ingresa tu correo para recibir un código de seguridad numérico de 6 dígitos. Protegemos tu cuenta contra compras no autorizadas.
            </p>

            <div className={shakeField === 'email' ? 'animate-shake' : ''}>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Correo Electrónico Oficial
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="ejemplo@gmail.com"
                  className={`w-full bg-black/60 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                    emailError
                      ? 'border-rose-500/80 bg-rose-500/5'
                      : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {emailError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={isSendingCode || !email.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isSendingCode ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-black" />
                  <span>Generando código OTP...</span>
                </>
              ) : (
                <>
                  <span>Enviar Código de Verificación</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: 6 Individual Digits OTP input */}
        {step === 'OTP' && (
          <div className="space-y-4">
            <div className="text-xs text-neutral-300 space-y-1">
              <p>
                Hemos enviado un código de 6 dígitos a <span className="font-semibold text-white">{email}</span>.
              </p>
              <div className="p-2.5 rounded-xl bg-black/50 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
                <span>Código demo generado: <strong className="font-mono text-white text-xs">{generatedCode}</strong></span>
                <span className="text-[10px] text-neutral-400">(O usa 482910)</span>
              </div>
            </div>

            {/* 6 input boxes container */}
            <div className={`space-y-2 ${shakeField === 'otp' ? 'animate-shake' : ''}`}>
              <label className="block text-xs font-semibold text-neutral-300">
                Código Numérico (6 dígitos)
              </label>

              <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      digitInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`h-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-extrabold rounded-xl bg-black/70 border text-white focus:outline-none transition-all ${
                      otpError
                        ? 'border-rose-500/80 bg-rose-500/10'
                        : digit
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'border-white/10 focus:border-amber-400'
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}
            </div>

            {/* Resend Cooldown Counter */}
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              {cooldown > 0 ? (
                <span className="font-mono text-[11px] text-amber-400/90">
                  Reenviar código en 00:{cooldown < 10 ? `0${cooldown}` : cooldown}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reenviar código ahora</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="text-neutral-400 hover:text-white cursor-pointer underline text-[11px]"
              >
                Cambiar correo
              </button>
            </div>

            {/* Submit Verification Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={!isOtpComplete || isVerifying}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isVerifying ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-black" />
                  <span>Validando OTP...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Verificar y Confirmar</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-white">¡Correo Verificado con Éxito!</h4>
              <p className="text-xs text-neutral-300 mt-1">
                La dirección <span className="font-mono text-emerald-400">{email}</span> ha sido autenticada de forma segura mediante OTP.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Continuar con mi Compra</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
