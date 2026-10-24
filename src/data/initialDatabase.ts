import { Department, SkillItem, Company, JobOpportunity, StudentProfile, AuditLog, User } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-aids', name: 'Artificial Intelligence & Data Science', code: 'AI & DS', totalStudents: 299 },
  { id: 'dept-aiml', name: 'CSE (Artificial Intelligence and Machine Learning)', code: 'CSE (AI & ML)', totalStudents: 178 },
  { id: 'dept-cse', name: 'Computer Science & Engineering', code: 'CSE', totalStudents: 132 },
  { id: 'dept-it', name: 'Information Technology', code: 'IT', totalStudents: 90 },
  { id: 'dept-ece', name: 'Electronics & Communication Engineering', code: 'ECE', totalStudents: 82 },
  { id: 'dept-mech', name: 'Mechanical Engineering', code: 'MECH', totalStudents: 56 },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-student-alex',
    email: 'alex.kumar@college.edu',
    name: 'Alex Kumar',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'user-student-priya',
    email: 'priya.sharma@college.edu',
    name: 'Priya Sharma',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-08-12T10:30:00Z',
  },
  {
    id: 'user-staff-manoj',
    email: 'staff.manoj@college.edu',
    name: 'Prof. V. Manoj Praveen',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-sangeetha',
    email: 'sangeetha.aids@college.edu',
    name: 'Dr. P. Sangeetha',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-senthil',
    email: 'senthil.aids@college.edu',
    name: 'Prof. R. Senthil Kumar',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-arulmozhi',
    email: 'arulmozhi.aids@college.edu',
    name: 'Dr. K. Arulmozhi',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-deepa',
    email: 'deepa.aids@college.edu',
    name: 'Prof. M. Deepa',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-madhu',
    email: 'madhu.aiml@vcet.ac.in',
    name: 'Prof. V. Madhu (IV Year Advisor)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-tamilselvi',
    email: 'tamilselvi.aiml@vcet.ac.in',
    name: 'Prof. P. Tamilselvi (III Year Advisor)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-kiruthika',
    email: 'kiruthika.aiml@vcet.ac.in',
    name: 'Prof. A. Kiruthika (II Year Advisor)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-cse-senthilkumar',
    email: 'hod.cse@vcet.ac.in',
    name: 'Dr. S. Senthil Kumar (HOD/CSE)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-cse-karthikeyan',
    email: 'karthikeyan.cse@vcet.ac.in',
    name: 'Dr. N. Karthikeyan (IV Year CSE-A Advisor)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-cse-saravanan',
    email: 'saravanan.cse@vcet.ac.in',
    name: 'Prof. B. Saravanan (IV Year CSE-B Advisor)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-cse-sangeetha',
    email: 'sangeetha.cse@vcet.ac.in',
    name: 'Dr. M. Sangeetha (III Year CSE-A Advisor)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-cse-muthuraj',
    email: 'muthuraj.cse@vcet.ac.in',
    name: 'Prof. D. Muthuraj (III Year CSE-B Advisor)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-cse-anitha',
    email: 'anitha.cse@vcet.ac.in',
    name: 'Prof. V. Anitha (II Year CSE-A Advisor)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-staff-cse-balamurugan',
    email: 'balamurugan.cse@vcet.ac.in',
    name: 'Prof. K. Balamurugan (II Year CSE-B Advisor)',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'user-admin-placement',
    email: 'tpo.placement@college.edu',
    name: 'Dr. S. K. Raman (Placement Officer)',
    role: 'PLACEMENT_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'user-superadmin-raman',
    email: 'principal@college.edu',
    name: 'Dr. K. Arulmozhi (Dean & Principal)',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-04-01T08:00:00Z',
  },
];

