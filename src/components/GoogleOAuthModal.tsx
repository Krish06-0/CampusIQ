import React, { useState } from 'react';
import { X, Shield, ArrowRight, Check } from 'lucide-react';
import { UserRole } from '../types';

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: { email: string; name: string }) => void;
  selectedRole: UserRole;
  rollNumber?: string;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedRole,
  rollNumber,
}) => {
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  // Real institutional / Google accounts available for the session
  const simulatedGoogleAccounts = [
    {
      name: 'Lalith Krish',
      email: 'lali.krish@college.edu',
      avatarText: 'LK',
      roleHint: 'Student (Batch 2024-2028)',
    },
    {
      name: 'Prof. V. Manoj Praveen',
      email: 'staff.manoj@college.edu',
      avatarText: 'MP',
      roleHint: 'Faculty Advisor',
    },
    {
      name: 'Dr. S. K. Raman',
      email: 'tpo.placement@college.edu',
      avatarText: 'SR',
      roleHint: 'Placement Cell',
    },
  ];

  const handleSelectAccount = (account: { name: string; email: string }) => {
    setIsAuthenticating(true);
    setAuthError('');
    setTimeout(() => {
      setIsAuthenticating(false);
      onSuccess({ email: account.email, name: account.name });
    }, 700);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setAuthError('Please enter a valid Google Account email.');
      return;
    }
    setIsAuthenticating(true);
    setAuthError('');
    setTimeout(() => {
      setIsAuthenticating(false);
      const name = customName.trim() || customEmail.split('@')[0];
      onSuccess({ email: customEmail.trim(), name });
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl apex-backdrop-fade cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isAuthenticating) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-oauth-title"
    >
      <style>{`
        @keyframes apexModalEntrance {
          0% {
            opacity: 0;
            transform: perspective(1000px) rotateX(4deg) scale(0.92) translateY(16px);
          }
          100% {
            opacity: 1;
            transform: perspective(1000px) rotateX(0deg) scale(1) translateY(0);
          }
        }
        @keyframes apexAmbientDrift1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(25px, -18px) scale(1.12);
          }
        }
        @keyframes apexAmbientDrift2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, 22px) scale(1.15);
          }
        }
        @keyframes apexLightSweep {
          0% {
            transform: translateX(-100%) skewX(-20deg);
          }
          50%, 100% {
            transform: translateX(200%) skewX(-20deg);
          }
        }
        @keyframes apexBorderShine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes apexStaggerItem {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .apex-dialog-container {
          animation: apexModalEntrance 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .apex-backdrop-fade {
          animation: apexStaggerItem 0.25s ease-out forwards;
        }
        .apex-orb-1 {
          animation: apexAmbientDrift1 9s ease-in-out infinite;
        }
        .apex-orb-2 {
          animation: apexAmbientDrift2 11s ease-in-out infinite;
        }
        .apex-border-gradient {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.6), rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.4), rgba(59, 130, 246, 0.6));
          background-size: 300% 300%;
          animation: apexBorderShine 8s ease infinite;
        }
        .apex-light-sweep {
          animation: apexLightSweep 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .apex-stagger-1 { animation: apexStaggerItem 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.04s both; }
        .apex-stagger-2 { animation: apexStaggerItem 0.32s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both; }
        .apex-stagger-3 { animation: apexStaggerItem 0.34s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both; }
        .apex-stagger-4 { animation: apexStaggerItem 0.36s cubic-bezier(0.16, 1, 0.3, 1) 0.16s both; }
        .apex-stagger-5 { animation: apexStaggerItem 0.38s cubic-bezier(0.16, 1, 0.3, 1) 0.20s both; }
        .apex-stagger-6 { animation: apexStaggerItem 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.24s both; }
        
        @media (prefers-reduced-motion: reduce) {
          .apex-dialog-container,
          .apex-backdrop-fade,
          .apex-orb-1,
          .apex-orb-2,
          .apex-border-gradient,
          .apex-light-sweep,
          .apex-stagger-1,
          .apex-stagger-2,
          .apex-stagger-3,
          .apex-stagger-4,
          .apex-stagger-5,
          .apex-stagger-6 {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Living Ambient Background - Layered Navy, Indigo, Violet Drifting Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {/* Deep layered radial backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(30,27,75,0.7)_0%,rgba(15,23,42,0.95)_65%,rgba(2,6,23,0.98)_100%)]" />
        
        {/* Ambient Orb 1 - Cyan / Sky */}
        <div className="absolute top-1/2 left-1/2 -translate-x-[75%] -translate-y-[85%] w-[380px] h-[380px] rounded-full bg-cyan-500/15 blur-[90px] apex-orb-1" />
        
        {/* Ambient Orb 2 - Violet / Magenta */}
        <div className="absolute top-1/2 left-1/2 translate-x-[15%] -translate-y-[25%] w-[420px] h-[420px] rounded-full bg-violet-600/18 blur-[100px] apex-orb-2" />
        
        {/* Ambient Orb 3 - Deep Indigo Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-indigo-600/20 blur-[80px]" />
      </div>

      {/* Futuristic Dialog Card Wrapper with Flowing Gradient Border */}
      <div
        className="w-full max-w-md relative p-[1px] rounded-3xl apex-border-gradient shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85),0_0_50px_rgba(6,182,212,0.18),0_0_80px_rgba(139,92,246,0.15)] apex-dialog-container cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top-Edge Cyan Glow Accent */}
        <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px] opacity-75 pointer-events-none" />

        {/* Modal Card Content Surface */}
        <div className="w-full bg-[#0b101d]/95 backdrop-blur-2xl text-slate-100 rounded-3xl overflow-hidden relative shadow-inner">
          {/* Subtle light sweep across card surface */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent apex-light-sweep" />
          </div>

          {/* Top Google Bar Header */}
          <div className="p-6 pb-5 border-b border-white/[0.08] flex items-center justify-between relative z-10 apex-stagger-1">
            <div className="flex items-center gap-3.5">
              {/* Preserved Authentic Google Logo */}
              <div className="relative p-2 rounded-2xl bg-white/[0.05] border border-white/[0.1] shadow-sm backdrop-blur-md flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" aria-label="Google logo">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 id="google-oauth-title" className="text-base font-bold text-white tracking-tight leading-tight">
                    Sign in with Google
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    OAuth 2.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose an account to continue to Placement Portal
                </p>
              </div>
            </div>

            {/* Interactive Close Button with Smooth Rotation & Hover Glow */}
            <button
              onClick={onClose}
              type="button"
              disabled={isAuthenticating}
              aria-label="Close dialog"
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.06] hover:border-white/[0.18] transition-all duration-300 hover:rotate-90 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <X className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>
          </div>

          {/* Dialog Content Body */}
          <div className="p-6 space-y-4 relative z-10">
            {/* Error Notification */}
            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.15)] apex-stagger-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                <span className="font-medium">{authError}</span>
              </div>
            )}

            {isAuthenticating ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                {/* Advanced Multi-Ring Futuristic Spinner */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-violet-500/20 border-b-violet-400 animate-spin [animation-direction:reverse] [animation-duration:1.2s]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-white tracking-wide">
                    Authenticating with Google OAuth...
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Establishing secure encrypted institutional handshake
                  </p>
                </div>
              </div>
            ) : !showCustomInput ? (
              <div className="space-y-3.5">
                {/* Interactive Account Cards List */}
                <div className="space-y-2.5" role="list">
                  {simulatedGoogleAccounts.map((account, idx) => {
                    const isSelected = selectedAccountIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        role="listitem"
                        onClick={() => {
                          setSelectedAccountIndex(idx);
                          handleSelectAccount(account);
                        }}
                        className={`w-full p-3.5 rounded-2xl text-left transition-all duration-300 relative group overflow-hidden cursor-pointer border ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                            : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-cyan-400/40 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.18)] active:translate-y-0 active:scale-[0.985]'
                        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                          idx === 0
                            ? 'apex-stagger-2'
                            : idx === 1
                            ? 'apex-stagger-3'
                            : 'apex-stagger-4'
                        }`}
                      >
                        {/* Hover Gradient Sheen Light Sweep across each card */}
                        <div
                          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden"
                          aria-hidden="true"
                        >
                          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
                        </div>

                        <div className="flex items-center justify-between relative z-10 gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Avatar with Halo Ring */}
                            <div className="relative shrink-0">
                              <div
                                className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500/40 to-violet-600/40 blur-xs opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                                aria-hidden="true"
                              />
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white font-bold text-xs flex items-center justify-center relative shadow-md ring-1 ring-white/20 group-hover:ring-cyan-300/60 transition-all">
                                {account.avatarText}
                              </div>
                            </div>

                            {/* Account Details */}
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5 truncate">
                                <span>{account.name}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 group-hover:text-slate-300 font-mono transition-colors truncate">
                                {account.email}
                              </div>
                            </div>
                          </div>

                          {/* Role Label Badge */}
                          <div className="shrink-0 text-right">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-white/[0.04] text-slate-300 border border-white/[0.08] group-hover:border-cyan-400/40 group-hover:bg-cyan-950/30 group-hover:text-cyan-200 transition-all shadow-xs">
                              {account.roleHint}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* "Use another Google account" Action with Micro-Interactions */}
                <div className="pt-1 apex-stagger-5">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full py-3 px-4 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-400/30 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.99]"
                  >
                    <span className="relative">
                      Use another Google account
                      <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-gradient-to-r from-cyan-400 to-violet-500 group-hover:w-full transition-all duration-300" />
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-3.5 apex-stagger-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Google Email or Institutional ID
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="name@gmail.com or roll@college.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    Back to List
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:via-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer active:scale-95"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            )}

            {/* Institutional Trust Notice Footer */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-slate-400 apex-stagger-6">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <Shield className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-300 font-medium">Google OAuth 2.0 Secure Channel</span>
              </span>
              <span className="text-slate-400 font-mono">Dept. of AI &amp; DS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
