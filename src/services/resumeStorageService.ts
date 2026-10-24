import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { generateStudentPdfDataUrl } from './pdfGeneratorHelper';

// Polyfill Promise.try for environments that do not support it natively yet
if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function <T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    return new Promise((resolve) => resolve(fn(...args)));
  };
}

// Ensure PDF.js worker is properly configured using the Vite bundled asset URL
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } catch (e) {
    console.warn('[PDF.js Worker Setup Note]', e);
  }
}

export interface UploadedResumeRecord {
  id: string;
  studentId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  pageCount: number;
  uploadedAt: string;
  fileDataUrl: string;
  thumbnailUrl?: string;
  extractedData?: any;
}

export function getResumeStorageKey(studentId: string): string {
  return `skillgap_resume_record_${studentId || 'default'}`;
}

/**
 * Retrieve uploaded resume record for a given student
 */
export function getUploadedResume(studentId: string): UploadedResumeRecord | null {
  if (!studentId) return null;
  try {
    const raw = localStorage.getItem(getResumeStorageKey(studentId));
    if (raw) return JSON.parse(raw);

    // Also check lowercase/trimmed variant
    const rawClean = localStorage.getItem(getResumeStorageKey(studentId.trim()));
    if (rawClean) return JSON.parse(rawClean);

    return null;
  } catch (err) {
    console.error('Failed to get uploaded resume record:', err);
    return null;
  }
}

/**
 * Save or update uploaded resume record
 */
export function saveUploadedResume(studentId: string, record: UploadedResumeRecord): void {
  if (!studentId || !record) return;
  try {
    localStorage.setItem(getResumeStorageKey(studentId), JSON.stringify(record));
    // Also set legacy/convenience fallback
    localStorage.setItem('skillgap_latest_uploaded_resume', JSON.stringify(record));
  } catch (err) {
    console.error('Failed to save uploaded resume record (quota may be exceeded):', err);
    // If quota exceeded, strip thumbnailUrl and try again
    try {
      const stripped = { ...record, thumbnailUrl: undefined };
      localStorage.setItem(getResumeStorageKey(studentId), JSON.stringify(stripped));
    } catch {
      // ignore
    }
  }
}

/**
 * Delete uploaded resume record
 */
export function deleteUploadedResume(studentId: string): void {
  try {
    localStorage.removeItem(getResumeStorageKey(studentId));
    localStorage.removeItem('skillgap_latest_uploaded_resume');
  } catch (err) {
    console.error('Failed to delete uploaded resume record:', err);
  }
}

/**
 * Convert browser File object to base64 DataURL
 */
export function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Safely parse a data URL or base64 string into a Uint8Array byte buffer.
 * Automatically handles missing padding, URL-encoding, and line breaks.
 */
export function parseDataUrlOrBase64ToBytes(dataUrlOrBase64: string): Uint8Array {
  if (!dataUrlOrBase64) {
    throw new Error('Empty resume file data');
  }

  let base64 = dataUrlOrBase64;
  const commaIdx = dataUrlOrBase64.indexOf(',');
  if (commaIdx !== -1) {
    base64 = dataUrlOrBase64.slice(commaIdx + 1);
  }

  // Remove whitespace, line breaks, carriage returns
  base64 = base64.trim().replace(/\s+/g, '');

  // If URL-encoded (%2B, %2F, %3D, etc.), decode it
  if (base64.includes('%')) {
    try {
      base64 = decodeURIComponent(base64);
    } catch {
      // ignore
    }
  }

  // Normalize URL-safe base64 (- to +, _ to /)
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

  // Fix missing padding if needed
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert data URL to Blob with safe MIME type detection
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0]?.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';

  try {
    const bytes = parseDataUrlOrBase64ToBytes(dataUrl);
    return new Blob([bytes as unknown as BlobPart], { type: mimeType });
  } catch (err) {
    console.warn('Fallback Blob creation from plain string:', err);
    return new Blob([dataUrl], { type: mimeType });
  }
}

/**
 * High-quality default valid PDF data URL
 */
export const SAMPLE_VALID_PDF_DATA_URL = generateStudentPdfDataUrl({
  name: 'Alex Kumar',
  registerNumber: '22AIDS014',
  email: 'alex.kumar@college.edu',
  phone: '+91 98401 23456',
  location: 'Madurai, Tamil Nadu',
  departmentName: 'Artificial Intelligence and Data Science',
  batch: '2024-2028',
  cgpa: 8.42,
  backlogs: 0,
});

/**
 * Extract page count and render first-page thumbnail for PDF files
 */
export async function extractPdfInfo(
  dataUrl: string
): Promise<{ pageCount: number; thumbnailUrl?: string }> {
  if (!dataUrl || (!dataUrl.startsWith('data:application/pdf') && !dataUrl.startsWith('blob:') && !dataUrl.startsWith('http'))) {
    return { pageCount: 1 };
  }

  try {
    let bytes: Uint8Array;
    if (dataUrl.startsWith('data:')) {
      bytes = parseDataUrlOrBase64ToBytes(dataUrl);
    } else {
      const res = await fetch(dataUrl);
      const buf = await res.arrayBuffer();
      bytes = new Uint8Array(buf);
    }

    const loadingTask = pdfjsLib.getDocument({
      data: bytes,
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages || 1;

    // Render thumbnail of page 1
    let thumbnailUrl: string | undefined = undefined;
    try {
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.35 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        await page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;
        thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (thumbErr) {
      console.warn('Failed to generate PDF thumbnail preview:', thumbErr);
    }

    return { pageCount, thumbnailUrl };
  } catch (err) {
    console.error('Failed to parse PDF metadata:', err);
    return { pageCount: 1 };
  }
}

/**
 * Helper to download resume file directly with safe Blob URL and automatic revocation
 */
export function downloadResumeFile(fileDataUrl: string, fileName: string): void {
  if (!fileDataUrl) return;

  let blobUrl = '';
  let isCreated = false;

  try {
    if (fileDataUrl.startsWith('blob:')) {
      blobUrl = fileDataUrl;
    } else if (fileDataUrl.startsWith('data:')) {
      const blob = dataUrlToBlob(fileDataUrl);
      blobUrl = URL.createObjectURL(blob);
      isCreated = true;
    } else {
      blobUrl = fileDataUrl;
    }

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || 'My_Resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Download error:', err);
    // fallback
    window.open(fileDataUrl, '_blank');
  } finally {
    if (isCreated && blobUrl) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    }
  }
}
