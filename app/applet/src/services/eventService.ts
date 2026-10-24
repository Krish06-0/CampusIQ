import { CollegeEvent } from '../types';

const STORAGE_KEY = 'max_placement_college_events_v1';

export const INITIAL_COLLEGE_EVENTS: CollegeEvent[] = [
  {
    id: 'evt-1',
    title: 'MAX National Hackathon 2026 — Adobe & VCET',
    organizingCollege: 'Vel Tech Multi Tech & Adobe Labs',
    category: 'Hackathon',
    eventDate: '2026-11-15',
    registrationDeadline: '2026-11-10',
    location: 'Main Auditorium & Hybrid Online',
    posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
    registrationUrl: 'https://max2026-hackathon.devpost.com',
    officialWebsite: 'https://max.adobe.com/hackathons/2026',
    description: 'Build cutting-edge generative AI & cloud applications using Adobe Firefly APIs and Google GenAI SDK. Exciting cash prizes worth ₹5,00,000 and direct internship interviews with Adobe product teams.',
    eligibility: 'All B.E. / B.Tech 2nd, 3rd, and 4th-year students across CSE, IT, AI & DS, and CSE (AI & ML).',
    participationFee: 'Free (Sponsored by Adobe)',
    contactDetails: 'Dr. R. Sundar (convener@vcet.ac.in | +91 98401 23456)',
    status: 'Published',
    createdBy: 'hod.cse@vcet.ac.in',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    interestedStudentIds: ['22AIDS014', '22CS7A01', '22IT05'],
  },
  {
    id: 'evt-2',
    title: 'AI & Deep Learning National Symposium 2026',
    organizingCollege: 'IIT Madras Research Park & VCET',
    category: 'Technical Symposium',
    eventDate: '2026-11-22',
    registrationDeadline: '2026-11-18',
    location: 'IITM Research Park Convention Center, Chennai',
    posterUrl: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&q=80&w=800',
    registrationUrl: 'https://iitm-symposium2026.org/register',
    officialWebsite: 'https://iitm-symposium2026.org',
    description: 'A premier national gathering of researchers, students, and industry practitioners exploring Large Language Models, PyTorch optimization, and real-world transformer architectures.',
    eligibility: 'UG/PG students with strong background in Python and Machine Learning.',
    participationFee: '₹300 per participant',
    contactDetails: 'Prof. Anitha V. (aids.dept@vcet.ac.in | +91 94432 98765)',
    status: 'Published',
    createdBy: 'staff.manoj@college.edu',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    interestedStudentIds: ['22AIDS014'],
  },
  {
    id: 'evt-3',
    title: 'Cloud Architecture & DevOps Hands-on Workshop',
    organizingCollege: 'AWS Cloud Club & VCET IT Dept',
    category: 'Workshop',
    eventDate: '2026-12-02',
    registrationDeadline: '2026-11-28',
    location: 'IT Lab 3 & Online Live Stream',
    posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    registrationUrl: 'https://aws.educate.com/vcet-workshop2026',
    officialWebsite: 'https://vcet.ac.in/it/devops2026',
    description: 'Comprehensive 1-day immersive workshop covering Docker containerization, Kubernetes orchestration, CI/CD pipelines with GitHub Actions, and AWS serverless deployment.',
    eligibility: '3rd and 4th-year IT and CSE students.',
    participationFee: 'Free for MAX 2026 Enrolled Students',
    contactDetails: 'hod.it@vcet.ac.in',
    status: 'Published',
    createdBy: 'hod.it@vcet.ac.in',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    interestedStudentIds: [],
  },
  {
    id: 'evt-4',
    title: 'Global CodeSprint Inter-College Coding Championship',
    organizingCollege: 'Microsoft Student Chapter & Anna University',
    category: 'Competition',
    eventDate: '2026-12-10',
    registrationDeadline: '2026-12-05',
    location: 'Online Platform (HackerRank / Codeforces)',
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    registrationUrl: 'https://codesprint2026.dev',
    description: 'Algorithmic problem-solving challenge featuring 5 complex competitive programming problems ranging from graph theory to dynamic programming.',
    eligibility: 'Open to all engineering students.',
    participationFee: 'Free',
    contactDetails: 'support@codesprint2026.dev',
    status: 'Draft',
    createdBy: 'madhu.aiml@vcet.ac.in',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interestedStudentIds: [],
  }
];

export function getCollegeEvents(): CollegeEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COLLEGE_EVENTS));
      return INITIAL_COLLEGE_EVENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load college events:', err);
    return INITIAL_COLLEGE_EVENTS;
  }
}

export function saveCollegeEvent(eventData: Partial<CollegeEvent>, userEmail: string): CollegeEvent {
  const events = getCollegeEvents();
  const now = new Date().toISOString();
  
  if (eventData.id) {
    // Update existing
    const index = events.findIndex(e => e.id === eventData.id);
    if (index !== -1) {
      const updated: CollegeEvent = {
        ...events[index],
        ...eventData,
        updatedAt: now,
      } as CollegeEvent;
      events[index] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      return updated;
    }
  }

  // Create new
  const newEvent: CollegeEvent = {
    id: `evt-${Date.now()}`,
    title: eventData.title || 'Untitled College Event',
    organizingCollege: eventData.organizingCollege || 'VCET Institution',
    category: eventData.category || 'Workshop',
    eventDate: eventData.eventDate || new Date().toISOString().split('T')[0],
    registrationDeadline: eventData.registrationDeadline,
    location: eventData.location || 'Campus Auditorium',
    posterUrl: eventData.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    registrationUrl: eventData.registrationUrl || 'https://example.com/register',
    officialWebsite: eventData.officialWebsite,
    description: eventData.description || 'No description provided.',
    eligibility: eventData.eligibility || 'All students',
    participationFee: eventData.participationFee || 'Free',
    contactDetails: eventData.contactDetails || userEmail,
    status: eventData.status || 'Published',
    createdBy: userEmail,
    createdAt: now,
    updatedAt: now,
    interestedStudentIds: [],
  };

  events.unshift(newEvent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  return newEvent;
}

export function deleteCollegeEvent(id: string): CollegeEvent[] {
  const events = getCollegeEvents();
  const filtered = events.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

export function toggleEventInterest(eventId: string, studentId: string): CollegeEvent[] {
  const events = getCollegeEvents();
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    const event = events[index];
    const isInterested = event.interestedStudentIds.includes(studentId);
    if (isInterested) {
      event.interestedStudentIds = event.interestedStudentIds.filter(id => id !== studentId);
    } else {
      event.interestedStudentIds.push(studentId);
    }
    event.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }
  return events;
}
