import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { OtpVerificationProps } from './types';
import { useOtpVerification } from './useOtpVerification';
import { SecurityIcon } from './SecurityIcon';
import { OtpInput } from './OtpInput';
import { VerifyButton } from './VerifyButton';
import { ResendCodeTimer } from './ResendCodeTimer';
import { VerificationStatus } from './VerificationStatus';

export const OtpVerificationCard: React.FC<OtpVerificationProps> = ({
  email,
  onVerified,
  onCancel,
  targetCode = '8045',
  theme = 'streambox',
}) => {
  const {
    digits,
    fullCode,
    state,
    errorMessage,
    formattedTime,
    canResend,
    handleDigitChange,
    handlePaste,
    verifyOtp,
    resendOtp,
  } = useOtpVerification(targetCode, onVerified);

  // Helper function to partially mask the email e.g. p*****@gmail.com
  const maskEmail = (rawEmail: string): string => {
    if (!rawEmail || !rawEmail.includes('@')) return 's*****@gmail.com';
    const [local, domain] = rawEmail.split('@');
    if (local.length <= 2) return `${local[0]}*****@${domain}`;
    return `${local[0]}*****${local[local.length - 1]}@${domain}`;
  };

  const isComplete = fullCode.length === 4;
  const isError = state === 'error';

  return (
    <div className="w-full max-w-md mx-auto p-1 sm:p-2">
      {/* Background soft ambient glow (Lavender, soft pink, white) */}
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* The Card */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            x: isError ? [-6, 6, -4, 4, -2, 2, 0] : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 25,
            x: { duration: 0.4 },
          }}
          className={`relative rounded-[24px] p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.12)] border backdrop-blur-md transition-colors ${
            theme === 'lavender'
              ? 'bg-gradient-to-b from-white via-purple-50/40 to-pink-50/20 border-purple-100 text-zinc-900'
              : 'bg-[#14141E]/95 border-zinc-800 text-white shadow-2xl'
          }`}
        >
          {/* Optional Cancel/Close Button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* 1. Security Icon inside Lavender Circle */}
          <SecurityIcon state={state} />

          {/* 2. Title & Subtitle */}
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-1 text-zinc-900 dark:text-white">
              Verify it’s you
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
              Enter the 4-digit code we just sent to{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-300 font-mono">
                {maskEmail(email)}
              </span>
            </p>
          </div>

          {/* 3. Four Interactive Digits Input */}
          <OtpInput
            digits={digits}
            hasError={isError}
            disabled={state === 'verifying' || state === 'success'}
            onChange={handleDigitChange}
            onPaste={handlePaste}
            onEnterPress={isComplete ? verifyOtp : undefined}
          />

          {/* 4. Dynamic Verification Status & Accessible Feedback */}
          <VerificationStatus state={state} errorMessage={errorMessage} />

          {/* 5. Primary Verification Button */}
          <VerifyButton
            state={state}
            isComplete={isComplete}
            onClick={verifyOtp}
            disabled={state === 'verifying'}
          />

          {/* 6. Resend Code Timer */}
          <ResendCodeTimer
            formattedTime={formattedTime}
            canResend={canResend}
            state={state}
            onResend={resendOtp}
          />

          {/* 7. Bottom Indicator / Test Mode helper */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1 font-mono">
                <span>Your OTP is</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold tracking-widest">
                  {targetCode}
                </span>
              </span>

              {/* Quick Demo Assist Tooltip (allows verifying without hassle) */}
              <button
                type="button"
                onClick={() => {
                  handlePaste(targetCode);
                  setTimeout(() => verifyOtp(), 300);
                }}
                className="text-[11px] text-purple-600 dark:text-purple-300 font-bold hover:underline flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/60 cursor-pointer shadow-sm hover:scale-102 transition-all"
                title={`Autocompletar y verificar con: ${targetCode}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Autocompletar Código ({targetCode})</span>
              </button>
            </div>

            {onCancel && (
              <button
                type="button"
                onClick={() => onVerified?.()}
                className="w-full text-center text-xs text-zinc-400 hover:text-white py-1 transition-colors underline cursor-pointer"
              >
                Omitir verificación y entrar directamente
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
