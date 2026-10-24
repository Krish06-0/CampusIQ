import { SKILL_ONTOLOGY } from '../data/initialDatabase';
import {
  StudentProfile,
  JobOpportunity,
  JobRequirement,
  SkillGapItem,
  MatchScoreBreakdown,
  EligibilityEvaluation,
  SkillAnalysisResult,
} from '../types';

/**
 * Calculates string similarity using Dice coefficient of bigrams (fast, robust semantic approximation)
 */
export function calculateDiceSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;

  b1.forEach((count, bigram) => {
    if (b2.has(bigram)) {
      intersection += Math.min(count, b2.get(bigram)!);
    }
  });

  return (2.0 * intersection) / (s1.length - 1 + s2.length - 1);
}

/**
 * Normalizes and matches skills against our comprehensive ontology
 */
export function matchSkillToOntology(inputSkill: string) {
  const cleanInput = inputSkill.toLowerCase().trim();

  // 1. Direct or alias match
  for (const skill of SKILL_ONTOLOGY) {
    if (skill.normalizedName === cleanInput || skill.name.toLowerCase() === cleanInput) {
      return { skill, score: 1.0, matchType: 'EXACT' as const };
    }
    for (const alias of skill.aliases) {
      if (alias === cleanInput) {
        return { skill, score: 0.98, matchType: 'ALIAS' as const };
      }
      if (cleanInput.includes(alias) || alias.includes(cleanInput)) {
        return { skill, score: 0.88, matchType: 'SUBSTRING' as const };
      }
    }
  }

  // 2. Fuzzy similarity match
  let bestMatch = null;
  let highestScore = 0;
  for (const skill of SKILL_ONTOLOGY) {
    const diceScore = calculateDiceSimilarity(cleanInput, skill.name);
    if (diceScore > highestScore) {
      highestScore = diceScore;
      bestMatch = skill;
    }
    for (const alias of skill.aliases) {
      const aliasScore = calculateDiceSimilarity(cleanInput, alias);
      if (aliasScore > highestScore) {
        highestScore = aliasScore;
        bestMatch = skill;
      }
    }
  }

  if (bestMatch && highestScore >= 0.6) {
    return { skill: bestMatch, score: highestScore, matchType: 'FUZZY' as const };
  }

  return null;
}

/**
 * Extracts skills from raw text (e.g. from resume or pasted job description)
 */
