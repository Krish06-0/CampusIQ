import React from 'react';
import { History, Shield, Download, RefreshCw } from 'lucide-react';
import { getStoredAuditLogs } from '../services/storageService';

export const AuditLogsPage: React.FC = () => {
  const logs = getStoredAuditLogs();

  const handleExportCsv = () => {
    let csv = 'Timestamp,User,Role,Action,Entity,Entity ID,IP Address,Details\n';
    logs.forEach((l) => {
      csv += `"${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.entity}","${l.entityId}","${l.ipAddress}","${l.details || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkillGap_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              System Audit &amp; Security Logs
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Immutable Trace
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking authentication, resume extractions, placement drive modifications, and spreadsheet imports.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50 dark:bg-slate-800/50">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        log.userRole === 'STUDENT'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : log.userRole === 'PLACEMENT_ADMIN'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {log.userRole.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {log.entity} / {log.entityId}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs text-[11px] leading-relaxed">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
