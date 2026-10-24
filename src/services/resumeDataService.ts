/**
 * MAX Placement 2026 — Resume & ATS Data Service
 * 
 * Manages persistent storage, server-sync, and strict student account isolation.
 */

import { AtsAnalysisReport } from './atsScoringEngine';
import { JobMatchResult } from './jobMatchEngine';
import { GitHubAnalysisResult, LinkedInAnalysisResult, LinkedInChecklist } from './profileAnalysisService';

export interface StoredResumeRecord {
  id: string;
  studentId: string;
  studentRollNumber: string;
  studentName: string;
  fileName: string;
  fileFormat: string;
  fileSize: string;
  fileSizeNumber: number;
  fileDataUrl: string;
  extractedText: string;
  extractionStatus: 'SUCCESS' | 'WARNING_LOW_TEXT' | 'FAILED_EMPTY_OR_SCANNED';
  extractionMessage: string;
  pageCount?: number;
  uploadedAt: string;
  version: number;
}

export interface RecruiterReviewRecord {
  id: string;
  studentId: string;
  studentRollNumber: string;
  studentName: string;
  department: string;
  batch: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  driveId: string;
  companyName: string;
  status: 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'On Hold' | 'Not Selected';
  scorecard: {
    technicalEvidence: number;
    projectQuality: number;
    readabilityFormat: number;
    recruiterRecommendation: number;
  };
  writtenJustification: string;
  recruiterNotes: string;
  updatedAt: string;
}

// 1. Resume Records per student
export async function fetchStudentResumes(studentId: string, role = 'STUDENT'): Promise<StoredResumeRecord[]> {
  if (!studentId) return [];
  try {
    const res = await fetch(`/api/resumes?studentId=${encodeURIComponent(studentId)}`, {
      headers: {
        'x-user-id': studentId,
        'x-user-role': role,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.resumes)) {
        // Cache to localStorage for fast offline/fallback
        localStorage.setItem(`skillgap_resumes_cache_${studentId}`, JSON.stringify(data.resumes));
        return data.resumes;
      }
    }
  } catch (err) {
    console.warn('Backend fetch resumes fallback to local storage:', err);
  }

  // Local fallback
  try {
    const cached = localStorage.getItem(`skillgap_resumes_cache_${studentId}`);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }
  return [];
}

export async function uploadStudentResume(
  record: Omit<StoredResumeRecord, 'id' | 'uploadedAt' | 'version'>,
  role = 'STUDENT'
): Promise<StoredResumeRecord> {
  try {
    const res = await fetch('/api/resumes/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': record.studentId,
        'x-user-role': role,
      },
      body: JSON.stringify(record),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.resume) {
        return data.resume;
      }
    }
  } catch (err) {
    console.warn('Backend upload failed, saving locally:', err);
  }

  // Fallback local save
  const existing = await fetchStudentResumes(record.studentId, role);
  const nextVer = existing.length + 1;
  const newResume: StoredResumeRecord = {
    ...record,
    id: `res-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    uploadedAt: new Date().toISOString(),
    version: nextVer,
  };
  const updated = [newResume, ...existing];
  localStorage.setItem(`skillgap_resumes_cache_${record.studentId}`, JSON.stringify(updated));
  return newResume;
}

export async function deleteStudentResume(resumeId: string, studentId: string, role = 'STUDENT'): Promise<boolean> {
  try {
    const res = await fetch(`/api/resumes/${encodeURIComponent(resumeId)}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': studentId,
        'x-user-role': role,
      },
    });
    if (res.ok) {
      const existing = await fetchStudentResumes(studentId, role);
      const filtered = existing.filter((r) => r.id !== resumeId);
      localStorage.setItem(`skillgap_resumes_cache_${studentId}`, JSON.stringify(filtered));
      return true;
    }
  } catch {
    // fallback
  }

  const existing = await fetchStudentResumes(studentId, role);
  const filtered = existing.filter((r) => r.id !== resumeId);
  localStorage.setItem(`skillgap_resumes_cache_${studentId}`, JSON.stringify(filtered));
  return true;
}

