import { StudentProfile, PlacementDrive, DriveEligibilityResult } from '../types';

/**
 * Standard department alias resolver
 */
function normalizeDept(name: string): string[] {
  const lower = name.toLowerCase().trim();
  if (lower.includes('ai') || lower.includes('data science') || lower.includes('aids')) {
    return ['ai & ds', 'aids', 'artificial intelligence & data science', 'artificial intelligence and data science', 'dept-aids', 'b.tech artificial intelligence and data science'];
  }
  if (lower.includes('computer science') || lower.includes('cse')) {
    return ['cse', 'computer science & engineering', 'computer science and engineering', 'dept-cse', 'b.e cse'];
  }
  if (lower.includes('information tech') || lower === 'it') {
    return ['it', 'information technology', 'dept-it', 'b.tech it'];
  }
  if (lower.includes('electronic') || lower.includes('communication') || lower === 'ece') {
    return ['ece', 'electronics & communication engineering', 'electronics and communication engineering', 'dept-ece'];
  }
  if (lower.includes('mechanical') || lower === 'mech') {
    return ['mech', 'mechanical engineering', 'dept-mech'];
  }
  return [lower];
}

function departmentMatches(studentDept: string, allowedDepartments: string[]): boolean {
  if (!allowedDepartments || allowedDepartments.length === 0) return true;
  const studentAliases = normalizeDept(studentDept);

  return allowedDepartments.some((allowed) => {
    const allowedAliases = normalizeDept(allowed);
    return studentAliases.some((s) => allowedAliases.includes(s) || allowed.toLowerCase().includes(s) || s.includes(allowed.toLowerCase()));
  });
}

function normalizeSkillName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Real-time eligibility evaluation engine
 */
export function evaluateDriveEligibility(
  student: StudentProfile,
  drive: PlacementDrive
): DriveEligibilityResult {
  const reasons: string[] = [];

  // 1. CGPA evaluation
  const minCgpa = drive.minimumCGPA ?? 0;
  const actualCgpa = student.cgpa ?? 0;
  const cgpaPassed = actualCgpa >= minCgpa;
  if (!cgpaPassed) {
    reasons.push(
      `CGPA: Your CGPA: ${actualCgpa.toFixed(2)} | Required: ${minCgpa.toFixed(2)}`
    );
  }

  // 2. Department evaluation
  const deptPassed = departmentMatches(
    student.departmentName || student.departmentId || '',
    drive.allowedDepartments || []
  );
  if (!deptPassed) {
    const allowedStr = drive.allowedDepartments && drive.allowedDepartments.length > 0
      ? drive.allowedDepartments.join(', ')
      : 'All Departments';
    reasons.push(
      `Department: Your Department: ${student.departmentName || 'Not specified'} | Allowed: ${allowedStr}`
    );
  }

  // 3. Batch evaluation
  const batchPassed =
    !drive.allowedBatches ||
    drive.allowedBatches.length === 0 ||
    drive.allowedBatches.includes(student.batch || '2022-2026');
  if (!batchPassed) {
    reasons.push(
      `Batch: Your Batch: ${student.batch} | Allowed: ${drive.allowedBatches.join(', ')}`
    );
  }

  // 4. Required Skills evaluation
  const studentSkillNamesNormalized = new Set(
    (student.skills || []).map((s) => normalizeSkillName(s.skillName))
  );

  const missingSkills: string[] = [];
  (drive.requiredSkills || []).forEach((reqSkill) => {
    const reqNormalized = normalizeSkillName(reqSkill);
    let matched = studentSkillNamesNormalized.has(reqNormalized);
    if (!matched) {
      // Check partial substring match (e.g. "python 3" matches "python", "powerbi" matches "power bi")
      matched = Array.from(studentSkillNamesNormalized).some(
        (stSkill) => stSkill.includes(reqNormalized) || reqNormalized.includes(stSkill)
      );
    }
    if (!matched) {
      missingSkills.push(reqSkill);
    }
  });

  const skillsPassed = missingSkills.length === 0;
  if (!skillsPassed) {
    reasons.push(`Missing Skills: ${missingSkills.join(', ')}`);
  }

  const isEligible = cgpaPassed && deptPassed && batchPassed && skillsPassed;

  let summary = isEligible
    ? 'Eligible to apply for this drive'
    : 'Currently not eligible';

  return {
    isEligible,
    cgpaPassed,
    deptPassed,
    batchPassed,
    skillsPassed,
    missingSkills,
    reasons,
    summary,
  };
}
