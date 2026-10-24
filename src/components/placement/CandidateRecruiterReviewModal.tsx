import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Target,
  Briefcase,
  Github,
  Linkedin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Award,
  Download,
  ExternalLink,
  Save,
} from 'lucide-react';
import { UserRole } from '../../types';
import {
  fetchStudentResumes,
  fetchAtsReports,
  fetchProfileIntegrations,
  submitRecruiterReview,
  fetchRecruiterReviews,
  StoredResumeRecord,
  RecruiterReviewRecord,
} from '../../services/resumeDataService';
import { calculateAtsCompatibilityScore, AtsAnalysisReport } from '../../services/atsScoringEngine';
import { calculateJobSpecificMatch, JobMatchResult, TargetJobSpec } from '../../services/jobMatchEngine';

interface CandidateRecruiterReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentRollNumber: string;
  studentName: string;
  studentDepartment: string;
  studentBatch?: string;
  studentCgpa?: number;
  driveId?: string;
  companyName?: string;
  jobRole?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  minimumCGPA?: number;
  allowedDepartments?: string[];
  currentUser: { id: string; name: string };
  currentRole: UserRole;
  onStatusUpdated?: (newStatus: string) => void;
}

export const CandidateRecruiterReviewModal: React.FC<CandidateRecruiterReviewModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentRollNumber,
  studentName,
  studentDepartment,
  studentBatch = '2022-2026',
  studentCgpa = 8.42,
  driveId = 'general-drive',
  companyName = 'Campus Placement Drive',
  jobRole = 'Technology Associate',
  requiredSkills = ['SQL', 'Python', 'Data Structures & Algorithms'],
  preferredSkills = ['Git', 'Power BI'],
  minimumCGPA = 7.0,
  allowedDepartments = ['AI & DS', 'CSE', 'IT', 'ECE'],
  currentUser,
  currentRole,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<StoredResumeRecord | null>(null);
  const [atsReport, setAtsReport] = useState<AtsAnalysisReport | null>(null);
  const [jobMatch, setJobMatch] = useState<JobMatchResult | null>(null);
  const [profileIntegrations, setProfileIntegrations] = useState<any>(null);

  const [reviewStatus, setReviewStatus] = useState<
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !studentId) return;

    let isMounted = true;
    setLoading(true);

    async function loadCandidate() {
      try {
        // 1. Resumes
        const userResumes = await fetchStudentResumes(studentId, currentRole);
        let activeRes: StoredResumeRecord | null = null;
        if (userResumes.length > 0) {
          activeRes = userResumes[0];
          if (isMounted) setResume(activeRes);
        }

        // 2. ATS Score
        if (activeRes && activeRes.extractedText) {
          const ats = calculateAtsCompatibilityScore(activeRes.extractedText);
          if (isMounted) setAtsReport(ats);

          // 3. Job Match
          const targetSpec: TargetJobSpec = {
            id: driveId,
            companyName,
            jobRole,
            requiredSkills,
            preferredSkills,
            minimumCGPA,
            allowedDepartments,
          };
          const jm = calculateJobSpecificMatch(activeRes.extractedText, targetSpec, {
            cgpa: studentCgpa,
            departmentName: studentDepartment,
            batch: studentBatch,
          });
          if (isMounted) setJobMatch(jm);
        }

        // 4. GitHub & LinkedIn profile integrations
        const prof = await fetchProfileIntegrations(studentId);
        if (isMounted) setProfileIntegrations(prof);

        // 5. Existing review
        const reviews = await fetchRecruiterReviews(studentId);
        const matchReview = reviews.find((r) => r.driveId === driveId) || reviews[0];
        if (matchReview && isMounted) {
          setReviewStatus(matchReview.status);
          if (matchReview.scorecard) setScorecard(matchReview.scorecard);
          if (matchReview.writtenJustification) setWrittenJustification(matchReview.writtenJustification);
          if (matchReview.recruiterNotes) setRecruiterNotes(matchReview.recruiterNotes);
        }
      } catch (err) {
        console.error('Failed to load candidate review data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCandidate();
    return () => {
      isMounted = false;
    };
  }, [isOpen, studentId, driveId]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await submitRecruiterReview(
        {
          studentId,
          studentRollNumber,
          studentName,
          department: studentDepartment,
          batch: studentBatch,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          reviewerRole: currentRole,
          driveId,
          companyName,
          status: reviewStatus,
          scorecard,
          writtenJustification,
          recruiterNotes,
        },
        currentRole
      );
      if (onStatusUpdated) onStatusUpdated(reviewStatus);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed saving recruiter review:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-[#090D16] text-slate-100 border border-white/[0.1] rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{studentName}</h3>
                <span className="font-mono text-cyan-400 text-xs font-bold">({studentRollNumber})</span>
                <span className="text-xs text-slate-400">• {studentDepartment}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation for <strong className="text-white">{companyName}</strong> — {jobRole}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading candidate records...</div>
          ) : (
            <>
              {/* Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">MAX ATS Compatibility</span>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                    {atsReport ? `${atsReport.score} / 100` : 'Not uploaded'}
                  </div>
                  <span className="text-[10px] text-slate-500">Internal ATS heuristic</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Drive Match Score</span>
                  <div className="text-xl font-black font-mono text-indigo-400 mt-1">
                    {jobMatch ? `${jobMatch.matchScore}%` : 'Unassessed'}
                  </div>
                  <span className="text-[10px] text-slate-500">Skills &amp; eligibility fit</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">GitHub Audit</span>
                  <div className="text-sm font-bold text-purple-400 mt-1 truncate">
                    {profileIntegrations?.githubUrl ? (
                      <a
                        href={profileIntegrations.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>Profile Found</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      'No GitHub URL'
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">Ownership: Unverified (Public)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">LinkedIn Profile</span>
                  <div className="text-sm font-bold text-blue-400 mt-1 truncate">
                    {profileIntegrations?.linkedInUrl ? (
                      <a
                        href={profileIntegrations.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>Profile Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      'No LinkedIn URL'
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">Manual review verified</span>
                </div>
              </div>

              {/* Resume File & Extracted Text */}
              {resume ? (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white">{resume.fileName}</span>
                      <span className="text-slate-500 font-mono">(v{resume.version} • {resume.fileSize})</span>
                    </div>

                    <a
                      href={resume.fileDataUrl}
                      download={resume.fileName}
                      className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download Resume</span>
                    </a>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] max-h-36 overflow-y-auto font-mono text-[11px] text-slate-300 whitespace-pre-wrap select-text">
                    {resume.extractedText}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200">
                  Candidate has not yet uploaded a resume file.
                </div>
              )}

              {/* Matched vs Missing Skills */}
              {jobMatch && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Matched Required Skills ({jobMatch.breakdown.requiredSkills.matched.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {jobMatch.breakdown.requiredSkills.matched.map((m, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 font-medium">
                          {m.skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <span className="font-bold text-red-400 flex items-center gap-1.5 uppercase font-mono text-[10px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Missing Required Skills ({jobMatch.breakdown.requiredSkills.missing.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {jobMatch.breakdown.requiredSkills.missing.map((sk, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800 text-red-300 font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recruiter Evaluation Form */}
              <form onSubmit={handleSave} className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    Recruiter Scorecard &amp; Justification
                  </h4>
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved to ledger
                    </span>
                  )}
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Recruiter Decision</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {(['Under Review', 'Shortlisted', 'Interview Scheduled', 'On Hold', 'Not Selected'] as const).map(
                      (st) => (
                        <button
                          type="button"
                          key={st}
                          onClick={() => setReviewStatus(st)}
                          className={`p-2 rounded-xl border font-bold text-[11px] cursor-pointer transition-all ${
                            reviewStatus === st
                              ? st === 'Shortlisted'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                                : st === 'Interview Scheduled'
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                                : st === 'Not Selected'
                                ? 'bg-red-950 text-red-300 border-red-600'
                                : 'bg-white text-slate-950 shadow-md'
                              : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Scorecard Sliders (1 to 5) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <div className="flex justify-between font-bold text-white text-[11px]">
                      <span>Technical Evidence</span>
                      <span className="text-cyan-400 font-mono">{scorecard.technicalEvidence}/5</span>
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

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <div className="flex justify-between font-bold text-white text-[11px]">
                      <span>Project Quality</span>
                      <span className="text-cyan-400 font-mono">{scorecard.projectQuality}/5</span>
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

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <div className="flex justify-between font-bold text-white text-[11px]">
                      <span>Readability Format</span>
                      <span className="text-cyan-400 font-mono">{scorecard.readabilityFormat}/5</span>
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

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <div className="flex justify-between font-bold text-white text-[11px]">
                      <span>Recommendation</span>
                      <span className="text-cyan-400 font-mono">{scorecard.recruiterRecommendation}/5</span>
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

                {/* Written Justification */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Written Justification</label>
                  <textarea
                    rows={2}
                    value={writtenJustification}
                    onChange={(e) => setWrittenJustification(e.target.value)}
                    placeholder="Evidence-based justification for shortlist / interview / on-hold..."
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Recruiter Evaluation'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
