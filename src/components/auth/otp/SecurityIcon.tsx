import React from 'react';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { OtpVerificationState } from './types';

interface SecurityIconProps {
  state: OtpVerificationState;
}

export const SecurityIcon: React.FC<SecurityIconProps> = ({ state }) => {
  const isSuccess = state === 'success';

  return (
    <div className="relative flex justify-center mb-4">
      {/* Soft animated ambient glow */}
      <motion.div
        animate={{
          scale: isSuccess ? [1, 1.25, 1.1] : [1, 1.08, 1],
          opacity: isSuccess ? [0.3, 0.6, 0.4] : [0.2, 0.35, 0.2],
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className={`absolute inset-0 m-auto w-16 h-16 rounded-full blur-xl pointer-events-none ${
          isSuccess ? 'bg-emerald-400' : 'bg-purple-400'
        }`}
      />

      {/* Circle Icon Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-500 relative z-10 shadow-lg ${
          isSuccess
            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/30'
            : 'bg-gradient-to-tr from-purple-100 to-indigo-50 border border-purple-200 text-purple-600 dark:from-purple-950/80 dark:to-indigo-950/60 dark:border-purple-800/60 dark:text-purple-300 shadow-purple-500/20'
        }`}
      >
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <CheckCircle2 className="w-7 h-7" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <Lock className="w-6 h-6" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
