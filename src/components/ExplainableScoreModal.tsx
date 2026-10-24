import React from 'react';
import { X, HelpCircle, CheckCircle2, AlertTriangle, Layers, Percent, Compass, ShieldAlert } from 'lucide-react';
import { MatchScoreBreakdown } from '../types';

interface ExplainableScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: MatchScoreBreakdown;
  jobTitle: string;
}

export const ExplainableScoreModal: React.FC<ExplainableScoreModalProps> = ({
  isOpen,
  onClose,
  breakdown,
  jobTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                How is your Skill Alignment Score calculated?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluation for: <span className="font-semibold text-slate-700 dark:text-slate-300">{jobTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Score Summary Banner */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50 dark:from-slate-800 dark:to-slate-800/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              Overall Alignment Score
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {breakdown.overallScore}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {breakdown.explanation}
            </p>
          </div>
          <div className="text-right space-y-1 text-xs">
            <div className="flex items-center gap-2 justify-end text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{breakdown.matchedCount} Matched</span>
            </div>
            <div className="flex items-center gap-2 justify-end text-amber-600 dark:text-amber-400 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>{breakdown.partialCount} Partial</span>
            </div>
            <div className="flex items-center gap-2 justify-end text-rose-600 dark:text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1"></span>
              <span>{breakdown.missingCount} Missing</span>
            </div>
          </div>
        </div>

        {/* 4 Formula Factors */}
        <div className="mt-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Algorithmic Formula (100-Point Weighted Breakdown)
          </h4>

          {/* Factor 1: Skill Coverage (40 pts) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>1. Skill Coverage Factor (40% Weight)</span>
              </div>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {breakdown.skillCoverageScore} / 40 pts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Calculates how many required skills you possess. Matched skills grant 100% credit, while partial skills provide 50% credit relative to the total requirement count.
            </p>
          </div>

          {/* Factor 2: Importance Weighting (30 pts) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>2. Requirement Importance Weight (30% Weight)</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {breakdown.importanceWeightScore} / 30 pts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Differentiates between REQUIRED core competencies (full weight) and PREFERRED or nice-to-have supporting skills.
            </p>
          </div>

          {/* Factor 3: Proficiency Alignment (20 pts) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. Proficiency Alignment (20% Weight)</span>
              </div>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {breakdown.proficiencyAlignmentScore} / 20 pts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Compares your verified proficiency (Beginner, Intermediate, Advanced) against the job's minimum expected level.
            </p>
          </div>

          {/* Factor 4: Semantic Similarity (10 pts) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>4. Semantic & Alias Matching (10% Weight)</span>
              </div>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {breakdown.semanticSimilarityScore} / 10 pts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Recognizes synonyms and related ontology (e.g. "Microsoft Power BI" ~ "Power BI", "Scikit-Learn" ~ "Machine Learning").
            </p>
          </div>
        </div>

        {/* Ethical Disclaimer */}
        <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal">
            <strong>Important Institutional Notice:</strong> This score represents profile skill alignment based on recorded evidence. It is strictly NOT a statistical "probability of getting placed" or guarantee of hiring. Interview outcomes depend on technical performance, coding rounds, and faculty clearance.
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
