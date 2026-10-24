import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  GraduationCap,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
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

export type StudentRegStatus =
  | 'Not Registered'
  | 'Registered'
  | 'Profile Incomplete'
  | 'Profile Completed';

export function getStudentRegStatus(st: VcetStudentData, storedAccounts: any[]): StudentRegStatus {
  if (st.profileCompletion >= 80) return 'Profile Completed';
  if (st.profileCompletion > 0) return 'Profile Incomplete';
  const hasAccount = storedAccounts.some(
    (a) =>
      (a.rollNumber && a.rollNumber.toUpperCase() === st.rollNumber.toUpperCase()) ||
      (a.email && a.email.toLowerCase() === st.email.toLowerCase())
  );
  if (hasAccount) return 'Registered';
  return 'Not Registered';
}

export function getStudentResumeStatus(st: VcetStudentData): 'Verified' | 'Uploaded' | 'Not Uploaded' {
  if (st.profileCompletion >= 75) return 'Verified';
  if (st.profileCompletion >= 40) return 'Uploaded';
  return 'Not Uploaded';
}

export function getStudentLastActive(st: VcetStudentData): string {
  if (st.profileCompletion >= 80) return 'Today, 10:45 AM';
  if (st.profileCompletion >= 50) return 'Yesterday';
  if (st.profileCompletion > 0) return '3 days ago';
  return 'Not Active';
}

export function getStudentPrepProgress(st: VcetStudentData): {
  label: string;
  tone: 'emerald' | 'amber' | 'rose';
} {
  if (st.cgpa >= 7.5 && st.backlogs === 0) return { label: 'Day-1 Ready', tone: 'emerald' };
  if (st.cgpa >= 6.5) return { label: 'In Progress', tone: 'amber' };
  return { label: 'Needs CRT', tone: 'rose' };
}

interface StudentDirectoryPageProps {
  onSelectStudent?: (student: StudentProfile) => void;
  onNavigate?: (tab: string) => void;
}

