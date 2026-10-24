import React from 'react';
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
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  loadVcetStudentsFromStorage,
  getFacultyMentorProfile,
  getStudentsForFaculty,
  VCET_CLASSES,
} from '../data/vcetStudentsData';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
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

    { id: 'college-events', label: 'College Events', icon: Calendar },
    { id: 'placement-jobs', label: 'Placement Drives', icon: Briefcase },
    { id: 'skill-gap', label: 'Skill Gap Telemetry', icon: Target },
    { id: 'roadmap', label: 'Personalized Roadmap', icon: Milestone },
    { id: 'project-recs', label: 'Project Catalog (34)', icon: Lightbulb },
    { id: 'resume-builder', label: 'Resume Builder & ATS', icon: Sparkles },
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
    { id: 'college-events', label: 'College Events Portal', icon: Calendar },
    { id: 'training-demand', label: 'Training Demand', icon: GraduationCap },
    { id: 'placement-jobs', label: 'Placement Drives', icon: Briefcase },
    { id: 'placement-guide', label: 'CRT Syllabus & Roadmap', icon: BookOpen },
  ];

  const deanNavItems: NavItem[] = [
    { id: 'dean-portal', label: 'Executive Dashboard (Dean)', icon: Award },
    { id: 'admin-dashboard', label: 'Placement Cell (TPO)', icon: LayoutDashboard },
    { id: 'college-analytics', label: 'College Skill Analytics', icon: BarChart3 },
    { id: 'college-events', label: 'College Events & Announcements', icon: Calendar },
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
    { id: 'dean-portal', label: 'Dean Executive Portal', icon: Award },
    { id: 'college-analytics', label: 'College Skill Analytics', icon: BarChart3 },
    { id: 'college-events', label: 'College Events & Announcements', icon: Calendar },
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
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-[66px] bottom-0 left-0 z-30 w-64 border-r border-white/[0.08] bg-[#070A11] transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto flex flex-col justify-between`}
      >
        <div className="p-4 space-y-5">
          {/* Adobe MAX Role Badge Banner */}
          <div className="rounded-2xl p-4 bg-[#0E1524] border border-white/[0.08] space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-white">
                <span className="h-2 w-2 rounded-full bg-[#FF007A] animate-pulse" />
                <span>
                  {currentRole === 'STAFF'
                    ? 'Faculty Portal'
                    : currentRole === 'STUDENT'
                    ? 'Student Workspace'
                    : isDean
                    ? 'Dean Executive Portal'
                    : 'Head of Placement (TPO)'}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-300">
                MAX 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentRole === 'STAFF'
                ? 'Dept. of AI & DS Mentorship'
                : currentRole === 'STUDENT'
                ? 'Roll: 22AIDS014 · Batch 22-26'
                : 'Recruitment & Corporate Cell'}
            </p>
          </div>

          {/* Section Kicker */}
          <div className="px-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            // SUMMIT NAVIGATION
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF007A]/20 via-[#7928CA]/15 to-transparent border-l-2 border-l-[#FF007A] text-white font-extrabold shadow-sm'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#FF007A]' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-colors ${
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
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] space-y-2">
          <button
            onClick={() => handleSelect('login')}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-950 border-white'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border-white/[0.1]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>3-Way Login Portal</span>
          </button>
          <button
            onClick={() => {
              logout();
              handleSelect('login');
            }}
            className="w-full py-2 px-3 rounded-xl border border-transparent text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out &amp; Lock</span>
          </button>
        </div>
      </aside>
    </>
  );
};
