import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { GoogleOAuthModal } from '../components/GoogleOAuthModal';
import { ApexLogoBadge } from '../components/ApexLogo';

interface LoginPageProps {
  onSuccess?: () => void;
  defaultRole?: UserRole;
  initialMode?: 'SIGN_IN' | 'SIGN_UP';
}

type HolographicTheme =
  | 'theme-neon'
  | 'theme-aurora'
  | 'theme-sunset'
  | 'theme-emerald'
  | 'theme-royal'
  | 'theme-mono';

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  defaultRole = 'STUDENT',
  initialMode = 'SIGN_IN',
}) => {
  const { login, signUp, loginWithGoogle } = useAuth();

  // Mode: 'SIGN_IN' | 'SIGN_UP'
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>(initialMode);

  // Active role: 'STAFF' | 'STUDENT' | 'PLACEMENT_ADMIN'
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);

  // Holographic Theme state
  const [currentTheme, setCurrentTheme] = useState<HolographicTheme>('theme-neon');

  // Form inputs (Empty by default - no hardcoded credentials)
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  // 3D Tilt Card Ref
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const MAX = 6;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const ry = (px - 0.5) * 2 * MAX;
    const rx = (0.5 - py) * 2 * MAX;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        cardRef.current.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
        cardRef.current.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        cardRef.current.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      }
    });
  };

  const handlePointerLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.setProperty('--rx', '0deg');
      cardRef.current.style.setProperty('--ry', '0deg');
      cardRef.current.style.setProperty('--mx', '50%');
      cardRef.current.style.setProperty('--my', '50%');
    }
  };

  useEffect(() => {
    handlePointerLeave();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Sign In submission with real password verification
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = selectedRole === 'STUDENT' ? rollNumber.trim() : email.trim();
    if (!identifier) {
      setErrorMessage(
        selectedRole === 'STUDENT'
          ? 'Please enter your university Roll Number (e.g., 22AIDS014).'
          : 'Please enter your institutional email address.'
      );
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(identifier, password, selectedRole);
      if (res.success) {
        setSuccessMessage('Authentication verified! Loading portal...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 500);
      } else {
        setErrorMessage(res.message || 'Invalid email/roll number or password.');
      }
    } catch {
      setErrorMessage('Sign in failed. Please verify credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up submission with validation and salted SHA-256 hashing
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (selectedRole === 'STUDENT' && !rollNumber.trim()) {
      setErrorMessage('Please enter your university Roll Number (e.g., 22AIDS014).');
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a secure password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms & Privacy policy.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUp(fullName, cleanEmail, password, selectedRole, rollNumber);
      if (res.success) {
        setSuccessMessage('Account registered successfully! Please sign in with your new credentials.');
        setPassword('');
        setConfirmPassword('');
        setAuthMode('SIGN_IN');
      } else {
        setErrorMessage(res.message || 'Registration failed. Please check your information.');
      }
    } catch {
      setErrorMessage('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (profile: { email: string; name: string }) => {
    setGoogleModalOpen(false);
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginWithGoogle(profile, selectedRole, rollNumber);
      if (res.success) {
        setSuccessMessage(`Signed in as ${profile.email}`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 500);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08070d] text-slate-100 flex flex-col justify-between items-center py-6 px-4 font-sans relative overflow-x-clip selection:bg-[#ff2770] selection:text-white">
      {/* Background radial gradient identical to source */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(70% 60% at 50% 12%, #16151f 0%, #08070d 70%), #08070d',
        }}
      />

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-4xl h-14 shrink-0 flex items-center justify-between gap-2 py-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="shrink-0">
            <ApexLogoBadge size="sm" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-xs font-mono font-bold tracking-widest text-white uppercase truncate">
              Career Intelligence
            </div>
            <div className="text-[10px] text-slate-400 font-medium hidden sm:block truncate">
              Turning Skills Into Opportunities.
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.08] text-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              setAuthMode('SIGN_IN');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
              authMode === 'SIGN_IN'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('SIGN_UP');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
              authMode === 'SIGN_UP'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create account
          </button>
        </div>
      </header>

      {/* Main Center Holographic Stage */}
      <main className="stage relative z-10 my-6 flex flex-col items-center justify-center">
        {/* Holographic Tilt Card */}
        <div
          ref={cardRef}
          id="card"
          tabIndex={-1}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className={`holo-card ${currentTheme} p-6 sm:p-8 space-y-6`}
        >
          {/* soft drifting aurora (from option A) */}
          <div className="layer aurora" aria-hidden="true">
            <span className="blob blob-a"></span>
            <span className="blob blob-b"></span>
            <span className="blob blob-c"></span>
          </div>

          {/* faint neon rays, masked to edges (toned-down option B) */}
          <div className="layer rings" aria-hidden="true"></div>

          {/* glass panel */}
          <div className="layer panel"></div>

          {/* animated border beam */}
          <div className="layer beam" aria-hidden="true"></div>

          {/* holographic sheen tracks cursor */}
          <div className="layer sheen" aria-hidden="true"></div>

          {/* reveal = clipping plane */}
          <div className="layer reveal space-y-5">
            {/* Holographic Title */}
            <h2 className="title">
              <i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
              <span>{authMode === 'SIGN_UP' ? 'Register' : 'Login'}</span>
              <i className="fa-solid fa-heart heart" aria-hidden="true"></i>
            </h2>

            {/* Role Switcher Pill Selector (Staff | Student | Office) */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 text-xs font-medium text-center">
                <button
                  type="button"
                  onClick={() => handleRoleChange('STAFF')}
                  className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === 'STAFF'
                      ? 'bg-white text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('STUDENT')}
                  className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === 'STUDENT'
                      ? 'bg-white text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('PLACEMENT_OFFICER')}
                  className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === 'PLACEMENT_OFFICER'
                      ? 'bg-white text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Placement Officer</span>
                </button>
              </div>
            </div>

            {/* Error & Success Feedback */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-xs text-red-200 font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200 font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {forgotPasswordSent && (
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-600 text-xs text-cyan-200 font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Password reset link sent to your institutional inbox.</span>
              </div>
            )}

            {/* Form Fields matching User's Source with Floating Labels */}
            {authMode === 'SIGN_UP' ? (
              /* ======================= SIGN UP FLOW ======================= */
              <form onSubmit={handleSignUp} className="space-y-3.5" noValidate>
                {/* Full Name */}
                <div className="field">
                  <i className="fa-solid fa-user field-icon" aria-hidden="true"></i>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder=" "
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <label htmlFor="fullName">Full Name</label>
                </div>

                {/* Roll Number (for Student) */}
                {selectedRole === 'STUDENT' && (
                  <div className="field">
                    <i className="fa-solid fa-id-badge field-icon" aria-hidden="true"></i>
                    <input
                      id="rollNumber"
                      name="rollNumber"
                      type="text"
                      placeholder=" "
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                    <label htmlFor="rollNumber">Roll Number (e.g. 22AIDS014)</label>
                  </div>
                )}

                {/* Institutional Email */}
                <div className="field">
                  <i className="fa-solid fa-envelope field-icon" aria-hidden="true"></i>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder=" "
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email">
                    {selectedRole === 'STUDENT' ? 'College Email (alex.kumar@college.edu)' : 'Institutional Email'}
                  </label>
                </div>

                {/* Password */}
                <div className="field">
                  <i className="fa-solid fa-lock field-icon" aria-hidden="true"></i>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=" "
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password">Password (min 6 chars)</label>
                  <button
                    type="button"
                    className="toggle-pw"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} aria-hidden="true"></i>
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="field">
                  <i className="fa-solid fa-lock field-icon" aria-hidden="true"></i>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder=" "
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <button
                    type="button"
                    className="toggle-pw"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showConfirmPassword}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} aria-hidden="true"></i>
                  </button>
                </div>

                {/* Agree to Terms */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-pink-500 focus:ring-pink-500"
                    />
                    <span>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setTermsModalOpen(true)}
                        className="underline font-semibold text-white hover:text-cyan-300"
                      >
                        Terms &amp; Privacy
                      </button>
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button type="submit" className="submit w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <i className="fa-solid fa-arrow-right-long" aria-hidden="true"></i>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ======================= SIGN IN FLOW ======================= */
              <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                {/* Student enters Roll Number; Staff/Office enters Institutional Email */}
                {selectedRole === 'STUDENT' ? (
                  <div className="field">
                    <i className="fa-solid fa-id-badge field-icon" aria-hidden="true"></i>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder=" "
                      autoComplete="username"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                    <label htmlFor="username">Roll Number (e.g. 22AIDS014)</label>
                  </div>
                ) : (selectedRole === 'STAFF' || selectedRole === 'PLACEMENT_OFFICER') ? (
                  <div className="field">
                    <i className="fa-solid fa-envelope field-icon" aria-hidden="true"></i>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder=" "
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="email">Official Email Address</label>
                  </div>
                ) : null}

                {/* Password with toggle */}
                <div className="field">
                  <i className="fa-solid fa-lock field-icon" aria-hidden="true"></i>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=" "
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    className="toggle-pw"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} aria-hidden="true"></i>
                  </button>
                </div>

                {/* Submit button */}
                <button type="submit" className="submit w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign in</span>
                      <i className="fa-solid fa-arrow-right-long" aria-hidden="true"></i>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider: OR */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#0e0d14] px-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 absolute">
                or
              </span>
            </div>

            {/* Google SSO Button */}
            <button
              type="button"
              onClick={() => setGoogleModalOpen(true)}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{authMode === 'SIGN_UP' ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>

            {/* Group Navigation Links */}
            <div className="group pt-1">
              <button
                type="button"
                onClick={() => setForgotPasswordSent(true)}
                className="hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
              <button
                type="button"
                className="accent hover:underline cursor-pointer"
                onClick={() => {
                  setAuthMode(authMode === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
              >
                {authMode === 'SIGN_IN' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
        </main>
        
        {/* Exact Theme Switcher from User's Source */}
        <div className="holo-themes relative z-20 mt-2" role="group" aria-label="Theme">
        <button
          type="button"
          data-theme="theme-aurora"
          onClick={() => setCurrentTheme('theme-aurora')}
          className={currentTheme === 'theme-aurora' ? 'active' : ''}
          style={{ ['--sw1' as string]: '#8a5cff', ['--sw2' as string]: '#3ad6ff' }}
          title="Aurora"
        />
        <button
          type="button"
          data-theme="theme-sunset"
          onClick={() => setCurrentTheme('theme-sunset')}
          className={currentTheme === 'theme-sunset' ? 'active' : ''}
          style={{ ['--sw1' as string]: '#ff6a3d', ['--sw2' as string]: '#ffd166' }}
          title="Sunset"
        />
        <button
          type="button"
          data-theme="theme-emerald"
          onClick={() => setCurrentTheme('theme-emerald')}
          className={currentTheme === 'theme-emerald' ? 'active' : ''}
          style={{ ['--sw1' as string]: '#22e3a3', ['--sw2' as string]: '#7dff9b' }}
          title="Emerald"
        />
        <button
          type="button"
          data-theme="theme-royal"
          onClick={() => setCurrentTheme('theme-royal')}
          className={currentTheme === 'theme-royal' ? 'active' : ''}
          style={{ ['--sw1' as string]: '#c9a227', ['--sw2' as string]: '#9b5cff' }}
          title="Royal Gold"
        />
        <button
          type="button"
          data-theme="theme-mono"
          onClick={() => setCurrentTheme('theme-mono')}
          className={currentTheme === 'theme-mono' ? 'active' : ''}
          style={{ ['--sw1' as string]: '#e8e8ef', ['--sw2' as string]: '#9aa3b2' }}
          title="Platinum"
        />
      </div>

      {/* Google OAuth Modal */}
      <GoogleOAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        selectedRole={selectedRole}
        rollNumber={rollNumber}
      />

      {/* Terms & Privacy Modal */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0E1524] text-slate-100 rounded-3xl border border-white/[0.1] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Institutional Terms &amp; Privacy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto pr-2">
              <p>
                1. <strong>Academic Integrity:</strong> User accounts are tied to verified university roll numbers and institutional emails. Passwords are cryptographically salted and hashed using Web Crypto API SHA-256 before storage.
              </p>
              <p>
                2. <strong>Recruitment Data Privacy:</strong> Student profiles, resumes, and aptitude scores are shared solely with registered campus recruiters authorized by the Training and Placement Cell.
              </p>
              <p>
                3. <strong>Access Control:</strong> Unauthenticated users are prevented from accessing institutional intelligence or peer records.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setTermsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Accept &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
