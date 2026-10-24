import { PlacementDrive, DriveApplication, UserRole, User, StudentProfile, DriveStatus, ApplicationStatus, GoogleSheetSyncMetadata } from '../types';
import { SEED_APPLICATIONS } from '../data/initialPlacementDrives';
import { logAuditEvent } from './storageService';
import {
  fetchPlacementDrivesFromGoogleSheet,
  getStoredGoogleSheetDrives,
  getStoredGoogleSheetMetadata,
  saveGoogleSheetDrives,
} from './googleSheetPlacementService';

const STORAGE_KEYS = {
  DRIVES: 'skillgap_placement_drives_v1',
  APPLICATIONS: 'skillgap_drive_applications_v1',
};

function isOfficerRole(role?: UserRole): boolean {
  return role === 'PLACEMENT_OFFICER' || role === 'PLACEMENT_ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Initialize / Read Local Storage Drives
 */
export function getLocalDrives(): PlacementDrive[] {
  // Prefer Google Sheet cached drives
  const sheetDrives = getStoredGoogleSheetDrives();
  if (sheetDrives && sheetDrives.length > 0) {
    return sheetDrives;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRIVES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed reading drives from localStorage', e);
  }
  return [];
}

export function saveLocalDrives(drives: PlacementDrive[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(drives));
  } catch (e) {
    console.error('Failed saving drives to localStorage', e);
  }
}

/**
 * Initialize / Read Local Storage Applications
 */
export function getLocalApplications(): DriveApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed reading applications from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(SEED_APPLICATIONS));
  return SEED_APPLICATIONS;
}

export function saveLocalApplications(apps: DriveApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed saving applications to localStorage', e);
  }
}

/**
 * Fetch Placement Drives with Role Filter & Metadata from Google Sheet
 */
export async function fetchDrivesWithMetadata(
  role?: UserRole,
  userId?: string,
  forceRefresh = false
): Promise<{ drives: PlacementDrive[]; metadata: GoogleSheetSyncMetadata; error?: string }> {
  try {
    const query = forceRefresh ? '?refresh=true' : '';
    const headers: Record<string, string> = {
      'x-user-role': role || 'STUDENT',
      'x-user-id': userId || '',
    };
    const res = await fetch(`/api/drives${query}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.drives) && data.drives.length > 0) {
        saveLocalDrives(data.drives);
        const meta: GoogleSheetSyncMetadata = {
          sheetUrl: data.metadata?.sheetUrl || '',
          lastSyncedAt: data.metadata?.lastSyncedAt || new Date().toISOString(),
          source: data.metadata?.source || 'College Placement Sheet',
          totalCompanies: data.drives.length,
          status: 'SUCCESS',
        };
        saveGoogleSheetDrives(data.drives, meta);
        return { drives: data.drives, metadata: meta };
      }
    }
  } catch (err) {
    console.warn('API fetchDrives fallback to direct Google Sheet sync:', err);
  }

  // Fallback: direct Google Sheet fetch
  const direct = await fetchPlacementDrivesFromGoogleSheet(undefined, forceRefresh);
  if (direct.success && direct.drives.length > 0) {
    let resultDrives = direct.drives;
    if (!isOfficerRole(role)) {
      resultDrives = resultDrives.filter((d) => d.status === 'PUBLISHED' || d.status === 'CLOSED');
    }
    saveLocalDrives(resultDrives);
    return { drives: resultDrives, metadata: direct.metadata };
  }

  // Cached fallback
  const cached = getLocalDrives();
  const cachedMeta = getStoredGoogleSheetMetadata();
  let drives = cached;
  if (!isOfficerRole(role)) {
    drives = drives.filter((d) => d.status === 'PUBLISHED' || d.status === 'CLOSED');
  }

  return {
    drives,
    metadata: {
      ...cachedMeta,
      status: cached.length > 0 ? 'CACHED' : 'ERROR',
    },
    error: cached.length === 0 ? 'Unable to load campus placement data.' : undefined,
  };
}

/**
 * Fetch Placement Drives with Role Filter (backward-compatible)
 */
export async function fetchDrives(
  role?: UserRole,
  userId?: string,
  forceRefresh = false
): Promise<PlacementDrive[]> {
  const res = await fetchDrivesWithMetadata(role, userId, forceRefresh);
  return res.drives;
}

/**
 * Get single drive by ID
 */
export function getDriveById(id: string): PlacementDrive | undefined {
  const drives = getLocalDrives();
  return drives.find((d) => d.id === id);
}

/**
 * Create a new Placement Drive (PLACEMENT_OFFICER ONLY)
 */
export async function createDrive(
  driveData: Partial<PlacementDrive>,
  role: UserRole,
  user: User
): Promise<{ success: boolean; drive?: PlacementDrive; error?: string }> {
  // Client check: Prevent unauthorized UI calls
  if (!isOfficerRole(role)) {
    return { success: false, error: '403 Forbidden: Only Placement Officers can create placement drives.' };
  }

  const newDrive: PlacementDrive = {
    id: `drive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    companyName: driveData.companyName || 'Untitled Company',
    companyLogo: driveData.companyLogo || '🏢',
    jobRole: driveData.jobRole || 'Software Engineer',
    description: driveData.description || '',
    minCTC: driveData.minCTC,
    maxCTC: driveData.maxCTC,
    salaryPackage: driveData.salaryPackage || (driveData.minCTC ? `₹${driveData.minCTC} LPA` : 'Competitive'),
    location: driveData.location || 'On-Campus / Hybrid',
    workMode: driveData.workMode || 'On-site',
    jobType: driveData.jobType || 'Full-Time',
    deadline: driveData.deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    applicationUrl: driveData.applicationUrl || '',
    minimumCGPA: Number(driveData.minimumCGPA) || 6.0,
    allowedDepartments: driveData.allowedDepartments || ['AI & DS', 'CSE', 'IT', 'ECE'],
    allowedBatches: driveData.allowedBatches || ['2022-2026'],
    requiredSkills: driveData.requiredSkills || [],
    preferredSkills: driveData.preferredSkills || [],
    selectionProcess: driveData.selectionProcess && driveData.selectionProcess.length > 0
      ? driveData.selectionProcess
      : ['1. Aptitude Test', '2. Technical Interview', '3. HR Round'],
    roundsCount: driveData.roundsCount || 3,
    responsibilities: driveData.responsibilities || [],
    contactInfo: driveData.contactInfo || `${user.email} | Central Placement Office`,
    additionalInstructions: driveData.additionalInstructions || '',
    status: driveData.status || 'PUBLISHED',
    isProductBased: driveData.isProductBased ?? ((driveData.minCTC ?? 0) >= 6),
    createdBy: user.name || 'Placement Officer',
    createdAt: new Date().toISOString(),
    updatedBy: user.name || 'Placement Officer',
    updatedAt: new Date().toISOString(),
    publishedAt: driveData.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
  };

  try {
    const res = await fetch('/api/drives', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-user-id': user.id,
      },
      body: JSON.stringify(newDrive),
    });

    if (res.status === 403) {
      return { success: false, error: '403 Forbidden: Server rejected unauthorized drive creation.' };
    }

    if (res.ok) {
      const result = await res.json();
      if (result.drive) {
        // sync local
        const drives = getLocalDrives();
        drives.unshift(result.drive);
        saveLocalDrives(drives);
        logAuditEvent(user, 'DRIVE_CREATED', 'PlacementDrive', result.drive.id, `Created drive for ${result.drive.companyName} (${result.drive.jobRole})`);
        return { success: true, drive: result.drive };
      }
    }
  } catch (err) {
    console.warn('API createDrive error, applying local fallback:', err);
  }

  // Local fallback
  const drives = getLocalDrives();
  drives.unshift(newDrive);
  saveLocalDrives(drives);
  logAuditEvent(user, 'DRIVE_CREATED', 'PlacementDrive', newDrive.id, `Created drive for ${newDrive.companyName} (${newDrive.jobRole})`);
  return { success: true, drive: newDrive };
}

