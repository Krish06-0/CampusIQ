import React from 'react';
import { ApexLogo } from './ApexLogo';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Briefcase,
  Target,
  Milestone,
  Lightbulb,
  FileCode2,
  BookOpen,
  BarChart3,
  Users,
  UploadCloud,
  History,
  ShieldCheck,
  GraduationCap,
  Layers,
  Sparkles,
  LogOut,
  Award,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  loadVcetStudentsFromStorage,
  getFacultyMentorProfile,
  getStudentsForFaculty,
} from '../data/vcetStudentsData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}) => {
  const { currentRole, currentUser, logout } = useAuth();
  const allStudents = loadVcetStudentsFromStorage();
  const facultyProfile = getFacultyMentorProfile(currentUser.id, currentUser.email);
  const facultyStudentsCount = facultyProfile
    ? getStudentsForFaculty(facultyProfile, allStudents).length
    : allStudents.length;

  const isDean =
    currentRole === 'SUPER_ADMIN' ||
    currentUser.email.toLowerCase().includes('principal') ||
    currentUser.name.toLowerCase().includes('dean');

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const studentNavItems: NavItem[] = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-profile', label: 'Candidate Profile', icon: UserCheck },
    { id: 'resume-intel', label: 'Resume Intelligence', icon: FileText },
    { id: 'placement-jobs', label: 'Placement Drives', icon: Briefcase },
    { id: 'skill-gap', label: 'Skill Gap Telemetry', icon: Target },
    { id: 'roadmap', label: 'Personalized Roadmap', icon: Milestone },
    { id: 'project-recs', label: 'Project Catalog (34)', icon: Lightbulb },
    { id: 'resume-builder', label: 'Resume Builder & ATS Analyzer', icon: FileText },
    { id: 'placement-guide', label: 'CRT Preparation Guide', icon: BookOpen },
  ];

  const staffNavItems: NavItem[] = [
    { id: 'staff-dashboard', label: 'Faculty & Mentorship', icon: Users },
    {
      id: 'student-directory',
      label: 'Mentorship Directory',
      icon: UserCheck,
      badge: `${facultyStudentsCount}`,
    },
    { id: 'college-analytics', label: 'Cohort Skill Analytics', icon: BarChart3 },
    { id: 'training-demand', label: 'Training Demand', icon: GraduationCap },
    { id: 'placement-jobs', label: 'Placement Drives', icon: Briefcase },
    { id: 'placement-guide', label: 'CRT Syllabus & Roadmap', icon: BookOpen },
  ];

  const deanNavItems: NavItem[] = [
    { id: 'dean-portal', label: 'Executive Dashboard (Dean)', icon: Award },
    { id: 'admin-dashboard', label: 'Placement Cell (TPO)', icon: LayoutDashboard },
    { id: 'login-activity', label: 'Login Activity & Audit Logs', icon: History },
    { id: 'college-analytics', label: 'College Skill Analytics', icon: BarChart3 },
    { id: 'training-demand', label: 'Training Demand Calculator', icon: GraduationCap },
    {
      id: 'student-directory',
      label: 'Central Student Directory',
      icon: Users,
      badge: `${allStudents.length}`,
    },
    { id: 'placement-jobs', label: 'Placement Drives & JDs', icon: Briefcase },
    { id: 'data-import', label: 'Data Import Center', icon: UploadCloud },
    { id: 'audit-logs', label: 'Security & Audit Logs', icon: History },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin-dashboard', label: 'Head of Placement (TPO)', icon: LayoutDashboard },
    { id: 'login-activity', label: 'Login Activity & Audit Logs', icon: History },
    { id: 'dean-portal', label: 'Dean Executive Portal', icon: Award },
    { id: 'college-analytics', label: 'College Skill Analytics', icon: BarChart3 },
    { id: 'training-demand', label: 'Training Demand Calculator', icon: GraduationCap },
    {
      id: 'student-directory',
      label: 'Central Student Directory',
      icon: Users,
      badge: `${allStudents.length}`,
    },
    { id: 'placement-jobs', label: 'Placement Management', icon: Briefcase },
    { id: 'data-import', label: 'Data Import Center', icon: UploadCloud },
    { id: 'audit-logs', label: 'Security & Audit Logs', icon: History },
    { id: 'placement-guide', label: 'Curriculum & CRT Guide', icon: BookOpen },
  ];

  const navItems =
    currentRole === 'STAFF'
      ? staffNavItems
      : currentRole === 'STUDENT'
      ? studentNavItems
      : isDean
      ? deanNavItems
      : adminNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-label="Close navigation overlay"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:top-[66px] md:bottom-0 md:w-64 md:z-30 border-r border-white/[0.08] bg-[#070A11] transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } overflow-y-auto flex flex-col justify-between`}
      >
        <div className="p-4 space-y-4">
          {/* Mobile-Only Drawer Header with Close Button */}
          <div className="md:hidden flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <ApexLogo />
              <div className="text-white font-extrabold text-xs tracking-tight uppercase font-mono">
                Candidate Hub
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Role Badge Banner */}
          <div className="hidden md:block rounded-2xl p-4 bg-[#0E1524] border border-white/[0.1] space-y-2 relative overflow-hidden shadow-lg animate-shimmer">
            <div className="flex items-center gap-3">
              <ApexLogo />
              <div className="text-white font-bold text-sm tracking-tight">APEX Candidate Hub</div>
            </div>
          </div>

          {/* Navigation Links with mobile touch targets */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer min-h-[44px] active:scale-[0.99] ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF007A]/20 via-[#7928CA]/15 to-transparent border-l-2 border-l-[#FF007A] text-white font-extrabold shadow-sm'
                      : 'text-slate-400 hover:bg-white/[0.04] active:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#FF007A]' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-colors shrink-0 ml-2 ${
                      isActive
                        ? 'bg-[#FF007A]/20 text-[#FF007A] border-[#FF007A]/40'
                        : 'bg-white/[0.05] text-slate-300 border-white/[0.1]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switch Portal / Sign-In */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] space-y-2 safe-pb">
          <button
            onClick={() => handleSelect('login')}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'login'
                ? 'bg-white text-slate-950 border-white'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border-white/[0.1]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
            <span className="flex flex-col items-center">
              <span>Unified Access Portal</span>
              <span className="text-[9px] font-normal opacity-80 mt-0.5">Secure role-based access</span>
            </span>
          </button>
          <button
            onClick={() => {
              logout();
              handleSelect('login');
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-transparent text-xs font-semibold text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[40px]"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sign Out &amp; Lock</span>
          </button>
        </div>
      </aside>
    </>
  );
};
