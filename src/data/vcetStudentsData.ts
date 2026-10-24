import { ALL_OFFICIAL_AIDS_STUDENTS, OfficialPdfStudentRecord } from './officialAidsPdfsData';
import { ALL_OFFICIAL_CSEAIML_STUDENTS, OfficialCseAimlStudentRecord } from './officialCseAimlPdfsData';
import { ALL_OFFICIAL_CSE_STUDENTS, OfficialCseStudentRecord } from './officialCsePdfsData';
import { ALL_OFFICIAL_IT_STUDENTS, OfficialItStudentRecord } from './officialItPdfsData';

/**
 * Official VCET Student Directory & Class Mentorship Data Engine
 * Covers all departments from official college name list records:
 * - Artificial Intelligence and Data Science (AI & DS): 299 Students (from 3 official PDFs)
 * - Computer Science and Engineering (CSE): 432 Students (from 3 official PDFs: 128 + 118 + 186)
 * - Information Technology (IT): 366 Students (from 3 official PDFs: 122 + 122 + 122)
 * - CSE (Artificial Intelligence and Machine Learning): 178 Students (from 3 official PDFs: 59 + 56 + 63)
 *
 * Total verified students in central database: 1,275 students across 21 classes.
 */

export interface VcetClassInfo {
  classCode: string; // e.g. "24AD5A", "22CS01", "22IT01", "23AM01"
  className: string; // e.g. "II Year AI & DS - Section A"
  department: string;
  departmentCode: string; // "AI & DS" | "CSE" | "IT" | "CSE (AI & ML)"
  batch: string; // e.g. "2024-2028", "2022-2026"
  academicYear: string; // e.g. "2025-2026"
  semester: number; // e.g. 4
  year: number; // e.g. 2
  facultyAdvisorId: string;
  facultyAdvisorName: string;
  facultyAdvisorEmail: string;
  totalStudents: number;
}

export interface VcetStudentData {
  id: string;
  registerNumber: string;
  rollNumber: string;
  name: string;
  classCode: string;
  batch: string;
  academicYear: string;
  semester: number;
  year: number;
  department: string;
  departmentCode: string;
  cgpa: number;
  backlogs: number;
  phone: string;
  email: string;
  profileCompletion: number;
  // Placement & Skills flags
  hasPowerBi: boolean;
  hasSql: boolean;
  hasCloud: boolean;
  hasPython: boolean;
  hasJava: boolean;
  hasDsa: boolean;
  hasStats: boolean;
  hasExcel: boolean;
  targetRole?: string;
  githubUrl?: string;
  linkedInUrl?: string;
  leetCodeCount?: number;
  verifiedProjectsCount?: number;
  certificationsCount?: number;
  facultyRemarks?: string;
  endorsementStatus?: 'PENDING' | 'ENDORSED' | 'REVIEW_REQUESTED';
  sourcePdf?: string;
  needsVerification?: boolean;
}

export interface VcetFacultyMentor {
  id: string;
  name: string;
  email: string;
  role: 'STAFF';
  designation: string;
  department: string;
  assignedClassCodes: string[]; // Classes this faculty advises
  isDepartmentHead?: boolean;
}

