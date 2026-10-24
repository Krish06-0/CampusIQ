import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  TrendingUp,
  Award,
  Download,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Users,
  Layers,
  ArrowRight,
  PieChart,
} from 'lucide-react';
import { loadVcetStudentsFromStorage, VCET_CLASSES } from '../data/vcetStudentsData';
import { getStoredAccounts } from '../services/authSecurityService';
import { getStoredJobs } from '../services/storageService';

interface DeanPortalPageProps {
  onNavigate?: (tab: string) => void;
}

export const DeanPortalPage: React.FC<DeanPortalPageProps> = ({ onNavigate }) => {
  const allStudents = loadVcetStudentsFromStorage();
  const storedAccounts = getStoredAccounts();
  const drives = getStoredJobs();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Total metrics
  const totalStudents = allStudents.length;
  const registeredCount = allStudents.filter((st) => {
    return (
      st.profileCompletion > 0 ||
      storedAccounts.some(
        (a) =>
          (a.rollNumber && a.rollNumber.toUpperCase() === st.rollNumber.toUpperCase()) ||
          (a.email && a.email.toLowerCase() === st.email.toLowerCase())
      )
    );
  }).length;
  const registrationRate = totalStudents > 0 ? ((registeredCount / totalStudents) * 100).toFixed(1) : '0';

  const avgProfileCompletion =
    totalStudents > 0
      ? (allStudents.reduce((sum, s) => sum + s.profileCompletion, 0) / totalStudents).toFixed(1)
      : '0';

  const day1ReadyCount = allStudents.filter((s) => s.cgpa >= 7.5 && s.backlogs === 0).length;
  const day1ReadyRate = totalStudents > 0 ? ((day1ReadyCount / totalStudents) * 100).toFixed(1) : '0';

  const zeroBacklogCount = allStudents.filter((s) => s.backlogs === 0).length;
  const zeroBacklogRate = totalStudents > 0 ? ((zeroBacklogCount / totalStudents) * 100).toFixed(1) : '0';

  // Department analysis
  const deptList = ['AI & DS', 'CSE', 'IT', 'CSE (AI & ML)'];

  const deptMetrics = deptList.map((deptCode) => {
    const studentsInDept = allStudents.filter((s) => s.departmentCode === deptCode);
    const count = studentsInDept.length;
    const registered = studentsInDept.filter(
      (st) =>
        st.profileCompletion > 0 ||
        storedAccounts.some(
          (a) =>
            (a.rollNumber && a.rollNumber.toUpperCase() === st.rollNumber.toUpperCase()) ||
            (a.email && a.email.toLowerCase() === st.email.toLowerCase())
        )
    ).length;
    const regRate = count > 0 ? ((registered / count) * 100).toFixed(1) : '0';
    const avgCgpa =
      count > 0 ? (studentsInDept.reduce((sum, s) => sum + s.cgpa, 0) / count).toFixed(2) : '0.00';
    const day1Ready = studentsInDept.filter((s) => s.cgpa >= 7.5 && s.backlogs === 0).length;
    const day1Rate = count > 0 ? ((day1Ready / count) * 100).toFixed(1) : '0';
    const avgProfile =
      count > 0 ? (studentsInDept.reduce((sum, s) => sum + s.profileCompletion, 0) / count).toFixed(1) : '0';

    // Skill gaps
    const missingPowerBi = studentsInDept.filter((s) => !s.hasPowerBi).length;
    const missingSql = studentsInDept.filter((s) => !s.hasSql).length;
    const missingCloud = studentsInDept.filter((s) => !s.hasCloud).length;

    return {
      deptCode,
      totalStudents: count,
      registeredCount: registered,
      registrationRate: regRate,
      avgCgpa,
      day1ReadyCount: day1Ready,
      day1ReadyRate: day1Rate,
      avgProfileCompletion: avgProfile,
      missingPowerBi,
      missingSql,
      missingCloud,
    };
  });

  // Common skill gaps aggregated
  const totalMissingPowerBi = allStudents.filter((s) => !s.hasPowerBi).length;
  const totalMissingSql = allStudents.filter((s) => !s.hasSql).length;
  const totalMissingCloud = allStudents.filter((s) => !s.hasCloud).length;
  const totalMissingDsa = allStudents.filter((s) => !s.hasDsa).length;

  const trainingDemands = [
    {
      skill: 'Microsoft Power BI & Analytics',
      missingCount: totalMissingPowerBi,
      pct: ((totalMissingPowerBi / totalStudents) * 100).toFixed(1),
      priority: 'CRITICAL',
      recommendedAction: 'Organize 30-hour hands-on DAX & Data Modeling Bootcamp for Tier-1 Analyst Roles',
    },
    {
      skill: 'Advanced SQL & Data Modeling',
      missingCount: totalMissingSql,
      pct: ((totalMissingSql / totalStudents) * 100).toFixed(1),
      priority: 'HIGH',
      recommendedAction: 'Mandate LeetCode Database 50 & PostgreSQL schema query certification',
    },
    {
      skill: 'Cloud Infrastructure & AWS/GCP',
      missingCount: totalMissingCloud,
      pct: ((totalMissingCloud / totalStudents) * 100).toFixed(1),
      priority: 'HIGH',
      recommendedAction: 'Enroll in AWS Academy Cloud Practitioner / GCP Associate Cloud Engineer track',
    },
    {
      skill: 'Data Structures & Algorithms',
      missingCount: totalMissingDsa,
      pct: ((totalMissingDsa / totalStudents) * 100).toFixed(1),
      priority: 'MEDIUM',
      recommendedAction: 'Daily coding track on HackerRank / LeetCode blind 75 patterns',
    },
  ];

  // Export executive summary report
  const handleExportDeanReport = () => {
    let csv =
      'VCET PLACEMENT 2026 - DEAN & EXECUTIVE PLACEMENT AUDIT REPORT\n';
    csv += `Generated On: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    csv += `Total Enrolled Students: ${totalStudents}\n`;
    csv += `Institutional Registration Rate: ${registrationRate}%\n`;
    csv += `Day-1 Placement Readiness: ${day1ReadyRate}%\n`;
    csv += `Clean Arrears Rate: ${zeroBacklogRate}%\n\n`;

    csv += 'DEPARTMENT COMPARISON METRICS\n';
    csv += 'Department,Total Students,Registered,Registration Rate,Avg CGPA,Day-1 Ready,Day-1 Rate,Avg Profile %\n';
    deptMetrics.forEach((d) => {
      csv += `"${d.deptCode}",${d.totalStudents},${d.registeredCount},${d.registrationRate}%,${d.avgCgpa},${d.day1ReadyCount},${d.day1ReadyRate}%,${d.avgProfileCompletion}%\n`;
    });

    csv += '\nINSTITUTIONAL TRAINING DEMANDS & SKILL GAPS\n';
    csv += 'Skill Track,Impacted Students,Percentage,Priority,Action Recommended\n';
    trainingDemands.forEach((t) => {
      csv += `"${t.skill}",${t.missingCount},${t.pct}%,${t.priority},"${t.recommendedAction}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VCET_Dean_Executive_Placement_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Executive Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#070A11] via-[#0E1524] to-[#070A11] text-white shadow-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFD600] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#FFD600]" />
            <span>// OFFICE OF THE DEAN & PRINCIPAL · EXECUTIVE COCKPIT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Placement &amp; Academic Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            High-level executive overview across all departments: AI &amp; DS, CSE, IT, and CSE (AI &amp; ML).
            Aggregate telemetry computed in real time from verified student directory records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleExportDeanReport}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF007A] to-[#7928CA] hover:opacity-90 text-white shadow-lg shadow-[#FF007A]/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Official Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* 4 High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Enrolled Cohort</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalStudents}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Across 4 Engineering Depts &amp; 21 Classes
          </div>
        </div>

        {/* Institutional Registration Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Registration Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {registrationRate}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            <strong className="text-slate-900 dark:text-white">{registeredCount}</strong> active student accounts
          </div>
        </div>

        {/* Profile Completion Average */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Profile Completion</span>
            <PieChart className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
            {avgProfileCompletion}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Resume, skills &amp; project indexation
          </div>
        </div>

        {/* Day-1 Ready Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Day-1 Recruitment Ready</span>
            <Award className="w-4 h-4 text-[#FF007A]" />
          </div>
          <div className="text-3xl font-black text-[#FF007A]">
            {day1ReadyRate}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            <strong className="text-slate-900 dark:text-white">{day1ReadyCount}</strong> students &ge; 7.5 CGPA &amp; 0 backlogs
          </div>
        </div>
      </div>

      {/* Department Comparison & Registration Performance */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <div className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              <span>// Comparative Department Telemetry</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              Department-Wise Registration &amp; Academic Readiness Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Data aggregated from verified student directory records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50 dark:bg-[#090D16]">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Total Students</th>
                <th className="py-3 px-4">Registered Accounts</th>
                <th className="py-3 px-4">Registration Rate</th>
                <th className="py-3 px-4">Avg CGPA</th>
                <th className="py-3 px-4">Day-1 Ready</th>
                <th className="py-3 px-4">Readiness Rate</th>
                <th className="py-3 px-4">Avg Profile %</th>
                <th className="py-3 px-4 text-right">Top Skill Deficit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {deptMetrics.map((d) => (
                <tr key={d.deptCode} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    <span>{d.deptCode}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {d.totalStudents}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {d.registeredCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${d.registrationRate}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {d.registrationRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {d.avgCgpa}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {d.day1ReadyCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-[#FF007A]">
                      {d.day1ReadyRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {d.avgProfileCompletion}%
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                      Power BI ({d.missingPowerBi} missing)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Training Demand & Placement Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Institutional Training Demand & Common Skill Gaps (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <div className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>// Curriculum &amp; Training Intervention</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                College-Wide Common Skill Gaps &amp; Training Demand
              </h3>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('training-demand')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Calculator</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-3 pt-1">
            {trainingDemands.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] text-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{t.skill}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-black tracking-wider ${
                        t.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {t.missingCount} Students ({t.pct}%)
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Action:</span>
                  <span>{t.recommendedAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Placement Drives & Recruiter Summary (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>// Recruiter Landscape</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  Campus Placement Drive Summaries
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                {drives.length} Drives Listed
              </span>
            </div>

            <div className="space-y-3 pt-3">
              {drives.slice(0, 4).map((drv) => (
                <div
                  key={drv.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {drv.companyName}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {drv.salaryPackage || '₹8.5 – ₹10 LPA'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                    <span>{drv.title}</span>
                    <span className="font-mono">Min CGPA: {drv.eligibility?.minimumCgpa || 7.5}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Privacy Governance Banner */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Executive Privacy &amp; Governance Policy</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                In strict compliance with institutional guidelines, this Dean dashboard displays aggregate analytics by default. Individual student records remain protected under role-based faculty mentorship access boundaries.
              </p>
            </div>
          </div>

          {onNavigate && (
            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex justify-end">
              <button
                onClick={() => onNavigate('placement-jobs')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View All Placement Drives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
