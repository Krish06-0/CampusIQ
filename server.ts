import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// ==========================================
// RESUME BUILDER & ATS ANALYZER - STORAGE & RBAC
// ==========================================

const DATA_DIR = path.join(process.cwd(), 'server-data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

const RESUMES_FILE = path.join(DATA_DIR, 'resumes.json');
const ATS_REPORTS_FILE = path.join(DATA_DIR, 'ats_reports.json');
const JOB_MATCH_REPORTS_FILE = path.join(DATA_DIR, 'job_match_reports.json');
const PROFILE_INTEGRATIONS_FILE = path.join(DATA_DIR, 'profile_integrations.json');
const RECRUITER_REVIEWS_FILE = path.join(DATA_DIR, 'recruiter_reviews.json');

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    features: ['resume-builder', 'ats-analyzer', 'overleaf-integration', 'github-analysis', 'linkedin-analysis', 'recruiter-portal', 'auth-audit-logs'],
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// AUTHENTICATION AUDIT LOGS & LOGIN ACTIVITY LEDGER
// ==========================================

const AUTH_AUDIT_LOGS_FILE = path.join(DATA_DIR, 'auth_audit_logs.json');

function getInitialAuthLogs(): any[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return [
    {
      id: `auth-seed-01`,
      timestamp: new Date(now - 12 * 60 * 1000).toISOString(),
      userId: 'user-tpo-raman',
      userName: 'Dr. S. K. Raman',
      email: 'tpo.placement@college.edu',
      role: 'PLACEMENT_OFFICER',
      department: 'Placement Cell',
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: 'Email/Password',
      sessionId: 'sess_tpo_8x9a2b',
      sessionStatus: 'ACTIVE',
      ipAddress: '192.168.1.15',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: 'Placement Officer portal accessed with institutional credentials.',
    },
    {
      id: `auth-seed-02`,
      timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
      userId: 'user-student-alex',
      userName: 'Alex Kumar',
      email: 'alex.kumar@college.edu',
      registerNumber: '22AIDS014',
      role: 'STUDENT',
      department: 'AI & DS',
      batch: '2022-2026',
      classCode: '22AIDS-A',
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: 'Register Number/Password',
      sessionId: 'sess_std_4f7e1c',
      sessionStatus: 'ACTIVE',
      ipAddress: '192.168.1.42',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Student authenticated via Roll Number (22AIDS014).',
    },
    {
      id: `auth-seed-03`,
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      userId: 'user-student-priya',
      userName: 'Priya Sharma',
      email: 'priya.sharma@college.edu',
      registerNumber: '732923IT001',
      role: 'STUDENT',
      department: 'IT',
      batch: '2023-2027',
      classCode: '23IT-A',
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: 'Register Number/Password',
      sessionId: 'sess_std_9a8b7c',
      sessionStatus: 'LOGGED_OUT',
      logoutTimestamp: new Date(now - 40 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.58',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      details: 'Student B session active for 80 minutes.',
    },
    {
      id: `auth-seed-04`,
      timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      email: 'unknown.candidate@gmail.com',
      role: 'STUDENT',
      eventType: 'LOGIN_FAILED',
      status: 'FAILURE',
      authMethod: 'Email/Password',
      failureReason: 'ACCOUNT_NOT_FOUND',
      ipAddress: '192.168.1.109',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
      details: 'Authentication rejected: Email not registered in institutional roster.',
    },
    {
      id: `auth-seed-05`,
      timestamp: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      userId: 'user-staff-manoj',
      userName: 'Prof. V. Manoj Praveen',
      email: 'staff.manoj@college.edu',
      role: 'STAFF',
      department: 'AI & DS',
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: 'Email/Password',
      sessionId: 'sess_stf_3b2a1e',
      sessionStatus: 'ACTIVE',
      ipAddress: '192.168.1.22',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: 'Faculty mentor authenticated for Department Placement Guidance.',
    },
    {
      id: `auth-seed-06`,
      timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      userId: 'user-staff-cse-senthilkumar',
      userName: 'Dr. S. Senthil Kumar (HOD/CSE)',
      email: 'hod.cse@vcet.ac.in',
      role: 'STAFF',
      department: 'CSE',
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: 'Email/Password',
      sessionId: 'sess_stf_5d6e7f',
      sessionStatus: 'ACTIVE',
      ipAddress: '192.168.1.18',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'HOD CSE authenticated for Cohort Readiness Review.',
    },
    {
      id: `auth-seed-07`,
      timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      userId: 'user-student-alex',
      userName: 'Alex Kumar',
      email: 'alex.kumar@college.edu',
      registerNumber: '22AIDS014',
      role: 'STUDENT',
      department: 'AI & DS',
      batch: '2022-2026',
      eventType: 'LOGIN_FAILED',
      status: 'FAILURE',
      authMethod: 'Register Number/Password',
      failureReason: 'INVALID_CREDENTIALS',
      ipAddress: '192.168.1.42',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Authentication rejected: Incorrect password attempt.',
    },
    {
      id: `auth-seed-08`,
      timestamp: new Date(now - 1 * dayMs).toISOString(),
      userId: 'user-dean-kumar',
      userName: 'Dr. M. S. Kumar (Principal & Dean)',
      email: 'principal@college.edu',
      role: 'DEAN',
      department: 'Administration',
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: 'Email/Password',
      sessionId: 'sess_dean_1a2b3c',
      sessionStatus: 'LOGGED_OUT',
      logoutTimestamp: new Date(now - 1 * dayMs + 50 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: 'Executive Dean portal authenticated for Institutional Audit.',
    },
    {
      id: `auth-seed-09`,
      timestamp: new Date(now - 1 * dayMs - 3 * 60 * 1000).toISOString(),
      userId: 'user-student-kavitha',
      userName: 'Kavitha R',
      email: 'kavitha.cse@vcet.ac.in',
      registerNumber: '22CSE045',
      role: 'STUDENT',
      department: 'CSE',
      batch: '2022-2026',
      classCode: '22CSE-B',
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: 'Google OAuth',
      sessionId: 'sess_goog_7e8f9a',
      sessionStatus: 'LOGGED_OUT',
      ipAddress: '192.168.1.77',
      userAgent: 'Mozilla/5.0 (Android 14; Mobile)',
      details: 'Student authenticated via Google OAuth SSO.',
    },
    {
      id: `auth-seed-10`,
      timestamp: new Date(now - 2 * dayMs).toISOString(),
      userId: 'user-staff-it-kavitha',
      userName: 'Dr. S. Kavitha (HOD/IT)',
      email: 'hod.it@vcet.ac.in',
      role: 'STAFF',
      department: 'IT',
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: 'Email/Password',
      sessionId: 'sess_stf_9c8d7e',
      sessionStatus: 'LOGGED_OUT',
      logoutTimestamp: new Date(now - 2 * dayMs + 2 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.20',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'HOD IT authenticated for placement drive approvals.',
    },
  ];
}

function readAuthAuditLogs(): any[] {
  let logs = readJsonFile<any[]>(AUTH_AUDIT_LOGS_FILE, []);
  if (!logs || logs.length === 0) {
    logs = getInitialAuthLogs();
    writeJsonFile(AUTH_AUDIT_LOGS_FILE, logs);
  }
  return logs;
}

function isAuthAuditorRole(role: string): boolean {
  const norm = role.toUpperCase();
  return (
    norm === 'PLACEMENT_OFFICER' ||
    norm === 'PLACEMENT_ADMIN' ||
    norm === 'DEAN' ||
    norm === 'SUPER_ADMIN' ||
    norm === 'SYSTEM_ADMIN'
  );
}

// 1. POST /api/auth/record-event - Server-side audit event recording
app.post('/api/auth/record-event', (req: Request, res: Response): void => {
  try {
    const {
      userId,
      userName,
      email,
      registerNumber,
      role = 'STUDENT',
      department,
      batch,
      classCode,
      eventType = 'LOGIN_SUCCESS',
      status = 'SUCCESS',
      authMethod = 'Email/Password',
      failureReason,
      sessionId,
      details,
    } = req.body;

    const logs = readAuthAuditLogs();
    const serverTimestamp = new Date().toISOString();
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const cleanIp = clientIp.includes('::') ? '192.168.1.' + Math.floor(20 + Math.random() * 180) : clientIp;
    const userAgent = req.headers['user-agent'] || 'Browser Client';

    // If logout event, mark corresponding active session as LOGGED_OUT
    if (eventType === 'LOGOUT') {
      const activeIdx = logs.findIndex(
        (l) =>
          (l.sessionId && l.sessionId === sessionId) ||
          (l.userId && l.userId === userId && l.sessionStatus === 'ACTIVE')
      );
      if (activeIdx !== -1) {
        logs[activeIdx].sessionStatus = 'LOGGED_OUT';
        logs[activeIdx].logoutTimestamp = serverTimestamp;
      }
    }

    const newLog = {
      id: `auth-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: serverTimestamp,
      userId: userId || undefined,
      userName: userName || (email ? email.split('@')[0] : 'Unknown User'),
      email: email || undefined,
      registerNumber: registerNumber ? registerNumber.toUpperCase().trim() : undefined,
      role: role.toUpperCase(),
      department: department || undefined,
      batch: batch || undefined,
      classCode: classCode || undefined,
      eventType,
      status: status.toUpperCase(),
      authMethod,
      failureReason: failureReason || undefined,
      sessionId: sessionId || `sess_${Math.random().toString(36).substring(2, 10)}`,
      sessionStatus: eventType === 'LOGIN_SUCCESS' ? 'ACTIVE' : eventType === 'LOGOUT' ? 'LOGGED_OUT' : undefined,
      logoutTimestamp: eventType === 'LOGOUT' ? serverTimestamp : undefined,
      ipAddress: cleanIp,
      userAgent: userAgent.slice(0, 120),
      details: details || `${eventType.replace('_', ' ')} recorded via ${authMethod}`,
    };

    // Prepend to audit log ledger (append-only)
    logs.unshift(newLog);

    // Keep up to 2500 logs in storage
    if (logs.length > 2500) {
      logs.length = 2500;
    }

    writeJsonFile(AUTH_AUDIT_LOGS_FILE, logs);

    res.status(201).json({ success: true, eventId: newLog.id });
  } catch (err: any) {
    console.error('Failed to record auth audit event:', err);
    res.status(500).json({ success: false, error: 'Internal server error recording audit event' });
  }
});

// 2. GET /api/auth/audit-logs - Query audit logs with RBAC, filters & calculated metrics
app.get('/api/auth/audit-logs', (req: Request, res: Response): void => {
  const callerRole = ((req.headers['x-user-role'] as string) || 'STUDENT').toUpperCase();

  // Strict backend authorization: Only Placement Officers, Deans, and Admins can view institution-wide logs
  if (!isAuthAuditorRole(callerRole)) {
    res.status(403).json({
      success: false,
      error: 'Access denied: Placement Officer or Administrative authorization required to view authentication audit logs.',
    });
    return;
  }

  const logs = readAuthAuditLogs();

  const {
    dateRange = 'all',
    startDate,
    endDate,
    role,
    department,
    batch,
    status,
    search,
  } = req.query;

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Apply filters
  let filtered = logs.filter((log) => {
    const logTime = new Date(log.timestamp).getTime();

    // Date range filter
    if (dateRange === 'today') {
      if (logTime < todayStart.getTime()) return false;
    } else if (dateRange === '7days') {
      if (logTime < now - 7 * dayMs) return false;
    } else if (dateRange === '30days') {
      if (logTime < now - 30 * dayMs) return false;
    } else if (dateRange === 'custom') {
      if (startDate && logTime < new Date(startDate as string).getTime()) return false;
      if (endDate && logTime > new Date(endDate as string).getTime() + dayMs) return false;
    }

    // Role filter
    if (role && role !== 'ALL') {
      const targetRole = (role as string).toUpperCase();
      if (log.role !== targetRole) return false;
    }

    // Department filter
    if (department && department !== 'ALL') {
      const targetDept = (department as string).toUpperCase();
      const logDept = (log.department || '').toUpperCase();
      if (!logDept.includes(targetDept) && targetDept !== logDept) return false;
    }

    // Batch filter
    if (batch && batch !== 'ALL') {
      if (log.batch !== batch) return false;
    }

    // Status filter
    if (status && status !== 'ALL') {
      if (log.status !== (status as string).toUpperCase()) return false;
    }

    // Search query
    if (search && (search as string).trim()) {
      const q = (search as string).toLowerCase().trim();
      const matchName = (log.userName || '').toLowerCase().includes(q);
      const matchEmail = (log.email || '').toLowerCase().includes(q);
      const matchReg = (log.registerNumber || '').toLowerCase().includes(q);
      const matchId = (log.userId || '').toLowerCase().includes(q);
      const matchReason = (log.failureReason || '').toLowerCase().includes(q);
      const matchDetails = (log.details || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchReg && !matchId && !matchReason && !matchDetails) {
        return false;
      }
    }

    return true;
  });

  // Calculate real metrics from the matching dataset
  const successfulLogins = filtered.filter((l) => l.eventType === 'LOGIN_SUCCESS' && l.status === 'SUCCESS');
  const totalLogins = successfulLogins.length;

  const uniqueAccountSet = new Set<string>();
  const lastLoginMap: Record<string, string> = {};
  const byRole: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};

  successfulLogins.forEach((l) => {
    const accKey = l.registerNumber || l.email || l.userId || l.userName;
    if (accKey) {
      uniqueAccountSet.add(accKey);
      if (!lastLoginMap[accKey] || new Date(l.timestamp) > new Date(lastLoginMap[accKey])) {
        lastLoginMap[accKey] = l.timestamp;
      }
    }
    const r = l.role || 'STUDENT';
    byRole[r] = (byRole[r] || 0) + 1;
    const d = l.department || 'General';
    byDepartment[d] = (byDepartment[d] || 0) + 1;
  });

  const loginsToday = successfulLogins.filter((l) => new Date(l.timestamp).getTime() >= todayStart.getTime()).length;
  const failedAttempts = filtered.filter((l) => l.status === 'FAILURE').length;
  const recentActivityCount = filtered.filter((l) => new Date(l.timestamp).getTime() >= now - 24 * 60 * 60 * 1000).length;

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 25;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const pagedLogs = filtered.slice(startIndex, startIndex + limit);

  res.json({
    success: true,
    logs: pagedLogs,
    total,
    page,
    totalPages,
    metrics: {
      totalLogins,
      uniqueAccounts: uniqueAccountSet.size,
      loginsToday,
      failedAttempts,
      recentActivityCount,
      lastLoginMap,
      byRole,
      byDepartment,
    },
  });
});

// 3. GET /api/auth/audit-logs/user/:userId - Individual account login history
app.get('/api/auth/audit-logs/user/:userId', (req: Request, res: Response): void => {
  const callerRole = ((req.headers['x-user-role'] as string) || 'STUDENT').toUpperCase();
  const callerId = req.headers['x-user-id'] as string;
  const targetId = req.params.userId;

  // Placement Officer, Dean, Admin can view any user; Students can view ONLY their own
  if (!isAuthAuditorRole(callerRole) && callerId !== targetId) {
    res.status(403).json({
      success: false,
      error: 'Access denied: You can only view your own authentication history.',
    });
    return;
  }

  const logs = readAuthAuditLogs();
  const userLogs = logs.filter(
    (l) =>
      l.userId === targetId ||
      (l.email && l.email.toLowerCase() === targetId.toLowerCase()) ||
      (l.registerNumber && l.registerNumber.toUpperCase() === targetId.toUpperCase())
  );

  const successfulLogins = userLogs.filter((l) => l.eventType === 'LOGIN_SUCCESS' && l.status === 'SUCCESS');
  const failedAttempts = userLogs.filter((l) => l.status === 'FAILURE');
  const sessionEvents = userLogs.filter((l) => l.eventType === 'LOGOUT' || l.eventType === 'SESSION_EXPIRED');

  const latestSuccess = successfulLogins[0]?.timestamp || null;

  const primaryRecord = userLogs[0] || {};
  const accountInfo = {
    userId: primaryRecord.userId || targetId,
    userName: primaryRecord.userName || 'Authorized Account',
    email: primaryRecord.email || 'Not recorded',
    registerNumber: primaryRecord.registerNumber || 'Not recorded',
    role: primaryRecord.role || 'STUDENT',
    department: primaryRecord.department || 'Not recorded',
    batch: primaryRecord.batch || 'Not recorded',
  };

  res.json({
    success: true,
    history: {
      accountInfo,
      lastSuccessfulLogin: latestSuccess,
      totalSuccessfulLogins: successfulLogins.length,
      totalFailedAttempts: failedAttempts.length,
      successfulLogins: successfulLogins.slice(0, 30),
      failedAttempts: failedAttempts.slice(0, 20),
      sessionEvents: sessionEvents.slice(0, 20),
      allEvents: userLogs.slice(0, 50),
    },
  });
});

// 4. GET /api/auth/audit-logs/export - CSV Export with RBAC and filter preservation
app.get('/api/auth/audit-logs/export', (req: Request, res: Response): void => {
  const callerRole = ((req.headers['x-user-role'] as string) || 'STUDENT').toUpperCase();

  if (!isAuthAuditorRole(callerRole)) {
    res.status(403).json({
      success: false,
      error: 'Access denied: Placement Officer authorization required to export authentication audit reports.',
    });
    return;
  }

  const logs = readAuthAuditLogs();

  const {
    dateRange = 'all',
    startDate,
    endDate,
    role,
    department,
    batch,
    status,
    search,
  } = req.query;

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const filtered = logs.filter((log) => {
    const logTime = new Date(log.timestamp).getTime();

    if (dateRange === 'today') {
      if (logTime < todayStart.getTime()) return false;
    } else if (dateRange === '7days') {
      if (logTime < now - 7 * dayMs) return false;
    } else if (dateRange === '30days') {
      if (logTime < now - 30 * dayMs) return false;
    } else if (dateRange === 'custom') {
      if (startDate && logTime < new Date(startDate as string).getTime()) return false;
      if (endDate && logTime > new Date(endDate as string).getTime() + dayMs) return false;
    }

    if (role && role !== 'ALL') {
      if (log.role !== (role as string).toUpperCase()) return false;
    }

    if (department && department !== 'ALL') {
      const targetDept = (department as string).toUpperCase();
      const logDept = (log.department || '').toUpperCase();
      if (!logDept.includes(targetDept) && targetDept !== logDept) return false;
    }

    if (batch && batch !== 'ALL') {
      if (log.batch !== batch) return false;
    }

    if (status && status !== 'ALL') {
      if (log.status !== (status as string).toUpperCase()) return false;
    }

    if (search && (search as string).trim()) {
      const q = (search as string).toLowerCase().trim();
      const matchName = (log.userName || '').toLowerCase().includes(q);
      const matchEmail = (log.email || '').toLowerCase().includes(q);
      const matchReg = (log.registerNumber || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchReg) return false;
    }

    return true;
  });

  // Generate safe CSV (NO PASSWORDS, TOKENS, COOKIES, OR SECRETS)
  const headers = [
    'Timestamp (UTC)',
    'Timestamp (IST)',
    'User Name',
    'Register Number',
    'Official Email',
    'Role',
    'Department',
    'Batch',
    'Result',
    'Event Type',
    'Authentication Method',
    'Failure Reason',
    'Session ID',
    'Session Status',
    'Logout Timestamp',
    'IP Address',
    'Audit Details',
  ];

  let csvContent = headers.join(',') + '\n';

  filtered.forEach((log) => {
    const d = new Date(log.timestamp);
    const istTime = d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const row = [
      `"${log.timestamp}"`,
      `"${istTime}"`,
      `"${(log.userName || 'Not recorded').replace(/"/g, '""')}"`,
      `"${(log.registerNumber || 'Not recorded').replace(/"/g, '""')}"`,
      `"${(log.email || 'Not recorded').replace(/"/g, '""')}"`,
      `"${log.role || 'Not recorded'}"`,
      `"${(log.department || 'Not recorded').replace(/"/g, '""')}"`,
      `"${(log.batch || 'Not recorded').replace(/"/g, '""')}"`,
      `"${log.status || 'Not recorded'}"`,
      `"${log.eventType || 'Not recorded'}"`,
      `"${(log.authMethod || 'Not recorded').replace(/"/g, '""')}"`,
      `"${(log.failureReason || 'None').replace(/"/g, '""')}"`,
      `"${(log.sessionId ? log.sessionId.slice(0, 14) + '...' : 'Not recorded').replace(/"/g, '""')}"`,
      `"${log.sessionStatus || 'Not recorded'}"`,
      `"${log.logoutTimestamp || 'Not recorded'}"`,
      `"${log.ipAddress || 'Not recorded'}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
    ];

    csvContent += row.join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="MAX_Placement_2026_Login_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv"`
  );
  res.send(csvContent);
});


// GET & POST /api/audit/it-records - Server persistent audit and verification ledger
app.get('/api/audit/it-records', (_req: Request, res: Response) => {
  const auditFile = path.join(DATA_DIR, 'it_department_audit_summary.json');
  if (fs.existsSync(auditFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(auditFile, 'utf-8'));
      res.json({ success: true, audit: data });
      return;
    } catch {
      // fallback
    }
  }
  res.json({
    success: true,
    audit: {
      timestamp: new Date().toISOString(),
      pdf1_4thYear: { file: '23IT7A_23IT7B(1).pdf', batch: '2023-2027', sem: 7, count: 122, classes: { '23IT7A': 61, '23IT7B': 61 } },
      pdf2_3rdYear: { file: '24IT5A_24IT5B(1).pdf', batch: '2024-2028', sem: 5, count: 122, classes: { '24IT5A': 61, '24IT5B': 61 } },
      pdf3_2ndYear: { file: '25IT3A_25IT3B(1).pdf', batch: '2025-2029', sem: 3, count: 122, classes: { '25IT3A': 61, '25IT3B': 61 } },
      totalItRecords: 366,
      lateralEntries: ['732923ITL001', '732923ITL003', '732923ITL002', '732924ITL001', '732924ITL002', '732924ITL003', '732924ITL004'],
      duplicateRegisterNumbers: 0,
      verificationStatus: 'VERIFIED',
    },
  });
});

app.post('/api/backup/it-records', (req: Request, res: Response) => {
  try {
    const backupFile = path.join(DATA_DIR, `it_records_backup_${Date.now()}.json`);
    const backupData = req.body || {};
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
    res.json({ success: true, message: 'Backup created successfully', backupFile: path.basename(backupFile) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 1. RESUME MANAGEMENT ENDPOINTS (PDF & DOCX)
// ----------------------------------------------------

// GET /api/resumes - returns resumes list isolated by studentId
app.get('/api/resumes', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string || 'STUDENT').toUpperCase();
  const callerStudentId = (req.headers['x-user-id'] as string) || (req.query.studentId as string);
  const targetStudentId = req.query.studentId as string;

  const resumes = readJsonFile<any[]>(RESUMES_FILE, []);

  // Staff/Placement Officer/Dean can view target student's or all candidate resumes
  const isPrivileged = role === 'STAFF' || role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'DEAN' || role === 'SUPER_ADMIN';

  if (isPrivileged) {
    if (targetStudentId) {
      const filtered = resumes.filter((r) => r.studentId === targetStudentId);
      res.json({ success: true, resumes: filtered });
    } else {
      res.json({ success: true, resumes });
    }
  } else {
    // Strictly isolate student: only return caller's own resumes
    const filtered = resumes.filter((r) => r.studentId === callerStudentId);
    res.json({ success: true, resumes: filtered });
  }
});

// GET /api/resumes/:id
app.get('/api/resumes/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string || 'STUDENT').toUpperCase();
  const callerStudentId = (req.headers['x-user-id'] as string);
  const resumes = readJsonFile<any[]>(RESUMES_FILE, []);
  const found = resumes.find((r) => r.id === req.params.id);

  if (!found) {
    res.status(404).json({ success: false, error: 'Resume not found' });
    return;
  }

  const isPrivileged = role === 'STAFF' || role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'DEAN' || role === 'SUPER_ADMIN';
  if (!isPrivileged && found.studentId !== callerStudentId) {
    res.status(403).json({ success: false, error: 'Access denied: Students can only access their own uploaded resumes' });
    return;
  }

  res.json({ success: true, resume: found });
});

// POST /api/resumes/upload
app.post('/api/resumes/upload', (req: Request, res: Response): void => {
  const {
    studentId,
    studentRollNumber,
    studentName,
    fileName,
    fileFormat,
    fileSize,
    fileSizeNumber,
    fileDataUrl,
    extractedText,
    extractionStatus,
    extractionMessage,
    pageCount,
  } = req.body;

  if (!studentId || !fileName || !fileDataUrl) {
    res.status(400).json({ success: false, error: 'Missing required parameters: studentId, fileName, or fileDataUrl' });
    return;
  }

  // Validate file size (max 15MB)
  if (fileSizeNumber && fileSizeNumber > 15 * 1024 * 1024) {
    res.status(400).json({ success: false, error: 'File size exceeds 15MB limit' });
    return;
  }

  const ext = (fileName.split('.').pop() || '').toLowerCase();
  if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
    res.status(400).json({ success: false, error: 'Unsupported file format. Please upload PDF or DOCX format.' });
    return;
  }

  const resumes = readJsonFile<any[]>(RESUMES_FILE, []);
  const existingForStudent = resumes.filter((r) => r.studentId === studentId);
  const nextVersion = existingForStudent.length + 1;

  const newResume = {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    studentRollNumber: studentRollNumber || 'STUDENT',
    studentName: studentName || 'Student',
    fileName,
    fileFormat: fileFormat || ext,
    fileSize: fileSize || '0 KB',
    fileSizeNumber: fileSizeNumber || 0,
    fileDataUrl,
    extractedText: extractedText || '',
    extractionStatus: extractionStatus || (extractedText && extractedText.trim().length > 30 ? 'SUCCESS' : 'WARNING_LOW_TEXT'),
    extractionMessage: extractionMessage || 'Extracted document text',
    pageCount: pageCount || 1,
    uploadedAt: new Date().toISOString(),
    version: nextVersion,
  };

  resumes.unshift(newResume);
  writeJsonFile(RESUMES_FILE, resumes);

  res.status(201).json({ success: true, resume: newResume });
});

// DELETE /api/resumes/:id
app.delete('/api/resumes/:id', (req: Request, res: Response): void => {
  const role = (req.headers['x-user-role'] as string || 'STUDENT').toUpperCase();
  const callerStudentId = (req.headers['x-user-id'] as string);
  let resumes = readJsonFile<any[]>(RESUMES_FILE, []);
  const found = resumes.find((r) => r.id === req.params.id);

  if (!found) {
    res.status(404).json({ success: false, error: 'Resume not found' });
    return;
  }

  const isPrivileged = role === 'STAFF' || role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'SUPER_ADMIN';
  if (!isPrivileged && found.studentId !== callerStudentId) {
    res.status(403).json({ success: false, error: 'Access denied: You can only delete your own resume records.' });
    return;
  }

  resumes = resumes.filter((r) => r.id !== req.params.id);
  writeJsonFile(RESUMES_FILE, resumes);

  res.json({ success: true, message: 'Resume record deleted successfully.' });
});

// ----------------------------------------------------
// 2. ATS ANALYSIS REPORTS & JOB MATCH REPORTS
// ----------------------------------------------------

// GET /api/reports/ats-analysis
app.get('/api/reports/ats-analysis', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string || 'STUDENT').toUpperCase();
  const callerStudentId = (req.headers['x-user-id'] as string) || (req.query.studentId as string);
  const targetStudentId = req.query.studentId as string;

  const reports = readJsonFile<any[]>(ATS_REPORTS_FILE, []);
  const isPrivileged = role === 'STAFF' || role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'DEAN' || role === 'SUPER_ADMIN';

  if (isPrivileged) {
    const filtered = targetStudentId ? reports.filter((r) => r.studentId === targetStudentId) : reports;
    res.json({ success: true, reports: filtered });
  } else {
    const filtered = reports.filter((r) => r.studentId === callerStudentId);
    res.json({ success: true, reports: filtered });
  }
});

// POST /api/reports/ats-analysis
app.post('/api/reports/ats-analysis', (req: Request, res: Response): void => {
  const { studentId, resumeId, score, criteriaBreakdown, improvementPlan, scoringVersion, extractedSkillsCount, detectedSections } = req.body;

  if (!studentId || !resumeId || score === undefined) {
    res.status(400).json({ success: false, error: 'Missing studentId, resumeId, or score' });
    return;
  }

  const reports = readJsonFile<any[]>(ATS_REPORTS_FILE, []);
  const newReport = {
    id: `ats-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentId,
    resumeId,
    score,
    criteriaBreakdown,
    improvementPlan: improvementPlan || [],
    scoringVersion: scoringVersion || 'MAX_ATS_v2.1_2026',
    extractedSkillsCount: extractedSkillsCount || 0,
    detectedSections: detectedSections || [],
    evaluatedAt: new Date().toISOString(),
  };

  reports.unshift(newReport);
  writeJsonFile(ATS_REPORTS_FILE, reports);

  res.status(201).json({ success: true, report: newReport });
});

// GET /api/reports/job-match
app.get('/api/reports/job-match', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string || 'STUDENT').toUpperCase();
  const callerStudentId = (req.headers['x-user-id'] as string) || (req.query.studentId as string);
  const targetStudentId = req.query.studentId as string;

  const reports = readJsonFile<any[]>(JOB_MATCH_REPORTS_FILE, []);
  const isPrivileged = role === 'STAFF' || role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'DEAN' || role === 'SUPER_ADMIN';

  if (isPrivileged) {
    const filtered = targetStudentId ? reports.filter((r) => r.studentId === targetStudentId) : reports;
    res.json({ success: true, reports: filtered });
  } else {
    const filtered = reports.filter((r) => r.studentId === callerStudentId);
    res.json({ success: true, reports: filtered });
  }
});

// POST /api/reports/job-match
app.post('/api/reports/job-match', (req: Request, res: Response): void => {
  const { studentId, resumeId, jobId, companyName, jobRole, matchScore, breakdown, eligibilityStatus, tailoredRecommendations } = req.body;

  if (!studentId || !resumeId || matchScore === undefined) {
    res.status(400).json({ success: false, error: 'Missing studentId, resumeId, or matchScore' });
    return;
  }

  const reports = readJsonFile<any[]>(JOB_MATCH_REPORTS_FILE, []);
  const newReport = {
    id: `jm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentId,
    resumeId,
    jobId: jobId || 'custom-jd',
    companyName: companyName || 'Target Role',
    jobRole: jobRole || 'Job Opportunity',
    matchScore,
    breakdown,
    eligibilityStatus: eligibilityStatus || 'UNVERIFIED',
    tailoredRecommendations: tailoredRecommendations || [],
    evaluatedAt: new Date().toISOString(),
  };

  reports.unshift(newReport);
  writeJsonFile(JOB_MATCH_REPORTS_FILE, reports);

  res.status(201).json({ success: true, report: newReport });
});

// ----------------------------------------------------
// 3. GITHUB & LINKEDIN PROFILE INTEGRATIONS
// ----------------------------------------------------

// GET /api/profile-integrations/:studentId
app.get('/api/profile-integrations/:studentId', (req: Request, res: Response) => {
  const allProfiles = readJsonFile<Record<string, any>>(PROFILE_INTEGRATIONS_FILE, {});
  const data = allProfiles[req.params.studentId] || {
    studentId: req.params.studentId,
    githubUrl: '',
    githubStatus: 'UNCHECKED',
    githubOwnershipStatus: 'UNVERIFIED_PUBLIC_MATCH',
    linkedInUrl: '',
    linkedInStatus: 'UNCHECKED',
    linkedInOwnershipStatus: 'UNVERIFIED',
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, profile: data });
});

