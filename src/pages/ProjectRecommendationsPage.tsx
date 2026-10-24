import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  ExternalLink,
  Code,
  FolderGit2,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStoredJobs } from '../services/storageService';
import { analyzeSkillGaps } from '../services/nlpEngine';
import { getProjectRecommendationsForGaps } from '../services/roadmapGenerator';
import { BUILD_YOUR_OWN_X_PROJECTS } from '../data/placementGuideData';

import engineeringBannerImg from '../assets/images/engineering_projects_banner_1792675954039.jpg';

export const ProjectRecommendationsPage: React.FC = () => {
  const { currentStudent } = useAuth();
  const jobs = getStoredJobs();
  const targetJob = jobs[0];

  const analysis = analyzeSkillGaps(currentStudent, targetJob);
  const recommendedProjects = getProjectRecommendationsForGaps(analysis.gaps);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Data Engineering & Analytics',
    'Artificial Intelligence & Machine Learning',
    'Web Development & Networking',
    'Systems Programming & OS Concept',
    'IoT & Robotics',
  ];

  const filteredProjects = recommendedProjects.filter((p) => {
    if (activeCategory !== 'ALL' && p.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-indigo-500/30 shadow-2xl group">
        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={engineeringBannerImg}
            alt="Engineering Systems & AI Architecture"
            className="w-full h-full object-cover object-right opacity-30 mix-blend-luminosity scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
          />
          {/* Radial cyan & violet lighting overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-500/15 rounded-full blur-3xl" />
        </div>

        {/* Content Container (Split Layout) */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Text Content */}
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gap-Targeted Portfolio Builder</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Curated 34 Build-Your-Own-X Engineering Projects
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sourced directly from the College Placement Reference Guide. Building systems from scratch strengthens your core tech fundamentals and closes detected gaps in technical interview rounds.
            </p>
          </div>

          {/* Right Column: Visual Feature & Quality > Quantity Glass Card */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-4 shrink-0 w-full md:w-auto">
            {/* Visual Engineering Graphic Preview Card */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-950/40">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/30 shrink-0">
                <img
                  src={engineeringBannerImg}
                  alt="Architecture preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-cyan-300 tracking-wide uppercase">AI &amp; Systems Architecture</div>
                <div className="text-[10px] text-slate-400">34 Production Blueprints</div>
              </div>
            </div>

            {/* Existing Quality > Quantity Panel with Refined Glassmorphism */}
            <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 text-center text-xs shadow-xl min-w-[200px] hover:border-indigo-400/40 transition-colors">
              <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-violet-300 text-lg">
                Quality &gt; Quantity
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">2-3 end-to-end projects are enough</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
          >
            <div>
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Project #{project.number} {project.number === 3 ? '·' : '•'} {project.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {project.title}
                  </h3>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                    project.difficulty === 'Beginner'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : project.difficulty === 'Intermediate'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  }`}
                >
                  {project.difficulty}
                </span>
              </div>

              {/* Relevance reason callout */}
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                {project.relevanceReason}
              </p>

              {/* Stack & Skills Addressed */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Suggested Stack:
                  </span>
                  <span className={`font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[11px] ${project.number === 3 ? 'inline-block leading-relaxed' : ''}`}>
                    {project.suggestedStack}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Skills Developed ({project.skillsAddressed.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skillsAddressed.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-900/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Skills addressed: <strong className="text-slate-700 dark:text-slate-200">{project.skillsAddressed.length}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