export const VCET_CLASSES: VcetClassInfo[] = [
  // AI & DS Department Classes (299 Students strictly from the 3 official PDFs in requested order)
  // 1. PDF 1: 4th Year — Batch 2023–2027 (Class 23AD07, Semester 07) — 60 Students
  {
    classCode: '23AD07',
    className: 'IV Year AI & DS — Batch 2023-2027',
    department: 'Artificial Intelligence and Data Science',
    departmentCode: 'AI & DS',
    batch: '2023-2027',
    academicYear: '2026-2027',
    semester: 7,
    year: 4,
    facultyAdvisorId: 'user-staff-senthil',
    facultyAdvisorName: 'Prof. R. Senthil Kumar',
    facultyAdvisorEmail: 'senthil.aids@college.edu',
    totalStudents: 60,
  },
  // 2. PDF 2: 3rd Year — Batch 2024–2028 (Classes 24AD5A & 24AD5B, Semester 05) — 116 Students
  {
    classCode: '24AD5A',
    className: 'III Year AI & DS — Section A',
    department: 'Artificial Intelligence and Data Science',
    departmentCode: 'AI & DS',
    batch: '2024-2028',
    academicYear: '2026-2027',
    semester: 5,
    year: 3,
    facultyAdvisorId: 'user-staff-manoj',
    facultyAdvisorName: 'Prof. V. Manoj Praveen',
    facultyAdvisorEmail: 'staff.manoj@college.edu',
    totalStudents: 58,
  },
  {
    classCode: '24AD5B',
    className: 'III Year AI & DS — Section B',
    department: 'Artificial Intelligence and Data Science',
    departmentCode: 'AI & DS',
    batch: '2024-2028',
    academicYear: '2026-2027',
    semester: 5,
    year: 3,
    facultyAdvisorId: 'user-staff-sangeetha',
    facultyAdvisorName: 'Dr. P. Sangeetha',
    facultyAdvisorEmail: 'sangeetha.aids@college.edu',
    totalStudents: 58,
  },
  // 3. PDF 3: 2nd Year — Batch 2025–2029 (Classes 25AD3A & 25AD3B, Semester 03) — 123 Students
  {
    classCode: '25AD3A',
    className: 'II Year AI & DS — Section A',
    department: 'Artificial Intelligence and Data Science',
    departmentCode: 'AI & DS',
    batch: '2025-2029',
    academicYear: '2026-2027',
    semester: 3,
    year: 2,
    facultyAdvisorId: 'user-staff-arulmozhi',
    facultyAdvisorName: 'Dr. K. Arulmozhi',
    facultyAdvisorEmail: 'arulmozhi.aids@college.edu',
    totalStudents: 62,
  },
  {
    classCode: '25AD3B',
    className: 'II Year AI & DS — Section B',
    department: 'Artificial Intelligence and Data Science',
    departmentCode: 'AI & DS',
    batch: '2025-2029',
    academicYear: '2026-2027',
    semester: 3,
    year: 2,
    facultyAdvisorId: 'user-staff-deepa',
    facultyAdvisorName: 'Prof. M. Deepa',
    facultyAdvisorEmail: 'deepa.aids@college.edu',
    totalStudents: 61,
  },

  // CSE Department Classes (432 Students strictly from 3 official PDFs in requested order)
  // PDF 1: 4th Year — Batch 2022–2026 (Classes 22CS7A & 22CS7B, Semester 07) — 128 Students
  {
    classCode: '22CS7A',
    className: 'IV Year CSE — Section A',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    batch: '2022-2026',
    academicYear: '2025-2026',
    semester: 7,
    year: 4,
    facultyAdvisorId: 'user-staff-cse-karthikeyan',
    facultyAdvisorName: 'Dr. N. Karthikeyan',
    facultyAdvisorEmail: 'karthikeyan.cse@vcet.ac.in',
    totalStudents: 64,
  },
  {
    classCode: '22CS7B',
    className: 'IV Year CSE — Section B',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    batch: '2022-2026',
    academicYear: '2025-2026',
    semester: 7,
    year: 4,
    facultyAdvisorId: 'user-staff-cse-saravanan',
    facultyAdvisorName: 'Prof. B. Saravanan',
    facultyAdvisorEmail: 'saravanan.cse@vcet.ac.in',
    totalStudents: 64,
  },
  // PDF 2: 3rd Year — Batch 2023–2027 (Classes 23CS5A & 23CS5B, Semester 05) — 118 Students
  {
    classCode: '23CS5A',
    className: 'III Year CSE — Section A',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    batch: '2023-2027',
    academicYear: '2025-2026',
    semester: 5,
    year: 3,
    facultyAdvisorId: 'user-staff-cse-sangeetha',
    facultyAdvisorName: 'Dr. M. Sangeetha',
    facultyAdvisorEmail: 'sangeetha.cse@vcet.ac.in',
    totalStudents: 59,
  },
  {
    classCode: '23CS5B',
    className: 'III Year CSE — Section B',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    batch: '2023-2027',
    academicYear: '2025-2026',
    semester: 5,
    year: 3,
    facultyAdvisorId: 'user-staff-cse-muthuraj',
    facultyAdvisorName: 'Prof. D. Muthuraj',
    facultyAdvisorEmail: 'muthuraj.cse@vcet.ac.in',
    totalStudents: 59,
  },
  // PDF 3: 2nd Year — Batch 2024–2028 (Classes 24CS3A, 24CS3B & 24CS3C, Semester 03) — 186 Students
  {
    classCode: '24CS3A',
    className: 'II Year CSE — Section A',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    batch: '2024-2028',
    academicYear: '2025-2026',
    semester: 3,
    year: 2,
    facultyAdvisorId: 'user-staff-cse-anitha',
    facultyAdvisorName: 'Prof. V. Anitha',
    facultyAdvisorEmail: 'anitha.cse@vcet.ac.in',
    totalStudents: 62,
  },
  {
    classCode: '24CS3B',
    className: 'II Year CSE — Section B',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    batch: '2024-2028',
    academicYear: '2025-2026',
    semester: 3,
    year: 2,
    facultyAdvisorId: 'user-staff-cse-balamurugan',
    facultyAdvisorName: 'Prof. K. Balamurugan',
    facultyAdvisorEmail: 'balamurugan.cse@vcet.ac.in',
    totalStudents: 62,
  },
  {
    classCode: '24CS3C',
    className: 'II Year CSE — Section C',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    batch: '2024-2028',
    academicYear: '2025-2026',
    semester: 3,
    year: 2,
    facultyAdvisorId: 'user-staff-cse-senthilkumar',
    facultyAdvisorName: 'Dr. S. Senthil Kumar (HOD/CSE)',
    facultyAdvisorEmail: 'hod.cse@vcet.ac.in',
    totalStudents: 62,
  },

  // Information Technology (IT) Classes (366 Students strictly from 3 official PDFs in requested order)
  // PDF 1: 4th Year — Batch 2023–2027 (Classes 23IT7A & 23IT7B, Semester 07) — 122 Students
  {
    classCode: '23IT7A',
    className: 'IV Year IT — Section A',
    department: 'Information Technology',
    departmentCode: 'IT',
    batch: '2023-2027',
    academicYear: '2026-2027',
    semester: 7,
    year: 4,
    facultyAdvisorId: 'user-staff-it-anand',
    facultyAdvisorName: 'Dr. M. Anand',
    facultyAdvisorEmail: 'anand.it@vcet.ac.in',
    totalStudents: 61,
  },
  {
    classCode: '23IT7B',
    className: 'IV Year IT — Section B',
    department: 'Information Technology',
    departmentCode: 'IT',
    batch: '2023-2027',
    academicYear: '2026-2027',
    semester: 7,
    year: 4,
    facultyAdvisorId: 'user-staff-it-ramesh',
    facultyAdvisorName: 'Prof. S. Ramesh',
    facultyAdvisorEmail: 'ramesh.it@vcet.ac.in',
    totalStudents: 61,
  },
  // PDF 2: 3rd Year — Batch 2024–2028 (Classes 24IT5A & 24IT5B, Semester 05) — 122 Students
  {
    classCode: '24IT5A',
    className: 'III Year IT — Section A',
    department: 'Information Technology',
    departmentCode: 'IT',
    batch: '2024-2028',
    academicYear: '2026-2027',
    semester: 5,
    year: 3,
    facultyAdvisorId: 'user-staff-it-priya',
    facultyAdvisorName: 'Dr. R. Priya',
    facultyAdvisorEmail: 'priya.it@vcet.ac.in',
    totalStudents: 61,
  },
  {
    classCode: '24IT5B',
    className: 'III Year IT — Section B',
    department: 'Information Technology',
    departmentCode: 'IT',
    batch: '2024-2028',
    academicYear: '2026-2027',
    semester: 5,
    year: 3,
    facultyAdvisorId: 'user-staff-it-prakash',
    facultyAdvisorName: 'Prof. P. Prakash',
    facultyAdvisorEmail: 'prakash.it@vcet.ac.in',
    totalStudents: 61,
  },
  // PDF 3: 2nd Year — Batch 2025–2029 (Classes 25IT3A & 25IT3B, Semester 03) — 122 Students
  {
    classCode: '25IT3A',
    className: 'II Year IT — Section A',
    department: 'Information Technology',
    departmentCode: 'IT',
    batch: '2025-2029',
    academicYear: '2026-2027',
    semester: 3,
    year: 2,
    facultyAdvisorId: 'user-staff-it-karthik',
    facultyAdvisorName: 'Prof. T. Karthik',
    facultyAdvisorEmail: 'karthik.it@vcet.ac.in',
    totalStudents: 61,
  },
  {
    classCode: '25IT3B',
    className: 'II Year IT — Section B',
    department: 'Information Technology',
    departmentCode: 'IT',
    batch: '2025-2029',
    academicYear: '2026-2027',
    semester: 3,
    year: 2,
    facultyAdvisorId: 'user-staff-it-kavitha',
    facultyAdvisorName: 'Dr. V. Kavitha (HOD/IT)',
    facultyAdvisorEmail: 'hod.it@vcet.ac.in',
    totalStudents: 61,
  },

  // CSE (Artificial Intelligence and Machine Learning) Classes (178 Students strictly from official PDFs in requested order)
  // 1. PDF 1: 4th Year — Batch 2023–2027 (Class 23AM07, Semester 07) — 59 Students
  {
    classCode: '23AM07',
    className: 'IV Year CSE (AI & ML) — Batch 2023-2027',
    department: 'CSE (Artificial Intelligence and Machine Learning)',
    departmentCode: 'CSE (AI & ML)',
    batch: '2023-2027',
    academicYear: '2026-2027',
    semester: 7,
    year: 4,
    facultyAdvisorId: 'user-staff-madhu',
    facultyAdvisorName: 'Prof. V. Madhu',
    facultyAdvisorEmail: 'madhu.aiml@vcet.ac.in',
    totalStudents: 59,
  },
  // 2. PDF 2: 3rd Year — Batch 2024–2028 (Class 24AM05, Semester 05) — 56 Students
  {
    classCode: '24AM05',
    className: 'III Year CSE (AI & ML) — Batch 2024-2028',
    department: 'CSE (Artificial Intelligence and Machine Learning)',
    departmentCode: 'CSE (AI & ML)',
    batch: '2024-2028',
    academicYear: '2026-2027',
    semester: 5,
    year: 3,
    facultyAdvisorId: 'user-staff-tamilselvi',
    facultyAdvisorName: 'Prof. P. Tamilselvi',
    facultyAdvisorEmail: 'tamilselvi.aiml@vcet.ac.in',
    totalStudents: 56,
  },
  // 3. PDF 3: 2nd Year — Batch 2025–2029 (Class 25AM03, Semester 03) — 63 Students
  {
    classCode: '25AM03',
    className: 'II Year CSE (AI & ML) — Batch 2025-2029',
    department: 'CSE (Artificial Intelligence and Machine Learning)',
    departmentCode: 'CSE (AI & ML)',
    batch: '2025-2029',
    academicYear: '2026-2027',
    semester: 3,
    year: 2,
    facultyAdvisorId: 'user-staff-kiruthika',
    facultyAdvisorName: 'Prof. A. Kiruthika',
    facultyAdvisorEmail: 'kiruthika.aiml@vcet.ac.in',
    totalStudents: 63,
  },
];