export function extractSkillsFromText(text: string): {
  skillName: string;
  category: string;
  confidence: number;
  extractedFrom: string;
}[] {
  const results: {
    skillName: string;
    category: string;
    confidence: number;
    extractedFrom: string;
  }[] = [];

  const lowerText = text.toLowerCase();
  const seenSkillIds = new Set<string>();

  for (const skill of SKILL_ONTOLOGY) {
    // Check main name
    const regexName = new RegExp(`\\b${escapeRegExp(skill.name.toLowerCase())}\\b`, 'i');
    if (regexName.test(lowerText)) {
      results.push({
        skillName: skill.name,
        category: skill.category,
        confidence: 0.96,
        extractedFrom: skill.name,
      });
      seenSkillIds.add(skill.id);
      continue;
    }

    // Check aliases
    for (const alias of skill.aliases) {
      if (seenSkillIds.has(skill.id)) break;
      const regexAlias = new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i');
      if (regexAlias.test(lowerText)) {
        results.push({
          skillName: skill.name,
          category: skill.category,
          confidence: 0.92,
          extractedFrom: alias,
        });
        seenSkillIds.add(skill.id);
        break;
      }
    }
  }

  return results;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Evaluates candidate eligibility based on college criteria
 */
export function evaluateEligibility(
  student: StudentProfile,
  rules: JobOpportunity['eligibility']
): EligibilityEvaluation {
  const cgpaPassed = student.cgpa >= rules.minimumCgpa;
  const deptPassed =
    rules.allowedDepartments.length === 0 ||
    rules.allowedDepartments.some(
      (d) => d.toLowerCase() === student.departmentName.toLowerCase() || d.toLowerCase() === student.departmentId.toLowerCase()
    );
  const batchPassed =
    rules.allowedBatches.length === 0 || rules.allowedBatches.includes(student.batch);
  const backlogsPassed = student.backlogs <= rules.backlogsAllowed;

  const isEligible = cgpaPassed && deptPassed && batchPassed && backlogsPassed;

  return {
    isEligible,
    criteria: {
      cgpa: {
        required: rules.minimumCgpa,
        actual: student.cgpa,
        passed: cgpaPassed,
        reason: cgpaPassed
          ? `CGPA meets standard (Your ${student.cgpa} >= Required ${rules.minimumCgpa})`
          : `CGPA requirement: ${rules.minimumCgpa} | Your CGPA: ${student.cgpa} (Short by ${(rules.minimumCgpa - student.cgpa).toFixed(2)})`,
      },
      department: {
        allowed: rules.allowedDepartments,
        actual: student.departmentName,
        passed: deptPassed,
        reason: deptPassed
          ? `Eligible department: ${student.departmentName}`
          : `Department restriction: Allowed [${rules.allowedDepartments.join(', ')}] | Your Department: ${student.departmentName}`,
      },
      batch: {
        allowed: rules.allowedBatches,
        actual: student.batch,
        passed: batchPassed,
        reason: batchPassed
          ? `Batch verified: ${student.batch}`
          : `Batch mismatch: Allowed [${rules.allowedBatches.join(', ')}] | Your Batch: ${student.batch}`,
      },
      backlogs: {
        allowed: rules.backlogsAllowed,
        actual: student.backlogs,
        passed: backlogsPassed,
        reason: backlogsPassed
          ? `Standing arrears compliant (Your ${student.backlogs} <= Allowed ${rules.backlogsAllowed})`
          : `Active arrears exceeded: Allowed ${rules.backlogsAllowed} | Your Active Backlogs: ${student.backlogs}`,
      },
    },
    summary: isEligible
      ? 'Fully eligible to participate in this placement opportunity.'
      : 'Currently ineligible based on institutional placement criteria.',
  };
}

/**
 * Proficiency numeric level mapping
 */
const PROFICIENCY_RANKS: Record<string, number> = {
  None: 0,
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

/**
 * Evaluates skill gaps between student profile and target job
 */
export function analyzeSkillGaps(
  student?: StudentProfile | null,
  job?: JobOpportunity | null
): SkillAnalysisResult {
  if (!student || !job) {
    return {
      id: `analysis-${Date.now()}`,
      studentId: student?.id || 'anon',
      jobId: job?.id || '',
      jobTitle: job?.title || '',
      companyName: job?.companyName || '',
      createdAt: new Date().toISOString(),
      eligibility: {
        isEligible: false,
        criteria: {
          cgpa: { required: 0, actual: 0, passed: false, reason: 'Profile or job not loaded.' },
          department: { allowed: [], actual: '', passed: false, reason: 'Profile or job not loaded.' },
          batch: { allowed: [], actual: '', passed: false, reason: 'Profile or job not loaded.' },
          backlogs: { allowed: 0, actual: 0, passed: false, reason: 'Profile or job not loaded.' },
        },
        summary: 'Profile or job not loaded.',
      },
      matchScore: {
        overallScore: 0,
        skillCoverageScore: 0,
        importanceWeightScore: 0,
        proficiencyAlignmentScore: 0,
        semanticSimilarityScore: 0,
        matchedCount: 0,
        partialCount: 0,
        missingCount: 0,
        totalRequired: 0,
        explanation: 'Profile or job not loaded.',
      },
      gaps: [],
      radarCategories: [],
    };
  }

  const eligibility = evaluateEligibility(student, job.eligibility);
  const gaps: SkillGapItem[] = [];

  let matchedCount = 0;
  let partialCount = 0;
  let missingCount = 0;

  // Track weighted score sums
  let totalImportanceWeight = 0;
  let earnedImportanceWeight = 0;
  let totalProficiencyEarned = 0;
  let totalProficiencyPossible = 0;
  let totalSimilarityEarned = 0;

  job.requirements.forEach((req: JobRequirement) => {
    const reqWeight = req.importance === 'REQUIRED' ? 1.0 : req.importance === 'PREFERRED' ? 0.6 : 0.3;
    totalImportanceWeight += reqWeight;
    const reqProfVal = PROFICIENCY_RANKS[req.minimumProficiency] || 2;
    totalProficiencyPossible += reqProfVal;

    // Find if student has this skill
    const studentSkill = student.skills.find((s) => {
      if (s.skillName.toLowerCase() === req.skillName.toLowerCase()) return true;
      const matchedOntology = matchSkillToOntology(s.skillName);
      if (matchedOntology && matchedOntology.skill.normalizedName === req.normalizedName) {
        return true;
      }
      return false;
    });

    if (studentSkill) {
      const studentProfVal = PROFICIENCY_RANKS[studentSkill.proficiency] || 1;
      const isProficientEnough = studentProfVal >= reqProfVal;

      if (isProficientEnough) {
        // EXACT / HIGH SEMANTIC MATCH
        matchedCount++;
        earnedImportanceWeight += reqWeight;
        totalProficiencyEarned += Math.min(studentProfVal, reqProfVal);
        totalSimilarityEarned += 1.0;

        gaps.push({
          skillName: req.skillName,
          category: req.category,
          importance: req.importance,
          studentLevel: studentSkill.proficiency,
          requiredLevel: req.minimumProficiency,
          similarity: 1.0,
          status: 'MATCHED',
          priority: 'LOW',
          explanation: `Your verified ${studentSkill.proficiency} proficiency fulfills the required ${req.minimumProficiency} level for ${req.skillName}.`,
          recommendedAction: `Keep sharpening with hands-on interview questions and advance into senior patterns.`,
        });
      } else {
        // PARTIAL MATCH (Proficiency gap)
        partialCount++;
        earnedImportanceWeight += reqWeight * 0.65;
        totalProficiencyEarned += studentProfVal;
        totalSimilarityEarned += 0.8;

        const priority = req.importance === 'REQUIRED' ? 'HIGH' : 'MEDIUM';

        gaps.push({
          skillName: req.skillName,
          category: req.category,
          importance: req.importance,
          studentLevel: studentSkill.proficiency,
          requiredLevel: req.minimumProficiency,
          similarity: 0.8,
          status: 'PARTIAL',
          priority,
          explanation: `You have ${studentSkill.proficiency} level evidence, but the job demands ${req.minimumProficiency} depth in production use cases.`,
          recommendedAction: `Deepen your knowledge with end-to-end projects, performance tuning, and LeetCode / DataLemur practice.`,
        });
      }
    } else {
      // Check if student has related skills in same category for partial match
      const relatedSkill = student.skills.find(
        (s) => s.category.toLowerCase() === req.category.toLowerCase()
      );

      if (relatedSkill && req.importance !== 'REQUIRED') {
        partialCount++;
        earnedImportanceWeight += reqWeight * 0.4;
        totalProficiencyEarned += 0.5;
        totalSimilarityEarned += 0.55;

        gaps.push({
          skillName: req.skillName,
          category: req.category,
          importance: req.importance,
          studentLevel: 'None',
          requiredLevel: req.minimumProficiency,
          similarity: 0.55,
          status: 'PARTIAL',
          priority: 'MEDIUM',
          explanation: `You have related experience in ${relatedSkill.skillName} (${relatedSkill.category}), but lack direct evidence for ${req.skillName}.`,
          recommendedAction: `Transfer your foundational experience into ${req.skillName} by completing a focused crash course.`,
        });
      } else {
        // MISSING
        missingCount++;
        const priority = req.importance === 'REQUIRED' ? 'CRITICAL' : 'HIGH';

        gaps.push({
          skillName: req.skillName,
          category: req.category,
          importance: req.importance,
          studentLevel: 'None',
          requiredLevel: req.minimumProficiency,
          similarity: 0.0,
          status: 'MISSING',
          priority,
          explanation: `${req.skillName} is listed as a ${req.importance.toLowerCase()} requirement for this role, while your verified profile has no recorded evidence or project utilization.`,
          recommendedAction: `Prioritize learning ${req.skillName} fundamentals via the college placement roadmap and build a portfolio project.`,
        });
      }
    }
  });

  // Calculate explainable 4-component score:
  // Component 1: Skill Coverage (40%)
  const totalReqs = job.requirements.length || 1;
  const coverageRatio = (matchedCount + partialCount * 0.5) / totalReqs;
  const skillCoverageScore = Math.round(coverageRatio * 40);

  // Component 2: Importance Weight (30%)
  const importanceRatio = totalImportanceWeight > 0 ? earnedImportanceWeight / totalImportanceWeight : 0;
  const importanceWeightScore = Math.round(importanceRatio * 30);

  // Component 3: Proficiency Alignment (20%)
  const profRatio = totalProficiencyPossible > 0 ? totalProficiencyEarned / totalProficiencyPossible : 0;
  const proficiencyAlignmentScore = Math.round(profRatio * 20);

  // Component 4: Semantic Similarity (10%)
  const simRatio = totalReqs > 0 ? totalSimilarityEarned / totalReqs : 0;
  const semanticSimilarityScore = Math.round(simRatio * 10);

  const overallScore = Math.min(
    100,
    skillCoverageScore + importanceWeightScore + proficiencyAlignmentScore + semanticSimilarityScore
  );

  const matchScore: MatchScoreBreakdown = {
    overallScore,
    skillCoverageScore,
    importanceWeightScore,
    proficiencyAlignmentScore,
    semanticSimilarityScore,
    matchedCount,
    partialCount,
    missingCount,
    totalRequired: totalReqs,
    explanation: `Calculated from ${matchedCount} matched, ${partialCount} partial, and ${missingCount} missing requirements across ${totalReqs} target job criteria.`,
  };

  // Generate category radar breakdown
  const categoryMap = new Map<string, { student: number; required: number; count: number }>();
  job.requirements.forEach((req) => {
    const cat = req.category || 'Core';
    const entry = categoryMap.get(cat) || { student: 0, required: 0, count: 0 };
    entry.count += 1;
    entry.required += PROFICIENCY_RANKS[req.minimumProficiency] * 33;

    const matched = gaps.find((g) => g.skillName === req.skillName);
    const stLevel = matched ? matched.studentLevel : 'None';
    entry.student += PROFICIENCY_RANKS[stLevel] * 33;
    categoryMap.set(cat, entry);
  });

  const radarCategories = Array.from(categoryMap.entries()).map(([category, val]) => ({
    category,
    studentScore: Math.min(100, Math.round(val.student / val.count)),
    requiredScore: Math.min(100, Math.round(val.required / val.count)),
  }));

  // Ensure default categories exist if few requirements
  if (radarCategories.length < 4) {
    const defaultCats = ['Programming', 'Database', 'Data Science', 'Core CS', 'Soft Skills'];
    defaultCats.forEach((cat) => {
      if (!radarCategories.find((rc) => rc.category === cat)) {
        const studentHas = student.skills.filter((s) => s.category === cat).length;
        radarCategories.push({
          category: cat,
          studentScore: Math.min(95, studentHas * 35),
          requiredScore: 75,
        });
      }
    });
  }

  return {
    id: `analysis-${student.id}-${job.id}-${Date.now()}`,
    studentId: student.id,
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.companyName,
    createdAt: new Date().toISOString(),
    eligibility,
    matchScore,
    gaps,
    radarCategories,
  };
}

/**
 * Enhances student resume bullets with strong action verbs without fabricating metrics
 */
export function improveResumeBullet(originalText: string): string {
  const trimmed = originalText.trim();
  if (!trimmed) return originalText;

  const replacements: [RegExp, string][] = [
    [/^made a\b/i, 'Architected and built a'],
    [/^created (a|an|the)?/i, 'Developed and deployed $1'],
    [/^did work on/i, 'Spearheaded implementation of'],
    [/^worked on\b/i, 'Engineered components for'],
    [/^used python to\b/i, 'Implemented Python automation scripts to'],
    [/^helped in\b/i, 'Collaborated on developing'],
    [/^built website\b/i, 'Developed a responsive web application'],
    [/^wrote sql\b/i, 'Formulated optimized SQL queries, joins, and CTEs'],
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(trimmed)) {
      return trimmed.replace(pattern, replacement);
    }
  }

  // Capitalize first letter and add period if missing
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return capitalized.endsWith('.') ? capitalized : `${capitalized}.`;
}