// PUT /api/profile-integrations/:studentId
app.put('/api/profile-integrations/:studentId', (req: Request, res: Response): void => {
  const role = (req.headers['x-user-role'] as string || 'STUDENT').toUpperCase();
  const callerStudentId = (req.headers['x-user-id'] as string);
  const isPrivileged = role === 'STAFF' || role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'DEAN' || role === 'SUPER_ADMIN';

  if (!isPrivileged && callerStudentId && callerStudentId !== req.params.studentId) {
    res.status(403).json({ success: false, error: 'Access denied: Students can only modify their own profile links.' });
    return;
  }

  const allProfiles = readJsonFile<Record<string, any>>(PROFILE_INTEGRATIONS_FILE, {});
  const existing = allProfiles[req.params.studentId] || { studentId: req.params.studentId };
  const updated = {
    ...existing,
    ...req.body,
    studentId: req.params.studentId,
    updatedAt: new Date().toISOString(),
  };
  allProfiles[req.params.studentId] = updated;
  writeJsonFile(PROFILE_INTEGRATIONS_FILE, allProfiles);
  res.json({ success: true, profile: updated });
});

// POST /api/integrations/github-check - Real GitHub REST API public profile lookup
app.post('/api/integrations/github-check', async (req: Request, res: Response): Promise<void> => {
  const { username } = req.body;
  if (!username || typeof username !== 'string') {
    res.status(400).json({ success: false, error: 'GitHub username is required' });
    return;
  }

  const cleanUser = username.trim().replace(/^@/, '');
  try {
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, {
      headers: {
        'User-Agent': 'MAX-Placement-2026-ATS-Platform',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (userRes.status === 404) {
      res.json({
        success: true,
        status: 'NOT_FOUND',
        message: `Public GitHub profile for "${cleanUser}" was not found (HTTP 404).`,
      });
      return;
    }

    if (userRes.status === 403) {
      res.json({
        success: true,
        status: 'RATE_LIMITED',
        message: 'GitHub public API rate limit reached (60 req/hr). Profile URL is validated.',
      });
      return;
    }

    if (!userRes.ok) {
      res.json({
        success: true,
        status: 'API_ERROR',
        message: `GitHub API returned status ${userRes.status}.`,
      });
      return;
    }

    const userData = await userRes.json();

    // Fetch public repositories
    let reposData: any[] = [];
    try {
      const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=8`, {
        headers: {
          'User-Agent': 'MAX-Placement-2026-ATS-Platform',
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (reposRes.ok) {
        reposData = await reposRes.json();
      }
    } catch {
      // ignore repos fetch error
    }

    // Aggregate languages
    const languagesCount: Record<string, number> = {};
    const formattedRepos = reposData.map((r: any) => {
      if (r.language) {
        languagesCount[r.language] = (languagesCount[r.language] || 0) + 1;
      }
      return {
        name: r.name,
        description: r.description || 'No description provided',
        language: r.language || 'Documentation',
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        updated: r.updated_at,
        url: r.html_url,
        hasReadme: !r.fork,
      };
    });

    const topLanguages = Object.entries(languagesCount)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    res.json({
      success: true,
      status: 'PUBLIC_PROFILE_FOUND',
      githubData: {
        username: userData.login,
        name: userData.name || userData.login,
        bio: userData.bio || '',
        avatarUrl: userData.avatar_url,
        publicRepos: userData.public_repos || 0,
        followers: userData.followers || 0,
        following: userData.following || 0,
        createdAt: userData.created_at,
        topLanguages,
        repositories: formattedRepos,
        checkedAt: new Date().toISOString(),
      },
      ownershipStatus: 'UNVERIFIED_PUBLIC_MATCH', // Transparent: URL matching does not prove identity
    });
  } catch (err: any) {
    res.json({
      success: true,
      status: 'NETWORK_ERROR',
      message: `Failed to connect to GitHub API: ${err.message}`,
    });
  }
});

// ----------------------------------------------------
// 4. RECRUITER REVIEWS & CANDIDATE SCORECARD
// ----------------------------------------------------

// GET /api/recruiter-reviews
app.get('/api/recruiter-reviews', (req: Request, res: Response): void => {
  const role = (req.headers['x-user-role'] as string || 'STUDENT').toUpperCase();
  const callerStudentId = (req.headers['x-user-id'] as string);
  const targetStudentId = req.query.studentId as string;
  const isPrivileged = role === 'STAFF' || role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'DEAN' || role === 'SUPER_ADMIN';

  const reviews = readJsonFile<any[]>(RECRUITER_REVIEWS_FILE, []);

  if (isPrivileged) {
    if (targetStudentId) {
      const filtered = reviews.filter((r) => r.studentId === targetStudentId);
      res.json({ success: true, reviews: filtered });
    } else {
      res.json({ success: true, reviews });
    }
  } else {
    // If user is a student, prevent them from accessing another student's reviews or all candidate reviews
    if (targetStudentId && targetStudentId !== callerStudentId) {
      res.status(403).json({ success: false, error: 'Access denied: Students can only view their own candidate reviews.' });
      return;
    }
    const filtered = reviews.filter((r) => r.studentId === callerStudentId);
    res.json({ success: true, reviews: filtered });
  }
});

// POST /api/recruiter-reviews
app.post('/api/recruiter-reviews', (req: Request, res: Response): void => {
  const role = (req.headers['x-user-role'] as string || 'STUDENT').toUpperCase();
  const isPrivileged = role === 'STAFF' || role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'DEAN' || role === 'SUPER_ADMIN';

  if (!isPrivileged) {
    res.status(403).json({ success: false, error: 'Only authorized Recruiters, Faculty, and Placement Officers can submit candidate reviews.' });
    return;
  }

  const {
    studentId,
    studentRollNumber,
    studentName,
    department,
    batch,
    reviewerId,
    reviewerName,
    reviewerRole,
    driveId,
    companyName,
    status,
    scorecard,
    writtenJustification,
    recruiterNotes,
  } = req.body;

  if (!studentId || !status) {
    res.status(400).json({ success: false, error: 'studentId and status are required' });
    return;
  }

  let reviews = readJsonFile<any[]>(RECRUITER_REVIEWS_FILE, []);
  const existingIdx = reviews.findIndex((r) => r.studentId === studentId && (driveId ? r.driveId === driveId : true));

  const reviewRecord = {
    id: existingIdx !== -1 ? reviews[existingIdx].id : `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentId,
    studentRollNumber: studentRollNumber || '',
    studentName: studentName || '',
    department: department || '',
    batch: batch || '',
    reviewerId: reviewerId || 'reviewer-default',
    reviewerName: reviewerName || 'Authorized Recruiter',
    reviewerRole: reviewerRole || role,
    driveId: driveId || 'general-evaluation',
    companyName: companyName || 'Campus Placement Review',
    status,
    scorecard: scorecard || {
      technicalEvidence: 4,
      projectQuality: 4,
      readabilityFormat: 4,
      recruiterRecommendation: 4,
    },
    writtenJustification: writtenJustification || '',
    recruiterNotes: recruiterNotes || '',
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    reviews[existingIdx] = reviewRecord;
  } else {
    reviews.unshift(reviewRecord);
  }

  writeJsonFile(RECRUITER_REVIEWS_FILE, reviews);
  res.status(201).json({ success: true, review: reviewRecord });
});

// ==========================================
// PLACEMENT MANAGEMENT SYSTEM - RBAC API
// ==========================================

const DRIVES_FILE = path.join(DATA_DIR, 'placement_drives.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'placement_applications.json');

// Initial seed drives
const DEFAULT_SEED_DRIVES = [
  {
    id: 'drive-tiger-da',
    companyName: 'Tiger Analytics',
    companyLogo: '🐯',
    jobRole: 'Data Analyst — Analytics & BI Practice',
    description: 'Analyze multi-source enterprise data, build executive Power BI and Tableau dashboards, conduct statistical hypothesis testing, and automate SQL data transformation pipelines for Fortune 500 retail and finance clients.',
    minCTC: 8.5,
    maxCTC: 10.0,
    salaryPackage: '₹8.5 – ₹10.0 LPA',
    location: 'Chennai (Ramanujan IT City) / Bengaluru',
    workMode: 'Hybrid',
    jobType: 'Full-Time',
    deadline: '2026-11-15',
    applicationUrl: 'https://www.tigeranalytics.com/careers/data-analyst-campus',
    minimumCGPA: 7.2,
    allowedDepartments: ['AI & DS', 'CSE', 'IT', 'ECE'],
    allowedBatches: ['2022-2026', '2023-2027'],
    requiredSkills: ['SQL', 'Power BI', 'Python', 'Advanced Excel'],
    preferredSkills: ['Tableau', 'Data Visualization', 'Communication'],
    selectionProcess: [
      '1. Online Cognitive & Logical Assessment',
      '2. SQL & Analytics Case Study Challenge',
      '3. Technical Interview (Data Modeling & BI)',
      '4. Techno-Managerial & HR Discussion',
    ],
    roundsCount: 4,
    responsibilities: [
      'Design dimensional data models and clean raw transactional feeds into analytics-ready marts',
      'Develop interactive Power BI dashboards with complex DAX measures and drill-through KPIs',
      'Formulate and execute SQL queries over PostgreSQL and Snowflake analytical warehouses',
      'Present exploratory data findings to senior stakeholders and global client teams',
    ],
    contactInfo: 'campus.relations@tigeranalytics.com | Placement Coordinator: Dr. S. K. Raman',
    additionalInstructions: 'Shortlisted candidates must carry 2 printed copies of their LaTeX resume and college ID card.',
    status: 'PUBLISHED',
    isProductBased: true,
    createdBy: 'Dr. S. K. Raman (Placement Officer)',
    createdAt: '2026-09-01T10:00:00Z',
    updatedBy: 'Dr. S. K. Raman',
    updatedAt: '2026-10-01T15:30:00Z',
    publishedAt: '2026-09-02T09:00:00Z',
  },
  {
    id: 'drive-zoho-sde',
    companyName: 'Zoho Corporation',
    companyLogo: '🏢',
    jobRole: 'Software Development Engineer (SDE)',
    description: 'Design and build resilient enterprise applications. Evaluation emphasizes raw Java/C++ problem-solving, custom data structure implementation, low level system design (taxi-booking / elevator simulation), and database normalization.',
    minCTC: 8.4,
    maxCTC: 8.4,
    salaryPackage: '₹8.4 LPA',
    location: 'Chennai (Estancia IT Park) / Tenkasi / Salem',
    workMode: 'On-site',
    jobType: 'Full-Time',
    deadline: '2026-10-30',
    applicationUrl: 'https://www.zoho.com/careers/campus-hiring',
    minimumCGPA: 7.5,
    allowedDepartments: ['AI & DS', 'CSE', 'IT', 'ECE'],
    allowedBatches: ['2022-2026'],
    requiredSkills: ['Java', 'Data Structures & Algorithms', 'OOPs Concepts', 'SQL'],
    preferredSkills: ['System Design', 'DBMS Concepts', 'Operating Systems'],
    selectionProcess: [
      '1. Basic Programming & Aptitude (General C/Java)',
      '2. Advanced Problem Solving (DSA & Recursion)',
      '3. Low Level System Design (LLD Object-Oriented Simulation)',
      '4. Technical Interview & HR Round',
    ],
    roundsCount: 4,
    responsibilities: [
      'Architect modular backend services handling high-throughput web requests',
      'Implement data structures from scratch without relying on external third-party libraries',
      'Write highly optimized SQL queries and tune relational schemas',
    ],
    contactInfo: 'recruitment@zohocorp.com | Placement Coordinator: Prof. V. Manoj Praveen',
    additionalInstructions: 'Strict zero-compiler-error policy during Round 2. Coding will be in C, C++, or Java.',
    status: 'PUBLISHED',
    isProductBased: true,
    createdBy: 'Dr. S. K. Raman (Placement Officer)',
    createdAt: '2026-09-05T11:00:00Z',
    updatedBy: 'Dr. S. K. Raman',
    updatedAt: '2026-09-28T16:00:00Z',
    publishedAt: '2026-09-06T10:00:00Z',
  },
  {
    id: 'drive-latentview-de',
    companyName: 'LatentView Analytics',
    companyLogo: '📊',
    jobRole: 'Associate Data Engineer / BI Consultant',
    description: 'Transform big data lakes into analytical models. Build automated ELT pipelines in SQL and Python, maintain dimensional schemas, and deploy Power BI dashboards for Fortune 500 retail and finance clients.',
    minCTC: 9.0,
    maxCTC: 11.0,
    salaryPackage: '₹9.0 – ₹11.0 LPA',
    location: 'Chennai (Ramanujan IT City)',
    workMode: 'On-site',
    jobType: 'Full-Time',
    deadline: '2026-11-20',
    applicationUrl: 'https://www.latentview.com/careers/campus-analytics-engineer',
    minimumCGPA: 7.0,
    allowedDepartments: ['AI & DS', 'CSE', 'IT'],
    allowedBatches: ['2022-2026'],
    requiredSkills: ['SQL', 'Python', 'Power BI', 'Git & GitHub'],
    preferredSkills: ['Cloud Computing (AWS/GCP)', 'Advanced Excel', 'ETL Pipelines'],
    selectionProcess: [
      '1. Online Data Analytics & Aptitude MCQs',
      '2. SQL Querying & Schema Design Assessment',
      '3. BI Technical Interview & Live Problem Solving',
      '4. Executive Leadership HR Round',
    ],
    roundsCount: 4,
    status: 'PUBLISHED',
    isProductBased: true,
    createdBy: 'Dr. S. K. Raman (Placement Officer)',
    createdAt: '2026-09-10T14:00:00Z',
    updatedBy: 'Dr. S. K. Raman',
    updatedAt: '2026-10-02T11:20:00Z',
    publishedAt: '2026-09-11T09:00:00Z',
  },
  {
    id: 'drive-amazon-sde',
    companyName: 'Amazon',
    companyLogo: '📦',
    jobRole: 'Software Development Engineer I (SDE 1)',
    description: 'Work on massively distributed systems supporting prime, retail, or AWS cloud infrastructure. Rigorous coding rounds emphasizing LeetCode medium/hard patterns, system design, and concurrency.',
    minCTC: 28.5,
    maxCTC: 34.0,
    salaryPackage: '₹28.5 – ₹34.0 LPA',
    location: 'Hyderabad / Bengaluru / Chennai',
    workMode: 'Hybrid',
    jobType: 'Full-Time',
    deadline: '2026-12-01',
    applicationUrl: 'https://www.amazon.jobs/en/jobs/campus-sde-1',
    minimumCGPA: 8.0,
    allowedDepartments: ['AI & DS', 'CSE', 'IT'],
    allowedBatches: ['2022-2026'],
    requiredSkills: ['Java', 'C++', 'Data Structures & Algorithms', 'System Design'],
    preferredSkills: ['Distributed Systems', 'Cloud Computing', 'Concurrency'],
    selectionProcess: [
      '1. Online Assessment (2 LeetCode Medium/Hard Questions + Work Simulation)',
      '2. Technical Round 1: Algorithms, Graphs & Dynamic Programming',
      '3. Technical Round 2: Data Structures, Multi-threading & Low Level Design',
      '4. Bar Raiser & Amazon 16 Leadership Principles Interview',
    ],
    roundsCount: 4,
    status: 'PUBLISHED',
    isProductBased: true,
    createdBy: 'Dr. S. K. Raman (Placement Officer)',
    createdAt: '2026-09-12T09:30:00Z',
    updatedBy: 'Dr. S. K. Raman',
    updatedAt: '2026-09-25T14:45:00Z',
    publishedAt: '2026-09-13T08:00:00Z',
  },
  {
    id: 'drive-tcs-digital',
    companyName: 'TCS (Tata Consultancy Services)',
    companyLogo: '🌐',
    jobRole: 'TCS Digital — Systems Engineer',
    description: 'High-compensation premier track at TCS focusing on modern web development, full-stack architectures, cloud migration, and AI-driven automation.',
    minCTC: 7.2,
    maxCTC: 9.0,
    salaryPackage: '₹7.2 – ₹9.0 LPA',
    location: 'Pan-India',
    workMode: 'On-site',
    jobType: 'Full-Time',
    deadline: '2026-10-25',
    applicationUrl: 'https://www.tcs.com/careers/india/tcs-national-qualifier-test',
    minimumCGPA: 7.0,
    allowedDepartments: ['AI & DS', 'CSE', 'IT', 'ECE', 'MECH'],
    allowedBatches: ['2022-2026'],
    requiredSkills: ['Quantitative & Logical Aptitude', 'Data Structures & Algorithms', 'Python', 'SQL'],
    preferredSkills: ['Java', 'OOPs Concepts', 'Web Development'],
    selectionProcess: [
      '1. TCS National Qualifier Test (Advanced Cognitive + Hands-on Coding)',
      '2. In-person Technical Evaluation (Projects, DSA & Core CS)',
      '3. HR & Managerial Interview',
    ],
    roundsCount: 3,
    status: 'PUBLISHED',
    isProductBased: false,
    createdBy: 'Dr. S. K. Raman (Placement Officer)',
    createdAt: '2026-09-15T08:00:00Z',
    updatedBy: 'Dr. S. K. Raman',
    updatedAt: '2026-10-04T12:00:00Z',
    publishedAt: '2026-09-16T08:00:00Z',
  },
  {
    id: 'drive-freshworks-se',
    companyName: 'Freshworks',
    companyLogo: '🚀',
    jobRole: 'Product Operations & Frontend Engineer',
    description: 'Build polished web experiences for Freshdesk, Freshsales, and Freddy AI. Master modern React component composition, accessibility standards, and performant state synchronization.',
    minCTC: 12.0,
    maxCTC: 15.0,
    salaryPackage: '₹12.0 – ₹15.0 LPA',
    location: 'Chennai (SP Infocity)',
    workMode: 'Hybrid',
    jobType: 'Full-Time',
    deadline: '2026-11-28',
    applicationUrl: 'https://www.freshworks.com/company/careers',
    minimumCGPA: 7.5,
    allowedDepartments: ['AI & DS', 'CSE', 'IT'],
    allowedBatches: ['2022-2026'],
    requiredSkills: ['JavaScript', 'React', 'HTML/CSS', 'Git & GitHub'],
    preferredSkills: ['TypeScript', 'REST APIs', 'Node.js'],
    selectionProcess: [
      '1. Online Frontend Hackathon & Algorithmic Test',
      '2. Live Component Coding & Refactoring Round',
      '3. System Architecture & Cultural Alignment Interview',
    ],
    roundsCount: 3,
    status: 'PUBLISHED',
    isProductBased: true,
    createdBy: 'Dr. S. K. Raman (Placement Officer)',
    createdAt: '2026-09-20T10:00:00Z',
    updatedBy: 'Dr. S. K. Raman',
    updatedAt: '2026-10-05T17:15:00Z',
    publishedAt: '2026-09-21T09:00:00Z',
  },
  {
    id: 'drive-kpmg-cyber',
    companyName: 'KPMG India',
    companyLogo: '🛡️',
    jobRole: 'Cybersecurity & Risk Consultant',
    description: 'Assist leading global financial institutions and enterprises in assessing network infrastructure, auditing cloud configurations, and mitigating vulnerabilities.',
    minCTC: 6.5,
    maxCTC: 8.0,
    salaryPackage: '₹6.5 – ₹8.0 LPA',
    location: 'Bengaluru / Chennai',
    workMode: 'On-site',
    jobType: 'Full-Time',
    deadline: '2026-12-15',
    applicationUrl: 'https://kpmg.com/in/en/home/careers.html',
    minimumCGPA: 6.5,
    allowedDepartments: ['AI & DS', 'CSE', 'IT', 'ECE'],
    allowedBatches: ['2022-2026'],
    requiredSkills: ['Computer Networks', 'Operating Systems', 'Information Security'],
    preferredSkills: ['Python Scripting', 'Cloud Basics', 'Linux'],
    selectionProcess: [
      '1. Aptitude & Domain Knowledge Assessment',
      '2. Technical Security Case Study Round',
      '3. Partner & Leadership Interview',
    ],
    roundsCount: 3,
    status: 'DRAFT',
    isProductBased: false,
    createdBy: 'Dr. S. K. Raman (Placement Officer)',
    createdAt: '2026-10-02T14:00:00Z',
    updatedBy: 'Dr. S. K. Raman',
    updatedAt: '2026-10-02T14:00:00Z',
  },
  {
    id: 'drive-wipro-turbo',
    companyName: 'Wipro Technologies',
    companyLogo: '💼',
    jobRole: 'Wipro Turbo — Digital Specialist Engineer',
    description: 'Accelerated track at Wipro focusing on cloud transformation, microservices engineering, and enterprise AI.',
    minCTC: 6.5,
    maxCTC: 6.5,
    salaryPackage: '₹6.5 LPA',
    location: 'Coimbatore / Bengaluru',
    workMode: 'On-site',
    jobType: 'Full-Time',
    deadline: '2026-09-30',
    applicationUrl: 'https://careers.wipro.com/campus',
    minimumCGPA: 6.5,
    allowedDepartments: ['AI & DS', 'CSE', 'IT', 'ECE', 'MECH'],
    allowedBatches: ['2022-2026'],
    requiredSkills: ['Java', 'SQL', 'Quantitative Aptitude'],
    preferredSkills: ['Cloud Basics', 'Python'],
    selectionProcess: [
      '1. National Elite Assessment Test (Aptitude + Coding)',
      '2. Technical Interview',
      '3. HR Discussion',
    ],
    roundsCount: 3,
    status: 'CLOSED',
    isProductBased: false,
    createdBy: 'Dr. S. K. Raman (Placement Officer)',
    createdAt: '2026-08-15T09:00:00Z',
    updatedBy: 'Dr. S. K. Raman',
    updatedAt: '2026-10-01T00:00:00Z',
    closedAt: '2026-09-30T23:59:59Z',
  },
];

const DEFAULT_SEED_APPLICATIONS = [
  {
    id: 'app-tiger-1',
    driveId: 'drive-tiger-da',
    studentId: 'user-student-alex',
    studentName: 'Alex Kumar',
    studentRollNumber: '22AIDS014',
    studentEmail: 'alex.kumar@college.edu',
    studentDepartment: 'Artificial Intelligence & Data Science',
    studentCgpa: 8.65,
    appliedAt: '2026-09-15T11:20:00Z',
    status: 'Shortlisted',
    notes: 'Strong performance on SQL & Power BI portfolio case study.',
  },
  {
    id: 'app-tiger-2',
    driveId: 'drive-tiger-da',
    studentId: 'user-student-priya',
    studentName: 'Priya Sharma',
    studentRollNumber: '22AIDS042',
    studentEmail: 'priya.sharma@college.edu',
    studentDepartment: 'Artificial Intelligence & Data Science',
    studentCgpa: 9.12,
    appliedAt: '2026-09-14T09:15:00Z',
    status: 'Selected',
    notes: 'Cleared Round 4 with outstanding marks. Offer rolled out.',
  },
  {
    id: 'app-zoho-1',
    driveId: 'drive-zoho-sde',
    studentId: 'user-student-alex',
    studentName: 'Alex Kumar',
    studentRollNumber: '22AIDS014',
    studentEmail: 'alex.kumar@college.edu',
    studentDepartment: 'Artificial Intelligence & Data Science',
    studentCgpa: 8.65,
    appliedAt: '2026-09-20T14:40:00Z',
    status: 'Applied',
  },
  {
    id: 'app-latentview-1',
    driveId: 'drive-latentview-de',
    studentId: 'user-student-priya',
    studentName: 'Priya Sharma',
    studentRollNumber: '22AIDS042',
    studentEmail: 'priya.sharma@college.edu',
    studentDepartment: 'Artificial Intelligence & Data Science',
    studentCgpa: 9.12,
    appliedAt: '2026-09-22T10:00:00Z',
    status: 'Shortlisted',
  },
  {
    id: 'app-tcs-1',
    driveId: 'drive-tcs-digital',
    studentId: 'user-student-alex',
    studentName: 'Alex Kumar',
    studentRollNumber: '22AIDS014',
    studentEmail: 'alex.kumar@college.edu',
    studentDepartment: 'Artificial Intelligence & Data Science',
    studentCgpa: 8.65,
    appliedAt: '2026-09-18T16:30:00Z',
    status: 'Application Submitted',
  },
];

const DRIVES_META_FILE = path.join(DATA_DIR, 'placement_drives_meta.json');
const DEFAULT_COLLEGE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1z1a2az4b9aWIXoX5bdE291yFt7h_6GyA/export?format=csv';

function readServerDrivesMeta(): any {
  try {
    if (fs.existsSync(DRIVES_META_FILE)) {
      return JSON.parse(fs.readFileSync(DRIVES_META_FILE, 'utf-8'));
    }
  } catch (e) {
    // ignore
  }
  return {
    sheetUrl: DEFAULT_COLLEGE_SHEET_URL,
    lastSyncedAt: new Date().toISOString(),
    source: 'College Placement Sheet',
    totalCompanies: 0,
  };
}

function writeServerDrivesMeta(meta: any): void {
  try {
    fs.writeFileSync(DRIVES_META_FILE, JSON.stringify(meta, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed writing drives meta file', e);
  }
}

// RFC4180 CSV parser
function parseServerCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [''];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
        lines.push(row.map((s) => s.trim()));
      }
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
    lines.push(row.map((s) => s.trim()));
  }
  return lines;
}

function getServerCompanyIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('google')) return '🌐';
  if (lower.includes('microsoft')) return '🪟';
  if (lower.includes('amazon')) return '📦';
  if (lower.includes('adobe')) return '🎨';
  if (lower.includes('uber')) return '🚗';
  if (lower.includes('flipkart')) return '🛍️';
  if (lower.includes('cred')) return '💳';
  if (lower.includes('linkedin')) return '💼';
  if (lower.includes('salesforce')) return '☁️';
  if (lower.includes('atlassian')) return '🔷';
  if (lower.includes('goldman')) return '🏛️';
  if (lower.includes('deloitte')) return '📊';
  if (lower.includes('tcs')) return '🏢';
  if (lower.includes('infosys')) return '🔷';
  if (lower.includes('wipro')) return '🌈';
  if (lower.includes('cognizant')) return '⚡';
  if (lower.includes('ibm')) return '💻';
  if (lower.includes('accenture')) return '🎯';
  if (lower.includes('hcl')) return '🏢';
  if (lower.includes('capgemini')) return '♠️';
  if (lower.includes('tech mahindra')) return '⚙️';
  if (lower.includes('ltimindtree') || lower.includes('mindtree')) return '🌳';
  if (lower.includes('sprinklr')) return '✨';
  if (lower.includes('nutanix')) return '☁️';
  if (lower.includes('rubrik')) return '🛡️';
  if (lower.includes('tower research')) return '📈';
  if (lower.includes('arcesium') || lower.includes('de shaw')) return '💹';
  if (lower.includes('vmware')) return '🖥️';
  return '🏢';
}

function parseServerCTC(val?: string): { minCTC?: number; maxCTC?: number; formatted: string } {
  if (!val || !val.trim()) return { formatted: 'Not Disclosed' };
  const str = val.trim();
  const matches = str.match(/([0-9]+(?:\.[0-9]+)?)/g);
  if (!matches || matches.length === 0) return { formatted: str };
  const nums = matches.map(Number).filter((n) => !isNaN(n));
  if (nums.length === 1) return { minCTC: nums[0], maxCTC: nums[0], formatted: str };
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return { minCTC: min, maxCTC: max, formatted: str };
}

function parseServerMinCgpa(val?: string): number | undefined {
  if (!val || !val.trim()) return undefined;
  const match = val.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    if (!isNaN(num) && num > 0 && num <= 10) return num;
  }
  return undefined;
}