export const VCET_FACULTY_MENTORS: VcetFacultyMentor[] = [
  {
    id: 'user-staff-manoj',
    name: 'Prof. V. Manoj Praveen',
    email: 'staff.manoj@college.edu',
    role: 'STAFF',
    designation: 'Assistant Professor & Placement Coordinator',
    department: 'Artificial Intelligence & Data Science',
    assignedClassCodes: ['24AD5A'],
  },
  {
    id: 'user-staff-sangeetha',
    name: 'Dr. P. Sangeetha',
    email: 'sangeetha.aids@college.edu',
    role: 'STAFF',
    designation: 'Associate Professor & Class Mentor',
    department: 'Artificial Intelligence & Data Science',
    assignedClassCodes: ['24AD5B'],
  },
  {
    id: 'user-staff-senthil',
    name: 'Prof. R. Senthil Kumar',
    email: 'senthil.aids@college.edu',
    role: 'STAFF',
    designation: 'Assistant Professor & Pre-Final Year Mentor',
    department: 'Artificial Intelligence & Data Science',
    assignedClassCodes: ['23AD07'],
  },
  {
    id: 'user-staff-arulmozhi',
    name: 'Dr. K. Arulmozhi',
    email: 'arulmozhi.aids@college.edu',
    role: 'STAFF',
    designation: 'Professor & First Year Mentor',
    department: 'Artificial Intelligence & Data Science',
    assignedClassCodes: ['25AD3A'],
  },
  {
    id: 'user-staff-deepa',
    name: 'Prof. M. Deepa',
    email: 'deepa.aids@college.edu',
    role: 'STAFF',
    designation: 'Assistant Professor & First Year Advisor',
    department: 'Artificial Intelligence & Data Science',
    assignedClassCodes: ['25AD3B'],
  },
  {
    id: 'user-staff-madhu',
    name: 'Prof. V. Madhu',
    email: 'madhu.aiml@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & Final Year Advisor (CSE AI & ML)',
    department: 'CSE (Artificial Intelligence & Machine Learning)',
    assignedClassCodes: ['23AM07'],
  },
  {
    id: 'user-staff-tamilselvi',
    name: 'Prof. P. Tamilselvi',
    email: 'tamilselvi.aiml@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & Pre-Final Year Advisor (CSE AI & ML)',
    department: 'CSE (Artificial Intelligence & Machine Learning)',
    assignedClassCodes: ['24AM05'],
  },
  {
    id: 'user-staff-kiruthika',
    name: 'Prof. A. Kiruthika',
    email: 'kiruthika.aiml@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & Second Year Advisor (CSE AI & ML)',
    department: 'CSE (Artificial Intelligence & Machine Learning)',
    assignedClassCodes: ['25AM03'],
  },
  {
    id: 'user-staff-cse-senthilkumar',
    name: 'Dr. S. Senthil Kumar (HOD/CSE)',
    email: 'hod.cse@vcet.ac.in',
    role: 'STAFF',
    designation: 'Professor & Head of Department (CSE)',
    department: 'Computer Science and Engineering',
    assignedClassCodes: ['22CS7A', '22CS7B', '23CS5A', '23CS5B', '24CS3A', '24CS3B', '24CS3C'],
    isDepartmentHead: true,
  },
  {
    id: 'user-staff-cse-karthikeyan',
    name: 'Dr. N. Karthikeyan',
    email: 'karthikeyan.cse@vcet.ac.in',
    role: 'STAFF',
    designation: 'Associate Professor & IV Year CSE-A Advisor',
    department: 'Computer Science and Engineering',
    assignedClassCodes: ['22CS7A'],
  },
  {
    id: 'user-staff-cse-saravanan',
    name: 'Prof. B. Saravanan',
    email: 'saravanan.cse@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & IV Year CSE-B Advisor',
    department: 'Computer Science and Engineering',
    assignedClassCodes: ['22CS7B'],
  },
  {
    id: 'user-staff-cse-sangeetha',
    name: 'Dr. M. Sangeetha',
    email: 'sangeetha.cse@vcet.ac.in',
    role: 'STAFF',
    designation: 'Associate Professor & III Year CSE-A Advisor',
    department: 'Computer Science and Engineering',
    assignedClassCodes: ['23CS5A'],
  },
  {
    id: 'user-staff-cse-muthuraj',
    name: 'Prof. D. Muthuraj',
    email: 'muthuraj.cse@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & III Year CSE-B Advisor',
    department: 'Computer Science and Engineering',
    assignedClassCodes: ['23CS5B'],
  },
  {
    id: 'user-staff-cse-anitha',
    name: 'Prof. V. Anitha',
    email: 'anitha.cse@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & II Year CSE-A Advisor',
    department: 'Computer Science and Engineering',
    assignedClassCodes: ['24CS3A'],
  },
  {
    id: 'user-staff-cse-balamurugan',
    name: 'Prof. K. Balamurugan',
    email: 'balamurugan.cse@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & II Year CSE-B Advisor',
    department: 'Computer Science and Engineering',
    assignedClassCodes: ['24CS3B'],
  },
  {
    id: 'user-staff-it-kavitha',
    name: 'Dr. V. Kavitha (HOD/IT)',
    email: 'hod.it@vcet.ac.in',
    role: 'STAFF',
    designation: 'Professor & Head of Department (IT)',
    department: 'Information Technology',
    assignedClassCodes: ['23IT7A', '23IT7B', '24IT5A', '24IT5B', '25IT3A', '25IT3B'],
    isDepartmentHead: true,
  },
  {
    id: 'user-staff-it-anand',
    name: 'Dr. M. Anand',
    email: 'anand.it@vcet.ac.in',
    role: 'STAFF',
    designation: 'Associate Professor & IV Year IT-A Advisor',
    department: 'Information Technology',
    assignedClassCodes: ['23IT7A'],
  },
  {
    id: 'user-staff-it-ramesh',
    name: 'Prof. S. Ramesh',
    email: 'ramesh.it@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & IV Year IT-B Advisor',
    department: 'Information Technology',
    assignedClassCodes: ['23IT7B'],
  },
  {
    id: 'user-staff-it-priya',
    name: 'Dr. R. Priya',
    email: 'priya.it@vcet.ac.in',
    role: 'STAFF',
    designation: 'Associate Professor & III Year IT-A Advisor',
    department: 'Information Technology',
    assignedClassCodes: ['24IT5A'],
  },
  {
    id: 'user-staff-it-prakash',
    name: 'Prof. P. Prakash',
    email: 'prakash.it@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & III Year IT-B Advisor',
    department: 'Information Technology',
    assignedClassCodes: ['24IT5B'],
  },
  {
    id: 'user-staff-it-karthik',
    name: 'Prof. T. Karthik',
    email: 'karthik.it@vcet.ac.in',
    role: 'STAFF',
    designation: 'Assistant Professor & II Year IT-A Advisor',
    department: 'Information Technology',
    assignedClassCodes: ['25IT3A'],
  },
  {
    id: 'user-staff-hod',
    name: 'Dr. S. K. Raman (HoD & Placement Chair)',
    email: 'tpo.placement@college.edu',
    role: 'STAFF',
    designation: 'Head of Department & Placement Officer',
    department: 'Artificial Intelligence & Data Science',
    assignedClassCodes: VCET_CLASSES.map((c) => c.classCode),
    isDepartmentHead: true,
  },
];

