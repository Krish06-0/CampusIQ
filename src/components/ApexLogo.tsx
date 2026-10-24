import React, { useId } from 'react';

interface ApexLogoBadgeProps {
  size?: 'sm' | 'md';
  className?: string;
  title?: string;
}

const ApexEmblemGlyph: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const leftFacetId = `${uid}-left-facet`;
  const rightFacetId = `${uid}-right-facet`;
  const coreFacetId = `${uid}-core-facet`;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={leftFacetId} x1="4" y1="21" x2="12" y2="3.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF007A" />
          <stop offset="55%" stopColor="#B833FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id={rightFacetId} x1="12" y1="3.5" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>
        <linearGradient id={coreFacetId} x1="9" y1="18" x2="15" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7928CA" />
          <stop offset="100%" stopColor="#00F0FF" />
        </linearGradient>
      </defs>

      {/* Left Facet of 3D 'A' Prism */}
      <path
        d="M12 3.5L4.2 20.5L8.4 18.8L12 10.6V3.5Z"
        fill={`url(#${leftFacetId})`}
        className="apex-motif-facet"
      />

      {/* Right Facet of 3D 'A' Prism */}
      <path
        d="M12 3.5V10.6L15.6 18.8L19.8 20.5L12 3.5Z"
        fill={`url(#${rightFacetId})`}
        className="apex-motif-facet"
      />

      {/* Inner Pyramid Facet */}
      <path
        d="M12 12.2L9.4 18.2L14.6 18.2L12 12.2Z"
        fill={`url(#${coreFacetId})`}
        opacity="0.9"
      />

      {/* Pulsing Crown Node */}
      <circle cx="12" cy="3.5" r="1.4" fill="#00F0FF" className="apex-crown-node" />
    </svg>
  );
};

export const ApexLogoBadge: React.FC<ApexLogoBadgeProps> = ({
  size = 'md',
  className = '',
  title = 'APEX Career Intelligence',
}) => {
  const isSmall = size === 'sm';
  const heightClass = isSmall ? 'h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl' : 'h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl';
  const innerRadiusClass = 'rounded-[10.5px]';
  const textClass = isSmall
    ? 'text-xs font-black tracking-[0.14em]'
    : 'text-xs sm:text-sm font-black tracking-[0.14em]';
  const iconSizeClass = isSmall ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-[18px] sm:h-[18px]';

  return (
    <div
      className={`relative ${heightClass} flex items-center justify-center gap-1.5 select-none transition-all duration-300 ease-out hover:scale-[1.03] apex-logo-container shadow-md shadow-[#FF007A]/20 cursor-pointer ${className}`}
      title={title}
    >
      {/* Living Ambient Aura */}
      <div
        className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-[#FF007A] via-[#7928CA] to-[#00F0FF] opacity-45 blur-[6px] group-hover:opacity-85 transition-opacity duration-500 apex-aura-pulse pointer-events-none"
        aria-hidden="true"
      />

      {/* Continuous Flowing Gradient Border */}
      <div
        className="absolute inset-0 rounded-xl p-[1.5px] bg-gradient-to-r from-[#FF007A] via-[#00F0FF] to-[#7928CA] animate-apex-border pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className={`w-full h-full ${innerRadiusClass} bg-transparent`} />
      </div>

      {/* Specular 3D Obsidian Substrate */}
      <div
        className={`absolute inset-[1.5px] ${innerRadiusClass} bg-gradient-to-br from-[#12182B] via-[#0B0F1C] to-[#060811] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-1px_2px_rgba(0,0,0,0.85)] pointer-events-none`}
        aria-hidden="true"
      />

      {/* Light Sweep Shimmer */}
      <div
        className={`absolute inset-[1.5px] ${innerRadiusClass} overflow-hidden pointer-events-none`}
        aria-hidden="true"
      >
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent apex-sweep-light" />
      </div>

      {/* Clean 3D 'A' Prism Emblem */}
      <ApexEmblemGlyph className={`relative z-10 ${iconSizeClass} shrink-0 drop-shadow-[0_0_5px_rgba(0,240,255,0.45)]`} />

      {/* Brand Wordmark */}
      <span className={`relative z-10 uppercase text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${textClass}`}>
        APEX
      </span>
    </div>
  );
};

export const ApexLogo: React.FC = () => {
  return (
    <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 select-none apex-logo-container">
      <div
        className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-[#FF007A] via-[#7928CA] to-[#00F0FF] opacity-45 blur-[5px] apex-aura-pulse pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 rounded-xl p-[1.5px] bg-gradient-to-r from-[#FF007A] via-[#00F0FF] to-[#7928CA] animate-apex-border pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-full h-full rounded-[10.5px] bg-gradient-to-br from-[#12182B] via-[#0B0F1C] to-[#060811]" />
      </div>
      <div
        className="absolute inset-[1.5px] rounded-[10.5px] overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent apex-sweep-light" />
      </div>
      <ApexEmblemGlyph className="relative z-10 w-5 h-5 drop-shadow-[0_0_6px_rgba(0,240,255,0.45)]" />
    </div>
  );
};
