import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  staggerIndex?: number;
  delay?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  staggerIndex = 0,
  delay = 0,
}) => {
  const { ref, style, onTransitionEnd } = useScrollReveal<HTMLDivElement>({
    staggerIndex,
    delay,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  });

  return (
    <div
      ref={ref}
      style={style}
      onTransitionEnd={onTransitionEnd}
      className={className}
    >
      {children}
    </div>
  );
};
