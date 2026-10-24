import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronDown,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { PlacementDrive, DriveApplication, ApplicationStatus, User, UserRole } from '../../types';
import { fetchApplications, updateApplicationStatus } from '../../services/placementDriveService';
import { CandidateRecruiterReviewModal } from './CandidateRecruiterReviewModal';

interface ApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drive: PlacementDrive | null;
  currentUser: User;
  currentRole: UserRole;
}

export const ApplicationsModal: React.FC<ApplicationsModalProps> = ({
  isOpen,
  onClose,
  drive,
  currentUser,
  currentRole,
}) => {
  const [applications, setApplications] = useState<DriveApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [selectedAppForReview, setSelectedAppForReview] = useState<DriveApplication | null>(null);

  const loadData = async () => {
    setLoading(true);
    const apps = await fetchApplications(drive?.id, currentRole, undefined);
    setApplications(apps);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, drive?.id]);

  if (!isOpen) return null;

  const filteredApps = applications.filter((app) => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.studentName.toLowerCase().includes(q);
      const matchRoll = app.studentRollNumber.toLowerCase().includes(q);
      const matchEmail = app.studentEmail.toLowerCase().includes(q);
      const matchDept = app.studentDepartment.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchEmail && !matchDept) return false;
    }
    return true;
  });

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    await updateApplicationStatus(appId, newStatus, currentRole, currentUser);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-start justify-between shrink-0">
          <div>
            <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>APPLICANTS MANAGEMENT · {drive ? drive.companyName : 'All Drives'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {drive ? `${drive.jobRole} (${applications.length} Applications)` : `Total Applications (${applications.length})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, roll no, dept..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            {(['ALL', 'Applied', 'Shortlisted', 'Selected', 'Rejected'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filteredApps.length === 0 ? (
            <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No applications found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting the search or status filter.</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3.5 font-bold">Candidate</th>
                    <th className="p-3.5 font-bold">Roll Number</th>
                    <th className="p-3.5 font-bold">Department</th>
                    <th className="p-3.5 font-bold">CGPA</th>
                    <th className="p-3.5 font-bold">Applied Date</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{app.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{app.studentEmail}</div>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {app.studentRollNumber}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {app.studentDepartment}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {app.studentCgpa.toFixed(2)}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
                            app.status === 'Selected'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : app.status === 'Shortlisted'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                              : app.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAppForReview(app)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 font-bold text-[11px] border border-amber-500/20 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Review Candidate</span>
                        </button>

                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-mono">
            Showing {filteredApps.length} of {applications.length} applicants
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {selectedAppForReview && (
        <CandidateRecruiterReviewModal
          isOpen={!!selectedAppForReview}
          onClose={() => setSelectedAppForReview(null)}
          studentId={selectedAppForReview.studentId}
          studentRollNumber={selectedAppForReview.studentRollNumber}
          studentName={selectedAppForReview.studentName}
          studentDepartment={selectedAppForReview.studentDepartment}
          studentCgpa={selectedAppForReview.studentCgpa}
          driveId={drive?.id}
          companyName={drive?.companyName}
          jobRole={drive?.jobRole}
          requiredSkills={drive?.requiredSkills}
          preferredSkills={drive?.preferredSkills}
          minimumCGPA={drive?.minimumCGPA}
          allowedDepartments={drive?.allowedDepartments}
          currentUser={currentUser}
          currentRole={currentRole}
          onStatusUpdated={(newStatus) => {
            handleStatusChange(selectedAppForReview.id, newStatus as ApplicationStatus);
          }}
        />
      )}
    </div>
  );
};
