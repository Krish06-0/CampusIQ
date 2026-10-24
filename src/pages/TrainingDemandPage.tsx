import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { calculateCollegeAnalytics } from '../services/storageService';

export const TrainingDemandPage: React.FC = () => {
  const analytics = calculateCollegeAnalytics();
  const [scheduledWorkshops, setScheduledWorkshops] = useState([
    {
      id: 'ws-1',
      title: 'Power BI & DAX Executive Bootcamp',
      targetGap: 'Power BI & DAX Modeling',
      targetAudience: '280 Students lacking BI skills',
      instructor: 'Yogesh G (Data Analyst Lead) & Mr. V. Manoj Praveen',
      dates: 'Oct 18 - Oct 20, 2026',
      venue: 'AI & DS High Performance Computing Lab / Hybrid',
      status: 'SCHEDULED',
    },
    {
      id: 'ws-2',
      title: '9-Hour Advanced SQL & CTEs Marathon',
      targetGap: 'Advanced SQL & CTEs',
      targetAudience: '210 Students with SQL arrears/gaps',
      instructor: 'Gowtham M (Batch Lead)',
      dates: 'Oct 25, 2026',
      venue: 'CSE Central Seminar Hall',
      status: 'SCHEDULED',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newGap, setNewGap] = useState(analytics.trainingDemand[2]?.skill || 'Cloud Computing (AWS/GCP)');
  const [newDate, setNewDate] = useState('Nov 5, 2026');

  const handleScheduleWorkshop = () => {
    if (!newTitle.trim()) return;
    const item = analytics.trainingDemand.find((td) => td.skill === newGap);
    const count = item ? item.missingStudentsCount : 175;

    setScheduledWorkshops([
      ...scheduledWorkshops,
      {
        id: `ws-${Date.now()}`,
        title: newTitle.trim(),
        targetGap: newGap,
        targetAudience: `${count} Students with ${newGap} gaps`,
        instructor: 'Department Faculty & Industry Mentors',
        dates: newDate,
        venue: 'Campus Placement Training Center',
        status: 'SCHEDULED',
      },
    ]);
    setNewTitle('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Placement Cell Training Planning</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Institutional Training Demand Calculator
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Calculated directly from {analytics.totalStudents} verified student profiles. Identifies cohort skill deficits to schedule targeted campus training sprints.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-center text-xs">
          <div className="text-2xl font-black text-indigo-300">
            {analytics.trainingDemand[0]?.missingStudentsCount}
          </div>
          <div className="text-[11px] text-slate-300">Highest Training Demand</div>
          <div className="text-[10px] text-slate-400">Power BI &amp; DAX Modeling</div>
        </div>
      </div>

      {/* Training Demand Grid from actual DB records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {analytics.trainingDemand.map((td) => {
          const percent = Math.round((td.missingStudentsCount / analytics.totalStudents) * 100);

          return (
            <div
              key={td.skill}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {td.skill}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      td.priority === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {td.priority}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                    {td.missingStudentsCount}
                  </span>
                  <span className="text-xs text-slate-400">
                    {percent}% of cohort
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${percent}%` }} />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  <strong>Recommendation:</strong> {td.recommendation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Data source: {analytics.totalStudents} student profiles
              </div>
            </div>
          );
        })}
      </div>

      {/* Workshop Scheduling Panel */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Scheduled Campus Placement Training Sprints
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {scheduledWorkshops.length} Workshops Active
          </span>
        </div>

        {/* List of active workshops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scheduledWorkshops.map((ws) => (
            <div
              key={ws.id}
              className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-800/40 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {ws.title}
                </span>
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                  {ws.status}
                </span>
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Target Gap: {ws.targetGap} ({ws.targetAudience})
              </div>
              <div className="text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <span><strong>Dates:</strong> {ws.dates}</span>
                <span><strong>Venue:</strong> {ws.venue}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule quick new sprint */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
          <div className="font-bold text-slate-900 dark:text-white">
            Schedule Additional Training Sprint
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Workshop Title (e.g. AWS Cloud Practitioner Sprint)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <select
              value={newGap}
              onChange={(e) => setNewGap(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {analytics.trainingDemand.map((td) => (
                <option key={td.skill} value={td.skill}>
                  {td.skill} ({td.missingStudentsCount} students)
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Date (e.g. Nov 12, 2026)"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                onClick={handleScheduleWorkshop}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
