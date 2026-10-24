import { RoadmapWeeklyItem, SkillGapItem, ProjectRecommendation } from '../types';
import { BUILD_YOUR_OWN_X_PROJECTS } from '../data/placementGuideData';

/**
 * Maps missing or partial skills to curated placement curriculum resources from the PDF guide
 */
const SKILL_RESOURCE_CURRICULUM: Record<
  string,
  {
    objective: string;
    practiceTasks: string[];
    resources: RoadmapWeeklyItem['resources'];
    recommendedProjectNumber?: number;
  }
> = {
  'power bi': {
    objective: 'Master Power BI Desktop, DAX formulas, Star Schema data modeling, and executive KPI dashboard storytelling.',
    practiceTasks: [
      'Install Power BI Desktop and configure sample CSV retail sales dataset',
      'Model 1-to-many relationships and implement Star Schema with Date table',
      'Write core DAX measures: CALCULATE, TOTALYTD, DIVIDE, and YoY % Change',
      'Publish interactive report with drill-through slicers and KPI cards',
    ],
    resources: [
      { title: 'How to Power BI (YouTube Channel)', type: 'Video', provider: 'YouTube', url: 'https://www.youtube.com/@HowtoPowerBI', language: 'English' },
      { title: 'Power BI Project For Beginners - Codebasics', type: 'Tutorial', provider: 'Codebasics', url: 'https://www.youtube.com/playlist?list=PLeo1K3hjS3uva8pk1FI3iK9kCOKQdz1I9', language: 'English' },
      { title: 'Google Cloud Data Analytics Certificate (Beginner)', type: 'Course', provider: 'Google / Coursera', url: 'https://www.coursera.org/professional-certificates/google-data-analytics', language: 'English' },
    ],
    recommendedProjectNumber: 16, // Recommender / analytics
  },
  'sql': {
    objective: 'Achieve intermediate/advanced SQL fluency: multi-table joins, subqueries, CTEs, Window functions, and indexing.',
    practiceTasks: [
      'Solve 25 easy and medium questions on SQL-Practice.com',
      'Implement Window Functions: ROW_NUMBER(), DENSE_RANK(), and LAG/LEAD',
      'Write optimized query with Common Table Expressions (WITH clause)',
      'Earn HackerRank SQL Intermediate free certificate badge',
    ],
    resources: [
      { title: 'Complete 9 hours SQL Course in Tamil', type: 'Course', provider: 'YouTube (Tamil)', url: 'https://www.youtube.com/watch?v=JtaOmwnR6AM', language: 'Tamil' },
      { title: 'Joey Blue Basic SQL Training Playlist', type: 'Video', provider: 'Joey Blue', url: 'https://www.youtube.com/playlist?list=PL08903FB7ACA1C2FB', language: 'English' },
      { title: 'DataLemur - Free SQL for Analysts & Data Scientists', type: 'Practice', provider: 'DataLemur', url: 'https://datalemur.com/', language: 'English' },
      { title: 'HackerRank SQL Domain Assessment (Free Certificate)', type: 'Practice', provider: 'HackerRank', url: 'https://www.hackerrank.com/domains/sql', language: 'Universal' },
    ],
    recommendedProjectNumber: 9, // Build simple database like SQLite
  },
  'statistics': {
    objective: 'Solidify foundational business statistics: central tendency, variance, standard deviation, and correlation analysis.',
    practiceTasks: [
      'Calculate Mean, Variance, and Standard Deviation by hand and in Python',
      'Compute Pearson Correlation Coefficient on bivariate marketing dataset',
      'Perform hypothesis testing (t-test / chi-square) in Jupyter Notebook',
    ],
    resources: [
      { title: 'Calculating Mean, Variance & Standard Deviation, Clearly Explained!', type: 'Video', provider: 'YouTube', url: 'https://www.youtube.com/watch?v=2ePf9rue1Ao', language: 'English' },
      { title: 'Pearson Correlation, Clearly Explained!', type: 'Video', provider: 'YouTube', url: 'https://www.youtube.com/watch?v=xZ_z8KWkhXE', language: 'English' },
    ],
  },
  'excel': {
    objective: 'Gain command of corporate spreadsheets: VLOOKUP/XLOOKUP, Pivot Tables, Conditional Formatting, and clean data modeling.',
    practiceTasks: [
      'Build dynamic financial summary using XLOOKUP and INDEX-MATCH',
      'Generate nested Pivot Tables with grouped dates and slicers',
      'Automate data validation and conditional heatmaps on sales records',
    ],
    resources: [
      { title: 'Excel Important Concepts in Tamil', type: 'Video', provider: 'YouTube (Tamil)', url: 'https://www.youtube.com/playlist?list=PLLHRrAfRqTbOkgwTSmW4-gftqltmhHTv2', language: 'Tamil' },
    ],
  },
  'tableau': {
    objective: 'Build interactive visual dashboards, parameter controls, and calculated fields in Tableau Desktop/Public.',
    practiceTasks: [
      'Connect Tableau Public to sample supermarket sales dataset',
      'Create calculated fields, LOD expressions, and dual-axis geographical maps',
      'Assemble a published portfolio dashboard on Tableau Public',
    ],
    resources: [
      { title: 'Tableau by Alex The Analyst', type: 'Video', provider: 'Alex The Analyst', url: 'https://www.youtube.com/playlist?list=PLUaB-1hjhk8GwbqoVmo_5zuhOa0Tcl3xC', language: 'English' },
    ],
  },
  'dsa': {
    objective: 'Master High-Frequency DSA patterns for Product and Service companies (Arrays, Strings, HashMaps, Two Pointers, Stacks, Trees).',
    practiceTasks: [
      'Solve Top 10 pattern problems before starting DSA',
      'Complete 20 Array & String problems on NeetCode 150',
      'Implement custom LinkedList, Stack, and Queue classes from scratch',
      'Practice 360 Leetcode patterns sheet (Priority Order)',
    ],
    resources: [
      { title: "Code Thanish's SDE Sheet (Foundations of Programming in Tamil)", type: 'Sheet', provider: 'Code Thanish', url: 'https://www.youtube.com/@CodeThanish', language: 'Tamil' },
      { title: "takeuforward - Strivers A2Z-DSA Course (Free Tracker)", type: 'Practice', provider: 'takeuforward', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', language: 'English' },
      { title: 'NeetCode 150 - YouTube & Practice', type: 'Practice', provider: 'NeetCode', url: 'https://neetcode.io/practice', language: 'English' },
      { title: 'GFG 19000+ Questions - Complete DSA', type: 'Practice', provider: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/explore?page=1&category=DSA', language: 'English' },
    ],
    recommendedProjectNumber: 7, // Build Git Client
  },
  'system design': {
    objective: 'Understand Low Level Design (LLD), Object-Oriented Design principles, and solve classic machine coding problems.',
    practiceTasks: [
      'Review and apply SOLID principles to a multi-class codebase',
      'Design Taxi Booking System class architecture (Zoho long coding pattern)',
      'Implement Elevator System state machine and Parking Lot LLD in Java/Python',
    ],
    resources: [
      { title: 'Zoho Taxi Booking System Low Level Design (code io Tamil)', type: 'Video', provider: 'code io', url: 'https://www.youtube.com/watch?v=Zf_cM0N9NSo', language: 'Tamil' },
      { title: 'System Design Playlist (English)', type: 'Video', provider: 'YouTube', url: 'https://www.youtube.com/playlist?list=PLMC9HnG_svVoUwt8Ut-NWwA0Pnfvi_pfg', language: 'English' },
      { title: 'Learn Low Level Design (LLD) on GitHub', type: 'Practice', provider: 'GitHub', url: 'https://github.com/ashishps1/awesome-low-level-design', language: 'English' },
    ],
    recommendedProjectNumber: 3, // Build REST API framework
  },
  'cloud computing': {
    objective: 'Deploy apps, configure storage buckets, compute instances, and understand serverless architecture on AWS/GCP.',
    practiceTasks: [
      'Launch EC2/Compute instance with Linux and host a sample web server',
      'Create S3/Cloud Storage bucket with IAM policy restrictions',
      'Build a simple Lambda / Cloud Function triggered by HTTP webhook',
    ],
    resources: [
      { title: 'AWS Cloud Fundamentals in 2 Hours', type: 'Video', provider: 'YouTube', url: 'https://www.youtube.com/watch?v=k1RI5locZE4', language: 'English' },
      { title: 'GitHub Student Developer Pack (Free Cloud Credits)', type: 'Course', provider: 'GitHub Education', url: 'https://education.github.com/pack', language: 'Universal' },
    ],
    recommendedProjectNumber: 6, // Load Balancer
  },
  'machine learning': {
    objective: 'End-to-end Machine Learning pipeline: EDA, feature engineering, regression, classification, and hyperparameter tuning.',
    practiceTasks: [
      'Implement Linear and Logistic Regression using NumPy matrix operations',
      'Train Random Forest & XGBoost classifiers with Scikit-Learn cross-validation',
      'Evaluate model using Confusion Matrix, ROC-AUC, and F1-score',
    ],
    resources: [
      { title: 'Complete Machine Learning in 6 Hours | Krish Naik', type: 'Course', provider: 'Krish Naik', url: 'https://www.youtube.com/watch?v=gmvvaob97vE', language: 'English' },
      { title: 'GitHub - nivu/ai_all_resources (Best Curated AI Resources)', type: 'Sheet', provider: 'GitHub', url: 'https://github.com/nivu/ai_all_resources', language: 'Universal' },
    ],
    recommendedProjectNumber: 15, // Neural network from scratch
  },
  'core cs': {
    objective: 'Master Computer Science pre-final interview MCQs: DBMS, SQL, OOPs, OS, and Computer Networks.',
    practiceTasks: [
      'Review ACID properties, 1NF/2NF/BCNF normalization, and ER diagrams',
      'Study Process vs Threads, CPU scheduling, and Deadlock Banker algorithm',
      'Memorize TCP vs UDP, 3-way handshake, and "What happens when you type google.com"',
    ],
    resources: [
      { title: 'Core Computer Science Crash Course (Tamil 2 hrs - Must Watch)', type: 'Course', provider: 'YouTube (Tamil)', url: 'https://www.youtube.com/watch?v=DFc2hB_7z6M', language: 'Tamil' },
      { title: 'Core CS MCQs Practice - Sanfoundry', type: 'Practice', provider: 'Sanfoundry', url: 'https://www.sanfoundry.com/1000-computer-science-questions-answers/', language: 'English' },
      { title: 'Computer Networking Full Course - OSI Model Deep Dive', type: 'Video', provider: 'YouTube', url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8', language: 'English' },
    ],
  },
};

/**
 * Generates an actionable, personalized 6-week placement roadmap based on actual identified skill gaps
 */
export function generatePersonalizedRoadmap(
  gaps: SkillGapItem[],
  targetRole: string = 'Data Analyst'
): RoadmapWeeklyItem[] {
  const missingOrPartialGaps = gaps.filter(
    (g) => g.status === 'MISSING' || g.status === 'PARTIAL'
  );

  // If no gaps or small number, include core placement foundations
  const prioritizedSkills: { skillName: string; priority: SkillGapItem['priority'] }[] = [];

  // Add missing items first by priority
  missingOrPartialGaps.forEach((gap) => {
    prioritizedSkills.push({ skillName: gap.skillName, priority: gap.priority });
  });

  // Default fallbacks to guarantee 6 rich weeks aligned with the PDF guide
  if (!prioritizedSkills.some((s) => s.skillName.toLowerCase().includes('sql'))) {
    prioritizedSkills.push({ skillName: 'SQL', priority: 'HIGH' });
  }
  if (!prioritizedSkills.some((s) => s.skillName.toLowerCase().includes('power bi'))) {
    prioritizedSkills.push({ skillName: 'Power BI', priority: 'HIGH' });
  }
  if (!prioritizedSkills.some((s) => s.skillName.toLowerCase().includes('excel'))) {
    prioritizedSkills.push({ skillName: 'Advanced Excel', priority: 'MEDIUM' });
  }
  if (!prioritizedSkills.some((s) => s.skillName.toLowerCase().includes('statistics'))) {
    prioritizedSkills.push({ skillName: 'Statistics', priority: 'MEDIUM' });
  }
  if (!prioritizedSkills.some((s) => s.skillName.toLowerCase().includes('dsa'))) {
    prioritizedSkills.push({ skillName: 'Data Structures & Algorithms', priority: 'HIGH' });
  }
  if (!prioritizedSkills.some((s) => s.skillName.toLowerCase().includes('cs'))) {
    prioritizedSkills.push({ skillName: 'Core CS (OS, DBMS, CN)', priority: 'HIGH' });
  }

  const weeklyItems: RoadmapWeeklyItem[] = [];

  for (let week = 1; week <= 6; week++) {
    const itemSkill = prioritizedSkills[week - 1] || prioritizedSkills[0];
    const skillKey = Object.keys(SKILL_RESOURCE_CURRICULUM).find((k) =>
      itemSkill.skillName.toLowerCase().includes(k)
    ) || 'sql';

    const curriculum = SKILL_RESOURCE_CURRICULUM[skillKey] || SKILL_RESOURCE_CURRICULUM['sql'];
    const projectIdea = curriculum.recommendedProjectNumber
      ? BUILD_YOUR_OWN_X_PROJECTS.find((p) => p.number === curriculum.recommendedProjectNumber)?.title
      : undefined;

    weeklyItems.push({
      id: `roadmap-w${week}-${Date.now()}`,
      week,
      phase: week <= 2 ? 'Foundations & Tooling' : week <= 4 ? 'Deep Dive & Production Practice' : 'Portfolio Project & Interview Readiness',
      title: `Week ${week}: ${itemSkill.skillName} Mastery`,
      skillName: itemSkill.skillName,
      priority: itemSkill.priority,
      objective: curriculum.objective,
      estimatedHours: 14 + (week % 3) * 2,
      completed: week === 1, // Week 1 marked as in-progress or completed for initial feedback
      practiceTasks: curriculum.practiceTasks,
      recommendedProjectIdea: projectIdea,
      resources: curriculum.resources,
    });
  }

  return weeklyItems;
}

/**
 * Recommends projects specifically targeting the candidate's detected missing skills
 */
export function getProjectRecommendationsForGaps(
  gaps: SkillGapItem[]
): ProjectRecommendation[] {
  const missingSkillNames = gaps
    .filter((g) => g.status === 'MISSING' || g.status === 'PARTIAL')
    .map((g) => g.skillName.toLowerCase());

  const scoredProjects = BUILD_YOUR_OWN_X_PROJECTS.map((proj) => {
    // Count how many missing skills this project addresses
    const addressedInGap = proj.skillsAddressed.filter((skill) =>
      missingSkillNames.some((m) => m.includes(skill.toLowerCase()) || skill.toLowerCase().includes(m))
    );

    const relevanceScore = addressedInGap.length;

    return {
      id: `proj-rec-${proj.number}`,
      number: proj.number,
      title: proj.title,
      category: proj.category,
      suggestedStack: proj.suggestedStack,
      skillsAddressed: proj.skillsAddressed,
      relevanceReason:
        proj.number === 3
          ? proj.relevanceReason
          : addressedInGap.length > 0
          ? `Directly closes your verified gaps in ${addressedInGap.join(', ')} through hands-on system building.`
          : proj.relevanceReason,
      difficulty: proj.difficulty,
      githubReference: proj.githubReference,
      addressedCount: relevanceScore,
    };
  });

  // Sort by highest relevance, then by project number
  scoredProjects.sort((a, b) => b.addressedCount - a.addressedCount || a.number - b.number);

  return scoredProjects;
}