export const SKILL_ONTOLOGY: SkillItem[] = [
  // Programming
  { id: 'sk-python', name: 'Python', normalizedName: 'python', category: 'Programming', aliases: ['python', 'python3', 'py'] },
  { id: 'sk-java', name: 'Java', normalizedName: 'java', category: 'Programming', aliases: ['java', 'core java', 'java 8', 'java 17', 'j2se'] },
  { id: 'sk-c', name: 'C', normalizedName: 'c', category: 'Programming', aliases: ['c programming', 'ansi c', 'c language'] },
  { id: 'sk-cpp', name: 'C++', normalizedName: 'c++', category: 'Programming', aliases: ['cpp', 'c plus plus', 'c/c++'] },
  { id: 'sk-javascript', name: 'JavaScript', normalizedName: 'javascript', category: 'Programming', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { id: 'sk-typescript', name: 'TypeScript', normalizedName: 'typescript', category: 'Programming', aliases: ['typescript', 'ts'] },

  // Database
  { id: 'sk-sql', name: 'SQL', normalizedName: 'sql', category: 'Database', aliases: ['sql', 'structured query language', 'ansi sql', 'rdbms', 'sql queries'] },
  { id: 'sk-mysql', name: 'MySQL', normalizedName: 'mysql', category: 'Database', aliases: ['mysql', 'mysql database'] },
  { id: 'sk-postgresql', name: 'PostgreSQL', normalizedName: 'postgresql', category: 'Database', aliases: ['postgres', 'postgresql', 'psql'] },
  { id: 'sk-mongodb', name: 'MongoDB', normalizedName: 'mongodb', category: 'Database', aliases: ['mongo', 'mongodb', 'nosql'] },

  // Data Science & Analytics
  { id: 'sk-powerbi', name: 'Power BI', normalizedName: 'power bi', category: 'Data Science', aliases: ['power bi', 'microsoft power bi', 'powerbi', 'power query', 'dax'] },
  { id: 'sk-tableau', name: 'Tableau', normalizedName: 'tableau', category: 'Data Science', aliases: ['tableau', 'tableau desktop', 'tableau public'] },
  { id: 'sk-excel', name: 'Advanced Excel', normalizedName: 'excel', category: 'Data Science', aliases: ['excel', 'advanced excel', 'ms excel', 'microsoft excel', 'vlookup', 'pivot tables'] },
  { id: 'sk-stats', name: 'Statistics', normalizedName: 'statistics', category: 'Data Science', aliases: ['statistics', 'statistical analysis', 'probability & statistics', 'hypothesis testing', 'correlation'] },
  { id: 'sk-pandas', name: 'Pandas', normalizedName: 'pandas', category: 'Data Science', aliases: ['pandas', 'data manipulation', 'dataframes'] },
  { id: 'sk-numpy', name: 'NumPy', normalizedName: 'numpy', category: 'Data Science', aliases: ['numpy', 'numerical python', 'vector operations'] },
  { id: 'sk-data-viz', name: 'Advanced Data Visualization', normalizedName: 'data visualization', category: 'Data Science', aliases: ['data visualization', 'matplotlib', 'seaborn', 'visual analytics', 'kpi dashboards'] },

  // AI & ML
  { id: 'sk-ml', name: 'Machine Learning', normalizedName: 'machine learning', category: 'AI/ML', aliases: ['machine learning', 'ml', 'scikit-learn', 'sklearn', 'predictive modeling'] },
  { id: 'sk-dl', name: 'Deep Learning', normalizedName: 'deep learning', category: 'AI/ML', aliases: ['deep learning', 'dl', 'neural networks', 'ann', 'cnn', 'rnn'] },
  { id: 'sk-tensorflow', name: 'TensorFlow', normalizedName: 'tensorflow', category: 'AI/ML', aliases: ['tensorflow', 'tf', 'keras'] },
  { id: 'sk-pytorch', name: 'PyTorch', normalizedName: 'pytorch', category: 'AI/ML', aliases: ['pytorch', 'torch'] },
  { id: 'sk-nlp', name: 'NLP & Transformers', normalizedName: 'nlp', category: 'AI/ML', aliases: ['nlp', 'natural language processing', 'transformers', 'bert', 'spacy', 'huggingface'] },
  { id: 'sk-rag', name: 'RAG & Vector Embeddings', normalizedName: 'rag', category: 'AI/ML', aliases: ['rag', 'retrieval augmented generation', 'vector db', 'chroma', 'embeddings'] },

  // Web Development
  { id: 'sk-html-css', name: 'HTML & CSS', normalizedName: 'html & css', category: 'Web Development', aliases: ['html', 'css', 'html5', 'css3', 'tailwind', 'bootstrap'] },
  { id: 'sk-react', name: 'React', normalizedName: 'react', category: 'Web Development', aliases: ['react', 'react.js', 'reactjs'] },
  { id: 'sk-nodejs', name: 'Node.js', normalizedName: 'node.js', category: 'Web Development', aliases: ['nodejs', 'node.js', 'node', 'express', 'express.js'] },
  { id: 'sk-rest-api', name: 'REST APIs', normalizedName: 'rest api', category: 'Web Development', aliases: ['rest', 'rest api', 'restful api', 'api design', 'json apis'] },

  // Cloud & DevOps
  { id: 'sk-cloud', name: 'Cloud Computing (AWS/GCP)', normalizedName: 'cloud computing', category: 'Cloud', aliases: ['cloud', 'aws', 'amazon web services', 'gcp', 'google cloud', 'azure'] },
  { id: 'sk-docker', name: 'Docker & Containers', normalizedName: 'docker', category: 'DevOps', aliases: ['docker', 'containers', 'containerization'] },
  { id: 'sk-git', name: 'Git & GitHub', normalizedName: 'git', category: 'Tools', aliases: ['git', 'github', 'version control'] },
  { id: 'sk-linux', name: 'Linux OS & Shell', normalizedName: 'linux', category: 'Tools', aliases: ['linux', 'unix', 'bash', 'shell scripting'] },

  // Core CS
  { id: 'sk-dsa', name: 'Data Structures & Algorithms', normalizedName: 'dsa', category: 'Core CS', aliases: ['dsa', 'data structures', 'algorithms', 'leetcode', 'problem solving'] },
  { id: 'sk-oops', name: 'OOPs Concepts', normalizedName: 'oops', category: 'Core CS', aliases: ['oops', 'object oriented programming', 'polymorphism', 'inheritance', 'abstraction'] },
  { id: 'sk-os', name: 'Operating Systems', normalizedName: 'operating systems', category: 'Core CS', aliases: ['os', 'operating systems', 'process scheduling', 'deadlock', 'virtual memory'] },
  { id: 'sk-dbms', name: 'DBMS Concepts', normalizedName: 'dbms', category: 'Core CS', aliases: ['dbms', 'acid properties', 'normalization', 'er diagrams', 'transactions'] },
  { id: 'sk-cn', name: 'Computer Networks', normalizedName: 'computer networks', category: 'Core CS', aliases: ['cn', 'computer networks', 'tcp/ip', 'osi model', 'http', 'dns'] },
  { id: 'sk-lld', name: 'Low Level Design (LLD)', normalizedName: 'system design', category: 'Core CS', aliases: ['lld', 'low level design', 'system design', 'solid principles', 'design patterns'] },

  // Soft Skills
  { id: 'sk-comm', name: 'Verbal & Presentation Skills', normalizedName: 'communication', category: 'Soft Skills', aliases: ['communication', 'verbal communication', 'presentation', 'english fluency'] },
  { id: 'sk-aptitude', name: 'Quantitative & Logical Aptitude', normalizedName: 'aptitude', category: 'Soft Skills', aliases: ['aptitude', 'quantitative aptitude', 'logical reasoning', 'problem solving aptitude'] },
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-zoho',
    name: 'Zoho Corporation',
    industry: 'Enterprise SaaS & Cloud Software',
    website: 'https://www.zoho.com',
    logo: '🏢',
    description: 'Global maker of SaaS applications and business suites known for rigorous technical problem-solving rounds.',
    tier: 'TIER_1_PRODUCT',
  },
  {
    id: 'comp-amazon',
    name: 'Amazon',
    industry: 'Big Tech, Cloud & E-commerce',
    website: 'https://www.amazon.jobs',
    logo: '📦',
    description: 'Fortune 5 tech titan testing deep algorithms, distributed systems, and core computer science fundamentals.',
    tier: 'TIER_1_PRODUCT',
  },
  {
    id: 'comp-tiger',
    name: 'Tiger Analytics',
    industry: 'AI & Advanced Data Analytics',
    website: 'https://www.tigeranalytics.com',
    logo: '🐯',
    description: 'Premier analytics and AI consulting firm solving complex enterprise data, visualization, and ML problems.',
    tier: 'TIER_1_PRODUCT',
  },
  {
    id: 'comp-latentview',
    name: 'LatentView Analytics',
    industry: 'Digital Analytics & BI Strategy',
    website: 'https://www.latentview.com',
    logo: '📊',
    description: 'Global data science leader helping businesses harness predictive insights, Power BI KPI pipelines, and SQL modeling.',
    tier: 'TIER_2_HYBRID',
  },
  {
    id: 'comp-tcs',
    name: 'TCS (Tata Consultancy Services)',
    industry: 'IT Services & Consulting',
    website: 'https://www.tcs.com/careers',
    logo: '🌐',
    description: "India's largest multinational technology enterprise hiring for Digital and Prime development tracks.",
    tier: 'TIER_3_SERVICE',
  },
];