// Names for AI & DS 24AD5A
const FIRST_NAMES_24A = [
  'Aadhithya', 'Abinaya', 'Abishek', 'Aishwarya', 'Akash', 'Anand', 'Ananya', 'Aravind', 'Archana', 'Arjun',
  'Arun', 'Ashwin', 'Balaji', 'Barath', 'Bavithra', 'Bhuvanesh', 'Charan', 'Deepak', 'Dhanush', 'Dharani',
  'Dharshini', 'Dinesh', 'Divya', 'Ganesh', 'Gayathri', 'Gokul', 'Gowtham', 'Hariharan', 'Harini', 'Harish',
  'Hemalatha', 'Indhuja', 'Jagadeesh', 'Janani', 'Jeeva', 'Kabilan', 'Kalaiyarasi', 'Kamalesh', 'Karthik', 'Kavitha',
  'Keerthana', 'Kishore', 'Lavanya', 'Lokesh', 'Madhavan', 'Manikandan', 'Meena', 'Mithun', 'Mohan', 'Monisha',
  'Mounika', 'Mukesh', 'Nandhini', 'Naveen', 'Nirmal', 'Nithya', 'Pavithra', 'Pradeep'
];

// Names for AI & DS 24AD5B
const FIRST_NAMES_24B = [
  'Praveen', 'Priya', 'Ragav', 'Ragul', 'Rahul', 'Raja', 'Rajesh', 'Rakshitha', 'Ramesh', 'Ramya',
  'Rithika', 'Rohit', 'Sabari', 'Sakthi', 'Samiksha', 'Sandhiya', 'Sanjay', 'Santosh', 'Saranya', 'Saravanan',
  'Sasikumar', 'Sathish', 'Selvan', 'Senthil', 'Shalini', 'Shankar', 'Sharmila', 'Shiva', 'Siddharth', 'Sindhu',
  'Sivakumar', 'Sneha', 'Soundar', 'Sowmiya', 'Sridhar', 'Srikanth', 'Subhash', 'Sudharsan', 'Suganya', 'Sujith',
  'Sundar', 'Surendar', 'Suresh', 'Surya', 'Swathi', 'Swetha', 'Tamilarasan', 'Tharun', 'Thenmozhi', 'Vaishnavi',
  'Varsha', 'Varun', 'Vasanth', 'Vignesh', 'Vijay', 'Vikram', 'Vinoth', 'Yuvaraj'
];

// Names for AI & DS 23AD07
const FIRST_NAMES_23AD = [
  'Aarav', 'Abarna', 'Adarsh', 'Ajay', 'Akshaya', 'Amritha', 'Anandhi', 'Anoop', 'Anusha', 'Arul',
  'Ashok', 'Bharathi', 'Bhuvan', 'Chandran', 'Deepika', 'Deva', 'Dhivya', 'Elango', 'Gopinath', 'Gunasekaran',
  'Hariprasad', 'Ilango', 'Iswarya', 'Jayanth', 'Jeevan', 'Karthiga', 'Kousalya', 'Krithika', 'Kumaran', 'Logesh',
  'Madhumitha', 'Malathi', 'Manojkumar', 'Meghana', 'Muthukumar', 'Mythili', 'Nagendran', 'Nalini', 'Natraj', 'Nivedha',
  'Parthiban', 'Pavithran', 'Ponnusamy', 'Pradeepa', 'Prakash', 'Pranav', 'Prithviraj', 'Priyadharshini', 'Radhika', 'Rajkumar',
  'Ranjith', 'Revathi', 'Rohini', 'Roshan', 'Sangeeth', 'Santhiya', 'Sarath', 'Sathyapriya', 'Senthamil', 'Shanmathi',
  'Shobana', 'Srinivasan'
];

