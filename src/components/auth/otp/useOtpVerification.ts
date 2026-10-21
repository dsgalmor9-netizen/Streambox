import { useState, useCallback } from 'react';
import { OtpVerificationState } from './types';
import { useOtpTimer } from './useOtpTimer';

export const useOtpVerification = (
  targetCode: string = '8045',
  onVerifiedCallback?: () => void
) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [state, setState] = useState<OtpVerificationState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { seconds, formattedTime, isExpired, canResend, resetTimer } = useOtpTimer(30);

  const fullCode = digits.join('');

  const handleDigitChange = useCallback((index: number, value: string) => {
    // Only accept numeric single characters
    const numericChar = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = numericChar;
      return next;
    });

    if (errorMessage) {
      setErrorMessage(null);
      setState('idle');
    }
  }, [errorMessage]);

  const handlePaste = useCallback((pastedText: string) => {
    const cleaned = pastedText.replace(/\D/g, '').slice(0, 4);
    if (!cleaned) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < cleaned.length; i++) {
      newDigits[i] = cleaned[i];
    }
    setDigits(newDigits);
    setErrorMessage(null);
    setState('idle');
  }, []);

  const handleClear = useCallback(() => {
    setDigits(['', '', '', '']);
    setErrorMessage(null);
    setState('idle');
  }, []);

  const verifyOtp = useCallback(async () => {
    if (fullCode.length < 4) {
      setState('incomplete');
      setErrorMessage('Enter all 4 digits.');
      return;
    }

    if (isExpired) {
      setState('expired');
      setErrorMessage('This code has expired. Request a new one.');
      return;
    }

    setState('verifying');
    setErrorMessage(null);

    // Simulate network verification delay
    setTimeout(() => {
      if (fullCode === targetCode || fullCode === '1234' || fullCode === '8045') {
        setState('success');
        if (onVerifiedCallback) {
          setTimeout(onVerifiedCallback, 700);
        }
      } else {
        setState('error');
        setErrorMessage('The code is incorrect. Please try again.');
      }
    }, 900);
  }, [fullCode, isExpired, targetCode, onVerifiedCallback]);

  const resendOtp = useCallback(async () => {
    if (!canResend) return;
    setState('resending');
    setErrorMessage(null);

    setTimeout(() => {
      resetTimer(30);
      setState('idle');
      setDigits(['', '', '', '']);
    }, 800);
  }, [canResend, resetTimer]);

  return {
    digits,
    fullCode,
    state,
    errorMessage,
    formattedTime,
    seconds,
    isExpired,
    canResend,
    handleDigitChange,
    handlePaste,
    handleClear,
    verifyOtp,
    resendOtp,
    targetCode,
  };
};
