import { useState, useEffect, useCallback } from 'react';

export const useOtpTimer = (initialSeconds: number = 30) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, seconds]);

  const resetTimer = useCallback((newSeconds: number = initialSeconds) => {
    setSeconds(newSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const formattedTime = `00:${seconds < 10 ? '0' : ''}${seconds}`;

  return {
    seconds,
    formattedTime,
    isExpired: seconds === 0,
    canResend: seconds === 0,
    resetTimer,
  };
};