// Names for AI & DS 25AD3A
const FIRST_NAMES_25A = [
  'Aadhav', 'Abhijeet', 'Aditi', 'Advait', 'Akshat', 'Alagu', 'Anbarasan', 'Aneesh', 'Aparna', 'Arthi',
  'Ashwitha', 'Atharv', 'Avinash', 'Balamurugan', 'Brindha', 'Charumathi', 'Deekshitha', 'Dhruv', 'Diya', 'Ezhil',
  'Gayathripriya', 'Giridhar', 'Gowrishankar', 'Guruprasad', 'Haresh', 'Hemant', 'Hrishikesh', 'Ishwarya', 'Jayashree', 'Jithesh',
  'Kailash', 'Kanmani', 'Kaushik', 'Kaviyarasu', 'Keerthi', 'Kiran', 'Koushik', 'Lakshmipriya', 'Lingesh', 'Magesh',
  'Malavika', 'Marimuthu', 'Mugilan', 'Murugan', 'Nandhakumar', 'Navaneeth', 'Nikhitha', 'Nithish', 'Padmapriya', 'Prabhakaran',
  'Pranitha', 'Prithika', 'Pugazhenthi', 'Punitha', 'Raghavan', 'Rajaram'
];

// Names for AI & DS 25AD3B
const FIRST_NAMES_25B = [
  'Rajeswari', 'Ramkumar', 'Rathnavel', 'Reshma', 'Revant', 'Rithvik', 'Sabarish', 'Saicharan', 'Sakthivel', 'Samriddhi',
  'Sangavi', 'Sanjiv', 'Santhi', 'Saravanamuthu', 'Sathiyan', 'Semmozhi', 'Shanmuga', 'Sharvesh', 'Shreeja', 'Shriram',
  'Siddesh', 'Sivanesan', 'Sivaranjani', 'Snekha', 'Somesh', 'Sreehari', 'Subhashini', 'Subramani', 'Sujatha', 'Sundaresan',
  'Sunil', 'Supriya', 'Surekha', 'Suriyakala', 'Swaminathan', 'Tamizhselvan', 'Thanigaivel', 'Thendral', 'Thirukumaran', 'Umamaheshwari',
  'Vadivel', 'Vairamuthu', 'Vallarasu', 'Vani', 'Vasanthakumar', 'Velmurugan', 'Venkat', 'Vetrivel', 'Vidhyadharan', 'Vimal',
  'Vimalraj', 'Vishal', 'Viswanathan', 'Yalini', 'Yashwanth', 'Yukesh'
];

// Names for CSE Dept (132 students)
const FIRST_NAMES_CSE = [
  'Aadhityan', 'Abhishek', 'Aditya', 'Aravinthan', 'Ashwinth', 'Balasubramanian', 'Chendur', 'Dhanalakshmi', 'Divyabharathi', 'Gnanasekaran',
  'Harikrishnan', 'Hariharanathan', 'Hemachandran', 'Ilakkiya', 'Jaganathan', 'Jeevitha', 'Kalaivani', 'Kamalakkannan', 'Karthikeyan', 'Kaviarasan',
  'Kiruthika', 'Krishnakumar', 'Mahalakshmi', 'Manivel', 'Meenakshi', 'Muralikrishnan', 'Nagarajan', 'Naveenkumar', 'Nithyanandam', 'Palanivel',
  'Pavithrakumar', 'Poornima', 'Praveenkumar', 'Priyanka', 'Radhakrishnan', 'Rajadurai', 'Rajeshkumar', 'Ramprasath', 'Ravichandran', 'Revathy',
  'Santhoshkumar', 'Saravanakumar', 'Sasirekha', 'Sathiyamoorthy', 'Selvakumar', 'Senthilkumar', 'Shanmugapriyan', 'Sivakumar', 'Soundararajan', 'Srinath',
  'Subhashini', 'Sundarapandian', 'Sureshkumar', 'Thamarai', 'Thirumoorthy', 'Udhayakumar', 'Vadivukkarasi', 'Vasanthkumar', 'Velusamy', 'Venkatesh',
  'Vidhyasagar', 'Vigneshkumar', 'Vijayalakshmi', 'Vinothkumar', 'Visalakshi', 'Yogeshwaran', 'Anbuselvan', 'Baskaran', 'Chinnadurai', 'Dhandapani'
];

// Names for IT Dept (90 students)
const FIRST_NAMES_IT = [
  'Ajithkumar', 'Amuthan', 'Balakrishnan', 'Boopathi', 'Chandrasekar', 'Devanathan', 'Elangovan', 'Govindaraj', 'Harihara', 'Iniyan',
  'Jayaprakash', 'Kannan', 'Logeshwaran', 'Manikandan', 'Mohanraj', 'Muthuraman', 'Natarajan', 'Paranthaman', 'Prabakaran', 'Premkumar',
  'Rajarathinam', 'Ramarajan', 'Ranjithkumar', 'Sakthikumar', 'Sampathkumar', 'Sathiyaseelan', 'Selvaraj', 'Sendhil', 'Shanmugavel', 'Sivaprakash',
  'Somasundaram', 'Subramaniyan', 'Surendran', 'Tamilarasu', 'Thangavel', 'Uthayakumar', 'Vasudevan', 'Velmurugavel', 'Venkatesan', 'Vijayan'
];

// Names for CSE (AI & ML) (72 students)
const FIRST_NAMES_AIML = [
  'Abinandhan', 'Akilan', 'Aravindraj', 'Ashik', 'Balamurali', 'Chandru', 'Dharaneesh', 'Dineshkumar', 'Giridharan', 'Gokulnath',
  'Haripreeth', 'Hemanthkumar', 'Inbaselvan', 'Jaiganesh', 'Jayachandran', 'Kadhirvel', 'Kavin', 'Koushikram', 'Madhesh', 'Manojkaran',
  'Mithunkumar', 'Mohanaprasad', 'Muthuvel', 'Naveenraj', 'Pradeesh', 'Pranavkumar', 'Praveenraj', 'Raghul', 'Rajakannan', 'Rangasamy',
  'Sanjaykumar', 'Sasidharan', 'Senthilvel', 'Shakthivel', 'Sharankumar', 'Sivaneshkumar', 'Sujithkumar', 'Suriyakumar', 'Thirunavukkarasu', 'Vigneshwar'
];

const INITIALS = ['M', 'S', 'K', 'R', 'P', 'V', 'A', 'T', 'N', 'D', 'G', 'B', 'C', 'J', 'L', 'E'];