export const INITIAL_JOBS: JobOpportunity[] = [
  {
    id: 'job-tiger-da',
    companyId: 'comp-tiger',
    companyName: 'Tiger Analytics',
    companyLogo: '🐯',
    title: 'Data Analyst — Analytics & BI Practice',
    description: 'Analyze multi-source enterprise data, build executive Power BI and Tableau dashboards, conduct statistical hypothesis testing, and automate SQL data transformation pipelines.',
    location: 'Chennai / Bengaluru (Hybrid)',
    employmentType: 'Full-Time',
    salaryPackage: '8.5 - 10.0 LPA',
    isProductBased: true,
    applicationDeadline: '2026-11-15',
    applicationUrl: 'https://www.tigeranalytics.com/careers/data-analyst-campus',
    status: 'ACTIVE',
    eligibility: {
      minimumCgpa: 7.2,
      allowedDepartments: ['AI & DS', 'CSE', 'IT', 'ECE'],
      allowedBatches: ['2022-2026', '2023-2027'],
      backlogsAllowed: 0,
      graduationYear: 2026,
    },
    requirements: [
      { id: 'req-1', skillName: 'SQL', normalizedName: 'sql', category: 'Database', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-2', skillName: 'Power BI', normalizedName: 'power bi', category: 'Data Science', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-3', skillName: 'Python', normalizedName: 'python', category: 'Programming', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-4', skillName: 'Statistics', normalizedName: 'statistics', category: 'Data Science', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-5', skillName: 'Advanced Excel', normalizedName: 'excel', category: 'Data Science', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-6', skillName: 'Tableau', normalizedName: 'tableau', category: 'Data Science', importance: 'PREFERRED', minimumProficiency: 'Beginner' },
      { id: 'req-7', skillName: 'Advanced Data Visualization', normalizedName: 'data visualization', category: 'Data Science', importance: 'PREFERRED', minimumProficiency: 'Intermediate' },
      { id: 'req-8', skillName: 'Verbal & Presentation Skills', normalizedName: 'communication', category: 'Soft Skills', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
    ],
  },
  {
    id: 'job-zoho-sde',
    companyId: 'comp-zoho',
    companyName: 'Zoho Corporation',
    companyLogo: '🏢',
    title: 'Software Development Engineer (SDE)',
    description: 'Design and build resilient enterprise applications. Evaluation emphasizes raw Java/C++ problem-solving, custom data structure implementation, taxi-booking / elevator low level design, and deep database normalization.',
    location: 'Chennai / Tenkasi / Salem',
    employmentType: 'Full-Time',
    salaryPackage: '8.4 LPA',
    isProductBased: true,
    applicationDeadline: '2026-10-30',
    applicationUrl: 'https://www.zoho.com/careers/campus-hiring',
    status: 'ACTIVE',
    eligibility: {
      minimumCgpa: 7.5,
      allowedDepartments: ['AI & DS', 'CSE', 'IT', 'ECE'],
      allowedBatches: ['2022-2026'],
      backlogsAllowed: 0,
      graduationYear: 2026,
    },
    requirements: [
      { id: 'req-z1', skillName: 'Java', normalizedName: 'java', category: 'Programming', importance: 'REQUIRED', minimumProficiency: 'Advanced' },
      { id: 'req-z2', skillName: 'Data Structures & Algorithms', normalizedName: 'dsa', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Advanced' },
      { id: 'req-z3', skillName: 'OOPs Concepts', normalizedName: 'oops', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Advanced' },
      { id: 'req-z4', skillName: 'Low Level Design (LLD)', normalizedName: 'system design', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-z5', skillName: 'SQL', normalizedName: 'sql', category: 'Database', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-z6', skillName: 'DBMS Concepts', normalizedName: 'dbms', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-z7', skillName: 'Operating Systems', normalizedName: 'operating systems', category: 'Core CS', importance: 'PREFERRED', minimumProficiency: 'Beginner' },
    ],
  },
  {
    id: 'job-latentview-de',
    companyId: 'comp-latentview',
    companyName: 'LatentView Analytics',
    companyLogo: '📊',
    title: 'Associate Data Engineer / BI Consultant',
    description: 'Transform big data lakes into analytical models. Build automated ELT pipelines in SQL and Python, maintain dimensional schemas, and deploy Power BI dashboards for Fortune 500 retail and finance clients.',
    location: 'Chennai (Ramanujan IT City)',
    employmentType: 'Full-Time',
    salaryPackage: '9.0 - 11.0 LPA',
    isProductBased: true,
    applicationDeadline: '2026-11-20',
    applicationUrl: 'https://www.latentview.com/careers/campus-analytics-engineer',
    status: 'ACTIVE',
    eligibility: {
      minimumCgpa: 7.0,
      allowedDepartments: ['AI & DS', 'CSE', 'IT'],
      allowedBatches: ['2022-2026'],
      backlogsAllowed: 0,
      graduationYear: 2026,
    },
    requirements: [
      { id: 'req-lv1', skillName: 'SQL', normalizedName: 'sql', category: 'Database', importance: 'REQUIRED', minimumProficiency: 'Advanced' },
      { id: 'req-lv2', skillName: 'Python', normalizedName: 'python', category: 'Programming', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-lv3', skillName: 'Power BI', normalizedName: 'power bi', category: 'Data Science', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-lv4', skillName: 'Cloud Computing (AWS/GCP)', normalizedName: 'cloud computing', category: 'Cloud', importance: 'REQUIRED', minimumProficiency: 'Beginner' },
      { id: 'req-lv5', skillName: 'Advanced Excel', normalizedName: 'excel', category: 'Data Science', importance: 'PREFERRED', minimumProficiency: 'Intermediate' },
      { id: 'req-lv6', skillName: 'Git & GitHub', normalizedName: 'git', category: 'Tools', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
    ],
  },
  {
    id: 'job-tcs-digital',
    companyId: 'comp-tcs',
    companyName: 'TCS (Tata Consultancy Services)',
    companyLogo: '🌐',
    title: 'TCS Digital — Systems Engineer',
    description: 'High-compensation premier track at TCS focusing on modern web development, full-stack architectures, cloud migration, and AI-driven automation.',
    location: 'Pan-India',
    employmentType: 'Full-Time',
    salaryPackage: '7.2 - 9.0 LPA',
    isProductBased: false,
    applicationDeadline: '2026-10-25',
    applicationUrl: 'https://www.tcs.com/careers/india/tcs-national-qualifier-test',
    status: 'ACTIVE',
    eligibility: {
      minimumCgpa: 7.0,
      allowedDepartments: ['AI & DS', 'CSE', 'IT', 'ECE', 'MECH'],
      allowedBatches: ['2022-2026'],
      backlogsAllowed: 1,
      graduationYear: 2026,
    },
    requirements: [
      { id: 'req-t1', skillName: 'Quantitative & Logical Aptitude', normalizedName: 'aptitude', category: 'Soft Skills', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-t2', skillName: 'Data Structures & Algorithms', normalizedName: 'dsa', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-t3', skillName: 'Java', normalizedName: 'java', category: 'Programming', importance: 'PREFERRED', minimumProficiency: 'Intermediate' },
      { id: 'req-t4', skillName: 'Python', normalizedName: 'python', category: 'Programming', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-t5', skillName: 'SQL', normalizedName: 'sql', category: 'Database', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-t6', skillName: 'OOPs Concepts', normalizedName: 'oops', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
    ],
  },
  {
    id: 'job-amazon-sde',
    companyId: 'comp-amazon',
    companyName: 'Amazon',
    companyLogo: '📦',
    title: 'Software Development Engineer I (SDE 1)',
    description: 'Work on massively distributed systems supporting prime, retail, or AWS cloud infrastructure. Rigorous coding rounds emphasizing LeetCode medium/hard patterns, system design, and concurrency.',
    location: 'Hyderabad / Bengaluru / Chennai',
    employmentType: 'Full-Time',
    salaryPackage: '28.5 - 34.0 LPA',
    isProductBased: true,
    applicationDeadline: '2026-12-01',
    applicationUrl: 'https://www.amazon.jobs/en/jobs/campus-sde-1',
    status: 'ACTIVE',
    eligibility: {
      minimumCgpa: 8.0,
      allowedDepartments: ['AI & DS', 'CSE', 'IT'],
      allowedBatches: ['2022-2026'],
      backlogsAllowed: 0,
      graduationYear: 2026,
    },
    requirements: [
      { id: 'req-a1', skillName: 'Data Structures & Algorithms', normalizedName: 'dsa', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Advanced' },
      { id: 'req-a2', skillName: 'Java', normalizedName: 'java', category: 'Programming', importance: 'REQUIRED', minimumProficiency: 'Advanced' },
      { id: 'req-a3', skillName: 'Operating Systems', normalizedName: 'operating systems', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-a4', skillName: 'Computer Networks', normalizedName: 'computer networks', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-a5', skillName: 'Low Level Design (LLD)', normalizedName: 'system design', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-a6', skillName: 'DBMS Concepts', normalizedName: 'dbms', category: 'Core CS', importance: 'REQUIRED', minimumProficiency: 'Intermediate' },
      { id: 'req-a7', skillName: 'Cloud Computing (AWS/GCP)', normalizedName: 'cloud computing', category: 'Cloud', importance: 'PREFERRED', minimumProficiency: 'Beginner' },
    ],
  },
];

// Pre-seeded Student Profile (Alex Kumar - exact showcase from prompt Section 49)
export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'student-alex-kumar',
  userId: 'user-student-alex',
  registerNumber: '717822P101',
  name: 'Alex Kumar',
  collegeEmail: 'alex.kumar@college.edu',
  personalEmail: 'alexkumar.dev@gmail.com',
  phone: '+91 98401 23456',
  location: 'Coimbatore, Tamil Nadu',
  departmentId: 'dept-aids',
  departmentName: 'AI & DS',
  batch: '2022-2026',
  year: 4,
  cgpa: 7.8,
  backlogs: 0,
  careerGoal: 'Become a Data Analyst / BI Engineer at a top tier product firm.',
  targetRole: 'Data Analyst — Analytics & BI Practice',
  linkedInUrl: 'https://linkedin.com/in/alexkumar-dev',
  githubUrl: 'https://github.com/alexkumar-data',
  portfolioUrl: 'https://alexkumar.dev',
  leetCodeUrl: 'https://leetcode.com/alexkumar_p',
  summary: 'Motivated Artificial Intelligence & Data Science senior with foundational strengths in Python data manipulation, SQL database querying, and machine learning models. Seeking to master Power BI data modeling and advanced business statistics to excel in enterprise analytics.',
  profileCompletion: 88,
  skills: [
    { id: 'ss-1', studentId: 'student-alex-kumar', skillId: 'sk-python', skillName: 'Python', category: 'Programming', proficiency: 'Advanced', source: 'RESUME', confidence: 0.98, verified: true },
    { id: 'ss-2', studentId: 'student-alex-kumar', skillId: 'sk-sql', skillName: 'SQL', category: 'Database', proficiency: 'Intermediate', source: 'RESUME', confidence: 0.94, verified: true },
    { id: 'ss-3', studentId: 'student-alex-kumar', skillId: 'sk-pandas', skillName: 'Pandas', category: 'Data Science', proficiency: 'Intermediate', source: 'PROJECT', confidence: 0.95, verified: true },
    { id: 'ss-4', studentId: 'student-alex-kumar', skillId: 'sk-numpy', skillName: 'NumPy', category: 'Data Science', proficiency: 'Intermediate', source: 'PROJECT', confidence: 0.92, verified: true },
    { id: 'ss-5', studentId: 'student-alex-kumar', skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Tools', proficiency: 'Intermediate', source: 'RESUME', confidence: 0.90, verified: true },
    { id: 'ss-6', studentId: 'student-alex-kumar', skillId: 'sk-ml', skillName: 'Machine Learning', category: 'AI/ML', proficiency: 'Beginner', source: 'PROJECT', confidence: 0.85, verified: true },
    { id: 'ss-7', studentId: 'student-alex-kumar', skillId: 'sk-comm', skillName: 'Verbal & Presentation Skills', category: 'Soft Skills', proficiency: 'Intermediate', source: 'MANUAL', confidence: 0.88, verified: true },
  ],
  projects: [
    {
      id: 'proj-1',
      studentId: 'student-alex-kumar',
      title: 'Customer Sales Intelligence & Segmentation Pipeline',
      description: 'Engineered an end-to-end data pipeline using Python and Pandas to analyze 120,000+ customer retail transactions. Implemented RFM (Recency, Frequency, Monetary) analysis and visualized churn likelihood with Matplotlib.',
      technologies: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'SQL'],
      githubUrl: 'https://github.com/alexkumar-data/customer-churn-rfm',
      role: 'Lead Data Analyst',
    },
    {
      id: 'proj-2',
      studentId: 'student-alex-kumar',
      title: 'Real Estate Price Prediction Model',
      description: 'Developed supervised regression models (Ridge, Random Forest) in Scikit-Learn to estimate residential property valuations based on 18 socioeconomic features.',
      technologies: ['Python', 'Scikit-Learn', 'NumPy', 'Jupyter'],
      githubUrl: 'https://github.com/alexkumar-data/realestate-ml',
      role: 'ML Developer',
    },
  ],
  internships: [
    {
      id: 'intern-1',
      studentId: 'student-alex-kumar',
      company: 'Zenith Data Solutions',
      role: 'Junior Data Analyst Intern',
      startDate: '2025-05-01',
      endDate: '2025-07-31',
      description: 'Wrote complex SQL subqueries, joins, and CTEs to extract quarterly performance metrics. Cleaned messy CSV data exports and automated report generation scripts in Python.',
      technologies: ['SQL', 'Python', 'Pandas', 'PostgreSQL'],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      studentId: 'student-alex-kumar',
      name: 'Google Data Analytics Professional Certificate',
      issuer: 'Coursera / Google',
      issueDate: '2025-08-15',
      credentialUrl: 'https://coursera.org/verify/professional-cert/GDAC7178',
    },
    {
      id: 'cert-2',
      studentId: 'student-alex-kumar',
      name: 'HackerRank SQL (Intermediate) Certificate',
      issuer: 'HackerRank',
      issueDate: '2025-03-10',
      credentialUrl: 'https://www.hackerrank.com/certificates/sql_intermediate_alex',
    },
  ],
  achievements: [
    'Ranked in top 5% of Department of AI & DS coding assessment',
    'Finalist at Smart India Internal College Hackathon 2025',
    'Solved 150+ problems on LeetCode & HackerRank',
  ],
  resumeFileName: 'Alex_Kumar_Resume_2026.pdf',
  resumeParsedAt: '2026-09-15T14:22:00Z',
};

// Generates 520 realistic college student profiles for 500+ student analytics & training demand calculations
export function generate500CollegeStudents(): {
  students: {
    id: string;
    registerNumber: string;
    name: string;
    department: string;
    batch: string;
    year: number;
    cgpa: number;
    backlogs: number;
    profileCompletion: number;
    hasPowerBi: boolean;
    hasSql: boolean;
    hasCloud: boolean;
    hasPython: boolean;
    hasJava: boolean;
    hasDsa: boolean;
    hasStats: boolean;
    hasExcel: boolean;
  }[];
} {
  const departments = ['AI & DS', 'CSE', 'IT', 'ECE', 'MECH'];
  const firstNames = ['Arun', 'Kavitha', 'Senthil', 'Deepa', 'Vignesh', 'Ananya', 'Karthik', 'Swetha', 'Naveen', 'Meera', 'Praveen', 'Lakshmi', 'Gowtham', 'Divya', 'Suresh', 'Keerthana', 'Manoj', 'Aishwarya', 'Vijay', 'Sneha', 'Dinesh', 'Harini', 'Ramesh', 'Varsha', 'Sanjay', 'Pavithra', 'Madhavan', 'Janani'];
  const lastNames = ['Murugan', 'Kumar', 'Rajan', 'Balaji', 'Krishnan', 'Natarajan', 'Selvam', 'Palanisamy', 'Sundaram', 'Venkatesh', 'Shanmugam', 'Subramanian', 'Iyer', 'Chandran', 'Reddy', 'Ganesan', 'Jayaraman', 'Moorthy'];

  const students = [];

  // Deterministic seed generation
  for (let i = 1; i <= 520; i++) {
    const deptIdx = i % departments.length;
    const dept = departments[deptIdx];
    const fn = firstNames[(i * 7) % firstNames.length];
    const ln = lastNames[(i * 11) % lastNames.length];
    const regNum = `717822P${(100 + i).toString().padStart(3, '0')}`;
    const cgpa = Number((6.2 + ((i * 37) % 360) / 100).toFixed(2)); // range 6.20 to 9.80
    const backlogs = (i % 17 === 0) ? 1 : (i % 43 === 0 ? 2 : 0);
    const profileComp = 50 + ((i * 23) % 50); // 50 - 99%

    // Exactly calibrated gap frequencies:
    // Missing Power BI in ~280 students
    // Missing SQL in ~210 students
    // Missing Cloud in ~175 students
    const hasPowerBi = (i % 520) > 280; // 280 do NOT have Power BI
    const hasSql = (i % 520) > 210;     // 210 do NOT have SQL
    const hasCloud = (i % 520) > 175;   // 175 do NOT have Cloud
    const hasPython = (dept === 'AI & DS' || dept === 'CSE' || dept === 'IT') ? (i % 6 !== 0) : (i % 3 === 0);
    const hasJava = (dept === 'CSE' || dept === 'IT') ? (i % 5 !== 0) : (i % 3 !== 0);
    const hasDsa = (cgpa >= 7.8 && (dept === 'CSE' || dept === 'AI & DS'));
    const hasStats = (dept === 'AI & DS') || (i % 4 === 0);
    const hasExcel = (i % 3 !== 0);

    students.push({
      id: `std-${i}`,
      registerNumber: regNum,
      name: `${fn} ${ln}`,
      department: dept,
      batch: '2022-2026',
      year: 4,
      cgpa,
      backlogs,
      profileCompletion: profileComp,
      hasPowerBi,
      hasSql,
      hasCloud,
      hasPython,
      hasJava,
      hasDsa,
      hasStats,
      hasExcel,
    });
  }

  return { students };
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-admin-manoj',
    userName: 'Mr. V. Manoj Praveen',
    userRole: 'PLACEMENT_ADMIN',
    action: 'DATA_IMPORT_COMMITTED',
    entity: 'StudentProfiles',
    entityId: 'BATCH_2022_2026',
    timestamp: '2026-10-02T10:15:30Z',
    ipAddress: '192.168.1.45',
    details: 'Imported 450 verified student academic records from Google Sheet sync.',
  },
  {
    id: 'log-2',
    userId: 'user-admin-manoj',
    userName: 'Mr. V. Manoj Praveen',
    userRole: 'PLACEMENT_ADMIN',
    action: 'JOB_OPPORTUNITY_CREATED',
    entity: 'JobOpportunity',
    entityId: 'job-tiger-da',
    timestamp: '2026-10-02T11:20:00Z',
    ipAddress: '192.168.1.45',
    details: 'Configured Tiger Analytics Data Analyst placement drive eligibility criteria.',
  },
  {
    id: 'log-3',
    userId: 'user-student-alex',
    userName: 'Alex Kumar',
    userRole: 'STUDENT',
    action: 'RESUME_ANALYZED',
    entity: 'Resume',
    entityId: 'Alex_Kumar_Resume_2026.pdf',
    timestamp: '2026-10-03T14:22:15Z',
    ipAddress: '192.168.1.108',
    details: 'Parsed resume text, extracted 7 verified skills with 95% confidence score.',
  },
  {
    id: 'log-4',
    userId: 'user-student-alex',
    userName: 'Alex Kumar',
    userRole: 'STUDENT',
    action: 'SKILL_GAP_EVALUATED',
    entity: 'Analysis',
    entityId: 'job-tiger-da',
    timestamp: '2026-10-03T15:05:00Z',
    ipAddress: '192.168.1.108',
    details: 'Calculated 68% match for Data Analyst role; identified missing Power BI & Statistics.',
  },
  {
    id: 'log-5',
    userId: 'user-tpo-raman',
    userName: 'Dr. S. K. Raman',
    userRole: 'PLACEMENT_OFFICER',
    action: 'IT_PDF_RECORDS_IMPORTED',
    entity: 'ITDepartmentRoster',
    entityId: 'IT_BATCHES_2023_2024_2025',
    timestamp: '2026-10-13T09:30:00Z',
    ipAddress: '192.168.1.12',
    details: 'Imported and verified 366 IT student records from 3 official PDFs: 23IT7A_23IT7B(1).pdf (122), 24IT5A_24IT5B(1).pdf (122), 25IT3A_25IT3B(1).pdf (122).',
  },
];
