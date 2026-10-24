import { AuthAuditLog, AuthAuditFilter, AuthAuditMetrics, UserRole } from '../types';

/**
 * Client Service for Placement Officer Login Activity & Audit Logs
 * Communicates with server-authoritative backend endpoints in server.ts
 */

export async function recordServerAuthEvent(eventData: {
  userId?: string;
  userName?: string;
  email?: string;
  registerNumber?: string;
  role?: string;
  department?: string;
  batch?: string;
  classCode?: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SESSION_EXPIRED' | 'ACCOUNT_ACTIVATED' | 'ACCOUNT_DEACTIVATED';
  status: 'SUCCESS' | 'FAILURE';
  authMethod: 'Email/Password' | 'Register Number/Password' | 'Google OAuth' | 'Institutional SSO';
  failureReason?: string;
  sessionId?: string;
  details?: string;
}): Promise<{ success: boolean; eventId?: string }> {
  try {
    const res = await fetch('/api/auth/record-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) {
      console.warn(`[Audit Server] Failed to record auth event: ${res.statusText}`);
      return { success: false };
    }
    const data = await res.json();
    return { success: true, eventId: data.eventId };
  } catch (err) {
    console.error('[Audit Server] Error posting auth event:', err);
    return { success: false };
  }
}

export async function fetchAuthAuditLogs(
  filter: AuthAuditFilter,
  callerRole: string,
  callerId?: string
): Promise<{
  success: boolean;
  logs: AuthAuditLog[];
  total: number;
  page: number;
  totalPages: number;
  metrics: AuthAuditMetrics;
  error?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (filter.dateRange) params.append('dateRange', filter.dateRange);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.role && filter.role !== 'ALL') params.append('role', filter.role);
    if (filter.department && filter.department !== 'ALL') params.append('department', filter.department);
    if (filter.batch && filter.batch !== 'ALL') params.append('batch', filter.batch);
    if (filter.status && filter.status !== 'ALL') params.append('status', filter.status);
    if (filter.search && filter.search.trim()) params.append('search', filter.search.trim());
    if (filter.page) params.append('page', String(filter.page));
    if (filter.limit) params.append('limit', String(filter.limit));

    const res = await fetch(`/api/auth/audit-logs?${params.toString()}`, {
      headers: {
        'x-user-role': callerRole,
        ...(callerId ? { 'x-user-id': callerId } : {}),
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        logs: [],
        total: 0,
        page: 1,
        totalPages: 1,
        metrics: {
          totalLogins: 0,
          uniqueAccounts: 0,
          loginsToday: 0,
          failedAttempts: 0,
          recentActivityCount: 0,
          lastLoginMap: {},
          byRole: {},
          byDepartment: {},
        },
        error: errData.error || `Error ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      logs: data.logs || [],
      total: data.total || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 1,
      metrics: data.metrics || {
        totalLogins: 0,
        uniqueAccounts: 0,
        loginsToday: 0,
        failedAttempts: 0,
        recentActivityCount: 0,
        lastLoginMap: {},
        byRole: {},
        byDepartment: {},
      },
    };
  } catch (err: any) {
    console.error('Error fetching auth audit logs:', err);
    return {
      success: false,
      logs: [],
      total: 0,
      page: 1,
      totalPages: 1,
      metrics: {
        totalLogins: 0,
        uniqueAccounts: 0,
        loginsToday: 0,
        failedAttempts: 0,
        recentActivityCount: 0,
        lastLoginMap: {},
        byRole: {},
        byDepartment: {},
      },
      error: err.message,
    };
  }
}

export async function fetchUserLoginHistory(
  targetUserId: string,
  callerRole: string,
  callerId?: string
): Promise<{
  success: boolean;
  history?: {
    accountInfo: {
      userId: string;
      userName: string;
      email: string;
      registerNumber?: string;
      role: UserRole;
      department?: string;
      batch?: string;
    };
    lastSuccessfulLogin: string | null;
    totalSuccessfulLogins: number;
    totalFailedAttempts: number;
    successfulLogins: AuthAuditLog[];
    failedAttempts: AuthAuditLog[];
    sessionEvents: AuthAuditLog[];
    allEvents: AuthAuditLog[];
  };
  error?: string;
}> {
  try {
    const res = await fetch(`/api/auth/audit-logs/user/${encodeURIComponent(targetUserId)}`, {
      headers: {
        'x-user-role': callerRole,
        ...(callerId ? { 'x-user-id': callerId } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { success: true, history: data.history };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function downloadAuthAuditCsv(
  filter: AuthAuditFilter,
  callerRole: string
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (filter.dateRange) params.append('dateRange', filter.dateRange);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.role && filter.role !== 'ALL') params.append('role', filter.role);
    if (filter.department && filter.department !== 'ALL') params.append('department', filter.department);
    if (filter.batch && filter.batch !== 'ALL') params.append('batch', filter.batch);
    if (filter.status && filter.status !== 'ALL') params.append('status', filter.status);
    if (filter.search && filter.search.trim()) params.append('search', filter.search.trim());

    const res = await fetch(`/api/auth/audit-logs/export?${params.toString()}`, {
      headers: {
        'x-user-role': callerRole,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || `Export failed: HTTP ${res.status}` };
    }

    const blob = await res.blob();
    return { success: true, blob };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
