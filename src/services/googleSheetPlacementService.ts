import { PlacementDrive, GoogleSheetSyncMetadata, WorkMode, EmploymentType } from '../types';

export const DEFAULT_COLLEGE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1z1a2az4b9aWIXoX5bdE291yFt7h_6GyA/export?format=csv';

const STORAGE_KEYS = {
  DRIVES_CACHE: 'skillgap_college_sheet_drives_v1',
  METADATA: 'skillgap_college_sheet_meta_v1',
  CUSTOM_SHEET_URL: 'skillgap_custom_sheet_url_v1',
};

/**
 * Convert any Google Sheets link to a direct CSV export endpoint
 */
export function getExportCsvUrl(rawUrl: string): string {
  if (!rawUrl || !rawUrl.trim()) return DEFAULT_COLLEGE_SHEET_URL;
  const trimmed = rawUrl.trim();

  // If already an export format url
  if (trimmed.includes('export?format=csv') || trimmed.includes('/gviz/tq?tqx=out:csv')) {
    return trimmed;
  }

  // Extract sheet key / ID
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    // Check if gid exists
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) {
      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gidMatch[1]}`;
    }
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  }

  return trimmed;
}

/**
 * Robust RFC 4180 CSV parser handling commas in quotes and newlines
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [''];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      // Only push non-empty rows
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
        lines.push(row.map((s) => s.trim()));
      }
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }

  if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
    lines.push(row.map((s) => s.trim()));
  }

  return lines;
}

/**
 * Header fuzzy matcher to map arbitrary column variations
 */
function findCol(headers: string[], candidates: string[]): number {
  const normHeaders = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (const cand of candidates) {
    const normCand = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
    const idx = normHeaders.findIndex(
      (h) => h === normCand || h.includes(normCand) || normCand.includes(h)
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Numeric Minimum CGPA extractor
 */
function extractMinCgpa(val?: string): number | undefined {
  if (!val || !val.trim()) return undefined;
  const match = val.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    if (!isNaN(num) && num > 0 && num <= 10) return num;
  }
  return undefined;
}

/**
 * Numeric CTC Range parser for packages like "₹3.36 – ₹7 LPA", "₹30 – ₹45 LPA", "₹3.6 LPA"
 */
function extractCTC(val?: string): { minCTC?: number; maxCTC?: number; formatted: string } {
  if (!val || !val.trim()) return { formatted: 'Not Disclosed' };
  const str = val.trim();
  const matches = str.match(/([0-9]+(?:\.[0-9]+)?)/g);
  if (!matches || matches.length === 0) {
    return { formatted: str };
  }
  const nums = matches.map(Number).filter((n) => !isNaN(n));
  if (nums.length === 1) {
    return { minCTC: nums[0], maxCTC: nums[0], formatted: str };
  }
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return { minCTC: min, maxCTC: max, formatted: str };
}

/**
 * Brand emoji assignment for clean presentation
 */
function getCompanyIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('google')) return '🌐';
  if (lower.includes('microsoft')) return '🪟';
  if (lower.includes('amazon')) return '📦';
  if (lower.includes('adobe')) return '🎨';
  if (lower.includes('uber')) return '🚗';
  if (lower.includes('flipkart')) return '🛍️';
  if (lower.includes('cred')) return '💳';
  if (lower.includes('linkedin')) return '💼';
  if (lower.includes('salesforce')) return '☁️';
  if (lower.includes('atlassian')) return '🔷';
  if (lower.includes('goldman')) return '🏛️';
  if (lower.includes('deloitte')) return '📊';
  if (lower.includes('tcs')) return '🏢';
  if (lower.includes('infosys')) return '🔷';
  if (lower.includes('wipro')) return '🌈';
  if (lower.includes('cognizant')) return '⚡';
  if (lower.includes('ibm')) return '💻';
  if (lower.includes('accenture')) return '🎯';
  if (lower.includes('hcl')) return '🏢';
  if (lower.includes('capgemini')) return '♠️';
  if (lower.includes('tech mahindra')) return '⚙️';
  if (lower.includes('ltimindtree') || lower.includes('mindtree')) return '🌳';
  if (lower.includes('sprinklr')) return '✨';
  if (lower.includes('nutanix')) return '☁️';
  if (lower.includes('rubrik')) return '🛡️';
  if (lower.includes('tower research')) return '📈';
  if (lower.includes('arcesium') || lower.includes('de shaw')) return '💹';
  if (lower.includes('vmware')) return '🖥️';
  if (lower.includes('persistent')) return '⚡';
  if (lower.includes('hexaware')) return '💻';
  if (lower.includes('zensar') || lower.includes('mphasis') || lower.includes('birlasoft')) return '🏢';
  return '🏢';
}

function checkProductTier(name: string, minCTC?: number): boolean {
  const lower = name.toLowerCase();
  const productKeywords = [
    'google',
    'microsoft',
    'amazon',
    'adobe',
    'atlassian',
    'uber',
    'salesforce',
    'linkedin',
    'sprinklr',
    'flipkart',
    'cred',
    'media.net',
    'de shaw',
    'rubrik',
    'nutanix',
    'tower research',
    'zeta',
    'vmware',
    'arcesium',
    'goldman',
  ];
  if (productKeywords.some((k) => lower.includes(k))) return true;
  if (minCTC && minCTC >= 15) return true;
  return false;
}

/**
 * Intelligent normalization of raw spreadsheet rows into PlacementDrive records
 */
export function normalizeSpreadsheetRows(rows: string[][]): {
  drives: PlacementDrive[];
  warnings: string[];
} {
  const warnings: string[] = [];
  if (rows.length < 2) {
    return { drives: [], warnings: ['Spreadsheet contains no data rows.'] };
  }

  const headers = rows[0];

  // Map header column indices
  const companyCol = findCol(headers, ['company', 'company name', 'employer', 'org', 'firm', 'organization']);
  const cgpaCol = findCol(headers, ['min cgpa', 'minimum cgpa', 'cgpa', 'cutoff', 'eligibility']);
  const roleCol = findCol(headers, ['job roles', 'job role', 'role', 'position', 'designation', 'profile']);
  const ctcCol = findCol(headers, ['approx ctc', 'ctc', 'package', 'salary', 'salary package', 'pay']);
  const skillsCol = findCol(headers, ['important topics', 'skills', 'required skills', 'topics', 'technologies']);
  const locationCol = findCol(headers, ['location', 'city', 'place', 'job location']);
  const deptCol = findCol(headers, ['department', 'branch', 'allowed departments', 'eligible departments']);
  const batchCol = findCol(headers, ['batch', 'eligible batch', 'passout batch']);
  const deadlineCol = findCol(headers, ['deadline', 'application deadline', 'last date', 'drive date']);
  const linkCol = findCol(headers, ['application link', 'apply link', 'url', 'link', 'registration link']);
  const descCol = findCol(headers, ['description', 'job description', 'overview']);
  const processCol = findCol(headers, ['selection process', 'rounds', 'hiring process']);

  if (companyCol === -1) {
    warnings.push('Could not find a "Company" column in the spreadsheet header.');
    return { drives: [], warnings };
  }

  const drives: PlacementDrive[] = [];
  const seenKeys = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const companyRaw = companyCol !== -1 && r[companyCol] ? r[companyCol].trim() : '';

    // Data validation: Ignore completely empty or nameless rows
    if (!companyRaw) {
      continue;
    }

    const roleRaw = roleCol !== -1 && r[roleCol] ? r[roleCol].trim() : 'Software / Technology Associate';
    const ctcRaw = ctcCol !== -1 && r[ctcCol] ? r[ctcCol].trim() : '';
    const cgpaRaw = cgpaCol !== -1 && r[cgpaCol] ? r[cgpaCol].trim() : '';
    const skillsRaw = skillsCol !== -1 && r[skillsCol] ? r[skillsCol].trim() : '';
    const locationRaw = locationCol !== -1 && r[locationCol] ? r[locationCol].trim() : '';
    const deptRaw = deptCol !== -1 && r[deptCol] ? r[deptCol].trim() : '';
    const batchRaw = batchCol !== -1 && r[batchCol] ? r[batchCol].trim() : '';
    const deadlineRaw = deadlineCol !== -1 && r[deadlineCol] ? r[deadlineCol].trim() : '';
    const linkRaw = linkCol !== -1 && r[linkCol] ? r[linkCol].trim() : '';
    const descRaw = descCol !== -1 && r[descCol] ? r[descCol].trim() : '';
    const processRaw = processCol !== -1 && r[processCol] ? r[processCol].trim() : '';

    // Duplicate detection: check unique company + role pair
    const dedupeKey = `${companyRaw.toLowerCase()}_${roleRaw.toLowerCase()}`;
    if (seenKeys.has(dedupeKey)) {
      continue;
    }
    seenKeys.add(dedupeKey);

    // Parse values without fabricating
    const ctcData = extractCTC(ctcRaw);
    const minCgpa = extractMinCgpa(cgpaRaw);

    // Parse skills from comma-separated list
    const parsedSkills = skillsRaw
      ? skillsRaw
          .split(/[,;•\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Parse selection process if available
    const selectionProcess = processRaw
      ? processRaw
          .split(/[,;\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : ['1. Online Assessment / Aptitude', '2. Technical Interview', '3. HR Discussion'];

    // Parse allowed departments
    const allowedDepartments = deptRaw
      ? deptRaw
          .split(/[,;/]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : ['AI & DS', 'CSE', 'IT', 'ECE']; // Standard engineering cohort

    // Parse allowed batches
    const allowedBatches = batchRaw
      ? batchRaw
          .split(/[,;/]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : ['2022-2026'];

    const isProduct = checkProductTier(companyRaw, ctcData.minCTC);
    const icon = getCompanyIcon(companyRaw);

    // Format drive ID deterministically
    const cleanId = `drive-sheet-${companyRaw.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`;

    const driveRecord: PlacementDrive = {
      id: cleanId,
      companyName: companyRaw,
      companyLogo: icon,
      jobRole: roleRaw,
      description:
        descRaw ||
        `Official on-campus recruitment drive for ${companyRaw} hiring for ${roleRaw}. Key preparation focus areas include ${
          parsedSkills.join(', ') || 'Core Computing & Problem Solving'
        }.`,
      minCTC: ctcData.minCTC,
      maxCTC: ctcData.maxCTC,
      salaryPackage: ctcData.formatted,
      location: locationRaw || 'Campus / Multiple Locations',
      workMode: 'On-site' as WorkMode,
      jobType: 'Full-Time' as EmploymentType,
      deadline: deadlineRaw || 'Campus Recruitment Drive',
      applicationUrl: linkRaw && linkRaw.startsWith('http') ? linkRaw : undefined,
      minimumCGPA: minCgpa,
      allowedDepartments,
      allowedBatches,
      requiredSkills: parsedSkills,
      preferredSkills: [],
      selectionProcess,
      roundsCount: selectionProcess.length,
      status: 'PUBLISHED',
      isProductBased: isProduct,
      createdBy: 'College Placement Cell',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    drives.push(driveRecord);
  }

  return { drives, warnings };
}

/**
 * Read cached drives from localStorage
 */
export function getStoredGoogleSheetDrives(): PlacementDrive[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRIVES_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed reading cached drives from localStorage', e);
  }
  return [];
}

/**
 * Read metadata from localStorage
 */
export function getStoredGoogleSheetMetadata(): GoogleSheetSyncMetadata {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.METADATA);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading sheet metadata', e);
  }
  return {
    sheetUrl: DEFAULT_COLLEGE_SHEET_URL,
    lastSyncedAt: new Date().toISOString(),
    source: 'College Campus Placement Sheet',
    totalCompanies: 0,
    status: 'CACHED',
  };
}

/**
 * Save drives and metadata to localStorage
 */
export function saveGoogleSheetDrives(
  drives: PlacementDrive[],
  meta: GoogleSheetSyncMetadata
): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DRIVES_CACHE, JSON.stringify(drives));
    localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(meta));
  } catch (e) {
    console.error('Failed saving sheet drives cache', e);
  }
}

/**
 * Fetch and sync drives dynamically from the Google Sheet
 */
export async function fetchPlacementDrivesFromGoogleSheet(
  customUrl?: string,
  forceRefresh = false
): Promise<{
  success: boolean;
  drives: PlacementDrive[];
  metadata: GoogleSheetSyncMetadata;
  error?: string;
}> {
  const targetUrl = customUrl ? getExportCsvUrl(customUrl) : DEFAULT_COLLEGE_SHEET_URL;

  // 1. First attempt: call server backend proxy /api/drives?refresh=true or /api/drives
  try {
    const query = forceRefresh ? '?refresh=true' : '';
    const res = await fetch(`/api/drives${query}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.drives) && data.drives.length > 0) {
        const meta: GoogleSheetSyncMetadata = {
          sheetUrl: targetUrl,
          lastSyncedAt: data.metadata?.lastSyncedAt || new Date().toISOString(),
          source: data.metadata?.source || 'College Campus Placement Cell',
          totalCompanies: data.drives.length,
          status: 'SUCCESS',
        };
        saveGoogleSheetDrives(data.drives, meta);
        return { success: true, drives: data.drives, metadata: meta };
      }
    }
  } catch (err) {
    console.warn('Backend /api/drives fetch failed, trying direct Google Sheet CSV fetch:', err);
  }

  // 2. Direct Google Sheet CSV fetch (works directly with public Google Sheets)
  try {
    const res = await fetch(targetUrl);
    if (res.ok) {
      const text = await res.text();
      const rows = parseCSV(text);
      const { drives, warnings } = normalizeSpreadsheetRows(rows);

      if (drives.length > 0) {
        const meta: GoogleSheetSyncMetadata = {
          sheetUrl: targetUrl,
          lastSyncedAt: new Date().toISOString(),
          source: 'College Placement Sheet',
          totalCompanies: drives.length,
          status: 'SUCCESS',
          warningMessage: warnings.length > 0 ? warnings.join('; ') : undefined,
        };
        saveGoogleSheetDrives(drives, meta);
        return { success: true, drives, metadata: meta };
      }
    }
  } catch (directErr) {
    console.warn('Direct Google Sheet fetch failed:', directErr);
  }

  // 3. Fallback: Return cached data if available
  const cachedDrives = getStoredGoogleSheetDrives();
  if (cachedDrives.length > 0) {
    const cachedMeta = getStoredGoogleSheetMetadata();
    return {
      success: true,
      drives: cachedDrives,
      metadata: {
        ...cachedMeta,
        status: 'CACHED',
      },
    };
  }

  // 4. Failure state if both network and cache fail
  return {
    success: false,
    drives: [],
    metadata: {
      sheetUrl: targetUrl,
      lastSyncedAt: new Date().toISOString(),
      source: 'College Placement Sheet',
      totalCompanies: 0,
      status: 'ERROR',
    },
    error: 'Unable to load campus placement data. Please check your internet connection or verify the Google Sheet permissions.',
  };
}
