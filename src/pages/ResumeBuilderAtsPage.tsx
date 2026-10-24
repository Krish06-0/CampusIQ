import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Download,
  Trash2,
  RefreshCw,
  Github,
  Linkedin,
  Target,
  Briefcase,
  Award,
  Layers,
  Clock,
  ShieldCheck,
  Check,
  BookOpen,
  ArrowRight,
  Search,
  Eye,
  FileCode,
  FileCheck,
  Building2,
  Users,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EngineeringProjectsVerificationHeader } from '../components/EngineeringProjectsVerificationHeader';
import { parseResumeFile, formatFileSize } from '../services/resumeParserService';
import { calculateAtsCompatibilityScore, AtsAnalysisReport } from '../services/atsScoringEngine';
import {
  calculateJobSpecificMatch,
  extractRequirementsFromJd,
  JobMatchResult,
  TargetJobSpec,
} from '../services/jobMatchEngine';
import {
  analyzeGitHubProfile,
  analyzeLinkedInProfile,
  validateGitHubUrl,
  validateLinkedInUrl,
  GitHubAnalysisResult,
  LinkedInAnalysisResult,
  LinkedInChecklist,
} from '../services/profileAnalysisService';
import {
  fetchStudentResumes,
  uploadStudentResume,
  deleteStudentResume,
  saveAtsReport,
  fetchAtsReports,
  saveJobMatchReport,
  fetchProfileIntegrations,
  saveProfileIntegrations,
  fetchRecruiterReviews,
  submitRecruiterReview,
  StoredResumeRecord,
  RecruiterReviewRecord,
} from '../services/resumeDataService';
import { fetchDrives } from '../services/placementDriveService';
import { PlacementDrive } from '../types';
import { ResumeViewerModal } from '../components/resume/ResumeViewerModal';

