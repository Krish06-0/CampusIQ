
export type TrainingCategory = 
  | 'Cloud Computing' 
  | 'AWS' 
  | 'Azure' 
  | 'Google Cloud' 
  | 'Java' 
  | 'Python' 
  | 'SQL' 
  | 'Power BI' 
  | 'Data Analytics' 
  | 'Machine Learning' 
  | 'AI' 
  | 'Web Development' 
  | 'Aptitude' 
  | 'Communication Skills' 
  | 'Other';

export type TrainingStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface ScheduledTrainingSprint {
  id: string;
  title: string;
  category: TrainingCategory;
  trainingDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "01:00 PM"
  registrationDeadline: string; // YYYY-MM-DDTHH:mm
  venue: string;
  trainer: string;
  description: string;
  eligibilityAndPrerequisites: string;
  posterUrl?: string;
  registrationLink?: string;
  externalWebsite?: string;
  capacity?: number;
  status: TrainingStatus;
  targetGap?: string;
  interestedStudentIds: string[];
  createdBy: string;
  createdAt: string;
}