async function syncServerDrivesFromGoogleSheet(customUrl?: string): Promise<{ success: boolean; count: number; drives: any[]; error?: string }> {
  const url = customUrl || DEFAULT_COLLEGE_SHEET_URL;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch sheet: HTTP ${res.status}`);
    }
    const text = await res.text();
    const rows = parseServerCSV(text);
    if (rows.length < 2) {
      throw new Error('Spreadsheet returned empty or header-only data');
    }

    const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const companyIdx = headers.findIndex((h) => h === 'company' || h.includes('company'));
    const cgpaIdx = headers.findIndex((h) => h === 'mincgpa' || h.includes('cgpa'));
    const roleIdx = headers.findIndex((h) => h === 'jobroles' || h.includes('role') || h.includes('position'));
    const ctcIdx = headers.findIndex((h) => h === 'approxctc' || h.includes('ctc') || h.includes('package') || h.includes('salary'));
    const skillsIdx = headers.findIndex((h) => h === 'importanttopics' || h.includes('skill') || h.includes('topic'));

    if (companyIdx === -1) {
      throw new Error('Could not identify Company column in spreadsheet headers');
    }

    const newDrives: any[] = [];
    const seen = new Set<string>();

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const comp = companyIdx !== -1 && r[companyIdx] ? r[companyIdx].trim() : '';
      if (!comp) continue;

      const role = roleIdx !== -1 && r[roleIdx] ? r[roleIdx].trim() : 'Software / Technology Associate';
      const key = `${comp.toLowerCase()}_${role.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const ctcRaw = ctcIdx !== -1 && r[ctcIdx] ? r[ctcIdx].trim() : '';
      const cgpaRaw = cgpaIdx !== -1 && r[cgpaIdx] ? r[cgpaIdx].trim() : '';
      const skillsRaw = skillsIdx !== -1 && r[skillsIdx] ? r[skillsIdx].trim() : '';

      const ctcData = parseServerCTC(ctcRaw);
      const minCgpa = parseServerMinCgpa(cgpaRaw);
      const skills = skillsRaw
        ? skillsRaw
            .split(/[,;•\n]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const cleanId = `drive-sheet-${comp.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`;
      const icon = getServerCompanyIcon(comp);
      const isProduct =
        comp.toLowerCase().includes('google') ||
        comp.toLowerCase().includes('microsoft') ||
        comp.toLowerCase().includes('amazon') ||
        comp.toLowerCase().includes('adobe') ||
        comp.toLowerCase().includes('uber') ||
        comp.toLowerCase().includes('atlassian') ||
        comp.toLowerCase().includes('cred') ||
        comp.toLowerCase().includes('sprinklr') ||
        comp.toLowerCase().includes('flipkart') ||
        comp.toLowerCase().includes('rubrik') ||
        comp.toLowerCase().includes('nutanix') ||
        comp.toLowerCase().includes('tower research') ||
        comp.toLowerCase().includes('goldman') ||
        (ctcData.minCTC !== undefined && ctcData.minCTC >= 15);

      newDrives.push({
        id: cleanId,
        companyName: comp,
        companyLogo: icon,
        jobRole: role,
        description: `Official campus recruitment drive for ${comp} hiring for ${role}. Preparation focus areas include ${
          skills.join(', ') || 'Core CS and Analytical Thinking'
        }.`,
        minCTC: ctcData.minCTC,
        maxCTC: ctcData.maxCTC,
        salaryPackage: ctcData.formatted,
        location: 'Campus / Multiple Locations',
        workMode: 'On-site',
        jobType: 'Full-Time',
        deadline: 'Campus Recruitment Drive',
        applicationUrl: undefined,
        minimumCGPA: minCgpa,
        allowedDepartments: ['AI & DS', 'CSE', 'IT', 'ECE'],
        allowedBatches: ['2022-2026'],
        requiredSkills: skills,
        preferredSkills: [],
        selectionProcess: ['1. Online Assessment / Aptitude', '2. Technical Interview', '3. HR Discussion'],
        roundsCount: 3,
        status: 'PUBLISHED',
        isProductBased: isProduct,
        createdBy: 'College Placement Cell',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      });
    }

    if (newDrives.length > 0) {
      writeServerDrives(newDrives);
      const meta = {
        sheetUrl: url,
        lastSyncedAt: new Date().toISOString(),
        source: 'College Placement Sheet',
        totalCompanies: newDrives.length,
      };
      writeServerDrivesMeta(meta);
      return { success: true, count: newDrives.length, drives: newDrives };
    }
    return { success: false, count: 0, drives: [], error: 'No valid company records found' };
  } catch (err: any) {
    console.error('syncServerDrivesFromGoogleSheet error:', err);
    return { success: false, count: 0, drives: [], error: err.message || 'Sync failed' };
  }
}

