'use client';
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  textClassName?: string;
}

/**
 * Logo Oficial GameHunter:
 * Combina uma Mira Tática de Precisão (Hunter Crosshair / Lock-On) com um
 * Controle Gamer Estilizado de Feições Predadoras (Visor em 'V' + Gamepad).
 */
export const Logo: React.FC<LogoProps> = ({ 
  size = 36, 
  className = '', 
  withText = false,
  textClassName = ''
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Brilho ambiental de fundo que intensifica no hover */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md group-hover:bg-primary/40 group-hover:scale-110 transition-all duration-300 pointer-events-none" />

        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="ghOuterRing" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>

            <linearGradient id="ghShieldBg" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="ghPadBody" x1="14" y1="22" x2="50" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            <linearGradient id="ghVisorGlow" x1="20" y1="20" x2="44" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>

            <filter id="ghNeonFilter" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* --- ESCUDO HEXAGONAL TÁTICO DE FUNDO --- */}
          <polygon
            points="32,4 56,16 56,48 32,60 8,48 8,16"
            fill="url(#ghShieldBg)"
            stroke="url(#ghOuterRing)"
            strokeWidth="2"
            strokeOpacity="0.85"
          />

          {/* --- ANEL DE MIRA SNIPER (HUNTER CROSSHAIR) --- */}
          <circle
            cx="32"
            cy="32"
            r="22"
            stroke="url(#ghOuterRing)"
            strokeWidth="1.2"
            strokeDasharray="8 5"
            strokeOpacity="0.6"
          />

          {/* Cantoneiras de Lock-On (Mira de Caçador) */}
          <path d="M14 20 V14 H20" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 20 V14 H44" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 44 V50 H20" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 44 V50 H44" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Traços cardeais da mira de precisão */}
          <line x1="32" y1="6" x2="32" y2="13" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="51" x2="32" y2="58" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="32" x2="12" y2="32" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <line x1="52" y1="32" x2="58" y2="32" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />

          {/* --- CONTROLE GAMER ESTILIZADO (PREDATOR GAMEPAD) --- */}
          <path
            d="M21 22 C25 20, 39 20, 43 22 C48 24, 51 31, 49 42 C48 46.5, 43.5 47.5, 40.5 43.5 L36.5 38.5 C34.5 37.5, 29.5 37.5, 27.5 38.5 L23.5 43.5 C20.5 47.5, 16 46.5, 15 42 C13 31, 16 24, 21 22 Z"
            fill="url(#ghPadBody)"
            stroke="url(#ghOuterRing)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Visor Angular de Caçador em 'V' no topo do Controle */}
          <path
            d="M23 24 L32 28.5 L41 24 L39 22.5 L32 26 L25 22.5 Z"
            fill="url(#ghVisorGlow)"
            filter="url(#ghNeonFilter)"
          />

          {/* D-Pad Esquerdo */}
          <path
            d="M19.5 31.5 H22 V29 H24.5 V31.5 H27 V34 H24.5 V36.5 H22 V34 H19.5 Z"
            fill="#4ade80"
          />

          {/* Botões de Ação Direitos (Mira / Alvo) */}
          <circle cx="40.5" cy="30" r="1.5" fill="#38bdf8" />
          <circle cx="43.5" cy="33" r="1.5" fill="#22c55e" />
          <circle cx="40.5" cy="36" r="1.5" fill="#eab308" />
          <circle cx="37.5" cy="33" r="1.5" fill="#f43f5e" />

          {/* Ponto Laser Central (Target Lock) */}
          <circle cx="32" cy="33" r="2" fill="#22c55e" filter="url(#ghNeonFilter)" />
          <circle cx="32" cy="33" r="0.8" fill="#ffffff" />
        </svg>
      </div>

      {withText && (
        <span className={`font-black tracking-tight text-foreground ${textClassName}`}>
          Game<span className="text-primary">Hunter</span>
        </span>
      )}
    </div>
  );
};
export default Logo;