// 2. ATS Reports Persistence
export async function saveAtsReport(
  studentId: string,
  resumeId: string,
  report: AtsAnalysisReport,
  role = 'STUDENT'
): Promise<void> {
  const payload = {
    studentId,
    resumeId,
    score: report.score,
    criteriaBreakdown: report.criteria,
    improvementPlan: report.improvementPlan,
    scoringVersion: report.scoringVersion,
    extractedSkillsCount: report.detectedSkills.length,
    detectedSections: report.detectedSections,
  };

  try {
    await fetch('/api/reports/ats-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': studentId,
        'x-user-role': role,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore
  }

  // Cache locally
  try {
    const key = `skillgap_ats_reports_${studentId}`;
    const cached = JSON.parse(localStorage.getItem(key) || '[]');
    cached.unshift({ id: `ats-${Date.now()}`, ...payload, evaluatedAt: report.evaluatedAt });
    localStorage.setItem(key, JSON.stringify(cached.slice(0, 15)));
  } catch {
    // ignore
  }
}

export async function fetchAtsReports(studentId: string, role = 'STUDENT'): Promise<any[]> {
  try {
    const res = await fetch(`/api/reports/ats-analysis?studentId=${encodeURIComponent(studentId)}`, {
      headers: {
        'x-user-id': studentId,
        'x-user-role': role,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.reports)) {
        return data.reports;
      }
    }
  } catch {
    // ignore
  }
  try {
    const cached = localStorage.getItem(`skillgap_ats_reports_${studentId}`);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }
  return [];
}

// 3. Job Match Reports Persistence
export async function saveJobMatchReport(
  studentId: string,
  resumeId: string,
  match: JobMatchResult,
  role = 'STUDENT'
): Promise<void> {
  const payload = {
    studentId,
    resumeId,
    jobId: match.jobId,
    companyName: match.companyName,
    jobRole: match.jobRole,
    matchScore: match.matchScore,
    breakdown: match.breakdown,
    eligibilityStatus: match.eligibilityStatus,
    tailoredRecommendations: match.tailoredRecommendations,
  };

  try {
    await fetch('/api/reports/job-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': studentId,
        'x-user-role': role,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore
  }

  try {
    const key = `skillgap_jm_reports_${studentId}`;
    const cached = JSON.parse(localStorage.getItem(key) || '[]');
    cached.unshift({ id: `jm-${Date.now()}`, ...payload, evaluatedAt: match.evaluatedAt });
    localStorage.setItem(key, JSON.stringify(cached.slice(0, 15)));
  } catch {
    // ignore
  }
}

// 4. Profile Integrations (GitHub & LinkedIn)
export async function fetchProfileIntegrations(studentId: string): Promise<any> {
  try {
    const res = await fetch(`/api/profile-integrations/${encodeURIComponent(studentId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        localStorage.setItem(`skillgap_profile_int_${studentId}`, JSON.stringify(data.profile));
        return data.profile;
      }
    }
  } catch {
    // ignore
  }
  try {
    const cached = localStorage.getItem(`skillgap_profile_int_${studentId}`);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }
  return {
    studentId,
    githubUrl: '',
    githubStatus: 'UNCHECKED',
    githubOwnershipStatus: 'UNVERIFIED_PUBLIC_MATCH',
    linkedInUrl: '',
    linkedInStatus: 'UNCHECKED',
    linkedInOwnershipStatus: 'UNVERIFIED',
    updatedAt: new Date().toISOString(),
  };
}

export async function saveProfileIntegrations(studentId: string, updates: any): Promise<void> {
  try {
    await fetch(`/api/profile-integrations/${encodeURIComponent(studentId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  } catch {
    // ignore
  }
  try {
    const existing = await fetchProfileIntegrations(studentId);
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(`skillgap_profile_int_${studentId}`, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

// 5. Recruiter Reviews
export async function fetchRecruiterReviews(studentId?: string, role = 'STUDENT', callerId?: string): Promise<RecruiterReviewRecord[]> {
  try {
    const url = studentId ? `/api/recruiter-reviews?studentId=${encodeURIComponent(studentId)}` : '/api/recruiter-reviews';
    const headers: Record<string, string> = {
      'x-user-role': role,
    };
    if (callerId || studentId) {
      headers['x-user-id'] = callerId || studentId || '';
    }
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        return data.reviews;
      }
    }
  } catch {
    // ignore
  }
  try {
    const cached = localStorage.getItem('skillgap_recruiter_reviews');
    if (cached) {
      const all: RecruiterReviewRecord[] = JSON.parse(cached);
      return studentId ? all.filter((r) => r.studentId === studentId) : all;
    }
  } catch {
    // ignore
  }
  return [];
}

export async function submitRecruiterReview(review: Omit<RecruiterReviewRecord, 'id' | 'updatedAt'>, role = 'STAFF'): Promise<RecruiterReviewRecord> {
  try {
    const res = await fetch('/api/recruiter-reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
      },
      body: JSON.stringify(review),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.review) {
        return data.review;
      }
    }
  } catch {
    // ignore
  }

  // Fallback local save
  const all = await fetchRecruiterReviews();
  const existingIdx = all.findIndex((r) => r.studentId === review.studentId && r.driveId === review.driveId);
  const newRec: RecruiterReviewRecord = {
    ...review,
    id: `rev-local-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };
  if (existingIdx !== -1) {
    all[existingIdx] = newRec;
  } else {
    all.unshift(newRec);
  }
  localStorage.setItem('skillgap_recruiter_reviews', JSON.stringify(all));
  return newRec;
}
