import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 44 }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="GameHunter Logo"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`select-none object-contain transition-transform duration-300 hover:scale-105 drop-shadow-[0_0_10px_rgba(34,197,94,0.35)] ${className}`}
    />
  );
}

export default Logo;
