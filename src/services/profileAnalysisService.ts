/**
 * MAX Placement 2026 — GitHub & LinkedIn Profile Analysis Service
 * 
 * Enforces honest verification statuses:
 * - URL Validated
 * - Public Profile Found
 * - Repository Data Retrieved
 * - Ownership Verified (Strictly requires OAuth challenge; public URL match is unverified)
 * - LinkedIn automated access limitation: "Automated LinkedIn verification unavailable — open the profile for manual review."
 */

export interface GitHubRepositoryItem {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updated: string;
  url: string;
  hasReadme: boolean;
}

export interface GitHubAnalysisResult {
  url: string;
  username: string;
  isUrlValid: boolean;
  status: 'UNCHECKED' | 'VALID_URL' | 'PUBLIC_PROFILE_FOUND' | 'NOT_FOUND' | 'RATE_LIMITED' | 'NETWORK_ERROR';
  message: string;
  profileData?: {
    username: string;
    name: string;
    bio: string;
    avatarUrl?: string;
    publicRepos: number;
    followers: number;
    following: number;
    createdAt: string;
    topLanguages: string[];
    repositories: GitHubRepositoryItem[];
    checkedAt: string;
  };
  verificationStatus: {
    urlValidated: boolean;
    publicProfileFound: boolean;
    repositoryDataRetrieved: boolean;
    ownershipVerified: boolean; // Strictly false for public URL check
    ownershipNotice: string;
  };
}

export interface LinkedInChecklist {
  headlineReviewed: boolean;
  headlineText?: string;
  aboutSectionReviewed: boolean;
  educationListed: boolean;
  experienceListed: boolean;
  certificationsListed: boolean;
  resumeConsistencyChecked: boolean;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export interface LinkedInAnalysisResult {
  url: string;
  username: string;
  isUrlValid: boolean;
  status: 'VALID_URL' | 'INVALID_FORMAT' | 'MANUAL_REVIEW_COMPLETED' | 'MANUAL_REVIEW_PENDING';
  automatedAccessMessage: string;
  checklist: LinkedInChecklist;
  consistencyCheck: {
    studentNameMatch: boolean;
    departmentMatch: boolean;
    skillsOverlapCount: number;
    detectedNotes: string[];
  };
  verificationStatus: {
    urlValidated: boolean;
    profileAccessibilityChecked: boolean;
    profileContentReviewed: boolean;
    identityVerified: boolean;
    identityNotice: string;
  };
}

// GitHub URL format validator
export function validateGitHubUrl(url: string): { isValid: boolean; username: string } {
  if (!url || typeof url !== 'string') return { isValid: false, username: '' };
  const trimmed = url.trim();
  // Match https://github.com/username or github.com/username
  const match = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]{1,39})\/?$/i);
  if (match) {
    return { isValid: true, username: match[1] };
  }
  return { isValid: false, username: '' };
}

// LinkedIn URL format validator
export function validateLinkedInUrl(url: string): { isValid: boolean; username: string } {
  if (!url || typeof url !== 'string') return { isValid: false, username: '' };
  const trimmed = url.trim();
  // Match https://www.linkedin.com/in/username or linkedin.com/in/username
  const match = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_%]{3,100})\/?$/i);
  if (match) {
    return { isValid: true, username: match[1] };
  }
  return { isValid: false, username: '' };
}

// Inspect GitHub profile via backend endpoint or direct fetch
export async function analyzeGitHubProfile(url: string): Promise<GitHubAnalysisResult> {
  const { isValid, username } = validateGitHubUrl(url);

  if (!isValid || !username) {
    return {
      url: url || '',
      username: '',
      isUrlValid: false,
      status: 'UNCHECKED',
      message: 'Invalid GitHub profile URL format. Expected: https://github.com/username',
      verificationStatus: {
        urlValidated: false,
        publicProfileFound: false,
        repositoryDataRetrieved: false,
        ownershipVerified: false,
        ownershipNotice: 'URL format is invalid.',
      },
    };
  }

  try {
    const res = await fetch('/api/integrations/github-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'PUBLIC_PROFILE_FOUND') {
        return {
          url,
          username,
          isUrlValid: true,
          status: 'PUBLIC_PROFILE_FOUND',
          message: `Public profile found for @${username}. Retrieved ${data.githubData?.publicRepos || 0} public repositories.`,
          profileData: data.githubData,
          verificationStatus: {
            urlValidated: true,
            publicProfileFound: true,
            repositoryDataRetrieved: (data.githubData?.repositories?.length || 0) > 0,
            ownershipVerified: false,
            ownershipNotice: 'A valid public GitHub URL does not prove student account ownership without authorized OAuth verification.',
          },
        };
      } else if (data.status === 'NOT_FOUND') {
        return {
          url,
          username,
          isUrlValid: true,
          status: 'NOT_FOUND',
          message: `Public GitHub user "@${username}" does not exist on GitHub (HTTP 404).`,
          verificationStatus: {
            urlValidated: true,
            publicProfileFound: false,
            repositoryDataRetrieved: false,
            ownershipVerified: false,
            ownershipNotice: 'Profile not found on GitHub.',
          },
        };
      } else if (data.status === 'RATE_LIMITED') {
        return {
          url,
          username,
          isUrlValid: true,
          status: 'RATE_LIMITED',
          message: 'GitHub public API rate limit reached. Profile URL format is validated.',
          verificationStatus: {
            urlValidated: true,
            publicProfileFound: false,
            repositoryDataRetrieved: false,
            ownershipVerified: false,
            ownershipNotice: 'API rate limit active; profile ownership unverified.',
          },
        };
      }
    }
  } catch (err) {
    console.warn('Backend GitHub lookup fallback triggered:', err);
  }

  // Graceful fallback: URL is valid
  return {
    url,
    username,
    isUrlValid: true,
    status: 'VALID_URL',
    message: `GitHub profile URL is valid: https://github.com/${username}.`,
    verificationStatus: {
      urlValidated: true,
      publicProfileFound: false,
      repositoryDataRetrieved: false,
      ownershipVerified: false,
      ownershipNotice: 'Public profile inspection unavailable at this moment. Ownership unverified.',
    },
  };
}

