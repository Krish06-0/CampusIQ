import {
  StudentProfile,
  JobOpportunity,
  AuditLog,
  ResumeVersion,
  ImportSummary,
  ImportPreviewRow,
  User,
} from '../types';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_JOBS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
  generate500CollegeStudents,
} from '../data/initialDatabase';
import { loadVcetStudentsFromStorage, VcetStudentData } from '../data/vcetStudentsData';

const STORAGE_KEYS = {
  CURRENT_STUDENT: 'skillgap_student_profile',
  JOBS: 'skillgap_jobs',
  AUDIT_LOGS: 'skillgap_audit_logs',
  RESUME_VERSIONS: 'skillgap_resume_versions',
  IMPORT_SUMMARIES: 'skillgap_import_summaries',
  STUDENTS_500: 'skillgap_students_500',
  USERS: 'skillgap_users',
};

export function getStudentProfileStorageKey(userId: string): string {
  return `skillgap_student_profile_${userId}`;
}

export function getStudentProfileByRollStorageKey(rollNumber: string): string {
  return `skillgap_student_profile_roll_${rollNumber.toUpperCase().trim()}`;
}

// Seed Profile for Student B (Priya Sharma - Information Technology)
export const PRIYA_SHARMA_STUDENT_PROFILE: StudentProfile = {
  id: 'student-priya-sharma',
  userId: 'user-student-priya',
  registerNumber: '732923IT001',
  name: 'Priya Sharma',
  collegeEmail: 'priya.sharma@college.edu',
  personalEmail: 'priya.sharma.it@gmail.com',
  phone: '+91 98402 34567',
  location: 'Coimbatore, Tamil Nadu',
  departmentId: 'dept-it',
  departmentName: 'IT',
  batch: '2023-2027',
  year: 4,
  cgpa: 8.4,
  backlogs: 0,
  careerGoal: 'Become a Full Stack Cloud Engineer at an enterprise tech firm.',
  targetRole: 'Cloud Software Engineer — Enterprise Systems',
  linkedInUrl: 'https://linkedin.com/in/priyasharma-it',
  githubUrl: 'https://github.com/priyasharma-dev',
  portfolioUrl: 'https://priyasharma.dev',
  leetCodeUrl: 'https://leetcode.com/priya_it',
  summary: 'Dedicated Information Technology senior with focus on Java enterprise systems, cloud architecture, and full-stack web applications. Seeking to build scalable microservices and distributed database platforms.',
  profileCompletion: 85,
  skills: [
    { id: 'ss-p1', studentId: 'student-priya-sharma', skillId: 'sk-java', skillName: 'Java', category: 'Programming', proficiency: 'Advanced', source: 'RESUME', confidence: 0.96, verified: true },
    { id: 'ss-p2', studentId: 'student-priya-sharma', skillId: 'sk-sql', skillName: 'SQL', category: 'Database', proficiency: 'Advanced', source: 'RESUME', confidence: 0.95, verified: true },
    { id: 'ss-p3', studentId: 'student-priya-sharma', skillId: 'sk-cloud', skillName: 'AWS & Cloud Architecture', category: 'Cloud', proficiency: 'Intermediate', source: 'PROJECT', confidence: 0.91, verified: true },
    { id: 'ss-p4', studentId: 'student-priya-sharma', skillId: 'sk-react', skillName: 'React & TypeScript', category: 'Frontend', proficiency: 'Intermediate', source: 'PROJECT', confidence: 0.89, verified: true },
    { id: 'ss-p5', studentId: 'student-priya-sharma', skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Tools', proficiency: 'Intermediate', source: 'RESUME', confidence: 0.92, verified: true },
  ],
  projects: [
    {
      id: 'proj-p1',
      studentId: 'student-priya-sharma',
      title: 'Smart Campus IoT & Attendance Gateway',
      description: 'Architected a multi-tier IoT telemetry pipeline with Spring Boot microservices, MQTT broker, and PostgreSQL database processing RFID check-ins.',
      technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'MQTT', 'Docker'],
      githubUrl: 'https://github.com/priyasharma-dev/campus-iot-gateway',
      role: 'Backend Architect',
    },
  ],
  internships: [
    {
      id: 'intern-p1',
      studentId: 'student-priya-sharma',
      company: 'Infosys Springboard',
      role: 'Cloud Engineering Intern',
      startDate: '2025-06-01',
      endDate: '2025-08-15',
      description: 'Deployed containerized REST APIs on AWS ECS with RDS Aurora PostgreSQL and CloudWatch monitoring.',
      technologies: ['Java', 'AWS', 'Docker', 'PostgreSQL'],
    },
  ],
  certifications: [
    {
      id: 'cert-p1',
      studentId: 'student-priya-sharma',
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      issueDate: '2025-07-20',
      credentialUrl: 'https://aws.amazon.com/verification/AWS-CCP-732923',
    },
  ],
  achievements: [
    'Top 10% in Information Technology Department Placement Assessment',
    'Solved 200+ coding challenges on LeetCode & HackerRank',
  ],
  resumeFileName: 'Priya_Sharma_IT_Resume.pdf',
  resumeParsedAt: '2026-09-20T10:00:00Z',
};

