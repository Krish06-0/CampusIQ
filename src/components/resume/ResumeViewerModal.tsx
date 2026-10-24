import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ArrowLeft,
  Download,
  Trash2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  Eye,
  RotateCcw,
  Monitor,
} from 'lucide-react';
import {
  UploadedResumeRecord,
  downloadResumeFile,
  parseDataUrlOrBase64ToBytes,
  dataUrlToBlob,
} from '../../services/resumeStorageService';

// Ensure PDF.js worker is initialized with Vite asset URL
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } catch (e) {
    console.warn('[PDF.js Worker Setup]', e);
  }
}

interface ResumeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeRecord: UploadedResumeRecord | null;
  onReplaceResume?: () => void;
  onDeleteResume: () => void;
}

export const ResumeViewerModal: React.FC<ResumeViewerModalProps> = ({
  isOpen,
  onClose,
  resumeRecord,
  onReplaceResume,
  onDeleteResume,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<'canvas' | 'native'>('canvas');
  const [renderAttempt, setRenderAttempt] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const activeRenderTasksRef = useRef<any[]>([]);

  // Create & manage temporary Blob URL for native view & safe streaming
  useEffect(() => {
    if (!isOpen || !resumeRecord?.fileDataUrl) {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
        setActiveBlobUrl(null);
      }
      return;
    }

    let url = '';
    try {
      if (resumeRecord.fileDataUrl.startsWith('blob:')) {
        url = resumeRecord.fileDataUrl;
      } else if (resumeRecord.fileDataUrl.startsWith('data:')) {
        const blob = dataUrlToBlob(resumeRecord.fileDataUrl);
        url = URL.createObjectURL(blob);
      } else {
        url = resumeRecord.fileDataUrl;
      }
      setActiveBlobUrl(url);
    } catch (err) {
      console.warn('Failed to generate blob URL for resume:', err);
    }

    return () => {
      if (url && url.startsWith('blob:') && url !== resumeRecord?.fileDataUrl) {
        URL.revokeObjectURL(url);
      }
    };
  }, [isOpen, resumeRecord]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (activeBlobUrl && activeBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(activeBlobUrl);
      }
      // Cancel any ongoing PDF render tasks
      activeRenderTasksRef.current.forEach((task) => {
        try {
          task?.cancel?.();
        } catch {
          // ignore
        }
      });
      activeRenderTasksRef.current = [];
    };
  }, []);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeleteConfirm) {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPage(currentPage - 1);
      } else if (e.key === '+' || (e.ctrlKey && e.key === '=')) {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || (e.ctrlKey && e.key === '-')) {
        e.preventDefault();
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, totalPages, showDeleteConfirm]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 50));
  const handleZoomReset = () => setZoomLevel(100);

  const handleFitWidth = () => {
    if (!scrollContainerRef.current) return;
    const containerW = scrollContainerRef.current.clientWidth - 64;
    const standardA4Width = 595; // pt
    const ratio = Math.floor((containerW / standardA4Width) * 100);
    setZoomLevel(Math.min(Math.max(ratio, 60), 180));
  };

  const handleFitPage = () => {
    if (!scrollContainerRef.current) return;
    const containerH = scrollContainerRef.current.clientHeight - 80;
    const standardA4Height = 842; // pt
    const ratio = Math.floor((containerH / standardA4Height) * 100);
    setZoomLevel(Math.min(Math.max(ratio, 50), 140));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Navigate to specific page with smooth scrolling
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const targetElement = document.getElementById(`viewer-pdf-page-${page}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render all PDF pages
  const renderPdfDocument = useCallback(async () => {
    if (!resumeRecord?.fileDataUrl || !pagesContainerRef.current) return;

    // Check if it is a PDF file
    const isPdfFormat =
      resumeRecord.fileDataUrl.startsWith('data:application/pdf') ||
      resumeRecord.fileName.toLowerCase().endsWith('.pdf') ||
      resumeRecord.fileType?.toLowerCase().includes('pdf') ||
      resumeRecord.fileDataUrl.startsWith('blob:') ||
      resumeRecord.fileDataUrl.startsWith('/api/');

    if (!isPdfFormat) {
      setIsRendering(false);
      return;
    }

    // Cancel any ongoing tasks before starting a new render
    activeRenderTasksRef.current.forEach((t) => {
      try {
        t?.cancel?.();
      } catch {
        // ignore
      }
    });
    activeRenderTasksRef.current = [];

    try {
      setIsRendering(true);
      setRenderError(null);

      let bytes: Uint8Array;
      if (resumeRecord.fileDataUrl.startsWith('data:')) {
        bytes = parseDataUrlOrBase64ToBytes(resumeRecord.fileDataUrl);
      } else {
        const response = await fetch(resumeRecord.fileDataUrl);
        const arrayBuffer = await response.arrayBuffer();
        bytes = new Uint8Array(arrayBuffer);
      }

      // Verify basic PDF magic header (%PDF-)
      if (bytes.length < 5) {
        throw new Error('The resume file data is empty or too short to be a valid document.');
      }

      const loadingTask = pdfjsLib.getDocument({
        data: bytes,
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);

      const container = pagesContainerRef.current;
      if (!container) return;
      container.innerHTML = '';

      const scale = (zoomLevel / 100) * 1.5;
      const dpr = window.devicePixelRatio || 1;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: scale * dpr });

        const pageWrapper = document.createElement('div');
        pageWrapper.className =
          'relative bg-white shadow-2xl rounded-sm mb-8 overflow-hidden transition-all border border-slate-300 dark:border-slate-700/80 mx-auto';
        pageWrapper.id = `viewer-pdf-page-${pageNum}`;

        const canvas = document.createElement('canvas');
        canvas.className = 'block';
        const context = canvas.getContext('2d');

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const displayWidth = Math.floor(viewport.width / dpr);
        const displayHeight = Math.floor(viewport.height / dpr);
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        pageWrapper.style.width = `${displayWidth}px`;
        pageWrapper.style.height = `${displayHeight}px`;

        pageWrapper.appendChild(canvas);

        // Page watermark / badge
        const badge = document.createElement('div');
        badge.className =
          'absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-400 select-none bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs border border-slate-200/60';
        badge.innerText = `Page ${pageNum} of ${pdf.numPages}`;
        pageWrapper.appendChild(badge);

        container.appendChild(pageWrapper);

        if (context) {
          const renderTask = page.render({
            canvasContext: context,
            viewport,
            canvas,
          });
          activeRenderTasksRef.current.push(renderTask);
          await renderTask.promise;
        }
      }

      setIsRendering(false);
    } catch (err: unknown) {
      console.warn('[Resume Viewer PDF Render Warning]', err);
      const msg = err instanceof Error ? err.message : 'Failed to render PDF document';
      setRenderError(msg);
      setIsRendering(false);
    }
  }, [resumeRecord, zoomLevel]);

  useEffect(() => {
    if (isOpen && resumeRecord && viewerMode === 'canvas') {
      renderPdfDocument();
    }
  }, [isOpen, resumeRecord, zoomLevel, viewerMode, renderAttempt, renderPdfDocument]);

  // Update current page indicator based on scroll position
  const handleScroll = () => {
    if (!scrollContainerRef.current || totalPages <= 1) return;
    const scrollContainer = scrollContainerRef.current;
    const containerTop = scrollContainer.scrollTop;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const pageEl = document.getElementById(`viewer-pdf-page-${pageNum}`);
      if (pageEl) {
        const offsetTop = pageEl.offsetTop - scrollContainer.offsetTop;
        if (containerTop >= offsetTop - 100 && containerTop < offsetTop + pageEl.clientHeight) {
          setCurrentPage(pageNum);
          break;
        }
      }
    }
  };

  if (!isOpen || !resumeRecord) return null;

  const isPdf =
    resumeRecord.fileDataUrl?.startsWith('data:application/pdf') ||
    resumeRecord.fileName.toLowerCase().endsWith('.pdf') ||
    resumeRecord.fileType?.toLowerCase().includes('pdf') ||
    resumeRecord.fileDataUrl?.startsWith('blob:');

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#070A11]/95 text-slate-100 backdrop-blur-md overflow-hidden select-none"
    >
      {/* Top Header: Navigation & Primary Actions */}
      <div className="h-14 px-4 sm:px-6 bg-[#0E1524] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-md">
        {/* Left: Back to Profile */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </button>

          <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-3">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white truncate max-w-[280px]">
              {resumeRecord.fileName}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {resumeRecord.fileSize}
            </span>
          </div>
        </div>

        {/* Center: Title on Mobile */}
        <div className="md:hidden text-center">
          <h2 className="text-xs font-extrabold text-white">My Resume</h2>
        </div>

        {/* Right: Actions (Viewer Mode toggle, Download, Replace, Delete) */}
        <div className="flex items-center gap-2">
          {/* Toggle Native Viewer / Canvas Mode */}
          {activeBlobUrl && (
            <button
              type="button"
              onClick={() => setViewerMode(viewerMode === 'canvas' ? 'native' : 'canvas')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={viewerMode === 'canvas' ? 'Switch to Browser Native PDF Engine' : 'Switch to Canvas Page View'}
            >
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                {viewerMode === 'canvas' ? 'Native Viewer' : 'Canvas View'}
              </span>
            </button>
          )}

          {/* Replace Resume (Optional) */}
          {onReplaceResume && (
            <button
              type="button"
              onClick={onReplaceResume}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Upload a newer version of this resume"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replace Resume</span>
            </button>
          )}

          {/* Download Exact File */}
          <button
            type="button"
            onClick={() => downloadResumeFile(resumeRecord.fileDataUrl, resumeRecord.fileName)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {/* Delete Resume */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
            title="Remove this resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Professional Viewer Toolbar (Zoom, Fit, Page navigation, Fullscreen) */}
      {viewerMode === 'canvas' && (
        <div className="h-11 px-4 sm:px-6 bg-[#090D16] border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs shrink-0 font-mono">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleZoomReset}
              className="min-w-[45px] text-center font-bold text-slate-300 hover:text-white cursor-pointer px-1 py-0.5 rounded"
              title="Reset Zoom to 100%"
            >
              {zoomLevel}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 ml-2 pl-2">
              <button
                type="button"
                onClick={handleFitWidth}
                className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Fit Width
              </button>
              <button
                type="button"
                onClick={handleFitPage}
                className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Fit Page
              </button>
            </div>
          </div>

          {/* Page Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-semibold text-slate-300 select-none">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Document Viewer Viewport */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-4 sm:p-8 bg-[#070A11] flex flex-col items-center justify-start relative"
      >
        {isRendering && (
          <div className="absolute inset-0 bg-[#070A11]/60 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="p-4 rounded-2xl bg-[#0E1524] border border-slate-800 flex items-center gap-3 text-xs text-slate-300 shadow-xl">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Rendering PDF document pages...</span>
            </div>
          </div>
        )}

        {/* Error State with Retry Button */}
        {renderError && (
          <div className="p-5 max-w-lg w-full rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-6 shadow-xl space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">Resume Preview Notice</p>
                <p className="text-slate-300 leading-relaxed">{renderError}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-rose-500/20">
              <button
                type="button"
                onClick={() => setRenderAttempt((prev) => prev + 1)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Rendering</span>
              </button>

              {activeBlobUrl && (
                <button
                  type="button"
                  onClick={() => setViewerMode('native')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Use Native Browser Viewer</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => downloadResumeFile(resumeRecord.fileDataUrl, resumeRecord.fileName)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Original</span>
              </button>
            </div>
          </div>
        )}

        {/* Document Pages Container */}
        {isPdf ? (
          viewerMode === 'canvas' ? (
            <div ref={pagesContainerRef} className="w-full flex flex-col items-center justify-center" />
          ) : (
            <div className="w-full max-w-4xl h-[82vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col">
              {activeBlobUrl ? (
                <object
                  data={activeBlobUrl}
                  type="application/pdf"
                  className="w-full h-full"
                  title="PDF Resume Preview"
                >
                  <div className="p-8 text-center text-slate-800 space-y-3">
                    <p className="font-bold text-sm">Browser native PDF preview unavailable.</p>
                    <button
                      type="button"
                      onClick={() => setViewerMode('canvas')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                    >
                      Switch to Canvas Page View
                    </button>
                  </div>
                </object>
              ) : (
                <div className="p-8 text-center text-slate-400">Loading preview stream...</div>
              )}
            </div>
          )
        ) : (
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 my-4 border border-slate-200">
            <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{resumeRecord.fileName}</h1>
                <p className="text-xs text-slate-500 mt-1">Non-PDF document preview</p>
              </div>
              <button
                type="button"
                onClick={() => downloadResumeFile(resumeRecord.fileDataUrl, resumeRecord.fileName)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Original</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-[60vh] overflow-y-auto">
              {resumeRecord.extractedData?.rawText || 'Text stream extracted from uploaded document.'}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Remove Resume</h3>
                <p className="text-xs text-slate-400 truncate max-w-[200px]">
                  {resumeRecord.fileName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove this resume from your active profile?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteResume();
                }}
                className="px-4.5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                Remove Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
