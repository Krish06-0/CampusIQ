// Secure Centralized Authentication & Cryptography Service (Web Crypto API SHA-256)
import { User, UserRole } from '../types';

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  rollNumber?: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'INVITATION_PENDING' | 'VERIFICATION_PENDING';
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
  authProvider: 'local' | 'google';
}

const STORAGE_KEY = 'skillgap_registered_accounts_v3';

// Utility to convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate random salt for cryptographic safety
export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Securely hash password with Web Crypto API SHA-256 + salt
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${salt}:skillgap_placement_salt`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

// Get all registered accounts
export function getStoredAccounts(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('skillgap_registered_accounts_v2');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read stored accounts', e);
  }
  return [];
}

// Save accounts to persistent storage
export function saveStoredAccounts(accounts: StoredUserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    localStorage.setItem('skillgap_registered_accounts_v2', JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save stored accounts', e);
  }
}

// Normalize role for consistent UI routing
export function normalizeUserRole(role: UserRole): UserRole {
  if (role === 'PLACEMENT_ADMIN') return 'PLACEMENT_OFFICER';
  if (role === 'SUPER_ADMIN') return 'DEAN';
  return role;
}

import { loadVcetStudentsFromStorage } from '../data/vcetStudentsData';

// Default password for pre-seeded test accounts: "CampusPass2026!"
export async function initializeSeedAccounts(): Promise<void> {
  const existing = getStoredAccounts();
  const hasDean = existing.some((a) => a.email.toLowerCase() === 'principal@college.edu');
  const hasPlacement = existing.some((a) => a.email.toLowerCase() === 'tpo.placement@college.edu');
  const hasItStaff = existing.some((a) => a.email.toLowerCase() === 'hod.it@vcet.ac.in');
  const hasCseStaff = existing.some((a) => a.email.toLowerCase() === 'hod.cse@vcet.ac.in');
  const hasAidsStaff = existing.some((a) => a.email.toLowerCase() === 'staff.manoj@college.edu');
  const hasAimlStaff = existing.some((a) => a.email.toLowerCase() === 'madhu.aiml@vcet.ac.in');
  const hasStudentPriya = existing.some((a) => a.email.toLowerCase() === 'priya.sharma@college.edu' || a.rollNumber === '732923IT001');

  if (existing.length > 0 && hasDean && hasPlacement && hasItStaff && hasCseStaff && hasAidsStaff && hasAimlStaff && hasStudentPriya) {
    return;
  }

  const defaultPassword = 'CampusPass2026!';

  const studentSalt = generateSalt();
  const studentHash = await hashPasswordWithSalt(defaultPassword, studentSalt);

  const staffSalt = generateSalt();
  const staffHash = await hashPasswordWithSalt(defaultPassword, staffSalt);

  const officeSalt = generateSalt();
  const officeHash = await hashPasswordWithSalt(defaultPassword, officeSalt);

  const seedAccounts: StoredUserAccount[] = [
    // 1. Student A Aspirant (Alex Kumar - AI & DS)
    {
      id: 'user-student-alex',
      name: 'Alex Kumar',
      email: 'alex.kumar@college.edu',
      rollNumber: '22AIDS014',
      department: 'Artificial Intelligence and Data Science',
      role: 'STUDENT',
      status: 'ACTIVE',
      passwordHash: studentHash,
      salt: studentSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    // 1b. Student B Aspirant (Priya Sharma - Information Technology)
    {
      id: 'user-student-priya',
      name: 'Priya Sharma',
      email: 'priya.sharma@college.edu',
      rollNumber: '732923IT001',
      department: 'Information Technology',
      role: 'STUDENT',
      status: 'ACTIVE',
      passwordHash: studentHash,
      salt: studentSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    // 2. Placement Officer (Central Recruitment Command)
    {
      id: 'user-tpo-raman',
      name: 'Dr. S. K. Raman',
      email: 'tpo.placement@college.edu',
      employeeId: 'EMP-TPO-001',
      designation: 'Head of Placement & Training (TPO)',
      department: 'Central Placement Cell',
      role: 'PLACEMENT_OFFICER',
      status: 'ACTIVE',
      passwordHash: officeHash,
      salt: officeSalt,
      createdAt: '2026-05-01T08:00:00Z',
      authProvider: 'local',
    },
    // 3. Dean & Principal (Executive Institutional Leadership)
    {
      id: 'user-dean-arulmozhi',
      name: 'Dr. K. Arulmozhi (Dean & Principal)',
      email: 'principal@college.edu',
      employeeId: 'EMP-DEAN-001',
      designation: 'Dean & Principal (Executive Leadership)',
      department: 'Institutional Administration',
      role: 'DEAN',
      status: 'ACTIVE',
      passwordHash: officeHash,
      salt: officeSalt,
      createdAt: '2026-05-01T08:00:00Z',
      authProvider: 'local',
    },
    // 4. System Administrator
    {
      id: 'user-admin-sys',
      name: 'System Administrator',
      email: 'admin@college.edu',
      employeeId: 'EMP-SYS-001',
      designation: 'Lead Systems Architect & Security Admin',
      department: 'Campus IT Infrastructure',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
      passwordHash: officeHash,
      salt: officeSalt,
      createdAt: '2026-05-01T08:00:00Z',
      authProvider: 'local',
    },
    // 5. IT Department Staff (All have role 'STAFF')
    {
      id: 'user-staff-it-kavitha',
      name: 'Dr. V. Kavitha (HOD/IT)',
      email: 'hod.it@vcet.ac.in',
      employeeId: 'EMP-IT-001',
      designation: 'Professor & Head of Department (IT)',
      department: 'Information Technology',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    {
      id: 'user-staff-it-anand',
      name: 'Dr. M. Anand',
      email: 'anand.it@vcet.ac.in',
      employeeId: 'EMP-IT-002',
      designation: 'Associate Professor & IV Year IT-A Advisor',
      department: 'Information Technology',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    {
      id: 'user-staff-it-ramesh',
      name: 'Prof. S. Ramesh',
      email: 'ramesh.it@vcet.ac.in',
      employeeId: 'EMP-IT-003',
      designation: 'Assistant Professor & IV Year IT-B Advisor',
      department: 'Information Technology',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    {
      id: 'user-staff-it-priya',
      name: 'Dr. R. Priya',
      email: 'priya.it@vcet.ac.in',
      employeeId: 'EMP-IT-004',
      designation: 'Associate Professor & III Year IT-A Advisor',
      department: 'Information Technology',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    // 6. CSE Department Staff (All have role 'STAFF')
    {
      id: 'user-staff-cse-senthilkumar',
      name: 'Dr. S. Senthil Kumar (HOD/CSE)',
      email: 'hod.cse@vcet.ac.in',
      employeeId: 'EMP-CSE-001',
      designation: 'Professor & Head of Department (CSE)',
      department: 'Computer Science and Engineering',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    {
      id: 'user-staff-cse-karthikeyan',
      name: 'Dr. N. Karthikeyan',
      email: 'karthikeyan.cse@vcet.ac.in',
      employeeId: 'EMP-CSE-002',
      designation: 'Associate Professor & IV Year CSE-A Advisor',
      department: 'Computer Science and Engineering',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    {
      id: 'user-staff-cse-saravanan',
      name: 'Prof. B. Saravanan',
      email: 'saravanan.cse@vcet.ac.in',
      employeeId: 'EMP-CSE-003',
      designation: 'Assistant Professor & IV Year CSE-B Advisor',
      department: 'Computer Science and Engineering',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    // 7. AI & DS Department Staff (All have role 'STAFF')
    {
      id: 'user-staff-manoj',
      name: 'Prof. V. Manoj Praveen',
      email: 'staff.manoj@college.edu',
      employeeId: 'EMP-AIDS-001',
      designation: 'Assistant Professor & Placement Coordinator',
      department: 'Artificial Intelligence & Data Science',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    {
      id: 'user-staff-sangeetha',
      name: 'Dr. P. Sangeetha',
      email: 'sangeetha.aids@college.edu',
      employeeId: 'EMP-AIDS-002',
      designation: 'Associate Professor & Class Mentor',
      department: 'Artificial Intelligence & Data Science',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
    // 8. CSE (AI & ML) Department Staff (All have role 'STAFF')
    {
      id: 'user-staff-madhu',
      name: 'Prof. V. Madhu (IV Year Advisor)',
      email: 'madhu.aiml@vcet.ac.in',
      employeeId: 'EMP-AIML-001',
      designation: 'Assistant Professor & IV Year Advisor (CSE AI & ML)',
      department: 'CSE (Artificial Intelligence & Machine Learning)',
      role: 'STAFF',
      status: 'ACTIVE',
      passwordHash: staffHash,
      salt: staffSalt,
      createdAt: '2026-06-01T08:00:00Z',
      authProvider: 'local',
    },
  ];

  // Merge seed accounts cleanly preserving existing credentials & updates
  const existingMap = new Map(existing.map((a) => [a.email.toLowerCase(), a]));
  seedAccounts.forEach((seed) => {
    if (!existingMap.has(seed.email.toLowerCase())) {
      existingMap.set(seed.email.toLowerCase(), seed);
    }
  });
  saveStoredAccounts(Array.from(existingMap.values()));
}

// Convert StoredUserAccount to public User object
export function mapStoredAccountToUser(account: StoredUserAccount): User {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: normalizeUserRole(account.role),
    employeeId: account.employeeId,
    designation: account.designation,
    department: account.department,
    status: account.status || 'ACTIVE',
    createdAt: account.createdAt,
    lastLogin: account.lastLogin,
    createdBy: account.createdBy,
  };
}

// Get all staff members across all departments
export function getAllStaffAccounts(): StoredUserAccount[] {
  const accounts = getStoredAccounts();
  return accounts.filter((a) => a.role === 'STAFF');
}

// Staff creation with duplicate checks, email normalization, and authenticated account generation
export async function createStaffAccount(data: {
  name: string;
  email: string;
  employeeId?: string;
  designation: string;
  department: string;
  status?: 'ACTIVE' | 'INVITATION_PENDING' | 'VERIFICATION_PENDING';
  passwordPlain?: string;
  createdBy?: string;
}): Promise<{ success: boolean; message: string; account?: StoredUserAccount }> {
  await initializeSeedAccounts();
  const accounts = getStoredAccounts();

  const cleanName = data.name.trim();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanEmpId = data.employeeId?.trim().toUpperCase();

  if (!cleanName) {
    return { success: false, message: 'Please enter the staff member’s full name.' };
  }

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, message: 'Please enter a valid official institutional email.' };
  }

  // Prevent duplicate email
  const duplicateEmail = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (duplicateEmail) {
    return {
      success: false,
      message: `An account with email "${cleanEmail}" already exists (${duplicateEmail.name}). Duplicate accounts are prohibited.`,
    };
  }

  // Prevent duplicate employee ID if provided
  if (cleanEmpId) {
    const duplicateEmpId = accounts.find(
      (a) => a.employeeId && a.employeeId.toUpperCase() === cleanEmpId
    );
    if (duplicateEmpId) {
      return {
        success: false,
        message: `Employee ID "${cleanEmpId}" is already assigned to ${duplicateEmpId.name}.`,
      };
    }
  }

  const salt = generateSalt();
  const initialPassword = data.passwordPlain || 'CampusPass2026!';
  const passwordHash = await hashPasswordWithSalt(initialPassword, salt);

  const newAccount: StoredUserAccount = {
    id: `user-staff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    email: cleanEmail,
    employeeId: cleanEmpId || `EMP-STAFF-${Math.floor(100 + Math.random() * 900)}`,
    designation: data.designation.trim() || 'Assistant Professor',
    department: data.department || 'Information Technology',
    role: 'STAFF', // Strictly role 'STAFF' regardless of department (Section 2)
    status: data.status || 'ACTIVE',
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy || 'Placement Administration',
    authProvider: 'local',
  };

  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  return {
    success: true,
    message: `Staff member ${cleanName} created and authenticated successfully. Initial login enabled.`,
    account: newAccount,
  };
}