// Builder function for deterministic realistic student profiles
function buildStudentRecord(
  index: number,
  classInfo: VcetClassInfo,
  firstName: string,
  initial: string,
  seqInClass: number
): VcetStudentData {
  const deptCode = classInfo.departmentCode;
  let codeStr = 'AD';
  if (deptCode === 'CSE') codeStr = 'CS';
  else if (deptCode === 'IT') codeStr = 'IT';
  else if (deptCode.includes('AI & ML') || deptCode.includes('AM')) codeStr = 'AM';

  const regYear = classInfo.batch.split('-')[0].substring(2, 4);
  const regNumber = `7329${regYear}${codeStr}${seqInClass.toString().padStart(3, '0')}`;
  const rollNumber = `${classInfo.classCode}-${seqInClass.toString().padStart(3, '0')}`;
  const fullName = `${firstName} ${initial}`;
  const email = `${firstName.toLowerCase()}.${seqInClass.toString().padStart(2, '0')}@vcet.ac.in`;

  // Deterministic realistic academic numbers
  const seed = (seqInClass * 23 + index * 17) % 100;
  const cgpa = Number((6.8 + (seed % 30) / 10).toFixed(2)); // 6.80 to 9.70
  const backlogs = seed % 19 === 0 ? 1 : (seed % 47 === 0 ? 2 : 0);
  const profileComp = 65 + (seed % 34); // 65% - 98%

  // Placement Skill flags calibrated to department
  const isDataDept = deptCode === 'AI & DS' || deptCode.includes('AI & ML');
  const hasPowerBi = isDataDept ? seed % 2 !== 0 : seed % 4 === 0;
  const hasSql = isDataDept ? seed % 5 !== 0 : seed % 3 !== 0;
  const hasCloud = seed % 4 === 0;
  const hasPython = (deptCode === 'AI & DS' || deptCode.includes('AI & ML')) ? true : seed % 3 !== 0;
  const hasJava = deptCode === 'CSE' || deptCode === 'IT' ? true : seed % 4 !== 0;
  const hasDsa = cgpa >= 7.6;
  const hasStats = isDataDept ? true : seed % 3 === 0;
  const hasExcel = true;

  const targetRoles = [
    'Data Analyst / BI Specialist',
    'AI / Machine Learning Engineer',
    'Full Stack Software Developer',
    'Data Engineer / ETL Pipeline Developer',
    'Cloud / DevOps Associate',
    'Core Python Developer',
    'Database Administrator & SQL Architect'
  ];
  const targetRole = targetRoles[(seed + index) % targetRoles.length];

  return {
    id: `vcet-std-${classInfo.classCode.toLowerCase()}-${seqInClass}`,
    registerNumber: regNumber,
    rollNumber,
    name: fullName,
    classCode: classInfo.classCode,
    batch: classInfo.batch,
    academicYear: classInfo.academicYear,
    semester: classInfo.semester,
    year: classInfo.year,
    department: classInfo.department,
    departmentCode: classInfo.departmentCode,
    cgpa,
    backlogs,
    phone: `+91 9443${String(10000 + (seed * 83) % 90000)}`,
    email,
    profileCompletion: profileComp,
    hasPowerBi,
    hasSql,
    hasCloud,
    hasPython,
    hasJava,
    hasDsa,
    hasStats,
    hasExcel,
    targetRole,
    githubUrl: `https://github.com/${firstName.toLowerCase()}-vcet`,
    linkedInUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${classInfo.classCode.toLowerCase()}`,
    leetCodeCount: 50 + (seed * 4) % 320,
    verifiedProjectsCount: 1 + (seed % 4),
    certificationsCount: 1 + (seed % 3),
    facultyRemarks:
      cgpa >= 8.5
        ? 'Excellent academic track record. Strong aptitude for product-tier hiring.'
        : cgpa >= 7.5
        ? 'Consistent performance. Recommended for Power BI & SQL hands-on reinforcement.'
        : 'Requires targeted mentoring on DSA problem-solving and aptitude speed.',
    endorsementStatus: cgpa >= 8.0 ? 'ENDORSED' : 'PENDING',
  };
}

// Helper mapper for official AI & DS records from the 3 official PDFs
function mapOfficialAidsToVcet(rec: OfficialPdfStudentRecord, index: number): VcetStudentData {
  const seed = (rec.sNo * 23 + index * 17) % 100;
  const cgpa = Number((7.1 + (seed % 27) / 10).toFixed(2));
  const backlogs = seed % 29 === 0 ? 1 : 0;
  const profileComp = 65 + (seed % 34);
  const targetRoles = [
    'Data Analyst / BI Specialist',
    'AI / Machine Learning Engineer',
    'Full Stack Software Developer',
    'Data Engineer / ETL Pipeline Developer',
  ];
  const targetRole = targetRoles[seed % targetRoles.length];
  const rollNumber = `${rec.classCode}-${rec.sNo.toString().padStart(3, '0')}`;
  const firstName = rec.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');

  return {
    id: `vcet-aids-${rec.classCode.toLowerCase()}-${rec.sNo}`,
    registerNumber: rec.registerNumber,
    rollNumber,
    name: rec.name,
    classCode: rec.classCode,
    batch: rec.batch,
    academicYear: rec.academicYear,
    semester: rec.semester,
    year: rec.year,
    department: 'Artificial Intelligence and Data Science',
    departmentCode: 'AI & DS',
    cgpa,
    backlogs,
    phone: `+91 9443${String(10000 + (seed * 83) % 90000)}`,
    email: `${firstName}.${rec.registerNumber.slice(-3)}@vcet.ac.in`,
    profileCompletion: profileComp,
    hasPowerBi: seed % 2 !== 0,
    hasSql: seed % 5 !== 0,
    hasCloud: seed % 4 === 0,
    hasPython: true,
    hasJava: seed % 4 !== 0,
    hasDsa: cgpa >= 7.6,
    hasStats: true,
    hasExcel: true,
    targetRole,
    githubUrl: `https://github.com/${firstName}-aids-vcet`,
    linkedInUrl: `https://linkedin.com/in/${firstName}-${rec.registerNumber.toLowerCase()}`,
    leetCodeCount: 50 + (seed * 4) % 320,
    verifiedProjectsCount: 1 + (seed % 4),
    certificationsCount: 1 + (seed % 3),
    facultyRemarks:
      cgpa >= 8.5
        ? 'Excellent academic track record. Strong aptitude for product-tier hiring.'
        : 'Consistent performance. Recommended for Power BI & SQL reinforcement.',
    endorsementStatus: cgpa >= 8.0 ? 'ENDORSED' : 'PENDING',
    sourcePdf: rec.sourcePdf,
    needsVerification: rec.needsVerification || false,
  };
}

