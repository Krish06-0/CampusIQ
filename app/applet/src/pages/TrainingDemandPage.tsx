import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  Building2, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Upload, 
  Link, 
  Globe, 
  Trash2, 
  Edit3, 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScheduledTrainingSprint, TrainingCategory, TrainingStatus } from '../types';

const STORAGE_KEY = 'max_placement_scheduled_training_sprints_v1';

const INITIAL_TRAINING_SPRINTS: ScheduledTrainingSprint[] = [
  {
    id: 'sprint-1',
    title: 'AWS Certified Cloud Practitioner & Serverless Architecture Sprint',
    category: 'AWS',
    trainingDate: '2026-11-20',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    registrationDeadline: '2026-11-18T23:59',
    venue: 'Auditorium Hall A & Online Google Meet',
    trainer: 'Dr. R. Sundar Rajan (AWS Certified Solution Architect)',
    description: 'Intensive hands-on workshop covering core AWS cloud services, IAM security, EC2, Lambda serverless computing, and cost optimization for 4th-year placements.',
    eligibilityAndPrerequisites: 'Open to CSE, IT, AI & DS, and CSE (AI & ML) 3rd and 4th year students. Basic networking knowledge required.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    registrationLink: 'https://aws.amazon.com/training/',
    externalWebsite: 'https://cloud-training.vcet.edu.in',
    capacity: 150,
    status: 'PUBLISHED',
    targetGap: 'Cloud Computing (AWS/GCP)',
    interestedStudentIds: ['user-student-priya'],
    createdBy: 'Placement Cell TPO',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'sprint-2',
    title: 'Advanced Power BI & DAX Modeling for Enterprise Analytics',
    category: 'Power BI',
    trainingDate: '2026-11-25',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    registrationDeadline: '2026-11-23T18:00',
    venue: 'Computer Lab 3 (CC-102)',
    trainer: 'Prof. K. Meenakshi & Industry Data Experts',
    description: 'Master data cleaning, Power Query transformations, advanced DAX measures, time intelligence calculations, and executive dashboard storytelling.',
    eligibilityAndPrerequisites: 'All CSE, IT, AI & DS and CSE (AI & ML) students.',
    posterUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    registrationLink: 'https://powerbi.microsoft.com',
    externalWebsite: 'https://analytics.vcet.edu.in',
    capacity: 120,
    status: 'PUBLISHED',
    targetGap: 'Power BI & DAX Modeling',
    interestedStudentIds: [],
    createdBy: 'Placement Cell TPO',
    createdAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'sprint-3',
    title: 'Python for Machine Learning & Scikit-Learn Pipelines',
    category: 'Python',
    trainingDate: '2026-12-02',
    startTime: '09:30 AM',
    endTime: '01:30 PM',
    registrationDeadline: '2026-11-30T23:59',
    venue: 'AI & DS Seminar Hall',
    trainer: 'Dr. S. Karthikeyan (AI Research Group)',
    description: 'Hands-on bootcamp on NumPy, Pandas, Scikit-learn, hyperparameter tuning, and deploying ML models as REST APIs.',
    eligibilityAndPrerequisites: 'AI & DS and CSE (AI & ML) students preferred. Basic Python programming needed.',
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    registrationLink: 'https://scikit-learn.org',
    externalWebsite: 'https://ai-sprints.vcet.edu.in',
    capacity: 100,
    status: 'PUBLISHED',
    targetGap: 'Machine Learning Pipelines',
    interestedStudentIds: [],
    createdBy: 'Placement Cell TPO',
    createdAt: '2026-10-08T14:30:00Z',
  }
];

