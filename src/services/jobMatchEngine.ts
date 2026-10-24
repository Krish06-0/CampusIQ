/**
 * MAX Placement 2026 — Job-Specific Resume Match Engine
 * 
 * Separate Configurable Scoring Criteria (100 Points Total):
 * 1. Required skills coverage: 35 points
 * 2. Preferred skills coverage: 15 points
 * 3. Relevant project and experience evidence: 25 points
 * 4. Education and qualification alignment: 15 points
 * 5. Relevant certifications and tools: 10 points
 */

export interface JobMatchResult {
  jobId?: string;
  companyName: string;
  jobRole: string;
  matchScore: number; // 0 - 100
  evaluatedAt: string;
  breakdown: {
    requiredSkills: {
      maxPoints: 35;
      awardedPoints: number;
      matched: { skill: string; evidenceSnippet: string }[];
      missing: string[];
    };
    preferredSkills: {
      maxPoints: 15;
      awardedPoints: number;
      matched: { skill: string; evidenceSnippet: string }[];
      missing: string[];
    };
    projectsEvidence: {
      maxPoints: 25;
      awardedPoints: number;
      evidenceFound: string[];
      suggestions: string[];
    };
    educationAlignment: {
      maxPoints: 15;
      awardedPoints: number;
      status: 'MET' | 'UNMET' | 'UNVERIFIED';
      detail: string;
    };
    certificationsAndTools: {
      maxPoints: 10;
      awardedPoints: number;
      matched: string[];
      missing: string[];
    };
  };
  eligibilityStatus: 'MET' | 'UNMET' | 'UNVERIFIED';
  eligibilityDetails: {
    cgpaMet: boolean;
    departmentMet: boolean;
    batchMet: boolean;
    cgpaNote: string;
    departmentNote: string;
    batchNote: string;
  };
  tailoredRecommendations: string[];
}

export interface TargetJobSpec {
  id?: string;
  companyName: string;
  jobRole: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  minimumCGPA?: number;
  allowedDepartments?: string[];
  allowedBatches?: string[];
  rawJobDescription?: string;
}

// Find evidence context snippet in text
function findEvidenceSnippet(text: string, term: string): string {
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + term.length + 50);
  let snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

// Extract keywords from pasted custom job description
export function extractRequirementsFromJd(rawJd: string): {
  requiredSkills: string[];
  preferredSkills: string[];
  roleTitle: string;
  companyName: string;
} {
  const text = rawJd || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let roleTitle = 'Software / Technology Associate';
  let companyName = 'Target Employer';

  // Try to detect first couple lines
  if (lines.length > 0 && lines[0].length < 70) {
    roleTitle = lines[0];
  }
  if (lines.length > 1 && lines[1].length < 50 && !lines[1].toLowerCase().includes('requirement')) {
    companyName = lines[1];
  }

  const KNOWN_SKILLS = [
    'Python', 'Java', 'C++', 'SQL', 'React', 'Node.js', 'Machine Learning',
    'Deep Learning', 'Pandas', 'NumPy', 'Power BI', 'Tableau', 'Docker',
    'Git', 'GitHub', 'AWS', 'Azure', 'GCP', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Data Structures & Algorithms', 'System Design', 'REST APIs', 'TypeScript',
    'JavaScript', 'HTML/CSS', 'Linux', 'Computer Networks', 'Operating Systems',
    'DBMS', 'OOPs Concepts', 'Advanced Excel', 'Data Visualization', 'Communication'
  ];

  const found: string[] = [];
  for (const s of KNOWN_SKILLS) {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(text)) {
      found.push(s);
    }
  }

  // Split into required vs preferred
  const requiredSkills = found.slice(0, Math.ceil(found.length * 0.7));
  const preferredSkills = found.slice(Math.ceil(found.length * 0.7));

  return {
    requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['Python', 'SQL', 'Data Structures & Algorithms'],
    preferredSkills: preferredSkills.length > 0 ? preferredSkills : ['Git & GitHub', 'REST APIs'],
    roleTitle,
    companyName,
  };
}

