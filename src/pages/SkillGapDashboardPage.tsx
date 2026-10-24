import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Briefcase,
  Layers,
  FileCode2,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStoredJobs } from '../services/storageService';
import { analyzeSkillGaps, extractSkillsFromText } from '../services/nlpEngine';
import { JobOpportunity, JobRequirement } from '../types';
import { ExplainableScoreModal } from '../components/ExplainableScoreModal';

interface SkillGapDashboardPageProps {
  selectedJobId?: string;
  onNavigate: (tab: string) => void;
}

export const SkillGapDashboardPage: React.FC<SkillGapDashboardPageProps> = ({
  selectedJobId,
  onNavigate,
}) => {
  const { currentStudent } = useAuth();
  const jobs = getStoredJobs();

  // Selected job or custom job
  const [activeJobId, setActiveJobId] = useState<string>(selectedJobId || jobs[0].id);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState('Custom Tech Role');
  const [customJobText, setCustomJobText] = useState('');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  React.useEffect(() => {
    if (selectedJobId) {
      setActiveJobId(selectedJobId);
      setIsCustomMode(false);
    }
  }, [selectedJobId]);

  // Active target job
  let targetJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  if (isCustomMode && customJobText.trim()) {
    const extractedSkills = extractSkillsFromText(customJobText);
    const reqs: JobRequirement[] = extractedSkills.map((es, idx) => ({
      id: `req-custom-${idx}`,
      skillName: es.skillName,
      normalizedName: es.skillName.toLowerCase(),
      category: es.category,
      importance: idx < 3 ? 'REQUIRED' : 'PREFERRED',
      minimumProficiency: idx === 0 ? 'Advanced' : 'Intermediate',
    }));

    targetJob = {
      id: 'job-custom',
      companyId: 'comp-custom',
      companyName: 'Custom Job Spec',
      companyLogo: '⚡',
      title: customJobTitle,
      description: customJobText.slice(0, 200),
      location: 'Campus Opportunity',
      employmentType: 'Full-Time',
      salaryPackage: 'Market Competitive',
      isProductBased: true,
      applicationDeadline: '2026-12-31',
      applicationUrl: '#',
      status: 'ACTIVE',
      eligibility: {
        minimumCgpa: 7.0,
        allowedDepartments: [],
        allowedBatches: [],
        backlogsAllowed: 0,
        graduationYear: 2026,
      },
      requirements: reqs.length > 0 ? reqs : jobs[0].requirements,
    };
  }

  const analysis = analyzeSkillGaps(currentStudent, targetJob);
  const { matchScore, gaps, radarCategories } = analysis;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Target Selector Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Evaluating Skill Fit For
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {targetJob.title} — {targetJob.companyName}
            </h2>
          </div>
        </div>

        {/* Job selector or paste button */}
        <div className="flex flex-wrap items-center gap-2">
          {!isCustomMode ? (
            <select
              value={activeJobId}
              onChange={(e) => setActiveJobId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.companyName}: {job.title}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setIsCustomMode(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Back to Campus Drives
            </button>
          )}

          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            {isCustomMode ? 'Using Custom Spec' : 'Paste Custom Job Spec'}
          </button>
        </div>
      </div>

      {/* Paste Custom JD Drawer if active */}
      {isCustomMode && (
        <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 dark:text-indigo-300">
            <FileText className="w-4 h-4" />
            <span>Option 2: Paste Job Description for Dynamic Semantic Extraction</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Role Title (e.g. Associate Data Scientist)"
              value={customJobTitle}
              onChange={(e) => setCustomJobTitle(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <div className="sm:col-span-2 text-xs text-slate-500 dark:text-slate-400 flex items-center">
              Our NLP pipeline extracts required skills, normalizes entities, and executes real-time semantic gap analysis.
            </div>
          </div>
          <textarea
            rows={4}
            placeholder="Paste complete job description requirements here (e.g. We are looking for proficiency in Python, SQL, Power BI, Statistics, Tableau...)"
            value={customJobText}
            onChange={(e) => setCustomJobText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* Top Analytical Banner: Circular Alignment Gauge & Radar Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Alignment Circular Chart Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center justify-center text-center relative">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowFormulaModal(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="How is this calculated?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Overall Skill Alignment
          </div>

          {/* Large Circular Gauge SVG */}
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-indigo-600 transition-all duration-700 ease-out"
                strokeWidth="10"
                strokeDasharray={`${matchScore.overallScore * 2.51} 251.2`}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {matchScore.overallScore}%
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                Alignment Index
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
            Calculated from your verified profile evidence and {targetJob.requirements.length} job requirements.
          </p>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>How is this calculated?</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Right 2 cols: Category Radar / Balance Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Category Proficiency Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Your verified capability (indigo) vs. Target job expectation (slate)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>You</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>Required</span>
              </span>
            </div>
          </div>

          {/* Bar comparisons per category */}
          <div className="space-y-3.5 pt-2">
            {radarCategories.map((rc) => (
              <div key={rc.category} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-800 dark:text-slate-200">{rc.category}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{rc.studentScore}%</span> vs {rc.requiredScore}% required
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex relative">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${rc.studentScore}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-slate-400 dark:bg-slate-500"
                    style={{ left: `${rc.requiredScore}%` }}
                    title={`Required: ${rc.requiredScore}%`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('roadmap')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Generate 6-Week Roadmap</span>
            </button>
            <button
              onClick={() => onNavigate('project-recs')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Recommend Target Projects</span>
            </button>
            <button
              onClick={() => onNavigate('resume-studio')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center gap-1.5 transition-colors"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Optimize Resume in Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deep Skill Comparison Table (Distinguishing Exact, Semantic, Partial, Missing) */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Skill-by-Skill Diagnostic Table
            </h3>
            <p className="text-xs text-slate-400">
              Granular breakdown distinguishing exact matches, semantic similarities, proficiency gaps, and missing competencies.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
              {matchScore.matchedCount} Matched
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-semibold">
              {matchScore.partialCount} Partial
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold">
              {matchScore.missingCount} Missing
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Competency</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Your Level</th>
                <th className="py-2.5 px-3">Required</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Algorithmic Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {gaps.map((gap) => {
                return (
                  <tr
                    key={gap.skillName}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {gap.skillName}
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                      {gap.category}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${
                        gap.studentLevel === 'None'
                          ? 'text-slate-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {gap.studentLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {gap.requiredLevel}
                    </td>
                    <td className="py-3 px-3">
                      {gap.status === 'MATCHED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>MATCHED</span>
                        </span>
                      )}
                      {gap.status === 'PARTIAL' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          <span>PARTIAL</span>
                        </span>
                      )}
                      {gap.status === 'MISSING' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <XCircle className="w-3 h-3" />
                          <span>MISSING</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          gap.priority === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : gap.priority === 'HIGH'
                            ? 'bg-amber-500 text-white'
                            : gap.priority === 'MEDIUM'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {gap.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px] max-w-sm leading-relaxed">
                      {gap.explanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Modal */}
      <ExplainableScoreModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        breakdown={matchScore}
        jobTitle={targetJob.title}
      />
    </div>
  );
};