// Helper mapper for official CSE (AI & ML) records from the 3 official PDFs
function mapOfficialCseAimlToVcet(rec: OfficialCseAimlStudentRecord, index: number): VcetStudentData {
  const seed = (rec.sNo * 19 + index * 13) % 100;
  const cgpa = Number((7.0 + (seed % 28) / 10).toFixed(2));
  const backlogs = seed % 23 === 0 ? 1 : 0;
  const profileComp = 60 + (seed % 39);
  const targetRoles = [
    'AI / Machine Learning Engineer',
    'Deep Learning Research Associate',
    'Data Scientist — NLP & Computer Vision',
    'Full Stack AI Application Developer',
    'Data Engineer / MLOps Pipeline Specialist',
  ];
  const targetRole = targetRoles[seed % targetRoles.length];
  const rollNumber = `${rec.classCode}-${rec.sNo.toString().padStart(3, '0')}`;
  const firstName = rec.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');

  return {
    id: `vcet-aiml-${rec.classCode.toLowerCase()}-${rec.sNo}`,
    registerNumber: rec.registerNumber,
    rollNumber,
    name: rec.name,
    classCode: rec.classCode,
    batch: rec.batch,
    academicYear: rec.academicYear,
    semester: rec.semester,
    year: rec.year,
    department: rec.department,
    departmentCode: 'CSE (AI & ML)',
    cgpa,
    backlogs,
    phone: `+91 9442${String(10000 + (seed * 79) % 90000)}`,
    email: `${firstName}.${rec.registerNumber.slice(-3)}@vcet.ac.in`,
    profileCompletion: profileComp,
    hasPowerBi: seed % 2 !== 0,
    hasSql: seed % 5 !== 0,
    hasCloud: seed % 4 === 0,
    hasPython: true,
    hasJava: seed % 3 !== 0,
    hasDsa: cgpa >= 7.6,
    hasStats: true,
    hasExcel: true,
    targetRole,
    githubUrl: `https://github.com/${firstName}-aiml-vcet`,
    linkedInUrl: `https://linkedin.com/in/${firstName}-${rec.registerNumber.toLowerCase()}`,
    leetCodeCount: 60 + (seed * 5) % 280,
    verifiedProjectsCount: 1 + (seed % 3),
    certificationsCount: 1 + (seed % 3),
    facultyRemarks:
      cgpa >= 8.5
        ? 'Exceptional technical command in machine learning, mathematics, and Python architectures.'
        : cgpa >= 7.5
        ? 'Solid performance in core CS & AI. Recommended for hands-on deep learning deployment.'
        : 'Active candidate; needs additional practice on algorithmic problem-solving.',
    endorsementStatus: cgpa >= 8.0 ? 'ENDORSED' : 'PENDING',
    sourcePdf: rec.sourcePdf,
    needsVerification: rec.needsVerification || false,
  };
}

// Helper mapper for official CSE records from the 3 official PDFs
function mapOfficialCseToVcet(rec: OfficialCseStudentRecord, index: number): VcetStudentData {
  const seed = (rec.sNo * 17 + index * 11) % 100;
  const cgpa = Number((7.0 + (seed % 28) / 10).toFixed(2));
  const backlogs = seed % 24 === 0 ? 1 : 0;
  const profileComp = 60 + (seed % 39);
  const targetRoles = [
    'Full Stack Software Engineer',
    'Backend Systems Engineer (Java / Go)',
    'Cloud Native Application Developer',
    'Data Platform & Systems Engineer',
    'Cybersecurity & Network Solutions Engineer',
    'Algorithm & Systems Software Specialist',
  ];
  const targetRole = targetRoles[seed % targetRoles.length];
  const rollNumber = `${rec.classCode}-${rec.sNo.toString().padStart(3, '0')}`;
  const firstName = rec.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');

  return {
    id: `vcet-cse-${rec.classCode.toLowerCase()}-${rec.sNo}`,
    registerNumber: rec.registerNumber,
    rollNumber,
    name: rec.name,
    classCode: rec.classCode,
    batch: rec.batch,
    academicYear: rec.academicYear,
    semester: rec.semester,
    year: rec.year,
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    cgpa,
    backlogs,
    phone: `+91 9444${String(10000 + (seed * 73) % 90000)}`,
    email: `${firstName}.${rec.registerNumber.slice(-3)}@vcet.ac.in`,
    profileCompletion: profileComp,
    hasPowerBi: seed % 3 === 0,
    hasSql: seed % 6 !== 0,
    hasCloud: seed % 3 === 0,
    hasPython: true,
    hasJava: true,
    hasDsa: cgpa >= 7.5,
    hasStats: seed % 2 === 0,
    hasExcel: true,
    targetRole,
    githubUrl: `https://github.com/${firstName}-cse-vcet`,
    linkedInUrl: `https://linkedin.com/in/${firstName}-${rec.registerNumber.toLowerCase()}`,
    leetCodeCount: 75 + (seed * 6) % 350,
    verifiedProjectsCount: 2 + (seed % 3),
    certificationsCount: 1 + (seed % 3),
    facultyRemarks:
      cgpa >= 8.5
        ? 'Outstanding problem solver with top-tier algorithmic reasoning and clean system design.'
        : cgpa >= 7.5
        ? 'Consistent candidate with solid core CS fundamentals (OS, DBMS, CN, DSA).'
        : 'Active learner; strengthening competitive programming and database modeling.',
    endorsementStatus: cgpa >= 8.0 ? 'ENDORSED' : 'PENDING',
    sourcePdf: rec.sourcePdf,
    needsVerification: rec.needsVerification || false,
  };
}

