import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface OtpDigitProps {
  index: number;
  value: string;
  isFocused: boolean;
  hasError: boolean;
  disabled: boolean;
  onChange: (index: number, val: string) => void;
  onFocus: (index: number) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const OtpDigit: React.FC<OtpDigitProps> = ({
  index,
  value,
  isFocused,
  hasError,
  disabled,
  onChange,
  onFocus,
  onKeyDown,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, e.target.value);
  };

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 400, damping: 25 }}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className="relative flex items-center justify-center"
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onFocus={() => onFocus(index)}
        onKeyDown={(e) => onKeyDown(index, e)}
        aria-label={`Digit ${index + 1} of 4`}
        className={`w-14 h-16 sm:w-16 sm:h-18 rounded-2xl text-2xl font-bold text-center transition-all duration-200 outline-none select-none font-mono ${
          hasError
            ? 'border-2 border-rose-500 bg-rose-50/50 text-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.25)] dark:bg-rose-950/20 dark:text-rose-300'
            : isFocused
            ? 'border-2 border-purple-600 bg-white text-purple-900 shadow-[0_0_20px_rgba(147,51,234,0.3)] ring-4 ring-purple-500/15 dark:bg-zinc-900 dark:text-white dark:border-purple-400'
            : value
            ? 'border-2 border-purple-300 bg-purple-50/30 text-purple-950 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white'
            : 'border border-zinc-200 bg-white/80 text-zinc-800 hover:border-purple-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      />

      {/* Subtle indicator dot when empty */}
      {!value && !isFocused && (
        <span className="absolute w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 pointer-events-none" />
      )}
    </motion.div>
  );
};