// Update existing staff record
export function updateStaffAccount(
  id: string,
  updates: Partial<Omit<StoredUserAccount, 'id' | 'passwordHash' | 'salt' | 'role'>>
): { success: boolean; message: string; account?: StoredUserAccount } {
  const accounts = getStoredAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) {
    return { success: false, message: 'Staff member account not found.' };
  }

  // Check email conflict if changing email
  if (updates.email) {
    const cleanEmail = updates.email.trim().toLowerCase();
    const conflict = accounts.find(
      (a) => a.id !== id && a.email.toLowerCase() === cleanEmail
    );
    if (conflict) {
      return { success: false, message: `Email ${cleanEmail} is already in use by another user.` };
    }
    updates.email = cleanEmail;
  }

  if (updates.employeeId) {
    updates.employeeId = updates.employeeId.trim().toUpperCase();
  }

  const updated: StoredUserAccount = {
    ...accounts[index],
    ...updates,
  };

  accounts[index] = updated;
  saveStoredAccounts(accounts);

  return {
    success: true,
    message: `Staff details for ${updated.name} updated successfully.`,
    account: updated,
  };
}

// Set staff status (Activate / Deactivate / Pending)
export function setStaffStatus(
  id: string,
  newStatus: 'ACTIVE' | 'INACTIVE' | 'INVITATION_PENDING' | 'VERIFICATION_PENDING'
): { success: boolean; message: string; account?: StoredUserAccount } {
  const accounts = getStoredAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) {
    return { success: false, message: 'Staff account not found.' };
  }

  accounts[index].status = newStatus;
  saveStoredAccounts(accounts);

  const statusLabels = {
    ACTIVE: 'Activated',
    INACTIVE: 'Deactivated',
    INVITATION_PENDING: 'Set to Invitation Pending',
    VERIFICATION_PENDING: 'Set to Verification Pending',
  };

  return {
    success: true,
    message: `Account status for ${accounts[index].name} successfully ${statusLabels[newStatus]}.`,
    account: accounts[index],
  };
}

