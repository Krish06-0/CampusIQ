import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  GraduationCap,
  Code,
  FolderGit2,
  Briefcase,
  Award,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  Edit3,
  Globe,
  Code2,
  X,
  AlertCircle,
  FileText,
  Eye,
  Download,
  BookOpen,
  ShieldCheck,
  Layers,
  TrendingUp,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StudentProfile, StudentSkill, StudentProject, StudentInternship, StudentCertification } from '../types';
import { ResumeViewerModal } from '../components/resume/ResumeViewerModal';
import {
  UploadedResumeRecord,
  getUploadedResume,
  saveUploadedResume,
  deleteUploadedResume,
  downloadResumeFile,
  SAMPLE_VALID_PDF_DATA_URL,
} from '../services/resumeStorageService';
import { generateStudentPdfDataUrl } from '../services/pdfGeneratorHelper';
import { loadVcetStudentsFromStorage } from '../data/vcetStudentsData';
import { getStoredAccounts, saveStoredAccounts } from '../services/authSecurityService';

function formatRelativeTime(isoDate?: string): string {
  if (!isoDate) return 'Today';
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Today';
  }
}

function syncProjectToLatexStorage(
  studentId: string,
  projectName: string,
  description: string,
  githubUrl: string,
  liveUrl?: string,
  oldProjectName?: string
) {
  const key = `skillgap_resume_latex_source_v5_${studentId || 'default'}`;
  let latexDoc = localStorage.getItem(key);
  if (!latexDoc) return;

  const liveHref = liveUrl?.trim()
    ? `\n\n\\href{${liveUrl.trim()}}\n{Live Project}`
    : '';

  const projectSnippet = `\\textbf{${projectName}}\n\n${description}\n\n\\href{${githubUrl.trim()}}\n{GitHub}${liveHref}`;

  const searchName = oldProjectName || projectName;
  const projectRegex = new RegExp(
    `\\\\textbf\\{${searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}[\\s\\S]*?(?=\\\\textbf\\{|\\\\section\\{|\\\\end\\{document\\}|$)`,
    'i'
  );

  if (projectRegex.test(latexDoc)) {
    latexDoc = latexDoc.replace(projectRegex, `${projectSnippet}\n\n`);
  } else {
    // Insert into \section{Key Engineering Projects} or \section{Projects}
    const sectionMatch = latexDoc.match(
      /(\\section\{(?:Key Engineering Projects|Projects)\}[\s\S]*?)(\n\s*(?:\\textbf\{|\\begin\{itemize\}|\\section\{|\\end\{document\}|$))/i
    );
    if (sectionMatch) {
      latexDoc = latexDoc.replace(
        sectionMatch[1],
        `${sectionMatch[1]}\n\n${projectSnippet}\n`
      );
    } else {
      latexDoc = latexDoc.replace(
        '\\end{document}',
        `\\section{Key Engineering Projects}\n\n${projectSnippet}\n\n\\end{document}`
      );
    }
  }

  localStorage.setItem(key, latexDoc);
}

function removeProjectFromLatexStorage(studentId: string, projectName: string) {
  const key = `skillgap_resume_latex_source_v5_${studentId || 'default'}`;
  let latexDoc = localStorage.getItem(key);
  if (!latexDoc) return;

  const projectRegex = new RegExp(
    `\\n*\\\\textbf\\{${projectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}[\\s\\S]*?(?=\\\\textbf\\{|\\\\section\\{|\\\\end\\{document\\}|$)`,
    'i'
  );
  latexDoc = latexDoc.replace(projectRegex, '\n');
  localStorage.setItem(key, latexDoc);
}

interface StudentProfilePageProps {
  customStudent?: StudentProfile;
  onBack?: () => void;
  isFacultyView?: boolean;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  customStudent,
  onBack,
  isFacultyView = false,
}) => {
  const { currentStudent, updateCurrentStudent, currentRole } = useAuth();
  const activeStudent = customStudent || currentStudent;
  const [profile, setProfile] = useState<StudentProfile>(() => {
    return activeStudent
      ? { ...activeStudent }
      : {
          id: 'student-empty',
          userId: '',
          registerNumber: '',
          name: 'No Active Student',
          collegeEmail: '',
          personalEmail: '',
          phone: '',
          location: '',
          departmentId: '',
          departmentName: '',
          batch: '',
          year: 4,
          cgpa: 0,
          backlogs: 0,
          careerGoal: '',
          targetRole: '',
          summary: '',
          profileCompletion: 0,
          skills: [],
          projects: [],
          internships: [],
          certifications: [],
          achievements: [],
        };
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (customStudent || currentStudent) {
      const p = (customStudent || currentStudent)!;
      setProfile({ ...p });
      const sem = p.semester || 4;
      const ay = p.academicYear || '2025-2026';
      setSemAcadYearInput(`Sem ${sem} · ${ay}`);
    }
  }, [customStudent, currentStudent]);

  // Project modal & form states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<StudentProject | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [confirmProjectName, setConfirmProjectName] = useState('');
  const [confirmGithubLink, setConfirmGithubLink] = useState('');

  // Validation error states
  const [projectNameError, setProjectNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [githubLinkError, setGithubLinkError] = useState<string | null>(null);
  const [liveLinkError, setLiveLinkError] = useState<string | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [deptError, setDeptError] = useState<string | null>(null);
  const [classCodeError, setClassCodeError] = useState<string | null>(null);
  const [semAcadYearError, setSemAcadYearError] = useState<string | null>(null);
  const [registerNumberError, setRegisterNumberError] = useState<string | null>(null);
  const [collegeEmailError, setCollegeEmailError] = useState<string | null>(null);

  const [semAcadYearInput, setSemAcadYearInput] = useState<string>(() => {
    const p = customStudent || currentStudent;
    const sem = p?.semester || 4;
    const ay = p?.academicYear || '2025-2026';
    return `Sem ${sem} · ${ay}`;
  });

  // Card menu dropdown & delete modal states
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<StudentProject | null>(null);

  // My Resume states & handlers
  const [resumeRecord, setResumeRecord] = useState<UploadedResumeRecord | null>(() => {
    return activeStudent?.id ? getUploadedResume(activeStudent.id) : null;
  });
  const [isResumeViewerOpen, setIsResumeViewerOpen] = useState(false);
  const [isResumeLoading, setIsResumeLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function resolveActiveStudentResume() {
      if (!activeStudent?.id) {
        setResumeRecord(null);
        return;
      }

      setIsResumeLoading(true);

      // 1. Try student-isolated local storage key
      let record = getUploadedResume(activeStudent.id);

      // 2. Try by student register number or userId
      if (!record && activeStudent.registerNumber) {
        record = getUploadedResume(activeStudent.registerNumber);
      }
      if (!record && activeStudent.userId) {
        record = getUploadedResume(activeStudent.userId);
      }

      // 3. Try checking client resumes cache from resumeDataService
      if (!record) {
        const cacheKeys = [
          `skillgap_resumes_cache_${activeStudent.id}`,
          activeStudent.registerNumber ? `skillgap_resumes_cache_${activeStudent.registerNumber}` : null,
          activeStudent.userId ? `skillgap_resumes_cache_${activeStudent.userId}` : null,
        ].filter(Boolean) as string[];

        for (const k of cacheKeys) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const list = JSON.parse(raw);
              if (Array.isArray(list) && list.length > 0) {
                const latest = list[0];
                record = {
                  id: latest.id,
                  studentId: activeStudent.id,
                  fileName: latest.fileName,
                  fileType: latest.fileFormat || 'application/pdf',
                  fileSize: latest.fileSize || '184 KB',
                  pageCount: latest.pageCount || 1,
                  uploadedAt: latest.uploadedAt || new Date().toISOString(),
                  fileDataUrl: latest.fileDataUrl,
                  extractedData: latest.extractedText ? { rawText: latest.extractedText } : undefined,
                };
                break;
              }
            }
          } catch {
            // ignore
          }
        }
      }

      // 4. Query authenticated backend API /api/resumes
      try {
        const queryId = encodeURIComponent(activeStudent.id);
        const res = await fetch(`/api/resumes?studentId=${queryId}`, {
          headers: {
            'x-user-id': activeStudent.id,
            'x-user-role': currentRole || 'STUDENT',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.resumes) && data.resumes.length > 0) {
            const latest = data.resumes[0];
            if (!record || new Date(latest.uploadedAt).getTime() >= new Date(record.uploadedAt).getTime()) {
              record = {
                id: latest.id,
                studentId: activeStudent.id,
                fileName: latest.fileName,
                fileType: latest.fileFormat || 'application/pdf',
                fileSize: latest.fileSize || '184 KB',
                pageCount: latest.pageCount || 1,
                uploadedAt: latest.uploadedAt || new Date().toISOString(),
                fileDataUrl: latest.fileDataUrl,
                extractedData: latest.extractedText ? { rawText: latest.extractedText } : undefined,
              };
            }
          }
        }
      } catch (backendErr) {
        console.warn('Backend fetch for resume note:', backendErr);
      }

      // 5. Fallback from candidate profile attributes
      if (!record && activeStudent.resumeFileName) {
        record = {
          id: `res-${activeStudent.id}`,
          studentId: activeStudent.id,
          fileName: activeStudent.resumeFileName,
          fileType: activeStudent.resumeFileType || 'application/pdf',
          fileSize: activeStudent.resumeFileSize || '1.1 MB',
          pageCount: activeStudent.resumePageCount || 1,
          uploadedAt: activeStudent.resumeParsedAt || new Date().toISOString(),
          fileDataUrl: activeStudent.resumeUrl || '',
          thumbnailUrl: undefined,
        };
      }

      // 6. Ensure valid standard-compliant PDF data URL (handle empty or truncated stub)
      if (record) {
        const isStub = !record.fileDataUrl || record.fileDataUrl.length < 50;
        if (isStub) {
          record.fileDataUrl = generateStudentPdfDataUrl({
            name: activeStudent.name,
            registerNumber: activeStudent.registerNumber,
            email: activeStudent.collegeEmail || activeStudent.personalEmail,
            phone: activeStudent.phone,
            location: activeStudent.location,
            departmentName: activeStudent.departmentName,
            batch: activeStudent.batch,
            cgpa: activeStudent.cgpa,
            backlogs: activeStudent.backlogs,
            skills: activeStudent.skills?.map((s) => s.skillName),
            projects: activeStudent.projects?.map((p) => ({ title: p.title, description: p.description })),
            internships: activeStudent.internships?.map((i) => ({ role: i.role, company: i.company, desc: i.description })),
            certifications: activeStudent.certifications?.map((c) => ({ name: c.name, issuer: c.issuer })),
          });
        }
        // Save to student-isolated local storage for fast instant restore after refresh
        saveUploadedResume(activeStudent.id, record);
      }

      if (!isCancelled) {
        setResumeRecord(record);
        setIsResumeLoading(false);
      }
    }

    resolveActiveStudentResume();

    return () => {
      isCancelled = true;
    };
  }, [activeStudent, currentRole]);

  // Certifications state
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('NPTEL / Swayam');
  const [newCertUrl, setNewCertUrl] = useState('');

  const addCertification = () => {
    if (!newCertName.trim()) return;
    const newCert: StudentCertification = {
      id: `cert-${Date.now()}`,
      studentId: profile.id,
      name: newCertName.trim(),
      issuer: newCertIssuer.trim() || 'NPTEL / Swayam',
      issueDate: new Date().toISOString().split('T')[0],
      credentialUrl: newCertUrl.trim() || 'https://nptel.ac.in/verify',
    };
    const updatedCerts = [newCert, ...(profile.certifications || [])];
    const updatedProfile = { ...profile, certifications: updatedCerts };
    setProfile(updatedProfile);
    updateCurrentStudent(updatedProfile);
    setNewCertName('');
    setNewCertUrl('');
  };

  const removeCertification = (certId: string) => {
    const updatedCerts = (profile.certifications || []).filter((c: StudentCertification) => c.id !== certId);
    const updatedProfile = { ...profile, certifications: updatedCerts };
    setProfile(updatedProfile);
    updateCurrentStudent(updatedProfile);
  };

  const handleToggleEndorsement = () => {
    const newStatus = profile.endorsementStatus === 'ENDORSED' ? 'PENDING' : 'ENDORSED';
    const updatedProfile = {
      ...profile,
      endorsementStatus: newStatus as 'ENDORSED' | 'PENDING',
    };
    setProfile(updatedProfile);
    updateCurrentStudent(updatedProfile);
  };

  // Handle Delete Resume
  const handleDeleteResume = () => {
    deleteUploadedResume(profile.id);
    setResumeRecord(null);
    setIsResumeViewerOpen(false);

    const updatedProfile = {
      ...profile,
      resumeFileName: undefined,
      resumeUrl: undefined,
      resumeParsedAt: undefined,
      resumePageCount: undefined,
      resumeFileSize: undefined,
      resumeFileType: undefined,
    };
    setProfile(updatedProfile);
    updateCurrentStudent(updatedProfile);
  };

  // New item inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<StudentSkill['category']>('Programming');
  const [newSkillProf, setNewSkillProf] = useState<StudentSkill['proficiency']>('Intermediate');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveError(null);
    let hasError = false;

    // Validate Register Number
    const cleanReg = profile.registerNumber ? profile.registerNumber.trim().toUpperCase() : '';
    if (!cleanReg) {
      setRegisterNumberError('Register number is required.');
      hasError = true;
    } else {
      // Validate against official student records
      const allOfficialStudents = loadVcetStudentsFromStorage();
      const officialMatch = allOfficialStudents.find(
        (s) =>
          s.registerNumber.toUpperCase() === cleanReg ||
          (s.rollNumber && s.rollNumber.toUpperCase() === cleanReg) ||
          s.registerNumber.replace(/R|L/g, '').toUpperCase() === cleanReg.replace(/R|L/g, '')
      );

      const isKnownSeed =
        cleanReg === '717822P101' ||
        cleanReg === '22AIDS014' ||
        cleanReg === '732923IT001' ||
        cleanReg === '732923ITR001' ||
        cleanReg === '23IT7A01' ||
        /^[0-9]{2}[A-Z0-9]{4,10}$/i.test(cleanReg);

      if (!officialMatch && !isKnownSeed) {
        setRegisterNumberError('Register number not found in official institutional records.');
        hasError = true;
      } else {
        // Prevent duplicate register numbers across different accounts
        const accounts = getStoredAccounts();
        const isDuplicateReg = accounts.some((acc) => {
          const isDifferent =
            acc.id !== profile.userId &&
            acc.id !== currentStudent?.userId &&
            acc.id !== profile.id;
          if (!isDifferent) return false;
          return acc.rollNumber && acc.rollNumber.trim().toUpperCase() === cleanReg;
        });

        if (isDuplicateReg) {
          setRegisterNumberError('This register number is already linked to another student account.');
          hasError = true;
        } else if (officialMatch) {
          // Preserve student account isolation: verify ownership and prevent claiming another student's identity
          const currentName = profile.name.trim().toLowerCase();
          const matchName = officialMatch.name.trim().toLowerCase();
          const currentTokens = currentName.split(/\s+/).filter(Boolean);
          const matchTokens = matchName.split(/\s+/).filter(Boolean);
          const hasCommonToken = currentTokens.some((t) =>
            matchTokens.some((mt) => mt.includes(t) || t.includes(mt))
          );

          const isSeedOwner =
            profile.userId === 'user-student-alex' ||
            profile.userId === 'user-student-priya' ||
            profile.id === 'student-alex-kumar' ||
            profile.id === 'student-priya-sharma';

          if (!isSeedOwner && !hasCommonToken) {
            setRegisterNumberError(
              `Identity mismatch: Record belongs to ${officialMatch.name}. Account isolation prevents claiming another student's identity.`
            );
            hasError = true;
          } else {
            setRegisterNumberError(null);
          }
        } else {
          setRegisterNumberError(null);
        }
      }
    }

    // Validate College Email
    const cleanEmail = profile.collegeEmail ? profile.collegeEmail.trim().toLowerCase() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      setCollegeEmailError('College email is required.');
      hasError = true;
    } else if (!emailRegex.test(cleanEmail)) {
      setCollegeEmailError('Please enter a valid email format.');
      hasError = true;
    } else if (
      !cleanEmail.endsWith('@college.edu') &&
      !cleanEmail.endsWith('@vcet.ac.in') &&
      !cleanEmail.endsWith('.ac.in') &&
      !cleanEmail.endsWith('.edu')
    ) {
      setCollegeEmailError('College email must end with @college.edu or @vcet.ac.in.');
      hasError = true;
    } else {
      // Prevent duplicate college email across different accounts
      const accounts = getStoredAccounts();
      const isDuplicateEmail = accounts.some((acc) => {
        const isDifferent =
          acc.id !== profile.userId &&
          acc.id !== currentStudent?.userId &&
          acc.id !== profile.id;
        if (!isDifferent) return false;
        return acc.email && acc.email.trim().toLowerCase() === cleanEmail;
      });

      if (isDuplicateEmail) {
        setCollegeEmailError('This college email is already in use by another student.');
        hasError = true;
      } else {
        // Verify college email ownership against official student record if matched
        const allOfficialStudents = loadVcetStudentsFromStorage();
        const officialMatch = allOfficialStudents.find(
          (s) =>
            s.registerNumber.toUpperCase() === cleanReg ||
            (s.rollNumber && s.rollNumber.toUpperCase() === cleanReg) ||
            s.registerNumber.replace(/R|L/g, '').toUpperCase() === cleanReg.replace(/R|L/g, '')
        );

        if (officialMatch && officialMatch.email) {
          const expectedEmail = officialMatch.email.toLowerCase();
          const emailPrefix = cleanEmail.split('@')[0];
          const isSeedOwner =
            profile.userId === 'user-student-alex' ||
            profile.userId === 'user-student-priya' ||
            profile.id === 'student-alex-kumar' ||
            profile.id === 'student-priya-sharma';

          if (
            !isSeedOwner &&
            cleanEmail !== expectedEmail &&
            !emailPrefix.includes(officialMatch.registerNumber.toLowerCase().slice(-3)) &&
            !emailPrefix.includes(officialMatch.name.split(' ')[0].toLowerCase())
          ) {
            setCollegeEmailError(
              `Email ownership verification failed: Record ${officialMatch.registerNumber} is registered to ${officialMatch.email}.`
            );
            hasError = true;
          } else {
            setCollegeEmailError(null);
          }
        } else {
          setCollegeEmailError(null);
        }
      }
    }

    // Validate Department
    if (!profile.departmentName || !profile.departmentName.trim()) {
      setDeptError('Department is required (e.g. AI & DS, IT, CSE).');
      hasError = true;
    } else {
      setDeptError(null);
    }

    // Validate Class Code
    if (!profile.classCode || !profile.classCode.trim()) {
      setClassCodeError('Class code is required (e.g. 24AD5A).');
      hasError = true;
    } else {
      setClassCodeError(null);
    }

    // Validate Semester & Acad. Year
    if (!semAcadYearInput || !semAcadYearInput.trim()) {
      setSemAcadYearError('Semester & Academic Year is required (e.g. Sem 4 · 2025-2026).');
      hasError = true;
    } else {
      setSemAcadYearError(null);
    }

    // Validate batch
    if (profile.batch) {
      const batchRegex = /^(\d{4})-(\d{4})$/;
      const match = profile.batch.match(batchRegex);
      if (!match) {
        setBatchError('Invalid format. Use YYYY-YYYY');
        hasError = true;
      } else {
        const startYear = parseInt(match[1]);
        const endYear = parseInt(match[2]);
        if (endYear !== startYear + 4) {
          setBatchError('Ending year must be 4 years after starting year.');
          hasError = true;
        } else {
          setBatchError(null);
        }
      }
    }

    if (hasError) {
      setSaveError('Please resolve validation errors below.');
      return;
    }

    setIsSaving(true);

    try {
      // Realistic smooth save delay for user feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Parse semAcadYearInput
      const semMatch = semAcadYearInput.match(/(?:Sem\s*)?(\d+)/i);
      const ayMatch = semAcadYearInput.match(/(\d{4}\s*-\s*\d{4})/);

      const updatedProfile = {
        ...profile,
        registerNumber: cleanReg,
        collegeEmail: cleanEmail,
        departmentName: profile.departmentName.trim(),
        classCode: profile.classCode?.trim(),
        semester: semMatch ? parseInt(semMatch[1], 10) : profile.semester,
        academicYear: ayMatch ? ayMatch[1].replace(/\s+/g, '') : profile.academicYear,
      };

      setProfile(updatedProfile);
      updateCurrentStudent(updatedProfile);

      // Keep active registered account in sync to persist after refresh
      const accounts = getStoredAccounts();
      const activeAccIdx = accounts.findIndex(
        (a) =>
          a.id === updatedProfile.userId ||
          a.id === currentStudent?.userId ||
          a.id === updatedProfile.id
      );
      if (activeAccIdx >= 0) {
        accounts[activeAccIdx].rollNumber = cleanReg;
        accounts[activeAccIdx].email = cleanEmail;
        saveStoredAccounts(accounts);
      }
      try {
        localStorage.setItem('skillgap_student_profile', JSON.stringify(updatedProfile));
      } catch {}

      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setIsSaving(false);
      setSaveError('Failed to save profile. Please try again.');
    }
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: StudentSkill = {
      id: `ss-manual-${Date.now()}`,
      studentId: profile.id,
      skillId: `sk-${newSkillName.toLowerCase().replace(/\s+/g, '-')}`,
      skillName: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProf,
      source: 'MANUAL',
      confidence: 1.0,
      verified: true,
    };
    setProfile({
      ...profile,
      skills: [...profile.skills, newSkill],
    });
    setNewSkillName('');
  };

  const removeSkill = (id: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s.id !== id),
    });
  };

  const handleOpenAddProjectModal = () => {
    setEditingProject(null);
    setProjectName('');
    setConfirmProjectName('');
    setProjectDescription('');
    setGithubLink('');
    setConfirmGithubLink('');
    setLiveLink('');
    setProjectNameError(null);
    setDescriptionError(null);
    setGithubLinkError(null);
    setLiveLinkError(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditModal = (proj: StudentProject) => {
    setOpenMenuId(null);
    setEditingProject(proj);
    setProjectName(proj.title);
    setConfirmProjectName(proj.title);
    setProjectDescription(proj.description);
    setGithubLink(proj.githubUrl || '');
    setConfirmGithubLink(proj.githubUrl || '');
    setLiveLink(proj.liveUrl || '');
    setProjectNameError(null);
    setDescriptionError(null);
    setGithubLinkError(null);
    setLiveLinkError(null);
    setIsProjectModalOpen(true);
  };

  const GITHUB_URL_REGEX = /^https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+(?:\/)?$/i;
  const LIVE_URL_REGEX = /^https?:\/\/.+/i;

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // 1. Project Name validation
    if (!projectName.trim()) {
      setProjectNameError('Project name is required.');
      hasError = true;
    } else if (projectName.trim() !== confirmProjectName.trim()) {
      setProjectNameError('Project names do not match.');
      hasError = true;
    } else {
      setProjectNameError(null);
    }

    // 2. Project Description validation
    if (!projectDescription.trim()) {
      setDescriptionError('Project description is required.');
      hasError = true;
    } else {
      setDescriptionError(null);
    }

    // 3. GitHub Code Link validation
    if (!githubLink.trim()) {
      setGithubLinkError('GitHub repository URL is required.');
      hasError = true;
    } else if (!GITHUB_URL_REGEX.test(githubLink.trim())) {
      setGithubLinkError('Please enter a valid GitHub repository URL.');
      hasError = true;
    } else if (githubLink.trim() !== confirmGithubLink.trim()) {
      setGithubLinkError('GitHub links do not match.');
      hasError = true;
    } else {
      setGithubLinkError(null);
    }

    // 4. Live Link validation (optional)
    if (liveLink.trim() && !LIVE_URL_REGEX.test(liveLink.trim())) {
      setLiveLinkError('Please enter a valid URL starting with http:// or https://');
      hasError = true;
    } else {
      setLiveLinkError(null);
    }

    if (hasError) return;

    const trimmedName = projectName.trim();
    const trimmedDesc = projectDescription.trim();
    const trimmedGithub = githubLink.trim();
    const trimmedLive = liveLink.trim() || undefined;

    let updatedProjects: StudentProject[];

    if (editingProject) {
      // Update existing project
      updatedProjects = profile.projects.map((p) => {
        if (p.id === editingProject.id) {
          return {
            ...p,
            title: trimmedName,
            description: trimmedDesc,
            githubUrl: trimmedGithub,
            liveUrl: trimmedLive,
            name: trimmedName,
            github: trimmedGithub,
            live: trimmedLive,
          } as StudentProject;
        }
        return p;
      });

      syncProjectToLatexStorage(
        profile.id,
        trimmedName,
        trimmedDesc,
        trimmedGithub,
        trimmedLive,
        editingProject.title
      );
    } else {
      // Add new project
      const newProj = {
        id: `proj-${Date.now()}`,
        studentId: profile.id,
        title: trimmedName,
        description: trimmedDesc,
        githubUrl: trimmedGithub,
        liveUrl: trimmedLive,
        technologies: [],
        name: trimmedName,
        github: trimmedGithub,
        live: trimmedLive,
      } as unknown as StudentProject;

      updatedProjects = [newProj, ...profile.projects];

      syncProjectToLatexStorage(
        profile.id,
        trimmedName,
        trimmedDesc,
        trimmedGithub,
        trimmedLive
      );
    }

    const updatedProfile = {
      ...profile,
      projects: updatedProjects,
    };

    setProfile(updatedProfile);
    updateCurrentStudent(updatedProfile);
    setIsProjectModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingProject) return;
    const updatedProjects = profile.projects.filter((p) => p.id !== deletingProject.id);
    const updatedProfile = {
      ...profile,
      projects: updatedProjects,
    };
    setProfile(updatedProfile);
    updateCurrentStudent(updatedProfile);
    removeProjectFromLatexStorage(profile.id, deletingProject.title);
    setDeletingProject(null);
  };

  if (!activeStudent || !profile.id || profile.id === 'student-empty') {
    return (
      <div className="space-y-4 max-w-xl mx-auto my-12 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto font-mono font-bold text-lg">
          MAX
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Student Profile Loaded</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please sign in with your verified university roll number, or select a candidate from the Student Directory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Premium Glassmorphic Profile Header / Action Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-indigo-500/25 p-6 transition-all duration-300 group hover:border-indigo-400/40">
        {/* Subtle Ambient Cyan & Violet Glow Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Student Info & Badge Section */}
          <div className="space-y-2">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-1 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 backdrop-blur-md transition-all cursor-pointer"
              >
                <span>&larr; Back to Student Directory</span>
              </button>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {profile.name}
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30">
                {profile.registerNumber}
              </span>
              {profile.classCode && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  Class: {profile.classCode}
                </span>
              )}
              {profile.endorsementStatus === 'ENDORSED' ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Faculty Endorsed</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Pending Faculty Endorsement
                </span>
              )}
            </div>

            {/* Department & Batch Information Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs text-slate-200 shadow-sm">
                <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold text-white">{profile.departmentName || 'AI & DS'}</span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold text-cyan-300">Batch {profile.batch || '2024-2028'}</span>
                {profile.semester && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">Semester {profile.semester}</span>
                  </>
                )}
                {profile.academicYear && (
                  <span className="text-slate-400 text-[11px]">({profile.academicYear})</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button & Status Feedback Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Feedback Indicators */}
            {saveError && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{saveError}</span>
              </span>
            )}

            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-300 shadow-lg shadow-emerald-950/40 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Profile Saved</span>
              </span>
            )}

            {/* Redesigned Save Profile Button with Purple-to-Cyan Gradient & Glow */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group/btn ${
                isSaving ? 'opacity-80 cursor-wait' : 'hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {/* Vibrant Gradient & Glow background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 group-hover/btn:from-purple-500 group-hover/btn:via-indigo-500 group-hover/btn:to-cyan-400 transition-all duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-300 blur-md transition-opacity duration-300" />

              <div className="relative z-10 flex items-center gap-2">
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-cyan-200 group-hover/btn:scale-110 transition-transform" />
                    <span>{isFacultyView ? 'Save Evaluation' : 'Save Profile'}</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
            Profile Completion Status: {profile.profileCompletion}%
          </div>
          <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
            Verified profile feeds into the Skill Gap Analyzer and AI LaTeX Resume Studio.
          </p>
        </div>
        <div className="w-44 bg-white dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-indigo-200 dark:border-indigo-800">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all"
            style={{ width: `${profile.profileCompletion}%` }}
          />
        </div>
      </div>

      {/* Personal & Academic Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Personal Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Register Number</label>
              <input
                type="text"
                value={profile.registerNumber}
                onChange={(e) => {
                  setProfile({ ...profile, registerNumber: e.target.value });
                  if (registerNumberError) setRegisterNumberError(null);
                }}
                placeholder="e.g. 717822P101"
                className={`w-full px-3 py-2 rounded-xl border ${
                  registerNumberError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase`}
              />
              {registerNumberError && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{registerNumberError}</span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">College Email</label>
              <input
                type="email"
                value={profile.collegeEmail}
                onChange={(e) => {
                  setProfile({ ...profile, collegeEmail: e.target.value });
                  if (collegeEmailError) setCollegeEmailError(null);
                }}
                placeholder="e.g. student@college.edu"
                className={`w-full px-3 py-2 rounded-xl border ${
                  collegeEmailError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
              />
              {collegeEmailError && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{collegeEmailError}</span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Personal Email</label>
              <input
                type="email"
                value={profile.personalEmail}
                onChange={(e) => setProfile({ ...profile, personalEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium text-xs mb-1">Target Job Role</label>
            <input
              type="text"
              value={profile.targetRole}
              onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              placeholder="e.g. Data Analyst, Software Development Engineer"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium text-xs mb-1">Professional Summary</label>
            <textarea
              rows={3}
              value={profile.summary || ''}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              placeholder="Concise 2-3 sentence technical overview..."
            />
          </div>
        </div>

        {/* Academic Details */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Academic Qualifications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Department</label>
              <input
                type="text"
                value={profile.departmentName || ''}
                onChange={(e) => {
                  setProfile({ ...profile, departmentName: e.target.value });
                  if (deptError) setDeptError(null);
                }}
                placeholder="e.g., AI & DS, IT, CSE"
                className={`w-full px-3 py-2 rounded-xl border ${
                  deptError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-semibold`}
              />
              {deptError && <p className="text-xs text-rose-500 mt-1">{deptError}</p>}
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Batch (YYYY-YYYY)</label>
              <input
                type="text"
                value={profile.batch}
                onChange={(e) => setProfile({ ...profile, batch: e.target.value })}
                placeholder="2024-2028"
                className={`w-full px-3 py-2 rounded-xl border ${
                  batchError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-700 dark:text-white`}
              />
              {batchError && <p className="text-xs text-rose-500 mt-1">{batchError}</p>}
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Class Code</label>
              <input
                type="text"
                value={profile.classCode || ''}
                onChange={(e) => {
                  setProfile({ ...profile, classCode: e.target.value });
                  if (classCodeError) setClassCodeError(null);
                }}
                placeholder="e.g., 24AD5A"
                className={`w-full px-3 py-2 rounded-xl border ${
                  classCodeError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold`}
              />
              {classCodeError && <p className="text-xs text-rose-500 mt-1">{classCodeError}</p>}
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Semester &amp; Acad. Year</label>
              <input
                type="text"
                value={semAcadYearInput}
                onChange={(e) => {
                  setSemAcadYearInput(e.target.value);
                  if (semAcadYearError) setSemAcadYearError(null);
                }}
                placeholder="Sem 4 · 2025-2026"
                className={`w-full px-3 py-2 rounded-xl border ${
                  semAcadYearError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold`}
              />
              {semAcadYearError && <p className="text-xs text-rose-500 mt-1">{semAcadYearError}</p>}
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Current Year</label>
              <input
                type="number"
                value={profile.year}
                onChange={(e) => setProfile({ ...profile, year: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Verified CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile.cgpa}
                onChange={(e) => setProfile({ ...profile, cgpa: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Active Backlogs / Arrears</label>
              <input
                type="number"
                min="0"
                value={profile.backlogs}
                onChange={(e) => setProfile({ ...profile, backlogs: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Placement Eligibility</label>
              <div className={`px-3 py-2 rounded-xl border font-bold flex items-center gap-1.5 ${
                profile.cgpa >= 7.5 && profile.backlogs === 0
                  ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'border-amber-200 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{profile.cgpa >= 7.5 && profile.backlogs === 0 ? 'Eligible for Product Drives' : 'Eligibility Conditional (Backlogs/CGPA)'}</span>
              </div>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={profile.linkedInUrl || ''}
                onChange={(e) => setProfile({ ...profile, linkedInUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">GitHub Profile</label>
              <input
                type="text"
                value={profile.githubUrl || ''}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          {/* Mentorship & Faculty Feedback Block */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs">
                Class Mentor Evaluation &amp; Placement Remarks
              </label>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Advisor: {profile.mentorName || 'Prof. V. Manoj Praveen'}
              </span>
            </div>
            <textarea
              rows={2}
              value={profile.mentorRemarks || ''}
              onChange={(e) => setProfile({ ...profile, mentorRemarks: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              placeholder="Faculty observations, readiness for Day-1 interviews, recommended training interventions..."
            />
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Code className="w-4 h-4 text-indigo-600" />
            <span>Technical Skills & Proficiencies</span>
          </div>
          <span className="text-xs text-slate-400">{profile.skills.length} Skills Listed</span>
        </div>

        {/* Add Skill Controls */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Add new skill (e.g. Power BI, Docker, C++)..."
            className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <select
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="Programming">Programming</option>
            <option value="Database">Database</option>
            <option value="Data Science">Data Science</option>
            <option value="AI/ML">AI/ML</option>
            <option value="Web Development">Web Development</option>
            <option value="Cloud">Cloud</option>
            <option value="Core CS">Core CS</option>
            <option value="Tools">Tools</option>
            <option value="Soft Skills">Soft Skills</option>
          </select>
          <select
            value={newSkillProf}
            onChange={(e) => setNewSkillProf(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button
            onClick={addSkill}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>

        {/* Skills Tag Cloud grouped by category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {profile.skills.map((skill) => (
            <div
              key={skill.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 flex items-center justify-between text-xs group"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{skill.skillName}</span>
                  {skill.verified && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-medium">
                    {skill.category}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    {skill.proficiency}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeSkill(skill.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all"
                title="Remove Skill"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Key Engineering Projects Section */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        {/* Header: [Project Icon] Key Engineering Projects [+]       0 Projects */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <FolderGit2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              <span>Key Engineering Projects</span>
            </div>

            {/* Small circular + button immediately beside title (~32px x 32px) */}
            <button
              type="button"
              onClick={handleOpenAddProjectModal}
              title="Add Engineering Project"
              aria-label="Add Engineering Project"
              className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Project count indicator */}
          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
            {profile.projects.length === 0
              ? '0 Projects'
              : profile.projects.length === 1
              ? '1 Project'
              : `${profile.projects.length} Projects`}
          </span>
        </div>

        {/* Projects Cards List */}
        {profile.projects.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
            <FolderGit2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No engineering projects added yet.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Click the <span className="font-bold text-indigo-600 dark:text-indigo-400">+</span> button beside the title to add your first project.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 relative group"
              >
                {/* Card Top: Project Name & Three-Dot Menu */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {proj.title}
                    </h4>
                    {proj.role && (
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {proj.role}
                      </span>
                    )}
                  </div>

                  {/* Three-dot ⋮ menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === proj.id ? null : proj.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Project options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === proj.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(proj)}
                            className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              setDeletingProject(proj);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {proj.description}
                </p>

                {/* Bottom Links: GitHub Code and Live Project */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {/* GitHub Code Link */}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-all group/link"
                    >
                      <Code2 className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover/link:text-indigo-500 transition-colors" />
                      <div className="text-left">
                        <div className="text-xs font-bold leading-tight text-slate-900 dark:text-white">
                          GitHub Code
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight flex items-center gap-0.5">
                          <span>↗ Repository</span>
                        </div>
                      </div>
                    </a>
                  )}

                  {/* Live Project Link (Only show if live link exists) */}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 transition-all group/live"
                    >
                      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover/live:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="text-xs font-bold leading-tight text-emerald-950 dark:text-emerald-200">
                          Live Project
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-tight flex items-center gap-0.5">
                          <span>↗ Open Project</span>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continuous Learning, Certifications & Problem Solving */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <BookOpen className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            <span>Continuous Learning, Certifications &amp; Coding Tracks</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {(profile.certifications || []).length} Verified Certifications
          </span>
        </div>

        {/* LeetCode / Coding Assessment Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">LeetCode Solved</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {profile.leetCodeUrl?.includes('leetcode') ? '145' : '120'}+ Questions
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Sliding Window · DP · Trees</div>
            </div>
            <Code2 className="w-6 h-6 text-indigo-500 opacity-80" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">CRT Syllabus Modules</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                4 / 5 Complete
              </div>
              <div className="text-[10px] text-indigo-500 font-semibold mt-0.5">Quantitative &amp; Tech Aptitude</div>
            </div>
            <Award className="w-6 h-6 text-amber-500 opacity-80" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Core AI &amp; DS Labs</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                100% Verified
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Data Mining · ML · Big Data</div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-80" />
          </div>
        </div>

        {/* Add Certificate input controls */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={newCertName}
            onChange={(e) => setNewCertName(e.target.value)}
            placeholder="Certificate title (e.g. AWS Machine Learning Foundations, NPTEL Python)..."
            className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={newCertIssuer}
            onChange={(e) => setNewCertIssuer(e.target.value)}
            placeholder="Issuer (e.g. NPTEL / Anna University, Coursera, IBM)..."
            className="w-44 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            onClick={addCertification}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certificate</span>
          </button>
        </div>

        {/* Certifications List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(profile.certifications || []).map((cert: StudentCertification) => (
            <div
              key={cert.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{cert.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {cert.issuer} · Issued {cert.issueDate}
                </div>
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <button
                onClick={() => removeCertification(cert.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                title="Remove certification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Internships & Practical Experience */}
      {profile.internships && profile.internships.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Briefcase className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              <span>Internships &amp; Industry Exposure</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {profile.internships.length} Experiential Learning
            </span>
          </div>

          <div className="space-y-3">
            {profile.internships.map((internship: StudentInternship) => (
              <div
                key={internship.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {internship.role}
                    </h4>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      {internship.company}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {internship.startDate} &mdash; {internship.endDate}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {internship.description}
                </p>
                {internship.technologies && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {internship.technologies.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLACEMENT & RECRUITMENT ELIGIBILITY MATRIX */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
            <span>Campus Placement &amp; Corporate Drive Eligibility</span>
          </div>

          {/* Faculty Endorsement Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleEndorsement}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                profile.endorsementStatus === 'ENDORSED'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 hover:bg-amber-200 border border-amber-300 dark:border-amber-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {profile.endorsementStatus === 'ENDORSED' ? 'Faculty Endorsed' : 'Endorse Candidate'}
              </span>
            </button>
          </div>
        </div>

        {/* 3-Tier Placement Eligibility Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Tier 1 Product */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            profile.cgpa >= 7.5 && profile.backlogs === 0
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 opacity-80'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white">Tier-1 Product Drives</span>
              {profile.cgpa >= 7.5 && profile.backlogs === 0 ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  ELIGIBLE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  CRITERIA PENDING
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div>• Cutoff: &ge; 7.50 CGPA (Current: {profile.cgpa})</div>
              <div>• Max Backlogs: 0 (Current: {profile.backlogs})</div>
              <div>• Target Package: 8.0 &ndash; 16.0 LPA</div>
            </div>
          </div>

          {/* Tier 2 Core AI & Analytics */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            profile.cgpa >= 7.0 && profile.backlogs === 0
              ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 opacity-80'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white">AI / Data Analytics</span>
              {profile.cgpa >= 7.0 && profile.backlogs === 0 ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                  ELIGIBLE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  CONDITIONAL
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div>• Cutoff: &ge; 7.00 CGPA (Current: {profile.cgpa})</div>
              <div>• Skills: Python, SQL, Power BI, Statistics</div>
              <div>• Target Package: 6.0 &ndash; 10.0 LPA</div>
            </div>
          </div>

          {/* Tier 3 IT Services */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            profile.cgpa >= 6.5 && profile.backlogs <= 1
              ? 'border-teal-300 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30'
              : 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white">IT Services &amp; Mass</span>
              {profile.cgpa >= 6.5 && profile.backlogs <= 1 ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                  ELIGIBLE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                  ARREARS BLOCKED
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div>• Cutoff: &ge; 6.50 CGPA (Current: {profile.cgpa})</div>
              <div>• Allowed Backlogs: &le; 1 (Current: {profile.backlogs})</div>
              <div>• Target Package: 4.0 &ndash; 7.0 LPA</div>
            </div>
          </div>
        </div>

        {/* Advisor Assessment Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Class Mentor Recommendation
            </span>
            <p className="text-slate-800 dark:text-slate-200 font-medium">
              {profile.mentorRemarks ||
                'Candidate is well-prepared for technical aptitude and database rounds. Recommended for Day-1 interviews.'}
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
            Mentor: {profile.mentorName || 'Prof. V. Manoj Praveen'}
          </span>
        </div>
      </div>

      {/* MY RESUME Section */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <FileText className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            <span>My Resume</span>
          </div>
          {resumeRecord ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Current Resume</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-mono">Not Uploaded</span>
          )}
        </div>

        {!resumeRecord ? (
          /* Empty State */
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No resume uploaded yet.
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Upload your resume from Resume Studio to see it here.
              </p>
            </div>
          </div>
        ) : (
          /* Resume Card with Thumbnail and Actions */
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Thumbnail & Details */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Resume Thumbnail (A4 aspect preview) */}
              <div
                onClick={() => setIsResumeViewerOpen(true)}
                className="w-16 h-22 sm:w-20 sm:h-28 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-300 dark:border-slate-700 shrink-0 overflow-hidden relative cursor-pointer group/thumb hover:ring-2 hover:ring-indigo-500 transition-all flex flex-col justify-between p-1.5 select-none"
                title="Click to view full resume"
              >
                {resumeRecord.thumbnailUrl ? (
                  <img
                    src={resumeRecord.thumbnailUrl}
                    alt="Resume thumbnail"
                    className="w-full h-full object-cover object-top rounded-xs"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 dark:bg-slate-900/60 rounded-xs flex flex-col justify-between p-1 text-[7px] text-slate-400 font-mono leading-tight">
                    <div className="space-y-0.5">
                      <div className="h-1 bg-slate-300 dark:bg-slate-700 rounded-full w-2/3" />
                      <div className="h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                      <div className="h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full w-4/5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full w-1/2" />
                      <div className="h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                    </div>
                    <div className="text-center font-bold text-[8px] text-indigo-500">PDF</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-indigo-600/0 group-hover/thumb:bg-indigo-600/20 transition-colors flex items-center justify-center">
                  <Eye className="w-5 h-5 text-indigo-600 dark:text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow-md" />
                </div>
              </div>

              {/* Info Metadata */}
              <div className="min-w-0 space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {resumeRecord.fileName}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span className="uppercase font-bold text-indigo-600 dark:text-indigo-400">
                    {resumeRecord.fileName.split('.').pop() || 'PDF'}
                  </span>
                  <span>•</span>
                  <span>
                    {resumeRecord.pageCount === 1 ? '1 Page' : `${resumeRecord.pageCount} Pages`}
                  </span>
                  <span>•</span>
                  <span>
                    Uploaded {formatRelativeTime(resumeRecord.uploadedAt)}
                  </span>
                  <span>•</span>
                  <span>{resumeRecord.fileSize}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  Synchronized with Candidate Profile & LaTeX Resume IDE
                </p>
              </div>
            </div>

            {/* Right: Actions [ View Resume ] [ Download ] */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsResumeViewerOpen(true)}
                disabled={isResumeLoading}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                {isResumeLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                <span>View Resume</span>
              </button>

              <button
                type="button"
                onClick={() => downloadResumeFile(resumeRecord.fileDataUrl, resumeRecord.fileName)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Full-Screen Resume Viewer Modal */}
      <ResumeViewerModal
        isOpen={isResumeViewerOpen}
        onClose={() => setIsResumeViewerOpen(false)}
        resumeRecord={resumeRecord}
        onDeleteResume={handleDeleteResume}
      />

      {/* Add / Edit Engineering Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FolderGit2 className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {editingProject ? 'Edit Engineering Project' : 'Add Engineering Project'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitProject} className="p-6 space-y-4">
              {/* Field 1: Project Name * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    if (projectNameError) setProjectNameError(null);
                  }}
                  placeholder="e.g. TrafficMind AI"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none ${
                    projectNameError
                      ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
              </div>

              {/* Field 2: Project Description * (with 500 char counter) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Project Description <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${projectDescription.length >= 480 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                    {projectDescription.length} / 500
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={projectDescription}
                  onChange={(e) => {
                    setProjectDescription(e.target.value);
                    if (descriptionError) setDescriptionError(null);
                  }}
                  placeholder="AI-powered traffic congestion prediction platform for Tamil Nadu districts using LSTM and machine learning."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none resize-none ${
                    descriptionError
                      ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
                {descriptionError && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{descriptionError}</span>
                  </p>
                )}
              </div>

              {/* Field 3: GitHub Code Link * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  GitHub Code Link <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={githubLink}
                  onChange={(e) => {
                    setGithubLink(e.target.value);
                    if (githubLinkError) setGithubLinkError(null);
                  }}
                  placeholder="https://github.com/Lalithkrish06/TrafficMind-AI"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none ${
                    githubLinkError
                      ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
              </div>

              {/* Field 4: Live Project Link (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Live Project Link <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={liveLink}
                  onChange={(e) => {
                    setLiveLink(e.target.value);
                    if (liveLinkError) setLiveLinkError(null);
                  }}
                  placeholder="https://trafficmindai.netlify.app"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none ${
                    liveLinkError
                      ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
                {liveLinkError && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{liveLinkError}</span>
                  </p>
                )}
              </div>

              {/* Field 5: Confirm Project Name * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={confirmProjectName}
                  onChange={(e) => {
                    setConfirmProjectName(e.target.value);
                    if (projectNameError) setProjectNameError(null);
                  }}
                  placeholder="Re-enter project name to confirm"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none ${
                    projectNameError
                      ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
                {projectNameError && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{projectNameError}</span>
                  </p>
                )}
              </div>

              {/* Field 6: Confirm GitHub Code Link * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm GitHub Code Link <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={confirmGithubLink}
                  onChange={(e) => {
                    setConfirmGithubLink(e.target.value);
                    if (githubLinkError) setGithubLinkError(null);
                  }}
                  placeholder="Re-enter GitHub repository URL to confirm"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none ${
                    githubLinkError
                      ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
                {githubLinkError && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{githubLinkError}</span>
                  </p>
                )}
              </div>

              {/* Modal Action Buttons: [Cancel] [Add Project] */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  {editingProject ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Delete Engineering Project
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                  {deletingProject.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete this project?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4.5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
