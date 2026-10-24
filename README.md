# SkillGap AI
> **AI-Powered Placement Skill Gap Analyzer & Career Intelligence Platform**  
> *Tagline: Know Your Gap. Build Your Skills. Get Placement Ready.*

Built for 500+ college engineering students, placement cell coordinators, and institutional leadership.

---

## 🏛️ Source of Truth & Placement Curriculum Guide
Integrated directly with the **Roadmap for College Placement** crafted by **AI & DS - Batch 22-26'** under the guidance of **Mr. V. Manoj Praveen** (Placement Coordinator, AI & DS Dept):
- **Complete Guide Creator:** Gowtham M
- **Data Analyst Module:** Yogesh G
- **YouTube Suggestions:** Ragul S N
- **IoT & Robotics Module:** Vijay Bharath
- **Google Sheet Resource:** [docs.google.com/spreadsheets/d/1z1a2az4b9aWIXoX5bdE291yFt7h_6GyA](https://docs.google.com/spreadsheets/d/1z1a2az4b9aWIXoX5bdE291yFt7h_6GyA/edit)
- **Google Drive Folder:** [drive.google.com/drive/folders/1OchPTbYDb8MEbzj6rAqJgjLPNUoeyGwH](https://drive.google.com/drive/folders/1OchPTbYDb8MEbzj6rAqJgjLPNUoeyGwH)

---

## 🚀 Key System Modules

### 1. Student Intelligence
- **Verified Student Profiles:** Academic records, CGPA, backlogs, technical skill categories, projects with GitHub links, internships, and certifications.
- **Resume Intelligence:** Text extraction, section detection, skill normalization, confidence scoring, and human verification before committing to profile.
- **Eligibility Engine:** Checks CGPA, department, batch, and backlogs with explainable feedback (e.g. `CGPA requirement: 7.5 | Your CGPA: 7.1 (Short by 0.4)`).
- **Explainable Skill Gap Engine:** Distinguishes Exact Match, Semantic Match (high similarity), Partial Match, and Missing skills with deterministic priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Explainable Match Formula (100-Point Weighted Breakdown):**
  - **40%** Skill Coverage
  - **30%** Requirement Importance
  - **20%** Proficiency Alignment
  - **10%** Semantic Similarity
- **Personalized 6-Week Placement Roadmap:** Generated dynamically from detected gaps, attaching authentic courses, practice problems, and milestones from the PDF guide.
- **34 Build-Your-Own-X Engineering Projects:** Hands-on system building catalog (Web Dev, OS & Systems, AI/ML, Data Engineering, IoT & Robotics).

### 2. Resume Studio (AI LaTeX Resume Builder)
- **5 Professional LaTeX Templates:** ATS Classic, Modern Professional, Technical, Minimalist, Academic.
- **Authentic `resume.tex` Generation:** Strict LaTeX formatting without unparsed tables or graphics.
- **Overleaf Project ZIP Generator:** Downloads complete Overleaf ZIP archive with `resume.tex`, `README.txt`, and assets structure.
- **Dual Visual / LaTeX Code Editor:** Real-time editing and synchronization.
- **ATS Resume Analyzer:** Calculates keyword coverage against selected placement opportunities.
- **Bullet Point Improver:** Factual, action-verb driven bullet rewriting without fabricating metrics.
- **One-Page Resume Mode & Live Document Preview:** Native browser PDF printing.

### 3. Placement Cell & Institutional Administration
- **500+ Student Directory:** Server-side pagination, instant debounced search, CGPA & department filters, and missing skill cohort filters.
- **College-Wide Skill Analytics:** Aggregate trends across AI & DS, CSE, IT, ECE, and MECH.
- **Training Demand Calculator:** Real numbers computed across 500+ records (e.g. Power BI missing in 280 students, SQL in 210 students, Cloud in 175 students).
- **Data Import Center:** Google Sheet synchronization, CSV/XLSX file uploads, schema validation, duplicate detection, pre-flight preview, and rollback reporting.
- **Security & Audit Logs:** Immutable trace of logins, resume extractions, drive edits, and imports.

---

## 💻 Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Bundler & Utilities:** JSZip for Overleaf ZIP packaging, Dice bigram semantic matching
- **State & Architecture:** Context-driven role authorization (`STUDENT`, `PLACEMENT_ADMIN`, `SUPER_ADMIN`)
