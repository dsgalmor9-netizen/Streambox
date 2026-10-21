import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { OtpVerificationState } from './types';

interface VerificationStatusProps {
  state: OtpVerificationState;
  errorMessage: string | null;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({
  state,
  errorMessage,
}) => {
  const isSuccess = state === 'success';

  return (
    <div className="min-h-[28px] my-2 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {errorMessage ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-1.5 text-xs text-rose-500 font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        ) : isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Your identity has been verified.</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