// Reset password for any account
export async function resetUserPassword(
  emailOrId: string,
  newPasswordPlain = 'CampusPass2026!'
): Promise<{ success: boolean; message: string }> {
  const accounts = getStoredAccounts();
  const target = accounts.find(
    (a) =>
      a.id === emailOrId ||
      a.email.toLowerCase() === emailOrId.trim().toLowerCase()
  );

  if (!target) {
    return { success: false, message: 'User account not found.' };
  }

  const salt = generateSalt();
  const hash = await hashPasswordWithSalt(newPasswordPlain, salt);

  target.passwordHash = hash;
  target.salt = salt;
  saveStoredAccounts(accounts);

  return {
    success: true,
    message: `Password reset successfully for ${target.name} (${target.email}). New temporary pass: ${newPasswordPlain}`,
  };
}

// Register new student or candidate user
export async function registerNewUser(
  name: string,
  email: string,
  passwordPlain: string,
  role: UserRole,
  rollNumber?: string
): Promise<{ success: boolean; message: string; user?: User }> {
  await initializeSeedAccounts();
  const accounts = getStoredAccounts();

  const cleanEmail = email.trim().toLowerCase();
  const cleanRoll = rollNumber?.trim().toUpperCase();

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, message: 'Please enter a valid institutional email address.' };
  }

  if (passwordPlain.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters in length.' };
  }

  // Prevent email duplicate
  const existingEmail = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return { success: false, message: 'An account with this email address already exists. Please sign in.' };
  }

  // Check roll number duplicate for students
  if (role === 'STUDENT' && cleanRoll) {
    const existingRoll = accounts.find(
      (a) => a.role === 'STUDENT' && a.rollNumber?.toUpperCase() === cleanRoll
    );
    if (existingRoll) {
      return { success: false, message: `Roll number ${cleanRoll} is already registered. Please sign in.` };
    }
  }

  const salt = generateSalt();
  const passwordHash = await hashPasswordWithSalt(passwordPlain, salt);

  const newAccount: StoredUserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: cleanEmail,
    rollNumber: role === 'STUDENT' ? cleanRoll : undefined,
    role,
    status: 'ACTIVE',
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    authProvider: 'local',
  };

  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  return {
    success: true,
    message: 'Account registered successfully! Please sign in with your credentials.',
    user: mapStoredAccountToUser(newAccount),
  };
}

