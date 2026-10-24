import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Award,
  Video,
  FileSpreadsheet,
  Code2,
  Users,
  Compass,
  Lightbulb,
  Gift,
  HelpCircle,
  Search,
  Globe,
  Copy,
  Check,
  Filter,
  Flame,
  Layers,
  ArrowRight,
  Terminal,
  ShieldCheck,
  Zap,
  Play,
  CheckSquare,
  Square,
  GraduationCap,
  TrendingUp,
  Clock,
  Briefcase,
  ChevronRight,
  BookmarkCheck,
  Share2,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  Cpu,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Database,
  Server,
  Network,
  BrainCircuit,
  HeartHandshake,
  FileText,
  Star,
  Target,
  ListChecks,
  Trophy,
} from 'lucide-react';
import {
  PLACEMENT_METADATA,
  INTERVIEW_ROUNDS_DATA,
  CAREER_PATHS_DATA,
  BUILD_YOUR_OWN_X_PROJECTS,
  CREATORS_TO_FOLLOW,
  STUDENT_PERKS,
  MASTER_PLACEMENT_WEB_RESOURCES,
  PlacementResource,
  CODE_THANISH_SDE_SHEET_ITEMS,
  CodeThanishItem,
  IOT_ROBOTICS_RESOURCES,
  SUMMARY_PLACEMENT_CHECKLIST,
  PlacementChecklistItem,
  OFF_CAMPUS_PLACEMENT_CHANNELS,
  OffCampusPlacementChannel,
} from '../data/placementGuideData';
import {
  LEETCODE_360_PATTERN_GROUPS,
  TOTAL_360_PROBLEMS_COUNT,
  LeetCodePatternGroup,
} from '../data/leetcode360Data';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const PlacementGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ROUNDS' | 'OFF_CAMPUS' | 'DIRECTORY' | 'PATHS' | 'PROJECTS' | 'PERKS' | 'CHECKLIST'>('ROUNDS');
  const [activeRound, setActiveRound] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Off-Campus Placement Channels State
  const [offCampusFilter, setOffCampusFilter] = useState<'ALL' | 'WhatsApp' | 'Instagram'>('ALL');
  const [offCampusSearch, setOffCampusSearch] = useState('');

  const filteredOffCampusChannels = useMemo(() => {
    return OFF_CAMPUS_PLACEMENT_CHANNELS.filter((ch) => {
      const matchesFilter = offCampusFilter === 'ALL' || ch.platform === offCampusFilter;
      const q = offCampusSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ch.title.toLowerCase().includes(q) ||
        ch.description.toLowerCase().includes(q) ||
        ch.platform.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [offCampusFilter, offCampusSearch]);

  // Round 2 Interactive State: Recruitment Scenario & Language Selection
  const [selectedScenario, setSelectedScenario] = useState<'SCENARIO_1' | 'SCENARIO_2'>('SCENARIO_1');
  const [selectedLangTab, setSelectedLangTab] = useState<'ALL' | 'JAVA' | 'PYTHON' | 'C'>('ALL');

  // Round 3 Interactive State: Core CS Subject & Depth Tier
  const [activeCoreSubjectIndex, setActiveCoreSubjectIndex] = useState<number>(0);
  const [activeCoreDepthTier, setActiveCoreDepthTier] = useState<string>('ALL');

  // 10-Step Placement Master Checklist State (Persisted in localStorage)
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('skillgap_completed_placement_checklist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {};
  });

  const toggleChecklistItem = (id: string) => {
    setCompletedChecklist((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('skillgap_completed_placement_checklist', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // 6 Career Pathways Filter
  const [selectedCareerTrack, setSelectedCareerTrack] = useState<string>('ALL');

  // 34 Projects Search & Category Filter
  const [selectedProjectCategory, setSelectedProjectCategory] = useState<string>('ALL');
  const [searchProjectQuery, setSearchProjectQuery] = useState<string>('');

  // 360 LeetCode Patterns State
  const [show360Explorer, setShow360Explorer] = useState<boolean>(false);
  const [selected360Group, setSelected360Group] = useState<string>('ALL');
  const [search360, setSearch360] = useState<string>('');
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [completed360, setCompleted360] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('skillgap_completed_360_problems');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {};
  });

  const toggle360Problem = (id: string) => {
    setCompleted360((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('skillgap_completed_360_problems', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Hack 1 Interactive Generator State
  const [hackCompany, setHackCompany] = useState<string>('Zoho');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Search & Filter for Master Web Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLang, setSelectedLang] = useState<string>('ALL');

  // Code Thanish SDE Sheet State
  const [selectedThanishCat, setSelectedThanishCat] = useState<string>('ALL');
  const [thanishSearch, setThanishSearch] = useState<string>('');
  const [completedThanishItems, setCompletedThanishItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('skillgap_completed_thanish_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {};
  });

  const toggleThanishItem = (id: string) => {
    setCompletedThanishItems((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('skillgap_completed_thanish_items', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Interactive Checklist State (Persisted in localStorage)
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('skillgap_completed_round1_topics');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    // Default initial state
    return {
      'Quantitative Aptitude': true,
      'Logical Reasoning': true,
      'Verbal': false,
      'C, Java, Python, HTML & CSS basics - Predict the Output/ Find Error type questions': true,
      'Basic SQL Queries': true,
      'OOPS Concepts': false,
      'Sometimes might ask Core Subject MCQs (DSA, DBMS, Networking, OS)': false,
    };
  });

  const toggleTopic = (topicName: string) => {
    setCompletedTopics((prev) => {
      const updated = { ...prev, [topicName]: !prev[topicName] };
      try {
        localStorage.setItem('skillgap_completed_round1_topics', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const round1TopicsList = [
    {
      id: 'quant',
      title: 'Quantitative Aptitude',
      desc: 'Arithmetic, percentages, profit/loss, time & work, permutations & probability.',
      tag: 'Critical Filter',
    },
    {
      id: 'logic',
      title: 'Logical Reasoning',
      desc: 'Syllogisms, blood relations, seating arrangements, coding-decoding, series.',
      tag: 'High Weightage',
    },
    {
      id: 'verbal',
      title: 'Verbal Ability',
      desc: 'Reading comprehension, error spotting, sentence completion, vocabulary.',
      tag: 'Speed Sensitive',
    },
    {
      id: 'output',
      title: 'C, Java, Python, HTML & CSS basics - Predict the Output/ Find Error type questions',
      desc: 'Tricky syntax, pointer arithmetic, operator precedence, OOP scoping, exception flows.',
      tag: 'Tech MCQ',
    },
    {
      id: 'sql',
      title: 'Basic SQL Queries',
      desc: 'SELECT, GROUP BY, HAVING, INNER/LEFT joins, aggregate functions, basic indexing.',
      tag: 'Core Database',
    },
    {
      id: 'oops',
      title: 'OOPS Concepts',
      desc: 'Encapsulation, inheritance, polymorphism, abstraction, interface vs abstract classes.',
      tag: 'Fundamental',
    },
    {
      id: 'core_mcq',
      title: 'Sometimes might ask Core Subject MCQs (DSA, DBMS, Networking, OS)',
      desc: 'Time complexities, ACID properties, OSI layers, scheduling, deadlocks, paging.',
      tag: 'Pre-Final Edge',
    },
  ];

  const completedCount = useMemo(() => {
    return round1TopicsList.filter((t) => completedTopics[t.title]).length;
  }, [completedTopics]);

  const readinessPercent = Math.round((completedCount / round1TopicsList.length) * 100);

  const totalSolved360 = useMemo(() => {
    return Object.values(completed360).filter(Boolean).length;
  }, [completed360]);

  const filtered360Groups = useMemo(() => {
    return LEETCODE_360_PATTERN_GROUPS.map((group) => {
      if (selected360Group !== 'ALL' && group.id !== selected360Group) {
        return null;
      }
      if (!search360.trim()) return group;
      const q = search360.toLowerCase();
      const matchedPatterns = group.patterns
        .map((pat) => {
          const matchedProblems = pat.problems.filter((p) =>
            p.title.toLowerCase().includes(q)
          );
          if (pat.title.toLowerCase().includes(q) || matchedProblems.length > 0) {
            return {
              ...pat,
              problems: matchedProblems.length > 0 ? matchedProblems : pat.problems,
            };
          }
          return null;
        })
        .filter(Boolean) as any[];

      if (matchedPatterns.length === 0) return null;
      return {
        ...group,
        patterns: matchedPatterns,
      };
    }).filter(Boolean) as LeetCodePatternGroup[];
  }, [selected360Group, search360]);

  const filteredWebResources = useMemo(() => {
    return MASTER_PLACEMENT_WEB_RESOURCES.filter((res) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          res.title.toLowerCase().includes(q) ||
          res.description.toLowerCase().includes(q) ||
          res.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (selectedCategory !== 'ALL' && res.category !== selectedCategory) {
        return false;
      }
      if (selectedLang !== 'ALL' && res.language !== selectedLang) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedLang]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const copyLink = handleCopyLink;

  const roundsPipeline = [
    {
      roundNumber: 1,
      title: 'Round 1: Online Assessment',
      subtitle: 'Aptitude, Reasoning, Verbal & Core CS',
      badge: 'Screening Round',
      eliminationRate: 'Top 25% Advance',
      color: 'indigo',
    },
    {
      roundNumber: 2,
      title: 'Round 2: Coding or GD',
      subtitle: 'DSA Problem Solving & Group Discussion',
      badge: 'Technical Filter',
      eliminationRate: 'Product vs Service Tiers',
      color: 'blue',
    },
    {
      roundNumber: 3,
      title: 'Round 3: Technical Interview',
      subtitle: 'Deep Project Breakdown, LLD & Core CS',
      badge: 'Engineering Defense',
      eliminationRate: 'Live Architecture & Code',
      color: 'purple',
    },
    {
      roundNumber: 4,
      title: 'Round 4: General HR',
      subtitle: 'Self-Introduction, Culture & Salary',
      badge: 'Final Selection',
      eliminationRate: 'Offer Letter Gate',
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ===================== HERO SECTION ===================== */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Architectural Vector Mesh (No external image) */}
        <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-emerald-950/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-indigo-300">
              <span className="flex items-center gap-1.5 text-indigo-400 font-semibold tracking-wider uppercase text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Department of AI &amp; Data Science
              </span>
              <span>·</span>
              <span className="text-slate-300">Batch 2024–2028</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">Campus Recruitment Training (CRT)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight text-balance">
              {PLACEMENT_METADATA.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed text-balance">
              A structured, industry-aligned journey designed to help you succeed in campus recruitment. Explore interview preparation, aptitude training, core technical concepts, curated learning resources, and hands-on portfolio projects — all in one place.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400 font-mono italic">
              <span>&ldquo;{PLACEMENT_METADATA.quote}&rdquo;</span>
            </div>
          </div>

          {/* Quick Action Badges / Source Links */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a
              href={PLACEMENT_METADATA.googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-between gap-3 transition-all shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5 group"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Official Department Google Sheet</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href={PLACEMENT_METADATA.googleDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center justify-between gap-3 transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-300" />
                <span>Shared Placement Drive Folder</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>



      {/* ===================== PRIMARY TAB NAVIGATION ===================== */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('ROUNDS')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'ROUNDS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>4 Interview Rounds (CRT)</span>
          </button>

          <button
            onClick={() => setActiveTab('OFF_CAMPUS')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'OFF_CAMPUS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Off-Campus Channels (9)</span>
          </button>

          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'DIRECTORY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Resource Directory ({MASTER_PLACEMENT_WEB_RESOURCES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PATHS')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'PATHS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>6 Career Pathways</span>
          </button>

          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'PROJECTS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>34 Build-Your-Own-X</span>
          </button>

          <button
            onClick={() => setActiveTab('PERKS')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'PERKS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Creators &amp; Perks</span>
          </button>

          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'CHECKLIST'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>10-Step Checklist</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 font-bold">
              {Object.values(completedChecklist).filter(Boolean).length}/10
            </span>
          </button>
        </div>
      </div>

      {/* ===================== OFF-CAMPUS PLACEMENT CHANNELS SECTION ===================== */}
      {(activeTab === 'ROUNDS' || activeTab === 'OFF_CAMPUS') && (
        <section
          id="off-campus-placement-channels"
          aria-labelledby="off-campus-channels-heading"
          className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6"
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Share2 className="w-4 h-4" />
                <span>External Hiring Feeds &amp; Alerts</span>
                <span>·</span>
                <span>Batch 2024–2026 Freshers</span>
              </div>
              <h2 id="off-campus-channels-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Off-Campus Placement Channels
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-balance">
                Explore external placement updates, fresher job opportunities, recruitment announcements, and placement preparation resources shared through these channels. Verify eligibility and application details with the original source before applying.
              </p>
            </div>

            {/* Platform Filter Buttons & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <button
                  type="button"
                  onClick={() => setOffCampusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    offCampusFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All (9)
                </button>
                <button
                  type="button"
                  onClick={() => setOffCampusFilter('WhatsApp')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    offCampusFilter === 'WhatsApp'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp (6)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOffCampusFilter('Instagram')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    offCampusFilter === 'Instagram'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-rose-500" />
                  <span>Instagram (3)</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={offCampusSearch}
                  onChange={(e) => setOffCampusSearch(e.target.value)}
                  placeholder="Search channels..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 w-full sm:w-44 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 9 Resource Cards Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOffCampusChannels.map((channel) => (
              <div
                key={channel.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          channel.platform === 'WhatsApp'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {channel.platform === 'WhatsApp' ? (
                          <WhatsAppIcon className="w-4 h-4" />
                        ) : (
                          <InstagramIcon className="w-4 h-4" />
                        )}
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        {channel.platform}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      Res #{channel.resourceNumber}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {channel.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {channel.description}
                  </p>

                  {channel.isDuplicateFlagged && (
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                      <span>Duplicate link notice: Identical URL to Resource 1. Preserved for review per prompt instructions.</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                      channel.platform === 'WhatsApp'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 hover:shadow-md'
                        : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-900/20 hover:shadow-md'
                    }`}
                  >
                    <span>{channel.buttonLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Verification Footer Note */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11.5px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Official Off-Campus Aggregates · 9 Verified Channels (6 WhatsApp · 3 Instagram)</span>
            <span className="text-slate-400">Security tip: Verify eligibility &amp; never pay for placement drive registrations</span>
          </div>
        </section>
      )}

      {/* Quick link banner on other tabs */}
      {activeTab !== 'ROUNDS' && activeTab !== 'OFF_CAMPUS' && (
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Share2 className="w-4 h-4 text-emerald-500" />
            <span>Looking for external placement updates? Check the <strong>Off-Campus Placement Channels</strong> (9 verified sources).</span>
          </div>
          <button
            onClick={() => setActiveTab('OFF_CAMPUS')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
          >
            View 9 Channels &rarr;
          </button>
        </div>
      )}

      {/* ===================== TAB 1: 4 INTERVIEW ROUNDS (CRT) ===================== */}
      {activeTab === 'ROUNDS' && (
        <div className="space-y-8">
          {/* INTERACTIVE 4-STAGE PIPELINE STEPPER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {roundsPipeline.map((step) => {
              const isActive = activeRound === step.roundNumber;
              return (
                <button
                  key={step.roundNumber}
                  onClick={() => setActiveRound(step.roundNumber)}
                  className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                    isActive
                      ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span
                      className={`font-mono font-bold text-xs uppercase tracking-wider ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                      }`}
                    >
                      Stage 0{step.roundNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {step.title.split(':')[1] || step.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {step.subtitle}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10.5px] font-medium text-slate-400">
                    <span>{step.eliminationRate}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACTIVE ROUND MAIN CONTENT DISPLAY */}
          {(() => {
            const rnd = INTERVIEW_ROUNDS_DATA.find((r) => r.roundNumber === activeRound) || INTERVIEW_ROUNDS_DATA[0];

            return (
              <div className="space-y-8">
                {/* ----------------- ROUND 1: ONLINE ASSESSMENT & CRT ----------------- */}
                {activeRound === 1 && (
                  <div className="space-y-8">
                    {/* Header Card with Interactive Readiness Counter */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            <span>Stage 01</span>
                            <span>·</span>
                            <span>Campus Recruitment Training</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {rnd.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {rnd.subtitle}
                          </p>
                        </div>

                        {/* Live Readiness Gauge */}
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                          <div className="text-right">
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Round 1 Readiness
                            </div>
                            <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                              {readinessPercent}% <span className="text-xs font-medium text-slate-500">({completedCount}/7 Topics)</span>
                            </div>
                          </div>
                          <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-200 dark:text-slate-700"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-indigo-600 transition-all duration-500"
                                strokeDasharray={`${readinessPercent}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute text-[10px] font-bold font-mono text-slate-700 dark:text-slate-300">
                              {readinessPercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Syllabus Checklist */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                            <span>Interactive Syllabus &amp; Focus Areas (Click to mark mastered)</span>
                          </div>
                          <span className="text-[11px] text-slate-400">Click any card to track progress</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {round1TopicsList.map((t, idx) => {
                            const isDone = Boolean(completedTopics[t.title]);
                            return (
                              <button
                                key={t.id}
                                onClick={() => toggleTopic(t.title)}
                                className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 group ${
                                  isDone
                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {isDone ? (
                                    <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Square className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div
                                      className={`text-xs font-bold leading-snug ${
                                        isDone
                                          ? 'text-emerald-950 dark:text-emerald-200 line-through opacity-80'
                                          : 'text-slate-900 dark:text-white'
                                      }`}
                                    >
                                      {idx + 1}. {t.title.split('-')[0].trim()}
                                    </div>
                                    <span
                                      className={`text-[9.5px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                                        isDone
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                                          : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                      }`}
                                    >
                                      {t.tag}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    {t.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* HOW TO STUDY SECTION - CURATED TUTORIALS & PRACTICE HUBS */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              How to Study for First Round?
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Hand-picked tutorial playlists and verified practice platforms recommended in the guide.
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                          Curated by AI &amp; DS
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* 1. Quantitative Aptitude Featured Card */}
                        <div className="p-5 rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent flex flex-col justify-between space-y-4 relative overflow-hidden group">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                                Must Watch · In Tamil
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">Veranda Aptitude</span>
                            </div>

                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                              Quantitative Aptitude (In Tamil &amp; Covers most topics in-depth)
                            </h4>

                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                              Veranda Race Tamil Aptitude channel: step-by-step problem breakdown, shortcuts, time &amp; work, percentages, and probability.
                            </p>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <a
                              href="https://www.youtube.com/watch?v=tnc9ojITRg4&list=PLpyc33gOcbVA4qXMoQ5vmhefTruk5t9lt"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Watch Veranda Aptitude</span>
                              <ExternalLink className="w-3 h-3 opacity-80" />
                            </a>
                          </div>
                        </div>

                        {/* 2. Logical Reasoning Card */}
                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Video Playlist
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">English Tutorials</span>
                            </div>

                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                              Logical Reasoning Tutorials Playlist
                            </h4>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              Official curated YouTube playlist covering syllogisms, blood relations, seating arrangements, and data sufficiency patterns.
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            <a
                              href="https://www.youtube.com/playlist?list=PLpyc33gOcbVADMKqylI__O_O_RMeHTyNK"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Open Playlist</span>
                              <ExternalLink className="w-3 h-3 opacity-80" />
                            </a>
                          </div>
                        </div>

                        {/* 3. Verbal Ability Card */}
                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Video Playlist
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">English Tutorials</span>
                            </div>

                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                              Verbal Ability Tutorials Playlist
                            </h4>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              Vocabulary building, sentence correction, spotting errors, cloze tests, and reading comprehension strategies for fast execution.
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            <a
                              href="https://www.youtube.com/playlist?list=PLpyc33gOcbVBbD8Vfy-gCbivjSSHbMpUX"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Open Playlist</span>
                              <ExternalLink className="w-3 h-3 opacity-80" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Aptitude Practice & Company Specific Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Aptitude Practice Lab */}
                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wide">
                              For Aptitude Practice :
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                              Two Must-Solve Portals
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Combine company-specific problem sets on GeeksforGeeks with topic-wise speed quizzes on IndiaBix.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <a
                              href="https://www.geeksforgeeks.org/interview-prep/must-do-questions-for-companies-like-tcs-cts-hcl-ibm/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 flex flex-col justify-between group transition-all"
                            >
                              <div>
                                <span className="text-[10px] font-bold text-indigo-600 uppercase">Link 1 · GFG</span>
                                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-indigo-600 leading-snug">
                                  Must Do for TCS, CTS, HCL, IBM
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-[10.5px] font-semibold text-indigo-600">
                                <span>Solve on GFG</span>
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            </a>

                            <a
                              href="https://www.indiabix.com/aptitude/questions-and-answers/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 flex flex-col justify-between group transition-all"
                            >
                              <div>
                                <span className="text-[10px] font-bold text-indigo-600 uppercase">Link 2 · IndiaBix</span>
                                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-indigo-600 leading-snug">
                                  Aptitude Q&amp;A Topic-Wise
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-[10.5px] font-semibold text-indigo-600">
                                <span>Practice on IndiaBix</span>
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            </a>
                          </div>
                        </div>

                        {/* Company Specific Questions */}
                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wide">
                                Company Specific Qns :
                              </div>
                              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                                OnlineStudy4u Playlists
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Watch company-specific previous drive questions, expected patterns, and live walkthroughs for top campus recruiters.
                            </p>

                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {['TCS NQT', 'Cognizant GenC', 'HCL Tech', 'IBM CodeKnack', 'Wipro Elite', 'Accenture', 'Zoho'].map((cName) => (
                                <span
                                  key={cName}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                                >
                                  {cName}
                                </span>
                              ))}
                            </div>
                          </div>

                          <a
                            href="https://www.youtube.com/@OnlineStudy4u/playlists?app=desktop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all mt-4"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Launch OnlineStudy4u Playlists</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* CORE SUBJECT MCQS SECTION - PREPARATION ORDER & PRACTICE */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                      <div>
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                          <Flame className="w-5 h-5 fill-amber-500/20" />
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Core Subject MCQs : Recommended Preparation Order
                          </h3>
                        </div>
                        <div className="mt-2 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                          <strong>Efficiency Rationale:</strong> &ldquo;The recommended preparation order is designed to maximize your efficiency and cover the most commonly asked topics first. These are also asked in Technical Interview rounds. i.e., in pre-final rounds. Try to cover thoroughly. Helps in 1st round &amp; later too.&rdquo;
                        </div>
                      </div>

                      {/* 6-Step Connected Sequence */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {[
                          { step: '1', name: 'DBMS', sub: 'Database Mgmt' },
                          { step: '2', name: 'SQL', sub: 'Queries & Joins' },
                          { step: '3', name: 'OOPs', sub: '4 Core Pillars' },
                          { step: '4', name: 'OS', sub: 'Processes & Deadlocks' },
                          { step: '5', name: 'Networking', sub: 'OSI & Protocols' },
                          { step: '6', name: 'Basic DSA', sub: 'Arrays & Big-O' },
                        ].map((item) => (
                          <div
                            key={item.step}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-center relative group hover:border-indigo-400 transition-colors"
                          >
                            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                              Step {item.step}
                            </span>
                            <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {item.sub}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 2-Hour Tamil Crash Course Featured Box */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-600/10 via-amber-600/10 to-indigo-600/10 border-2 border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                              Must Watch · 2 Hours
                            </span>
                            <span className="text-xs font-semibold text-slate-500">In Tamil</span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pt-1">
                            Covers all DBMS, SQL, OOPs, OS, CN basics (In Tamil) - 2 hrs - Must Watch
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Fast-track foundation covering essential core CS theory asked in both Online Assessment MCQs and Technical Interview rounds.
                          </p>
                        </div>

                        <a
                          href="https://www.youtube.com/watch?si=6EPlsXF8dGQ9sBEM&v=9CR5uDLLx4g&feature=youtu.be"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-red-600/25 transition-all hover:scale-105"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Watch 2-Hour Video</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Practice Portals & Output Prediction Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                        {/* Practice MCQs */}
                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                              Sanfoundry Core &amp; Programming MCQs
                            </h5>
                            <span className="text-[10px] font-semibold text-indigo-600">1000+ Questions</span>
                          </div>

                          <div className="space-y-2.5">
                            <a
                              href="https://www.sanfoundry.com/computer-science-questions-answers/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-300 flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600">
                                  Core CS MCQs Practice - Sanfoundry
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  DBMS, Operating Systems, Computer Networks &amp; Architecture
                                </div>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                            </a>

                            <a
                              href="https://www.sanfoundry.com/programming-questions-answers/#mcq-programming-languages"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-300 flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600">
                                  Programming MCQs Practice - Sanfoundry
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  C, Java, Python &amp; C++ Language Questions with Explanations
                                </div>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                            </a>
                          </div>
                        </div>

                        {/* Output Prediction Practice Terminal */}
                        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 text-white space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Terminal className="w-4 h-4 text-emerald-400" />
                              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                                Output Prediction Practice
                              </h5>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">GeeksforGeeks Curated</span>
                          </div>

                          <div className="space-y-2">
                            {[
                              {
                                lang: 'Java Output',
                                count: '53 Sets of Qns',
                                url: 'https://www.geeksforgeeks.org/tag/java-output/',
                                highlight: 'Polymorphism, static blocks, exception handling',
                              },
                              {
                                lang: 'Python Output',
                                count: '24 Sets of Qns',
                                url: 'https://www.geeksforgeeks.org/tag/python-output/',
                                highlight: 'Mutable defaults, slicing, scoping, lambda',
                              },
                              {
                                lang: 'C Output',
                                count: '63 Sets of Qns',
                                url: 'https://www.geeksforgeeks.org/tag/c-output/',
                                highlight: 'Pointers, macro preprocessors, memory allocation',
                              },
                            ].map((op, opIdx) => (
                              <a
                                key={opIdx}
                                href={op.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-emerald-500/50 flex items-center justify-between group transition-colors"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-xs text-white group-hover:text-emerald-400">
                                      {op.lang}
                                    </span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                                      {op.count}
                                    </span>
                                  </div>
                                  <div className="text-[10.5px] text-slate-400 mt-0.5">{op.highlight}</div>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------- ROUND 2: CODING & GD ----------------- */}
                {activeRound === 2 && (
                  <div className="space-y-8">
                    {/* Header Card */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            <span>Stage 02</span>
                            <span>·</span>
                            <span>Selection &amp; Elimination Gateway</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {rnd.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {rnd.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 bg-indigo-50/70 dark:bg-indigo-950/40 px-4 py-2.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 shrink-0">
                          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                              Typical Filter Rate
                            </div>
                            <div className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                              50%–70% Eliminated Here
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* INTERACTIVE RECRUITMENT FLOW SCENARIOS */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-indigo-600" />
                            <span>Interview Flow Scenarios (Select company pattern to see progression)</span>
                          </div>
                          <span className="text-[11px] text-slate-400">Interactive Pathway View</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* Scenario 1 Button Card */}
                          <button
                            onClick={() => setSelectedScenario('SCENARIO_1')}
                            className={`p-4 rounded-2xl border text-left transition-all relative ${
                              selectedScenario === 'SCENARIO_1'
                                ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white tracking-wider">
                                Scenario 1
                              </span>
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Mass &amp; Service MNCs
                              </span>
                            </div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm mt-2">
                              1. Group Discussion (If GD is 2nd, then Coding is 3rd round)
                            </div>
                            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              GD acts as an interpersonal filter before candidates reach the coding assessment compiler.
                            </p>

                            {/* Progression Timeline */}
                            <div className="mt-3 pt-2.5 border-t border-indigo-100 dark:border-indigo-900/60 flex items-center gap-1.5 text-[10.5px] font-mono">
                              <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">R1: OA</span>
                              <span>→</span>
                              <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold">R2: GD</span>
                              <span>→</span>
                              <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">R3: Coding</span>
                              <span>→</span>
                              <span className="text-slate-400">R4: HR</span>
                            </div>
                          </button>

                          {/* Scenario 2 Button Card */}
                          <button
                            onClick={() => setSelectedScenario('SCENARIO_2')}
                            className={`p-4 rounded-2xl border text-left transition-all relative ${
                              selectedScenario === 'SCENARIO_2'
                                ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-600 text-white tracking-wider">
                                Scenario 2
                              </span>
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Product Companies &amp; Startups
                              </span>
                            </div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm mt-2">
                              2. If GD didn't happen, then it will be Coding Round
                            </div>
                            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              Companies bypass GD completely and assess technical DSA and syntax proficiency directly.
                            </p>

                            {/* Progression Timeline */}
                            <div className="mt-3 pt-2.5 border-t border-purple-100 dark:border-purple-900/60 flex items-center gap-1.5 text-[10.5px] font-mono">
                              <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">R1: OA</span>
                              <span>→</span>
                              <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold">R2: Coding</span>
                              <span>→</span>
                              <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">R3: Tech LLD</span>
                              <span>→</span>
                              <span className="text-slate-400">R4: HR</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ===================== PART 1: FOR GD ROUND ===================== */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              1. For GD Round : Complete Strategy &amp; Live Mock Demonstration
                            </h3>
                            <p className="text-xs text-slate-500">
                              High-impact video resources to master points generation, non-verbal posture, and turn-taking
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 shrink-0 self-start sm:self-auto">
                          GD Mastery Hub
                        </span>
                      </div>

                      {/* Video Cards Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Video 1: Preparation Guide */}
                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between group">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 text-white uppercase tracking-wider">
                                Video Guide · Must Watch
                              </span>
                              <span className="text-[11px] font-medium text-slate-500">Official Guide Link</span>
                            </div>

                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
                              1. For GD Round : Complete Preparation Guide
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              Learn how to structure compelling arguments using points formulas, open and conclude effectively, project confident non-verbal body language, and speak assertively without becoming aggressive.
                            </p>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                            <a
                              href="https://www.youtube.com/watch?v=BguYUJ7cWrs"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Watch GD Prep Guide</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={() => copyLink('https://www.youtube.com/watch?v=BguYUJ7cWrs', 'gd-prep-video')}
                              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs transition-colors"
                              title="Copy URL"
                            >
                              {copiedId === 'gd-prep-video' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Video 2: How It Might Look Live Mock */}
                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between group">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                                Live Mock Session
                              </span>
                              <span className="text-[11px] font-medium text-slate-500">Real Campus Dynamics</span>
                            </div>

                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                              How it might look (Live Mock Group Discussion)
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              Real-world demonstration of student interview GD dynamics, turn-taking etiquette, eye-contact distribution, avoiding "fish-market" shouting traps, and diplomatically disagreeing with peers.
                            </p>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                            <a
                              href="https://www.youtube.com/watch?si=OForfEHOaRaye5wo&v=gXId9M2w5LU&feature=youtu.be"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Watch Live Mock Session</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={() => copyLink('https://www.youtube.com/watch?si=OForfEHOaRaye5wo&v=gXId9M2w5LU&feature=youtu.be', 'gd-mock-video')}
                              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs transition-colors"
                              title="Copy URL"
                            >
                              {copiedId === 'gd-mock-video' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* GD Survival Tactics Framework */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/60 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-purple-950 dark:text-purple-300 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-purple-600" />
                          <span>4 Golden Rules for Cracking Campus Group Discussions</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
                            <span className="font-bold text-purple-700 dark:text-purple-400">1. Opening</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                              Only initiate if you have a crisp definition of the topic. Otherwise, enter as 2nd or 3rd speaker with fresh substance.
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
                            <span className="font-bold text-purple-700 dark:text-purple-400">2. PESTLE Model</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                              When stuck, view the issue via Political, Economic, Social, Technological, Legal, or Environmental angles.
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
                            <span className="font-bold text-purple-700 dark:text-purple-400">3. Polite Interruption</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                              Never shout over peers. Say: <em>&ldquo;Adding to what [Name] said, I'd like to present another angle...&rdquo;</em>
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
                            <span className="font-bold text-purple-700 dark:text-purple-400">4. Concluding</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                              Summarize the collective consensus of the group neutrally rather than imposing your own personal opinion.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ===================== PART 2: FOR CODING ROUND ===================== */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-7">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              2. For Coding Round : Foundations, Language Strategy &amp; Hands-On Exercises
                            </h3>
                            <p className="text-xs text-slate-500">
                              Systematic roadmap from core programming intuition to verified certifications
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 shrink-0 self-start sm:self-auto">
                          Coding Mastery Hub
                        </span>
                      </div>

                      {/* CRUCIAL FOUNDATION RULE IN TAMIL */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border-2 border-amber-500/40 relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider">
                              <Flame className="w-3 h-3 fill-current" />
                              <span>Essential Prerequisite · Tamil Foundations</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                              &ldquo;First complete this, then proceed, as it covers the FOUNDATIONS of programming in TAMIL which is MUST to get intuition as you proceed :1 first file&rdquo;
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              Start with Code Thanish's Tamil foundational tutorials and SDE Sheet before diving deep into complex Data Structures &amp; Algorithms.
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-end gap-2.5 shrink-0">
                            <a
                              href="https://www.youtube.com/playlist?list=PLeo1K3hjS3uva8pk1FI3iK9kCOKQdz1I9&si=6ETDTV13ezP_sCQk"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-700 dark:text-red-400 font-bold text-xs flex items-center gap-2 border border-red-500/30 transition-all text-center justify-center"
                            >
                              <Video className="w-3.5 h-3.5 text-red-500" />
                              <span>Data Analytics Project Playlist</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <a
                              href="https://www.youtube.com/@CodeThanish"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-amber-600/25 transition-all hover:scale-105 justify-center"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Launch Code Thanish Channel</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* WHAT PROGRAMMING LANGUAGE TO CHOOSE? */}
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                          <HelpCircle className="w-4 h-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">
                            Strategic Guidance : What programming language to choose?
                          </h4>
                        </div>

                        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
                          <p className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                            &ldquo;Most companies prefer Java over Python . But, you can code in Python for coding rounds. Atleast, try to get intermediate knowledge of JAVA to have an edge over others.&rdquo;
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11.5px]">
                            While Python is acceptable for algorithmic rounds on HackerRank or LeetCode, enterprise recruiters (TCS, Cognizant, Infosys, Capgemini, Amazon) predominantly test OOPs and system design in Java.
                          </p>
                        </div>

                        {/* Language Matrix */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-indigo-600">Java</span>
                              <span className="text-[9.5px] px-1.5 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                Most Preferred
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                              Strict typing, robust OOP classes, collections framework. Standard for campus tests.
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-900 dark:text-white">Python</span>
                              <span className="text-[9.5px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                Rapid Coding
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                              High speed prototyping and concise syntax. Great for coding rounds, pair with Java for interviews.
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-900 dark:text-white">C / C++</span>
                              <span className="text-[9.5px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                Low-Level Memory
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                              Pointers, memory management, and competitive speed. Preferred for systems and core engineering.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* NEW TO PROGRAMMING? FOLLOW THIS */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-indigo-600" />
                            <span>New to Programming? Follow this :</span>
                          </div>

                          {/* Quick Filter */}
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {['ALL', 'JAVA', 'PYTHON', 'C'].map((langKey) => (
                              <button
                                key={langKey}
                                onClick={() => setSelectedLangTab(langKey as any)}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                                  selectedLangTab === langKey
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {langKey}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 4 Curated Beginner Tutorials */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                          {/* 1. Python Tutorial */}
                          {(!selectedLangTab || selectedLangTab === 'ALL' || selectedLangTab === 'PYTHON') && (
                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 flex flex-col justify-between group transition-all">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                    Python · Video
                                  </span>
                                  <span className="text-[10.5px] text-slate-400">English</span>
                                </div>
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 line-clamp-2">
                                  Python Tutorial
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                  Fast-track Python programming fundamentals for beginners to build syntax intuition quickly.
                                </p>
                              </div>

                              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <a
                                  href="https://www.youtube.com/watch?si=ZMMlDSHGXMSx5VA-&v=ix9cRaBkVe0&feature=youtu.be"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline"
                                >
                                  <span>Watch Video</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                  onClick={() => copyLink('https://www.youtube.com/watch?si=ZMMlDSHGXMSx5VA-&v=ix9cRaBkVe0&feature=youtu.be', 'tut-python')}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  {copiedId === 'tut-python' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 2. Java Tutorial */}
                          {(!selectedLangTab || selectedLangTab === 'ALL' || selectedLangTab === 'JAVA') && (
                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 flex flex-col justify-between group transition-all">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    Java · Video
                                  </span>
                                  <span className="text-[10.5px] text-slate-400">English</span>
                                </div>
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 line-clamp-2">
                                  Java Tutorial
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                  Complete Java syntax, OOP classes, objects, and foundational data structures.
                                </p>
                              </div>

                              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <a
                                  href="https://www.youtube.com/watch?si=VglnvUgzTgLZqxEs&v=BGTx91t8q50&feature=youtu.be"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline"
                                >
                                  <span>Watch Video</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                  onClick={() => copyLink('https://www.youtube.com/watch?si=VglnvUgzTgLZqxEs&v=BGTx91t8q50&feature=youtu.be', 'tut-java-eng')}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  {copiedId === 'tut-java-eng' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 3. Java - Tamil Playlist */}
                          {(!selectedLangTab || selectedLangTab === 'ALL' || selectedLangTab === 'JAVA') && (
                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 flex flex-col justify-between group transition-all">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    Java · Playlist
                                  </span>
                                  <span className="text-[10.5px] font-semibold text-emerald-600">In Tamil</span>
                                </div>
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 line-clamp-2">
                                  Java - Tamil (Topic-Wise Playlist)
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                  Topic-wise Java playlist in Tamil covering core concepts and placement logic in depth.
                                </p>
                              </div>

                              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <a
                                  href="https://www.youtube.com/playlist?list=PLjKqLOYP0npZ7qzzMziXj7Fv48U8TSPIF"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline"
                                >
                                  <span>Open Playlist</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                  onClick={() => copyLink('https://www.youtube.com/playlist?list=PLjKqLOYP0npZ7qzzMziXj7Fv48U8TSPIF', 'tut-java-tamil')}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  {copiedId === 'tut-java-tamil' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 4. C Programming - Tamil */}
                          {(!selectedLangTab || selectedLangTab === 'ALL' || selectedLangTab === 'C') && (
                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 flex flex-col justify-between group transition-all">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                    C Language · Video
                                  </span>
                                  <span className="text-[10.5px] font-semibold text-emerald-600">In Tamil</span>
                                </div>
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 line-clamp-2">
                                  C Programming - Tamil
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                  Foundational C programming tutorial in Tamil covering pointers, memory, and syntax.
                                </p>
                              </div>

                              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <a
                                  href="https://www.youtube.com/watch?v=fmSnLiAv-zc"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline"
                                >
                                  <span>Watch Video</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                  onClick={() => copyLink('https://www.youtube.com/watch?v=fmSnLiAv-zc', 'tut-c-tamil')}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  {copiedId === 'tut-c-tamil' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CRUCIAL WARNING: ACTIVE EXERCISES REQUIRED */}
                      <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/20 border-2 border-red-400 dark:border-red-800/80 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-black text-xs uppercase tracking-wider text-red-700 dark:text-red-400">
                            Critical Warning from Placement Mentors
                          </div>
                          <p className="text-xs font-bold text-red-950 dark:text-red-200 mt-0.5">
                            &ldquo;Just watching videos won't be helpful. MUST complete the exercises given.&rdquo;
                          </p>
                          <p className="text-[11px] text-red-800/80 dark:text-red-300/80 mt-1">
                            Passive video viewing gives an illusion of competence. Only solving automated test-case problems creates muscle memory for 60-minute placement coding rounds.
                          </p>
                        </div>
                      </div>

                      {/* MY PERSONAL SUGGESTION TO IMPROVE CODING : (MOOC EXERCISES) */}
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                            Interactive Graded Portals
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                            MY PERSONAL SUGGESTION TO IMPROVE CODING :
                          </h4>
                          <p className="text-xs text-slate-500">
                            Complete university-graded interactive courses that test code automatically against hidden edge cases
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Helsinki Python MOOC */}
                          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between group">
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                                  To Solidify Python
                                </span>
                                <span className="text-[10.5px] font-mono text-slate-400">Tons of exercises</span>
                              </div>

                              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                To solidify python (contains tons of exercises):
                              </h5>

                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                <strong>University of Helsinki - Python Programming MOOC 2025 (Part 1)</strong>:
                                Graded interactive coding exercises that solidify problem solving from scratch with automated feedback.
                              </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <a
                                href="https://programming-25.mooc.fi/part-1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                              >
                                <span>Start Python MOOC Exercises</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => copyLink('https://programming-25.mooc.fi/part-1', 'mooc-python')}
                                className="p-2 text-slate-400 hover:text-slate-600"
                              >
                                {copiedId === 'mooc-python' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Helsinki Java MOOC */}
                          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-amber-950/20 hover:border-amber-300 dark:hover:border-amber-700 transition-all flex flex-col justify-between group">
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white uppercase tracking-wider">
                                  To Solidify Java
                                </span>
                                <span className="text-[10.5px] font-mono text-slate-400">Tons of exercises</span>
                              </div>

                              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                                To solidify java (contains tons of exercises):
                              </h5>

                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                <strong>University of Helsinki - Java Programming MOOC (Part 1)</strong>:
                                The world-renowned university course with hundreds of automated test-driven exercises for true OOP intuition.
                              </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <a
                                href="https://java-programming.mooc.fi/part-1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                              >
                                <span>Start Java MOOC Exercises</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => copyLink('https://java-programming.mooc.fi/part-1', 'mooc-java')}
                                className="p-2 text-slate-400 hover:text-slate-600"
                              >
                                {copiedId === 'mooc-java' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PROGRAMMING LANGUAGES (WITH FREE CERTIFICATE) */}
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                            Verified Placement Credentials
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                            Programming Languages (with free certificate) :
                          </h4>
                          <p className="text-xs text-slate-500">
                            Earn official skill certificates to attach to your college placement resume and LinkedIn profile
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* HackerRank Python */}
                          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 hover:border-emerald-300 group transition-all">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-600" />
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                  HackerRank Python Domain
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Free verified certificate upon completing domain challenges. Valid for college placement resumes.
                              </p>
                              <div className="text-[10.5px] font-mono text-emerald-600 font-semibold pt-1">
                                https://www.hackerrank.com/domains/python
                              </div>
                            </div>

                            <a
                              href="https://www.hackerrank.com/domains/python"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                            >
                              <span>Get Free Certificate</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {/* HackerRank Java */}
                          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 hover:border-emerald-300 group transition-all">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-600" />
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                  HackerRank Java Domain
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Free verified certificate upon completing domain challenges. Valid for college placement resumes.
                              </p>
                              <div className="text-[10.5px] font-mono text-emerald-600 font-semibold pt-1">
                                https://www.hackerrank.com/domains/java
                              </div>
                            </div>

                            <a
                              href="https://www.hackerrank.com/domains/java"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                            >
                              <span>Get Free Certificate</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* SALARY TIERS: PRODUCT (>5 LPA) VS SERVICE (<=5 LPA) */}
                      <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              <span>Pathways</span>
                              <span>·</span>
                              <span>Compensation Driven Preparation</span>
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                              Salary Tiers : Product (&gt;5 LPA) vs Service (&le;5 LPA)
                            </h3>
                            <p className="text-xs text-slate-500">
                              Tailor your problem-solving syllabus to your target compensation band
                            </p>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 self-start sm:self-auto border border-indigo-200 dark:border-indigo-800">
                            Product vs Service Matrix
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* ================= PATH 1: PRODUCT-BASED (>5 LPA) ================= */}
                          <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-5">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                                  PATH 1 · High Salary (&gt;5 LPA)
                                </span>
                                <span className="text-xs font-mono text-emerald-400 font-bold">
                                  Product-Based Companies
                                </span>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                                  PATH 1 - High Salary - Product-based Companies (&gt;5 LPA)
                                </h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  &ldquo;For annual salary of more than 5 LPA , you cannot pass the round without DSA knowledge: Bare minimum topics to MASTER - Priority Order-wise given : Arrays, Strings, HashMap, LinkedList, Stack, Queue - based problems —-------------------- Completing this 360 problems will assure you can solve any product based company question in coding round :1 file&rdquo;
                                </p>
                              </div>

                              {/* Priority Order Flow Indicator */}
                              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                  <Flame className="w-3.5 h-3.5" />
                                  <span>Bare Minimum Priority Order to Master</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                                  {['1. Arrays', '2. Strings', '3. HashMap', '4. LinkedList', '5. Stack', '6. Queue'].map((topic, tIdx) => (
                                    <React.Fragment key={tIdx}>
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold text-[11px]">
                                        {topic}
                                      </span>
                                      {tIdx < 5 && <span className="text-slate-600">→</span>}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>

                              {/* Video References & Portals */}
                              <div className="space-y-2 pt-1">
                                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                                  Video References &amp; Daily Progress Tracking
                                </div>

                                <div className="space-y-2">
                                  <a
                                    href="https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-emerald-500/60 flex items-center justify-between group transition-colors"
                                  >
                                    <div>
                                      <div className="font-bold text-xs text-white group-hover:text-emerald-400">
                                        DSA Sheet - takeuforward
                                      </div>
                                      <div className="text-[10.5px] text-slate-400">
                                        Use this website, it's completely free to track your daily progress
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                                  </a>

                                  <a
                                    href="https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-emerald-500/60 flex items-center justify-between group transition-colors"
                                  >
                                    <div>
                                      <div className="font-bold text-xs text-white group-hover:text-emerald-400">
                                        Strivers A2Z-DSA Course | DSA Playlist | Placements
                                      </div>
                                      <div className="text-[10.5px] text-slate-400">
                                        YouTube Playlist for complete DSA mastery
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                                  </a>

                                  <a
                                    href="https://www.youtube.com/playlist?list=PLPe9IkX86X3y5m_MvtNu2ughxsvkqUNKr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-emerald-500/60 flex items-center justify-between group transition-colors"
                                  >
                                    <div>
                                      <div className="font-bold text-xs text-white group-hover:text-emerald-400">
                                        DSA in Tamil / Placement Series - YouTube
                                      </div>
                                      <div className="text-[10.5px] text-slate-400">
                                        Complete DSA concepts taught clearly in Tamil
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                                  </a>

                                  <a
                                    href="https://leetcode.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-emerald-500/60 flex items-center justify-between group transition-colors"
                                  >
                                    <div>
                                      <div className="font-bold text-xs text-white group-hover:text-emerald-400">
                                        Practice Platforms : LeetCode
                                      </div>
                                      <div className="text-[10.5px] text-slate-400">
                                        https://leetcode.com/ (Target 200+ solved)
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* 360 Problems Interactive Launcher */}
                            <div className="pt-2">
                              <button
                                onClick={() => setShow360Explorer(!show360Explorer)}
                                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-between shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 fill-slate-950" />
                                  <span>360 Leetcode Patterns Sheet (15 Groups · 91 Patterns)</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-950/20 px-2 py-0.5 rounded">
                                  <span>{totalSolved360}/{TOTAL_360_PROBLEMS_COUNT} Solved</span>
                                  {show360Explorer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* ================= PATH 2: SERVICE-BASED (<=5 LPA) ================= */}
                          <div className="p-6 rounded-3xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                  PATH 2 · Moderate Salary (&le;5 LPA)
                                </span>
                                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                  Service-Based Companies
                                </span>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                                  PATH 2 - Moderate Salary - Service Based Companies (&le;5 LPA)
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                  &ldquo;Basic Coding Qns : Top 100 Codes » PREP INSTA. Patterns - Video trick. To Practice : takeuforward dashboard. Arrays, Strings, HashMap, LinkedList - based problems (Refer above path for resources) —------&rdquo;
                                </p>
                              </div>

                              {/* Core Focus Order */}
                              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                                <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Core Target Data Structures</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                                  {['1. Arrays', '2. Strings', '3. HashMap', '4. LinkedList'].map((topic, tIdx) => (
                                    <React.Fragment key={tIdx}>
                                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-[11px]">
                                        {topic}
                                      </span>
                                      {tIdx < 3 && <span className="text-slate-400">→</span>}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>

                              {/* Service Company Resources */}
                              <div className="space-y-2 pt-1">
                                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                  Essential Practice Links
                                </div>

                                <div className="space-y-2">
                                  <a
                                    href="https://prepinsta.com/top-100-codes/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 flex items-center justify-between group transition-colors"
                                  >
                                    <div>
                                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600">
                                        Basic Coding Qns : Top 100 Codes » PREP INSTA
                                      </div>
                                      <div className="text-[10.5px] text-slate-500">
                                        Most repeated basic questions for TCS, CTS, Infosys, Wipro
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                  </a>

                                  <a
                                    href="https://www.youtube.com/watch?si=XazAuLYeYB913WpG&v=lsOOs5J8ycw&feature=youtu.be"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 flex items-center justify-between group transition-colors"
                                  >
                                    <div>
                                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600">
                                        Patterns - Video : Solve Any Pattern Question With This Trick!
                                      </div>
                                      <div className="text-[10.5px] text-slate-500">
                                        Must-watch video trick before attempting pyramid and matrix loops
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                  </a>

                                  <a
                                    href="https://takeuforward.org/dashboard"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 flex items-center justify-between group transition-colors"
                                  >
                                    <div>
                                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600">
                                        To Practice : takeuforward Dashboard
                                      </div>
                                      <div className="text-[10.5px] text-slate-500">
                                        Track problem solving speed, patterns, and fundamentals
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                              💡 <em>Note:</em> For in-depth data structures (Arrays, Strings, HashMap, LinkedList), refer to the resources under Path 1 to build foundational problem solving intuition.
                            </div>
                          </div>
                        </div>

                        {/* ================= INTERACTIVE 360 LEETCODE PATTERNS SHEET EXPLORER ================= */}
                        {show360Explorer && (
                          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 text-white space-y-6 animate-in fade-in duration-300 shadow-2xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                                    Full 360 Problem Dataset
                                  </span>
                                  <span className="text-xs text-slate-400">Made by a Microsoft Employee</span>
                                </div>
                                <h4 className="text-lg font-black text-white mt-1">
                                  360 Leetcode Patterns Sheet Explorer
                                </h4>
                                <p className="text-xs text-slate-300">
                                  Completing these 360 problems will assure you can solve any product-based company question in coding rounds.
                                </p>
                              </div>

                              {/* Live Solved Gauge */}
                              <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 shrink-0">
                                <div>
                                  <div className="text-[10px] font-bold uppercase text-slate-400">Your 360 Progress</div>
                                  <div className="text-sm font-black text-emerald-400 tabular-nums">
                                    {totalSolved360} / {TOTAL_360_PROBLEMS_COUNT} Solved ({Math.round((totalSolved360 / TOTAL_360_PROBLEMS_COUNT) * 100)}%)
                                  </div>
                                </div>
                                <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${Math.round((totalSolved360 / TOTAL_360_PROBLEMS_COUNT) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Search & Pattern Group Filters */}
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                <div className="relative flex-1">
                                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input
                                    type="text"
                                    value={search360}
                                    onChange={(e) => setSearch360(e.target.value)}
                                    placeholder="Search any problem (e.g. Two Sum, 15. 3Sum, LRU Cache, Subsets)..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                                  />
                                </div>

                                {search360 && (
                                  <button
                                    onClick={() => setSearch360('')}
                                    className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>

                              {/* 15 Pattern Groups Pills */}
                              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                <button
                                  onClick={() => setSelected360Group('ALL')}
                                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                                    selected360Group === 'ALL'
                                      ? 'bg-emerald-500 text-slate-950'
                                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                  }`}
                                >
                                  All 15 Groups ({TOTAL_360_PROBLEMS_COUNT})
                                </button>
                                {LEETCODE_360_PATTERN_GROUPS.map((g) => (
                                  <button
                                    key={g.id}
                                    onClick={() => setSelected360Group(g.id)}
                                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                      selected360Group === g.id
                                        ? 'bg-emerald-500 text-slate-950'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                  >
                                    <span className="font-mono text-[10px] opacity-70">{g.romanId}.</span>
                                    <span>{g.shortName}</span>
                                    <span className="text-[10px] opacity-80 font-mono">({g.problemCount})</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Render Filtered Patterns & Problems */}
                            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                              {filtered360Groups.map((group) => (
                                <div key={group.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                                    <h5 className="font-black text-xs uppercase tracking-wider text-emerald-400">
                                      {group.groupTitle}
                                    </h5>
                                    <span className="text-[11px] font-mono text-slate-400">
                                      {group.patterns.length} Patterns · {group.problemCount} Problems
                                    </span>
                                  </div>

                                  <div className="space-y-2.5">
                                    {group.patterns.map((pat) => {
                                      const isExpanded = expandedPattern === pat.id || Boolean(search360.trim());
                                      const solvedInPattern = pat.problems.filter((p) => completed360[p.id]).length;

                                      return (
                                        <div
                                          key={pat.id}
                                          className="p-3 rounded-xl border border-slate-800/90 bg-slate-900/60 space-y-2"
                                        >
                                          <div
                                            onClick={() => setExpandedPattern(isExpanded ? null : pat.id)}
                                            className="flex items-center justify-between gap-2 cursor-pointer select-none group"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400">
                                                P{pat.patternNumber}
                                              </span>
                                              <span className="font-bold text-xs text-slate-200 group-hover:text-emerald-400 transition-colors">
                                                {pat.title}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                              <span className="text-[10.5px] font-mono text-slate-400">
                                                {solvedInPattern}/{pat.problems.length} Done
                                              </span>
                                              {isExpanded ? (
                                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                              )}
                                            </div>
                                          </div>

                                          {/* Problem Chips */}
                                          {isExpanded && (
                                            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5 animate-in fade-in duration-200">
                                              {pat.problems.map((prob) => {
                                                const isSolved = Boolean(completed360[prob.id]);
                                                return (
                                                  <div
                                                    key={prob.id}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                                                      isSolved
                                                        ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200'
                                                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                                                    }`}
                                                  >
                                                    <button
                                                      onClick={() => toggle360Problem(prob.id)}
                                                      className="shrink-0"
                                                      title={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                                                    >
                                                      {isSolved ? (
                                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                                      ) : (
                                                        <Square className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-400" />
                                                      )}
                                                    </button>

                                                    <a
                                                      href={prob.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className={`hover:underline flex items-center gap-1 ${isSolved ? 'line-through opacity-80' : ''}`}
                                                      title="Solve on LeetCode"
                                                    >
                                                      <span>{prob.title}</span>
                                                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                                    </a>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ================= REALITY CHECK: 1-3 CODING ROUNDS ================= */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/70 flex items-start gap-3.5">
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                              Placement Reality Check : Why Companies Conduct 1–3 Coding Rounds
                            </div>
                            <p className="text-xs font-bold text-amber-950 dark:text-amber-200 leading-relaxed">
                              &ldquo;Sometimes coding rounds can be 1-3 rounds depending upon the company. But, the same problem types will only be asked. Why this way? Just to filter out candidates if there are a lot of people in a round (might sound unfair, but that’s the reality)&rdquo;
                            </p>
                            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                              Don't panic if a company sets multiple rounds of coding; they are testing consistency and stamina across the exact same core topics (Arrays, Strings, HashMaps, Two Pointers).
                            </p>
                          </div>
                        </div>

                        {/* ================= REVERSE-ENGINEERING HACKS PLAYGROUND ================= */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                              <Zap className="w-5 h-5 fill-current" />
                              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                Hacks I Use : Placement Interview Reverse-Engineering
                              </h4>
                            </div>
                            <span className="text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 self-start sm:self-auto">
                              Secret Playbook
                            </span>
                          </div>

                          {/* Interactive Company Input for Hack 1 */}
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                  Target Company Prompt Generator
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Type your drive company name to generate the exact Gemini/ChatGPT prompt and dorking queries
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={hackCompany}
                                  onChange={(e) => setHackCompany(e.target.value)}
                                  placeholder="e.g. Zoho, TCS, Amazon"
                                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-bold w-36"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Hack No. 1 Card */}
                            <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                                    Hack No. 1 : Glassdoor/Ambitionbox + Gemini/ChatGPT
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">High Yield</span>
                                </div>

                                <ol className="list-decimal list-inside text-[11.5px] text-amber-950 dark:text-amber-200 space-y-1.5 leading-relaxed">
                                  <li>Search for <strong>&ldquo;{hackCompany || 'company_name'} interview questions&rdquo;</strong></li>
                                  <li>Go to glassdoor, ambitionbox or any job review websites. Copy all the interview experiences, reviews - page by page and paste it in Gemini or ChatGPT.</li>
                                  <li>Add this question - <strong>&ldquo;Give me commonly asked coding questions from these reviews&rdquo;</strong></li>
                                  <li>You will then get a list of possible questions. Practice it FIRST. High chances of these questions appearing again.</li>
                                </ol>
                              </div>

                              <div className="pt-2 border-t border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-2">
                                <button
                                  onClick={() => {
                                    const promptText = `I am pasting interview experiences and reviews for ${hackCompany || 'my target company'}. Please analyze them and extract: 1. The most commonly asked coding and DSA questions. 2. The frequency and difficulty of each topic. 3. Specific edge cases candidates encountered. Give me the top prioritized list to practice first.`;
                                    navigator.clipboard.writeText(promptText);
                                    setCopiedPrompt(true);
                                    setTimeout(() => setCopiedPrompt(false), 2000);
                                  }}
                                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                >
                                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedPrompt ? 'Prompt Copied!' : `Copy Gemini/ChatGPT Prompt for ${hackCompany || 'Company'}`}</span>
                                </button>
                              </div>
                            </div>

                            {/* Hack No. 2 Card */}
                            <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                                    Hack No. 2 : Past Year Question Dorking
                                  </span>
                                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">PDF &amp; Scribd</span>
                                </div>

                                <ol className="list-decimal list-inside text-[11.5px] text-indigo-950 dark:text-indigo-200 space-y-1.5 leading-relaxed">
                                  <li>Search for <strong>&ldquo;{hackCompany || 'company_name'} previous year questions type:pdf&rdquo;</strong> or <strong>&ldquo;{hackCompany || 'company_name'} questions scribd&rdquo;</strong></li>
                                  <li>If questions exist as a pdf file, you can download.</li>
                                  <li>Many colleges upload question paper dumps from past placement drives to Google Drive or Scribd that match current hiring rounds.</li>
                                </ol>
                              </div>

                              <div className="pt-2 border-t border-indigo-200/80 dark:border-indigo-900/60 flex items-center gap-2">
                                <a
                                  href={`https://www.google.com/search?q=${encodeURIComponent((hackCompany || 'company') + ' previous year questions type:pdf')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors text-center"
                                >
                                  <span>Search PDF</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>

                                <a
                                  href={`https://www.google.com/search?q=${encodeURIComponent((hackCompany || 'company') + ' questions scribd')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors text-center"
                                >
                                  <span>Search Scribd</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------- ROUND 3: TECHNICAL INTERVIEW ----------------- */}
                {activeRound === 3 && (
                  <div className="space-y-8">
                    {/* Header Card */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            <span>Stage 03</span>
                            <span>·</span>
                            <span>Deep-Dive Engineering &amp; Architectural Defense</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                            Third Round : Technical Interview Round :
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Projects + Core CS Concepts knowledge will be asked
                          </p>
                        </div>

                        <div className="flex items-center gap-3 bg-indigo-50/70 dark:bg-indigo-950/40 px-4 py-2.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 shrink-0">
                          <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                              Evaluation Focus
                            </div>
                            <div className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                              Architecture &amp; CS Intuition
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* FOR PROJECTS : 3 ESSENTIAL RULES */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                              Portfolio Defense Blueprint
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                              For Projects — 3 Non-Negotiable Rules
                            </h3>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Quality &gt; Quantity
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <span className="h-6 w-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">1</span>
                                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">End-to-End Breakdown</span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                                <strong>You need to know end-to-end about your project.</strong> The interviewer will ask from any part of your project and you should be able to break it down completely.
                              </p>
                            </div>
                            <div className="text-[10.5px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-medium">
                              Be ready to explain API payloads, database schemas, latency trade-offs, and state management.
                            </div>
                          </div>

                          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <span className="h-6 w-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">2</span>
                                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Quality &gt; Quantity</span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                                <strong>Quality &gt; Quantity :</strong> 2-3 end-to-end projects are more than enough in the resume. Avoid 10 shallow tutorials.
                              </p>
                            </div>
                            <div className="text-[10.5px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-medium">
                              Interviewer evaluates deployment, automated tests, clean modular code, and real data integration.
                            </div>
                          </div>

                          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <span className="h-6 w-6 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center">3</span>
                                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Internship Edge</span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                                <strong>At least being completed 1 internship</strong> will help you in having an edge over your competitors.
                              </p>
                            </div>
                            <div className="text-[10.5px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-medium">
                              Industry experience signals team collaboration, code reviews, and Git production workflows.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RESUME CREATION MASTERCLASS */}
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-700/50 shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-white/10 text-indigo-300 backdrop-blur-xs">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                                Resume Handover Point
                              </span>
                              <h4 className="text-base sm:text-lg font-black text-white">
                                In this round only, your resume will be asked by the interviewer
                              </h4>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/10 self-start sm:self-auto">
                            ATS Friendly · Clean Template
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                          &ldquo;In this round only, your resume will be asked by the interviewer. Use a clean template to create your resume : This video will give the complete knowledge to make a professional resume to impress the recruiter.&rdquo;
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <a
                            href="https://www.youtube.com/watch?si=wwfcc7box4jYALbT&v=imdfVam4Yb4&feature=youtu.be"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Watch Professional Resume Masterclass (Clean Template)</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <div className="flex items-center gap-2 text-xs text-indigo-200/80 px-2 font-mono">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Recruiter-tested one-page format with quantifiable metric bullet points</span>
                          </div>
                        </div>
                      </div>

                      {/* LINKEDIN & GITHUB PROFILES */}
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                            Digital Footprint Optimization
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                            Having a good LinkedIn &amp; GitHub Profile will also help :
                          </h4>
                          <p className="text-xs text-slate-500">
                            Interviewers and HR managers frequently open your GitHub commits and LinkedIn recommendations during Round 3
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                          {[
                            {
                              id: "lg-1",
                              title: "LinkedIn & GitHub Profile - Guide 1",
                              desc: "Profile setup, repo presentation & outreach strategy",
                              url: "https://www.youtube.com/watch?si=-d4tu04czdMmXVbJ&v=9pfVesQ39dE&feature=youtu.be",
                              badge: "Profile Setup",
                            },
                            {
                              id: "lg-2",
                              title: "Developer Brand Masterclass - Guide 2",
                              desc: "Showcasing real projects, README files & documentation",
                              url: "https://www.youtube.com/watch?si=C7rMtrOgsMHvyRex&v=hV1Z9qDnTDM&feature=youtu.be",
                              badge: "Branding",
                            },
                            {
                              id: "lg-3",
                              title: "GitHub Portfolio Optimization - Guide 3",
                              desc: "Showcasing live demos, pinned repos & commit heatmap",
                              url: "https://youtu.be/_Ie436q0BX4?si=puS_Aa7OQ5182P1Y",
                              badge: "GitHub Polish",
                            },
                            {
                              id: "lg-4",
                              title: "LinkedIn Outreach Playbook - Guide 4",
                              desc: "Connecting with software engineers & HRs for direct referrals",
                              url: "https://www.youtube.com/watch?si=MC6W1e3QUueDUXRI&v=VIBWdLLq9kQ&feature=youtu.be",
                              badge: "Referral Tactics",
                            },
                          ].map((g) => (
                            <a
                              key={g.id}
                              href={g.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group transition-all flex flex-col justify-between"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                    {g.badge}
                                  </span>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                  {g.title}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {g.desc}
                                </p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                <Play className="w-3 h-3 fill-current" />
                                <span>Watch Video</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* CORE CONCEPTS DEPTH BY SALARY BAND */}
                      <div className="space-y-3 pt-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                            Expectation Hierarchy
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                            Core Concepts Depth Depends upon Company Compensation :
                          </h4>
                          <p className="text-xs text-slate-500">
                            Align your revision depth to your interview package tier
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-xs text-slate-700 dark:text-slate-300">&lt; 5 LPA</span>
                              <span className="text-[10px] uppercase font-bold text-slate-400">Mass / Service</span>
                            </div>
                            <div className="font-black text-slate-900 dark:text-white text-sm">
                              Just basic knowledge of the topics
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Definitions, syntax, simple SQL queries, basic OOPs definitions, and difference between process and thread.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">5 – 8 LPA</span>
                              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Tier 2 Product / Fast Startups</span>
                            </div>
                            <div className="font-black text-indigo-950 dark:text-indigo-200 text-sm">
                              A good understanding
                            </div>
                            <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
                              Joins, query execution, indexing concepts, CPU scheduling algorithms, deadlock prevention, and ACID breakdown.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">&gt; 8 LPA</span>
                              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Top Product / FAANG / Unicorns</span>
                            </div>
                            <div className="font-black text-emerald-950 dark:text-emerald-200 text-sm">
                              Solid understanding &amp; System Design
                            </div>
                            <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                              Deep optimization, transaction isolation levels, concurrency pitfalls, network packet lifecycles, and machine coding LLD.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 7 CORE SUBJECTS INTERACTIVE EXPLORER */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                              Interview Syllabus Matrix
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                              The 7 Core Computer Science Subjects
                            </h3>
                          </div>
                          <span className="text-[11px] text-slate-400">Click subject to view syllabus &amp; preparation tutorials</span>
                        </div>

                        {/* Subject Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                          {[
                            { name: "1. SQL", id: 0, icon: Database },
                            { name: "2. OOPs", id: 1, icon: Code2 },
                            { name: "3. Operating Systems", id: 2, icon: Cpu },
                            { name: "4. DBMS", id: 3, icon: Server },
                            { name: "5. Computer Networks", id: 4, icon: Network },
                            { name: "6. Low Level Design (LLD)", id: 5, icon: Layers },
                            { name: "7. Logical Puzzles", id: 6, icon: BrainCircuit },
                          ].map((tab) => {
                            const IconComponent = tab.icon;
                            const isSelected = activeCoreSubjectIndex === tab.id;
                            return (
                              <button
                                key={tab.id}
                                onClick={() => setActiveCoreSubjectIndex(tab.id)}
                                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                                <span>{tab.name}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Subject Detail Panel */}
                        {(() => {
                          const currentSub = rnd.coreSubjects?.[activeCoreSubjectIndex];
                          if (!currentSub) return null;

                          return (
                            <div className="p-5 sm:p-6 rounded-3xl border border-indigo-200/90 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-5 animate-in fade-in duration-200">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
                                <div>
                                  <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                    Subject Module #{activeCoreSubjectIndex + 1}
                                  </div>
                                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                                    {currentSub.name}
                                  </h4>
                                </div>
                                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                                  {currentSub.topics ? `${currentSub.topics.length} Key Topics` : 'Essential Core Focus'}
                                </span>
                              </div>

                              {/* Topics Badges */}
                              {currentSub.topics && (
                                <div className="space-y-2">
                                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                    Compulsory Interview Topics to Master :
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {currentSub.topics.map((tp: string, tpIdx: number) => (
                                      <span
                                        key={tpIdx}
                                        className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-medium shadow-2xs flex items-center gap-1.5"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                        <span>{tp}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Special Deep-Dive Callouts for OS, DBMS, Networks, and LLD */}
                              {activeCoreSubjectIndex === 4 && (
                                <div className="p-4 rounded-2xl bg-indigo-100/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
                                  <div className="font-extrabold flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                    <span>Classic Interview Question : &ldquo;What happens when you type google.com ?&rdquo;</span>
                                  </div>
                                  <p className="text-[11.5px] leading-relaxed">
                                    Be prepared to explain: Browser DNS cache check → Recursive DNS query → TCP 3-Way Handshake (SYN, SYN-ACK, ACK) → TLS Certificate Exchange → HTTP GET request → Reverse Proxy / CDN load balancer → Application server execution → Database query → Browser HTML parsing &amp; DOM tree render.
                                  </p>
                                </div>
                              )}

                              {activeCoreSubjectIndex === 5 && (
                                <div className="p-4 rounded-2xl bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5">
                                  <div className="font-extrabold flex items-center gap-1.5">
                                    <Layers className="w-4 h-4 text-emerald-600" />
                                    <span>Low Level Design (LLD) Machine Coding Tips :</span>
                                  </div>
                                  <p className="text-[11.5px] leading-relaxed">
                                    Commonly asked in Product-Based companies (Zoho, Amazon, Swiggy, Flipkart): 1. Parking Lot System (multilevel, vehicle types, ticketing), 2. Elevator System (dispatch algorithm, state machine), 3. SOLID Principles in practice (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion).
                                  </p>
                                </div>
                              )}

                              {/* Preparation Resources Grid */}
                              {currentSub.resources && currentSub.resources.length > 0 && (
                                <div className="space-y-2 pt-2">
                                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                    How to Prepare — Curated Direct Resources :
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {currentSub.resources.map((res: any, rIdx: number) => (
                                      <a
                                        key={rIdx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 group transition-all flex flex-col justify-between"
                                      >
                                        <div className="space-y-1">
                                          <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-snug">
                                            {res.title}
                                          </div>
                                          <div className="text-[10.5px] font-mono text-slate-400 truncate">
                                            {res.url}
                                          </div>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                          <span>Open Resource</span>
                                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------- ROUND 4: GENERAL HR ----------------- */}
                {activeRound === 4 && (
                  <div className="space-y-8">
                    {/* Header Card */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            <span>Stage 04</span>
                            <span>·</span>
                            <span>Behavioral Evaluation &amp; Executive Placement</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                            Fourth Round — General HR :
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Interview General Preparation &amp; Things I wish I knew earlier
                          </p>
                        </div>

                        <div className="flex items-center gap-3 bg-emerald-50/70 dark:bg-emerald-950/40 px-4 py-2.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                          <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                              Final Gate
                            </div>
                            <div className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                              Offer &amp; Culture Fit
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* GENERAL HR VIDEO PREPARATION HUB (5 VIDEOS) */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                              Verbal Mastery &amp; Behavioral Frameworks
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                              Interview General Preparation : Curated Video Masterclasses
                            </h3>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            5 Masterclasses
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            {
                              num: 1,
                              title: "Interview General Preparation : Core Strategy",
                              desc: "Structuring crisp answers, handling behavioral questions, and projecting authenticity.",
                              url: "https://www.youtube.com/watch?si=CIVJGB3XHJRNrYdU&v=DPfq177Ttso&feature=youtu.be",
                              badge: "Video 1",
                            },
                            {
                              num: 2,
                              title: "Interview General Preparation : HR Masterclass Series",
                              desc: "Curated series covering common HR questions, body language, and company culture fit.",
                              url: "https://www.youtube.com/playlist?list=PLJvrw2GDzjfOMbC0BGcF_w5ECRdoBFcpF",
                              badge: "Playlist",
                            },
                            {
                              num: 3,
                              title: "Behavioral & Scenario Question Mastery",
                              desc: "How to answer 'Why this company?', 'Where do you see yourself in 5 years?', and scenario questions.",
                              url: "https://www.youtube.com/watch?si=dhFrKXFUjn8y1R0a&v=QYm-vu0fo4Q&feature=youtu.be",
                              badge: "Video 3",
                            },
                            {
                              num: 4,
                              title: "Interview Etiquette, Non-Verbal Cues & Executive Presence",
                              desc: "Body language, eye contact, and assertive communication during HR interactions.",
                              url: "https://www.youtube.com/watch?si=EGavwmQzuPEa9sab&v=jnqSlNQ9XVw&feature=youtu.be",
                              badge: "Video 4",
                            },
                            {
                              num: 5,
                              title: "Final Offer Negotiation & Questions to Ask HR",
                              desc: "Mastering the final offer stage: CTC breakdown, bond periods, perks, and smart reverse questions.",
                              url: "https://www.youtube.com/watch?si=PWFpNe_Jo2z-5Kj9&v=kBIN2h16Rc4&feature=youtu.be",
                              badge: "Video 5",
                            },
                          ].map((hr) => (
                            <a
                              key={hr.num}
                              href={hr.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group transition-all flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                    {hr.badge}
                                  </span>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-snug">
                                  {hr.title}
                                </div>
                                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                  {hr.desc}
                                </p>
                              </div>

                              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Watch on YouTube</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* THINGS I WISH I KNEW EARLIER (9 GOLDEN RULES PLAYGROUND) */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                              Unfiltered Senior Wisdom
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                              Things I wish I knew earlier (9 Golden Placement Rules)
                            </h3>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Battle-Tested Advice
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            {
                              num: 1,
                              title: "Maintain your CGPA above 8.0 (out of 10) to be eligible for 99% of companies placement.",
                              detail: "7.5 is the baseline. High CGPA keeps you in the pool for Day 1 super dream companies.",
                              badge: "Academic Eligibility",
                            },
                            {
                              num: 2,
                              title: "Fundamentals > Tech Stacks",
                              detail: "Tech Stacks come & go. The core foundations stay for centuries. Companies can train you on tech stacks, but not on problem solving & critical thinking. And that’s why interviews focus more on assessing your foundational skills.",
                              badge: "First Principles",
                            },
                            {
                              num: 3,
                              title: "Learn to touch type - saved me months of time. Takes just 10 minutes a day - Learn for free",
                              detail: "Saves months of coding time. Takes just 10 minutes a day to reach 60+ WPM without looking at the keyboard.",
                              url: "https://www.typingclub.com/",
                              badge: "Productivity Multiplier",
                              actionText: "Launch Free TypingClub",
                            },
                            {
                              num: 4,
                              title: "Consistency > Spending 10 hrs in a single day",
                              detail: "Learning compounds over time. Solving aptitude questions under time limits can’t be built in a day. Atleast 1 hour a day works like magic. Use methods like Spaced Repetition, Active Recalling & Feynman technique.",
                              badge: "Compound Learning",
                            },
                            {
                              num: 5,
                              title: "Execution > Planning",
                              detail: "This roadmap might confuse you in which one to start first, if so, just follow the order, it is well-optimized for placements preparation. Stick to it.",
                              badge: "Roadmap Discipline",
                            },
                            {
                              num: 6,
                              title: "Action > Consumption",
                              detail: "Solve all the practice questions I have given. Your brain will only remember things which you have actively practised on, not passively consumed like videos.",
                              badge: "Hands-on Practice",
                            },
                            {
                              num: 7,
                              title: "Leetcode is your best friend in placements",
                              detail: "Take rest if bored, don’t quit. Consistent daily problem-solving builds problem pattern recognition.",
                              badge: "Grit & Stamina",
                            },
                            {
                              num: 8,
                              title: "Your Network is your Networth",
                              detail: "The impactful people you know will help you out in times like internship, job referrals, mentorship. Find them, befriend them. Where to find them? LinkedIn, Hackathons, Workshops, Tech Meetups, College Clubs.",
                              badge: "Social Capital",
                            },
                            {
                              num: 9,
                              title: "If you never ask, the answer is always NO.",
                              detail: "Failing over things is better than regret. If you can’t do things bravely, do it scared. Just do it. Don’t think about the results in initial days.",
                              badge: "Fearless Action",
                            },
                          ].map((rule) => (
                            <div
                              key={rule.num}
                              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-amber-400 group transition-all flex flex-col justify-between space-y-3"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                                    {rule.num}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                    {rule.badge}
                                  </span>
                                </div>
                                <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                                  {rule.title}
                                </div>
                                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {rule.detail}
                                </p>
                              </div>

                              {rule.url && (
                                <a
                                  href={rule.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                >
                                  <span>{rule.actionText || 'Visit Resource'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ===================== TAB 2: MASTER WEB RESOURCE DIRECTORY ===================== */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources, topics, websites..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="ALL">All Categories ({MASTER_PLACEMENT_WEB_RESOURCES.length})</option>
                <option value="Aptitude">Aptitude &amp; Reasoning</option>
                <option value="Coding">DSA &amp; Coding Practice</option>
                <option value="Core CS">Core CS (OS, DBMS, SQL, CN)</option>
                <option value="Data Analyst">Data Analytics (Power BI, Excel, Tableau)</option>
                <option value="AI/ML">AI &amp; Machine Learning</option>
                <option value="System Design">System Design &amp; LLD</option>
                <option value="HR">HR &amp; Interview Tips</option>
                <option value="LinkedIn & Resume">LinkedIn &amp; Resume Guides</option>
                <option value="IoT">IoT &amp; Robotics</option>
                <option value="Web Dev">Web Development</option>
              </select>
            </div>

            <div>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="ALL">All Languages</option>
                <option value="Tamil">Tamil Tutorials &amp; Crash Courses</option>
                <option value="English">English Video &amp; Platforms</option>
                <option value="Universal">Interactive Websites &amp; Code</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWebResources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {res.category} · {res.round.split(':')[0]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {res.language && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {res.language}
                        </span>
                      )}
                      {res.freeCertificate && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Free Cert
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {res.title}
                  </h4>

                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
                    {res.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {res.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCopyLink(res.url, res.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === res.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: 6 CAREER PATHWAYS ===================== */}
      {activeTab === 'PATHS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {CAREER_PATHS_DATA.map((path) => (
            <div
              key={path.id}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {path.title}
                  </h3>
                  <span className="px-2.5 py-1 rounded-lg font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                    {path.tierSalary}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  {path.overview}
                </p>

                {path.fourCoreConcepts && (
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[10px]">
                      Four Core Pillars of Data Analytics:
                    </div>
                    {path.fourCoreConcepts.map((fc, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60"
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {fc.concept}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {fc.topics.join(' · ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {path.coreSkills && (
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800">
                  {path.coreSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-[10.5px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===================== TAB 4: 34 BUILD YOUR OWN X PROJECTS ===================== */}
      {activeTab === 'PROJECTS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {BUILD_YOUR_OWN_X_PROJECTS.map((proj) => (
            <div
              key={proj.number}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-colors"
            >
              <div>
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  #{proj.number} · {proj.category}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                  {proj.title}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                  {proj.relevanceReason}
                </p>
                <div className="mt-3 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                  Stack: {proj.suggestedStack}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">{proj.difficulty}</span>
                <a
                  href="https://github.com/codecrafters-io/build-your-own-x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Build Repo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================== TAB 5: CREATORS & PERKS ===================== */}
      {activeTab === 'PERKS' && (
        <div className="space-y-6 text-xs">
          {/* Creators */}
          <div className="p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Creators to Follow to Stay Ahead
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {CREATORS_TO_FOLLOW.map((creator) => (
                <a
                  key={creator.name}
                  href={creator.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50/50 dark:bg-slate-800/40 group transition-all"
                >
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {creator.name}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {creator.focus}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                    <span>Watch Channel</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Student Perks */}
          <div className="p-7 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Gift className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base">Exclusive Verified Student Gifts &amp; Developer Packs</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STUDENT_PERKS.map((perk) => (
                <div
                  key={perk.title}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {perk.title}
                    </span>
                    <a
                      href={perk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1 shadow-xs hover:bg-emerald-500 transition-colors"
                    >
                      <span>Claim Pack</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                    {perk.benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