// Helper mapper for official IT records from the 3 official PDFs
function mapOfficialItToVcet(rec: OfficialItStudentRecord, index: number): VcetStudentData {
  const seed = (rec.sNo * 19 + index * 13) % 100;
  const cgpa = Number((7.1 + (seed % 27) / 10).toFixed(2));
  const backlogs = seed % 26 === 0 ? 1 : 0;
  const profileComp = 62 + (seed % 37);
  const targetRoles = [
    'Full Stack Web Applications Developer',
    'Cloud Systems & DevOps Engineer',
    'Database Administrator & ETL Specialist',
    'Cybersecurity & Network Solutions Engineer',
    'Enterprise IT Infrastructure Engineer',
    'Frontend & UI/UX Software Engineer',
  ];
  const targetRole = targetRoles[seed % targetRoles.length];
  const rollNumber = `${rec.classCode}-${rec.sNo.toString().padStart(3, '0')}`;
  const firstName = rec.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');

  return {
    id: `vcet-it-${rec.classCode.toLowerCase()}-${rec.sNo}`,
    registerNumber: rec.registerNumber,
    rollNumber,
    name: rec.name,
    classCode: rec.classCode,
    batch: rec.batch,
    academicYear: rec.academicYear,
    semester: rec.semester,
    year: rec.year,
    department: 'Information Technology',
    departmentCode: 'IT',
    cgpa,
    backlogs,
    phone: `+91 9445${String(10000 + (seed * 81) % 90000)}`,
    email: `${firstName}.${rec.registerNumber.slice(-3)}@vcet.ac.in`,
    profileCompletion: profileComp,
    hasPowerBi: seed % 3 === 0,
    hasSql: seed % 5 !== 0,
    hasCloud: seed % 3 === 0,
    hasPython: true,
    hasJava: true,
    hasDsa: cgpa >= 7.5,
    hasStats: seed % 2 === 0,
    hasExcel: true,
    targetRole,
    githubUrl: `https://github.com/${firstName}-it-vcet`,
    linkedInUrl: `https://linkedin.com/in/${firstName}-${rec.registerNumber.toLowerCase()}`,
    leetCodeCount: 70 + (seed * 5) % 310,
    verifiedProjectsCount: 2 + (seed % 3),
    certificationsCount: 1 + (seed % 3),
    facultyRemarks:
      cgpa >= 8.5
        ? 'Excellent proficiency in full-stack web platforms, databases, and network architectures.'
        : cgpa >= 7.5
        ? 'Consistent technical performer with solid foundation in OOP, DBMS, and web technologies.'
        : 'Active learner; strengthening competitive programming patterns and cloud infrastructure.',
    endorsementStatus: cgpa >= 8.0 ? 'ENDORSED' : 'PENDING',
    sourcePdf: rec.sourcePdf,
    needsVerification: rec.needsVerification || false,
  };
}

// Generate the complete official student list across all VCET college departments
export function getOfficialVcetStudents(): VcetStudentData[] {
  const students: VcetStudentData[] = [];

  // 1. AI & DS Department (299 Verified Students from 3 official PDFs)
  ALL_OFFICIAL_AIDS_STUDENTS.forEach((rec: OfficialPdfStudentRecord, idx: number) => {
    students.push(mapOfficialAidsToVcet(rec, idx));
  });

  // 2. CSE (AI & ML) Department (178 Verified Students from 3 official PDFs in exact order: 4th yr -> 3rd yr -> 2nd yr)
  ALL_OFFICIAL_CSEAIML_STUDENTS.forEach((rec: OfficialCseAimlStudentRecord, idx: number) => {
    students.push(mapOfficialCseAimlToVcet(rec, idx));
  });

  // 3. CSE Department (432 Verified Students from 3 official PDFs in exact order: 4th yr -> 3rd yr -> 2nd yr)
  ALL_OFFICIAL_CSE_STUDENTS.forEach((rec: OfficialCseStudentRecord, idx: number) => {
    students.push(mapOfficialCseToVcet(rec, idx));
  });

  // 4. IT Department (366 Verified Students from 3 official PDFs in exact order: 4th yr -> 3rd yr -> 2nd yr)
  ALL_OFFICIAL_IT_STUDENTS.forEach((rec: OfficialItStudentRecord, idx: number) => {
    students.push(mapOfficialItToVcet(rec, idx));
  });

  return students;
}

// Storage sync key with versioning for IT official records
const VCET_STORAGE_KEY = 'vcet_central_students_database_v7_it_verified';

export function loadVcetStudentsFromStorage(): VcetStudentData[] {
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  if (isBrowser) {
    try {
      const raw = localStorage.getItem(VCET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure it contains all 1,200+ records and contains the official IT classes
        if (
          Array.isArray(parsed) &&
          parsed.length >= 1250 &&
          parsed.some((s) => s.classCode === '23IT7A')
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading VCET students from storage', e);
    }
  }

  // Backup previous database if available
  let previousList: VcetStudentData[] = [];
  if (isBrowser) {
    try {
      const oldRaw =
        localStorage.getItem('vcet_central_students_database_v6_cse_verified') ||
        localStorage.getItem('vcet_central_students_database_v5_csea_ml');
      if (oldRaw) {
        previousList = JSON.parse(oldRaw);
        const oldIt = previousList.filter((s) => s.departmentCode === 'IT');
        localStorage.setItem('vcet_it_backup_before_import', JSON.stringify(oldIt));
      }
    } catch {
      // backup attempt
    }
  }

  // Generate verified students
  const seeded = getOfficialVcetStudents();

  // Preserve existing student custom activity or registrations if matching register numbers exist
  if (previousList.length > 0) {
    const prevMap = new Map(previousList.map((s) => [s.registerNumber.toUpperCase(), s]));
    seeded.forEach((std) => {
      const match = prevMap.get(std.registerNumber.toUpperCase());
      if (match) {
        if (match.githubUrl && !match.githubUrl.includes('-vcet')) {
          std.githubUrl = match.githubUrl;
        }
        if (match.linkedInUrl && !match.linkedInUrl.includes('-vcet')) {
          std.linkedInUrl = match.linkedInUrl;
        }
      }
    });
  }

  if (isBrowser) {
    try {
      localStorage.setItem(VCET_STORAGE_KEY, JSON.stringify(seeded));
    } catch (e) {
      console.error('Error saving initial VCET students', e);
    }
  }
  return seeded;
}

export function saveVcetStudentsToStorage(students: VcetStudentData[]): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(VCET_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Error saving VCET students', e);
    }
  }
}

// Find faculty details for any user
export function getFacultyMentorProfile(userId: string, email?: string): VcetFacultyMentor | undefined {
  return (
    VCET_FACULTY_MENTORS.find((f) => f.id === userId) ||
    VCET_FACULTY_MENTORS.find((f) => email && f.email.toLowerCase() === email.toLowerCase()) ||
    VCET_FACULTY_MENTORS[0] // fallback to Prof. Manoj Praveen
  );
}

// Get assigned classes for a faculty mentor
export function getClassesForFaculty(faculty: VcetFacultyMentor): VcetClassInfo[] {
  if (faculty.isDepartmentHead) {
    return VCET_CLASSES;
  }
  return VCET_CLASSES.filter((c) => faculty.assignedClassCodes.includes(c.classCode));
}

// Get students for a specific class code
export function getStudentsByClassCode(classCode: string, allStudents?: VcetStudentData[]): VcetStudentData[] {
  const list = allStudents || loadVcetStudentsFromStorage();
  return list.filter((s) => s.classCode === classCode);
}

// Get students for a specific faculty member
export function getStudentsForFaculty(faculty: VcetFacultyMentor, allStudents?: VcetStudentData[]): VcetStudentData[] {
  const list = allStudents || loadVcetStudentsFromStorage();
  if (faculty.isDepartmentHead) {
    return list;
  }
  return list.filter((s) => faculty.assignedClassCodes.includes(s.classCode));
}
