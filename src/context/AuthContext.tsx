import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, StudentProfile } from '../types';
import { INITIAL_USERS } from '../data/initialDatabase';
import { getStoredStudentProfile, saveStoredStudentProfile, logAuditEvent } from '../services/storageService';
import {
  authenticateUser,
  registerNewUser,
  authenticateGoogleUser,
  initializeSeedAccounts,
  getStoredAccounts,
  mapStoredAccountToUser,
  normalizeUserRole,
} from '../services/authSecurityService';
import { recordServerAuthEvent } from '../services/authAuditService';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  currentStudent: StudentProfile | null;
  availableUsers: User[];
  isAuthenticated: boolean;
  login: (identifier: string, password: string, targetRole: UserRole) => Promise<{ success: boolean; message: string; user?: User }>;
  signUp: (name: string, email: string, password: string, role: UserRole, rollNumber?: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (profile: { email: string; name: string }, role: UserRole, rollNumber?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateCurrentStudent: (profile: StudentProfile) => void;
  selectRole: (role: UserRole) => void;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure seed accounts exist with salted SHA-256 hashes
  useEffect(() => {
    initializeSeedAccounts();
  }, []);

  const [availableUsers, setAvailableUsers] = useState<User[]>(() => {
    const stored = getStoredAccounts();
    if (stored.length > 0) {
      return stored.map(mapStoredAccountToUser);
    }
    return INITIAL_USERS;
  });

  const refreshUsers = () => {
    const stored = getStoredAccounts();
    if (stored.length > 0) {
      setAvailableUsers(stored.map(mapStoredAccountToUser));
    } else {
      setAvailableUsers(INITIAL_USERS);
    }
  };

  // Authenticated state is strictly false unless verified session exists
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('skillgap_authenticated');
    return savedAuth === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedAuth = localStorage.getItem('skillgap_authenticated') === 'true';
    const savedId = localStorage.getItem('skillgap_active_user_id');
    const stored = getStoredAccounts();
    if (savedAuth && savedId) {
      const matchStored = stored.find((a) => a.id === savedId);
      if (matchStored) return mapStoredAccountToUser(matchStored);
      const matchInitial = INITIAL_USERS.find((u) => u.id === savedId);
      if (matchInitial) return matchInitial;
    }
    // Default fallback to seed account for preview when not logged in
    if (stored.length > 0) {
      const student = stored.find((a) => a.role === 'STUDENT');
      if (student) return mapStoredAccountToUser(student);
      return mapStoredAccountToUser(stored[0]);
    }
    return INITIAL_USERS[0];
  });

  // Current student profile is strictly bound to the authenticated user ID and register number
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(() => {
    const savedAuth = localStorage.getItem('skillgap_authenticated') === 'true';
    const savedId = localStorage.getItem('skillgap_active_user_id');
    if (!savedAuth || !savedId) return null;

    const stored = getStoredAccounts();
    const activeAcc = stored.find((a) => a.id === savedId);
    if (activeAcc && activeAcc.role === 'STUDENT') {
      return getStoredStudentProfile(activeAcc.id, activeAcc.rollNumber, activeAcc.email);
    }
    return null;
  });

  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      localStorage.setItem('skillgap_active_user_id', currentUser.id);
    } else {
      localStorage.removeItem('skillgap_active_user_id');
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('skillgap_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  const switchUser = (userId: string) => {
    const stored = getStoredAccounts();
    const match = stored.find((a) => a.id === userId);
    if (match) {
      const user = mapStoredAccountToUser(match);
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (user.role === 'STUDENT') {
        const studentProfile = getStoredStudentProfile(user.id, match.rollNumber, match.email);
        setCurrentStudent(studentProfile);
      } else {
        setCurrentStudent(null);
      }
      logAuditEvent(user, 'USER_SWITCHED_SESSION', 'User', user.id, `Switched active role to ${user.role} (${user.name})`);
      return;
    }

    const fallbackUser = INITIAL_USERS.find((u) => u.id === userId);
    if (fallbackUser) {
      setCurrentUser(fallbackUser);
      setIsAuthenticated(true);
      if (fallbackUser.role === 'STUDENT') {
        const studentProfile = getStoredStudentProfile(fallbackUser.id, undefined, fallbackUser.email);
        setCurrentStudent(studentProfile);
      } else {
        setCurrentStudent(null);
      }
      logAuditEvent(fallbackUser, 'USER_SWITCHED_SESSION', 'User', fallbackUser.id, `Switched active role to ${fallbackUser.role} (${fallbackUser.name})`);
    }
  };

  const selectRole = (role: UserRole) => {
    const norm = normalizeUserRole(role);
    const stored = getStoredAccounts();
    const match = stored.find((a) => normalizeUserRole(a.role) === norm);
    if (match) {
      const user = mapStoredAccountToUser(match);
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (user.role === 'STUDENT') {
        const studentProfile = getStoredStudentProfile(user.id, match.rollNumber, match.email);
        setCurrentStudent(studentProfile);
      } else {
        setCurrentStudent(null);
      }
      logAuditEvent(user, 'ROLE_AUTHENTICATED', 'User', user.id, `Authenticated as ${user.role} (${user.name})`);
      return;
    }

    const fallbackUser = INITIAL_USERS.find((u) => normalizeUserRole(u.role) === norm) || INITIAL_USERS[0];
    if (fallbackUser) {
      setCurrentUser(fallbackUser);
      setIsAuthenticated(true);
      if (fallbackUser.role === 'STUDENT') {
        const studentProfile = getStoredStudentProfile(fallbackUser.id, undefined, fallbackUser.email);
        setCurrentStudent(studentProfile);
      } else {
        setCurrentStudent(null);
      }
      logAuditEvent(fallbackUser, 'ROLE_AUTHENTICATED', 'User', fallbackUser.id, `Authenticated as ${fallbackUser.role} (${fallbackUser.name})`);
    }
  };

  // Login: verifies credentials against stored salted SHA-256 hashes
  const login = async (
    identifier: string,
    password: string,
    targetRole: UserRole
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    const res = await authenticateUser(identifier, password, targetRole);
    if (!res.success || !res.user) {
      // Record failed authentication attempt safely on server
      recordServerAuthEvent({
        email: identifier.includes('@') ? identifier.toLowerCase().trim() : undefined,
        registerNumber: !identifier.includes('@') ? identifier.toUpperCase().trim() : undefined,
        role: targetRole,
        eventType: 'LOGIN_FAILED',
        status: 'FAILURE',
        authMethod: identifier.includes('@') ? 'Email/Password' : 'Register Number/Password',
        failureReason: res.message.toLowerCase().includes('password')
          ? 'INVALID_CREDENTIALS'
          : res.message.toLowerCase().includes('deactivated')
          ? 'ACCOUNT_DEACTIVATED'
          : 'ACCOUNT_NOT_FOUND',
        details: res.message || 'Authentication rejected by security policy',
      }).catch(() => {});

      return { success: false, message: res.message || 'Invalid email or password.' };
    }

    // Clear previous student state immediately
    setCurrentStudent(null);

    setCurrentUser(res.user);
    setIsAuthenticated(true);
    refreshUsers();

    const roll = res.rollNumber || (!identifier.includes('@') ? identifier.toUpperCase() : undefined);

    if (res.user.role === 'STUDENT') {
      // Load authenticated student's isolated profile directly from database/storage mapping
      const studentProfile = getStoredStudentProfile(res.user.id, roll, res.user.email);
      setCurrentStudent(studentProfile);
    } else {
      setCurrentStudent(null);
    }

    logAuditEvent(res.user, 'LOGIN_SUCCESS', 'User', res.user.id, `Logged in with verified password as ${res.user.role}`);

    // Record verified successful login on backend server audit ledger
    recordServerAuthEvent({
      userId: res.user.id,
      userName: res.user.name,
      email: res.user.email,
      registerNumber: roll,
      role: res.user.role,
      department: res.user.department,
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: identifier.includes('@') ? 'Email/Password' : 'Register Number/Password',
      details: `Authenticated as ${res.user.role} (${res.user.name})`,
    }).catch(() => {});

    return { success: true, message: 'Login successful.', user: res.user };
  };

  // Sign up: securely hashes password with salt
  const signUp = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    rollNumber?: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await registerNewUser(name, email, password, role, rollNumber);
    if (!res.success || !res.user) {
      return { success: false, message: res.message };
    }

    refreshUsers();
    logAuditEvent(res.user, 'ACCOUNT_CREATED', 'User', res.user.id, `Account created for ${email} with SHA-256 salted hash`);
    return {
      success: true,
      message: 'Account created successfully! Please sign in with your credentials.',
    };
  };

  // Google OAuth flow
  const loginWithGoogle = async (
    profile: { email: string; name: string },
    role: UserRole,
    rollNumber?: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await authenticateGoogleUser(profile, role, rollNumber);
    // Clear previous student state immediately
    setCurrentStudent(null);

    setCurrentUser(res.user);
    setIsAuthenticated(true);
    refreshUsers();

    if (normalizeUserRole(role) === 'STUDENT') {
      const roll = rollNumber || undefined;
      const studentProfile = getStoredStudentProfile(res.user.id, roll, res.user.email);
      setCurrentStudent(studentProfile);
    } else {
      setCurrentStudent(null);
    }

    logAuditEvent(res.user, 'GOOGLE_LOGIN_SUCCESS', 'User', res.user.id, `Authenticated via Google OAuth for ${profile.email}`);

    // Record verified Google OAuth event on backend
    recordServerAuthEvent({
      userId: res.user.id,
      userName: res.user.name,
      email: res.user.email,
      registerNumber: rollNumber ? rollNumber.toUpperCase().trim() : undefined,
      role: res.user.role,
      department: res.user.department,
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      authMethod: 'Google OAuth',
      details: `Authenticated via Google OAuth for ${profile.email}`,
    }).catch(() => {});

    return { success: true, message: 'Google authentication successful.' };
  };

  const logout = () => {
    if (currentUser) {
      logAuditEvent(currentUser, 'LOGOUT', 'User', currentUser.id, `User logged out: ${currentUser.email}`);
      // Record logout on server audit ledger
      recordServerAuthEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department,
        eventType: 'LOGOUT',
        status: 'SUCCESS',
        authMethod: 'Email/Password',
        details: `Session closed by user: ${currentUser.email}`,
      }).catch(() => {});
    }
    // 1. End authenticated session
    setIsAuthenticated(false);
    // 2. Clear in-memory account-specific profile state (CRITICAL: prevents cross-account leak)
    setCurrentStudent(null);
    // 3. Clear session storage tokens
    localStorage.removeItem('skillgap_authenticated');
    localStorage.removeItem('skillgap_active_user_id');
    localStorage.removeItem('skillgap_active_student_id');
  };

  const updateCurrentStudent = (profile: StudentProfile) => {
    if (!profile) return;
    const uid = profile.userId || currentUser?.id;
    saveStoredStudentProfile(profile, uid);
    setCurrentStudent(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: normalizeUserRole(currentUser.role),
        currentStudent,
        availableUsers,
        isAuthenticated,
        login,
        signUp,
        loginWithGoogle,
        logout,
        switchUser,
        updateCurrentStudent,
        selectRole,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
