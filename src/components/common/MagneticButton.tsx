import React, { useRef, useState, useEffect } from 'react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  maxDistance?: number; // max translation (4-6px)
  proximityZone?: number; // proximity zone (56px)
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  maxDistance = 5,
  proximityZone = 56,
  className = '',
  disabled,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchOrReduced, setIsTouchOrReduced] = useState(false);

  useEffect(() => {
    // Check for touch device or reduced motion preference
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouchOrReduced(isTouch || isReduced);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchOrReduced || disabled || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < proximityZone) {
      // Calculate normalized magnetic pull clamped to maxDistance (4-6px)
      const pullFactor = Math.min(distance / proximityZone, 1);
      const moveX = (distanceX / (rect.width / 2)) * maxDistance;
      const moveY = (distanceY / (rect.height / 2)) * maxDistance;

      setPosition({
        x: Math.max(-maxDistance, Math.min(maxDistance, moveX)),
        y: Math.max(-maxDistance, Math.min(maxDistance, moveY))
      });
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isTouchOrReduced) return;
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  // 180ms hover-in, 260ms reset per specification
  const transitionStyle = isTouchOrReduced
    ? undefined
    : {
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovered
          ? 'transform 180ms cubic-bezier(0.2, 0, 0, 1)'
          : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform'
      };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transitionStyle}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