/**
 * Edit Placement Drive (PLACEMENT_OFFICER ONLY)
 */
export async function updateDrive(
  id: string,
  driveData: Partial<PlacementDrive>,
  role: UserRole,
  user: User
): Promise<{ success: boolean; drive?: PlacementDrive; error?: string }> {
  if (!isOfficerRole(role)) {
    return { success: false, error: '403 Forbidden: Only Placement Officers can edit placement drives.' };
  }

  const existing = getDriveById(id);
  if (!existing) {
    return { success: false, error: 'Drive not found.' };
  }

  const updated: PlacementDrive = {
    ...existing,
    ...driveData,
    updatedBy: user.name,
    updatedAt: new Date().toISOString(),
    publishedAt: driveData.status === 'PUBLISHED' && existing.status !== 'PUBLISHED'
      ? new Date().toISOString()
      : existing.publishedAt,
    closedAt: driveData.status === 'CLOSED' && existing.status !== 'CLOSED'
      ? new Date().toISOString()
      : existing.closedAt,
  };

  try {
    const res = await fetch(`/api/drives/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-user-id': user.id,
      },
      body: JSON.stringify(updated),
    });

    if (res.status === 403) {
      return { success: false, error: '403 Forbidden: Server rejected unauthorized drive edit.' };
    }
  } catch (err) {
    console.warn('API updateDrive error:', err);
  }

  // Sync local storage
  const drives = getLocalDrives();
  const idx = drives.findIndex((d) => d.id === id);
  if (idx >= 0) {
    drives[idx] = updated;
    saveLocalDrives(drives);
  }

  logAuditEvent(user, 'DRIVE_UPDATED', 'PlacementDrive', id, `Updated drive ${updated.companyName} (${updated.jobRole})`);
  return { success: true, drive: updated };
}

/**
 * Delete Placement Drive (PLACEMENT_OFFICER ONLY)
 */
export async function deleteDrive(
  id: string,
  role: UserRole,
  user: User
): Promise<{ success: boolean; error?: string }> {
  if (!isOfficerRole(role)) {
    return { success: false, error: '403 Forbidden: Only Placement Officers can delete placement drives.' };
  }

  try {
    const res = await fetch(`/api/drives/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': role,
        'x-user-id': user.id,
      },
    });

    if (res.status === 403) {
      return { success: false, error: '403 Forbidden: Server rejected unauthorized drive deletion.' };
    }
  } catch (err) {
    console.warn('API deleteDrive error:', err);
  }

  const drives = getLocalDrives().filter((d) => d.id !== id);
  saveLocalDrives(drives);
  logAuditEvent(user, 'DRIVE_DELETED', 'PlacementDrive', id, `Deleted drive ${id}`);
  return { success: true };
}

