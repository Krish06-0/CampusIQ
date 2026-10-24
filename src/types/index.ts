export type UserRole =
  | 'STUDENT'
  | 'STAFF'
  | 'PLACEMENT_OFFICER'
  | 'PLACEMENT_ADMIN'
  | 'DEAN'
  | 'SUPER_ADMIN'
  | 'SYSTEM_ADMIN';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'INVITATION_PENDING' | 'VERIFICATION_PENDING';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  designation?: string;
  department?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'INVITATION_PENDING' | 'VERIFICATION_PENDING';
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  totalStudents: number;
}

export interface SkillItem {
  id: string;
  name: string;
  normalizedName: string;
  category: 'Programming' | 'Database' | 'Data Science' | 'AI/ML' | 'Web Development' | 'Cloud' | 'DevOps' | 'Tools' | 'Soft Skills' | 'Core CS';
  aliases: string[];
}

export interface StudentSkill {
  id: string;
  studentId: string;
  skillId: string;
  skillName: string;
  category: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  source: 'RESUME' | 'MANUAL' | 'PROJECT' | 'CERTIFICATION';
  confidence: number;
  verified: boolean;
}

export interface StudentProject {
  id: string;
  studentId: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  role?: string;
}

export interface StudentInternship {
  id: string;
  studentId: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

export interface StudentCertification {
  id: string;
  studentId: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  registerNumber: string;
  name: string;
  collegeEmail: string;
  personalEmail: string;
  phone: string;
  location: string;
  departmentId: string;
  departmentName: string;
  batch: string; // e.g. "2022-2026"
  year: number; // 1, 2, 3, 4
  cgpa: number;
  backlogs: number;
  careerGoal: string;
  targetRole: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  leetCodeUrl?: string;
  summary?: string;
  profileCompletion: number;
  skills: StudentSkill[];
  projects: StudentProject[];
  internships: StudentInternship[];
  certifications: StudentCertification[];
  achievements: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  resumeParsedAt?: string;
  resumePageCount?: number;
  resumeFileSize?: string;
  resumeFileType?: string;
  classCode?: string; // e.g. "24AD5A", "24AD5B", "23AD07", "25AD3A", "25AD3B"
  academicYear?: string; // e.g. "2025-2026"
  semester?: number; // 1 to 8
  mentorName?: string;
  mentorRemarks?: string;
  endorsementStatus?: 'PENDING' | 'ENDORSED' | 'REVIEW_REQUESTED';
  placementEligible?: boolean;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  logo: string;
  description: string;
  tier: 'TIER_1_PRODUCT' | 'TIER_2_HYBRID' | 'TIER_3_SERVICE';
}

export interface JobRequirement {
  id: string;
  skillName: string;
  normalizedName: string;
  category: string;
  importance: 'REQUIRED' | 'PREFERRED' | 'NICE_TO_HAVE';
  minimumProficiency: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface EligibilityRules {
  minimumCgpa: number;
  allowedDepartments: string[];
  allowedBatches: string[];
  backlogsAllowed: number;
  graduationYear: number;
}

export interface JobOpportunity {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  description: string;
  location: string;
  employmentType: 'Full-Time' | 'Internship + PPO' | 'Apprenticeship';
  salaryPackage: string; // e.g., "8.5 - 12 LPA" or "4.5 LPA"
  isProductBased: boolean;
  applicationDeadline: string;
  applicationUrl: string;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
  requirements: JobRequirement[];
  eligibility: EligibilityRules;
}

export type GapStatus = 'MATCHED' | 'PARTIAL' | 'MISSING';
export type GapPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SkillGapItem {
  skillName: string;
  category: string;
  importance: 'REQUIRED' | 'PREFERRED' | 'NICE_TO_HAVE';
  studentLevel: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
  requiredLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  similarity: number; // 0 to 1.0
  status: GapStatus;
  priority: GapPriority;
  explanation: string;
  recommendedAction: string;
}

export interface MatchScoreBreakdown {
  overallScore: number; // 0 - 100
  skillCoverageScore: number; // 40% weight
  importanceWeightScore: number; // 30% weight
  proficiencyAlignmentScore: number; // 20% weight
  semanticSimilarityScore: number; // 10% weight
  matchedCount: number;
  partialCount: number;
  missingCount: number;
  totalRequired: number;
  explanation: string;
}

export interface EligibilityEvaluation {
  isEligible: boolean;
  criteria: {
    cgpa: { required: number; actual: number; passed: boolean; reason: string };
    department: { allowed: string[]; actual: string; passed: boolean; reason: string };
    batch: { allowed: string[]; actual: string; passed: boolean; reason: string };
    backlogs: { allowed: number; actual: number; passed: boolean; reason: string };
  };
  summary: string;
}

export interface SkillAnalysisResult {
  id: string;
  studentId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  createdAt: string;
  eligibility: EligibilityEvaluation;
  matchScore: MatchScoreBreakdown;
  gaps: SkillGapItem[];
  radarCategories: {
    category: string;
    studentScore: number;
    requiredScore: number;
  }[];
}

export interface RoadmapWeeklyItem {
  id: string;
  week: number;
  phase: string;
  title: string;
  skillName: string;
  priority: GapPriority;
  objective: string;
  estimatedHours: number;
  completed: boolean;
  practiceTasks: string[];
  recommendedProjectIdea?: string;
  resources: {
    title: string;
    type: 'Course' | 'Tutorial' | 'Practice' | 'Video' | 'Documentation' | 'Sheet' | 'Article';
    provider: string;
    url: string;
    language?: 'English' | 'Tamil' | 'Universal';
  }[];
}

export interface ProjectRecommendation {
  id: string;
  number: number; // from the 34 build-your-own-x
  title: string;
  category: 'Web Development & Networking' | 'Systems Programming & OS Concept' | 'Artificial Intelligence & Machine Learning' | 'Data Engineering & Analytics' | 'IoT & Robotics';
  suggestedStack: string;
  skillsAddressed: string[];
  relevanceReason: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  githubReference?: string;
}

export interface LearningResource {
  id: string;
  skillName: string;
  title: string;
  provider: string;
  type: 'Course' | 'Tutorial' | 'Practice' | 'Documentation' | 'Certification';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  url: string;
  language?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  details?: string;
}

export interface ResumeVersion {
  id: string;
  studentId: string;
  title: string;
  targetRole: string;
  templateId: 'ats-classic' | 'modern-professional' | 'technical' | 'minimal' | 'academic';
  latexSource: string;
  onePageMode: boolean;
  atsScoreEstimate: number;
  createdAt: string;
  updatedAt: string;
  sectionsOrder: string[];
}

export interface ImportPreviewRow {
  rowNumber: number;
  registerNumber: string;
  name: string;
  department: string;
  batch: string;
  cgpa: number;
  phone: string;
  email: string;
  skills: string;
  status: 'VALID' | 'INVALID' | 'DUPLICATE';
  errors: string[];
}

export interface ImportSummary {
  id: string;
  timestamp: string;
  sourceType: 'CSV' | 'XLSX' | 'GOOGLE_SHEET';
  sourceName: string;
  totalRows: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  performedBy: string;
}

export type DriveStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type WorkMode = 'On-site' | 'Remote' | 'Hybrid';
export type EmploymentType = 'Full-Time' | 'Internship + PPO' | 'Apprenticeship';

export interface PlacementDrive {
  id: string;
  companyName: string;
  companyLogo: string;
  jobRole: string;
  description: string;
  minCTC?: number;
  maxCTC?: number;
  salaryPackage: string; // e.g. "₹8.5 – ₹10 LPA"
  location: string;
  workMode: WorkMode;
  jobType: EmploymentType;
  deadline: string; // YYYY-MM-DD or display string
  applicationUrl?: string;
  minimumCGPA?: number;
  allowedDepartments: string[];
  allowedBatches: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  selectionProcess: string[];
  roundsCount?: number;
  responsibilities?: string[];
  contactInfo?: string;
  additionalInstructions?: string;
  status: DriveStatus;
  isProductBased?: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
}

export interface GoogleSheetSyncMetadata {
  sheetUrl: string;
  lastSyncedAt: string;
  source: string;
  totalCompanies: number;
  status: 'SUCCESS' | 'CACHED' | 'ERROR';
  warningMessage?: string;
}

export type ApplicationStatus = 'Applied' | 'Application Submitted' | 'Shortlisted' | 'Selected' | 'Rejected';

export interface DriveApplication {
  id: string;
  driveId: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  studentEmail: string;
  studentDepartment: string;
  studentCgpa: number;
  appliedAt: string;
  status: ApplicationStatus;
  notes?: string;
}

export interface DriveEligibilityResult {
  isEligible: boolean;
  cgpaPassed: boolean;
  deptPassed: boolean;
  batchPassed: boolean;
  skillsPassed: boolean;
  missingSkills: string[];
  reasons: string[];
  summary: string;
}

export type AuthEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'ACCOUNT_ACTIVATED'
  | 'ACCOUNT_DEACTIVATED';

export type AuthOutcome = 'SUCCESS' | 'FAILURE';

export type AuthMethodType =
  | 'Email/Password'
  | 'Register Number/Password'
  | 'Google OAuth'
  | 'Institutional SSO';

export interface AuthAuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  email?: string;
  registerNumber?: string;
  role: UserRole;
  department?: string;
  batch?: string;
  classCode?: string;
  eventType: AuthEventType;
  status: AuthOutcome;
  authMethod: AuthMethodType;
  failureReason?: string;
  sessionId?: string;
  logoutTimestamp?: string;
  sessionStatus?: 'ACTIVE' | 'LOGGED_OUT' | 'EXPIRED';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export interface AuthAuditMetrics {
  totalLogins: number;
  uniqueAccounts: number;
  loginsToday: number;
  failedAttempts: number;
  recentActivityCount: number;
  lastLoginMap: Record<string, string>;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
}

export interface AuthAuditFilter {
  dateRange?: 'today' | '7days' | '30days' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  role?: string;
  department?: string;
  batch?: string;
  status?: 'ALL' | 'SUCCESS' | 'FAILURE';
  search?: string;
  page?: number;
  limit?: number;
}


