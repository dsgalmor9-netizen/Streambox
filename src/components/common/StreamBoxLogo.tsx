import React from 'react';

interface StreamBoxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  showText?: boolean;
  className?: string;
}

export const StreamBoxLogo: React.FC<StreamBoxLogoProps> = ({
  size = 'md',
  showSlogan = true,
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: { w: 32, h: 32, fontSize: 'text-lg', sloganSize: 'text-[9px]' },
    md: { w: 44, h: 44, fontSize: 'text-2xl', sloganSize: 'text-[11px]' },
    lg: { w: 64, h: 64, fontSize: 'text-4xl', sloganSize: 'text-xs' },
    xl: { w: 96, h: 96, fontSize: 'text-6xl', sloganSize: 'text-sm' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 3D Isometric Neon Cube Icon */}
      <div 
        className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-200"
        style={{ width: iconDimensions.w, height: iconDimensions.h }}
      >
        {/* Glow backdrop aura */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-600/40 to-pink-500/30 blur-md rounded-xl -z-10"
        />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Cube Top Face Gradient */}
            <linearGradient id="cubeTop" x1="20" y1="20" x2="80" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            {/* Cube Left Face (S) Gradient */}
            <linearGradient id="cubeLeft" x1="15" y1="35" x2="50" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="60%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Cube Right Face (Play) Gradient */}
            <linearGradient id="cubeRight" x1="50" y1="35" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="50%" stopColor="#C026D3" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>

            {/* Play Button Glow */}
            <linearGradient id="playGlow" x1="60" y1="48" x2="78" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* S Letter Accent */}
            <linearGradient id="sAccent" x1="24" y1="45" x2="44" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E0E7FF" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>

            {/* Light streak */}
            <linearGradient id="streak" x1="70" y1="35" x2="100" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Speed light trails on the right */}
          <path d="M 75 32 L 98 32" stroke="url(#streak)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 72 44 L 95 44" stroke="url(#streak)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 78 54 L 99 54" stroke="url(#streak)" strokeWidth="2" strokeLinecap="round" />

          {/* 3D Cube Base Outline & Faces */}
          {/* Top Face */}
          <polygon
            points="50,15 82,31 50,47 18,31"
            fill="url(#cubeTop)"
            stroke="#F472B6"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Left Face */}
          <polygon
            points="18,31 50,47 50,83 18,67"
            fill="url(#cubeLeft)"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Right Face */}
          <polygon
            points="50,47 82,31 82,67 50,83"
            fill="url(#cubeRight)"
            stroke="#E879F9"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Stylized Embossed "S" on the Left Face */}
          <path
            d="M 41 42 C 34 38, 25 43, 26 49 C 27 54, 43 55, 43 62 C 43 68, 32 72, 25 67"
            fill="none"
            stroke="url(#sAccent)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Stylized Glowing Play Triangle on the Right Face */}
          <polygon
            points="58,51 76,60 58,69"
            fill="url(#playGlow)"
            stroke="#FDE047"
            strokeWidth="1.2"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]"
          />

          {/* Cube Highlighting neon edges */}
          <line x1="50" y1="15" x2="50" y2="47" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
          <line x1="50" y1="47" x2="50" y2="83" stroke="#A855F7" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Typography: STREAMBOX & ENTRETENIMIENTO SIN LÍMITES */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight ${iconDimensions.fontSize} uppercase flex items-baseline select-none`}>
            <span className="font-['Outfit'] font-extrabold tracking-[-0.04em] bg-gradient-to-b from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]">
              STREAM
            </span>
            <span className="font-['Outfit'] font-black tracking-[-0.03em] bg-gradient-to-r from-fuchsia-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(168,85,247,0.7)] ml-0.5">
              BOX
            </span>
          </div>

          {showSlogan && (
            <span 
              className={`font-semibold tracking-[0.28em] text-zinc-400 uppercase mt-0.5 ${iconDimensions.sloganSize} font-['Space_Grotesk']`}
              style={{ letterSpacing: '0.24em' }}
            >
              ENTRETENIMIENTO SIN LÍMITES
            </span>
          )}
        </div>
      )}
    </div>
  );
};