export const TrainingDemandPage: React.FC = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' || user?.role === 'dean';

  // Load sored training sprints
  const [sprints, setSprints] = useState<ScheduledTrainingSprint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading training sprints:', e);
    }
    return INITIAL_TRAINING_SPRINTS;
  });

  const saveSprints = (updated: ScheduledTrainingSprint[]) => {
    setSprints(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Modal State for scheduling/editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TrainingCategory>('AWS');
  const [trainingDate, setTrainingDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [venue, setVenue] = useState('Campus Placement Training Center');
  const [trainer, setTrainer] = useState('Department Faculty & Industry Mentors');
  const [description, setDescription] = useState('');
  const [eligibilityAndPrerequisites, setEligibilityAndPrerequisites] = useState('Open to all supported department students.');
  const [posterUrl, setPosterUrl] = useState('');
  const [posterFile, setPosterFile] = useState<string | null>(null);
  const [registrationLink, setRegistrationLink] = useState('');

  const [capacity, setCapacity] = useState<number>(100);
  const [status, setStatus] = useState<TrainingStatus>('PUBLISHED');
  const [targetGap, setTargetGap] = useState('Cloud Computing (AWS/GCP)');

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter & View State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'demand-analytics' | 'scheduled-sprints' | 'calendar-view'>('scheduled-sprints');
  const [viewingRegistrantsSprint, setViewingRegistrantsSprint] = useState<ScheduledTrainingSprint | null>(null);

  // Handle Poster File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Poster image size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPosterFile(result);
        setPosterUrl(result);
        setFormError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('AWS');
    setTrainingDate('');
    setStartTime('10:00 AM');
    setEndTime('01:00 PM');
    setRegistrationDeadline('');
    setVenue('Campus Placement Training Center');
    setTrainer('Department Faculty & Industry Mentors');
    setDescription('');
    setEligibilityAndPrerequisites('Open to 3rd & 4th year students.');
    setPosterUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800');
    setPosterFile(null);
    setRegistrationLink('');

    setCapacity(120);
    setStatus('PUBLISHED');
    setTargetGap('Cloud Computing (AWS/GCP)');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sprint: ScheduledTrainingSprint) => {
    setEditingId(sprint.id);
    setTitle(sprint.title);
    setCategory(sprint.category);
    setTrainingDate(sprint.trainingDate);
    setStartTime(sprint.startTime);
    setEndTime(sprint.endTime);
    setRegistrationDeadline(sprint.registrationDeadline);
    setVenue(sprint.venue);
    setTrainer(sprint.trainer);
    setDescription(sprint.description);
    setEligibilityAndPrerequisites(sprint.eligibilityAndPrerequisites);
    setPosterUrl(sprint.posterUrl || '');
    setPosterFile(sprint.posterUrl || null);
    setRegistrationLink(sprint.registrationLink || '');

    setCapacity(sprint.capacity || 100);
    setStatus(sprint.status);
    setTargetGap(sprint.targetGap || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Validate and Submit Sprint Form
  const handleSubmitSprint = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Training or Workshop Title is required.');
      return;
    }
    if (!trainingDate) {
      setFormError('Training Date is required.');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Start Time and End Time are required.');
      return;
    }
    if (registrationDeadline && trainingDate) {
      // Validate registration deadline cannot be after training date
      const deadlineDate = new Date(registrationDeadline);
      const trainDateObj = new Date(`${trainingDate}T23:59:59`);
      if (deadlineDate > trainDateObj) {
        setFormError('Registration deadline cannot be set after the training date.');
        return;
      }
    }

    const sprintData: ScheduledTrainingSprint = {
      id: editingId || `sprint-${Date.now()}`,
      title: title.trim(),
      category,
      trainingDate,
      startTime,
      endTime,
      registrationDeadline: registrationDeadline || `${trainingDate}T18:00`,
      venue: venue.trim() || 'Campus Placement Training Center',
      trainer: trainer.trim() || 'Department Faculty',
      description: description.trim() || 'Comprehensive placement training sprint.',
      eligibilityAndPrerequisites: eligibilityAndPrerequisites.trim(),
      posterUrl: posterFile || posterUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      registrationLink: registrationLink.trim(),

      capacity: Number(capacity) || 100,
      status,
      targetGap,
      interestedStudentIds: editingId ? (sprints.find(s => s.id === editingId)?.interestedStudentIds || []) : [],
      createdBy: user?.name || 'Placement Cell Staff',
      createdAt: editingId ? (sprints.find(s => s.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    if (editingId) {
      saveSprints(sprints.map(s => s.id === editingId ? sprintData : s));
      setSuccessMessage('Training sprint updated successfully.');
    } else {
      saveSprints([sprintData, ...sprints]);
      setSuccessMessage('Training sprint scheduled successfully and published to student portals.');
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteSprint = (id: string) => {
    if (window.confirm('Are you sure you want to delete this scheduled training sprint?')) {
      saveSprints(sprints.filter(s => s.id !== id));
      setSuccessMessage('Training sprint removed.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Student Toggle Interest / Registration
  const handleToggleInterest = (sprintId: string) => {
    if (!user) return;
    const studentId = user.id;

    const updated = sprints.map(s => {
      if (s.id === sprintId) {
        const isRegistered = s.interestedStudentIds.includes(studentId);
        const interestedStudentIds = isRegistered
          ? s.interestedStudentIds.filter(id => id !== studentId)
          : [...s.interestedStudentIds, studentId];
        return { ...s, interestedStudentIds };
      }
      return s;
    });
    saveSprints(updated);
  };

  const categoriesList: TrainingCategory[] = [
    'Cloud Computing',
    'AWS',
    'Azure',
    'Google Cloud',
    'Java',
    'Python',
    'SQL',
    'Power BI',
    'Data Analytics',
    'Machine Learning',
    'AI',
    'Web Development',
    'Aptitude',
    'Communication Skills',
    'Other'
  ];

  const filteredSprints = useMemo(() => {
    return sprints.filter(s => {
      if (!isStaff && s.status !== 'PUBLISHED') return false;
      if (selectedCategoryFilter !== 'ALL' && s.category !== selectedCategoryFilter) return false;
      return true;
    });
  }, [sprints, isStaff, selectedCategoryFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MAX Placement 2026 — Training & Skills Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Institutional Training Sprints & Skill Interventions
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Schedule rigorous training bootcamps, manage registration deadlines, track student interest in real-time, and align curriculum with industry placement gaps across all four departments.
          </p>
        </div>

        {isStaff && (
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Additional Training Sprint</span>
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs for Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('scheduled-sprints')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'scheduled-sprints'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Active Training Sprints ({filteredSprints.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar-view')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'calendar-view'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Chronological Calendar Timeline</span>
        </button>
        <button
          onClick={() => setActiveTab('demand-analytics')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'demand-analytics'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Skill Demand & Deficit Analytics</span>
        </button>
      </div>

      {/* Category Filter Bar */}
      {activeTab !== 'demand-analytics' && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categoriesList.slice(0, 8).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* TAB 1: SCHEDULED TRAINING SPRINTS GRID */}
      {activeTab === 'scheduled-sprints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSprints.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-500" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No training sprints found for this filter.</p>
              <p className="text-xs text-slate-400 mt-1">Try changing the category or schedule a new training sprint above.</p>
            </div>
          ) : (
            filteredSprints.map((sprint) => {
              const isRegistered = user ? sprint.interestedStudentIds.includes(user.id) : false;
              const isDeadlinePassed = new Date(sprint.registrationDeadline) < new Date();
              const isFull = sprint.capacity ? sprint.interestedStudentIds.length >= sprint.capacity : false;

              return (
                <div
                  key={sprint.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Poster Image */}
                    <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {sprint.posterUrl ? (
                        <img
                          src={sprint.posterUrl}
                          alt={sprint.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 text-white font-bold">
                          {sprint.category} Training
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-indigo-600 text-white shadow-md">
                          {sprint.category}
                        </span>
                        {sprint.status !== 'PUBLISHED' && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-md">
                            {sprint.status}
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold shadow-md ${
                          isDeadlinePassed
                            ? 'bg-rose-600 text-white'
                            : isFull
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {isDeadlinePassed ? 'Deadline Passed' : isFull ? 'Seats Full' : 'Registration Open'}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                        {sprint.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span><strong>Date:</strong> {sprint.trainingDate} ({sprint.startTime} – {sprint.endTime})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate"><strong>Venue:</strong> {sprint.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate"><strong>Trainer:</strong> {sprint.trainer}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1">
                        {sprint.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        <strong>Eligibility:</strong> {sprint.eligibilityAndPrerequisites}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{sprint.interestedStudentIds.length} / {sprint.capacity || '∞'} Enrolled</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isStaff && (
                        <button
                          onClick={() => handleToggleInterest(sprint.id)}
                          disabled={isDeadlinePassed}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isRegistered
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : isDeadlinePassed
                              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          }`}
                        >
                          {isRegistered ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Registered</span>
                            </>
                          ) : (
                            <span>I'm Interested / Register</span>
                          )}
                        </button>
                      )}



                      {isStaff && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewingRegistrantsSprint(sprint)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                            title="View Registrants List"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(sprint)}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                            title="Edit Sprint"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSprint(sprint.id)}
                            className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
                            title="Delete Sprint"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: CHRONOLOGICAL CALENDAR TIMELINE */}
      {activeTab === 'calendar-view' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Chronological Placement Training Calendar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upcoming training sprints ordered by date for optimal academic scheduling.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
              {filteredSprints.length} Total Sprints Scheduled
            </span>
          </div>

          <div className="space-y-4">
            {[...filteredSprints].sort((a, b) => new Date(a.trainingDate).getTime() - new Date(b.trainingDate).getTime()).map(sprint => (
              <div
                key={sprint.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-600 text-white text-center min-w-[70px] shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(sprint.trainingDate).toLocaleString('default', { month: 'short' })}
                    </div>
                    <div className="text-xl font-black">
                      {new Date(sprint.trainingDate).getDate()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {sprint.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {sprint.startTime} – {sprint.endTime}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {sprint.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <strong>Venue:</strong> {sprint.venue} • <strong>Trainer:</strong> {sprint.trainer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {sprint.interestedStudentIds.length} Registered
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Capacity: {sprint.capacity || '∞'}
                    </div>
                  </div>
                  {!isStaff && (
                    <button
                      onClick={() => handleToggleInterest(sprint.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                    >
                      {sprint.interestedStudentIds.includes(user?.id || '') ? 'Registered' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEMAND & DEFICIT ANALYTICS */}
      {activeTab === 'demand-analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { skill: 'Cloud Computing (AWS/GCP)', missingStudentsCount: 185, priority: 'CRITICAL', recommendation: 'Schedule AWS Certified Developer or Cloud Practitioner bootcamps for 4th-year CSE and IT students.' },
            { skill: 'Power BI & DAX Modeling', missingStudentsCount: 142, priority: 'CRITICAL', recommendation: 'Conduct weekend data visualization lab sessions using Power BI desktop.' },
            { skill: 'Machine Learning Pipelines', missingStudentsCount: 128, priority: 'HIGH', recommendation: 'Run specialized scikit-learn and TensorFlow workshops for AI & DS and CSE (AI & ML).' },
            { skill: 'Advanced Java & Spring Boot', missingStudentsCount: 110, priority: 'HIGH', recommendation: 'Product-company coding sprint focusing on microservices architecture.' },
            { skill: 'SQL & Database Indexing', missingStudentsCount: 95, priority: 'MEDIUM', recommendation: 'Intensive query optimization and database tuning tutorial.' },
            { skill: 'Aptitude & Logical Reasoning', missingStudentsCount: 88, priority: 'MEDIUM', recommendation: 'Weekly quantitative and verbal aptitude practice tests.' }
          ].map((td) => {
            const percent = Math.round((td.missingStudentsCount / 520) * 100);
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
                      {percent}% of 520 cohort
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
                  Calculated from 520 verified student profiles
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCHEDULE / EDIT TRAINING SPRINT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {editingId ? 'Edit Training Sprint' : 'Schedule Additional Training Sprint'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSprint} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Training or Workshop Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud Practitioner & Serverless Bootcamp"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Training Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TrainingCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Skill Gap</label>
                  <input
                    type="text"
                    placeholder="e.g. Cloud Computing (AWS/GCP)"
                    value={targetGap}
                    onChange={(e) => setTargetGap(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Training Date *</label>
                  <input
                    type="date"
                    required
                    value={trainingDate}
                    onChange={(e) => setTrainingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Start Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="10:00 AM"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">End Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="01:00 PM"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Registration Deadline Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Training Capacity (Seats)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Training Venue / Online Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Auditorium Hall A or Google Meet link"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Trainer or Organizing Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. AWS Certified Architect / Department Faculty"
                    value={trainer}
                    onChange={(e) => setTrainer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Training Poster Image (Upload or HTTPS URL)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or upload file"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  {posterUrl && (
                    <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Detailed Description & Learning Objectives</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the curriculum, topics covered, tools used, and take-aways..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Eligibility & Prerequisites</label>
                  <input
                    type="text"
                    placeholder="e.g. Open to 3rd & 4th year CSE and IT students."
                    value={eligibilityAndPrerequisites}
                    onChange={(e) => setEligibilityAndPrerequisites(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Registration Link URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>



                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Publication Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TrainingStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PUBLISHED">Published (Visible to Students)</option>
                    <option value="DRAFT">Draft (Staff Only)</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Publish Training Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REGISTRANTS MODAL FOR STAFF */}
      {viewingRegistrantsSprint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Registrants List: {viewingRegistrantsSprint.title}
              </h3>
              <button
                onClick={() => setViewingRegistrantsSprint(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
              {viewingRegistrantsSprint.interestedStudentIds.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">No students have registered yet.</p>
              ) : (
                viewingRegistrantsSprint.interestedStudentIds.map((id, index) => (
                  <div key={id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Student ID: {id}</div>
                      <div className="text-[10px] text-slate-400">Registered via Student Portal</div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                      Confirmed
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setViewingRegistrantsSprint(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