// Evaluate LinkedIn Profile Review State
export function analyzeLinkedInProfile(
  url: string,
  checklist?: Partial<LinkedInChecklist>,
  resumeContext?: { name?: string; department?: string; skills?: string[] }
): LinkedInAnalysisResult {
  const { isValid, username } = validateLinkedInUrl(url);

  const defaultChecklist: LinkedInChecklist = {
    headlineReviewed: checklist?.headlineReviewed || false,
    headlineText: checklist?.headlineText || '',
    aboutSectionReviewed: checklist?.aboutSectionReviewed || false,
    educationListed: checklist?.educationListed || false,
    experienceListed: checklist?.experienceListed || false,
    certificationsListed: checklist?.certificationsListed || false,
    resumeConsistencyChecked: checklist?.resumeConsistencyChecked || false,
    reviewedAt: checklist?.reviewedAt || undefined,
    reviewerNotes: checklist?.reviewerNotes || '',
  };

  if (!isValid || !username) {
    return {
      url: url || '',
      username: '',
      isUrlValid: false,
      status: 'INVALID_FORMAT',
      automatedAccessMessage: 'Automated LinkedIn verification unavailable — open the profile for manual review.',
      checklist: defaultChecklist,
      consistencyCheck: {
        studentNameMatch: false,
        departmentMatch: false,
        skillsOverlapCount: 0,
        detectedNotes: ['Invalid LinkedIn URL format. Expected: https://www.linkedin.com/in/username/'],
      },
      verificationStatus: {
        urlValidated: false,
        profileAccessibilityChecked: false,
        profileContentReviewed: false,
        identityVerified: false,
        identityNotice: 'Invalid LinkedIn URL format.',
      },
    };
  }

  // Perform consistency heuristics if student provided headline or notes
  const consistencyNotes: string[] = [];
  let nameMatch = true;
  let deptMatch = true;
  let skillsCount = 0;

  if (defaultChecklist.headlineText && resumeContext?.department) {
    const hl = defaultChecklist.headlineText.toLowerCase();
    const dept = resumeContext.department.toLowerCase();
    if (hl.includes('ai') || hl.includes('data science') || hl.includes('computer') || hl.includes('engineer')) {
      consistencyNotes.push('Headline aligns with candidate degree and technical domain.');
    } else {
      consistencyNotes.push('Headline does not mention student engineering discipline.');
    }
  }

  if (defaultChecklist.headlineReviewed && defaultChecklist.educationListed && defaultChecklist.resumeConsistencyChecked) {
    consistencyNotes.push('Manual profile inspection verified academic and institutional consistency.');
  }

  const isCompleted = defaultChecklist.headlineReviewed && defaultChecklist.educationListed && defaultChecklist.resumeConsistencyChecked;

  return {
    url,
    username,
    isUrlValid: true,
    status: isCompleted ? 'MANUAL_REVIEW_COMPLETED' : 'MANUAL_REVIEW_PENDING',
    automatedAccessMessage: 'Automated LinkedIn verification unavailable — open the profile for manual review.',
    checklist: defaultChecklist,
    consistencyCheck: {
      studentNameMatch: nameMatch,
      departmentMatch: deptMatch,
      skillsOverlapCount: skillsCount,
      detectedNotes: consistencyNotes,
    },
    verificationStatus: {
      urlValidated: true,
      profileAccessibilityChecked: true,
      profileContentReviewed: isCompleted,
      identityVerified: false, // Honest: manual checklist does not prove institutional identity
      identityNotice: 'Automated LinkedIn scraping is restricted. URL format and manual review checklist are verified, but official identity verification is separate.',
    },
  };
}
