import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  staggerIndex?: number;
}

/**
 * Clean native IntersectionObserver scroll reveal hook conforming to:
 * - threshold: 0.15
 * - rootMargin: '0px 0px -50px 0px' (80% bottom viewport trigger)
 * - unobserve immediately once triggered
 * - will-change: transform, opacity only during animation
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -50px 0px',
  delay = 0,
  staggerIndex = 0,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if element is already inside viewport on mount
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top <= windowHeight * 0.8 && rect.bottom >= 0) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAnimating(true);
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const handleTransitionEnd = () => {
    setIsAnimating(false);
  };

  const calculatedDelay = delay + staggerIndex * 0.07; // 0.07s strict stagger (between 0.06s and 0.08s)

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0px)' : 'translateY(24px)', // 24px strict distance
    transition: 'opacity 380ms cubic-bezier(0.16, 1, 0.3, 1), transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${calculatedDelay}s`,
    willChange: isAnimating ? 'transform, opacity' : 'auto',
  };

  return {
    ref,
    isVisible,
    style,
    onTransitionEnd: handleTransitionEnd,
  };
}
