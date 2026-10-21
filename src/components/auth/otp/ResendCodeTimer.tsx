import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { OtpVerificationState } from './types';

interface ResendCodeTimerProps {
  formattedTime: string;
  canResend: boolean;
  state: OtpVerificationState;
  onResend: () => void;
}

export const ResendCodeTimer: React.FC<ResendCodeTimerProps> = ({
  formattedTime,
  canResend,
  state,
  onResend,
}) => {
  const isResending = state === 'resending';

  return (
    <div className="text-center mt-5 text-xs text-zinc-500 dark:text-zinc-400 select-none">
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <span>Didn't get a code?</span>

        {canResend ? (
          <button
            type="button"
            disabled={isResending}
            onClick={onResend}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold hover:underline cursor-pointer inline-flex items-center gap-1 transition-colors"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Sending new code...</span>
              </>
            ) : (
              <span>Resend code</span>
            )}
          </button>
        ) : (
          <span className="font-semibold text-purple-700 dark:text-purple-300 font-mono">
            Resend in {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
};
