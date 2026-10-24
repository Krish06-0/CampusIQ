import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Target,
  Calendar,
  MapPin,
  Building,
  Check,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Send,
  Clock,
  Sparkles,
  RefreshCw,
  Database,
  FileSpreadsheet,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PlacementDrive, JobOpportunity, GoogleSheetSyncMetadata } from '../types';
import { fetchDrivesWithMetadata, getStudentApplicationStatus, applyToDrive } from '../services/placementDriveService';
import { evaluateDriveEligibility } from '../services/eligibilityEngine';
import { DriveDetailsModal } from '../components/placement/DriveDetailsModal';
import { INITIAL_STUDENT_PROFILE } from '../data/initialDatabase';

interface JobOpportunitiesPageProps {
  onAnalyzeJob?: (job: JobOpportunity) => void;
}

export type DriveFilterCategory =
  | 'ALL'
  | 'ELIGIBLE'
  | 'APPLIED'
  | 'HIGH_PACKAGE'
  | 'DATA_AI'
  | 'SOFTWARE'
  | 'CORE'
  | 'PRODUCT';

export type PackageFilterTier = 'ALL' | '5_PLUS' | '7_PLUS' | '10_PLUS' | '15_PLUS' | '20_PLUS';

export const JobOpportunitiesPage: React.FC<JobOpportunitiesPageProps> = ({ onAnalyzeJob }) => {
  const { currentStudent, currentRole } = useAuth();
  const activeStudent = currentStudent || INITIAL_STUDENT_PROFILE;
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [metadata, setMetadata] = useState<GoogleSheetSyncMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [refreshFeedback, setRefreshFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [displayedCgpa, setDisplayedCgpa] = useState<number>(() => activeStudent?.cgpa || 0);

  // Smooth count-up animation for CGPA when activeStudent.cgpa is available
  useEffect(() => {
    if (typeof activeStudent?.cgpa === 'number') {
      const target = activeStudent.cgpa;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplayedCgpa(target);
        return;
      }
      let startTimestamp: number | null = null;
      const duration = 1000;
      let frameId: number;
      const step = (now: number) => {
        if (!startTimestamp) startTimestamp = now;
        const progress = Math.min((now - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setDisplayedCgpa(target * easeOut);
        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setDisplayedCgpa(target);
        }
      };
      frameId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(frameId);
    }
  }, [activeStudent?.cgpa]);

  // Filters
  const [filterType, setFilterType] = useState<DriveFilterCategory>('ALL');
  const [packageFilter, setPackageFilter] = useState<PackageFilterTier>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  // Quick applied feedback
  const [justAppliedId, setJustAppliedId] = useState<string | null>(null);

  const loadData = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    setSyncError(null);
    setRefreshFeedback('idle');

    try {
      const res = await fetchDrivesWithMetadata(currentRole, activeStudent.id, force);
      setDrives(res.drives);
      setMetadata(res.metadata);
      if (res.error && res.drives.length === 0) {
        setSyncError(res.error);
        if (force) setRefreshFeedback('error');
      } else if (force) {
        setRefreshFeedback('success');
        setTimeout(() => setRefreshFeedback('idle'), 3000);
      }
    } catch (err: any) {
      setSyncError(err?.message || 'Unable to load campus placement data.');
      if (force) {
        setRefreshFeedback('error');
        setTimeout(() => setRefreshFeedback('idle'), 3500);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRole, activeStudent]);

  // Filter drives
  const filteredDrives = drives.filter((drive) => {
    const eligibility = evaluateDriveEligibility(activeStudent, drive);
    const appStatus = getStudentApplicationStatus(drive.id, activeStudent.id) || (justAppliedId === drive.id ? 'Applied' : null);

    // Numeric Package Tier Filter
    const minVal = drive.minCTC ?? 0;
    const maxVal = drive.maxCTC ?? minVal;
    if (packageFilter === '5_PLUS' && maxVal < 5) return false;
    if (packageFilter === '7_PLUS' && maxVal < 7) return false;
    if (packageFilter === '10_PLUS' && maxVal < 10) return false;
    if (packageFilter === '15_PLUS' && maxVal < 15) return false;
    if (packageFilter === '20_PLUS' && maxVal < 20) return false;

    // Filter Category
    if (filterType === 'ELIGIBLE' && !eligibility.isEligible) return false;
    if (filterType === 'APPLIED' && !appStatus) return false;
    if (filterType === 'PRODUCT' && !drive.isProductBased && minVal < 10) return false;
    if (filterType === 'HIGH_PACKAGE' && maxVal < 10) return false;
    if (
      filterType === 'DATA_AI' &&
      !drive.jobRole.toLowerCase().includes('data') &&
      !drive.jobRole.toLowerCase().includes('analyst') &&
      !drive.jobRole.toLowerCase().includes('ai') &&
      !drive.requiredSkills.some((s) => s.toLowerCase().includes('sql') || s.toLowerCase().includes('python') || s.toLowerCase().includes('ml') || s.toLowerCase().includes('analytics'))
    ) {
      return false;
    }
    if (
      filterType === 'SOFTWARE' &&
      !drive.jobRole.toLowerCase().includes('software') &&
      !drive.jobRole.toLowerCase().includes('sde') &&
      !drive.jobRole.toLowerCase().includes('engineer') &&
      !drive.jobRole.toLowerCase().includes('developer') &&
      !drive.jobRole.toLowerCase().includes('trainee') &&
      !drive.jobRole.toLowerCase().includes('ninja') &&
      !drive.jobRole.toLowerCase().includes('genc')
    ) {
      return false;
    }
    if (
      filterType === 'CORE' &&
      !drive.companyName.toLowerCase().includes('l&t') &&
      !drive.companyName.toLowerCase().includes('sasken') &&
      !drive.companyName.toLowerCase().includes('kpit') &&
      !drive.companyName.toLowerCase().includes('cyient') &&
      !drive.requiredSkills.some((s) => s.toLowerCase().includes('embedded') || s.toLowerCase().includes('c++') || s.toLowerCase().includes('cad'))
    ) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = drive.companyName.toLowerCase().includes(q);
      const matchRole = drive.jobRole.toLowerCase().includes(q);
      const matchLoc = drive.location.toLowerCase().includes(q);
      const matchDept = drive.allowedDepartments.some((d) => d.toLowerCase().includes(q));
      const matchSkills = drive.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchComp && !matchRole && !matchLoc && !matchDept && !matchSkills) return false;
    }

    return true;
  });

  const handleQuickApply = async (drive: PlacementDrive) => {
    const eligibility = evaluateDriveEligibility(activeStudent, drive);
    if (!eligibility.isEligible) return;

    await applyToDrive(drive, activeStudent);
    setJustAppliedId(drive.id);
    if (drive.applicationUrl) {
      window.open(drive.applicationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formattedLastUpdated = metadata?.lastSyncedAt
    ? new Date(metadata.lastSyncedAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '8 Oct 2026, 8:45 PM';

  // Fallback: If network and cache both failed completely
  if (syncError && drives.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-rose-200 dark:border-rose-800 rounded-3xl bg-white dark:bg-slate-900 max-w-2xl mx-auto space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Unable to load campus placement data
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {syncError}
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading Spreadsheet</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Cached Data Notice if running on offline cache */}
      {metadata?.status === 'CACHED' && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Showing last synchronized campus placement data ({formattedLastUpdated})</span>
          </div>
          <button
            onClick={() => loadData(true)}
            className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Latest</span>
          </button>
        </div>
      )}

      {/* Top Banner & Header - Futuristic Campus Placement Intelligence Banner */}
      <div className="relative p-[1px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(6,182,212,0.12)] apex-banner-entrance">
        <style>{`
          @keyframes apexBannerIn {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes apexGradientBorder {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .apex-banner-entrance {
            animation: apexBannerIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-gradient-flow {
            animation: apexGradientBorder 6s ease infinite;
          }
          .apex-stagger-1 { animation: apexBannerIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both; }
          .apex-stagger-2 { animation: apexBannerIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
          .apex-stagger-3 { animation: apexBannerIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
          .apex-stagger-4 { animation: apexBannerIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
          @media (prefers-reduced-motion: reduce) {
            .apex-banner-entrance,
            .animate-gradient-flow,
            .apex-stagger-1,
            .apex-stagger-2,
            .apex-stagger-3,
            .apex-stagger-4 {
              animation: none !important;
              transform: none !important;
              transition: none !important;
            }
          }
        `}</style>

        {/* Animated Gradient Border Layer */}
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/40 via-violet-500/40 to-fuchsia-500/40 animate-gradient-flow pointer-events-none"
          style={{ backgroundSize: '200% 200%' }}
        />

        {/* Banner Card Body */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0c1222]/95 via-[#0f172a]/95 to-[#161233]/95 backdrop-blur-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
          {/* Subtle Ambient Light Sweeps & Glowing Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
            {/* Top-right violet ambient glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-600/20 blur-[80px]" />
            {/* Bottom-left cyan ambient glow */}
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-[80px]" />
            {/* Flowing light sweep along border */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse" />

            {/* Abstract Career Network Nodes & Light Trails */}
            <svg
              className="absolute right-0 top-0 h-full w-2/3 opacity-20 pointer-events-none stroke-cyan-400/30"
              viewBox="0 0 600 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="careerNetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M50 180 Q 200 40 380 120 T 600 60"
                stroke="url(#careerNetGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              <path
                d="M100 220 Q 280 120 440 180 T 620 100"
                stroke="url(#careerNetGrad)"
                strokeWidth="1.5"
              />
              <path
                d="M200 20 Q 320 160 520 80"
                stroke="url(#careerNetGrad)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              {/* Glowing Network Nodes */}
              <circle cx="200" cy="95" r="3.5" fill="#06b6d4" className="animate-ping [animation-duration:3s]" />
              <circle cx="200" cy="95" r="3" fill="#06b6d4" />
              <circle cx="380" cy="120" r="4" fill="#8b5cf6" className="animate-pulse" />
              <circle cx="440" cy="180" r="3" fill="#ec4899" />
              <circle cx="520" cy="80" r="3.5" fill="#38bdf8" />
              <circle cx="300" cy="140" r="2.5" fill="#818cf8" />
            </svg>
          </div>

          {/* Banner Content Layout */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              {/* Source Indicator Badge & Synced Metadata */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono apex-stagger-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>DATA: College Placement Sheet</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Last updated:</span>
                  <span className="font-semibold text-slate-200">{formattedLastUpdated}</span>
                </span>
              </div>

              {/* Title with subtle White-to-Cyan Gradient Accent */}
              <div className="apex-stagger-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                    Placement Opportunities
                  </span>
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Live Portal
                  </span>
                </h2>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed apex-stagger-3">
                Browse verified campus hiring drives imported directly from the college placement spreadsheet. Our Eligibility Engine evaluates your CGPA and skills in real time.
              </p>
            </div>

            {/* Right Side: Student Eligibility Card + Animated Refresh Drives Button */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center gap-3.5 shrink-0">
              {/* Student Eligibility Glass Card */}
              <div className="relative group p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md border border-white/[0.1] hover:border-cyan-400/40 font-mono text-xs space-y-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.2)] apex-stagger-3">
                {/* Subtle sheen highlight on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-400/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  <span className="flex items-center gap-1.5 text-cyan-300/90">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Evaluated Profile:</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 text-[9px] border border-cyan-500/30">
                    Verified
                  </span>
                </div>

                <div className="font-extrabold text-white flex items-center justify-between gap-3 text-sm">
                  <span className="truncate group-hover:text-cyan-200 transition-colors">
                    {activeStudent.name}
                  </span>
                  {/* Glowing CGPA Indicator with count-up animation */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono font-black text-xs shadow-[0_0_12px_rgba(6,182,212,0.35)] shrink-0">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>{displayedCgpa.toFixed(2)} CGPA</span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="text-slate-300">{activeStudent.departmentName}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{activeStudent.batch}</span>
                </div>
              </div>

              {/* Animated Refresh Drives Button */}
              <div className="flex flex-col gap-1.5 apex-stagger-4">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing || loading}
                  title="Refresh drives from Google Sheet"
                  aria-label="Refresh drives from Google Sheet"
                  className="relative group px-5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:shadow-[0_6px_28px_rgba(6,182,212,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <RefreshCw
                    className={`w-4 h-4 transition-transform duration-500 ${
                      refreshing ? 'animate-spin' : 'group-hover:rotate-180'
                    }`}
                  />
                  <span className="tracking-wide">
                    {refreshing ? 'Refreshing...' : 'Refresh Drives'}
                  </span>
                </button>

                {/* Genuine operation result feedback */}
                {refreshFeedback === 'success' && (
                  <div className="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Spreadsheet synchronized!</span>
                  </div>
                )}
                {refreshFeedback === 'error' && (
                  <div className="text-[11px] text-rose-400 font-mono flex items-center justify-center gap-1.5 animate-in fade-in">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Sync failed. Using cache.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Dynamic Filter Chips */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus placement drives by company, job role, skill, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Domain Filter Chips Bar */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {[
            { id: 'ALL', label: `All Drives (${drives.length})` },
            { id: 'ELIGIBLE', label: 'Eligible Only' },
            { id: 'APPLIED', label: 'Applied' },
            { id: 'HIGH_PACKAGE', label: 'High Package (>10 LPA)' },
            { id: 'DATA_AI', label: 'Data / AI' },
            { id: 'SOFTWARE', label: 'Software' },
            { id: 'CORE', label: 'Core Engineering' },
            { id: 'PRODUCT', label: 'Product Tier' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id as DriveFilterCategory)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterType === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Package CTC Filter Bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs overflow-x-auto pb-0.5">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Package:
          </span>
          {[
            { id: 'ALL', label: 'All Packages' },
            { id: '5_PLUS', label: '₹5+ LPA' },
            { id: '7_PLUS', label: '₹7+ LPA' },
            { id: '10_PLUS', label: '₹10+ LPA' },
            { id: '15_PLUS', label: '₹15+ LPA' },
            { id: '20_PLUS', label: '₹20+ LPA' },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setPackageFilter(tier.id as PackageFilterTier)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                packageFilter === tier.id
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Placement Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 space-y-2">
          <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No placement drives found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or switching to "All Drives" to see upcoming campus recruitment schedules.
          </p>
          <button
            onClick={() => {
              setFilterType('ALL');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDrives.map((drive) => {
            const eligibility = evaluateDriveEligibility(activeStudent, drive);
            const appliedStatus =
              getStudentApplicationStatus(drive.id, activeStudent.id) ||
              (justAppliedId === drive.id ? 'Applied' : null);
            const isApplied = Boolean(appliedStatus);

            return (
              <div
                key={drive.id}
                className="p-5.5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-700 transition-all hover:shadow-md group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                        {drive.companyLogo || '🏢'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-600 dark:text-slate-300">
                            {drive.companyName}
                          </span>
                          {drive.isProductBased && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
                              PROD
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                          {drive.jobRole}
                        </h3>
                        <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 pt-0.5">
                          {drive.salaryPackage}
                        </div>
                      </div>
                    </div>

                    {/* Eligibility Badge */}
                    <div className="shrink-0">
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </span>
                      ) : eligibility.isEligible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Eligible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Not Eligible</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{drive.location}</span>
                    </span>
                    <span>•</span>
                    <span>{drive.workMode}</span>
                    <span>•</span>
                    <span>{drive.jobType}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                    {drive.description}
                  </p>

                  {/* Required Skills Chips */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Required Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {drive.requiredSkills.map((skill, idx) => {
                         const studentHas = (activeStudent.skills || []).some(
                          (s) => s.skillName.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.skillName.toLowerCase())
                        );
                        return (
                          <span
                            key={idx}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 ${
                              studentHas
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span>{skill}</span>
                            {studentHas && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Eligibility Status Breakdown */}
                  <div
                    className={`mt-4 p-3 rounded-2xl text-xs border ${
                      eligibility.isEligible
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="font-extrabold flex items-center gap-1.5 text-xs">
                      {eligibility.isEligible ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Eligibility Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Currently not eligible:</span>
                        </>
                      )}
                    </div>

                    {eligibility.isEligible ? (
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-mono opacity-90 text-emerald-800 dark:text-emerald-300">
                        <span>✓ CGPA requirement ({activeStudent.cgpa} &ge; {drive.minimumCGPA})</span>
                        <span>✓ Department requirement ({activeStudent.departmentName})</span>
                        <span>✓ Skills requirement</span>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2 text-[11px] font-mono">
                        <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                          Currently not eligible.
                        </div>
                        <div className="space-y-1.5 divide-y divide-rose-200/50 dark:divide-rose-900/40">
                          {!eligibility.cgpaPassed && (
                            <div className="pt-1.5 first:pt-0">
                              <span className="font-bold text-rose-800 dark:text-rose-300 block">CGPA:</span>
                              <div className="text-slate-700 dark:text-slate-300 pl-1.5 mt-0.5">
                                Your CGPA: <span className="font-bold text-rose-600 dark:text-rose-400">{activeStudent.cgpa.toFixed(2)}</span>
                                <br />
                                Required: <span className="font-bold">{(drive.minimumCGPA ?? 7.0).toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                          {!eligibility.deptPassed && (
                            <div className="pt-1.5 first:pt-0">
                              <span className="font-bold text-rose-800 dark:text-rose-300 block">Department:</span>
                              <div className="text-slate-700 dark:text-slate-300 pl-1.5 mt-0.5">
                                Your Department: <span className="font-bold">{activeStudent.departmentName || 'Not specified'}</span>
                                <br />
                                Allowed: <span className="font-bold">{drive.allowedDepartments && drive.allowedDepartments.length > 0 ? drive.allowedDepartments.join(' / ') : 'All Departments'}</span>
                              </div>
                            </div>
                          )}
                          {!eligibility.skillsPassed && eligibility.missingSkills.length > 0 && (
                            <div className="pt-1.5 first:pt-0">
                              <span className="font-bold text-rose-800 dark:text-rose-300 block">Missing Skills:</span>
                              <div className="pl-1.5 mt-1 flex flex-wrap gap-1 font-sans">
                                {eligibility.missingSkills.map((sk, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-rose-200/80 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800 text-[10px] font-semibold"
                                  >
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {!eligibility.batchPassed && (
                            <div className="pt-1.5 first:pt-0">
                              <span className="font-bold text-rose-800 dark:text-rose-300 block">Batch:</span>
                              <div className="text-slate-700 dark:text-slate-300 pl-1.5 mt-0.5">
                                Your Batch: <span className="font-bold text-rose-600 dark:text-rose-400">{activeStudent.batch}</span>
                                <br />
                                Allowed: <span className="font-bold">{drive.allowedBatches?.join(', ')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions (Clean, NO ADMIN CONTROLS for students) */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Deadline: {drive.deadline}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Details Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedDrive(drive)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    {/* Apply Button */}
                    {isApplied ? (
                      <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </span>
                    ) : eligibility.isEligible ? (
                      <button
                        type="button"
                        onClick={() => handleQuickApply(drive)}
                        className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply Now</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed flex items-center gap-1"
                        title="Not eligible based on criteria"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Not Eligible</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drive Details Modal */}
      <DriveDetailsModal
        isOpen={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        drive={selectedDrive}
        student={activeStudent}
        onApplied={() => {
          if (selectedDrive) setJustAppliedId(selectedDrive.id);
        }}
      />
    </div>
  );
};
