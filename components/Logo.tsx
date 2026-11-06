import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 44 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none overflow-visible group ${className}`}
      aria-label="GameHunter Brutal Rex Logo"
    >
      <defs>
        {/* Shield & Background Gradients */}
        <linearGradient id="gh-shield-bg" x1="15" y1="10" x2="105" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#07170F" />
          <stop offset="55%" stopColor="#050D09" />
          <stop offset="100%" stopColor="#020604" />
        </linearGradient>

        <linearGradient id="gh-emerald-rim" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Brutal Dinosaur Skin Gradients */}
        <linearGradient id="gh-dino-top" x1="20" y1="22" x2="98" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="45%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        <linearGradient id="gh-dino-dark" x1="20" y1="35" x2="90" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#166534" />
          <stop offset="60%" stopColor="#14532D" />
          <stop offset="100%" stopColor="#062E16" />
        </linearGradient>

        <linearGradient id="gh-dino-jaw" x1="25" y1="62" x2="95" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="65%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#0F3F22" />
        </linearGradient>

        {/* Toxic Mouth & Eye Glow */}
        <radialGradient id="gh-mouth-glow" cx="65%" cy="62%" r="35%">
          <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#10B981" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#052E16" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="gh-eye-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#A3E635" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>

        <filter id="gh-brutal-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#22C55E" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Aggressive Esports Crest Shield */}
      <path
        d="M60 6 L104 24 L96 84 L60 114 L24 84 L16 24 Z"
        fill="url(#gh-shield-bg)"
        stroke="url(#gh-emerald-rim)"
        strokeWidth="3"
        strokeLinejoin="round"
        className="transition-all duration-300 group-hover:stroke-[#86EFAC]"
      />

      {/* Inner Jagged Frame */}
      <path
        d="M60 12 L97 27 L90 80 L60 106 L30 80 L23 27 Z"
        fill="none"
        stroke="#22C55E"
        strokeWidth="1"
        strokeOpacity="0.28"
      />

      {/* 3 Brutal Predator Claw Slash Marks in Background */}
      <g opacity="0.32">
        <path d="M28 24 L48 92 L52 90 L33 22 Z" fill="#22C55E" />
        <path d="M42 18 L64 96 L68 94 L47 16 Z" fill="#4ADE80" />
        <path d="M57 20 L78 88 L82 86 L62 18 Z" fill="#22C55E" />
      </g>

      {/* Toxic Energy Glow inside Roaring Jaw */}
      <circle cx="68" cy="66" r="24" fill="url(#gh-mouth-glow)" />

      {/* ================= BRUTAL T-REX / RAPTOR HEAD ================= */}
      <g filter="url(#gh-brutal-glow)" className="transition-transform duration-300 group-hover:scale-[1.05]" style={{ transformOrigin: '60px 60px' }}>
        
        {/* Dorsal Neck Spikes (Back of Head/Neck) */}
        <path
          d="M24 44 L13 38 L22 52 L11 50 L21 63 L12 64 L23 75 Z"
          fill="#4ADE80"
        />

        {/* Muscular Neck & Back Skull Base */}
        <path
          d="M18 82 L22 50 L36 32 L54 27 L52 68 L42 96 L22 90 Z"
          fill="url(#gh-dino-dark)"
        />

        {/* Deep Throat & Inner Mouth Cavity */}
        <path
          d="M46 54 L88 52 L72 72 L86 82 L48 80 Z"
          fill="#041E11"
        />

        {/* Fierce Muscular Tongue */}
        <path
          d="M52 68 Q68 63 82 70 Q68 76 50 75 Z"
          fill="#10B981"
          opacity="0.7"
        />

        {/* UPPER TEETH ROW (Razor-sharp interlocking predator fangs) */}
        <path
          d="M50 56 L53 65 L57 56 L61 66 L65 55 L70 67 L75 55 L80 66 L84 54 L89 68 L94 53 L98 63 L101 51 Z"
          fill="#F8FAFC"
        />
        <path
          d="M50 56 L53 65 L57 56 L61 66 L65 55 L70 67 L75 55 L80 66 L84 54 L89 68 L94 53 L98 63 L101 51 Z"
          fill="#86EFAC"
          opacity="0.25"
        />

        {/* LOWER TEETH ROW (Jagged upward fangs) */}
        <path
          d="M52 80 L56 71 L60 81 L64 70 L69 81 L74 69 L79 81 L84 68 L89 80 L93 70 L96 81 Z"
          fill="#F1F5F9"
        />

        {/* LOWER JAW (Heavy Armored Mandible) */}
        <path
          d="M36 74 L52 77 L96 78 L100 84 L90 93 L64 95 L42 96 L26 88 Z"
          fill="url(#gh-dino-jaw)"
          stroke="#052E16"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Lower Jaw Scale Highlights & Chin Spikes */}
        <path
          d="M46 84 L88 83 L83 89 L52 90 Z"
          fill="#4ADE80"
          opacity="0.35"
        />
        <path
          d="M62 95 L66 102 L72 95 L77 101 L82 94 L87 99 L91 92"
          fill="#22C55E"
        />

        {/* UPPER SKULL, SNOUT & ARMORED CREST */}
        <path
          d="M22 50 L30 34 L45 22 L62 18 L76 24 L96 30 L107 42 L103 53 L86 55 L68 57 L48 56 L36 66 L24 62 Z"
          fill="url(#gh-dino-top)"
          stroke="#052E16"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Heavy Brow Horn & Jagged Skull Spikes */}
        <path
          d="M28 36 L20 25 L36 28 L33 17 L48 22 L50 12 L64 19 L69 13 L78 24 Z"
          fill="#4ADE80"
          stroke="#064E3B"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Armored Snout Plates & Darker Scale Shading */}
        <path
          d="M62 24 L94 32 L103 42 L84 42 L66 36 Z"
          fill="#15803D"
        />
        <path
          d="M34 46 L58 38 L86 45 L99 50 L82 52 L54 52 L38 58 Z"
          fill="#166534"
        />

        {/* Nostril Slit */}
        <path
          d="M92 38 L99 41 L95 44 L90 41 Z"
          fill="#022C22"
        />

        {/* Battle Scar Across the Eye & Snout */}
        <path
          d="M52 23 L59 51"
          stroke="#022C22"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M53 23 L60 51"
          stroke="#86EFAC"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* FIERCE PREDATOR EYE (Glowing Acid/Emerald Slit Eye) */}
        <path
          d="M47 35 L66 31 L62 42 L49 41 Z"
          fill="#022C22"
        />
        <path
          d="M49 36 L64 33 L61 40 L51 40 Z"
          fill="url(#gh-eye-glow)"
        />
        {/* Vertical Reptile Slit Pupil */}
        <path
          d="M57 34 L58.5 37 L57 40 L55.5 37 Z"
          fill="#052E16"
        />
        {/* Eye Glint */}
        <circle cx="54" cy="36" r="1.2" fill="#FFFFFF" />

        {/* Cheek Armor Spike */}
        <path
          d="M36 58 L24 62 L33 69 L26 73 L42 74 L46 60 Z"
          fill="#22C55E"
          stroke="#052E16"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
}