/**
 * Publish / Unpublish / Close Drive Status (PLACEMENT_OFFICER ONLY)
 */
export async function updateDriveStatus(
  id: string,
  newStatus: DriveStatus,
  role: UserRole,
  user: User
): Promise<{ success: boolean; drive?: PlacementDrive; error?: string }> {
  if (!isOfficerRole(role)) {
    return { success: false, error: '403 Forbidden: Only Placement Officers can update drive status.' };
  }

  return updateDrive(id, { status: newStatus }, role, user);
}

/**
 * Fetch Applications
 */
export async function fetchApplications(
  driveId?: string,
  role?: UserRole,
  studentId?: string
): Promise<DriveApplication[]> {
  try {
    const params = new URLSearchParams();
    if (driveId) params.append('driveId', driveId);
    if (studentId) params.append('studentId', studentId);

    const headers: Record<string, string> = {
      'x-user-role': role || 'STUDENT',
      'x-user-id': studentId || '',
    };

    const res = await fetch(`/api/applications?${params.toString()}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.applications)) {
        return data.applications;
      }
    }
  } catch (err) {
    console.warn('API fetchApplications fallback to local:', err);
  }

  const all = getLocalApplications();
  let filtered = all;

  if (driveId) {
    filtered = filtered.filter((a) => a.driveId === driveId);
  }

  // If role is student, they ONLY see their own applications
  if (!isOfficerRole(role) && studentId) {
    filtered = filtered.filter((a) => a.studentId === studentId);
  }

  return filtered;
}

/**
 * Student Applies to a Drive
 */
export async function applyToDrive(
  drive: PlacementDrive,
  student: StudentProfile
): Promise<{ success: boolean; application?: DriveApplication; error?: string }> {
  const existingApps = getLocalApplications();
  const alreadyApplied = existingApps.find(
    (a) => a.driveId === drive.id && (a.studentId === student.id || a.studentEmail === student.collegeEmail)
  );

  if (alreadyApplied) {
    return { success: true, application: alreadyApplied };
  }

  const newApp: DriveApplication = {
    id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    driveId: drive.id,
    studentId: student.id,
    studentName: student.name,
    studentRollNumber: student.registerNumber,
    studentEmail: student.collegeEmail || `${student.registerNumber.toLowerCase()}@college.edu`,
    studentDepartment: student.departmentName || 'AI & DS',
    studentCgpa: student.cgpa,
    appliedAt: new Date().toISOString(),
    status: 'Applied',
  };

  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'STUDENT',
        'x-user-id': student.id,
      },
      body: JSON.stringify(newApp),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.application) {
        existingApps.unshift(data.application);
        saveLocalApplications(existingApps);
        return { success: true, application: data.application };
      }
    }
  } catch (err) {
    console.warn('API applyToDrive error:', err);
  }

  existingApps.unshift(newApp);
  saveLocalApplications(existingApps);
  return { success: true, application: newApp };
}

/**
 * Update Application Status (PLACEMENT_OFFICER ONLY)
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  role: UserRole,
  user: User
): Promise<{ success: boolean; application?: DriveApplication; error?: string }> {
  if (!isOfficerRole(role)) {
    return { success: false, error: '403 Forbidden: Only Placement Officers can update application status.' };
  }

  const apps = getLocalApplications();
  const idx = apps.findIndex((a) => a.id === applicationId);
  if (idx === -1) {
    return { success: false, error: 'Application not found.' };
  }

  apps[idx].status = newStatus;
  saveLocalApplications(apps);

  try {
    await fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-user-id': user.id,
      },
      body: JSON.stringify({ status: newStatus }),
    });
  } catch (err) {
    console.warn('API updateApplicationStatus error:', err);
  }

  logAuditEvent(user, 'APPLICATION_STATUS_UPDATED', 'DriveApplication', applicationId, `Updated application status to ${newStatus}`);
  return { success: true, application: apps[idx] };
}

/**
 * Compute Application Counts map per driveId
 */
export function getApplicationCounts(): Record<string, number> {
  const apps = getLocalApplications();
  const map: Record<string, number> = {};
  for (const app of apps) {
    map[app.driveId] = (map[app.driveId] || 0) + 1;
  }
  return map;
}

/**
 * Check if a student has applied to a drive
 */
export function getStudentApplicationStatus(driveId: string, studentId: string): ApplicationStatus | null {
  const apps = getLocalApplications();
  const found = apps.find((a) => a.driveId === driveId && a.studentId === studentId);
  return found ? found.status : null;
}
