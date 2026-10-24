import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Layers,
  GraduationCap,
  Sparkles,
  Award,
  Check,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';
import { PlacementDrive, StudentProfile, ApplicationStatus } from '../../types';
import { evaluateDriveEligibility } from '../../services/eligibilityEngine';
import { applyToDrive, getStudentApplicationStatus } from '../../services/placementDriveService';

interface DriveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drive: PlacementDrive | null;
  student: StudentProfile;
  onApplied?: () => void;
}

export const DriveDetailsModal: React.FC<DriveDetailsModalProps> = ({
  isOpen,
  onClose,
  drive,
  student,
  onApplied,
}) => {
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  if (!isOpen || !drive) return null;

  const eligibility = evaluateDriveEligibility(student, drive);
  const currentAppStatus: ApplicationStatus | null = getStudentApplicationStatus(drive.id, student.id);
  const hasApplied = applicationSuccess || Boolean(currentAppStatus);

  const handleApply = async () => {
    if (!eligibility.isEligible || hasApplied) return;

    try {
      setApplying(true);
      const res = await applyToDrive(drive, student);
      if (res.success) {
        setApplicationSuccess(true);
        if (onApplied) onApplied();
        // If official external link exists, open it in new tab
        if (drive.applicationUrl) {
          window.open(drive.applicationUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (err) {
      console.error('Failed applying to drive:', err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xs shrink-0">
              {drive.companyLogo || '🏢'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
                  {drive.companyName}
                </span>
                {drive.isProductBased && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Product Tier
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                    drive.status === 'PUBLISHED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : drive.status === 'CLOSED'
                      ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {drive.status}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {drive.jobRole}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {drive.salaryPackage}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{drive.location}</span>
                </span>
                <span>•</span>
                <span>{drive.workMode}</span>
                <span>•</span>
                <span>{drive.jobType}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 flex-1">
          {/* Live Student Eligibility Banner */}
          <div
            className={`p-4 rounded-2xl border ${
              eligibility.isEligible
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {eligibility.isEligible ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5 flex-1">
                <div className="font-extrabold text-sm">
                  {eligibility.isEligible ? 'You Are Eligible for This Drive' : 'Currently Not Eligible'}
                </div>
                {eligibility.isEligible ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      <span>CGPA: {student.cgpa} &ge; {drive.minimumCGPA}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      <span>Dept: {student.departmentName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      <span>Required Skills Verified</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1 font-mono text-[11px]">
                    <div className="font-bold text-rose-700 dark:text-rose-300">
                      Currently not eligible.
                    </div>
                    <div className="space-y-1.5 divide-y divide-rose-200/50 dark:divide-rose-900/40">
                      {!eligibility.cgpaPassed && (
                        <div className="pt-1.5 first:pt-0">
                          <span className="font-bold text-rose-800 dark:text-rose-300 block">CGPA:</span>
                          <div className="text-slate-700 dark:text-slate-300 pl-1.5 mt-0.5">
                            Your CGPA: <span className="font-bold text-rose-600 dark:text-rose-400">{student.cgpa.toFixed(2)}</span>
                            <br />
                            Required: <span className="font-bold">{(drive.minimumCGPA ?? 7.0).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      {!eligibility.deptPassed && (
                        <div className="pt-1.5 first:pt-0">
                          <span className="font-bold text-rose-800 dark:text-rose-300 block">Department:</span>
                          <div className="text-slate-700 dark:text-slate-300 pl-1.5 mt-0.5">
                            Your Department: <span className="font-bold">{student.departmentName || 'Not specified'}</span>
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
                            Your Batch: <span className="font-bold text-rose-600 dark:text-rose-400">{student.batch}</span>
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
          </div>

          {/* Key Parameters Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Minimum CGPA
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                {(drive.minimumCGPA ?? 7.0).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">Your CGPA: {student.cgpa.toFixed(2)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Allowed Depts
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate" title={drive.allowedDepartments.join(', ')}>
                {drive.allowedDepartments.join(', ')}
              </span>
              <span className="text-[10px] text-slate-500 truncate block">Your Dept: {student.departmentName}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Allowed Batches
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                {drive.allowedBatches && drive.allowedBatches.length > 0 ? drive.allowedBatches.join(', ') : 'All Batches'}
              </span>
              <span className="text-[10px] text-slate-500">Your Batch: {student.batch}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Application Deadline
              </span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                {drive.deadline}
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Verified Drive</span>
              </span>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              <span>Job Role & Overview</span>
            </h4>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {drive.description}
            </p>
          </div>

          {/* Responsibilities */}
          {drive.responsibilities && drive.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Key Responsibilities</span>
              </h4>
              <ul className="space-y-1.5 pl-1">
                {drive.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Competency Skills Matrix */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Required & Preferred Competencies</span>
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Required Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {drive.requiredSkills.map((skill, i) => {
                    const studentHasSkill = (student.skills || []).some(
                      (s) => s.skillName.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.skillName.toLowerCase())
                    );
                    return (
                      <span
                        key={i}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                          studentHasSkill
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {studentHasSkill ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <X className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{skill}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {drive.preferredSkills && drive.preferredSkills.length > 0 && (
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Preferred Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {drive.preferredSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selection Process */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Selection Process & Hiring Rounds ({drive.roundsCount || drive.selectionProcess.length} Rounds)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {drive.selectionProcess.map((round, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {round}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Placement Officer Notes / Instructions */}
          {drive.additionalInstructions && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Placement Officer Notes:</span>
              </span>
              <p className="text-[11px] leading-relaxed">
                {drive.additionalInstructions}
              </p>
            </div>
          )}

          {/* Contact Info */}
          {drive.contactInfo && (
            <div className="text-[11px] text-slate-400 font-mono">
              <span>Contact / Queries: </span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">{drive.contactInfo}</span>
            </div>
          )}

          {/* Official Application Link */}
          {drive.applicationUrl && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-xs text-indigo-900 dark:text-indigo-200">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Official Application Link:</span>
              </span>
              <a
                href={drive.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline break-all block pt-0.5"
              >
                {drive.applicationUrl}
              </a>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {hasApplied ? (
              <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Application Record Registered ({currentAppStatus || 'Applied'})</span>
              </span>
            ) : eligibility.isEligible ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ You meet all institutional eligibility criteria
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Review missing eligibility requirements above
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>

            {hasApplied ? (
              <div className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white flex items-center gap-2 shadow-sm">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Applied</span>
              </div>
            ) : eligibility.isEligible ? (
              <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {applying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Apply Now</span>
                    {drive.applicationUrl && <ExternalLink className="w-3.5 h-3.5 opacity-80" />}
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed flex items-center gap-2"
                title="You do not meet mandatory eligibility criteria"
              >
                <XCircle className="w-4 h-4" />
                <span>Not Eligible</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
