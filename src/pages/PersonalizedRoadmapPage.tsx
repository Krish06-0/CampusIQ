import React, { useState, useEffect } from 'react';
import {
  Milestone,
  CheckCircle2,
  Circle,
  ExternalLink,
  Clock,
  BookOpen,
  FolderGit2,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStoredJobs } from '../services/storageService';
import { analyzeSkillGaps } from '../services/nlpEngine';
import { generatePersonalizedRoadmap } from '../services/roadmapGenerator';
import { RoadmapWeeklyItem } from '../types';

export const PersonalizedRoadmapPage: React.FC = () => {
  const { currentStudent } = useAuth();
  const jobs = getStoredJobs();
  const targetJob = jobs[0];

  const analysis = analyzeSkillGaps(currentStudent, targetJob);
  const [weeklyItems, setWeeklyItems] = useState<RoadmapWeeklyItem[]>(() =>
    generatePersonalizedRoadmap(analysis.gaps, targetJob.title)
  );

  const [expandedWeek, setExpandedWeek] = useState<number>(1);

  const toggleTaskCompletion = (weekNumber: number, taskIdx: number) => {
    // For visual responsiveness
    setWeeklyItems((prev) =>
      prev.map((item) => {
        if (item.week === weekNumber) {
          return {
            ...item,
            completed: !item.completed,
          };
        }
        return item;
      })
    );
  };

  const completedWeeksCount = weeklyItems.filter((w) => w.completed).length;
  const progressPercent = Math.round((completedWeeksCount / weeklyItems.length) * 100);

  // Animated value for smooth progress ring fill
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimatedProgress(progressPercent);
      return;
    }

    let start: number | null = null;
    const duration = 1000; // 1s smooth fill animation
    const initialProgress = animatedProgress;
    const targetProgress = progressPercent;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progressRatio = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const current = Math.round(initialProgress + (targetProgress - initialProgress) * eased);
      setAnimatedProgress(current);

      if (progressRatio < 1) {
        requestAnimationFrame(step);
      }
    };

    const animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [progressPercent]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-indigo-500/20 group hover:border-indigo-400/40 transition-all duration-300">
        {/* Ambient lighting & subtle light sweep background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Text */}
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Personalized Placement Curriculum</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Your 6-Week Placement Roadmap
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Engineered to close your verified skill gaps for <span className="text-cyan-300 font-semibold">{targetJob.title}</span> using the verified college placement curriculum.
            </p>
          </div>

          {/* Right Progress Card - Glassmorphism & SVG Progress Ring */}
          <div className="flex items-center gap-5 p-4 sm:p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 shadow-2xl shrink-0 w-full sm:w-auto hover:border-indigo-400/40 transition-colors">
            {/* Circular Progress Ring */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-md animate-pulse" />
              
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
                <defs>
                  <linearGradient id="roadmapProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F0FF" />
                    <stop offset="50%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#FF007A" />
                  </linearGradient>
                </defs>
                {/* Track Circle */}
                <circle
                  cx="36"
                  cy="36"
                  r="28"
                  className="stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Animated Indicator Stroke */}
                <circle
                  cx="36"
                  cy="36"
                  r="28"
                  stroke="url(#roadmapProgressGradient)"
                  strokeWidth="6"
                  strokeDasharray="175.93"
                  strokeDashoffset={175.93 - (175.93 * animatedProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 ease-out"
                />
              </svg>

              {/* Centered Percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-violet-300">
                  {animatedProgress}%
                </span>
              </div>
            </div>

            {/* Progress Text Information */}
            <div className="text-left space-y-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                <span>Roadmap Progress</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white">
                {completedWeeksCount} of {weeklyItems.length} Weeks Done
              </div>
              {/* Horizontal mini bar */}
              <div className="w-32 sm:w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10 mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${animatedProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress timeline bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
          <span>Weekly Milestone Timeline</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{completedWeeksCount} Completed</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {weeklyItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setExpandedWeek(item.week)}
              className={`p-2 rounded-xl text-center border transition-all ${
                expandedWeek === item.week
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300'
                  : item.completed
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase font-semibold">Week {item.week}</div>
              <div className="text-xs truncate font-medium mt-0.5">{item.skillName}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Week by Week Modules Accordion */}
      <div className="space-y-4">
        {weeklyItems.map((week) => {
          const isExpanded = expandedWeek === week.week;

          return (
            <div
              key={week.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs'
              }`}
            >
              {/* Header Card */}
              <div
                onClick={() => setExpandedWeek(isExpanded ? 0 : week.week)}
                className="p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompletion(week.week, 0);
                    }}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                      week.completed
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {week.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Week {week.week} • {week.phase}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          week.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {week.priority} PRIORITY
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5">
                      {week.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="hidden sm:flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{week.estimatedHours} hrs</span>
                  </span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {isExpanded ? 'Collapse' : 'Details & Resources'}
                  </span>
                </div>
              </div>

              {/* Expanded Body */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-5 text-xs">
                  {/* Objective */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white">Week Objective: </span>
                    <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {week.objective}
                    </span>
                  </div>

                  {/* Practice Tasks */}
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">
                      Milestone Action Items & Practice
                    </h4>
                    <div className="space-y-2">
                      {week.practiceTasks.map((task, tIdx) => (
                        <label
                          key={tIdx}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={week.completed}
                            onChange={() => toggleTaskCompletion(week.week, tIdx)}
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {task}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* PDF Placement Guide Curated Learning Resources */}
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Curated Resources from College Placement Reference Guide</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {week.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/80 flex items-start justify-between gap-2 group transition-all"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {res.title}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                              <span>{res.provider}</span>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-medium">
                                {res.type}
                              </span>
                              {res.language && (
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                  {res.language}
                                </span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0 mt-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Connected Project Idea */}
                  {week.recommendedProjectIdea && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <FolderGit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div>
                          <div className="font-bold text-indigo-950 dark:text-indigo-200">
                            Recommended Project: {week.recommendedProjectIdea}
                          </div>
                          <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                            Building this project creates verifiable proof for technical interview rounds.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