export function calculateJobSpecificMatch(
  resumeText: string,
  targetJob: TargetJobSpec,
  studentProfile?: { cgpa?: number; departmentName?: string; batch?: string }
): JobMatchResult {
  const text = resumeText || '';
  const lowerText = text.toLowerCase();

  const reqSkills = targetJob.requiredSkills && targetJob.requiredSkills.length > 0
    ? targetJob.requiredSkills
    : ['Python', 'SQL', 'Data Structures & Algorithms'];
  const prefSkills = targetJob.preferredSkills || [];

  // 1. Required Skills Coverage (35 Points)
  const matchedRequired: { skill: string; evidenceSnippet: string }[] = [];
  const missingRequired: string[] = [];

  for (const skill of reqSkills) {
    // Normalization check
    const normalized = skill.toLowerCase();
    const isMatched = lowerText.includes(normalized) ||
      (normalized === 'c++' && lowerText.includes('c++')) ||
      (normalized === 'git & github' && (lowerText.includes('git') || lowerText.includes('github'))) ||
      (normalized.includes('oops') && (lowerText.includes('oop') || lowerText.includes('object-oriented'))) ||
      (normalized.includes('data structures') && (lowerText.includes('dsa') || lowerText.includes('data structures')));

    if (isMatched) {
      const snippet = findEvidenceSnippet(text, skill) || `Mentioned in technical profile context`;
      matchedRequired.push({ skill, evidenceSnippet: snippet });
    } else {
      missingRequired.push(skill);
    }
  }

  const reqScore = reqSkills.length > 0
    ? Math.round((matchedRequired.length / reqSkills.length) * 35)
    : 35;

  // 2. Preferred Skills Coverage (15 Points)
  const matchedPreferred: { skill: string; evidenceSnippet: string }[] = [];
  const missingPreferred: string[] = [];

  for (const skill of prefSkills) {
    const normalized = skill.toLowerCase();
    if (lowerText.includes(normalized)) {
      const snippet = findEvidenceSnippet(text, skill) || `Mentioned in profile`;
      matchedPreferred.push({ skill, evidenceSnippet: snippet });
    } else {
      missingPreferred.push(skill);
    }
  }

  const prefScore = prefSkills.length > 0
    ? Math.round((matchedPreferred.length / prefSkills.length) * 15)
    : 12; // If no preferred skills specified, grant baseline

  // 3. Relevant Projects & Experience Evidence (25 Points)
  const projectEvidenceFound: string[] = [];
  const projectSuggestions: string[] = [];
  let projectScore = 0;

  // Check if any matched required skill is used in a project context
  const projectSectionMatch = text.match(/(?:projects|experience|internships)[\s\S]*?(?:education|certifications|skills|$)/i);
  const projectContext = projectSectionMatch ? projectSectionMatch[0].toLowerCase() : lowerText;

  let projectSkillMentions = 0;
  for (const item of matchedRequired) {
    if (projectContext.includes(item.skill.toLowerCase())) {
      projectSkillMentions++;
      projectEvidenceFound.push(`Applied "${item.skill}" within demonstrated project / internship experience.`);
    }
  }

  if (projectSkillMentions >= 3) {
    projectScore = 25;
  } else if (projectSkillMentions >= 1) {
    projectScore = 18;
    projectSuggestions.push(`Mention your primary job skills (${missingRequired.slice(0, 2).join(', ')}) directly in your project tech stacks.`);
  } else {
    projectScore = 10;
    projectSuggestions.push('No required skills were identified inside project bullet points. Connect skills to actual repositories.');
  }

  // 4. Education & Qualification Alignment (15 Points)
  let eduScore = 15;
  let eduStatus: 'MET' | 'UNMET' | 'UNVERIFIED' = 'MET';
  let eduDetail = 'Academic profile aligns with campus eligibility requirements.';

  let cgpaMet = true;
  let deptMet = true;
  let batchMet = true;

  let cgpaNote = 'CGPA meets minimum threshold';
  let deptNote = 'Department is eligible';
  let batchNote = 'Batch year is eligible';

  if (targetJob.minimumCGPA !== undefined && studentProfile?.cgpa !== undefined) {
    if (studentProfile.cgpa < targetJob.minimumCGPA) {
      cgpaMet = false;
      eduStatus = 'UNMET';
      eduScore -= 8;
      cgpaNote = `Current CGPA (${studentProfile.cgpa}) is below required cutoff (${targetJob.minimumCGPA})`;
      eduDetail = `Eligibility constraint unmet: Minimum CGPA ${targetJob.minimumCGPA} required (student has ${studentProfile.cgpa}).`;
    } else {
      cgpaNote = `CGPA ${studentProfile.cgpa} >= ${targetJob.minimumCGPA} cutoff`;
    }
  }

  if (targetJob.allowedDepartments && targetJob.allowedDepartments.length > 0 && studentProfile?.departmentName) {
    const studentDept = studentProfile.departmentName.toLowerCase();
    const deptMatch = targetJob.allowedDepartments.some((d) => studentDept.includes(d.toLowerCase()) || d.toLowerCase().includes(studentDept));
    if (!deptMatch) {
      deptMet = false;
      eduStatus = 'UNMET';
      eduScore -= 4;
      deptNote = `Department (${studentProfile.departmentName}) is not in drive's permitted list: ${targetJob.allowedDepartments.join(', ')}`;
    }
  }

  if (targetJob.allowedBatches && targetJob.allowedBatches.length > 0 && studentProfile?.batch) {
    if (!targetJob.allowedBatches.includes(studentProfile.batch)) {
      batchMet = false;
      batchNote = `Batch (${studentProfile.batch}) not listed in ${targetJob.allowedBatches.join(', ')}`;
    }
  }

  // 5. Certifications & Tools (10 Points)
  const certToolsMatched: string[] = [];
  const certToolsMissing: string[] = [];
  const commonTools = ['Git', 'GitHub', 'Linux', 'Docker', 'Power BI', 'Jupyter', 'Postman', 'VS Code'];

  for (const t of commonTools) {
    if (lowerText.includes(t.toLowerCase())) {
      certToolsMatched.push(t);
    } else {
      certToolsMissing.push(t);
    }
  }

  const certsScore = Math.min(10, Math.round((certToolsMatched.length / 4) * 10));

  const totalMatchScore = Math.min(100, Math.max(0, reqScore + prefScore + projectScore + eduScore + certsScore));

  // Synthesize tailored recommendations
  const tailoredRecommendations: string[] = [];

  if (missingRequired.length > 0) {
    tailoredRecommendations.push(
      `Add explicit resume bullets demonstrating your hands-on knowledge in missing required skills: ${missingRequired.join(', ')}.`
    );
  }

  if (missingPreferred.length > 0) {
    tailoredRecommendations.push(
      `Consider incorporating preferred tools such as ${missingPreferred.slice(0, 2).join(' and ')} in your coursework or project descriptions.`
    );
  }

  if (projectSuggestions.length > 0) {
    tailoredRecommendations.push(...projectSuggestions);
  }

  if (!cgpaMet) {
    tailoredRecommendations.push(
      `Note: Target drive requires a minimum CGPA of ${targetJob.minimumCGPA}. Seek placement coordinator review for potential cutoff relaxation.`
    );
  }

  return {
    jobId: targetJob.id,
    companyName: targetJob.companyName,
    jobRole: targetJob.jobRole,
    matchScore: totalMatchScore,
    evaluatedAt: new Date().toISOString(),
    breakdown: {
      requiredSkills: {
        maxPoints: 35,
        awardedPoints: reqScore,
        matched: matchedRequired,
        missing: missingRequired,
      },
      preferredSkills: {
        maxPoints: 15,
        awardedPoints: prefScore,
        matched: matchedPreferred,
        missing: missingPreferred,
      },
      projectsEvidence: {
        maxPoints: 25,
        awardedPoints: projectScore,
        evidenceFound: projectEvidenceFound,
        suggestions: projectSuggestions,
      },
      educationAlignment: {
        maxPoints: 15,
        awardedPoints: Math.max(0, eduScore),
        status: eduStatus,
        detail: eduDetail,
      },
      certificationsAndTools: {
        maxPoints: 10,
        awardedPoints: certsScore,
        matched: certToolsMatched,
        missing: certToolsMissing,
      },
    },
    eligibilityStatus: eduStatus,
    eligibilityDetails: {
      cgpaMet,
      departmentMet: deptMet,
      batchMet,
      cgpaNote,
      departmentNote: deptNote,
      batchNote,
    },
    tailoredRecommendations,
  };
}
