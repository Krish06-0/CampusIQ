import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileCode2,
  CheckCircle2,
  Clock,
  Briefcase,
  BookOpen,
  Info,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStoredJobs } from '../services/storageService';
import { analyzeSkillGaps } from '../services/nlpEngine';
import { ExplainableScoreModal } from '../components/ExplainableScoreModal';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentStudent } = useAuth();
  const jobs = getStoredJobs();
  const targetJob = jobs[0]; // Tiger Analytics by default

  const analysis = analyzeSkillGaps(currentStudent, targetJob);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  if (!currentStudent) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Profile Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No profile record is linked to this authenticated session. Please sign in with your verified institutional roll number.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner (AfterNow CloudZero Theme) */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#090D16] via-[#0E1524] to-[#090D16] text-white shadow-xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>// CANDIDATE TELEMETRY · ROLL: {currentStudent.registerNumber || '22AIDS014'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hello, {currentStudent.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Your placement preparation overview for {currentStudent.departmentName} (Batch {currentStudent.batch}). Target Role: <span className="text-white font-semibold">{currentStudent.targetRole || 'Data Analyst'}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('skill-gap')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-md transition-all cursor-pointer"
            >
              <span>Analyze Target Fit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('resume-builder')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all cursor-pointer"
            >
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span>Resume Builder &amp; ATS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Profile Completion */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Profile Completion</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {currentStudent.profileCompletion}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all"
              style={{ width: `${currentStudent.profileCompletion}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Verified CGPA: {currentStudent.cgpa} / 10.0
          </p>
        </div>

        {/* Card 2: Skill Alignment */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Skill Alignment</span>
            <button
              onClick={() => setShowFormulaModal(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 text-[11px]"
            >
              <Info className="w-3.5 h-3.5" />
              <span>How?</span>
            </button>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-baseline gap-2">
            <span>{analysis.matchScore.overallScore}%</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {analysis.matchScore.matchedCount} matched
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${analysis.matchScore.overallScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            Target: {targetJob.companyName}
          </p>
        </div>

        {/* Card 3: Identified Gaps */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Identified Skill Gaps</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {analysis.matchScore.missingCount + analysis.matchScore.partialCount} Gaps
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1">
            <span className="font-semibold text-rose-500">{analysis.matchScore.missingCount} Missing</span>
            <span>•</span>
            <span className="font-semibold text-amber-500">{analysis.matchScore.partialCount} Partial</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Top: Power BI, Statistics, Excel</p>
        </div>

        {/* Card 4: Roadmap Progress */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>6-Week Roadmap</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Week 2 of 6
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '33%' }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Active: SQL Joins & Window Functions</p>
        </div>
      </div>

      {/* Main Grid: Realistic Hero Dashboard Preview & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Target Role Alignment Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Target Opportunity Alignment: {targetJob.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {targetJob.companyName} • {targetJob.location} • Package: {targetJob.salaryPackage}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-mono font-bold ${analysis.eligibility.isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {analysis.eligibility.isEligible ? '✓ ELIGIBLE CANDIDATE' : '✗ INELIGIBLE'}
                </span>
                <div className="text-[10px] text-slate-400 font-mono">0 ACTIVE BACKLOGS</div>
              </div>
            </div>

            {/* Visual alignment meter */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {analysis.matchScore.overallScore}%
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  Overall Alignment
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Weighted on 4 dimensions</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Matched Skills:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{analysis.matchScore.matchedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Partial Skills:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{analysis.matchScore.partialCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Missing Skills:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{analysis.matchScore.missingCount}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Roadmap Milestone
                </span>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    ████████░░ 78%
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-1">4 of 6 weeks remaining</span>
              </div>
            </div>

            {/* Missing skills prioritized list */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Top Priority Skill Gaps
              </h4>
              <div className="space-y-2">
                {analysis.gaps
                  .filter((g) => g.status === 'MISSING' || g.status === 'PARTIAL')
                  .slice(0, 3)
                  .map((gap) => (
                    <div
                      key={gap.skillName}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {gap.skillName}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              gap.priority === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {gap.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {gap.explanation}
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigate('roadmap')}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
                      >
                        Learn &rarr;
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Action Center */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Action Center</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Your next best preparation actions:
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <span className="flex h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Complete Power BI Module
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Watch Codebasics Power BI project & model sample retail dataset.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <span className="flex h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Practice SQL Subqueries & Joins
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Solve Joey Blue SQL queries and earn HackerRank intermediate certificate.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <span className="flex h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Update Resume in Resume Studio
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Generate an ATS-optimized single-column LaTeX resume for Overleaf.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <span className="flex h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  4
                </span>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Build Recommended Portfolio Project
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Project #9: Build Simple Database (SQLite clone in Python/C).
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('placement-guide')}
              className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Open College Placement Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formula Explanation Modal */}
      <ExplainableScoreModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        breakdown={analysis.matchScore}
        jobTitle={targetJob.title}
      />
    </div>
  );
};
