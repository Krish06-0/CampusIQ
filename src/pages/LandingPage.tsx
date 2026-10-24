import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  CheckCircle2,
  BookOpen,
  FileText,
  Target,
  Award,
  ChevronRight,
  Plus,
  Check,
  Shield,
  Search,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreOpportunities: () => void;
  onNavigate?: (tab: string) => void;
}

interface TiltCardProps {
  accentClass: string;
  className?: string;
  children: React.ReactNode;
}

const SummitTiltCard: React.FC<TiltCardProps> = ({
  accentClass,
  className = '',
  children,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const disabledRef = useRef<boolean>(false);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    disabledRef.current = coarse || noHover || reduced;
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (disabledRef.current || e.pointerType === 'touch' || !cardRef.current) return;
    const el = cardRef.current;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      const rx = (-ny * 6.5).toFixed(2);
      const ry = (nx * 7.5).toFixed(2);
      const spotX = ((x / rect.width) * 100).toFixed(1);
      const spotY = ((y / rect.height) * 100).toFixed(1);

      el.style.setProperty('--rx', `${rx}deg`);
      el.style.setProperty('--ry', `${ry}deg`);
      el.style.setProperty('--spot-x', `${spotX}%`);
      el.style.setProperty('--spot-y', `${spotY}%`);
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`apex-summit-tilt-card ${accentClass} ${className}`}
    >
      {children}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onNavigate,
}) => {
  // Adobe MAX Track Filters
  const [activeTrack, setActiveTrack] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSessions, setSavedSessions] = useState<Record<string, boolean>>({});

  const rootRef = useRef<HTMLDivElement>(null);
  const heroStageRef = useRef<HTMLElement>(null);
  const heroRafRef = useRef<number | null>(null);
  const motionDisabledRef = useRef<boolean>(false);

  // Lightweight IntersectionObserver for scroll-triggered section & card reveals
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    motionDisabledRef.current = coarse || reduced;

    const rootEl = rootRef.current;
    if (!rootEl) return;

    const revealNodes = Array.from(rootEl.querySelectorAll<HTMLElement>('.apex-scroll-reveal'));
    if (reduced || typeof IntersectionObserver === 'undefined') {
      revealNodes.forEach((node) => node.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    revealNodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      if (heroRafRef.current !== null) {
        cancelAnimationFrame(heroRafRef.current);
      }
    };
  }, []);

  const handleHeroPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (motionDisabledRef.current || e.pointerType === 'touch' || !heroStageRef.current) return;
    const el = heroStageRef.current;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (heroRafRef.current !== null) {
      cancelAnimationFrame(heroRafRef.current);
    }

    heroRafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (clientX - rect.left) / rect.width - 0.5;
      const ny = (clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--px', `${(nx * 18).toFixed(1)}px`);
      el.style.setProperty('--py', `${(ny * 14).toFixed(1)}px`);
    });
  }, []);

  const handleHeroPointerLeave = useCallback(() => {
    if (heroRafRef.current !== null) {
      cancelAnimationFrame(heroRafRef.current);
    }
    if (heroStageRef.current) {
      heroStageRef.current.style.setProperty('--px', '0px');
      heroStageRef.current.style.setProperty('--py', '0px');
    }
  }, []);

  const toggleSaveSession = (id: string) => {
    setSavedSessions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLaunch = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      onGetStarted();
    }
  };

  // Conference Tracks aligned with Placement Preparation & Skill Building
  const tracks = [
    {
      id: 'ALL',
      label: 'All Tracks',
      activeGradient: 'from-[#11152B] via-[#1E1B4B] to-[#2563EB]',
    },
    {
      id: 'AI_ML',
      label: 'AI & Data Science',
      activeGradient: 'from-[#EC008C] via-[#7C3AED] to-[#2563EB]',
    },
    {
      id: 'CODING',
      label: '360 DSA & Coding',
      activeGradient: 'from-[#7C3AED] to-[#2563EB]',
    },
    {
      id: 'SYSTEMS',
      label: 'Full-Stack & Systems',
      activeGradient: 'from-[#2563EB] to-[#06D6F2]',
    },
    {
      id: 'RESUME',
      label: 'LaTeX Resume & Portfolio',
      activeGradient: 'from-[#7C3AED] to-[#EC008C]',
    },
    {
      id: 'KEYNOTE',
      label: 'Interviews & HR Defense',
      activeGradient: 'from-[#EC008C] to-[#7C3AED]',
    },
  ];

  // Sessions Agenda (Adobe MAX Schedule format — exact preserved data)
  const sessions = [
    {
      id: 'ses-1',
      day: 1,
      track: 'KEYNOTE',
      title: 'Opening Keynote: The Future of Campus Recruitment & AI-Driven Hiring',
      speaker: 'Dr. S. K. Raman',
      role: 'Dean of Placement & Corporate Relations',
      time: '09:30 AM – 10:45 AM',
      level: 'All Cohorts',
      format: 'Mainstage Keynote',
      desc: 'How tier-1 product enterprises evaluate engineers beyond CGPA: architectural depth, problem breakdown, and raw curiosity.',
      badge: 'Opening Keynote',
      accentTopBar: 'from-[#EC008C] via-[#7C3AED] to-[#2563EB]',
      accentBorder: 'border-[#EC008C]/20 hover:border-[#EC008C]/45',
      badgeColor: 'text-[#EC008C]',
      titleHover: 'group-hover/ses:text-[#7C3AED]',
    },
    {
      id: 'ses-2',
      day: 1,
      track: 'CODING',
      title: 'Mastering the 15 Core LeetCode Patterns (Two Pointers to Dynamic Programming)',
      speaker: 'Alex Kumar & Coding Leads',
      role: 'Batch 2022–26 Top Aspirant',
      time: '11:15 AM – 12:45 PM',
      level: 'Intermediate / Advanced',
      format: 'Interactive Workshop',
      desc: 'Hands-on breakdown of Sliding Window, Monotonic Stacks, and Tree Traversals with optimal time and space complexity proofs.',
      badge: 'Top Rated',
      accentTopBar: 'from-[#7C3AED] via-[#2563EB] to-[#06D6F2]',
      accentBorder: 'border-[#7C3AED]/20 hover:border-[#7C3AED]/45',
      badgeColor: 'text-[#7C3AED]',
      titleHover: 'group-hover/ses:text-[#2563EB]',
    },
    {
      id: 'ses-3',
      day: 1,
      track: 'SYSTEMS',
      title: 'Designing Real-World Distributed Telemetry: From Fastify APIs to Vector Embeddings',
      speaker: 'Prof. V. Manoj Praveen',
      role: 'Faculty Advisor & System Architect',
      time: '02:00 PM – 03:30 PM',
      level: 'Advanced',
      format: 'Architecture Defense',
      desc: 'Building portfolio systems recruiters actually respect: zero mock stubs, high-throughput caching with Redis, and end-to-end Dockerization.',
      badge: 'Must Attend',
      accentTopBar: 'from-[#06D6F2] via-[#2563EB] to-[#7C3AED]',
      accentBorder: 'border-[#06D6F2]/35 hover:border-[#2563EB]/50',
      badgeColor: 'text-[#2563EB]',
      titleHover: 'group-hover/ses:text-[#2563EB]',
    },
    {
      id: 'ses-4',
      day: 2,
      track: 'RESUME',
      title: 'The Overleaf LaTeX Resume Masterclass: Beating Corporate ATS Algorithms',
      speaker: 'Department Placement Mentors',
      role: 'Career Design Studio',
      time: '10:00 AM – 11:30 AM',
      level: 'All Cohorts',
      format: 'Live Lab',
      desc: 'Transforming cluttered resumes into high-impact single-column Deedy-style LaTeX architectures with GitHub commit heatmaps and quantifiable metrics.',
      badge: 'Hands-on Lab',
      accentTopBar: 'from-[#7C3AED] via-[#EC008C] to-[#2563EB]',
      accentBorder: 'border-[#7C3AED]/20 hover:border-[#EC008C]/40',
      badgeColor: 'text-[#7C3AED]',
      titleHover: 'group-hover/ses:text-[#7C3AED]',
    },
    {
      id: 'ses-5',
      day: 2,
      track: 'AI_ML',
      title: 'Explainable Skill Gap Telemetry: How NLP Maps Your Profile to Real Job Descriptions',
      speaker: 'Tiger Analytics & Zoho Guest Engineers',
      role: 'Corporate Recruitment Panel',
      time: '01:30 PM – 03:00 PM',
      level: 'Intermediate',
      format: 'Tech Talk & Demo',
      desc: 'Under the hood of our placement matching engine: weighted Jaccard similarity, categorical scoring across 4 core competencies, and automated roadmap generation.',
      badge: 'Product Sneak',
      accentTopBar: 'from-[#06D6F2] via-[#2563EB] to-[#10B981]',
      accentBorder: 'border-[#2563EB]/20 hover:border-[#2563EB]/45',
      badgeColor: 'text-[#2563EB]',
      titleHover: 'group-hover/ses:text-[#2563EB]',
    },
    {
      id: 'ses-6',
      day: 3,
      track: 'KEYNOTE',
      title: 'Round 4 HR Defense: Mastering the 9 Golden Senior Rules & Offer Negotiation',
      speaker: 'Alumni SDEs (Amazon, Microsoft, Swiggy)',
      role: 'Executive Interviewers',
      time: '11:00 AM – 12:30 PM',
      level: 'Final Year Cohort',
      format: 'Fireside Chat',
      desc: 'How to structure "Tell me about yourself" using the STAR method, diplomatically discussing salary expectations, and navigating multiple job offers.',
      badge: 'Final Selection',
      accentTopBar: 'from-[#EC008C] via-[#7C3AED] to-[#10B981]',
      accentBorder: 'border-[#10B981]/25 hover:border-[#10B981]/50',
      badgeColor: 'text-[#EC008C]',
      titleHover: 'group-hover/ses:text-[#7C3AED]',
    },
  ];

  const filteredSessions = sessions.filter((s) => {
    if (s.day !== selectedDay) return false;
    if (activeTrack !== 'ALL' && s.track !== activeTrack) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.speaker.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div
      ref={rootRef}
      className="apex-summit-root space-y-20 sm:space-y-24 pb-28 selection:bg-[#7C3AED] selection:text-white relative w-full max-w-full overflow-x-clip"
    >
      {/* ===================== 1. ADOBE MAX HERO SECTION — CINEMATIC 3D EXPERIENCE ===================== */}
      <section
        ref={heroStageRef}
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={handleHeroPointerLeave}
        className="apex-summit-hero-stage rounded-[2rem] p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden"
      >
        {/* Architectural Circuit Grid & Light Sweep */}
        <div
          aria-hidden="true"
          className="apex-summit-circuit-grid absolute inset-0 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="apex-hero-sweep-beam absolute inset-y-0 -left-1/4 w-1/2 pointer-events-none"
        />

        {/* Ambient Light Fields (Parallax Back) */}
        <div
          aria-hidden="true"
          className="apex-parallax-back absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#EC008C]/10 blur-3xl" />
          <div className="absolute top-8 right-10 w-96 h-96 rounded-full bg-[#06D6F2]/12 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 w-96 h-96 rounded-full bg-[#7C3AED]/10 blur-3xl" />
        </div>

        {/* Floating 3D Geometric Prism & Circuit Nodes (Desktop Ambient Layer) */}
        <div
          aria-hidden="true"
          className="apex-parallax-front hidden xl:block absolute top-10 right-10 w-[320px] h-[320px] pointer-events-none select-none"
        >
          <svg
            viewBox="0 0 320 320"
            fill="none"
            className="w-full h-full apex-float-slow opacity-90"
          >
            <defs>
              <linearGradient id="summitPrismStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC008C" stopOpacity="0.65" />
                <stop offset="48%" stopColor="#7C3AED" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#06D6F2" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="summitPrismFill" x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.11" />
                <stop offset="55%" stopColor="#2563EB" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#06D6F2" stopOpacity="0.14" />
              </linearGradient>
              <radialGradient id="summitOrbGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06D6F2" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Orbital Rings */}
            <ellipse
              cx="168"
              cy="156"
              rx="126"
              ry="52"
              transform="rotate(-22 168 156)"
              stroke="url(#summitPrismStroke)"
              strokeWidth="1.2"
              strokeDasharray="5 6"
              opacity="0.55"
            />
            <ellipse
              cx="168"
              cy="156"
              rx="104"
              ry="104"
              stroke="#2563EB"
              strokeOpacity="0.14"
              strokeWidth="1"
            />

            {/* Soft Core Halo */}
            <circle cx="168" cy="152" r="86" fill="url(#summitOrbGlow)" />

            {/* 3D Isometric Crystal / Octahedron */}
            <polygon
              points="168,46 248,142 168,186 88,142"
              fill="url(#summitPrismFill)"
              stroke="url(#summitPrismStroke)"
              strokeWidth="1.6"
            />
            <polygon
              points="168,260 248,142 168,186 88,142"
              fill="#2563EB"
              fillOpacity="0.06"
              stroke="url(#summitPrismStroke)"
              strokeWidth="1.4"
            />
            <line
              x1="168"
              y1="46"
              x2="168"
              y2="260"
              stroke="#7C3AED"
              strokeOpacity="0.38"
              strokeWidth="1.2"
            />

            {/* Precision Circuit Trace Accents & Atmospheric Nodes */}
            <path
              d="M52 88 H94 L112 106"
              stroke="#EC008C"
              strokeOpacity="0.45"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M276 218 H234 L216 200"
              stroke="#06D6F2"
              strokeOpacity="0.6"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="52" cy="88" r="3.5" fill="#EC008C" fillOpacity="0.75" />
            <circle cx="276" cy="218" r="3.5" fill="#06D6F2" />
            <circle cx="168" cy="46" r="4" fill="#7C3AED" />
            <circle cx="248" cy="142" r="3.5" fill="#2563EB" />
            <circle cx="88" cy="142" r="3.5" fill="#EC008C" />
          </svg>
        </div>

        {/* Foreground Hero Content */}
        <div className="relative z-10 space-y-8 sm:space-y-10">
          {/* Eyebrow Event Badges */}
          <div className="apex-hero-enter-1 flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-mono tracking-wider uppercase">
            <span className="apex-summit-event-badge px-3.5 py-1.5 rounded-xl text-white font-extrabold tracking-widest inline-flex items-center gap-2">
              <span>ADOBE MAX × PLACEMENT SUMMIT 2026</span>
            </span>

            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
              ·
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-white/90 border border-[#2563EB]/20 text-[#11152B] font-semibold inline-flex items-center gap-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>CAMPUS PREPARATION CYCLE 2026</span>
            </span>

            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
              ·
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 text-[#047857] font-bold inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>HYBRID · LIVE &amp; ON-DEMAND</span>
            </span>
          </div>

          {/* Staggered Main Heading & Description */}
          <div className="space-y-5 max-w-4xl">
            <h1 className="apex-hero-enter-2 text-[clamp(2.1rem,4.6vw,4.35rem)] font-extrabold tracking-tight leading-[1.05] text-[#11152B] break-words">
              <span className="block">THE CREATIVITY &amp;</span>
              <span className="apex-summit-gradient-title uppercase inline-block mt-1">
                PLACEMENT SUMMIT
              </span>
            </h1>

            <p className="apex-hero-enter-3 text-base sm:text-xl lg:text-[1.32rem] text-[#11152B]/78 font-normal leading-relaxed max-w-3xl text-balance">
              Where 500+ undergraduate student engineers, faculty mentors, and premier corporate recruiters converge. Unleash real-time skill telemetry, master the 4-round CRT syllabus, and engineer your career trajectory.
            </p>
          </div>

          {/* Action Controls */}
          <div className="apex-hero-enter-4 flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1">
            <button
              type="button"
              onClick={() => handleLaunch('login')}
              className="apex-summit-cta-primary group/cta px-6 sm:px-8 py-4 rounded-2xl font-extrabold text-xs sm:text-sm text-white inline-flex items-center gap-3 cursor-pointer"
            >
              <span className="relative z-10">REGISTER FREE / 3-WAY SIGN IN</span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover/cta:translate-x-1 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleLaunch('student-dashboard')}
              className="apex-summit-btn-midnight group/ws px-6 sm:px-7 py-4 rounded-2xl font-bold text-xs sm:text-sm text-white inline-flex items-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#06D6F2] transition-transform duration-200 group-hover/ws:rotate-12 group-hover/ws:scale-110 shrink-0" />
              <span>Launch Student Workspace</span>
            </button>

            <button
              type="button"
              onClick={() => handleLaunch('placement-guide')}
              className="apex-summit-btn-lavender group/crt px-5 sm:px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm text-[#11152B] inline-flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#7C3AED] transition-transform duration-200 group-hover/crt:-translate-y-0.5 shrink-0" />
              <span>4-Round CRT Guide</span>
            </button>
          </div>

          {/* Stat Ribbon */}
          <div className="apex-hero-enter-5 pt-7 border-t border-[#7C3AED]/14">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  stat: '3 DAYS',
                  label: 'Intensive Masterclasses',
                  desc: 'Round 1 Aptitude to Round 4 Executive HR',
                  statGradient: 'from-[#EC008C] to-[#7C3AED]',
                  topAccent: 'from-[#EC008C] to-[#7C3AED]',
                },
                {
                  stat: '200+',
                  label: 'Curated Sessions',
                  desc: '360 LeetCode patterns & system design',
                  statGradient: 'from-[#7C3AED] to-[#2563EB]',
                  topAccent: 'from-[#7C3AED] to-[#2563EB]',
                },
                {
                  stat: '500+',
                  label: 'Verified Candidates',
                  desc: 'Real-time cohort telemetry from Dept. of AI & DS',
                  statGradient: 'from-[#2563EB] to-[#06D6F2]',
                  topAccent: 'from-[#06D6F2] to-[#2563EB]',
                },
                {
                  stat: '₹28 LPA',
                  label: 'Top Dream Package',
                  desc: 'Amazon WOW, Zoho, Swiggy product offers',
                  statGradient: 'from-[#10B981] to-[#2563EB]',
                  topAccent: 'from-[#10B981] to-[#06D6F2]',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group relative p-5 sm:p-6 rounded-2xl bg-white/92 border border-[#11152B]/8 hover:border-[#7C3AED]/30 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                >
                  <div
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${item.topAccent} opacity-85`}
                  />
                  <div
                    className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight tabular-nums bg-gradient-to-r ${item.statGradient} bg-clip-text text-transparent`}
                  >
                    {item.stat}
                  </div>
                  <div className="text-sm font-bold text-[#11152B] mt-1">{item.label}</div>
                  <div className="text-xs text-[#11152B]/65 mt-0.5 leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 2. ADOBE MAX SNEAKS & LABS — 3D FEATURE CARDS ===================== */}
      <section className="apex-scroll-reveal space-y-8 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-[#11152B]/10 pb-6">
          <div className="space-y-2 min-w-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#11152B] text-balance">
              Next-Gen Placement Technologies
            </h2>
            <p className="text-sm sm:text-base text-[#11152B]/70 max-w-2xl leading-relaxed">
              Breakthrough platform modules crafted to eliminate placement preparation blind spots.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleLaunch('resume-studio')}
              className="group/sneak px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F5F3FF] hover:bg-[#7C3AED] text-[#7C3AED] hover:text-white border border-[#7C3AED]/25 hover:border-[#7C3AED] inline-flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 shadow-2xs cursor-pointer"
            >
              <span>Test Resume Sneak</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/sneak:translate-x-0.5 shrink-0" />
            </button>
          </div>
        </div>

        {/* 3 Interactive 3D Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Sneak 1 */}
          <SummitTiltCard
            accentClass="apex-card-accent-magenta"
            className="apex-scroll-reveal apex-stagger-1 p-7 rounded-3xl group flex flex-col justify-between gap-6 overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="apex-icon-orb h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#EC008C] via-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-[#EC008C]/25">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#EC008C]">
                  Sneak 01 · Studio
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#11152B] group-hover:text-[#7C3AED] transition-colors">
                  In-Browser LaTeX Engine
                </h3>
                <p className="text-xs sm:text-sm text-[#11152B]/72 leading-relaxed">
                  Compile professional single-column tech resumes directly in your browser. Automatic Overleaf project sync, ZIP bundle export, and live PDF rendering with 95+ ATS pass rate.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#11152B]/8">
              <button
                type="button"
                onClick={() => handleLaunch('resume-studio')}
                className="text-xs font-extrabold text-[#11152B] group-hover:text-[#EC008C] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Launch LaTeX Studio</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </SummitTiltCard>

          {/* Sneak 2 */}
          <SummitTiltCard
            accentClass="apex-card-accent-cyan"
            className="apex-scroll-reveal apex-stagger-2 p-7 rounded-3xl group flex flex-col justify-between gap-6 overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="apex-icon-orb h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#06D6F2] flex items-center justify-center text-white shadow-lg shadow-[#06D6F2]/30">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB]">
                  Sneak 02 · Telemetry
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#11152B] group-hover:text-[#2563EB] transition-colors">
                  Explainable Skill Radar
                </h3>
                <p className="text-xs sm:text-sm text-[#11152B]/72 leading-relaxed">
                  NLP-driven JD compatibility scoring. Evaluates candidate proficiencies against real enterprise postings, highlighting exact missing concepts across 4 skill dimensions.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#11152B]/8">
              <button
                type="button"
                onClick={() => handleLaunch('skill-gap')}
                className="text-xs font-extrabold text-[#11152B] group-hover:text-[#2563EB] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Analyze Skill Gaps</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </SummitTiltCard>

          {/* Sneak 3 */}
          <SummitTiltCard
            accentClass="apex-card-accent-violet"
            className="apex-scroll-reveal apex-stagger-3 p-7 rounded-3xl group flex flex-col justify-between gap-6 overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="apex-icon-orb h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#2563EB] to-[#10B981] flex items-center justify-center text-white shadow-lg shadow-[#7C3AED]/25">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7C3AED]">
                  Sneak 03 · Triad
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#11152B] group-hover:text-[#7C3AED] transition-colors">
                  3-Way Campus Mesh
                </h3>
                <p className="text-xs sm:text-sm text-[#11152B]/72 leading-relaxed">
                  Seamless role-tailored gateways uniting Student Aspirants (Roll No login), Faculty Advisors (Cohort Endorsements), and Central Placement TPO (Google Sheets Sync).
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#11152B]/8">
              <button
                type="button"
                onClick={() => handleLaunch('login')}
                className="text-xs font-extrabold text-[#11152B] group-hover:text-[#7C3AED] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Switch 3-Way Portal</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </SummitTiltCard>
        </div>
      </section>

      {/* ===================== 3. CONFERENCE TRACKS & WORKSHOP SESSIONS ===================== */}
      <section className="apex-scroll-reveal space-y-8 pt-2">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-[#11152B]/10 pb-6">
          <div className="space-y-2 min-w-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#11152B] text-balance">
              Explore Conference Tracks
            </h2>
            <p className="text-sm sm:text-base text-[#11152B]/70 max-w-xl leading-relaxed">
              Filter by track, search topics, and build your personalized 3-day interview readiness schedule.
            </p>
          </div>

          {/* Elevated Search Box */}
          <div className="relative w-full xl:w-80 shrink-0">
            <Search className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions or topics..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#11152B]/14 text-xs sm:text-sm text-[#11152B] placeholder:text-slate-400 shadow-2xs focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all"
            />
          </div>
        </div>

        {/* Day Selector & Track Filter Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Dimensional Day Selector */}
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-[#F5F3FF] rounded-2xl border border-[#7C3AED]/15 shadow-inner self-start">
            {[1, 2, 3].map((dayNum) => {
              const isActive = selectedDay === dayNum;
              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => setSelectedDay(dayNum)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#EC008C] via-[#7C3AED] to-[#2563EB] text-white shadow-md shadow-[#7C3AED]/30 -translate-y-0.5'
                      : 'text-[#11152B]/70 hover:text-[#11152B] hover:bg-white/70'
                  }`}
                >
                  DAY {dayNum}
                </button>
              );
            })}
          </div>

          {/* Track Filter Bar with Coordinated Active Gradient Indicator */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {tracks.map((t) => {
              const isSelected = activeTrack === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTrack(t.id)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 cursor-pointer border whitespace-nowrap ${
                    isSelected
                      ? `bg-gradient-to-r ${t.activeGradient} text-white border-transparent shadow-md shadow-[#7C3AED]/20 -translate-y-0.5`
                      : 'bg-white text-[#11152B]/75 border-[#11152B]/12 hover:text-[#11152B] hover:border-[#7C3AED]/35 hover:bg-[#F5F3FF]/60'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Session Cards Feed */}
        <div
          key={`${selectedDay}-${activeTrack}`}
          className="space-y-4"
        >
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#F5F3FF]/60 border border-[#7C3AED]/15 text-[#11152B]/65 text-sm font-medium">
              No sessions match your active track and search criteria for Day {selectedDay}.
            </div>
          ) : (
            filteredSessions.map((ses) => {
              const isSaved = !!savedSessions[ses.id];
              return (
                <div
                  key={ses.id}
                  className={`apex-session-card group/ses relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-white border ${ses.accentBorder} shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6`}
                >
                  {/* Top Luminous Track Indicator Hairline */}
                  <div
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${ses.accentTopBar}`}
                  />

                  <div className="space-y-2.5 max-w-3xl min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                      <span className={`font-extrabold ${ses.badgeColor}`}>{ses.badge}</span>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#11152B]/75 inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span>{ses.time}</span>
                      </span>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#11152B]/75 font-medium">{ses.format}</span>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#047857] font-bold">{ses.level}</span>
                    </div>

                    <h3
                      className={`text-lg sm:text-xl font-extrabold text-[#11152B] transition-colors ${ses.titleHover}`}
                    >
                      {ses.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#11152B]/72 leading-relaxed">
                      {ses.desc}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#11152B]/65">
                      <span className="font-bold text-[#11152B]">{ses.speaker}</span>
                      <span aria-hidden="true">—</span>
                      <span>{ses.role}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSaveSession(ses.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer border whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0 ${
                        isSaved
                          ? 'bg-[#10B981]/12 text-[#047857] border-[#10B981]/35 shadow-2xs'
                          : 'bg-[#F5F3FF]/70 text-[#11152B] border-[#7C3AED]/20 hover:bg-[#F5F3FF] hover:border-[#7C3AED]/45'
                      }`}
                    >
                      {isSaved ? (
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                      )}
                      <span>{isSaved ? 'In Schedule' : 'Add to Schedule'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLaunch('placement-guide')}
                      className="group/exp px-4 py-2.5 rounded-xl text-xs font-bold bg-[#11152B] text-white hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#2563EB] transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/exp:translate-x-0.5 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ===================== 4. SUMMIT ACCESS TIERS — PREMIUM 3D CARDS ===================== */}
      <section className="apex-scroll-reveal space-y-8 pt-2">
        <div className="space-y-2 border-b border-[#11152B]/10 pb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#11152B] text-balance">
            Choose Your Summit Gateway
          </h2>
          <p className="text-sm sm:text-base text-[#11152B]/70 max-w-xl leading-relaxed">
            Free institutional passes tailored for students, faculty coordinators, and corporate placement partners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Tier 01: Student Aspirant */}
          <SummitTiltCard
            accentClass="apex-card-accent-cyan"
            className="apex-scroll-reveal apex-stagger-1 p-7 rounded-3xl group flex flex-col justify-between gap-7 overflow-hidden"
          >
            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2.5">
                  <div className="apex-icon-orb h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#06D6F2] text-white flex items-center justify-center shadow-md shadow-[#06D6F2]/25 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-extrabold bg-gradient-to-r from-[#2563EB] to-[#06D6F2] bg-clip-text text-transparent uppercase tracking-wider">
                    Tier 01 // Student Pass
                  </span>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-[#06D6F2]/12 text-[#2563EB] border border-[#06D6F2]/35 shrink-0">
                  FREE
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-extrabold text-[#11152B]">Student Aspirant</h3>
                <p className="text-xs sm:text-sm text-[#11152B]/70 leading-relaxed">
                  For undergraduate engineers preparing for product and service placement drives.
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-[13px] text-[#11152B]/85 pt-4 border-t border-[#11152B]/10">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Roll Number login authentication</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Overleaf LaTeX Resume Studio</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>360 LeetCode Pattern Roadmap</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>34 Build-Your-Own-X project blueprints</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleLaunch('student-dashboard')}
              className="apex-summit-btn-midnight relative z-10 w-full py-3.5 px-4 rounded-xl font-extrabold text-xs text-white flex items-center justify-center gap-2 cursor-pointer group/btn"
            >
              <span>ENTER STUDENT WORKSPACE</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1 shrink-0" />
            </button>
          </SummitTiltCard>

          {/* Tier 02: Staff & Advisor */}
          <SummitTiltCard
            accentClass="apex-card-accent-magenta"
            className="apex-scroll-reveal apex-stagger-2 p-7 rounded-3xl group flex flex-col justify-between gap-7 overflow-hidden"
          >
            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2.5">
                  <div className="apex-icon-orb h-10 w-10 rounded-xl bg-gradient-to-tr from-[#EC008C] to-[#7C3AED] text-white flex items-center justify-center shadow-md shadow-[#EC008C]/25 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-extrabold bg-gradient-to-r from-[#EC008C] to-[#7C3AED] bg-clip-text text-transparent uppercase tracking-wider">
                    Tier 02 // Mentor Pass
                  </span>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-[#EC008C]/10 text-[#EC008C] border border-[#EC008C]/25 shrink-0">
                  FACULTY
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-extrabold text-[#11152B]">Staff &amp; Advisor</h3>
                <p className="text-xs sm:text-sm text-[#11152B]/70 leading-relaxed">
                  For departmental faculty advisors guiding the AI &amp; DS cohort.
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-[13px] text-[#11152B]/85 pt-4 border-t border-[#11152B]/10">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>124 AI &amp; DS student verification desk</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Skill &amp; project portfolio endorsement</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Direct corporate drive candidate nomination</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Core CS proficiency department telemetry</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleLaunch('staff-dashboard')}
              className="apex-summit-cta-primary relative z-10 w-full py-3.5 px-4 rounded-xl font-extrabold text-xs text-white flex items-center justify-center gap-2 cursor-pointer group/btn"
            >
              <span className="relative z-10">ENTER FACULTY HUB</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-200 group-hover/btn:translate-x-1 shrink-0" />
            </button>
          </SummitTiltCard>

          {/* Tier 03: Placement Office */}
          <SummitTiltCard
            accentClass="apex-card-accent-violet"
            className="apex-scroll-reveal apex-stagger-3 p-7 rounded-3xl group flex flex-col justify-between gap-7 overflow-hidden"
          >
            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2.5">
                  <div className="apex-icon-orb h-10 w-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-[#7C3AED]/25 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent uppercase tracking-wider">
                    Tier 03 // Command Pass
                  </span>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/25 shrink-0">
                  CENTRAL TPO
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-extrabold text-[#11152B]">Placement Office</h3>
                <p className="text-xs sm:text-sm text-[#11152B]/70 leading-relaxed">
                  For Central TPO coordinators managing all college recruitment drives.
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-[13px] text-[#11152B]/85 pt-4 border-t border-[#11152B]/10">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>500+ student master directory &amp; filters</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Google Sheet bidirectional synchronization</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Training Demand Calculator (bootcamp budgets)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Role-based security &amp; audit logging</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleLaunch('admin-dashboard')}
              className="apex-summit-btn-midnight relative z-10 w-full py-3.5 px-4 rounded-xl font-extrabold text-xs text-white flex items-center justify-center gap-2 cursor-pointer group/btn"
            >
              <span>ENTER PLACEMENT CELL</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1 shrink-0" />
            </button>
          </SummitTiltCard>
        </div>
      </section>

      {/* ===================== 5. KEYNOTE REFLECTION SECTION ===================== */}
      <section className="apex-scroll-reveal pt-2">
        <div className="apex-keynote-surface p-8 sm:p-12 lg:p-14 rounded-[2rem] relative overflow-hidden space-y-7">
          {/* Restrained Decorative Quotation Motif */}
          <svg
            aria-hidden="true"
            viewBox="0 0 120 96"
            fill="none"
            className="absolute top-6 right-8 w-20 sm:w-28 h-auto pointer-events-none opacity-25 apex-float-reverse"
          >
            <defs>
              <linearGradient id="quoteMotifGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#06D6F2" />
              </linearGradient>
            </defs>
            <path
              d="M46 16C26 24 16 41 16 62C16 77 26 86 38 86C49 86 57 78 57 67C57 57 50 50 40 50C37 50 34 51 33 52C35 38 43 29 54 24L46 16ZM102 16C82 24 72 41 72 62C72 77 82 86 94 86C105 86 113 78 113 67C113 57 106 50 96 50C93 50 90 51 89 52C91 38 99 29 110 24L102 16Z"
              fill="url(#quoteMotifGrad)"
            />
          </svg>

          <blockquote className="relative z-10 text-xl sm:text-2xl lg:text-3xl font-extrabold leading-snug tracking-tight text-[#11152B] max-w-4xl text-balance">
            &ldquo;Placements are not won by cramming frameworks in the final semester. They are won through disciplined foundational mastery, clean end-to-end architectures, and knowing your exact gaps before stepping into the interview room.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* ===================== 6. FINAL CALL-TO-ACTION SECTION ===================== */}
      <section className="apex-scroll-reveal pt-2">
        <div className="apex-final-cta-surface p-8 sm:p-11 lg:p-14 rounded-[2rem] relative overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="relative z-10 space-y-3 max-w-2xl min-w-0">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#11152B] leading-tight text-balance">
              Ready to Accelerate Your Placement Readiness?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-[#11152B]/72 leading-relaxed">
              Join 500+ candidates in Batch 2022–2026. Explore the complete 4-round syllabus, compile your LaTeX resume, or verify departmental skill endorsements.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => handleLaunch('login')}
              className="apex-summit-cta-primary group/final px-7 sm:px-8 py-4 rounded-2xl font-extrabold text-xs sm:text-sm text-white inline-flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
            >
              <span className="relative z-10">ACCESS 3-WAY PORTAL</span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover/final:translate-x-1 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleLaunch('placement-guide')}
              className="apex-summit-btn-lavender px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm text-[#11152B] cursor-pointer whitespace-nowrap"
            >
              <span>VIEW CRT SYLLABUS</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
