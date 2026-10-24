import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, X, Code } from 'lucide-react';

interface PromptCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptCopyModal: React.FC<PromptCopyModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullPromptText = `# PLACEMENT PORTAL & CAREER INTELLIGENCE SYSTEM — COMPLETE ARCHITECTURE SPECIFICATION PROMPT

## 1. System Overview & Core Identity
Build a production-grade, enterprise Campus Placement & Career Intelligence Platform (SkillGap AI / Placement Portal) designed for higher education institutions (specifically Department of Artificial Intelligence & Data Science, Batch 2022–2026). The platform connects 500+ undergraduate engineering students, departmental faculty advisors, and the Central Training & Placement Office (TPO).

## 2. Authentication & Multi-Role Access Control (Strict Production Security)
Implement a real production authentication system with zero hardcoded auto-authentications:
- **Default State**: Unauthenticated users cannot access protected dashboards. Default \`isAuthenticated = false\`.
- **Passcode Security**: Passwords must be cryptographically hashed using Web Crypto API SHA-256 with unique cryptographic salts. Passwords are never stored as plain text.
- **Verification on Sign In**: Verify email/roll number and password against registered salted hashes. Reject invalid passwords with a clear error: "Invalid email/roll number or password."
- **Three-Way User Roles**:
  1. \`STUDENT\`: Authenticates using University Roll Number (e.g. 22AIDS014) and Password.
  2. \`STAFF\`: Authenticates using Institutional Email (e.g. staff.manoj@college.edu) and Password.
  3. \`PLACEMENT_ADMIN\`: Authenticates using TPO Email (e.g. tpo.placement@college.edu) and Password.
- **Sign-Up Flow**: Validate full name, email format, password length (≥ 6 chars), confirm password match, and terms acceptance. On successful sign-up, securely hash and store credentials, then redirect to the Sign-In tab with a clear success message. Do not auto-authenticate.
- **Google OAuth 2.0**: The "Continue with Google" button triggers an authentic Google OAuth account selection modal. Users explicitly choose their account before authenticating.

## 3. Visual Design System & Aesthetics (Adobe MAX × Zoho Puvi & Token Architecture)
- **Palette**: Pure obsidian black (#000000 / #070A11) canvas paired with high-voltage chromatic accents:
  - Electric Magenta (#FF007A), Vivid Violet (#7928CA), Electric Cyan (#00F0FF), Crimson Red (#E50914), and Solar Gold (#FFD600).
- **Design Tokens**:
  - Palette (28 tokens with interactive hex copying)
  - Typography (Georgia serif 'Ag' display paired with Zoho Puvi / JetBrains Mono)
  - Spacing (12-step vertical spacing scale)
- **Zero-Pill Discipline**: Never wrap informational static metadata into colored pill badges. Use unboxed text separated by typographic dots (\`·\`).

## 4. Feature Modules
1. **Student Workspace**: Explainable skill gap telemetry across 4 dimensions, 34 Build-Your-Own-X project blueprints, 360 LeetCode pattern radar, and live drive eligibility.
2. **In-Browser LaTeX Resume Studio**: Overleaf-ready LaTeX compilation with live preview and one-click ZIP download.
3. **Faculty Mentorship Hub**: Cohort oversight across 124 AI & DS students, skill verification queue, and corporate drive nomination pipeline.
4. **Placement Office (TPO) Suite**: 500+ candidate directory with server-side filters, Google Sheet bidirectional synchronization, and training demand budget calculator.
5. **4-Round CRT Preparation Guide**: Comprehensive curriculum spanning Round 1 Aptitude, Round 2 Coding & GD, Round 3 Technical Core CS (OS, DBMS, SQL, CN), and Round 4 HR.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0E1524] text-white border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#FF007A] to-[#7928CA] flex items-center justify-center text-white">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Full Website Specification Prompt</h3>
              <p className="text-[11px] text-slate-400">Copy-ready prompt to reproduce or document this platform</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Container */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed bg-[#070A11]/60">
          <pre className="whitespace-pre-wrap">{fullPromptText}</pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#0A0E17]">
          <span className="text-[11px] text-slate-400">
            {copied ? '✓ Prompt copied to clipboard!' : 'Ready to copy'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.05]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-slate-200 flex items-center gap-2 shadow-md cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Full Prompt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