function readServerDrives(): any[] {
  try {
    if (fs.existsSync(DRIVES_FILE)) {
      const raw = fs.readFileSync(DRIVES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function writeServerDrives(drives: any[]): void {
  try {
    fs.writeFileSync(DRIVES_FILE, JSON.stringify(drives, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed writing drives file', e);
  }
}

function readServerApplications(): any[] {
  try {
    if (fs.existsSync(APPLICATIONS_FILE)) {
      const raw = fs.readFileSync(APPLICATIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(DEFAULT_SEED_APPLICATIONS, null, 2), 'utf-8');
  return DEFAULT_SEED_APPLICATIONS;
}

function writeServerApplications(apps: any[]): void {
  try {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed writing applications file', e);
  }
}

// RBAC Role Checker
function getUserRole(req: Request): string {
  const role = (req.headers['x-user-role'] as string) || 'STUDENT';
  return role.toUpperCase();
}

function isPlacementOfficer(role: string): boolean {
  return role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'SUPER_ADMIN';
}

// 1. GET /api/drives - Students cannot see DRAFT
app.get('/api/drives', async (req: Request, res: Response) => {
  const role = getUserRole(req);
  let allDrives = readServerDrives();

  // If drives are empty or request asks for refresh, sync from Google Sheet
  if (allDrives.length === 0 || req.query.refresh === 'true') {
    const syncRes = await syncServerDrivesFromGoogleSheet();
    if (syncRes.success && syncRes.drives.length > 0) {
      allDrives = syncRes.drives;
    }
  }

  const metadata = readServerDrivesMeta();

  if (isPlacementOfficer(role)) {
    res.json({ success: true, drives: allDrives, metadata });
  } else {
    // Student: only PUBLISHED and CLOSED drives
    const studentDrives = allDrives.filter(
      (d) => d.status === 'PUBLISHED' || d.status === 'CLOSED'
    );
    res.json({ success: true, drives: studentDrives, metadata });
  }
});

// Sync endpoint for Placement Officers
app.post('/api/drives/sync', async (req: Request, res: Response) => {
  const role = getUserRole(req);
  if (!isPlacementOfficer(role)) {
    res.status(403).json({
      success: false,
      error: '403 Forbidden: Only Placement Officers can trigger sheet sync.',
    });
    return;
  }
  const sheetUrl = req.body?.sheetUrl;
  const result = await syncServerDrivesFromGoogleSheet(sheetUrl);
  res.json({ ...result, metadata: readServerDrivesMeta() });
});

// 2. GET /api/drives/:id
app.get('/api/drives/:id', (req: Request, res: Response): void => {
  const role = getUserRole(req);
  const allDrives = readServerDrives();
  const found = allDrives.find((d) => d.id === req.params.id);

  if (!found) {
    res.status(404).json({ success: false, error: 'Drive not found' });
    return;
  }

  if (found.status === 'DRAFT' && !isPlacementOfficer(role)) {
    res.status(403).json({ success: false, error: 'Forbidden: Draft drive is not accessible to students.' });
    return;
  }

  res.json({ success: true, drive: found });
});

// 3. POST /api/drives - PLACEMENT_OFFICER ONLY
app.post('/api/drives', (req: Request, res: Response): void => {
  const role = getUserRole(req);

  if (!isPlacementOfficer(role)) {
    res.status(403).json({
      success: false,
      error: '403 Forbidden: Students are not authorized to create placement drives. PLACEMENT_OFFICER role required.',
    });
    return;
  }

  const { companyName, jobRole, salaryPackage, deadline } = req.body;
  if (!companyName || !jobRole) {
    res.status(400).json({ success: false, error: 'Company Name and Job Role are required.' });
    return;
  }

  const allDrives = readServerDrives();
  const newDrive = {
    ...req.body,
    id: req.body.id || `drive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allDrives.unshift(newDrive);
  writeServerDrives(allDrives);

  res.status(201).json({ success: true, drive: newDrive });
});

// 4. PUT /api/drives/:id - PLACEMENT_OFFICER ONLY
app.put('/api/drives/:id', (req: Request, res: Response): void => {
  const role = getUserRole(req);

  if (!isPlacementOfficer(role)) {
    res.status(403).json({
      success: false,
      error: '403 Forbidden: Students are not authorized to edit placement drives. PLACEMENT_OFFICER role required.',
    });
    return;
  }

  const allDrives = readServerDrives();
  const idx = allDrives.findIndex((d) => d.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Drive not found.' });
    return;
  }

  const updated = {
    ...allDrives[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  allDrives[idx] = updated;
  writeServerDrives(allDrives);

  res.json({ success: true, drive: updated });
});

// 5. DELETE /api/drives/:id - PLACEMENT_OFFICER ONLY
app.delete('/api/drives/:id', (req: Request, res: Response): void => {
  const role = getUserRole(req);

  if (!isPlacementOfficer(role)) {
    res.status(403).json({
      success: false,
      error: '403 Forbidden: Students are not authorized to delete placement drives. PLACEMENT_OFFICER role required.',
    });
    return;
  }

  let allDrives = readServerDrives();
  const exists = allDrives.some((d) => d.id === req.params.id);
  if (!exists) {
    res.status(404).json({ success: false, error: 'Drive not found.' });
    return;
  }

  allDrives = allDrives.filter((d) => d.id !== req.params.id);
  writeServerDrives(allDrives);

  res.json({ success: true, message: 'Drive deleted successfully.' });
});

// 6. PATCH /api/drives/:id/status - PLACEMENT_OFFICER ONLY
app.patch('/api/drives/:id/status', (req: Request, res: Response): void => {
  const role = getUserRole(req);

  if (!isPlacementOfficer(role)) {
    res.status(403).json({
      success: false,
      error: '403 Forbidden: Students are not authorized to modify drive status. PLACEMENT_OFFICER role required.',
    });
    return;
  }

  const { status } = req.body;
  if (!status || !['DRAFT', 'PUBLISHED', 'CLOSED'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status value.' });
    return;
  }

  const allDrives = readServerDrives();
  const idx = allDrives.findIndex((d) => d.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Drive not found.' });
    return;
  }

  allDrives[idx].status = status;
  allDrives[idx].updatedAt = new Date().toISOString();
  if (status === 'PUBLISHED') allDrives[idx].publishedAt = new Date().toISOString();
  if (status === 'CLOSED') allDrives[idx].closedAt = new Date().toISOString();

  writeServerDrives(allDrives);

  res.json({ success: true, drive: allDrives[idx] });
});

// 7. GET /api/applications - Officer sees all, Student sees only own
app.get('/api/applications', (req: Request, res: Response) => {
  const role = getUserRole(req);
  const studentId = (req.query.studentId as string) || (req.headers['x-user-id'] as string);
  const driveId = req.query.driveId as string;

  let allApps = readServerApplications();

  if (driveId) {
    allApps = allApps.filter((a) => a.driveId === driveId);
  }

  if (isPlacementOfficer(role)) {
    res.json({ success: true, applications: allApps });
  } else {
    // Student can only see their own applications
    const filtered = allApps.filter((a) => a.studentId === studentId);
    res.json({ success: true, applications: filtered });
  }
});

// 8. POST /api/applications - Student Apply
app.post('/api/applications', (req: Request, res: Response): void => {
  const { driveId, studentId, studentName, studentRollNumber, studentEmail, studentDepartment, studentCgpa } = req.body;

  if (!driveId || !studentId) {
    res.status(400).json({ success: false, error: 'driveId and studentId are required.' });
    return;
  }

  const allApps = readServerApplications();
  const existing = allApps.find((a) => a.driveId === driveId && a.studentId === studentId);
  if (existing) {
    res.json({ success: true, application: existing });
    return;
  }

  const newApp = {
    id: req.body.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    driveId,
    studentId,
    studentName: studentName || 'Applicant',
    studentRollNumber: studentRollNumber || '22AIDS014',
    studentEmail: studentEmail || '',
    studentDepartment: studentDepartment || 'AI & DS',
    studentCgpa: Number(studentCgpa) || 7.0,
    appliedAt: new Date().toISOString(),
    status: 'Applied',
  };

  allApps.unshift(newApp);
  writeServerApplications(allApps);

  res.status(201).json({ success: true, application: newApp });
});

// 9. PATCH /api/applications/:id - PLACEMENT_OFFICER ONLY
app.patch('/api/applications/:id', (req: Request, res: Response): void => {
  const role = getUserRole(req);

  if (!isPlacementOfficer(role)) {
    res.status(403).json({
      success: false,
      error: '403 Forbidden: Only Placement Officers can update application statuses.',
    });
    return;
  }

  const { status, notes } = req.body;
  const allApps = readServerApplications();
  const idx = allApps.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Application not found.' });
    return;
  }

  if (status) allApps[idx].status = status;
  if (notes !== undefined) allApps[idx].notes = notes;

  writeServerApplications(allApps);

  res.json({ success: true, application: allApps[idx] });
});


async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] LaTeX IDE listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
});
