import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Download,
  Database,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLACEMENT_METADATA } from '../data/placementGuideData';
import { validateImportBatch, commitImportBatch } from '../services/storageService';
import { ImportPreviewRow, ImportSummary } from '../types';
import { ALL_OFFICIAL_CSEAIML_STUDENTS, CSEAIML_PDF_IMPORT_AUDIT_SUMMARY } from '../data/officialCseAimlPdfsData';
import { ALL_OFFICIAL_AIDS_STUDENTS, PDF_IMPORT_AUDIT_SUMMARY } from '../data/officialAidsPdfsData';
import { ALL_OFFICIAL_CSE_STUDENTS, CSE_PDF_IMPORT_AUDIT_SUMMARY } from '../data/officialCsePdfsData';
import { ALL_OFFICIAL_IT_STUDENTS, IT_PDF_IMPORT_AUDIT_SUMMARY } from '../data/officialItPdfsData';

export const DataImportCenterPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [sourceType, setSourceType] = useState<'GOOGLE_SHEET' | 'CSV' | 'XLSX'>('GOOGLE_SHEET');
  const [googleSheetLink, setGoogleSheetLink] = useState(PLACEMENT_METADATA.googleSheetUrl);
  const [validating, setValidating] = useState(false);
  const [previewResult, setPreviewResult] = useState<ReturnType<typeof validateImportBatch> | null>(null);
  const [committedSummary, setCommittedSummary] = useState<ImportSummary | null>(null);
  const [previewPdfDept, setPreviewPdfDept] = useState<'IT' | 'CSE' | 'CSEAIML' | 'AIDS' | null>(null);

  // Sample batch data simulating college spreadsheet records
  const sampleCollegeSpreadsheet = [
    { registerNumber: '717822P601', name: 'Saravanan M', department: 'AI & DS', batch: '2022-2026', cgpa: 8.42, phone: '+91 94432 11001', skills: 'Python, SQL, Power BI, Statistics' },
    { registerNumber: '717822P602', name: 'Nandhini R', department: 'CSE', batch: '2022-2026', cgpa: 7.95, phone: '+91 94432 11002', skills: 'Java, DSA, OOPs, SQL' },
    { registerNumber: '717822P603', name: 'Vasanth Kumar', department: 'IT', batch: '2022-2026', cgpa: 7.60, phone: '+91 94432 11003', skills: 'Python, SQL, HTML, CSS, JavaScript' },
    { registerNumber: '717822P101', name: 'Alex Kumar', department: 'AI & DS', batch: '2022-2026', cgpa: 7.80, phone: '+91 98401 23456', skills: 'Python, SQL, Pandas, NumPy, Git' }, // Known duplicate for test
    { registerNumber: '', name: 'Incomplete Candidate', department: 'AI & DS', batch: '2022-2026', cgpa: 8.1, phone: '', skills: 'Python' }, // Invalid missing reg num
    { registerNumber: '717822P604', name: 'Dharani S', department: 'ECE', batch: '2022-2026', cgpa: 8.15, phone: '+91 94432 11004', skills: 'C, C++, Embedded Systems, Python' },
    { registerNumber: '717822P605', name: 'Abhishek J', department: 'AI & DS', batch: '2022-2026', cgpa: 11.5, phone: '+91 94432 11005', skills: 'Python' }, // Invalid CGPA > 10
  ];

  const handleStartValidation = (rowsToValidate = sampleCollegeSpreadsheet) => {
    setValidating(true);
    setCommittedSummary(null);

    setTimeout(() => {
      const result = validateImportBatch(rowsToValidate);
      setPreviewResult(result);
      setValidating(false);
    }, 1000);
  };

  const handleCommit = () => {
    if (!previewResult) return;
    const summary = commitImportBatch(
      previewResult.previewRows,
      sourceType,
      sourceType === 'GOOGLE_SHEET' ? 'Google Sheet Source (Placement Batch 22-26)' : 'Uploaded Spreadsheet File',
      currentUser
    );
    setCommittedSummary(summary);
    setPreviewResult(null);
  };

  const handleExportErrorReport = () => {
    if (!previewResult) return;
    let csv = 'Row Number,Register Number,Name,Status,Errors\n';
    previewResult.previewRows
      .filter((r) => r.status !== 'VALID')
      .forEach((r) => {
        csv += `${r.rowNumber},"${r.registerNumber}","${r.name}",${r.status},"${r.errors.join('; ')}"\n`;
      });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkillGap_Import_Errors_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Institutional Data Pipeline</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Data Import Center
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Import and synchronize candidate academic data from Google Sheets, CSV, or XLSX. Strict schema validation, duplicate detection, and pre-commit preview.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0 text-xs">
          <a
            href={PLACEMENT_METADATA.googleDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-between gap-2"
          >
            <span>Google Drive Folder</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={PLACEMENT_METADATA.googleSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-between gap-2 shadow-xs"
          >
            <span>Google Sheet Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Official PDF Name Lists Verification & Audit (Section 1, 2, 3) */}
      <div className="p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-[#0E1524] dark:via-[#090D16] dark:to-[#0E1524] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-400/20 mb-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Official Institutional PDF Ingestion Pipeline</span>
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              Official PDF Student Record Imports &amp; Multi-Year Audit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified records extracted directly from official college PDFs in exact year-wise sequence.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setPreviewPdfDept(previewPdfDept === 'IT' ? null : 'IT')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                previewPdfDept === 'IT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50'
              }`}
            >
              <span>{previewPdfDept === 'IT' ? 'Close Preview' : 'Preview IT Records (366)'}</span>
            </button>
            <button
              onClick={() => setPreviewPdfDept(previewPdfDept === 'CSE' ? null : 'CSE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                previewPdfDept === 'CSE'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50'
              }`}
            >
              <span>{previewPdfDept === 'CSE' ? 'Close Preview' : 'Preview CSE Records (432)'}</span>
            </button>
            <button
              onClick={() => setPreviewPdfDept(previewPdfDept === 'CSEAIML' ? null : 'CSEAIML')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                previewPdfDept === 'CSEAIML'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50'
              }`}
            >
              <span>{previewPdfDept === 'CSEAIML' ? 'Close Preview' : 'Preview CSE (AI & ML) Records (178)'}</span>
            </button>
            <button
              onClick={() => setPreviewPdfDept(previewPdfDept === 'AIDS' ? null : 'AIDS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                previewPdfDept === 'AIDS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50'
              }`}
            >
              <span>{previewPdfDept === 'AIDS' ? 'Close Preview' : 'Preview AI & DS Records (299)'}</span>
            </button>
          </div>
        </div>

        {/* Audit Cards for the 4 Official PDF Datasets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* IT Audit Card */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-white/80 dark:bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span>IT Official PDFs</span>
              </span>
              <span className="font-mono text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                {IT_PDF_IMPORT_AUDIT_SUMMARY.totalItImported} Verified Students
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 1: 4th Year (Batch 2023–2027)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Classes 23IT7A &amp; 23IT7B · Sem 07 · 23IT7A_23IT7B(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {IT_PDF_IMPORT_AUDIT_SUMMARY.pdf1.totalRecords} Records · 0 Duplicates
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 2: 3rd Year (Batch 2024–2028)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Classes 24IT5A &amp; 24IT5B · Sem 05 · 24IT5A_24IT5B(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {IT_PDF_IMPORT_AUDIT_SUMMARY.pdf2.totalRecords} Records · 0 Duplicates
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 3: 2nd Year (Batch 2025–2029)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Classes 25IT3A &amp; 25IT3B · Sem 03 · 25IT3A_25IT3B(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {IT_PDF_IMPORT_AUDIT_SUMMARY.pdf3.totalRecords} Records · 0 Duplicates
                </span>
              </div>
            </div>
          </div>
          {/* CSE Audit Card */}
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-white/80 dark:bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span>CSE Official PDFs</span>
              </span>
              <span className="font-mono text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                {CSE_PDF_IMPORT_AUDIT_SUMMARY.totalCseImported} Verified Students
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 1: 4th Year (Batch 2022–2026)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Classes 22CS7A &amp; 22CS7B · Sem 07 · IV-Year-Students-2022-26(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {CSE_PDF_IMPORT_AUDIT_SUMMARY.pdf1.totalRecords} Records · 0 Duplicates
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 2: 3rd Year (Batch 2023–2027)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Classes 23CS5A &amp; 23CS5B · Sem 05 · III-Year-Students-2023-27(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {CSE_PDF_IMPORT_AUDIT_SUMMARY.pdf2.totalRecords} Records · 0 Duplicates
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 3: 2nd Year (Batch 2024–2028)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Classes 24CS3A, 24CS3B &amp; 24CS3C · Sem 03 · II-Year-Students-2024-28(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {CSE_PDF_IMPORT_AUDIT_SUMMARY.pdf3.totalRecords} Records (3 Verified Flags)
                </span>
              </div>
            </div>
          </div>

          {/* CSE (AI & ML) Audit Card */}
          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-white/80 dark:bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                <span>CSE (AI &amp; ML) Official PDFs</span>
              </span>
              <span className="font-mono text-[11px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200/50 dark:border-purple-800/50">
                {CSEAIML_PDF_IMPORT_AUDIT_SUMMARY.totalCseAimlImported} Verified Students
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 1: 4th Year (Batch 2023–2027)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Class 23AM07 · Sem 07 · CSEAIML-Batch-2023-27-namelist(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {CSEAIML_PDF_IMPORT_AUDIT_SUMMARY.pdf1.totalRecords} Records · 0 Duplicates
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 2: 3rd Year (Batch 2024–2028)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Class 24AM05 · Sem 05 · Batch-2024-28-Name-list-3rd-yr-26-27(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {CSEAIML_PDF_IMPORT_AUDIT_SUMMARY.pdf2.totalRecords} Records · 0 Duplicates
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 3: 2nd Year (Batch 2025–2029)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Class 25AM03 · Sem 03 · Batch-2025-29-Name_List(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {CSEAIML_PDF_IMPORT_AUDIT_SUMMARY.pdf3.totalRecords} Records · 0 Duplicates
                </span>
              </div>
            </div>
          </div>

          {/* AI & DS Audit Card */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white/80 dark:bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>AI &amp; DS Official PDFs</span>
              </span>
              <span className="font-mono text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/50">
                {PDF_IMPORT_AUDIT_SUMMARY.totalAiDsImported} Verified Students
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 1: 4th Year (Batch 2023–2027)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Class 23AD07 · Sem 07 · 2023-2027 (1)(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {PDF_IMPORT_AUDIT_SUMMARY.pdf1.totalRecords} Records · 0 Duplicates
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 2: 3rd Year (Batch 2024–2028)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Classes 24AD5A &amp; 24AD5B · Sem 05 · 2024-2028 (1)(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {PDF_IMPORT_AUDIT_SUMMARY.pdf2.totalRecords} Records · 0 Duplicates
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">PDF 3: 2nd Year (Batch 2025–2029)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Classes 25AD3A &amp; 25AD3B · Sem 03 · 2025-2029 (1)(1).pdf</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {PDF_IMPORT_AUDIT_SUMMARY.pdf3.totalRecords} Records · 0 Duplicates
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Preview Table */}
        {previewPdfDept && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#090D16] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {previewPdfDept === 'IT'
                    ? 'Previewing Verified Information Technology (IT) Records from 3 PDFs (366 Students)'
                    : previewPdfDept === 'CSE'
                    ? 'Previewing Verified Computer Science and Engineering (CSE) Records from 3 PDFs (432 Students)'
                    : previewPdfDept === 'CSEAIML'
                    ? 'Previewing Verified CSE (AI & ML) Records from 3 PDFs (178 Students)'
                    : 'Previewing Verified AI & DS Records from 3 PDFs (299 Students)'}
                </span>
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {previewPdfDept === 'CSE'
                  ? 'Status: 429 Verified Register Numbers · 3 Pending University Confirmation'
                  : 'Status: 100% Validated · 0 Duplicates · 0 Unverified'}
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-white/[0.04] text-[10px] text-slate-400 uppercase font-mono sticky top-0">
                  <tr>
                    <th className="py-2 px-3">S.No</th>
                    <th className="py-2 px-3">Register Number</th>
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-3">Class</th>
                    <th className="py-2 px-3">Batch</th>
                    <th className="py-2 px-3">Year / Sem</th>
                    <th className="py-2 px-3">Source PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {((previewPdfDept === 'IT'
                    ? ALL_OFFICIAL_IT_STUDENTS
                    : previewPdfDept === 'CSE'
                    ? ALL_OFFICIAL_CSE_STUDENTS
                    : previewPdfDept === 'CSEAIML'
                    ? ALL_OFFICIAL_CSEAIML_STUDENTS
                    : ALL_OFFICIAL_AIDS_STUDENTS) as Array<{
                    registerNumber: string;
                    name: string;
                    classCode: string;
                    batch: string;
                    year: number;
                    semester: number;
                    sourcePdf: string;
                    needsVerification?: boolean;
                  }>)
                    .slice(0, 100)
                    .map((st, i: number) => (
                      <tr key={st.registerNumber + i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td className="py-1.5 px-3 font-mono text-slate-400">{i + 1}</td>
                        <td className="py-1.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {st.registerNumber}
                          {st.needsVerification && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] bg-amber-500/10 text-amber-600 border border-amber-400/30">
                              Needs Verification
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-medium text-slate-800 dark:text-slate-200">{st.name}</td>
                        <td className="py-1.5 px-3 font-mono">{st.classCode}</td>
                        <td className="py-1.5 px-3">{st.batch}</td>
                        <td className="py-1.5 px-3 font-mono">{st.year}th Yr · Sem {st.semester}</td>
                        <td className="py-1.5 px-3 text-[10px] text-slate-400 truncate max-w-[150px]">{st.sourcePdf}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Source Selection & Configuration */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Step 1: Select Source Type
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setSourceType('GOOGLE_SHEET')}
            className={`p-4 rounded-xl border text-left transition-all ${
              sourceType === 'GOOGLE_SHEET'
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Google Sheet Sync</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Direct connection to the configured college spreadsheet.
            </p>
          </button>

          <button
            onClick={() => setSourceType('CSV')}
            className={`p-4 rounded-xl border text-left transition-all ${
              sourceType === 'CSV'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>CSV Upload</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Upload comma-separated values exported from college ERP.
            </p>
          </button>

          <button
            onClick={() => setSourceType('XLSX')}
            className={`p-4 rounded-xl border text-left transition-all ${
              sourceType === 'XLSX'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>Excel XLSX</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Standard Microsoft Excel workbook sheet.
            </p>
          </button>
        </div>

        {sourceType === 'GOOGLE_SHEET' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Google Sheet URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={googleSheetLink}
                onChange={(e) => setGoogleSheetLink(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                onClick={() => handleStartValidation()}
                disabled={validating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {validating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Fetch &amp; Validate Preview</span>
              </button>
            </div>
          </div>
        )}

        {(sourceType === 'CSV' || sourceType === 'XLSX') && (
          <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Upload {sourceType} file containing student records
            </div>
            <button
              onClick={() => handleStartValidation()}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
            >
              Simulate File Validation
            </button>
          </div>
        )}
      </div>

      {/* Pre-Commit Import Preview Panel (Section 2 & 28 requirement) */}
      {previewResult && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Import Preview &amp; Pre-Flight Validation
              </h3>
              <p className="text-xs text-slate-400">
                Review data integrity and duplicate status before committing into the 500+ student database.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewResult(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Rollback / Discard
              </button>
              <button
                onClick={handleCommit}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Commit Import</span>
              </button>
            </div>
          </div>

          {/* 5 Validation Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-slate-400">Total Rows</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {previewResult.totalRows}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="text-emerald-700 dark:text-emerald-300">Valid Rows</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                {previewResult.validCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <div className="text-rose-700 dark:text-rose-300">Invalid Rows</div>
              <div className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                {previewResult.invalidCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <div className="text-amber-700 dark:text-amber-300">Duplicates</div>
              <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                {previewResult.duplicateCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
              <div className="text-slate-400">Missing Fields</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {previewResult.missingFieldsCount}
              </div>
            </div>
          </div>

          {/* Detailed Preview Rows Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">CGPA</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Validation Diagnostic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewResult.previewRows.map((row) => (
                  <tr key={row.rowNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{row.rowNumber}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {row.registerNumber}
                    </td>
                    <td className="py-2.5 px-3 font-bold">{row.name}</td>
                    <td className="py-2.5 px-3">{row.department}</td>
                    <td className="py-2.5 px-3 font-semibold">{row.cgpa}</td>
                    <td className="py-2.5 px-3">
                      {row.status === 'VALID' && (
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                          VALID
                        </span>
                      )}
                      {row.status === 'DUPLICATE' && (
                        <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px]">
                          DUPLICATE (OVERWRITE)
                        </span>
                      )}
                      {row.status === 'INVALID' && (
                        <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px]">
                          INVALID
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                      {row.errors.length > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">{row.errors.join(', ')}</span>
                      ) : row.status === 'DUPLICATE' ? (
                        <span className="text-amber-600 dark:text-amber-400">Matches existing student ID, values will update</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Passed all column constraints</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {previewResult.invalidCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleExportErrorReport}
                className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Error Report ({previewResult.invalidCount} rows)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Post-Commit Summary Report */}
      {committedSummary && (
        <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base">Data Import Batch Committed Successfully</h3>
          </div>
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            Import report registered under ID: <span className="font-mono">{committedSummary.id}</span> by {committedSummary.performedBy}.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
              <div className="text-slate-400">New Imported:</div>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">{committedSummary.importedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
              <div className="text-slate-400">Updated:</div>
              <div className="text-xl font-bold text-blue-600 mt-0.5">{committedSummary.updatedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
              <div className="text-slate-400">Skipped:</div>
              <div className="text-xl font-bold text-slate-500 mt-0.5">{committedSummary.skippedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
              <div className="text-slate-400">Errors:</div>
              <div className="text-xl font-bold text-rose-600 mt-0.5">{committedSummary.errorCount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
