import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  Edit2,
  Trash2,
  ShieldAlert,
  Building2,
  Mail,
  BadgeCheck,
  RefreshCw,
  Eye,
  X,
  Send,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  StoredUserAccount,
  getStoredAccounts,
  createStaffAccount,
  updateStaffAccount,
  setStaffStatus,
  resetUserPassword,
} from '../services/authSecurityService';

export const StaffManagementPage: React.FC = () => {
  const { currentUser, refreshUsers } = useAuth();
  const [staffList, setStaffList] = useState<StoredUserAccount[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StoredUserAccount | null>(null);
  const [viewingStaff, setViewingStaff] = useState<StoredUserAccount | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    designation: 'Assistant Professor',
    department: 'Information Technology',
    status: 'ACTIVE' as 'ACTIVE' | 'INVITATION_PENDING' | 'VERIFICATION_PENDING',
    passwordPlain: 'CampusPass2026!',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadStaff = () => {
    const all = getStoredAccounts();
    const staff = all.filter((a) => a.role === 'STAFF');
    setStaffList(staff);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      employeeId: '',
      designation: 'Assistant Professor',
      department: 'Information Technology',
      status: 'ACTIVE',
      passwordPlain: 'CampusPass2026!',
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Staff name and institutional email are required.');
      return;
    }

    const res = await createStaffAccount({
      name: formData.name,
      email: formData.email,
      employeeId: formData.employeeId,
      designation: formData.designation,
      department: formData.department,
      status: formData.status,
      passwordPlain: formData.passwordPlain,
      createdBy: `${currentUser.name} (${currentUser.role})`,
    });

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setFormSuccess(res.message);
    loadStaff();
    refreshUsers();
    setTimeout(() => {
      setIsAddModalOpen(false);
      resetForm();
      showNotice(res.message, 'success');
    }, 1200);
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const res = updateStaffAccount(editingStaff.id, {
      name: editingStaff.name,
      email: editingStaff.email,
      employeeId: editingStaff.employeeId,
      designation: editingStaff.designation,
      department: editingStaff.department,
    });

    if (!res.success) {
      showNotice(res.message, 'error');
      return;
    }

    loadStaff();
    refreshUsers();
    setEditingStaff(null);
    showNotice(res.message, 'success');
  };

  const handleToggleStatus = (staff: StoredUserAccount) => {
    const nextStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = setStaffStatus(staff.id, nextStatus);
    if (res.success) {
      loadStaff();
      refreshUsers();
      showNotice(res.message, 'success');
    } else {
      showNotice(res.message, 'error');
    }
  };

  const handleResetPassword = async (staff: StoredUserAccount) => {
    const res = await resetUserPassword(staff.id, 'CampusPass2026!');
    if (res.success) {
      showNotice(res.message, 'success');
    } else {
      showNotice(res.message, 'error');
    }
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((s) => {
    if (deptFilter !== 'ALL' && s.department !== deptFilter) return false;
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.employeeId && s.employeeId.toLowerCase().includes(q)) ||
        (s.designation && s.designation.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const activeCount = staffList.filter((s) => s.status === 'ACTIVE').length;
  const pendingCount = staffList.filter(
    (s) => s.status === 'INVITATION_PENDING' || s.status === 'VERIFICATION_PENDING'
  ).length;
  const inactiveCount = staffList.filter((s) => s.status === 'INACTIVE').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notice */}
      {actionNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-bold animate-in fade-in slide-in-from-bottom-3 ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950 border-emerald-600 text-emerald-200'
              : 'bg-rose-950 border-rose-600 text-rose-200'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#090D16] via-[#0E1524] to-[#090D16] text-white shadow-xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>// CENTRALIZED ACCESS CONTROL &amp; STAFF DIRECTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage authenticated faculty mentors, department advisors, and placement coordinators.
            Every staff account is assigned the unified <code className="text-cyan-300 bg-white/10 px-1.5 py-0.5 rounded font-mono">STAFF</code> role
            granting multi-department student directory access.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Total Staff Members</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {staffList.length}
          </div>
          <div className="text-[10px] text-indigo-500 font-semibold mt-0.5">Across 4 Departments</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Active Accounts</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {activeCount}
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">Authorized for Sign-in</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Pending Activation</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] text-amber-500 font-semibold mt-0.5">Verification Pending</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Deactivated</div>
          <div className="text-2xl font-black text-slate-600 dark:text-slate-400 mt-1">
            {inactiveCount}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Access Suspended</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 cursor-pointer font-medium"
            >
              <option value="ALL">All Departments</option>
              <option value="Information Technology">Information Technology (IT)</option>
              <option value="Computer Science and Engineering">Computer Science &amp; Eng (CSE)</option>
              <option value="Artificial Intelligence & Data Science">AI &amp; Data Science (AI &amp; DS)</option>
              <option value="CSE (Artificial Intelligence & Machine Learning)">CSE (AI &amp; ML)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 cursor-pointer font-medium"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INVITATION_PENDING">Invitation Pending</option>
              <option value="VERIFICATION_PENDING">Verification Pending</option>
              <option value="INACTIVE">Deactivated</option>
            </select>

            <button
              onClick={loadStaff}
              title="Refresh staff records"
              className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50 dark:bg-white/[0.02]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Department &amp; Designation</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No staff records found matching the specified criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {staff.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 opacity-60" />
                        <span>{staff.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {staff.employeeId || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {staff.department || 'General'}
                      </div>
                      <div className="text-[10px] text-slate-400">{staff.designation}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                        {staff.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {staff.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                      {staff.status === 'INVITATION_PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>Invitation Pending</span>
                        </span>
                      )}
                      {staff.status === 'VERIFICATION_PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Clock className="w-3 h-3" />
                          <span>Email Verification Pending</span>
                        </span>
                      )}
                      {staff.status === 'INACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3 h-3" />
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingStaff(staff)}
                          title="View Staff Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEditingStaff(staff)}
                          title="Edit Staff Information"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleResetPassword(staff)}
                          title="Reset Password Access"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(staff)}
                          title={staff.status === 'ACTIVE' ? 'Deactivate Staff' : 'Activate Staff'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            staff.status === 'ACTIVE'
                              ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          {staff.status === 'ACTIVE' ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-[#0E1524] border border-white/[0.1] shadow-2xl p-6 text-white space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Add New Staff Member</h3>
                  <p className="text-[11px] text-slate-400">
                    Creates authenticated user record with unified role STAFF
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Staff Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. S. K. Nandhini"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nandhini.it@vcet.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    placeholder="EMP-IT-042"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Computer Science and Engineering">Computer Science &amp; Eng (CSE)</option>
                    <option value="Artificial Intelligence & Data Science">AI &amp; Data Science (AI &amp; DS)</option>
                    <option value="CSE (Artificial Intelligence & Machine Learning)">CSE (AI &amp; ML)</option>
                    <option value="Central Placement Cell">Central Placement Cell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Associate Professor / Class Mentor"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Account Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'ACTIVE' | 'INVITATION_PENDING' | 'VERIFICATION_PENDING',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="ACTIVE">Active (Immediate Login)</option>
                    <option value="INVITATION_PENDING">Invitation Pending</option>
                    <option value="VERIFICATION_PENDING">Email Verification Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    value={formData.passwordPlain}
                    onChange={(e) => setFormData({ ...formData, passwordPlain: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Staff Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-[#0E1524] border border-white/[0.1] shadow-2xl p-6 text-white space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Edit Staff Information</h3>
                  <p className="text-[11px] text-slate-400">{editingStaff.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={editingStaff.employeeId || ''}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, employeeId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={editingStaff.department || 'Information Technology'}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, department: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Computer Science and Engineering">Computer Science &amp; Eng (CSE)</option>
                    <option value="Artificial Intelligence & Data Science">AI &amp; Data Science (AI &amp; DS)</option>
                    <option value="CSE (Artificial Intelligence & Machine Learning)">CSE (AI &amp; ML)</option>
                    <option value="Central Placement Cell">Central Placement Cell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={editingStaff.designation || ''}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, designation: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Staff Details Drawer */}
      {viewingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-[#0E1524] border border-white/[0.1] shadow-2xl p-6 text-white space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm">Staff Account Credentials</h3>
              </div>
              <button
                onClick={() => setViewingStaff(null)}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="text-sm font-bold text-white">{viewingStaff.name}</div>
                <div className="text-[11px] font-mono text-cyan-400">{viewingStaff.email}</div>
                <div className="text-slate-400">{viewingStaff.designation} · {viewingStaff.department}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-500 block">Employee ID</span>
                  <strong className="text-white font-mono">{viewingStaff.employeeId || 'N/A'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-500 block">Unified Role</span>
                  <strong className="text-indigo-400 font-mono">{viewingStaff.role}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-500 block">Account Status</span>
                  <strong className="text-emerald-400">{viewingStaff.status}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-500 block">Auth Provider</span>
                  <strong className="text-slate-300 font-mono">{viewingStaff.authProvider}</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] text-slate-400 font-mono space-y-1">
                <div>Created: {new Date(viewingStaff.createdAt).toLocaleString()}</div>
                <div>Last Login: {viewingStaff.lastLogin ? new Date(viewingStaff.lastLogin).toLocaleString() : 'Pending first sign-in'}</div>
                <div>Created By: {viewingStaff.createdBy || 'System Administrator'}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingStaff(null)}
                className="px-4 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-bold text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