// Authenticate user with password verification across all supported roles
export async function authenticateUser(
  identifier: string,
  passwordPlain: string,
  targetRole: UserRole
): Promise<{ success: boolean; message: string; user?: User; rollNumber?: string }> {
  await initializeSeedAccounts();
  const accounts = getStoredAccounts();

  const cleanId = identifier.trim();
  const lowerId = cleanId.toLowerCase();
  const upperId = cleanId.toUpperCase();

  if (!cleanId) {
    return { success: false, message: 'Please enter your email or roll number.' };
  }

  if (!passwordPlain) {
    return { success: false, message: 'Please enter your password.' };
  }

  const normalizedTarget = normalizeUserRole(targetRole);

  // Match account
  let matched = accounts.find((a) => {
    const aRoleNorm = normalizeUserRole(a.role);
    if (normalizedTarget === 'STUDENT') {
      return (
        (a.rollNumber && a.rollNumber.toUpperCase() === upperId) ||
        a.email.toLowerCase() === lowerId
      );
    }
    // Match by email and normalized role
    return a.email.toLowerCase() === lowerId && aRoleNorm === normalizedTarget;
  });

  // Fallback match by identifier across all roles if user selected another tab
  if (!matched) {
    matched = accounts.find(
      (a) =>
        a.email.toLowerCase() === lowerId ||
        (a.rollNumber && a.rollNumber.toUpperCase() === upperId)
    );
  }

  // If no account found, check if identifier matches an official student register number in VCET database
  if (!matched && normalizedTarget === 'STUDENT') {
    const vcetList = loadVcetStudentsFromStorage();
    const rosterMatch = vcetList.find(
      (s) =>
        s.registerNumber.toUpperCase() === upperId ||
        (s.rollNumber && s.rollNumber.toUpperCase() === upperId) ||
        (s.email && s.email.toLowerCase() === lowerId)
    );

    if (rosterMatch) {
      const salt = generateSalt();
      const defaultHash = await hashPasswordWithSalt('CampusPass2026!', salt);
      matched = {
        id: `user-student-${rosterMatch.registerNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: rosterMatch.name,
        email: rosterMatch.email,
        rollNumber: rosterMatch.registerNumber,
        department: rosterMatch.department,
        role: 'STUDENT',
        status: 'ACTIVE',
        passwordHash: defaultHash,
        salt,
        createdAt: new Date().toISOString(),
        authProvider: 'local',
      };
      accounts.push(matched);
      saveStoredAccounts(accounts);
    }
  }

  if (!matched) {
    return { success: false, message: 'Invalid credentials. User account does not exist.' };
  }

  // Check account status
  if (matched.status === 'INACTIVE') {
    return {
      success: false,
      message: 'This account has been deactivated. Please contact the Placement Officer.',
    };
  }

  // Verify salted hash
  const computedHash = await hashPasswordWithSalt(passwordPlain, matched.salt);
  if (computedHash !== matched.passwordHash) {
    return { success: false, message: 'Incorrect password. Please verify and try again.' };
  }

  // Update lastLogin
  matched.lastLogin = new Date().toISOString();
  saveStoredAccounts(accounts);

  const user = mapStoredAccountToUser(matched);

  return {
    success: true,
    message: 'Authenticated successfully.',
    user,
    rollNumber: matched.rollNumber,
  };
}

// Authenticate or register Google OAuth user
export async function authenticateGoogleUser(
  googleProfile: { email: string; name: string; googleId?: string },
  selectedRole: UserRole,
  rollNumber?: string
): Promise<{ success: boolean; message: string; user: User }> {
  await initializeSeedAccounts();
  const accounts = getStoredAccounts();

  const lowerEmail = googleProfile.email.toLowerCase();
  let matched = accounts.find((a) => a.email.toLowerCase() === lowerEmail);

  if (!matched) {
    const salt = generateSalt();
    const randomPass = generateSalt(24);
    const passwordHash = await hashPasswordWithSalt(randomPass, salt);

    matched = {
      id: `user-g-${Date.now()}`,
      name: googleProfile.name || 'Google User',
      email: lowerEmail,
      rollNumber: selectedRole === 'STUDENT' ? (rollNumber?.toUpperCase() || '22AIDS' + Math.floor(100 + Math.random() * 900)) : undefined,
      role: normalizeUserRole(selectedRole),
      status: 'ACTIVE',
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      authProvider: 'google',
    };
    accounts.push(matched);
    saveStoredAccounts(accounts);
  } else {
    matched.lastLogin = new Date().toISOString();
    saveStoredAccounts(accounts);
  }

  return {
    success: true,
    message: 'Google authentication successful.',
    user: mapStoredAccountToUser(matched),
  };
}
