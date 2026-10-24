import React from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ExternalLink,
  History,
} from 'lucide-react';
import { calculateCollegeAnalytics, getStoredJobs } from '../services/storageService';

interface PlacementCellDashboardProps {
  onNavigate: (tab: string) => void;
}

export const PlacementCellDashboard: React.FC<PlacementCellDashboardProps> = ({ onNavigate }) => {
  const analytics = calculateCollegeAnalytics();
  const jobs = getStoredJobs();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner (AfterNow CloudZero Architecture) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#090D16] via-[#0E1524] to-[#090D16] text-white shadow-xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>// CENTRAL PLACEMENT CELL · RECRUITMENT COMMAND</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Placement Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Real-time aggregate data computed across <strong className="text-white">{analytics.totalStudents} registered students</strong> in Batch 2022-2026. Zero fabricated numbers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('login-activity')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-xs flex items-center gap-1.5 transition-all"
          >
            <History className="w-3.5 h-3.5" />
            <span>Login Activity Logs</span>
          </button>
          <button
            onClick={() => onNavigate('data-import')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Sync Google Sheet</span>
          </button>
          <button
            onClick={() => onNavigate('training-demand')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs flex items-center gap-1.5 transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Training Demand</span>
          </button>
        </div>
      </div>

      {/* 5 Executive Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-slate-400 font-medium">Total Registered</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {analytics.totalStudents}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">5 Engineering Depts</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-slate-400 font-medium">Active Profiles</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {analytics.activeProfilesCount}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">&ge;70% Completed</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-slate-400 font-medium">Students Analyzed</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {analytics.studentsAnalyzedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Evaluated against JDs</div>
        </div>

        <div
          onClick={() => onNavigate('placement-jobs')}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
        >
          <div className="text-slate-400 font-medium flex items-center justify-between">
            <span>Placement Drives</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {jobs.length}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
            Manage Campus Drives &rarr;
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-slate-400 font-medium">Batch Average CGPA</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {analytics.averageCgpa}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Baseline 7.5 requirement</div>
        </div>
      </div>

      {/* Main Grid: Training Demand & Readiness Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Institutional Skill Gaps (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Top College-Wide Skill Gaps (Training Demand)
              </h3>
              <p className="text-xs text-slate-400">
                Calculated from verified student skills across 500+ records
              </p>
            </div>
            <button
              onClick={() => onNavigate('training-demand')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {analytics.trainingDemand.map((td) => (
              <div
                key={td.skill}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{td.skill}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        td.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {td.priority}
                    </span>
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {td.missingStudentsCount} Students Missing
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full"
                    style={{
                      width: `${Math.round((td.missingStudentsCount / analytics.totalStudents) * 100)}%`,
                    }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Placement Recommendation: {td.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Placement Readiness Distribution (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Student Placement Readiness
              </h3>
              <p className="text-xs text-slate-400">
                Cohort alignment across registered campus drives
              </p>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              {analytics.readinessDistribution.map((rd, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{rd.range}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rd.count} ({rd.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        idx === 0
                          ? 'bg-emerald-500'
                          : idx === 1
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${rd.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Quick Actions for Placement Coordinators</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Filter students by department and missing skills in the 500+ Student Directory to schedule customized campus training sprints.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => onNavigate('student-directory')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Browse 500+ Directory</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