export const ResumeBuilderAtsPage: React.FC = () => {
  const { currentUser, currentRole, currentStudent } = useAuth();
  const studentId = currentStudent?.id || currentUser.id;
  const studentRoll = currentStudent?.registerNumber || '22AIDS014';
  const studentName = currentStudent?.name || currentUser.name;

  // Active Tab within Page
  const [activeSection, setActiveSection] = useState<
    'overleaf' | 'upload' | 'ats' | 'jobmatch' | 'github' | 'linkedin' | 'combined' | 'recruiter'
  >('overleaf');

  // Drives for Job Matching
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [customJdText, setCustomJdText] = useState<string>('');
  const [useCustomJd, setUseCustomJd] = useState(false);

  // Resume State
  const [resumes, setResumes] = useState<StoredResumeRecord[]>([]);
  const [activeResume, setActiveResume] = useState<StoredResumeRecord | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ATS Analysis State
  const [atsReport, setAtsReport] = useState<AtsAnalysisReport | null>(null);
  const [atsHistory, setAtsHistory] = useState<any[]>([]);
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);

  // Job Match State
  const [jobMatchResult, setJobMatchResult] = useState<JobMatchResult | null>(null);
  const [isMatchingJob, setIsMatchingJob] = useState(false);

  // Profile Integrations State
  const [githubUrlInput, setGithubUrlInput] = useState<string>('');
  const [githubResult, setGithubResult] = useState<GitHubAnalysisResult | null>(null);
  const [isCheckingGithub, setIsCheckingGithub] = useState(false);

  const [linkedInUrlInput, setLinkedInUrlInput] = useState<string>('');
  const [linkedInChecklist, setLinkedInChecklist] = useState<LinkedInChecklist>({
    headlineReviewed: false,
    headlineText: '',
    aboutSectionReviewed: false,
    educationListed: false,
    experienceListed: false,
    certificationsListed: false,
    resumeConsistencyChecked: false,
    reviewerNotes: '',
  });
  const [linkedInResult, setLinkedInResult] = useState<LinkedInAnalysisResult | null>(null);

  // Recruiter Review State
  const [recruiterReviews, setRecruiterReviews] = useState<RecruiterReviewRecord[]>([]);
  const [recruiterStatus, setRecruiterStatus] = useState<
    'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'On Hold' | 'Not Selected'
  >('Under Review');
  const [scorecard, setScorecard] = useState({
    technicalEvidence: 4,
    projectQuality: 4,
    readabilityFormat: 4,
    recruiterRecommendation: 4,
  });
  const [writtenJustification, setWrittenJustification] = useState('');
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewSavedSuccess, setReviewSavedSuccess] = useState(false);

  // Document Text Preview Modal & PDF Viewer Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);

  const isPrivilegedReviewer =
    currentRole === 'STAFF' ||
    currentRole === 'PLACEMENT_OFFICER' ||
    currentRole === 'PLACEMENT_ADMIN' ||
    currentRole === 'DEAN' ||
    currentRole === 'SUPER_ADMIN';

  // 1. Initial Data Loading
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // Drives
      const driveList = await fetchDrives(currentRole, currentUser.id);
      if (isMounted) {
        setDrives(driveList);
        if (driveList.length > 0) {
          setSelectedDriveId(driveList[0].id);
        }
      }

      // Resumes for active student
      const userResumes = await fetchStudentResumes(studentId, currentRole);
      if (isMounted) {
        setResumes(userResumes);
        if (userResumes.length > 0) {
          const latest = userResumes[0];
          setActiveResume(latest);
          // Auto-compute ATS score for the latest uploaded resume
          if (latest.extractedText) {
            const report = calculateAtsCompatibilityScore(latest.extractedText);
            setAtsReport(report);
          }
        }
      }

      // ATS Reports history
      const history = await fetchAtsReports(studentId, currentRole);
      if (isMounted) {
        setAtsHistory(history);
      }

      // Profile Integrations (GitHub & LinkedIn)
      const prof = await fetchProfileIntegrations(studentId);
      if (isMounted && prof) {
        if (prof.githubUrl) {
          setGithubUrlInput(prof.githubUrl);
          if (prof.githubData) {
            setGithubResult({
              url: prof.githubUrl,
              username: prof.githubData.username,
              isUrlValid: true,
              status: prof.githubStatus || 'PUBLIC_PROFILE_FOUND',
              message: `Loaded verified profile for @${prof.githubData.username}`,
              profileData: prof.githubData,
              verificationStatus: {
                urlValidated: true,
                publicProfileFound: true,
                repositoryDataRetrieved: true,
                ownershipVerified: false,
                ownershipNotice: 'A valid public GitHub URL does not prove student account ownership without authorized OAuth verification.',
              },
            });
          }
        } else if (currentStudent?.githubUrl) {
          setGithubUrlInput(currentStudent.githubUrl);
        }

        if (prof.linkedInUrl) {
          setLinkedInUrlInput(prof.linkedInUrl);
        } else if (currentStudent?.linkedInUrl) {
          setLinkedInUrlInput(currentStudent.linkedInUrl);
        }

        if (prof.linkedInChecklist) {
          setLinkedInChecklist(prof.linkedInChecklist);
        }
      }

      // Recruiter reviews
      const reviews = await fetchRecruiterReviews(studentId, currentRole, currentUser.id);
      if (isMounted) {
        setRecruiterReviews(reviews);
        if (reviews.length > 0) {
          const latestRev = reviews[0];
          setRecruiterStatus(latestRev.status);
          setScorecard(latestRev.scorecard || { technicalEvidence: 4, projectQuality: 4, readabilityFormat: 4, recruiterRecommendation: 4 });
          setWrittenJustification(latestRev.writtenJustification || '');
          setRecruiterNotes(latestRev.recruiterNotes || '');
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [studentId, currentRole]);

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    // Validation
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      setUploadError('Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds the 15MB limit. Please upload a standard 1-2 page resume document.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Extract text and structure from file
      const parsedData = await parseResumeFile(file);

      // Convert file to Data URL for in-browser preview and download
      const reader = new FileReader();
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let extractionStatus: 'SUCCESS' | 'WARNING_LOW_TEXT' | 'FAILED_EMPTY_OR_SCANNED' = 'SUCCESS';
      let extractionMessage = 'Text extracted successfully';

      const wordCount = parsedData.rawText.trim().split(/\s+/).filter(Boolean).length;
      if (!parsedData.rawText || wordCount < 20) {
        extractionStatus = 'FAILED_EMPTY_OR_SCANNED';
        extractionMessage = 'No selectable text found in this PDF. The document appears to be a scanned image or flat photocopy without an embedded text layer. Commercial ATS parsers and this analyzer require selectable text. Optical Character Recognition (OCR) is required to parse scanned documents into readable characters. To resolve this instantly, re-export your resume directly as a vector text PDF from Overleaf, Google Docs, or Word.';
      } else if (wordCount < 100) {
        extractionStatus = 'WARNING_LOW_TEXT';
        extractionMessage = `Extracted only ${wordCount} words. Content may be truncated or layout fragmented.`;
      }

      // 2. Upload to database
      const savedRecord = await uploadStudentResume(
        {
          studentId,
          studentRollNumber: studentRoll,
          studentName,
          fileName: file.name,
          fileFormat: ext,
          fileSize: formatFileSize(file.size),
          fileSizeNumber: file.size,
          fileDataUrl,
          extractedText: parsedData.rawText,
          extractionStatus,
          extractionMessage,
          pageCount: 1,
        },
        currentRole
      );

      // 3. Compute real ATS score from actual text
      const report = calculateAtsCompatibilityScore(parsedData.rawText);
      await saveAtsReport(studentId, savedRecord.id, report, currentRole);

      setResumes((prev) => [savedRecord, ...prev]);
      setActiveResume(savedRecord);
      setAtsReport(report);

      setUploadSuccess(`Resume "${file.name}" uploaded successfully! ATS Compatibility evaluated.`);
      setActiveSection('ats');
    } catch (err: any) {
      console.error('Resume upload error:', err);
      setUploadError(err.message || 'Failed to process resume file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this resume version?')) return;
    await deleteStudentResume(resumeId, studentId, currentRole);
    const updated = resumes.filter((r) => r.id !== resumeId);
    setResumes(updated);
    if (activeResume?.id === resumeId) {
      const nextActive = updated.length > 0 ? updated[0] : null;
      setActiveResume(nextActive);
      if (nextActive && nextActive.extractedText) {
        setAtsReport(calculateAtsCompatibilityScore(nextActive.extractedText));
      } else {
        setAtsReport(null);
      }
    }
  };

  // Run Job Match Analysis
  const handleRunJobMatch = async () => {
    if (!activeResume || !activeResume.extractedText) {
      setUploadError('Please upload a resume first to run job-specific match analysis.');
      return;
    }

    setIsMatchingJob(true);

    let targetJobSpec: TargetJobSpec;

    if (useCustomJd) {
      if (!customJdText.trim()) {
        alert('Please paste a job description to analyze.');
        setIsMatchingJob(false);
        return;
      }
      const extracted = extractRequirementsFromJd(customJdText);
      targetJobSpec = {
        companyName: extracted.companyName,
        jobRole: extracted.roleTitle,
        requiredSkills: extracted.requiredSkills,
        preferredSkills: extracted.preferredSkills,
        rawJobDescription: customJdText,
      };
    } else {
      const drive = drives.find((d) => d.id === selectedDriveId) || drives[0];
      if (!drive) {
        setIsMatchingJob(false);
        return;
      }
      targetJobSpec = {
        id: drive.id,
        companyName: drive.companyName,
        jobRole: drive.jobRole,
        requiredSkills: drive.requiredSkills || [],
        preferredSkills: drive.preferredSkills || [],
        minimumCGPA: drive.minimumCGPA,
        allowedDepartments: drive.allowedDepartments,
        allowedBatches: drive.allowedBatches,
      };
    }

    const matchRes = calculateJobSpecificMatch(
      activeResume.extractedText,
      targetJobSpec,
      {
        cgpa: currentStudent?.cgpa,
        departmentName: currentStudent?.departmentName,
        batch: currentStudent?.batch,
      }
    );

    setJobMatchResult(matchRes);
    await saveJobMatchReport(studentId, activeResume.id, matchRes, currentRole);

    setIsMatchingJob(false);
    setActiveSection('jobmatch');
  };

  // Run GitHub Profile Inspection
  const handleInspectGithub = async () => {
    if (!githubUrlInput.trim()) {
      alert('Please enter your GitHub profile URL (e.g. https://github.com/username)');
      return;
    }

    setIsCheckingGithub(true);
    const result = await analyzeGitHubProfile(githubUrlInput.trim());
    setGithubResult(result);

    if (result.isUrlValid) {
      await saveProfileIntegrations(studentId, {
        githubUrl: githubUrlInput.trim(),
        githubStatus: result.status,
        githubData: result.profileData,
        githubOwnershipStatus: result.verificationStatus.ownershipVerified ? 'VERIFIED' : 'UNVERIFIED_PUBLIC_MATCH',
      });
    }

    setIsCheckingGithub(false);
  };

  // Run LinkedIn Review & Checklist Update
  const handleSaveLinkedInChecklist = async () => {
    const { isValid } = validateLinkedInUrl(linkedInUrlInput);
    if (!isValid && linkedInUrlInput.trim()) {
      alert('Invalid LinkedIn URL format. Expected: https://www.linkedin.com/in/username/');
      return;
    }

    const result = analyzeLinkedInProfile(linkedInUrlInput.trim(), linkedInChecklist, {
      name: studentName,
      department: currentStudent?.departmentName,
    });
    setLinkedInResult(result);

    await saveProfileIntegrations(studentId, {
      linkedInUrl: linkedInUrlInput.trim(),
      linkedInStatus: result.status,
      linkedInChecklist,
      linkedInOwnershipStatus: 'UNVERIFIED',
    });

    alert('LinkedIn profile checklist and verification details saved successfully!');
  };

  // Submit Recruiter Review Scorecard
  const handleSubmitRecruiterReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    setIsSavingReview(true);
    try {
      const selectedDrive = drives.find((d) => d.id === selectedDriveId);
      const saved = await submitRecruiterReview(
        {
          studentId,
          studentRollNumber: studentRoll,
          studentName,
          department: currentStudent?.departmentName || 'AI & DS',
          batch: currentStudent?.batch || '2022-2026',
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          reviewerRole: currentRole,
          driveId: selectedDriveId || 'general-evaluation',
          companyName: selectedDrive?.companyName || 'Campus Placement Review',
          status: recruiterStatus,
          scorecard,
          writtenJustification,
          recruiterNotes,
        },
        currentRole
      );

      setRecruiterReviews((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
      setReviewSavedSuccess(true);
      setTimeout(() => setReviewSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to submit recruiter review:', err);
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#070A11] via-[#0E1524] to-[#070A11] p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>// MAX PLACEMENT 2026 · RESUME INTELLIGENCE &amp; ATS SUITE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Resume Builder &amp; ATS Analyzer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Official Overleaf resume workflow integrated with transparent ATS compatibility scoring, placement drive matching, and verified GitHub &amp; LinkedIn professional checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://www.overleaf.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF007A] to-[#7928CA] text-white shadow-lg shadow-[#FF007A]/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <span>Create Resume on Overleaf</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => {
                setActiveSection('upload');
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-slate-200 shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Pills (8 Comprehensive Sections) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold scrollbar-thin">
        <button
          onClick={() => setActiveSection('overleaf')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'overleaf'
              ? 'bg-slate-900 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5 text-pink-500" />
          <span>1. Overleaf Workflow</span>
        </button>

        <button
          onClick={() => setActiveSection('upload')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'upload'
              ? 'bg-slate-900 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-cyan-500" />
          <span>2. Resume Upload &amp; History</span>
          {resumes.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200">
              v{resumes[0].version}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('ats')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'ats'
              ? 'bg-slate-900 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-emerald-500" />
          <span>3. ATS Score (0–100)</span>
          {atsReport && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200">
              {atsReport.score}/100
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('jobmatch')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'jobmatch'
              ? 'bg-slate-900 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
          <span>4. Job-Specific Match</span>
          {jobMatchResult && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200">
              {jobMatchResult.matchScore}%
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('github')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'github'
              ? 'bg-slate-900 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Github className="w-3.5 h-3.5 text-purple-500" />
          <span>5. GitHub Analysis</span>
        </button>

        <button
          onClick={() => setActiveSection('linkedin')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'linkedin'
              ? 'bg-slate-900 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Linkedin className="w-3.5 h-3.5 text-blue-500" />
          <span>6. LinkedIn Review</span>
        </button>

        <button
          onClick={() => setActiveSection('combined')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'combined'
              ? 'bg-slate-900 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>7. Executive Report</span>
        </button>

        {isPrivilegedReviewer && (
          <button
            onClick={() => setActiveSection('recruiter')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'recruiter'
                ? 'bg-slate-900 text-white shadow-sm font-bold'
                : 'text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>8. Recruiter Review &amp; Scorecard</span>
          </button>
        )}
      </div>

      {/* Hidden Global File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        accept=".pdf,.docx,.doc,.txt"
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* SECTION 1: OVERLEAF RESUME CREATION WORKFLOW (OFFICIAL OVERLEAF LINK)      */}
      {/* ========================================================================= */}
      {activeSection === 'overleaf' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Action Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                  Create Your ATS-Friendly Resume on Overleaf
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Overleaf is the gold standard for clean, professional LaTeX resume engineering. Compile clean single-page documents with flawless fonts, exact vector formatting, and 100% selectable text.
                </p>
              </div>

              <a
                href="https://www.overleaf.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Create Resume on Overleaf</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Step-by-Step Workflow Checklist */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Recommended 6-Step Campus Hiring Workflow
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 font-mono font-bold text-xs flex items-center justify-center">
                    01
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pick a Clean Template</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Open Overleaf and search for <em>"Jake's Resume"</em> or single-column standard templates. Single-column layouts achieve 99% ATS parsing accuracy.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 font-mono font-bold text-xs flex items-center justify-center">
                    02
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Draft Truthful Evidence</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Add standard sections: Education (VCET, B.Tech, CGPA), Skills, Projects (with measurable metrics), and Experience. Avoid tables or graphics.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 font-mono font-bold text-xs flex items-center justify-center">
                    03
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Export &amp; Analyze</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Download your PDF from Overleaf. Return here and upload it to get your MAX ATS Compatibility Score (0–100) and placement drive match.
                  </p>
                </div>
              </div>
            </div>

            {/* Recruiter & ATS Best Practices Callout */}
            <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider text-[11px] font-mono">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>ATS Parsing Rules &amp; Overleaf Best Practices</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>Use standard font packages: <strong>lmodern</strong>, <strong>times</strong>, or <strong>inter</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>Verify text selectability (drag your mouse over the downloaded PDF to copy words).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>Include standard headers: Education, Skills, Projects, Experience, Certifications.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>Zero password requirement: We never ask for or store Overleaf credentials.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ready with your downloaded PDF?
              </span>
              <button
                onClick={() => {
                  setActiveSection('upload');
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF to ATS Analyzer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: RESUME UPLOAD, SECURE STORAGE & VERSION HISTORY                 */}
      {/* ========================================================================= */}
      {activeSection === 'upload' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:border-cyan-400 dark:hover:border-cyan-500'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 border border-cyan-200/60 dark:border-cyan-800/60">
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isUploading ? 'Extracting Resume Text & Evaluating ATS...' : 'Upload or Drag & Drop Resume'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Supports <strong>PDF</strong> and <strong>DOCX</strong> files exported from Overleaf, Word, or Google Docs. Maximum file size: 15MB.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File</span>
            </div>
          </div>

          {/* Upload Feedback */}
          {uploadError && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-700 text-xs text-red-800 dark:text-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Resume Upload Warning</div>
                <div>{uploadError}</div>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Upload Successful</div>
                <div>{uploadSuccess}</div>
              </div>
            </div>
          )}

          {/* Active Resume Card */}
          {activeResume ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200/60 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{activeResume.fileName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        v{activeResume.version}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{activeResume.fileFormat.toUpperCase()}</span>
                      <span>•</span>
                      <span>{activeResume.fileSize}</span>
                      <span>•</span>
                      <span>Uploaded {new Date(activeResume.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeResume.fileFormat === 'pdf' && (
                    <button
                      onClick={() => setShowPdfViewerModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                      <span>Preview PDF</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>View Extracted Text</span>
                  </button>

                  <a
                    href={activeResume.fileDataUrl}
                    download={activeResume.fileName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Download File</span>
                  </a>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace Resume</span>
                  </button>
                </div>
              </div>

              {/* Extraction Status Banner */}
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3 ${
                  activeResume.extractionStatus === 'SUCCESS'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/40'
                    : activeResume.extractionStatus === 'WARNING_LOW_TEXT'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {activeResume.extractionStatus === 'SUCCESS' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <span>
                    <strong>Extraction Status:</strong> {activeResume.extractionMessage}
                  </span>
                </div>

                <button
                  onClick={() => setActiveSection('ats')}
                  className="font-bold underline text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-300 cursor-pointer text-[11px]"
                >
                  View ATS Score →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center text-slate-600 dark:text-slate-400 text-xs">
              No resume uploaded yet. Click the upload button above to submit your PDF or DOCX resume.
            </div>
          )}

          {/* Resume Version History */}
          {resumes.length > 1 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Resume Version History ({resumes.length} versions)
              </h3>

              <div className="space-y-2">
                {resumes.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                      activeResume?.id === rec.id
                        ? 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-300 dark:border-cyan-500/30 text-slate-900 dark:text-white font-semibold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">v{rec.version}</span>
                      <span className="font-semibold">{rec.fileName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 dark:text-slate-400">{rec.fileSize}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 dark:text-slate-400">{new Date(rec.uploadedAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeResume?.id !== rec.id && (
                        <button
                          onClick={() => {
                            setActiveResume(rec);
                            if (rec.extractedText) {
                              setAtsReport(calculateAtsCompatibilityScore(rec.extractedText));
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium cursor-pointer"
                        >
                          Select as Active
                        </button>
                      )}

                      <a
                        href={rec.fileDataUrl}
                        download={rec.fileName}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDeleteResume(rec.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 dark:hover:text-red-300"
                        title="Delete this version"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      {/* ========================================================================= */}
      {/* SECTION 3: TRANSPARENT ATS COMPATIBILITY ANALYSIS (0-100)                  */}
      {/* ========================================================================= */}
      {activeSection === 'ats' && (
        <div className="space-y-6 animate-in fade-in">
          {atsReport ? (
            <>
              {/* Score Hero Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      MAX ATS Compatibility Score: {atsReport.score} / 100
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                      This score is an internal estimate based on documented resume parsing heuristics. It measures text readability, structural heading clarity, technical skill density, project evidence, and qualifications.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                      Evaluated from actual document content: {atsReport.wordCount} words · {atsReport.detectedSkills.length} skills detected · {atsReport.detectedSections.length} standard sections.
                    </div>
                  </div>

                  {/* Circular Score Badge */}
                  <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center min-w-[130px] shadow-2xs">
                    <div className="text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {atsReport.score}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                      ATS Index
                    </div>
                    <div
                      className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        atsReport.score >= 80
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : atsReport.score >= 60
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      {atsReport.score >= 80 ? 'Highly Compatible' : atsReport.score >= 60 ? 'Moderate Fit' : 'Needs Work'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prominent Compatibility Estimate Disclaimer */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-indigo-900 dark:text-indigo-300 uppercase text-[11px] font-mono tracking-wider">
                    // ATS Compatibility Estimate Disclaimer
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    This score is an internal educational simulation and compatibility estimate of resume readability, section structure, keyword density, and quantifiable achievement evidence. It does not represent an official score from commercial ATS vendors (e.g., Workday, Taleo, Greenhouse, Lever) or guarantee employer shortlisting. Real screening outcomes depend on recruiter discretion, batch cutoffs, and company-specific criteria.
                  </div>
                </div>
              </div>

              {/* 6 Transparent Criteria Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Detailed 6-Criteria Scoring Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(atsReport.criteria).map(([key, criterion]) => (
                    <div
                      key={key}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{criterion.title}</span>
                        <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {criterion.awardedPoints} / {criterion.maxPoints} pts
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(criterion.awardedPoints / criterion.maxPoints) * 100}%` }}
                        />
                      </div>

                      {/* Evidence */}
                      {criterion.evidence.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                            Supporting Resume Evidence:
                          </span>
                          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                            {criterion.evidence.slice(0, 3).map((ev, i) => (
                              <li key={i} className="truncate">
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Detected Issues */}
                      {criterion.detectedIssues.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold">
                            Detected Issues:
                          </span>
                          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                            {criterion.detectedIssues.map((iss, i) => (
                              <li key={i}>{iss}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommended Improvements */}
                      {criterion.recommendedImprovements.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold block">
                            Recommendation:
                          </span>
                          <div>{criterion.recommendedImprovements[0]}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prioritized Improvement Plan */}
              {atsReport.improvementPlan.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prioritized Actionable Improvement Plan</span>
                  </div>

                  <div className="space-y-2.5">
                    {atsReport.improvementPlan.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                item.priority === 'CRITICAL'
                                  ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                  : item.priority === 'HIGH'
                                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
                              }`}
                            >
                              {item.priority}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{item.category}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{item.action}</p>
                        </div>

                        <span className="shrink-0 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">
                          {item.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center space-y-3">
              <Target className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No ATS Report Available</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Please upload your PDF or DOCX resume to calculate the real, transparent MAX ATS Compatibility Score.
              </p>
              <button
                onClick={() => {
                  setActiveSection('upload');
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Resume</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: JOB-SPECIFIC RESUME MATCH (CAMPUS DRIVES OR CUSTOM JD)          */}
      {/* ========================================================================= */}
      {activeSection === 'jobmatch' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Drive Selector / Custom JD Toggle */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Placement Drive or Paste Job Description</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Compare your uploaded resume against real campus hiring requirements.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setUseCustomJd(false)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    !useCustomJd
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Campus Placement Drive
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomJd(true)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    useCustomJd
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Paste Custom JD
                </button>
              </div>
            </div>

            {!useCustomJd ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {drives.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDriveId(d.id)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      selectedDriveId === d.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/50 text-slate-900 dark:text-white shadow-sm font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white truncate">{d.companyName}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{d.salaryPackage || '₹8 LPA'}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px] truncate mt-1">{d.jobRole}</div>
                    <div className="text-[10px] text-slate-500 mt-2 truncate">
                      Required: {(d.requiredSkills || []).slice(0, 3).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Job Description Text</label>
                <textarea
                  rows={4}
                  value={customJdText}
                  onChange={(e) => setCustomJdText(e.target.value)}
                  placeholder="Paste complete job requirements, required technologies, qualifications, and role responsibilities here..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleRunJobMatch}
                disabled={isMatchingJob || !activeResume}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isMatchingJob ? (
                  <div className="w-4 h-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Run Job-Specific Match</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Job Match Results */}
          {jobMatchResult && (
            <div className="space-y-6">
              {/* Hero Match Score */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      {jobMatchResult.companyName} — {jobMatchResult.jobRole}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Separate job match score based on required technical skills (35pts), preferred skills (15pts), projects (25pts), education alignment (15pts), and certifications (10pts).
                    </p>
                  </div>

                  <div className="shrink-0 text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 min-w-[120px] shadow-2xs">
                    <div className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                      {jobMatchResult.matchScore}%
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                      Target Fit
                    </div>
                  </div>
                </div>

                {/* Eligibility Pill */}
                <div
                  className={`p-3 rounded-2xl text-xs flex items-center justify-between gap-3 ${
                    jobMatchResult.eligibilityStatus === 'MET'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      <strong>Drive Eligibility:</strong> {jobMatchResult.breakdown.educationAlignment.detail}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[11px] uppercase">
                    Status: {jobMatchResult.eligibilityStatus}
                  </span>
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Matched Required Skills ({jobMatchResult.breakdown.requiredSkills.matched.length})</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {jobMatchResult.breakdown.requiredSkills.awardedPoints} / 35 pts
                    </span>
                  </div>

                  <div className="space-y-2">
                    {jobMatchResult.breakdown.requiredSkills.matched.length > 0 ? (
                      jobMatchResult.breakdown.requiredSkills.matched.map((m, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-xs space-y-0.5"
                        >
                          <div className="font-bold text-emerald-800 dark:text-emerald-300">{m.skill}</div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                            Evidence: "{m.evidenceSnippet}"
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 italic">No required skills matched yet.</div>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing Required Skills ({jobMatchResult.breakdown.requiredSkills.missing.length})</span>
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {jobMatchResult.breakdown.requiredSkills.missing.length > 0 ? (
                      jobMatchResult.breakdown.requiredSkills.missing.map((sk, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-semibold"
                        >
                          {sk}
                        </span>
                      ))
                    ) : (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        Outstanding! All core required skills are present in your resume.
                      </div>
                    )}
                  </div>

                  {jobMatchResult.tailoredRecommendations.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                        Tailored Placement Guidance:
                      </span>
                      <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                        {jobMatchResult.tailoredRecommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: GITHUB PROFILE ANALYSIS                                         */}
      {/* ========================================================================= */}
      {activeSection === 'github' && (
        <div className="space-y-6 animate-in fade-in">
          <EngineeringProjectsVerificationHeader
            badgeText="ENGINEERING PROJECTS & REPOSITORY VERIFICATION"
            title="GitHub Profile Analysis & Repository Verification"
            subtitle="Inspect public technical repositories, source code distribution, and project documentation directly verified via official GitHub REST API."
          />

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Github className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={githubUrlInput}
                  onChange={(e) => setGithubUrlInput(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleInspectGithub}
                disabled={isCheckingGithub}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {isCheckingGithub ? (
                  <div className="w-4 h-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Inspect Public Profile</span>
                  </>
                )}
              </button>

              {githubUrlInput && (
                <a
                  href={githubUrlInput.startsWith('http') ? githubUrlInput : `https://${githubUrlInput}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span>Open Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Honest Verification Status Notice */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-purple-800 dark:text-purple-300 uppercase text-[11px]">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Verification State Distinctions</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="text-slate-500 dark:text-slate-400 font-mono">URL Validated</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {githubResult?.isUrlValid ? 'Verified' : 'Pending'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="text-slate-500 dark:text-slate-400 font-mono">Public Profile</div>
                  <div className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                    {githubResult?.status === 'PUBLIC_PROFILE_FOUND' ? 'Found' : 'Unchecked'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="text-slate-500 dark:text-slate-400 font-mono">Repositories</div>
                  <div className="font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {githubResult?.profileData?.publicRepos ?? 0} Public
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="text-slate-500 dark:text-slate-400 font-mono">Account Ownership</div>
                  <div className="font-bold text-amber-600 dark:text-amber-400 mt-0.5" title="Public URL matching does not prove identity">
                    Unverified (Public)
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                Notice: Stars and follower counts are not treated as substitutes for technical competence. A public profile match does not verify account ownership without authorized OAuth.
              </div>
            </div>

            {/* Repositories Overview */}
            {githubResult?.profileData && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Public Repositories ({githubResult.profileData.repositories.length})
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span>Languages:</span>
                    {githubResult.profileData.topLanguages.slice(0, 4).map((lang, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-mono text-[10px] border border-slate-200 dark:border-slate-700">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {githubResult.profileData.repositories.map((repo, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-300 text-xs flex items-center gap-1"
                        >
                          <span>{repo.name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {repo.language}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{repo.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1">
                        <span>★ {repo.stars}</span>
                        <span>⑂ {repo.forks}</span>
                        <span>{repo.hasReadme ? '✓ README Available' : 'No Documentation'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: LINKEDIN PROFILE ANALYSIS & MANUAL REVIEW CHECKLIST            */}
      {/* ========================================================================= */}
      {activeSection === 'linkedin' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                LinkedIn Profile Analysis
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Format validation and verified profile checklist against your submitted resume credentials.
              </p>
            </div>

            {/* Honest Automated Access Disclaimer */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-blue-900 dark:text-blue-300">Automated LinkedIn verification unavailable — open the profile for manual review.</div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  LinkedIn enforces strict anti-scraping and member-login policies. In compliance with data privacy standards, we never bypass controls, scrape private feeds, or ask for LinkedIn passwords. Use the verified checklist below for institutional audit.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Linkedin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={linkedInUrlInput}
                  onChange={(e) => setLinkedInUrlInput(e.target.value)}
                  placeholder="https://www.linkedin.com/in/username/"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {linkedInUrlInput && (
                <a
                  href={linkedInUrlInput.startsWith('http') ? linkedInUrlInput : `https://${linkedInUrlInput}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-md"
                >
                  <span>Open LinkedIn Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Interactive Manual Review Checklist */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Student Profile Completeness &amp; Consistency Checklist
              </h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={linkedInChecklist.headlineReviewed}
                    onChange={(e) =>
                      setLinkedInChecklist((prev) => ({ ...prev, headlineReviewed: e.target.checked }))
                    }
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Headline accurately reflects degree and role</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      e.g. "B.Tech AI &amp; DS Student at VCET | Aspiring Data Analyst &amp; ML Engineer"
                    </p>
                  </div>
                </label>

                <div className="pl-7">
                  <input
                    type="text"
                    value={linkedInChecklist.headlineText || ''}
                    onChange={(e) =>
                      setLinkedInChecklist((prev) => ({ ...prev, headlineText: e.target.value }))
                    }
                    placeholder="Enter your current LinkedIn Headline text for consistency auditing..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={linkedInChecklist.aboutSectionReviewed}
                    onChange={(e) =>
                      setLinkedInChecklist((prev) => ({ ...prev, aboutSectionReviewed: e.target.checked }))
                    }
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">About / Summary section matches resume profile</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Highlights technical skills, projects, and career placement objective.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={linkedInChecklist.educationListed}
                    onChange={(e) =>
                      setLinkedInChecklist((prev) => ({ ...prev, educationListed: e.target.checked }))
                    }
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Education matches college record (VCET, 2022–2026)</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Institution name and graduation year match verified college database.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={linkedInChecklist.resumeConsistencyChecked}
                    onChange={(e) =>
                      setLinkedInChecklist((prev) => ({ ...prev, resumeConsistencyChecked: e.target.checked }))
                    }
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Skills &amp; Project links match uploaded resume</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Verifies that skills claimed on LinkedIn match resume bullet points.</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveLinkedInChecklist}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save LinkedIn Review Verification</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: COMBINED PROFESSIONAL PROFILE REPORT                            */}
      {/* ========================================================================= */}
      {activeSection === 'combined' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  Combined Professional Profile Report
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Synthesized placement readiness record for {studentName} ({studentRoll}).
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Export Executive Report</span>
              </button>
            </div>

            {/* 4 Pillars Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ATS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">1. ATS Compatibility</div>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {atsReport ? `${atsReport.score} / 100` : 'Not Evaluated'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  {atsReport ? `${atsReport.detectedSkills.length} skills · ${atsReport.detectedSections.length} sections` : 'Upload resume to calculate'}
                </div>
              </div>

              {/* Job Match */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">2. Job Match</div>
                <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {jobMatchResult ? `${jobMatchResult.matchScore}%` : 'Pending Target JD'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                  {jobMatchResult ? `${jobMatchResult.companyName}` : 'Select drive in Section 4'}
                </div>
              </div>

              {/* GitHub */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">3. GitHub Public Audit</div>
                <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                  {githubResult?.profileData ? `${githubResult.profileData.publicRepos} Repos` : 'Unchecked'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                  {githubResult?.isUrlValid ? `@${githubResult.username} (Public match)` : 'No link added'}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">4. LinkedIn Review</div>
                <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                  {linkedInChecklist.educationListed && linkedInChecklist.headlineReviewed ? 'Audited' : 'Pending'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Manual checklist verification
                </div>
              </div>
            </div>

            {/* Actionable Improvement Roadmap */}
            {atsReport?.improvementPlan && atsReport.improvementPlan.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Priority Improvement Actions
                </h3>
                <div className="space-y-2">
                  {atsReport.improvementPlan.slice(0, 4).map((p, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">0{i + 1}.</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{p.action}</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">{p.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: RECRUITER RESUME REVIEW PORTAL & SCORECARD                      */}
      {/* ========================================================================= */}
      {activeSection === 'recruiter' && isPrivilegedReviewer && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Recruiter Candidate Evaluation &amp; Scorecard
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Human evaluation scorecard kept strictly separate from automated ATS and algorithmic scores.
                </p>
              </div>

              <div className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Reviewer: {currentUser.name} ({currentRole})
              </div>
            </div>

            {reviewSavedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Recruiter scorecard and evaluation justification saved successfully to institutional ledger.</span>
              </div>
            )}

            <form onSubmit={handleSubmitRecruiterReview} className="space-y-5">
              {/* Candidate Info Strip */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Candidate:</span>
                  <span className="font-bold text-slate-900">{studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Register Number:</span>
                  <span className="font-mono font-bold text-cyan-700">{studentRoll}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Department:</span>
                  <span className="text-slate-700">{currentStudent?.departmentName || 'AI & DS'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CGPA:</span>
                  <span className="font-mono font-bold text-emerald-700">{currentStudent?.cgpa || '8.42'}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Application Decision Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {(['Under Review', 'Shortlisted', 'Interview Scheduled', 'On Hold', 'Not Selected'] as const).map(
                    (st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setRecruiterStatus(st)}
                        className={`p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                          recruiterStatus === st
                            ? st === 'Shortlisted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
                              : st === 'Interview Scheduled'
                              ? 'bg-cyan-50 text-cyan-700 border-cyan-400'
                              : st === 'Not Selected'
                              ? 'bg-red-50 text-red-700 border-red-400'
                              : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Scorecard Criteria (1 to 5) */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700">Human Recruiter Scorecard (1 to 5)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Technical Competence Evidence</span>
                      <span className="text-cyan-700 font-mono">{scorecard.technicalEvidence}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={scorecard.technicalEvidence}
                      onChange={(e) =>
                        setScorecard((prev) => ({ ...prev, technicalEvidence: Number(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Project Implementation Quality</span>
                      <span className="text-cyan-700 font-mono">{scorecard.projectQuality}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={scorecard.projectQuality}
                      onChange={(e) =>
                        setScorecard((prev) => ({ ...prev, projectQuality: Number(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Resume Clarity &amp; Formatting</span>
                      <span className="text-cyan-700 font-mono">{scorecard.readabilityFormat}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={scorecard.readabilityFormat}
                      onChange={(e) =>
                        setScorecard((prev) => ({ ...prev, readabilityFormat: Number(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Placement Cell Recommendation</span>
                      <span className="text-cyan-700 font-mono">{scorecard.recruiterRecommendation}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={scorecard.recruiterRecommendation}
                      onChange={(e) =>
                        setScorecard((prev) => ({ ...prev, recruiterRecommendation: Number(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Written Justification & Notes */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Written Justification (Audit Proof)</label>
                  <textarea
                    rows={3}
                    value={writtenJustification}
                    onChange={(e) => setWrittenJustification(e.target.value)}
                    placeholder="Provide evidence-based rationale for candidate status (e.g. Cleared technical coding assessment with 100% test case coverage; demonstrated strong low-level design reasoning)..."
                    className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Internal Recruiter Notes (Confidential)</label>
                  <input
                    type="text"
                    value={recruiterNotes}
                    onChange={(e) => setRecruiterNotes(e.target.value)}
                    placeholder="Follow-up notes for interview panel or faculty mentor..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingReview}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingReview ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Submit Recruiter Decision</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extracted Text Preview Modal */}
      {showPreviewModal && activeResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#0E1524] text-slate-100 rounded-3xl border border-white/[0.1] shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  Extracted Text Preview: {activeResume.fileName} (v{activeResume.version})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-[#070A11] border border-white/[0.06] font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
              {activeResume.extractedText || 'No text content available.'}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] shrink-0 text-xs text-slate-400">
              <span>Word count: {activeResume.extractedText.split(/\s+/).filter(Boolean).length} words</span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive PDF Visual Preview Modal */}
      {showPdfViewerModal && activeResume && (
        <ResumeViewerModal
          isOpen={showPdfViewerModal}
          onClose={() => setShowPdfViewerModal(false)}
          resumeRecord={{
            id: activeResume.id,
            studentId: activeResume.studentId,
            fileName: activeResume.fileName,
            fileType: activeResume.fileFormat,
            fileSize: activeResume.fileSize,
            pageCount: activeResume.pageCount || 1,
            uploadedAt: activeResume.uploadedAt,
            fileDataUrl: activeResume.fileDataUrl,
          }}
          onReplaceResume={() => {
            setShowPdfViewerModal(false);
            fileInputRef.current?.click();
          }}
          onDeleteResume={() => {
            setShowPdfViewerModal(false);
            handleDeleteResume(activeResume.id);
          }}
        />
      )}
    </div>
  );
};