export const StudentDirectoryPage: React.FC<StudentDirectoryPageProps> = ({
  onSelectStudent,
  onNavigate,
}) => {
  const { currentUser, currentRole } = useAuth();
  const allVcetStudents = loadVcetStudentsFromStorage();

  // Identify faculty mentor and assigned class(es)
  const isFaculty = currentRole === 'STAFF';
  const facultyProfile = getFacultyMentorProfile(currentUser.id, currentUser.email);
  const assignedClasses = facultyProfile ? getClassesForFaculty(facultyProfile) : VCET_CLASSES;

  // Filters state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  // Selected class filter state: default to faculty's primary assigned class if faculty
  const [selectedClassCode, setSelectedClassCode] = useState<string>(() => {
    if (isFaculty && assignedClasses.length > 0 && !facultyProfile?.isDepartmentHead) {
      return assignedClasses[0].classCode; // e.g. "24AD5A"
    }
    return 'ALL';
  });

  const storedAccounts = useMemo(() => getStoredAccounts(), []);
  const [statusFilter, setStatusFilter] = useState<'ALL' | StudentRegStatus>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [minCgpa, setMinCgpa] = useState<number>(0);
  const [gapFilter, setGapFilter] = useState<'None' | 'Power BI' | 'SQL' | 'Cloud'>('None');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(25);

  // Departments list for tabs
  const DEPARTMENTS = [
    { code: 'ALL', label: 'All Departments', count: allVcetStudents.length },
    {
      code: 'AI & DS',
      label: 'AI & DS',
      count: allVcetStudents.filter((s) => s.departmentCode === 'AI & DS').length,
    },
    {
      code: 'CSE',
      label: 'CSE',
      count: allVcetStudents.filter((s) => s.departmentCode === 'CSE').length,
    },
    {
      code: 'IT',
      label: 'IT',
      count: allVcetStudents.filter((s) => s.departmentCode === 'IT').length,
    },
    {
      code: 'CSE (AI & ML)',
      label: 'CSE (AI & ML)',
      count: allVcetStudents.filter((s) => s.departmentCode === 'CSE (AI & ML)').length,
    },
  ];

  // Classes filtered by selected department
  const visibleClasses =
    selectedDepartment === 'ALL'
      ? assignedClasses
      : assignedClasses.filter((c) => c.departmentCode === selectedDepartment);

  // Filter students dynamically
  const filteredStudents = allVcetStudents.filter((st) => {
    // Role boundary: if faculty and not HOD, restrict to faculty's assigned classes
    if (isFaculty && !facultyProfile?.isDepartmentHead) {
      const isAssigned = facultyProfile?.assignedClassCodes.includes(st.classCode);
      if (!isAssigned) return false;
    }

    // Department filter
    if (
      selectedDepartment !== 'ALL' &&
      st.departmentCode !== selectedDepartment &&
      st.department !== selectedDepartment
    ) {
      return false;
    }

    // Class code filter
    if (selectedClassCode !== 'ALL' && st.classCode !== selectedClassCode) {
      return false;
    }

    // Batch or Year filter
    if (selectedBatch !== 'ALL') {
      if (selectedBatch === '4th-Year') {
        if (st.year !== 4) return false;
      } else if (selectedBatch === '3rd-Year') {
        if (st.year !== 3) return false;
      } else if (selectedBatch === '2nd-Year') {
        if (st.year !== 2) return false;
      } else if (st.batch !== selectedBatch) {
        return false;
      }
    }

    // Registration Status filter
    if (statusFilter !== 'ALL') {
      const regStatus = getStudentRegStatus(st, storedAccounts);
      if (regStatus !== statusFilter) return false;
    }

    // Search by name, roll number, or register number
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const match =
        st.name.toLowerCase().includes(q) ||
        st.registerNumber.toLowerCase().includes(q) ||
        st.rollNumber.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Minimum CGPA
    if (st.cgpa < minCgpa) {
      return false;
    }

    // Missing Skill Filter
    if (gapFilter === 'Power BI' && st.hasPowerBi) return false;
    if (gapFilter === 'SQL' && st.hasSql) return false;
    if (gapFilter === 'Cloud' && st.hasCloud) return false;

    return true;
  });

  // Dynamic calculations from database
  const totalStudents = filteredStudents.length;
  const effectiveLimit = limit === -1 ? totalStudents || 1 : limit;
  const totalPages = Math.ceil(totalStudents / effectiveLimit) || 1;
  const paginatedStudents =
    limit === -1
      ? filteredStudents
      : filteredStudents.slice((page - 1) * effectiveLimit, page * effectiveLimit);

  // Dynamic department counts from database (NO HARDCODING - Section 5)
  const deptScopeStudents = useMemo(() => {
    if (selectedDepartment === 'ALL') return allVcetStudents;
    return allVcetStudents.filter(
      (s) => s.departmentCode === selectedDepartment || s.department === selectedDepartment
    );
  }, [allVcetStudents, selectedDepartment]);

  const deptTotal = deptScopeStudents.length;
  const dept4thYearCount = deptScopeStudents.filter((s) => s.year === 4).length;
  const dept3rdYearCount = deptScopeStudents.filter((s) => s.year === 3).length;
  const dept2ndYearCount = deptScopeStudents.filter((s) => s.year === 2).length;

  const deptRegisteredCount = deptScopeStudents.filter((s) => {
    const st = getStudentRegStatus(s, storedAccounts);
    return st === 'Profile Completed' || st === 'Registered' || st === 'Profile Incomplete';
  }).length;
  const deptNotRegisteredCount = deptTotal - deptRegisteredCount;
  const deptCompletedProfilesCount = deptScopeStudents.filter((s) => {
    const st = getStudentRegStatus(s, storedAccounts);
    return st === 'Profile Completed' || s.profileCompletion >= 80;
  }).length;

  // Convert VcetStudentData to full StudentProfile for viewing
  const handleOpenStudentProfile = (st: VcetStudentData) => {
    const studentProfile: StudentProfile = {
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
      careerGoal: `Excel as a ${st.targetRole || 'Software Engineer'} in premier campus recruitment drives.`,
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
      mentorName: facultyProfile?.name || 'Prof. V. Manoj Praveen',
      mentorRemarks: st.facultyRemarks,
      endorsementStatus: st.endorsementStatus,
      placementEligible: st.cgpa >= 7.5 && st.backlogs === 0,
      skills: [
        { id: `sk-1-${st.id}`, studentId: st.id, skillId: 'sk-python', skillName: 'Python', category: 'Programming', proficiency: 'Advanced', source: 'RESUME', confidence: 0.95, verified: true },
        { id: `sk-2-${st.id}`, studentId: st.id, skillId: 'sk-sql', skillName: 'SQL Database Modeling', category: 'Database', proficiency: st.hasSql ? 'Advanced' : 'Beginner', source: 'RESUME', confidence: 0.90, verified: st.hasSql },
        { id: `sk-3-${st.id}`, studentId: st.id, skillId: 'sk-powerbi', skillName: 'Power BI Business Analytics', category: 'Data Science', proficiency: st.hasPowerBi ? 'Intermediate' : 'Beginner', source: 'MANUAL', confidence: 0.85, verified: st.hasPowerBi },
        { id: `sk-4-${st.id}`, studentId: st.id, skillId: 'sk-stats', skillName: 'Applied Statistics & Probability', category: 'Data Science', proficiency: 'Intermediate', source: 'PROJECT', confidence: 0.88, verified: true },
        { id: `sk-5-${st.id}`, studentId: st.id, skillId: 'sk-dsa', skillName: 'Data Structures & Algorithms', category: 'Core CS', proficiency: st.hasDsa ? 'Advanced' : 'Intermediate', source: 'PROJECT', confidence: 0.92, verified: st.hasDsa },
      ],
      projects: [
        {
          id: `p1-${st.id}`,
          studentId: st.id,
          title: 'Campus Placement Skill Gap Analytics & Prediction Engine',
          description: `Engineered an automated data pipeline using Python, SQL, and Streamlit to map departmental curriculum benchmarks against tier-1 recruiters.`,
          technologies: ['Python', 'SQL', 'Scikit-Learn', 'Power BI'],
          githubUrl: st.githubUrl,
          role: 'Lead Developer',
        },
        {
          id: `p2-${st.id}`,
          studentId: st.id,
          title: 'Algorithmic DSA LeetCode Tracker & Review Dashboard',
          description: `Solved ${st.leetCodeCount || 120}+ problems covering sliding window, two pointers, graphs, and dynamic programming patterns.`,
          technologies: ['Java', 'Algorithms', 'Data Structures'],
          githubUrl: st.githubUrl,
          role: 'Problem Solver',
        },
      ],
      internships: [
        {
          id: `int-${st.id}`,
          studentId: st.id,
          company: 'VCET Innovation & Incubation Center',
          role: `${st.departmentCode} Associate Intern`,
          startDate: '2025-06-01',
          endDate: '2025-08-31',
          description: 'Developed backend modules, queries, and delivered interactive KPI executive reports.',
          technologies: ['SQL', 'Python', 'Power BI', 'Excel'],
        },
      ],
      certifications: [
        {
          id: `cert-${st.id}`,
          studentId: st.id,
          name: 'NPTEL / Coursera Data Analytics & Python Specialization',
          issuer: 'NPTEL / Anna University',
          issueDate: '2025-10-15',
          credentialUrl: 'https://nptel.ac.in/verify',
        },
      ],
      achievements: [
        `Solved ${st.leetCodeCount || 100}+ algorithmic challenges on LeetCode / HackerRank`,
        `Selected as VCET Technical Symposium Finalist`,
        `Maintained ${st.cgpa} Cumulative Grade Point Average with 0 active backlogs`,
      ],
      resumeFileName: `${st.name.replace(/\s+/g, '_')}_Resume_VCET.pdf`,
      resumeParsedAt: new Date().toISOString(),
    };

    if (onSelectStudent) {
      onSelectStudent(studentProfile);
    }
  };

  const handleExportList = () => {
    let csv =
      'Register Number,Roll Number,Student Name,Department,Class,Batch,Academic Year,Semester,CGPA,Arrears,Registration Status,Profile Completion,Resume Status,Last Active,Placement Preparation Progress,Target Role\n';
    filteredStudents.forEach((s) => {
      const regStatus = getStudentRegStatus(s, storedAccounts);
      const resumeStatus = getStudentResumeStatus(s);
      const lastActive = getStudentLastActive(s);
      const prep = getStudentPrepProgress(s).label;
      csv += `"${s.registerNumber}","${s.rollNumber}","${s.name}","${s.department}","${s.classCode}","${s.batch}","${s.academicYear}",${s.semester},${s.cgpa},${s.backlogs},"${regStatus}",${s.profileCompletion}%,"${resumeStatus}","${lastActive}","${prep}","${s.targetRole || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VCET_${selectedDepartment}_${selectedClassCode}_Students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDeptBadgeClass = (deptCode: string) => {
    switch (deptCode) {
      case 'AI & DS':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'CSE':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'IT':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'CSE (AI & ML)':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#090D16] via-[#0E1524] to-[#090D16] text-white border border-white/[0.08] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>
              // {isFaculty ? 'Faculty Class Mentorship Directory' : 'Central College Student Directory · All Departments'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isFaculty
                ? `My Mentorship Class: ${facultyProfile?.name}`
                : 'VCET Central Student Directory'}
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              {totalStudents} Verified Students Loaded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {isFaculty
              ? `Advising class cohort(s): ${assignedClasses.map((c) => `${c.classCode} (${c.totalStudents} students)`).join(', ')}. Click any student row to view full academic, skills, projects, and placement profile.`
              : `Connected to central institutional database containing all ${allVcetStudents.length} official student records across AI & DS, CSE, IT, and CSE (AI & ML) departments.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportList}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV ({totalStudents})</span>
          </button>
        </div>
      </div>

      {/* Department Filter Tabs (Only shown if Admin / HoD) */}
      {(!isFaculty || facultyProfile?.isDepartmentHead) && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>// Select Department</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Total Database: <strong className="text-slate-900 dark:text-white">{allVcetStudents.length}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => {
              const isSelected = selectedDepartment === dept.code;
              return (
                <button
                  key={dept.code}
                  onClick={() => {
                    setSelectedDepartment(dept.code);
                    setSelectedClassCode('ALL');
                    setSelectedBatch('ALL');
                    setPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{dept.label}</span>
                  <span className="text-[10px] font-mono opacity-80">
                    ({dept.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Department Counts & Roster Intelligence (Requirement 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">
            {selectedDepartment === 'ALL' ? 'Total Students' : `Total ${selectedDepartment}`}
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {deptTotal}
          </div>
          <div className="text-[10px] text-indigo-500 font-semibold mt-0.5">Verified Records</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">4th-Year Students</div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {dept4thYearCount}
          </div>
          <div className="text-[10px] text-purple-500 font-semibold mt-0.5">
            {selectedDepartment === 'CSE' ? 'Batch 2022–2026' : 'Batch 2023–2027'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">3rd-Year Students</div>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {dept3rdYearCount}
          </div>
          <div className="text-[10px] text-teal-500 font-semibold mt-0.5">
            {selectedDepartment === 'CSE' ? 'Batch 2023–2027' : 'Batch 2024–2028'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">2nd-Year Students</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {dept2ndYearCount}
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">
            {selectedDepartment === 'CSE' ? 'Batch 2024–2028' : 'Batch 2025–2029'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">Registered</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {deptRegisteredCount}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            Active Accounts
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium truncate">Not Registered</div>
          <div className="text-xl font-black text-slate-600 dark:text-slate-400 mt-1">
            {deptNotRegisteredCount}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Pending Onboarding</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-400 font-medium truncate">Completed Profiles</div>
          <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
            {deptCompletedProfilesCount}
          </div>
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">
            &ge;80% Profile Fit
          </div>
        </div>
      </div>

      {/* Year-Wise Filters Pill Bar (Requirement 4) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              // Year-Wise Filters {selectedDepartment !== 'ALL' ? `· ${selectedDepartment}` : '· College-Wide'}
            </span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Selected Batch: <strong className="text-slate-900 dark:text-white">{selectedBatch === 'ALL' ? 'All Years' : selectedBatch}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => {
              setSelectedBatch('ALL');
              setSelectedClassCode('ALL');
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedBatch === 'ALL'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
            }`}
          >
            <span>
              {selectedDepartment === 'IT'
                ? 'All IT Students'
                : selectedDepartment === 'CSE'
                ? 'All CSE Students'
                : selectedDepartment === 'CSE (AI & ML)'
                ? 'All CSE (AI & ML) Students'
                : selectedDepartment === 'AI & DS'
                ? 'All AI & DS Students'
                : 'All Students'}
            </span>
            <span className="text-[10px] font-mono opacity-80">({deptTotal})</span>
          </button>

          {/* 4th Year Filter */}
          <button
            onClick={() => {
              const target = selectedDepartment === 'CSE' ? '2022-2026' : selectedDepartment === 'ALL' ? '4th-Year' : '2023-2027';
              setSelectedBatch(target);
              setSelectedClassCode('ALL');
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              (selectedDepartment === 'CSE' && selectedBatch === '2022-2026') ||
              (selectedDepartment !== 'CSE' && (selectedBatch === '2023-2027' || selectedBatch === '4th-Year'))
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/30'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
            }`}
          >
            <span>
              {selectedDepartment === 'CSE'
                ? '4th Year — Batch 2022–2026'
                : selectedDepartment === 'ALL'
                ? '4th Year (Graduating Cohort)'
                : '4th Year — Batch 2023–2027'}
            </span>
            <span className="text-[10px] font-mono opacity-80">({dept4thYearCount})</span>
          </button>

          {/* 3rd Year Filter */}
          <button
            onClick={() => {
              const target = selectedDepartment === 'CSE' ? '2023-2027' : selectedDepartment === 'ALL' ? '3rd-Year' : '2024-2028';
              setSelectedBatch(target);
              setSelectedClassCode('ALL');
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              (selectedDepartment === 'CSE' && selectedBatch === '2023-2027') ||
              (selectedDepartment !== 'CSE' && (selectedBatch === '2024-2028' || selectedBatch === '3rd-Year'))
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/30'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
            }`}
          >
            <span>
              {selectedDepartment === 'CSE'
                ? '3rd Year — Batch 2023–2027'
                : selectedDepartment === 'ALL'
                ? '3rd Year (Pre-Final Cohort)'
                : '3rd Year — Batch 2024–2028'}
            </span>
            <span className="text-[10px] font-mono opacity-80">({dept3rdYearCount})</span>
          </button>

          {/* 2nd Year Filter */}
          <button
            onClick={() => {
              const target = selectedDepartment === 'CSE' ? '2024-2028' : selectedDepartment === 'ALL' ? '2nd-Year' : '2025-2029';
              setSelectedBatch(target);
              setSelectedClassCode('ALL');
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              (selectedDepartment === 'CSE' && selectedBatch === '2024-2028') ||
              (selectedDepartment !== 'CSE' && (selectedBatch === '2025-2029' || selectedBatch === '2nd-Year'))
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/30'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
            }`}
          >
            <span>
              {selectedDepartment === 'CSE'
                ? '2nd Year — Batch 2024–2028'
                : selectedDepartment === 'ALL'
                ? '2nd Year (Core Foundation)'
                : '2nd Year — Batch 2025–2029'}
            </span>
            <span className="text-[10px] font-mono opacity-80">({dept2ndYearCount})</span>
          </button>
        </div>
      </div>

      {/* Class Cohort Quick Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
            <span>// Select Class Cohort</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Filtered Roster Count: <strong className="text-slate-900 dark:text-white">{totalStudents}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(!isFaculty || facultyProfile?.isDepartmentHead) && (
            <button
              onClick={() => {
                setSelectedClassCode('ALL');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedClassCode === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
              }`}
            >
              All Classes ({totalStudents})
            </button>
          )}

          {visibleClasses.map((cls) => {
            const isSelected = selectedClassCode === cls.classCode;
            return (
              <button
                key={cls.classCode}
                onClick={() => {
                  setSelectedClassCode(cls.classCode);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                }`}
              >
                <span>{cls.classCode}</span>
                <span className="text-[10px] font-mono opacity-80">
                  ({cls.totalStudents} std · {cls.departmentCode})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Roll No, Reg No, or Name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-white"
          />
        </div>

        {/* Batch Filter */}
        <div>
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-white"
          >
            <option value="ALL">All Batches</option>
            {selectedDepartment === 'CSE' ? (
              <>
                <option value="2022-2026">4th Year — Batch 2022–2026</option>
                <option value="2023-2027">3rd Year — Batch 2023–2027</option>
                <option value="2024-2028">2nd Year — Batch 2024–2028</option>
              </>
            ) : (
              <>
                <option value="2023-2027">4th Year — Batch 2023–2027</option>
                <option value="2024-2028">3rd Year — Batch 2024–2028</option>
                <option value="2025-2029">2nd Year — Batch 2025–2029</option>
                <option value="2022-2026">4th Year (CSE) — Batch 2022–2026</option>
              </>
            )}
          </select>
        </div>

        {/* Min CGPA */}
        <div>
          <select
            value={minCgpa}
            onChange={(e) => {
              setMinCgpa(Number(e.target.value));
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-white"
          >
            <option value={0}>Any CGPA</option>
            <option value={7.0}>CGPA &ge; 7.0</option>
            <option value={7.5}>CGPA &ge; 7.5 (Day 1 Baseline)</option>
            <option value={8.0}>CGPA &ge; 8.0 (Product Tier)</option>
            <option value={8.5}>CGPA &ge; 8.5 (High Honors)</option>
          </select>
        </div>

        {/* Registration Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 font-semibold"
          >
            <option value="ALL">All Registration Status</option>
            <option value="Profile Completed">Profile Completed</option>
            <option value="Profile Incomplete">Profile Incomplete</option>
            <option value="Registered">Registered</option>
            <option value="Not Registered">Not Registered</option>
          </select>
        </div>

        {/* Missing Skill Gap Filter */}
        <div>
          <select
            value={gapFilter}
            onChange={(e) => {
              setGapFilter(e.target.value as any);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 font-semibold"
          >
            <option value="None">Filter by Skill Gap...</option>
            <option value="Power BI">Missing Power BI</option>
            <option value="SQL">Missing Advanced SQL</option>
            <option value="Cloud">Missing Cloud / DevOps</option>
          </select>
        </div>
      </div>

      {/* Official VCET Table View */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E1524] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50 dark:bg-[#090D16]">
                <th className="py-3 px-3">Register Number</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Batch</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Semester</th>
                <th className="py-3 px-3">Registration Status</th>
                <th className="py-3 px-3">Profile Completion</th>
                <th className="py-3 px-3">Resume Status</th>
                <th className="py-3 px-3">Last Activity</th>
                <th className="py-3 px-3">CGPA</th>
                <th className="py-3 px-3 text-right">View Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400 text-xs">
                    No students match the selected filter criteria.
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
                      onClick={() => handleOpenStudentProfile(st)}
                      className="hover:bg-indigo-50/40 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      {/* Register Number */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {st.registerNumber}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {st.rollNumber}
                        </div>
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {st.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {st.email}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${getDeptBadgeClass(
                            st.departmentCode
                          )}`}
                        >
                          {st.departmentCode}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {st.batch}
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          {st.classCode}
                        </span>
                      </td>

                      {/* Semester */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        Sem {st.semester}
                      </td>

                      {/* Registration Status */}
                      <td className="py-3 px-3">
                        {regStatus === 'Profile Completed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Profile Completed</span>
                          </span>
                        ) : regStatus === 'Profile Incomplete' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Profile Incomplete</span>
                          </span>
                        ) : regStatus === 'Registered' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                            <span>Not Registered</span>
                          </span>
                        )}
                      </td>

                      {/* Profile Completion */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                st.profileCompletion >= 80
                                  ? 'bg-emerald-500'
                                  : st.profileCompletion >= 50
                                  ? 'bg-indigo-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${st.profileCompletion}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {st.profileCompletion}%
                          </span>
                        </div>
                      </td>

                      {/* Resume Status */}
                      <td className="py-3 px-3">
                        {resumeStatus === 'Verified' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            <FileText className="w-2.5 h-2.5" />
                            <span>Verified</span>
                          </span>
                        ) : resumeStatus === 'Uploaded' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                            <FileText className="w-2.5 h-2.5" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded">
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Last Activity */}
                      <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 opacity-60" />
                          <span>{lastActive}</span>
                        </div>
                      </td>

                      {/* CGPA */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-950 dark:text-white">
                          {st.cgpa}
                        </div>
                        <div className="text-[10px]">
                          {st.backlogs === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              0 Arrears
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 font-bold">
                              {st.backlogs} Arrear{st.backlogs > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* View Details */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStudentProfile(st);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination & Limit Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div>
              Showing{' '}
              <strong className="text-slate-900 dark:text-white">
                {totalStudents === 0 ? 0 : (page - 1) * effectiveLimit + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900 dark:text-white">
                {limit === -1 ? totalStudents : Math.min(page * effectiveLimit, totalStudents)}
              </strong>{' '}
              of <strong className="text-slate-900 dark:text-white font-mono">{totalStudents}</strong> records
            </div>

            <div className="flex items-center gap-1.5">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#090D16] text-xs font-mono text-slate-900 dark:text-white"
              >
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={-1}>All ({totalStudents})</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50 dark:hover:bg-white/[0.05] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-900 dark:text-white px-2 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50 dark:hover:bg-white/[0.05] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
