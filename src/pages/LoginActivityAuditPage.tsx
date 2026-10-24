import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Clock,
  User,
  Key,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Building,
  GraduationCap,
  Activity,
  Laptop,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  AuthAuditLog,
  AuthAuditFilter,
  AuthAuditMetrics,
  UserRole,
} from '../types';
import {
  fetchAuthAuditLogs,
  fetchUserLoginHistory,
  downloadAuthAuditCsv,
} from '../services/authAuditService';

interface LoginActivityAuditPageProps {
  onNavigate?: (tab: string) => void;
}

export const LoginActivityAuditPage: React.FC<LoginActivityAuditPageProps> = ({ onNavigate }) => {
  const { currentRole, currentUser } = useAuth();

  // Authorization check: Only Placement Officers, Deans, Placement Admins, and Super Admins
  const isAuthorized =
    currentRole === 'PLACEMENT_OFFICER' ||
    currentRole === 'PLACEMENT_ADMIN' ||
    currentRole === 'DEAN' ||
    currentRole === 'SUPER_ADMIN' ||
    currentUser.email.toLowerCase().includes('placement') ||
    currentUser.email.toLowerCase().includes('principal') ||
    currentUser.email.toLowerCase().includes('admin');

  // Filter State
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all' | 'custom'>('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Data State
  const [logs, setLogs] = useState<AuthAuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [metrics, setMetrics] = useState<AuthAuditMetrics>({
    totalLogins: 0,
    uniqueAccounts: 0,
    loginsToday: 0,
    failedAttempts: 0,
    recentActivityCount: 0,
    lastLoginMap: {},
    byRole: {},
    byDepartment: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Account History Drawer Modal State
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<{
    userId: string;
    userName?: string;
  } | null>(null);
  const [userHistoryData, setUserHistoryData] = useState<any | null>(null);
  const [isLoadingUserHistory, setIsLoadingUserHistory] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  // Load audit logs from server
  const loadLogs = async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    setErrorMessage(null);

    const filter: AuthAuditFilter = {
      dateRange,
      startDate: dateRange === 'custom' ? startDate : undefined,
      endDate: dateRange === 'custom' ? endDate : undefined,
      role: roleFilter,
      department: deptFilter,
      batch: batchFilter,
      status: statusFilter,
      search: searchQuery,
      page: currentPage,
      limit: pageSize,
    };

    const result = await fetchAuthAuditLogs(filter, currentRole, currentUser.id);

    if (result.success) {
      setLogs(result.logs);
      setTotalLogs(result.total);
      setTotalPages(result.totalPages);
      setMetrics(result.metrics);
    } else {
      setErrorMessage(result.error || 'Failed to retrieve audit records.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [
    dateRange,
    startDate,
    endDate,
    roleFilter,
    deptFilter,
    batchFilter,
    statusFilter,
    currentPage,
    pageSize,
  ]);

  // Handle search submission or debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadLogs();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch individual account history
  const handleOpenUserHistory = async (userId: string, userName?: string) => {
    setSelectedUserForHistory({ userId, userName });
    setIsLoadingUserHistory(true);
    setUserHistoryData(null);

    const res = await fetchUserLoginHistory(userId, currentRole, currentUser.id);
    if (res.success && res.history) {
      setUserHistoryData(res.history);
    } else {
      setUserHistoryData(null);
    }
    setIsLoadingUserHistory(false);
  };

  // Export CSV
  const handleExportCsv = async () => {
    setIsExporting(true);
    const filter: AuthAuditFilter = {
      dateRange,
      startDate: dateRange === 'custom' ? startDate : undefined,
      endDate: dateRange === 'custom' ? endDate : undefined,
      role: roleFilter,
      department: deptFilter,
      batch: batchFilter,
      status: statusFilter,
      search: searchQuery,
    };

    const res = await downloadAuthAuditCsv(filter, currentRole);
    if (res.success && res.blob) {
      const url = URL.createObjectURL(res.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MAX_Placement_Auth_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      alert(`Export error: ${res.error || 'Failed to generate report'}`);
    }
    setIsExporting(false);
  };

  const handleCopySession = (sessionId: string) => {
    navigator.clipboard.writeText(sessionId);
    setCopiedSessionId(sessionId);
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  const formatIST = (timestampStr: string) => {
    try {
      const date = new Date(timestampStr);
      if (isNaN(date.getTime())) return timestampStr;
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(date) + ' IST';
    } catch {
      return timestampStr;
    }
  };

  // Helper for role styling
  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'STUDENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'STAFF':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'PLACEMENT_OFFICER':
      case 'PLACEMENT_ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'DEAN':
      case 'SUPER_ADMIN':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'SYSTEM_ADMIN':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // 403 Forbidden state for unauthorized accounts (students/standard staff)
  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          403 — Unauthorized Access
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The <strong>Login Activity &amp; Audit Logs</strong> module is restricted to authorized
          Placement Officers, Deans, and Institutional Administrators. Student and unauthorized staff
          accounts cannot inspect authentication logs.
        </p>
        <div className="mt-6">
          <button
            onClick={() => onNavigate && onNavigate('student-dashboard')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/80">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Login Activity &amp; Audit Logs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Server Authoritative
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-3xl">
            Real-time institutional authentication audit trail. Monitor student and staff logins,
            inspect failed attempts, track active sessions, and verify security compliance across VCET departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center"
            title="Refresh logs from server"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
          <button
            onClick={handleExportCsv}
            disabled={isExporting || totalLogs === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center gap-2 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Login Report (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Database-Derived Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Logins */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Logins</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalLogins.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">In selected filter scope</div>
        </div>

        {/* Unique Accounts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Unique Accounts</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.uniqueAccounts.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Distinct active users</div>
        </div>

        {/* Logins Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Logins Today</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.loginsToday.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Indian Standard Time</div>
        </div>

        {/* Failed Attempts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Failed Attempts</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.failedAttempts.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-500 font-medium mt-1">
            {metrics.failedAttempts > 0 ? 'Requires observation' : 'Zero auth anomalies'}
          </div>
        </div>

        {/* Recent Activity (24h) */}
        <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Recent Activity</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.recentActivityCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-500 mt-1">Events in past 24 hours</div>
        </div>
      </div>

      {/* Multi-Criteria Filters Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Filter className="w-4 h-4 text-purple-600" />
            <span>Audit Query Filters</span>
          </div>
          <button
            onClick={() => {
              setDateRange('7days');
              setRoleFilter('ALL');
              setDeptFilter('ALL');
              setBatchFilter('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Date Range Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Date Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Account Role */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Account Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="STAFF">Faculty / Staff</option>
              <option value="PLACEMENT_OFFICER">Placement Officer</option>
              <option value="DEAN">Dean / Principal</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Artificial Intelligence & Data Science">AI &amp; DS</option>
              <option value="Computer Science and Engineering">CSE</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics and Communication Engineering">ECE</option>
              <option value="Electrical and Electronics Engineering">EEE</option>
              <option value="Mechanical Engineering">Mechanical</option>
              <option value="Civil Engineering">Civil</option>
              <option value="Placement Cell">Placement Cell</option>
              <option value="Administration">Administration</option>
            </select>
          </div>

          {/* Student Batch */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Student Batch
            </label>
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Batches</option>
              <option value="2026">Batch 2026 (Final Year)</option>
              <option value="2025">Batch 2025</option>
              <option value="2027">Batch 2027</option>
            </select>
          </div>

          {/* Auth Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Auth Outcome
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'ALL' | 'SUCCESS' | 'FAILURE');
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="SUCCESS">Success Only</option>
              <option value="FAILURE">Failed Only</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Search Accounts
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, Reg No, Email..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {dateRange === 'custom' && (
          <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-900 dark:text-white"
            />
            <span className="text-xs text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login History Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Authentication Activity Records
            </h2>
            <span className="text-xs text-slate-400">({totalLogs.toLocaleString()} total logged events)</span>
          </div>
          <div className="text-xs text-slate-400">
            Showing Page {currentPage} of {Math.max(1, totalPages)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50 dark:bg-slate-800/60">
                <th className="py-3 px-4 font-semibold">Timestamp (IST)</th>
                <th className="py-3 px-4 font-semibold">User / Identifier</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Department &amp; Batch</th>
                <th className="py-3 px-4 font-semibold">Result</th>
                <th className="py-3 px-4 font-semibold">Auth Method</th>
                <th className="py-3 px-4 font-semibold">Session ID</th>
                <th className="py-3 px-4 font-semibold">Session Status / Logout</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                      <span>Querying institutional audit database...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No authentication events found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status === 'SUCCESS';
                  const isFailure = log.status === 'FAILURE';
                  const isSessionActive = log.sessionStatus === 'ACTIVE';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-800 dark:text-slate-200">
                          {formatIST(log.timestamp)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {log.timestamp.slice(0, 19).replace('T', ' ')} UTC
                        </div>
                      </td>

                      {/* User Name & Register No */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{log.userName || 'Not recorded'}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[180px]">
                          {log.email}
                        </div>
                        {log.registerNumber ? (
                          <div className="mt-0.5 inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Reg: {log.registerNumber}
                          </div>
                        ) : null}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadge(
                            log.role
                          )}`}
                        >
                          {log.role}
                        </span>
                      </td>

                      {/* Department & Batch */}
                      <td className="py-3 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {log.department || 'Not recorded'}
                        </div>
                        {log.batch && (
                          <div className="text-[10px] text-slate-400">
                            Batch {log.batch} {log.classCode ? `(${log.classCode})` : ''}
                          </div>
                        )}
                      </td>

                      {/* Result */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Success
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <XCircle className="w-3 h-3" />
                              Failure
                            </span>
                            {log.failureReason && (
                              <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 max-w-[160px] truncate">
                                {log.failureReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Auth Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Key className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.authMethod || 'Email/Password'}</span>
                        </div>
                      </td>

                      {/* Session ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.sessionId ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {log.sessionId.slice(0, 10)}...
                            </span>
                            <button
                              onClick={() => handleCopySession(log.sessionId!)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                              title="Copy Session ID"
                            >
                              {copiedSessionId === log.sessionId ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not recorded</span>
                        )}
                      </td>

                      {/* Session Status / Logout Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.sessionStatus === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Active Session
                          </span>
                        ) : log.logoutTimestamp ? (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              Logged Out
                            </div>
                            <div className="text-[10px] font-mono">
                              {formatIST(log.logoutTimestamp)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            {log.sessionStatus || 'Completed'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {log.userId ? (
                          <button
                            onClick={() => handleOpenUserHistory(log.userId!, log.userName)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 transition-colors"
                          >
                            Account History
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-slate-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-slate-400">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalLogs)} of {totalLogs}
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-900 dark:text-white">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Account-Specific Login History Drawer / Modal */}
      {selectedUserForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Account Login Timeline &amp; History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive audit trail for {selectedUserForHistory.userName || selectedUserForHistory.userId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForHistory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {isLoadingUserHistory ? (
                <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                  <span>Loading account historical events...</span>
                </div>
              ) : !userHistoryData ? (
                <div className="text-center py-8 text-sm text-slate-400">
                  No individual history records found for this account ID.
                </div>
              ) : (
                <>
                  {/* Account Summary Strip */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Account Name</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {userHistoryData.accountInfo?.userName}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Identifier / Email</div>
                      <div className="font-medium text-slate-700 dark:text-slate-300 truncate mt-0.5">
                        {userHistoryData.accountInfo?.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Role &amp; Department</div>
                      <div className="font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                        {userHistoryData.accountInfo?.role} • {userHistoryData.accountInfo?.department || 'VCET'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Last Successful Login</div>
                      <div className="font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {userHistoryData.lastSuccessfulLogin
                          ? formatIST(userHistoryData.lastSuccessfulLogin)
                          : 'No successful logins yet'}
                      </div>
                    </div>
                  </div>

                  {/* Summary Counts */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                        Total Successful Logins
                      </div>
                      <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                        {userHistoryData.totalSuccessfulLogins}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50/50 dark:bg-rose-950/20">
                      <div className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                        Total Failed Attempts
                      </div>
                      <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">
                        {userHistoryData.totalFailedAttempts}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 col-span-2 sm:col-span-1">
                      <div className="text-[11px] font-semibold text-purple-800 dark:text-purple-300">
                        Recorded Session Events
                      </div>
                      <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">
                        {userHistoryData.allEvents?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Events List */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Chronological Authentication Trail
                    </h4>
                    <div className="space-y-2">
                      {userHistoryData.allEvents?.map((evt: AuthAuditLog) => (
                        <div
                          key={evt.id}
                          className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            {evt.status === 'SUCCESS' ? (
                              <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mt-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="p-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 mt-0.5">
                                <XCircle className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{evt.eventType.replace('_', ' ')}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  via {evt.authMethod}
                                </span>
                              </div>
                              {evt.failureReason && (
                                <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                                  Reason: {evt.failureReason}
                                </div>
                              )}
                              {evt.details && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {evt.details}
                                </div>
                              )}
                              {evt.logoutTimestamp && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Logged out at {formatIST(evt.logoutTimestamp)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                              {formatIST(evt.timestamp)}
                            </div>
                            {evt.sessionId && (
                              <div className="font-mono text-[10px] text-slate-400">
                                Sess: {evt.sessionId.slice(0, 8)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setSelectedUserForHistory(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
