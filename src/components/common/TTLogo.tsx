import React from 'react';

interface TTLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withGlow?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
};

export const TTLogo: React.FC<TTLogoProps> = ({
  size = 'md',
  withGlow = true,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}
    >
      {withGlow && (
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#00F0FF]/30 via-[#7928CA]/20 to-[#FFB800]/30 blur-md pointer-events-none transform scale-110"
          aria-hidden="true"
        />
      )}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(0,240,255,0.35)]"
      >
        <defs>
          <linearGradient id="ttBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141926" />
            <stop offset="50%" stopColor="#0B0E17" />
            <stop offset="100%" stopColor="#04060A" />
          </linearGradient>

          <linearGradient id="ttStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#8A2BE2" />
            <stop offset="100%" stopColor="#FFB800" />
          </linearGradient>

          <linearGradient id="t1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#00A3FF" />
          </linearGradient>

          <linearGradient id="t2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC837" />
            <stop offset="100%" stopColor="#FF8008" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hexagonal Squircle Shield */}
        <path
          d="M 50 4 
             C 78 4, 96 22, 96 50 
             C 96 78, 78 96, 50 96 
             C 22 96, 4 78, 4 50 
             C 4 22, 22 4, 50 4 Z"
          fill="url(#ttBgGrad)"
          stroke="url(#ttStrokeGrad)"
          strokeWidth="2.5"
        />

        {/* Inner Tech Ring Accents */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="rgba(0, 240, 255, 0.15)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* First 'T' (Electric Cyan) */}
        <g filter="url(#neonGlow)">
          {/* Top horizontal bar of first T */}
          <path
            d="M 22 30 L 46 30 L 44 38 L 36 38 L 36 68 L 28 68 L 28 38 L 22 38 Z"
            fill="url(#t1Grad)"
          />
        </g>

        {/* Second 'T' (Futuristic Amber Gold, interlocking) */}
        <g filter="url(#neonGlow)">
          {/* Top horizontal bar of second T */}
          <path
            d="M 52 30 L 78 30 L 78 38 L 70 38 L 70 68 L 60 68 L 60 38 L 52 38 Z"
            fill="url(#t2Grad)"
          />
        </g>

        {/* Center Connecting Energy Node */}
        <circle cx="50" cy="34" r="2.5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="1.5" fill="#00F0FF" />
      </svg>
    </div>
  );
};
