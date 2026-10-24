import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  FileCheck2,
  BookOpen,
  Send,
  BarChart2,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Search,
  ArrowRight,
  ExternalLink,
  Building2,
  Filter,
  Check,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  loadVcetStudentsFromStorage,
  getFacultyMentorProfile,
  getClassesForFaculty,
  VCET_CLASSES,
  VcetStudentData,
} from '../data/vcetStudentsData';
import { getStoredAccounts } from '../services/authSecurityService';
import { StudentProfile } from '../types';
import {
  getStudentRegStatus,
  getStudentResumeStatus,
  getStudentLastActive,
  getStudentPrepProgress,
} from './StudentDirectoryPage';

interface StaffDashboardPageProps {
  onNavigate: (tab: string) => void;
  onSelectStudent?: (student: StudentProfile) => void;
}

export const StaffDashboardPage: React.FC<StaffDashboardPageProps> = ({
  onNavigate,
  onSelectStudent,
}) => {
  const { currentUser } = useAuth();
  const allVcetStudents = useMemo(() => loadVcetStudentsFromStorage(), []);
  const storedAccounts = useMemo(() => getStoredAccounts(), []);

  // Faculty profile if matched
  const facultyProfile = getFacultyMentorProfile(currentUser.id, currentUser.email);

  // 1. Department selector: All Departments | IT | CSE | AI & DS | CSE (AI & ML)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  // 2. Batch filter
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');

  // 3. Class / Section filter
  const [selectedClassCode, setSelectedClassCode] = useState<string>('ALL');

  // 4. Registration Status filter
  const [selectedRegStatus, setSelectedRegStatus] = useState<string>('ALL');

  // 5. Resume status filter
  const [selectedResumeStatus, setSelectedResumeStatus] = useState<string>('ALL');

  // 6. Skill gap filter
  const [selectedSkillGap, setSelectedSkillGap] = useState<string>('ALL');

  // 7. Search query
  const [searchQuery, setSearchQuery] = useState('');

  // 8. Pagination
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter department classes for the class selector
  const availableClasses = useMemo(() => {
    if (selectedDepartment === 'ALL') return VCET_CLASSES;
    return VCET_CLASSES.filter((c) => c.departmentCode === selectedDepartment);
  }, [selectedDepartment]);

  // Department-filtered student set
  const departmentStudents = useMemo(() => {
    if (selectedDepartment === 'ALL') return allVcetStudents;
    return allVcetStudents.filter((s) => s.departmentCode === selectedDepartment);
  }, [allVcetStudents, selectedDepartment]);

  // Multi-filtered students
  const filteredStudents = useMemo(() => {
    return departmentStudents.filter((st) => {
      // Batch filter
      if (selectedBatch !== 'ALL') {
        if (selectedBatch === '4th-Year' && st.year !== 4) return false;
        if (selectedBatch === '3rd-Year' && st.year !== 3) return false;
        if (selectedBatch === '2nd-Year' && st.year !== 2) return false;
        if (selectedBatch !== '4th-Year' && selectedBatch !== '3rd-Year' && selectedBatch !== '2nd-Year') {
          if (st.batch !== selectedBatch) return false;
        }
      }

      // Class code filter
      if (selectedClassCode !== 'ALL' && st.classCode !== selectedClassCode) {
        return false;
      }

      // Registration Status filter
      if (selectedRegStatus !== 'ALL') {
        const reg = getStudentRegStatus(st, storedAccounts);
        if (selectedRegStatus === 'Registered' && reg === 'Not Registered') return false;
        if (selectedRegStatus === 'Not Registered' && reg !== 'Not Registered') return false;
        if (selectedRegStatus === 'Profile Completed' && reg !== 'Profile Completed') return false;
        if (selectedRegStatus === 'Profile Incomplete' && reg !== 'Profile Incomplete') return false;
      }

      // Resume Status filter
      if (selectedResumeStatus !== 'ALL') {
        const res = getStudentResumeStatus(st);
        if (res !== selectedResumeStatus) return false;
      }

      // Skill Gap filter
      if (selectedSkillGap === 'Power BI' && st.hasPowerBi) return false;
      if (selectedSkillGap === 'SQL' && st.hasSql) return false;
      if (selectedSkillGap === 'Cloud' && st.hasCloud) return false;
      if (selectedSkillGap === 'DSA' && st.hasDsa) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.registerNumber.toLowerCase().includes(q) ||
          st.rollNumber.toLowerCase().includes(q) ||
          st.classCode.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    departmentStudents,
    selectedBatch,
    selectedClassCode,
    selectedRegStatus,
    selectedResumeStatus,
    selectedSkillGap,
    searchQuery,
    storedAccounts,
  ]);

  // Aggregate Metrics computed dynamically from the active filtered/department scope
  const totalCount = departmentStudents.length;
  const registeredCount = departmentStudents.filter((st) => {
    const s = getStudentRegStatus(st, storedAccounts);
    return s !== 'Not Registered';
  }).length;
  const notRegisteredCount = totalCount - registeredCount;
  const completedProfilesCount = departmentStudents.filter(
    (st) => getStudentRegStatus(st, storedAccounts) === 'Profile Completed' || st.profileCompletion >= 80
  ).length;
  const incompleteProfilesCount = totalCount - completedProfilesCount;
  const verifiedResumesCount = departmentStudents.filter(
    (st) => getStudentResumeStatus(st) === 'Verified' || getStudentResumeStatus(st) === 'Uploaded'
  ).length;

  const day1ReadyCount = departmentStudents.filter((st) => st.cgpa >= 7.5 && st.backlogs === 0).length;
  const day1Rate = totalCount > 0 ? ((day1ReadyCount / totalCount) * 100).toFixed(1) : '0';

  // Skill deficit calculations
  const missingPowerBi = departmentStudents.filter((s) => !s.hasPowerBi).length;
  const missingSql = departmentStudents.filter((s) => !s.hasSql).length;
  const missingCloud = departmentStudents.filter((s) => !s.hasCloud).length;
  const missingDsa = departmentStudents.filter((s) => !s.hasDsa).length;

  // Pagination
  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents =
    pageSize === -1
      ? filteredStudents
      : filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Convert VcetStudentData to StudentProfile
  const handleOpenStudent = (st: VcetStudentData) => {
    const profile: StudentProfile = {
      id: st.id,
      userId: `user-${st.id}`,
      registerNumber: st.registerNumber,
      name: st.name,
      collegeEmail: st.email,
      personalEmail: `${st.name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      phone: st.phone,
      location: 'Erode / Coimbatore, Tamil Nadu',
      departmentId: `dept-${st.departmentCode.toLowerCase().replace(/[^a-z]/g, '')}`,
      departmentName: `${st.department} (VCET)`,
      batch: st.batch,
      year: st.year,
      cgpa: st.cgpa,
      backlogs: st.backlogs,
      careerGoal: `Excel as a ${st.targetRole || 'Software Engineer'} in premier recruitment drives.`,
      targetRole: st.targetRole || 'Software Development Engineer',
      linkedInUrl: st.linkedInUrl,
      githubUrl: st.githubUrl,
      portfolioUrl: `https://${st.name.toLowerCase().replace(/\s+/g, '')}.dev`,
      leetCodeUrl: `https://leetcode.com/${st.name.toLowerCase().replace(/\s+/g, '_')}`,
      summary: `Motivated VCET ${st.departmentCode} student (${st.classCode}, Batch ${st.batch}) with proven aptitude in ${st.hasPython ? 'Python, ' : ''}${st.hasSql ? 'SQL, ' : ''}${st.hasPowerBi ? 'Power BI dashboards, ' : ''}and software engineering.`,
      profileCompletion: st.profileCompletion,
      classCode: st.classCode,
      academicYear: st.academicYear,
      semester: st.semester,
      mentorName: facultyProfile?.name || 'Assigned Faculty Mentor',
      mentorRemarks: st.facultyRemarks,
      endorsementStatus: st.endorsementStatus,
      placementEligible: st.cgpa >= 7.5 && st.backlogs === 0,
      skills: [
        { id: `sk-1-${st.id}`, studentId: st.id, skillId: 'sk-python', skillName: 'Python', category: 'Programming', proficiency: 'Advanced', source: 'RESUME', confidence: 0.95, verified: true },
        { id: `sk-2-${st.id}`, studentId: st.id, skillId: 'sk-sql', skillName: 'SQL Database Systems', category: 'Database', proficiency: st.hasSql ? 'Advanced' : 'Beginner', source: 'RESUME', confidence: 0.90, verified: st.hasSql },
        { id: `sk-3-${st.id}`, studentId: st.id, skillId: 'sk-powerbi', skillName: 'Power BI Business Analytics', category: 'Data Science', proficiency: st.hasPowerBi ? 'Intermediate' : 'Beginner', source: 'MANUAL', confidence: 0.85, verified: st.hasPowerBi },
        { id: `sk-4-${st.id}`, studentId: st.id, skillId: 'sk-dsa', skillName: 'Data Structures & Algorithms', category: 'Core CS', proficiency: st.hasDsa ? 'Advanced' : 'Intermediate', source: 'PROJECT', confidence: 0.92, verified: st.hasDsa },
      ],
      projects: [
        {
          id: `p1-${st.id}`,
          studentId: st.id,
          title: `${st.departmentCode} Enterprise Placement & Telemetry System`,
          description: `Engineered end-to-end data pipelines for curriculum analysis, database modeling, and placement readiness tracking.`,
          technologies: ['Python', 'SQL', 'React', 'Tailwind CSS'],
          githubUrl: st.githubUrl,
          role: 'Lead Architect',
        },
      ],
      internships: [],
      certifications: [],
      achievements: ['Department Technical Symposium Finalist', 'LeetCode Practice Milestone Achiever'],
    };

    if (onSelectStudent) {
      onSelectStudent(profile);
    } else {
      onNavigate('student-profile');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner (Unified Staff Experience) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#090D16] via-[#0E1524] to-[#090D16] text-white shadow-xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF007A] font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>// UNIFIED FACULTY &amp; MENTORSHIP PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Central Staff Operations Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome, <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}).
            Authorized cross-department mentorship dashboard for Information Technology (IT), Computer Science (CSE), AI &amp; DS, and CSE (AI &amp; ML).
          </p>
        </div>

        {/* Global Department Selector Dropdown (Requirement 1B & 7) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-white/[0.06] p-2.5 rounded-2xl border border-white/[0.1] backdrop-blur-md space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider">
              Department View
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedClassCode('ALL');
                setSelectedBatch('ALL');
                setCurrentPage(1);
              }}
              className="bg-[#090D16] text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF007A] cursor-pointer"
            >
              <option value="ALL">All Departments (College-Wide · 1,275)</option>
              <option value="IT">Information Technology (IT · 366)</option>
              <option value="CSE">Computer Science and Engineering (CSE · 432)</option>
              <option value="AI & DS">Artificial Intelligence &amp; Data Science (AI &amp; DS · 299)</option>
              <option value="CSE (AI & ML)">CSE (AI &amp; ML · 178)</option>
            </select>
          </div>

          <button
            onClick={() => onNavigate('student-directory')}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.1] flex items-center gap-1.5 transition-all cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <span>Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7 Dynamic Metric Cards (Requirement 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        {/* 1. Total Students */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">Total Students</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {totalCount}
          </div>
          <div className="text-[10px] text-indigo-500 font-semibold mt-0.5 truncate">
            {selectedDepartment === 'ALL' ? 'College-Wide' : selectedDepartment}
          </div>
        </div>

        {/* 2. Registered Students */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">Registered</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {registeredCount}
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">Active Portals</div>
        </div>

        {/* 3. Incomplete Profiles */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">Incomplete Profiles</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {incompleteProfilesCount}
          </div>
          <div className="text-[10px] text-amber-500 font-semibold mt-0.5">&lt;80% Profile Fit</div>
        </div>

        {/* 4. Resume Completion */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">Resume Uploaded</div>
          <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
            {verifiedResumesCount}
          </div>
          <div className="text-[10px] text-cyan-500 font-semibold mt-0.5">Resume Verified</div>
        </div>

        {/* 5. Student Preparation Progress */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">Day-1 Ready</div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {day1ReadyCount}
          </div>
          <div className="text-[10px] text-purple-500 font-semibold mt-0.5">{day1Rate}% Readiness</div>
        </div>

        {/* 6. Missing Power BI */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">Power BI Gap</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {missingPowerBi}
          </div>
          <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Critical Deficit</div>
        </div>

        {/* 7. Missing SQL */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-400 font-medium truncate">SQL Deficit</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {missingSql}
          </div>
          <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Database Training</div>
        </div>
      </div>

      {/* Filter Toolbar (Department, Batch, Class, Status, Resume, Skill Gap, Search) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#FF007A]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Authorized Student Roster Filters
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Matching Students: <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> / {totalCount}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Batch Selector */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Batch / Cohort</label>
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Batches</option>
              <option value="4th-Year">4th Year (Graduating)</option>
              <option value="3rd-Year">3rd Year (Pre-Final)</option>
              <option value="2nd-Year">2nd Year (Core Foundation)</option>
              <option value="2023-2027">Batch 2023–2027</option>
              <option value="2024-2028">Batch 2024–2028</option>
              <option value="2025-2029">Batch 2025–2029</option>
              <option value="2022-2026">Batch 2022–2026 (CSE)</option>
            </select>
          </div>

          {/* Class Code */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Class / Section</label>
            <select
              value={selectedClassCode}
              onChange={(e) => {
                setSelectedClassCode(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Classes ({availableClasses.length})</option>
              {availableClasses.map((c) => (
                <option key={c.classCode} value={c.classCode}>
                  {c.classCode} — {c.className}
                </option>
              ))}
            </select>
          </div>

          {/* Registration Status */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Reg. Status</label>
            <select
              value={selectedRegStatus}
              onChange={(e) => {
                setSelectedRegStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Registered">Registered Accounts</option>
              <option value="Not Registered">Not Registered</option>
              <option value="Profile Completed">Profile Completed (&ge;80%)</option>
              <option value="Profile Incomplete">Profile Incomplete</option>
            </select>
          </div>

          {/* Resume Status */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Resume Status</label>
            <select
              value={selectedResumeStatus}
              onChange={(e) => {
                setSelectedResumeStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Resume Status</option>
              <option value="Verified">Verified Resume</option>
              <option value="Uploaded">Uploaded</option>
              <option value="Not Uploaded">Not Uploaded</option>
            </select>
          </div>

          {/* Skill Gap Filter */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Missing Skill Gap</label>
            <select
              value={selectedSkillGap}
              onChange={(e) => {
                setSelectedSkillGap(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="ALL">No Gap Filter</option>
              <option value="Power BI">Missing Power BI</option>
              <option value="SQL">Missing SQL</option>
              <option value="Cloud">Missing Cloud</option>
              <option value="DSA">Missing DSA</option>
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Search Candidate</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Name or Reg. No..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Student Records Table */}
      <div className="rounded-3xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Student Mentorship &amp; Performance Records
            </h3>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Showing {paginatedStudents.length} of {filteredStudents.length} candidates
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50 dark:bg-white/[0.02]">
                <th className="py-3 px-4">Register Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department &amp; Class</th>
                <th className="py-3 px-4">Batch · Sem</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Profile %</th>
                <th className="py-3 px-4">Resume</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No student records found matching the active filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => {
                  const regStatus = getStudentRegStatus(st, storedAccounts);
                  const resumeStatus = getStudentResumeStatus(st);
                  const lastActive = getStudentLastActive(st);
                  const prep = getStudentPrepProgress(st);

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {st.registerNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{st.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{st.rollNumber}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {st.departmentCode}
                        </div>
                        <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                          {st.classCode}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        <div>{st.batch}</div>
                        <div className="text-[10px] opacity-80">Sem 0{st.semester}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {regStatus === 'Not Registered' ? (
                          <span className="font-semibold text-slate-400 dark:text-slate-500">
                            Not Registered
                          </span>
                        ) : regStatus === 'Profile Completed' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            Incomplete
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-200 dark:bg-white/[0.1] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                st.profileCompletion >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${st.profileCompletion}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {st.profileCompletion}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold text-[11px] ${
                            resumeStatus === 'Verified'
                              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                              : resumeStatus === 'Uploaded'
                              ? 'text-cyan-600 dark:text-cyan-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {resumeStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {lastActive}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenStudent(st)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] disabled:opacity-40 font-semibold cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] disabled:opacity-40 font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
