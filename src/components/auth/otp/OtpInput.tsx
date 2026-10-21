import React, { useState } from 'react';
import { OtpDigit } from './OtpDigit';

interface OtpInputProps {
  digits: string[];
  hasError: boolean;
  disabled: boolean;
  onChange: (index: number, val: string) => void;
  onPaste: (pastedText: string) => void;
  onEnterPress?: () => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  digits,
  hasError,
  disabled,
  onChange,
  onPaste,
  onEnterPress,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const handleDigitChange = (index: number, val: string) => {
    onChange(index, val);

    // If a digit was entered, advance focus to next box
    if (val && index < 3) {
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is empty, backspace moves to previous and clears it
        onChange(index - 1, '');
        setFocusedIndex(index - 1);
      } else {
        onChange(index, '');
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 3) {
      e.preventDefault();
      setFocusedIndex(index + 1);
    } else if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  const handleContainerPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    onPaste(pasted);
    setFocusedIndex(3);
  };

  return (
    <div
      onPaste={handleContainerPaste}
      className="flex items-center justify-center gap-3 sm:gap-4 my-6"
    >
      {digits.map((digit, i) => (
        <OtpDigit
          key={i}
          index={i}
          value={digit}
          isFocused={focusedIndex === i}
          hasError={hasError}
          disabled={disabled}
          onChange={handleDigitChange}
          onFocus={setFocusedIndex}
          onKeyDown={handleKeyDown}
        />
      ))}
    </div>
  );
};
