# Implementation Plan — MAX Placement 2026 LaTeX Resume Studio Repair, ATS Analysis, Recruiter Review & College Events

## Overview
This implementation plan covers the complete repair and upgrade of the **LaTeX Resume Studio**, **ATS Analysis Engine**, **Recruiter Review Scorecard**, and **College Events & Announcements** feature within MAX Placement 2026.

---

## Proposed Changes

### Phase 1 — LaTeX Resume Studio & Editor Repair (`ResumeStudioPage.tsx` & `LatexCodeEditor.tsx`)
- Ensure the LaTeX code editor container has full vertical flex-1 scrolling, synchronized line numbers, and no artificial line limits or truncation.
- Bind editor source state to unique per-student localStorage keys (`skillgap_resume_latex_${studentId}`) so edits persist across page refreshes and account switches.
- Implement robust compilation status handling with reliable timeout and error extraction (displaying compiler diagnostics and jump-to-error capabilities).

### Phase 2 — Transparent ATS Analysis & Job Match (`ResumeIntelligencePage.tsx` & `nlpEngine.ts`)
- Implement transparent 100-point MAX ATS Compatibility Score breakdown across:
  - Text readability & parsing (20 pts)
  - Structure & clarity (20 pts)
  - Relevant skills & terminology (25 pts)
  - Projects & experience evidence (20 pts)
  - Education & qualifications (10 pts)
  - Consistency & quality (5 pts)
- Provide job-specific resume matching against active placement drives, highlighting matched skills, missing skills, and actionable recommendations.

### Phase 3 — Recruiter Candidate Review & Scorecard (`StudentProfilePage.tsx` & `PlacementOfficerPage.tsx`)
- Integrate candidate resume preview, ATS score, job match breakdown, and structured recruiter scorecard into staff/recruiter review portals.
- Persist recruiter notes and review statuses (`Shortlisted`, `Interview Scheduled`, `Under Review`, `Not Selected`).

### Phase 4 — College Events & Announcements (`CollegeEventsPage.tsx` & `storageService.ts`)
- **Staff Event Publishing Portal**: Create/edit event form supporting title, organizer, category, date, deadline, location, registration URL, poster upload, description, requirements, and publication status (`Draft`, `Published`, `Archived`).
- **Student Events View**: Read-only browsing, category/date filters, search, and **"I'm Interested"** button with persistent tick indicator stored per student account ID.
- **Staff Interest Tracking**: Actionable "View Interested Students" list showing student name, register number, department, batch, and timestamp.

---

## Verification Plan
- **Test 1**: Load a 100+ line LaTeX resume in Resume Studio, scroll through, edit, compile, and verify persistence.
- **Test 2**: Upload a sample PDF resume, verify 100-point ATS score calculation and job-specific match breakdown.
- **Test 3**: Staff creates and publishes a College Event with poster; Student browses events, clicks "Interested", verifies tick persistence.
- **Test 4**: Staff opens "View Interested Students" and confirms interested student records are correctly listed.
