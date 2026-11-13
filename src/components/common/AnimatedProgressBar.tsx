import React, { useEffect, useRef, useState } from 'react';

interface AnimatedProgressBarProps {
  /** Target percentage (0 - 100) for the primary bar */
  targetPercent: number;
  /** Optional secondary preview delta percentage (e.g., pending donation contribution) */
  previewDeltaPercent?: number;
  /** Optional stagger delay in ms */
  delayMs?: number;
  /** Track container Tailwind classes */
  trackClassName?: string;
  /** Primary fill Tailwind classes */
  fillClassName?: string;
  /** Preview delta fill Tailwind classes */
  previewClassName?: string;
  previewTitle?: string;
  children?: React.ReactNode;
}

/**
 * Donation & Goal Progress Bar that starts at 0% and smoothly animates via
 * CSS transition to its target width when entering the viewport.
 */
export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  targetPercent,
  previewDeltaPercent = 0,
  delayMs = 0,
  trackClassName = 'w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden',
  fillClassName = 'h-full bg-gradient-to-r from-[#167D78] to-[#D6F36A] rounded-full',
  previewClassName = 'h-full bg-[#D6F36A] animate-pulse',
  previewTitle,
  children,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  const clampedTarget = Math.max(0, Math.min(100, targetPercent));
  const clampedDelta = Math.max(0, Math.min(100 - clampedTarget, previewDeltaPercent));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion or browsers without IntersectionObserver
    if (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      setHasEnteredViewport(true);
      return;
    }

    let rafId: number | null = null;
    const triggerAnimation = () => {
      // Double rAF guarantees the browser commits initial 0% width before transitioning
      rafId = window.requestAnimationFrame(() => {
        rafId = window.requestAnimationFrame(() => {
          setHasEnteredViewport(true);
        });
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          triggerAnimation();
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    if (trackRef.current) {
      observer.observe(trackRef.current);
    }

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={trackRef}
      role="progressbar"
      aria-valuenow={clampedTarget}
      aria-valuemin={0}
      aria-valuemax={100}
      className={trackClassName}
    >
      <div
        className={`donation-progress-fill ${fillClassName}`}
        style={{
          width: hasEnteredViewport ? `${clampedTarget}%` : '0%',
          transitionDelay: `${delayMs}ms`,
        }}
      />
      {clampedDelta > 0 && (
        <div
          className={`donation-progress-fill ${previewClassName}`}
          style={{
            width: hasEnteredViewport ? `${clampedDelta}%` : '0%',
            transitionDelay: `${delayMs + 120}ms`,
          }}
          title={previewTitle}
        />
      )}
      {children}
    </div>
  );
};
