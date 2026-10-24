import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  DollarSign,
  Calendar,
  Briefcase,
  MapPin,
  GraduationCap,
  Award,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { PlacementDrive, DriveStatus, WorkMode, EmploymentType, User, UserRole } from '../../types';
import { createDrive, updateDrive } from '../../services/placementDriveService';

interface DriveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  driveToEdit: PlacementDrive | null;
  currentUser: User;
  currentRole: UserRole;
  onSuccess: (drive: PlacementDrive) => void;
}

const AVAILABLE_DEPTS = [
  'AI & DS',
  'CSE',
  'IT',
  'ECE',
  'MECH',
  'EEE',
  'CIVIL',
];

const AVAILABLE_BATCHES = [
  '2022-2026',
  '2023-2027',
  '2021-2025',
];

const LOGO_PRESETS = ['🐯', '🏢', '📊', '📦', '🌐', '🚀', '🛡️', '💼', '⚡', '🤖', '💻', '📈', '🔬'];

export const DriveFormModal: React.FC<DriveFormModalProps> = ({
  isOpen,
  onClose,
  driveToEdit,
  currentUser,
  currentRole,
  onSuccess,
}) => {
  const isEditing = Boolean(driveToEdit);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('🏢');
  const [jobRole, setJobRole] = useState('');
  const [description, setDescription] = useState('');
  const [salaryPackage, setSalaryPackage] = useState('');
  const [minCTC, setMinCTC] = useState<number | ''>('');
  const [maxCTC, setMaxCTC] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('On-site');
  const [jobType, setJobType] = useState<EmploymentType>('Full-Time');
  const [deadline, setDeadline] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [minimumCGPA, setMinimumCGPA] = useState<number>(7.0);
  const [allowedDepartments, setAllowedDepartments] = useState<string[]>(['AI & DS', 'CSE', 'IT', 'ECE']);
  const [allowedBatches, setAllowedBatches] = useState<string[]>(['2022-2026']);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['SQL', 'Python']);
  const [skillInput, setSkillInput] = useState('');
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [selectionProcess, setSelectionProcess] = useState<string[]>([
    '1. Aptitude Assessment',
    '2. Technical Interview',
    '3. HR Discussion',
  ]);
  const [roundInput, setRoundInput] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [status, setStatus] = useState<DriveStatus>('PUBLISHED');
  const [isProductBased, setIsProductBased] = useState(false);

  // Validation & Loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (driveToEdit) {
      setCompanyName(driveToEdit.companyName || '');
      setCompanyLogo(driveToEdit.companyLogo || '🏢');
      setJobRole(driveToEdit.jobRole || '');
      setDescription(driveToEdit.description || '');
      setSalaryPackage(driveToEdit.salaryPackage || '');
      setMinCTC(driveToEdit.minCTC ?? '');
      setMaxCTC(driveToEdit.maxCTC ?? '');
      setLocation(driveToEdit.location || '');
      setWorkMode(driveToEdit.workMode || 'On-site');
      setJobType(driveToEdit.jobType || 'Full-Time');
      setDeadline(driveToEdit.deadline || '');
      setApplicationUrl(driveToEdit.applicationUrl || '');
      setMinimumCGPA(driveToEdit.minimumCGPA ?? 7.0);
      setAllowedDepartments(driveToEdit.allowedDepartments || ['AI & DS', 'CSE', 'IT']);
      setAllowedBatches(driveToEdit.allowedBatches || ['2022-2026']);
      setRequiredSkills(driveToEdit.requiredSkills || []);
      setPreferredSkills(driveToEdit.preferredSkills || []);
      setSelectionProcess(driveToEdit.selectionProcess || []);
      setAdditionalInstructions(driveToEdit.additionalInstructions || '');
      setStatus(driveToEdit.status || 'PUBLISHED');
      setIsProductBased(driveToEdit.isProductBased ?? false);
    } else {
      // Default reset
      setCompanyName('');
      setCompanyLogo('🏢');
      setJobRole('');
      setDescription('');
      setSalaryPackage('');
      setMinCTC('');
      setMaxCTC('');
      setLocation('Chennai / Hybrid');
      setWorkMode('On-site');
      setJobType('Full-Time');
      setDeadline(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      setApplicationUrl('');
      setMinimumCGPA(7.0);
      setAllowedDepartments(['AI & DS', 'CSE', 'IT', 'ECE']);
      setAllowedBatches(['2022-2026']);
      setRequiredSkills(['SQL', 'Python']);
      setPreferredSkills(['Power BI', 'Git']);
      setSelectionProcess([
        '1. Online Assessment (Aptitude & Domain)',
        '2. Technical Round 1',
        '3. HR & Managerial Interview',
      ]);
      setAdditionalInstructions('');
      setStatus('PUBLISHED');
      setIsProductBased(false);
    }
    setErrors({});
    setServerError(null);
  }, [driveToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDept = (dept: string) => {
    if (allowedDepartments.includes(dept)) {
      setAllowedDepartments(allowedDepartments.filter((d) => d !== dept));
    } else {
      setAllowedDepartments([...allowedDepartments, dept]);
    }
  };

  const toggleBatch = (batch: string) => {
    if (allowedBatches.includes(batch)) {
      setAllowedBatches(allowedBatches.filter((b) => b !== batch));
    } else {
      setAllowedBatches([...allowedBatches, batch]);
    }
  };

  const addRequiredSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setSkillInput('');
    }
  };

  const removeRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const addPreferredSkill = () => {
    const trimmed = prefSkillInput.trim();
    if (trimmed && !preferredSkills.includes(trimmed)) {
      setPreferredSkills([...preferredSkills, trimmed]);
      setPrefSkillInput('');
    }
  };

  const removePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  const addRound = () => {
    const trimmed = roundInput.trim();
    if (trimmed) {
      setSelectionProcess([...selectionProcess, trimmed]);
      setRoundInput('');
    }
  };

  const removeRound = (index: number) => {
    setSelectionProcess(selectionProcess.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!companyName.trim()) newErrors.companyName = 'Company Name is required.';
    if (!jobRole.trim()) newErrors.jobRole = 'Job Role is required.';
    if (!description.trim()) newErrors.description = 'Job Description is required.';
    if (!salaryPackage.trim()) newErrors.salaryPackage = 'CTC / Salary is required.';
    if (!deadline.trim()) newErrors.deadline = 'Application Deadline is required.';
    if (minimumCGPA < 0 || minimumCGPA > 10) newErrors.minimumCGPA = 'CGPA must be between 0.0 and 10.0';
    if (allowedDepartments.length === 0) newErrors.allowedDepartments = 'Select at least one department.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setServerError(null);

    const payload: Partial<PlacementDrive> = {
      companyName: companyName.trim(),
      companyLogo,
      jobRole: jobRole.trim(),
      description: description.trim(),
      salaryPackage: salaryPackage.trim(),
      minCTC: minCTC === '' ? undefined : Number(minCTC),
      maxCTC: maxCTC === '' ? undefined : Number(maxCTC),
      location: location.trim() || 'On-Campus',
      workMode,
      jobType,
      deadline: deadline.trim(),
      applicationUrl: applicationUrl.trim(),
      minimumCGPA: Number(minimumCGPA),
      allowedDepartments,
      allowedBatches,
      requiredSkills,
      preferredSkills,
      selectionProcess,
      roundsCount: selectionProcess.length,
      additionalInstructions: additionalInstructions.trim(),
      status,
      isProductBased,
    };

    try {
      if (isEditing && driveToEdit) {
        const res = await updateDrive(driveToEdit.id, payload, currentRole, currentUser);
        if (res.success && res.drive) {
          onSuccess(res.drive);
          onClose();
        } else {
          setServerError(res.error || 'Failed to update placement drive.');
        }
      } else {
        const res = await createDrive(payload, currentRole, currentUser);
        if (res.success && res.drive) {
          onSuccess(res.drive);
          onClose();
        } else {
          setServerError(res.error || 'Failed to create placement drive.');
        }
      }
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              // PLACEMENT OFFICER CONSOLE
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {isEditing ? `Edit Placement Drive — ${driveToEdit?.companyName}` : 'Create Placement Drive'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {serverError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Section 1: Company & Role */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
              1. Company & Role Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Tiger Analytics, Zoho Corporation"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.companyName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.companyName && <p className="text-[11px] text-rose-500 font-semibold">{errors.companyName}</p>}
              </div>

              {/* Logo Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Company Logo Icon</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0">
                    {companyLogo}
                  </div>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {LOGO_PRESETS.slice(0, 6).map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setCompanyLogo(icon)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border ${
                          companyLogo === icon
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Job Role / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Data Analyst — Analytics & BI Practice"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.jobRole ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.jobRole && <p className="text-[11px] text-rose-500 font-semibold">{errors.jobRole}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Package / CTC (Display String) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={salaryPackage}
                  onChange={(e) => setSalaryPackage(e.target.value)}
                  placeholder="e.g. ₹8.5 – ₹10 LPA, 8.4 LPA"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.salaryPackage ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.salaryPackage && <p className="text-[11px] text-rose-500 font-semibold">{errors.salaryPackage}</p>}
              </div>
            </div>

            {/* Numeric CTC Range & Product Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Min CTC (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={minCTC}
                  onChange={(e) => setMinCTC(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="8.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Max CTC (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxCTC}
                  onChange={(e) => setMaxCTC(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="10.0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProductBased}
                    onChange={(e) => setIsProductBased(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">Product Tier Flag</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Job Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive overview of role, expectations, and domain context..."
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.description ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.description && <p className="text-[11px] text-rose-500 font-semibold">{errors.description}</p>}
            </div>
          </div>

          {/* Section 2: Logistics & Mode */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
              2. Logistics & Schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Chennai / Bengaluru"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Job Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as EmploymentType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship + PPO">Internship + PPO</option>
                  <option value="Apprenticeship">Apprenticeship</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                    errors.deadline ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Official Application URL</label>
                <input
                  type="url"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  placeholder="https://company.com/careers/drive"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Drive Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DriveStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                >
                  <option value="PUBLISHED">Published (Visible to eligible students)</option>
                  <option value="DRAFT">Draft (Officer only - hidden from students)</option>
                  <option value="CLOSED">Closed (Archived hiring drive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Eligibility Rules */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
              3. Institutional Eligibility Engine Criteria
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Minimum CGPA Cutoff <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  value={minimumCGPA}
                  onChange={(e) => setMinimumCGPA(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {errors.minimumCGPA && <p className="text-[11px] text-rose-500 font-semibold">{errors.minimumCGPA}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Eligible Batches</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_BATCHES.map((batch) => (
                    <button
                      key={batch}
                      type="button"
                      onClick={() => toggleBatch(batch)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        allowedBatches.includes(batch)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {batch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Allowed Departments <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_DEPTS.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDept(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      allowedDepartments.includes(dept)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
              {errors.allowedDepartments && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.allowedDepartments}</p>
              )}
            </div>
          </div>

          {/* Section 4: Skills & Rounds */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
              4. Competencies & Selection Process
            </h4>

            {/* Required Skills */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Required Mandatory Skills (Evaluated by Eligibility Engine)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRequiredSkill();
                    }
                  }}
                  placeholder="e.g. SQL, Power BI, Python"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addRequiredSkill}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Add Skill
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium flex items-center gap-1.5"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => removeRequiredSkill(sk)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Preferred Skills (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prefSkillInput}
                  onChange={(e) => setPrefSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPreferredSkill();
                    }
                  }}
                  placeholder="e.g. Tableau, Communication"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addPreferredSkill}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {preferredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium flex items-center gap-1.5"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => removePreferredSkill(sk)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Selection Rounds */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Selection Process Rounds</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roundInput}
                  onChange={(e) => setRoundInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRound();
                    }
                  }}
                  placeholder="e.g. 1. Aptitude, 2. Technical, 3. HR"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addRound}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  Add Round
                </button>
              </div>
              <div className="space-y-1.5 pt-1">
                {selectionProcess.map((round, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <span>{round}</span>
                    <button
                      type="button"
                      onClick={() => removeRound(idx)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Instructions */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Additional Instructions / Placement Officer Notes
              </label>
              <textarea
                rows={2}
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="Important documents to carry, dress code, test venue, coordinator notes..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Drive...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Placement Drive'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
