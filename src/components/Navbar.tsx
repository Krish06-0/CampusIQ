import React, { useState } from 'react';
import {
  Sun,
  Moon,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Briefcase,
  FileSpreadsheet,
  BookOpen,
  Users,
  Layers,
  Shield,
  Sparkles,
  Code,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PLACEMENT_METADATA } from '../data/placementGuideData';
import { PromptCopyModal } from './PromptCopyModal';
import { ApexLogoBadge } from './ApexLogo';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  activeTab: string;
  onNavigate?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, activeTab, onNavigate }) => {
  const { currentUser, currentRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full h-[58px] sm:h-[66px] box-border flex flex-col border-b border-white/[0.08] before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[#090D16]/95 before:backdrop-blur-md">
      {/* Adobe MAX Hairline Rainbow Spectrum Strip */}
      <div className="h-[2px] w-full shrink-0 bg-gradient-to-r from-[#FF007A] via-[#7928CA] via-[#00F0FF] to-[#FFD600]" />

      <div className="flex flex-1 min-h-0 items-center justify-between px-2.5 sm:px-6 lg:px-8 w-full max-w-full">
        {/* Brand / Logo (Adobe MAX Style) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden w-10 h-10 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            onClick={() => onNavigate && onNavigate('landing')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0"
          >
            {/* Upgraded Futuristic APEX Logo Badge */}
            <div className="shrink-0">
              <ApexLogoBadge size="sm" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-base lg:text-lg tracking-tight text-white whitespace-nowrap truncate">
                  Career <span className="max-gradient-text uppercase">Intelligence</span>
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 hidden sm:block font-medium truncate max-w-xs">
                Turning Skills Into Opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* CRT Guide (hidden on small mobile, visible on sm+) */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('placement-guide')}
              title="Campus Recruitment Training &amp; 4-Round Syllabus"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'placement-guide'
                  ? 'bg-gradient-to-r from-[#FF007A] to-[#7928CA] text-white border-transparent shadow-md shadow-[#FF007A]/20'
                  : 'text-white bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.1]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
              <span className="hidden md:inline">CRT Syllabus</span>
              <span className="md:hidden">CRT</span>
            </button>
          )}

          {/* Source Google Sheet Link */}
          <a
            href={PLACEMENT_METADATA.googleSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Official Google Sheet with 500 student records"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/[0.08] transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Sheet Source</span>
            <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
          </a>

          {/* Copy Full Prompt Button */}
          <button
            type="button"
            onClick={() => setPromptModalOpen(true)}
            title="View & Copy Full Website Prompt"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/[0.08] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
            <span>Prompt</span>
          </button>

          {/* 3-Way Portal Sign-in Button */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors border whitespace-nowrap cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-slate-950 border-white'
                  : 'text-white bg-gradient-to-r from-[#FF007A] to-[#7928CA] hover:opacity-90 border-transparent shadow-md shadow-[#FF007A]/20'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">3-Way Portal</span>
              <span className="xs:hidden sm:hidden">Portal</span>
            </button>
          )}

          {/* Persona Switcher Dropdown (Touch-Friendly + Hover) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:border-white/30 active:bg-white/[0.08] transition-colors cursor-pointer select-none"
              aria-label="User Profile Menu"
              aria-expanded={userMenuOpen}
            >
              {currentRole === 'STAFF' && <Users className="w-4 h-4 text-[#FF007A] shrink-0" />}
              {currentRole === 'STUDENT' && <GraduationCap className="w-4 h-4 text-[#00F0FF] shrink-0" />}
              {(currentRole === 'PLACEMENT_ADMIN' || currentRole === 'PLACEMENT_OFFICER') && (
                <Briefcase className="w-4 h-4 text-[#FFD600] shrink-0" />
              )}
              {currentRole === 'SUPER_ADMIN' && <Shield className="w-4 h-4 text-purple-400 shrink-0" />}

              <div className="text-left hidden sm:block max-w-[120px] md:max-w-[160px] truncate leading-tight">
                <div className="text-xs font-bold text-white flex items-center gap-1 truncate">
                  <span className="truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  {currentRole === 'STAFF'
                    ? 'Staff / Faculty Mentor'
                    : currentRole === 'STUDENT'
                    ? 'Student Aspirant'
                    : currentRole === 'SUPER_ADMIN' || currentUser.name.includes('Dean')
                    ? 'Dean & Principal'
                    : 'Head of Placement (TPO)'}
                </div>
              </div>
            </button>

            {/* Dropdown Backdrop */}
            {userMenuOpen && (
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setUserMenuOpen(false)}
              />
            )}

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 top-full mt-1.5 w-60 sm:w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/10 bg-[#0E1524] shadow-2xl transition-[opacity,visibility] duration-150 py-2 z-50 ${
                userMenuOpen
                  ? 'opacity-100 visible pointer-events-auto'
                  : 'opacity-0 invisible pointer-events-none'
              }`}
            >
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{currentUser.email}</div>
                <div className="text-[10px] text-[#FFD600] font-bold mt-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]" />
                  <span>{currentRole}</span>
                </div>
              </div>
              <div className="py-1">
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('placement-guide');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] flex items-center gap-2 transition-colors cursor-pointer sm:hidden"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#FFD600]" />
                    <span>CRT Syllabus &amp; Roadmap</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    onNavigate?.('login');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] active:bg-white/[0.1] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FFD600]" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Full Prompt Modal */}
      <PromptCopyModal
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
      />
    </header>
  );
};
