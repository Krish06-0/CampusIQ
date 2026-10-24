import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Archive,
  Send,
  Users,
  AlertTriangle,
  Building2,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_STUDENT_PROFILE } from '../data/initialDatabase';
import { PlacementDrive, DriveStatus, ApplicationStatus } from '../types';
import {
  fetchDrives,
  deleteDrive,
  updateDriveStatus,
  getApplicationCounts,
} from '../services/placementDriveService';
import { DriveFormModal } from '../components/placement/DriveFormModal';
import { DriveDetailsModal } from '../components/placement/DriveDetailsModal';
import { ApplicationsModal } from '../components/placement/ApplicationsModal';
import { JobOpportunitiesPage } from './JobOpportunitiesPage';

interface PlacementOfficerPageProps {
  onNavigate?: (tab: string) => void;
}

export const PlacementOfficerPage: React.FC<PlacementOfficerPageProps> = ({ onNavigate }) => {
  const { currentUser, currentRole, currentStudent } = useAuth();

  const [viewMode, setViewMode] = useState<'OFFICER' | 'STUDENT_PREVIEW'>('OFFICER');
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DriveStatus>('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [driveToEdit, setDriveToEdit] = useState<PlacementDrive | null>(null);

  const [selectedDetailsDrive, setSelectedDetailsDrive] = useState<PlacementDrive | null>(null);
  const [selectedAppsDrive, setSelectedAppsDrive] = useState<PlacementDrive | null>(null);

  // Delete confirmation
  const [deletingDrive, setDeletingDrive] = useState<PlacementDrive | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const appCounts = getApplicationCounts();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDrives = async () => {
    setLoading(true);
    const data = await fetchDrives(currentRole, currentUser.id);
    setDrives(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDrives();
  }, [currentRole]);

  // Compute stats
  const activeCount = drives.filter((d) => d.status === 'PUBLISHED').length;
  const draftCount = drives.filter((d) => d.status === 'DRAFT').length;
  const closedCount = drives.filter((d) => d.status === 'CLOSED').length;
  const totalAppsCount = Object.values(appCounts).reduce((a, b) => a + b, 0);

  // Filter & Search
  const filteredDrives = drives.filter((drive) => {
    if (statusFilter !== 'ALL' && drive.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = drive.companyName.toLowerCase().includes(q);
      const matchRole = drive.jobRole.toLowerCase().includes(q);
      const matchLoc = drive.location.toLowerCase().includes(q);
      const matchDept = (drive.allowedDepartments || []).some((d) => d.toLowerCase().includes(q));
      const matchSkills = (drive.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
      if (!matchComp && !matchRole && !matchLoc && !matchDept && !matchSkills) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    setDriveToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (drive: PlacementDrive) => {
    setDriveToEdit(drive);
    setIsFormModalOpen(true);
  };

  const handleTogglePublish = async (drive: PlacementDrive) => {
    const nextStatus: DriveStatus = drive.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const res = await updateDriveStatus(drive.id, nextStatus, currentRole, currentUser);
    if (res.success && res.drive) {
      setDrives((prev) => prev.map((d) => (d.id === drive.id ? res.drive! : d)));
      showToast(
        nextStatus === 'PUBLISHED'
          ? `✓ Drive for ${drive.companyName} is now Published and visible to students.`
          : `✓ Drive for ${drive.companyName} unpublished to Draft (hidden from students).`
      );
    }
  };

  const handleCloseDrive = async (drive: PlacementDrive) => {
    const res = await updateDriveStatus(drive.id, 'CLOSED', currentRole, currentUser);
    if (res.success && res.drive) {
      setDrives((prev) => prev.map((d) => (d.id === drive.id ? res.drive! : d)));
      showToast(`✓ Drive for ${drive.companyName} is now Closed and archived.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDrive) return;
    setIsDeleting(true);
    const res = await deleteDrive(deletingDrive.id, currentRole, currentUser);
    setIsDeleting(false);
    if (res.success) {
      setDrives((prev) => prev.filter((d) => d.id !== deletingDrive.id));
      showToast(`✓ Placement drive for ${deletingDrive.companyName} deleted.`);
      setDeletingDrive(null);
    }
  };

  const handleFormSuccess = (updatedDrive: PlacementDrive) => {
    setDrives((prev) => {
      const exists = prev.some((d) => d.id === updatedDrive.id);
      if (exists) {
        return prev.map((d) => (d.id === updatedDrive.id ? updatedDrive : d));
      }
      return [updatedDrive, ...prev];
    });
    showToast(`✓ Placement drive ${driveToEdit ? 'updated' : 'created'} successfully.`);
  };

  if (viewMode === 'STUDENT_PREVIEW') {
    return (
      <div className="space-y-5 max-w-6xl mx-auto">
        <div className="p-4 sm:p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
                Student Perspective Preview
              </div>
              <div className="text-xs text-indigo-700/90 dark:text-indigo-300">
                Viewing placement opportunities exactly as candidates see them. Management controls (Create, Edit, Delete, Publish) are strictly hidden.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setViewMode('OFFICER')}
            className="px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm hover:scale-102"
          >
            ← Return to Officer Management
          </button>
        </div>
        <JobOpportunitiesPage />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Create Button */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>// CENTRAL RECRUITMENT CELL · OFFICER PORTAL</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            PLACEMENT MANAGEMENT
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Authoritative drive registry. Manage recruitment schedules, set eligibility parameters, publish drives to students, and review candidate applications in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('login-activity')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Login Activity &amp; Audit Logs</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setViewMode('STUDENT_PREVIEW')}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Preview Student View</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Create Placement Drive</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Active / Published</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {activeCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Visible to eligible students</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
            ✓
          </div>
        </div>

        <div className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Draft Drives</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {draftCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Hidden from students</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
            ⏳
          </div>
        </div>

        <div className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Closed / Archived</span>
            <div className="text-2xl font-black text-slate-600 dark:text-slate-400 mt-1">
              {closedCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Completed drives</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-lg">
            📁
          </div>
        </div>

        <div className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Total Applications</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {totalAppsCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Batch 2022-2026</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
            👥
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, role, skill, location..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'CLOSED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? `All (${drives.length})`
                : st === 'PUBLISHED'
                ? `Published (${activeCount})`
                : st === 'DRAFT'
                ? `Drafts (${draftCount})`
                : `Closed (${closedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Officer Management Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-4 font-bold">Company</th>
                <th className="p-4 font-bold">Job Role</th>
                <th className="p-4 font-bold">Package (CTC)</th>
                <th className="p-4 font-bold">Deadline</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Applications</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDrives.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No placement drives match the current query
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click "+ Create Placement Drive" to add your first recruitment opportunity.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDrives.map((drive) => {
                  const count = appCounts[drive.id] || 0;

                  return (
                    <tr
                      key={drive.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Company */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                            {drive.companyLogo || '🏢'}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{drive.companyName}</span>
                              {drive.isProductBased && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
                                  PROD
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {drive.location} • {drive.workMode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {drive.jobRole}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Min CGPA: {(drive.minimumCGPA ?? 7.0).toFixed(2)} • {drive.jobType}
                        </div>
                      </td>

                      {/* Package */}
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {drive.salaryPackage}
                      </td>

                      {/* Deadline */}
                      <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {drive.deadline}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
                            drive.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : drive.status === 'CLOSED'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              drive.status === 'PUBLISHED'
                                ? 'bg-emerald-500'
                                : drive.status === 'CLOSED'
                                ? 'bg-slate-400'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span>{drive.status}</span>
                        </span>
                      </td>

                      {/* Applications Count */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => setSelectedAppsDrive(drive)}
                          className="px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          title="Click to view all student applicants"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{count} Applications</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailsDrive(drive)}
                            title="View Full Drive Details"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(drive)}
                            title="Edit Placement Drive"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Publish / Draft */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(drive)}
                            title={drive.status === 'PUBLISHED' ? 'Unpublish to Draft' : 'Publish to Students'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              drive.status === 'PUBLISHED'
                                ? 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                                : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Close Drive */}
                          {drive.status !== 'CLOSED' && (
                            <button
                              type="button"
                              onClick={() => handleCloseDrive(drive)}
                              title="Close / Archive Drive"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeletingDrive(drive)}
                            title="Delete Placement Drive"
                            className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer audit summary */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 font-mono text-[11px]">
          <span>Institutional Drive Registry • Total: {drives.length} opportunities</span>
          <span>Logged in as: {currentUser.name} ({currentRole})</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Delete Placement Drive?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {deletingDrive.companyName} — {deletingDrive.jobRole}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                This action cannot be undone. All drive configurations and settings will be permanently removed.
              </p>
              {(appCounts[deletingDrive.id] || 0) > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Warning: This drive already has <strong>{appCounts[deletingDrive.id]} registered candidate applications</strong>. Strongly consider using <strong>Close Drive</strong> instead to preserve institutional applicant history.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingDrive(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Drive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <DriveFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        driveToEdit={driveToEdit}
        currentUser={currentUser}
        currentRole={currentRole}
        onSuccess={handleFormSuccess}
      />

      {/* Details View Modal */}
      <DriveDetailsModal
        isOpen={Boolean(selectedDetailsDrive)}
        onClose={() => setSelectedDetailsDrive(null)}
        drive={selectedDetailsDrive}
        student={currentStudent || INITIAL_STUDENT_PROFILE}
      />

      {/* Applications Modal */}
      <ApplicationsModal
        isOpen={Boolean(selectedAppsDrive)}
        onClose={() => setSelectedAppsDrive(null)}
        drive={selectedAppsDrive}
        currentUser={currentUser}
        currentRole={currentRole}
      />
    </div>
  );
};
