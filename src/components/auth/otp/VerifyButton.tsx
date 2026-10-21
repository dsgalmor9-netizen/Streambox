import React from 'react';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { OtpVerificationState } from './types';

interface VerifyButtonProps {
  state: OtpVerificationState;
  isComplete: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const VerifyButton: React.FC<VerifyButtonProps> = ({
  state,
  isComplete,
  onClick,
  disabled = false,
}) => {
  const isVerifying = state === 'verifying';
  const isSuccess = state === 'success';

  let buttonText = 'Verify code';
  if (!isComplete && !isSuccess) {
    buttonText = 'Enter 4 digits';
  } else if (isVerifying) {
    buttonText = 'Verifying...';
  } else if (isSuccess) {
    buttonText = 'Verified successfully';
  }

  const isButtonDisabled = disabled || !isComplete || isVerifying || isSuccess;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isButtonDisabled}
      whileHover={!isButtonDisabled ? { scale: 1.01 } : {}}
      whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
      className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 select-none shadow-md ${
        isSuccess
          ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/40'
          : isButtonDisabled
          ? 'bg-purple-300 text-purple-100 cursor-not-allowed opacity-60 dark:bg-purple-950/40 dark:text-purple-400/50'
          : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-600 text-white shadow-purple-600/30 cursor-pointer hover:shadow-lg'
      }`}
    >
      {isVerifying ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>{buttonText}</span>
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{buttonText}</span>
        </>
      ) : (
        <>
          <span>{buttonText}</span>
          {isComplete && <ArrowRight className="w-4 h-4 ml-0.5" />}
        </>
      )}
    </motion.button>
  );
};
