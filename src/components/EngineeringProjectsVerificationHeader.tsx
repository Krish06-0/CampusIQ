import React, { useState, useRef, useEffect } from 'react';
import { Code2, ShieldCheck, GitBranch, Sparkles, Cpu } from 'lucide-react';

interface EngineeringProjectsVerificationHeaderProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const EngineeringProjectsVerificationHeader: React.FC<EngineeringProjectsVerificationHeaderProps> = ({
  title = "Engineering Projects & Repository Verification",
  subtitle = "Inspect public technical repositories, source code, and project documentation directly verified via official integrations.",
  badgeText = "ENGINEERING PROJECTS & REPOSITORY VERIFICATION",
  icon = <Code2 className="w-4 h-4 text-cyan-400" />,
  children,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchOrReducedMotion, setIsTouchOrReducedMotion] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouchOrReducedMotion(isTouch || isReduced);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchOrReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt calculations
    const rotateX = ((centerY - y) / centerY) * 4; // Max 4 deg tilt
    const rotateY = ((x - centerX) / centerX) * 5; // Max 5 deg tilt

    setTilt({ rotateX, rotateY, scale: 1.008 });
  };

  const handleMouseEnter = () => {
    if (!isTouchOrReducedMotion) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
      }}
      className={`relative w-full transition-all duration-300 ${className}`}
    >
      {/* 3D Transform Layer */}
      <div
        style={{
          transform: isHovered && !isTouchOrReducedMotion
            ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${tilt.scale}, ${tilt.scale}, 1)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
        }}
        className="relative rounded-3xl overflow-hidden bg-slate-950/90 dark:bg-slate-950/95 border border-indigo-500/25 dark:border-indigo-500/35 shadow-2xl p-6 sm:p-8 backdrop-blur-xl group"
      >
        {/* Soft Ambient Glow Pulse Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
          
          {/* Subtle 3D Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
        </div>

        {/* Dynamic Light Sweep Highlight Edge */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

        {/* Foreground Content with Depth translateZ */}
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="relative z-10 space-y-4"
        >
          {/* 3D Capsule Badge with Continuous Light Sweep Border */}
          {badgeText && (
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-900/90 via-indigo-950/80 to-slate-900/90 border border-indigo-400/40 shadow-lg shadow-indigo-950/50 backdrop-blur-md relative overflow-hidden group/badge transition-all hover:border-cyan-400/60">
              {/* Light sweep keyframe shimmer inside badge */}
              <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(110deg,transparent_20%,rgba(56,189,248,0.4)_50%,transparent_80%)] translate-x-[-100%] animate-[apex-sweep_4s_infinite]" />
              
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                {icon}
              </div>

              <span className="text-[11px] font-mono uppercase tracking-widest font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-violet-300 drop-shadow-sm">
                {badgeText}
              </span>

              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            </div>
          )}

          {/* Main Title & Description */}
          {title && (
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                {title}
              </span>
            </h2>
          )}

          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}

          {/* Any extra custom children */}
          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>
    </div>
  );
};