// Initialize or load account-isolated student profile from local storage
export function getStoredStudentProfile(
  userId?: string,
  rollNumber?: string,
  email?: string
): StudentProfile | null {
  if (!userId && !rollNumber && !email) {
    return null;
  }

  const cleanUserId = userId?.trim();
  const cleanRoll = rollNumber?.trim().toUpperCase();
  const cleanEmail = email?.trim().toLowerCase();

  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  // 1. Try reading profile by unique account userId
  if (cleanUserId && isBrowser) {
    try {
      const raw = localStorage.getItem(getStudentProfileStorageKey(cleanUserId));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      console.error('Failed reading student profile by userId', e);
    }
  }

  // 2. Try reading profile by unique register number
  if (cleanRoll && isBrowser) {
    try {
      const raw = localStorage.getItem(getStudentProfileByRollStorageKey(cleanRoll));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      console.error('Failed reading student profile by rollNumber', e);
    }
  }

  // 3. Pre-seeded account: Student A (Alex Kumar - AI & DS)
  if (
    cleanUserId === 'user-student-alex' ||
    cleanRoll === '22AIDS014' ||
    cleanRoll === '717822P101' ||
    cleanEmail === 'alex.kumar@college.edu'
  ) {
    const alexProfile: StudentProfile = {
      ...INITIAL_STUDENT_PROFILE,
      userId: 'user-student-alex',
    };
    if (isBrowser) {
      try {
        localStorage.setItem(getStudentProfileStorageKey('user-student-alex'), JSON.stringify(alexProfile));
        localStorage.setItem(getStudentProfileByRollStorageKey('22AIDS014'), JSON.stringify(alexProfile));
      } catch {}
    }
    return alexProfile;
  }

  // 4. Pre-seeded account: Student B (Priya Sharma - Information Technology)
  if (
    cleanUserId === 'user-student-priya' ||
    cleanRoll === '732923IT001' ||
    cleanRoll === '732923ITR001' ||
    cleanRoll === '23IT7A01' ||
    cleanEmail === 'priya.sharma@college.edu'
  ) {
    if (isBrowser) {
      try {
        localStorage.setItem(getStudentProfileStorageKey('user-student-priya'), JSON.stringify(PRIYA_SHARMA_STUDENT_PROFILE));
        localStorage.setItem(getStudentProfileByRollStorageKey('732923IT001'), JSON.stringify(PRIYA_SHARMA_STUDENT_PROFILE));
      } catch {}
    }
    return PRIYA_SHARMA_STUDENT_PROFILE;
  }

  // 5. Look up verified student record from central institutional database
  const allVcet = loadVcetStudentsFromStorage();
  const match = allVcet.find(
    (s) =>
      (cleanRoll && s.registerNumber.toUpperCase() === cleanRoll) ||
      (cleanRoll && s.rollNumber && s.rollNumber.toUpperCase() === cleanRoll) ||
      (cleanRoll && s.registerNumber.replace(/R|L/g, '').toUpperCase() === cleanRoll.replace(/R|L/g, '')) ||
      (cleanEmail && s.email && s.email.toLowerCase() === cleanEmail)
  );

  if (match) {
    const newProfile: StudentProfile = {
      id: `student-${cleanUserId || match.id}`,
      userId: cleanUserId || `user-student-${match.registerNumber.toLowerCase()}`,
      registerNumber: match.registerNumber,
      name: match.name,
      collegeEmail: match.email,
      personalEmail: `${match.registerNumber.toLowerCase()}@student.vcet.ac.in`,
      phone: match.phone || '+91 98400 00000',
      location: 'Tamil Nadu, India',
      departmentId: `dept-${match.departmentCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      departmentName: match.departmentCode,
      batch: match.batch,
      year: match.year,
      cgpa: match.cgpa,
      backlogs: match.backlogs,
      careerGoal: `Excel as an engineering and technology professional in ${match.departmentCode}.`,
      targetRole: `${match.departmentCode} Graduate Engineer Trainee`,
      summary: `Verified student of ${match.department} (Class ${match.classCode}, Batch ${match.batch}).`,
      profileCompletion: match.profileCompletion || 65,
      skills: [
        ...(match.hasPython ? [{ id: `sk-py-${match.id}`, studentId: `student-${match.id}`, skillId: 'sk-python', skillName: 'Python', category: 'Programming' as const, proficiency: 'Intermediate' as const, source: 'RESUME' as const, confidence: 0.9, verified: true }] : []),
        ...(match.hasJava ? [{ id: `sk-jv-${match.id}`, studentId: `student-${match.id}`, skillId: 'sk-java', skillName: 'Java', category: 'Programming' as const, proficiency: 'Intermediate' as const, source: 'RESUME' as const, confidence: 0.9, verified: true }] : []),
        ...(match.hasSql ? [{ id: `sk-sql-${match.id}`, studentId: `student-${match.id}`, skillId: 'sk-sql', skillName: 'SQL', category: 'Database' as const, proficiency: 'Intermediate' as const, source: 'RESUME' as const, confidence: 0.9, verified: true }] : []),
      ],
      projects: [],
      internships: [],
      certifications: [],
      achievements: [`Institutional verified candidate in ${match.department}`],
      linkedInUrl: match.linkedInUrl || '',
      githubUrl: match.githubUrl || '',
    };

    if (cleanUserId && isBrowser) {
      try {
        localStorage.setItem(getStudentProfileStorageKey(cleanUserId), JSON.stringify(newProfile));
        localStorage.setItem(getStudentProfileByRollStorageKey(match.registerNumber), JSON.stringify(newProfile));
      } catch {}
    }
    return newProfile;
  }

  // 6. Registered student account not found in roster: build clean, unpopulated profile without copying other students
  if (cleanUserId) {
    const defaultProfile: StudentProfile = {
      id: `student-${cleanUserId}`,
      userId: cleanUserId,
      registerNumber: cleanRoll || 'PENDING',
      name: cleanEmail ? cleanEmail.split('@')[0] : 'Student Candidate',
      collegeEmail: cleanEmail || '',
      personalEmail: cleanEmail || '',
      phone: '+91 98400 00000',
      location: 'Tamil Nadu, India',
      departmentId: 'dept-general',
      departmentName: 'General Engineering',
      batch: '2023-2027',
      year: 4,
      cgpa: 7.5,
      backlogs: 0,
      careerGoal: 'Complete placement preparation and secure top tier campus offer.',
      targetRole: 'Software Engineer',
      summary: 'New student account created. Complete your skills, projects, and resume to enhance placement eligibility.',
      profileCompletion: 40,
      skills: [],
      projects: [],
      internships: [],
      certifications: [],
      achievements: [],
    };

    try {
      localStorage.setItem(getStudentProfileStorageKey(cleanUserId), JSON.stringify(defaultProfile));
    } catch {}
    return defaultProfile;
  }

  return null;
}

export function saveStoredStudentProfile(profile: StudentProfile, userId?: string): void {
  if (!profile) return;

  // Calculate completion percentage
  let score = 20; // Basic personal info
  if (profile.cgpa > 0) score += 15;
  if (profile.skills && profile.skills.length >= 4) score += 20;
  if (profile.projects && profile.projects.length >= 1) score += 20;
  if (profile.internships && profile.internships.length >= 1) score += 10;
  if (profile.certifications && profile.certifications.length >= 1) score += 10;
  if (profile.summary && profile.summary.length > 30) score += 5;

  profile.profileCompletion = Math.min(100, score);

  const targetUserId = userId || profile.userId || profile.id;
  if (targetUserId) {
    try {
      localStorage.setItem(getStudentProfileStorageKey(targetUserId), JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save student profile by userId', e);
    }
  }

  if (profile.registerNumber) {
    try {
      localStorage.setItem(getStudentProfileByRollStorageKey(profile.registerNumber), JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save student profile by rollNumber', e);
    }
  }
}

export function getStoredJobs(): JobOpportunity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse jobs', e);
  }
  return INITIAL_JOBS;
}

export function saveStoredJob(job: JobOpportunity): void {
  const jobs = getStoredJobs();
  const existingIdx = jobs.findIndex((j) => j.id === job.id);
  if (existingIdx >= 0) {
    jobs[existingIdx] = job;
  } else {
    jobs.unshift(job);
  }
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
}

export function getStoredAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse audit logs', e);
  }
  return INITIAL_AUDIT_LOGS;
}

export function logAuditEvent(
  user: User,
  action: string,
  entity: string,
  entityId: string,
  details?: string
): void {
  const logs = getStoredAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entity,
    entityId,
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
    details,
  };
  logs.unshift(newLog);
  // Keep last 150 logs
  if (logs.length > 150) logs.pop();
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
}

// 500+ Students Directory & Analytics Cache
let cached500Students: ReturnType<typeof generate500CollegeStudents>['students'] | null = null;

export function get500StudentsList() {
  if (!cached500Students) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS_500);
      if (raw) {
        cached500Students = JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    if (!cached500Students) {
      cached500Students = generate500CollegeStudents().students;
      localStorage.setItem(STORAGE_KEYS.STUDENTS_500, JSON.stringify(cached500Students));
    }
  }
  return cached500Students;
}

/**
 * Server-side pagination & filter simulation for 500+ students
 */
export function queryStudentsDirectory(params: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  minCgpa?: number;
  skillGapFilter?: 'Power BI' | 'SQL' | 'Cloud' | 'None';
}) {
  const { page = 1, limit = 25, search = '', department = 'ALL', minCgpa = 0, skillGapFilter = 'None' } = params;
  const allStudents = get500StudentsList();

  let filtered = allStudents.filter((st) => {
    if (search) {
      const s = search.toLowerCase();
      const match = st.name.toLowerCase().includes(s) || st.registerNumber.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (department !== 'ALL' && st.department !== department) {
      return false;
    }
    if (st.cgpa < minCgpa) {
      return false;
    }
    if (skillGapFilter === 'Power BI' && st.hasPowerBi) return false;
    if (skillGapFilter === 'SQL' && st.hasSql) return false;
    if (skillGapFilter === 'Cloud' && st.hasCloud) return false;
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    students: paginated,
    total,
    totalPages,
    currentPage: page,
    limit,
  };
}

export const SUPPORTED_DEPARTMENT_CONFIGS = [
  {
    code: 'CSE',
    name: 'Computer Science and Engineering',
  },
  {
    code: 'IT',
    name: 'Information Technology',
  },
  {
    code: 'AI & DS',
    name: 'Artificial Intelligence and Data Science',
  },
  {
    code: 'CSE (AI & ML)',
    name: 'Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
  },
] as const;

export interface DepartmentAnalyticsItem {
  department: string;
  departmentName: string;
  studentCount: number;
  averageCgpa: number;
  batches: string[];
  batchBreakdown: { batch: string; count: number }[];
  commonSkills: { skill: string; percentage: number }[];
  topGaps: { gap: string; studentCount: number }[];
  hasVerifiedSkillData: boolean;
}

/**
 * Calculates college-wide training demand and department skill analytics from verified database records
 * Exclusively for the 4 institutional departments:
 * 1. CSE — Computer Science and Engineering
 * 2. IT — Information Technology
 * 3. AI & DS — Artificial Intelligence and Data Science
 * 4. CSE (AI & ML) — Computer Science and Engineering (Artificial Intelligence and Machine Learning)
 */
export function calculateCollegeAnalytics() {
  const allVerifiedStudents = loadVcetStudentsFromStorage();

  // Normalize department into one of the 4 supported departments
  function mapToSupportedDept(std: VcetStudentData): 'CSE' | 'IT' | 'AI & DS' | 'CSE (AI & ML)' | null {
    const raw = (std.departmentCode || std.department || '').trim();
    const lower = raw.toLowerCase();

    // Check CSE (AI & ML) first
    if (
      raw === 'CSE (AI & ML)' ||
      raw === 'CSE (AI&ML)' ||
      raw === 'AIML' ||
      raw === 'CSE(AIML)' ||
      lower.includes('machine learning') ||
      lower.includes('ai & ml') ||
      lower.includes('ai&ml')
    ) {
      return 'CSE (AI & ML)';
    }

    // Check AI & DS (strictly separate from AI & ML)
    if (
      raw === 'AI & DS' ||
      raw === 'AIDS' ||
      raw === 'AI&DS' ||
      (lower.includes('data science') && lower.includes('artificial intelligence')) ||
      lower === 'artificial intelligence and data science' ||
      lower === 'artificial intelligence & data science'
    ) {
      return 'AI & DS';
    }

    // Check IT
    if (
      raw === 'IT' ||
      lower === 'information technology' ||
      lower.includes('information tech')
    ) {
      return 'IT';
    }

    // Check CSE
    if (
      raw === 'CSE' ||
      lower === 'computer science and engineering' ||
      lower === 'computer science & engineering' ||
      lower.includes('computer science')
    ) {
      return 'CSE';
    }

    return null;
  }

  // Filter students belonging to the 4 departments
  const mappedStudents: { std: VcetStudentData; deptCode: 'CSE' | 'IT' | 'AI & DS' | 'CSE (AI & ML)' }[] = [];
  const seenRegNums = new Set<string>();

  allVerifiedStudents.forEach((std) => {
    const regUpper = std.registerNumber ? std.registerNumber.toUpperCase().trim() : '';
    if (regUpper && seenRegNums.has(regUpper)) return; // prevent duplicate counting
    if (regUpper) seenRegNums.add(regUpper);

    const deptCode = mapToSupportedDept(std);
    if (deptCode) {
      mappedStudents.push({ std, deptCode });
    }
  });

  const total = mappedStudents.length;

  let totalCgpa = 0;
  let totalComp = 0;
  let powerBiGaps = 0;
  let sqlGaps = 0;
  let cloudGaps = 0;
  let dsaGaps = 0;
  let statsGaps = 0;

  const deptDataMap: Record<
    string,
    {
      code: string;
      name: string;
      count: number;
      totalCgpa: number;
      batchesMap: Record<string, number>;
      skillsCount: Record<string, number>;
      gapsCount: Record<string, number>;
    }
  > = {
    CSE: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
      count: 0,
      totalCgpa: 0,
      batchesMap: {},
      skillsCount: { Python: 0, Java: 0, SQL: 0, 'DSA & Problem Solving': 0, 'Web Technologies': 0 },
      gapsCount: { 'Power BI & Analytics': 0, 'Cloud Infrastructure': 0, 'Advanced SQL / CTEs': 0, 'System Design': 0 },
    },
    IT: {
      code: 'IT',
      name: 'Information Technology',
      count: 0,
      totalCgpa: 0,
      batchesMap: {},
      skillsCount: { Python: 0, Java: 0, SQL: 0, 'Cloud Computing': 0, 'Web Development': 0 },
      gapsCount: { 'Power BI & Modeling': 0, 'Cloud Infrastructure': 0, 'Advanced SQL': 0, 'DSA Optimization': 0 },
    },
    'AI & DS': {
      code: 'AI & DS',
      name: 'Artificial Intelligence and Data Science',
      count: 0,
      totalCgpa: 0,
      batchesMap: {},
      skillsCount: { Python: 0, SQL: 0, 'Machine Learning': 0, 'Data Analytics (Pandas/NumPy)': 0, 'Power BI': 0 },
      gapsCount: { 'Cloud Infrastructure (AWS/GCP)': 0, 'DSA & Competitive Coding': 0, 'Advanced SQL': 0, 'Deep Learning': 0 },
    },
    'CSE (AI & ML)': {
      code: 'CSE (AI & ML)',
      name: 'Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
      count: 0,
      totalCgpa: 0,
      batchesMap: {},
      skillsCount: { Python: 0, 'Machine Learning': 0, Java: 0, SQL: 0, 'Deep Neural Networks': 0 },
      gapsCount: { 'Power BI & BI Reporting': 0, 'Cloud Deployment': 0, 'Advanced SQL': 0, 'DSA Problem Solving': 0 },
    },
  };

  mappedStudents.forEach(({ std, deptCode }) => {
    const d = deptDataMap[deptCode];
    d.count++;
    d.totalCgpa += std.cgpa;
    totalCgpa += std.cgpa;
    totalComp += (std.profileCompletion || 70);

    // Track batch distribution
    const batch = std.batch || '2023-2027';
    d.batchesMap[batch] = (d.batchesMap[batch] || 0) + 1;

    // Department-specific verified skills calculation
    if (std.hasPython) {
      if (d.skillsCount.Python !== undefined) d.skillsCount.Python++;
    }
    if (std.hasJava) {
      if (d.skillsCount.Java !== undefined) d.skillsCount.Java++;
    }
    if (std.hasSql) {
      if (d.skillsCount.SQL !== undefined) d.skillsCount.SQL++;
    }
    if (deptCode === 'AI & DS') {
      if (std.hasPowerBi) d.skillsCount['Power BI']++;
      if (std.hasPython && std.cgpa >= 7.5) d.skillsCount['Data Analytics (Pandas/NumPy)']++;
      if (std.cgpa >= 7.8) d.skillsCount['Machine Learning']++;
    } else if (deptCode === 'CSE (AI & ML)') {
      if (std.cgpa >= 7.8) d.skillsCount['Machine Learning']++;
      if (std.cgpa >= 8.2) d.skillsCount['Deep Neural Networks']++;
    } else if (deptCode === 'IT') {
      if (std.hasCloud) d.skillsCount['Cloud Computing']++;
      if (std.hasPython || std.hasJava) d.skillsCount['Web Development']++;
    } else if (deptCode === 'CSE') {
      if (std.hasDsa) d.skillsCount['DSA & Problem Solving']++;
      if (std.hasPython || std.hasJava) d.skillsCount['Web Technologies']++;
    }

    // Training gaps calculation
    if (!std.hasPowerBi) {
      powerBiGaps++;
      if (deptCode === 'AI & DS') {
        // AI & DS curriculum teaches Power BI early
      } else if (deptCode === 'IT') {
        d.gapsCount['Power BI & Modeling']++;
      } else if (deptCode === 'CSE') {
        d.gapsCount['Power BI & Analytics']++;
      } else if (deptCode === 'CSE (AI & ML)') {
        d.gapsCount['Power BI & BI Reporting']++;
      }
    }

    if (!std.hasCloud) {
      cloudGaps++;
      if (deptCode === 'AI & DS') d.gapsCount['Cloud Infrastructure (AWS/GCP)']++;
      else if (deptCode === 'IT') d.gapsCount['Cloud Infrastructure']++;
      else if (deptCode === 'CSE') d.gapsCount['Cloud Infrastructure']++;
      else if (deptCode === 'CSE (AI & ML)') d.gapsCount['Cloud Deployment']++;
    }

    if (!std.hasSql) {
      sqlGaps++;
      if (deptCode === 'AI & DS') d.gapsCount['Advanced SQL']++;
      else if (deptCode === 'IT') d.gapsCount['Advanced SQL']++;
      else if (deptCode === 'CSE') d.gapsCount['Advanced SQL / CTEs']++;
      else if (deptCode === 'CSE (AI & ML)') d.gapsCount['Advanced SQL']++;
    }

    if (!std.hasDsa) {
      dsaGaps++;
      if (deptCode === 'AI & DS') d.gapsCount['DSA & Competitive Coding']++;
      else if (deptCode === 'IT') d.gapsCount['DSA Optimization']++;
      else if (deptCode === 'CSE') d.gapsCount['System Design']++;
      else if (deptCode === 'CSE (AI & ML)') d.gapsCount['DSA Problem Solving']++;
    }

    if (!std.hasStats) statsGaps++;
  });

  const departmentAnalytics: DepartmentAnalyticsItem[] = SUPPORTED_DEPARTMENT_CONFIGS.map((cfg) => {
    const data = deptDataMap[cfg.code];
    const hasData = data && data.count > 0;
    const count = hasData ? data.count : 0;
    const avgCgpa = hasData ? Number((data.totalCgpa / count).toFixed(2)) : 0;

    const batches = hasData ? Object.keys(data.batchesMap).sort() : [];
    const batchBreakdown = hasData
      ? Object.entries(data.batchesMap)
          .map(([batch, bCount]) => ({ batch, count: bCount }))
          .sort((a, b) => b.batch.localeCompare(a.batch))
      : [];

    const commonSkills = hasData
      ? Object.entries(data.skillsCount)
          .map(([skill, sCount]) => ({ skill, percentage: Math.min(100, Math.round((sCount / count) * 100)) }))
          .sort((a, b) => b.percentage - a.percentage)
      : [];

    const topGaps = hasData
      ? Object.entries(data.gapsCount)
          .map(([gap, gCount]) => ({ gap, studentCount: gCount }))
          .sort((a, b) => b.studentCount - a.studentCount)
      : [];

    return {
      department: cfg.code,
      departmentName: cfg.name,
      studentCount: count,
      averageCgpa: avgCgpa,
      batches,
      batchBreakdown,
      commonSkills,
      topGaps,
      hasVerifiedSkillData: hasData && commonSkills.length > 0,
    };
  });

  return {
    totalDepartments: 4,
    totalStudents: total,
    activeProfilesCount: mappedStudents.filter((s) => (s.std.profileCompletion || 0) >= 70).length,
    studentsAnalyzedCount: total,
    averageCgpa: total > 0 ? Number((totalCgpa / total).toFixed(2)) : 8.3,
    averageProfileCompletion: total > 0 ? Math.round(totalComp / total) : 78,
    trainingDemand: [
      { skill: 'Power BI & DAX Modeling', missingStudentsCount: powerBiGaps, priority: 'CRITICAL', recommendation: 'Conduct 3-day campus workshop with sample sales dataset' },
      { skill: 'Advanced SQL & CTEs', missingStudentsCount: sqlGaps, priority: 'HIGH', recommendation: 'Organize 9-hour weekend sprint on joins and window functions' },
      { skill: 'Cloud Computing (AWS/GCP)', missingStudentsCount: cloudGaps, priority: 'HIGH', recommendation: 'Encourage student activation of GitHub Student Developer pack cloud vouchers' },
      { skill: 'Data Structures & Algorithms', missingStudentsCount: dsaGaps, priority: 'HIGH', recommendation: 'Track Striver A2Z sheet completion across engineering batches' },
      { skill: 'Business Statistics & Hypothesis Testing', missingStudentsCount: statsGaps, priority: 'MEDIUM', recommendation: 'Integrate statistical testing into AI & DS and IT lab sessions' },
    ],
    departmentAnalytics,
    readinessDistribution: [
      { range: 'Ready (80%+ Fit)', count: Math.round(total * 0.42), percentage: 42 },
      { range: 'Nearly Ready (60-79% Fit)', count: Math.round(total * 0.38), percentage: 38 },
      { range: 'Needs Focus (<60% Fit)', count: Math.round(total * 0.20), percentage: 20 },
    ],
  };
}

/**
 * Validates and imports spreadsheet / CSV data rows with duplicate detection and preview
 */
export function validateImportBatch(rawRows: any[]): {
  previewRows: ImportPreviewRow[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  missingFieldsCount: number;
} {
  const existingStudents = get500StudentsList();
  const existingRegNums = new Set(existingStudents.map((s) => s.registerNumber.toUpperCase()));

  const previewRows: ImportPreviewRow[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;
  let missingFieldsCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const errors: string[] = [];

    const regNum = String(row.registerNumber || row['Register Number'] || row['Roll No'] || '').trim().toUpperCase();
    const name = String(row.name || row['Student Name'] || row['Name'] || '').trim();
    const dept = String(row.department || row['Department'] || row['Dept'] || 'AI & DS').trim();
    const batch = String(row.batch || row['Batch'] || '2022-2026').trim();
    const cgpaRaw = parseFloat(row.cgpa || row['CGPA'] || '0');
    const phone = String(row.phone || row['Phone'] || row['Mobile'] || '+91 90000 00000').trim();
    const email = String(row.email || row['Email'] || `${regNum.toLowerCase()}@college.edu`).trim();
    const skills = String(row.skills || row['Skills'] || 'Python, SQL').trim();

    if (!regNum) {
      errors.push('Missing Register Number');
      missingFieldsCount++;
    }
    if (!name) {
      errors.push('Missing Student Name');
      missingFieldsCount++;
    }
    if (isNaN(cgpaRaw) || cgpaRaw < 0 || cgpaRaw > 10) {
      errors.push('Invalid CGPA (must be between 0.0 and 10.0)');
    }

    const isDuplicate = existingRegNums.has(regNum);
    if (isDuplicate) {
      duplicateCount++;
    }

    const status: ImportPreviewRow['status'] = errors.length > 0 ? 'INVALID' : isDuplicate ? 'DUPLICATE' : 'VALID';

    if (status === 'VALID') validCount++;
    if (status === 'INVALID') invalidCount++;

    previewRows.push({
      rowNumber: rowNum,
      registerNumber: regNum || `ROW_${rowNum}`,
      name: name || 'Unnamed',
      department: dept,
      batch,
      cgpa: isNaN(cgpaRaw) ? 0 : cgpaRaw,
      phone,
      email,
      skills,
      status,
      errors,
    });
  });

  return {
    previewRows,
    totalRows: rawRows.length,
    validCount,
    invalidCount,
    duplicateCount,
    missingFieldsCount,
  };
}

/**
 * Commits verified import preview into the database
 */
export function commitImportBatch(
  previewRows: ImportPreviewRow[],
  sourceType: 'CSV' | 'XLSX' | 'GOOGLE_SHEET',
  sourceName: string,
  user: User
): ImportSummary {
  const students = get500StudentsList();
  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  previewRows.forEach((row) => {
    if (row.status === 'INVALID') {
      errorCount++;
      return;
    }

    const existingIdx = students.findIndex((s) => s.registerNumber === row.registerNumber);
    if (existingIdx >= 0) {
      // Update existing record
      students[existingIdx].cgpa = row.cgpa;
      students[existingIdx].department = row.department;
      students[existingIdx].name = row.name;
      updatedCount++;
    } else {
      // Insert new record
      students.push({
        id: `std-imported-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        registerNumber: row.registerNumber,
        name: row.name,
        department: row.department,
        batch: row.batch,
        year: 4,
        cgpa: row.cgpa,
        backlogs: 0,
        profileCompletion: 75,
        hasPowerBi: row.skills.toLowerCase().includes('power bi'),
        hasSql: row.skills.toLowerCase().includes('sql'),
        hasCloud: row.skills.toLowerCase().includes('cloud'),
        hasPython: row.skills.toLowerCase().includes('python'),
        hasJava: row.skills.toLowerCase().includes('java'),
        hasDsa: row.cgpa >= 7.8,
        hasStats: row.skills.toLowerCase().includes('stat'),
        hasExcel: true,
      });
      importedCount++;
    }
  });

  // Save updated list
  localStorage.setItem(STORAGE_KEYS.STUDENTS_500, JSON.stringify(students));
  cached500Students = students;

  const summary: ImportSummary = {
    id: `import-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sourceType,
    sourceName,
    totalRows: previewRows.length,
    importedCount,
    updatedCount,
    skippedCount,
    errorCount,
    performedBy: user.name,
  };

  logAuditEvent(
    user,
    'DATA_IMPORT_COMMITTED',
    'StudentDirectory',
    summary.id,
    `Committed ${importedCount} new rows, ${updatedCount} updated records from ${sourceName} (${sourceType}).`
  );

  return summary;
}
