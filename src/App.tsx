import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { ResumeIntelligencePage } from './pages/ResumeIntelligencePage';
import { JobOpportunitiesPage } from './pages/JobOpportunitiesPage';
import { SkillGapDashboardPage } from './pages/SkillGapDashboardPage';
import { PersonalizedRoadmapPage } from './pages/PersonalizedRoadmapPage';
import { ProjectRecommendationsPage } from './pages/ProjectRecommendationsPage';
import { ResumeBuilderAtsPage } from './pages/ResumeBuilderAtsPage';
import { PlacementGuidePage } from './pages/PlacementGuidePage';
import { PlacementCellDashboard } from './pages/PlacementCellDashboard';
import { CollegeAnalyticsPage } from './pages/CollegeAnalyticsPage';
import { StudentDirectoryPage } from './pages/StudentDirectoryPage';
import { DataImportCenterPage } from './pages/DataImportCenterPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { TrainingDemandPage } from './pages/TrainingDemandPage';
import { PlacementOfficerPage } from './pages/PlacementOfficerPage';
import { DeanPortalPage } from './pages/DeanPortalPage';
import { LoginActivityAuditPage } from './pages/LoginActivityAuditPage';
import { JobOpportunity, StudentProfile } from './types';

const MainAppContent: React.FC = () => {
  const { currentRole, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    return currentRole === 'STAFF'
      ? 'staff-dashboard'
      : currentRole === 'STUDENT'
      ? 'student-dashboard'
      : 'admin-dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedJobForAnalysis, setSelectedJobForAnalysis] = useState<string | undefined>(undefined);
  const [selectedStudentForView, setSelectedStudentForView] = useState<StudentProfile | null>(null);

  // When switching role, sync default tab
  React.useEffect(() => {
    if (activeTab === 'login') return;

    if (currentRole === 'STAFF') {
      if (
        activeTab === 'student-dashboard' ||
        activeTab === 'resume-intel' ||
        activeTab === 'roadmap' ||
        activeTab === 'project-recs' ||
        activeTab === 'admin-dashboard' ||
        activeTab === 'data-import' ||
        activeTab === 'audit-logs' ||
        activeTab === 'login-activity'
      ) {
        setActiveTab('staff-dashboard');
      }
    } else if (currentRole === 'STUDENT') {
      if (
        activeTab === 'admin-dashboard' ||
        activeTab === 'staff-dashboard' ||
        activeTab === 'college-analytics' ||
        activeTab === 'student-directory' ||
        activeTab === 'data-import' ||
        activeTab === 'audit-logs' ||
        activeTab === 'login-activity' ||
        activeTab === 'training-demand'
      ) {
        setActiveTab('student-dashboard');
      }
    } else {
      // PLACEMENT_ADMIN or SUPER_ADMIN
      if (
        activeTab === 'student-dashboard' ||
        activeTab === 'staff-dashboard' ||
        activeTab === 'student-profile' ||
        activeTab === 'resume-intel' ||
        activeTab === 'roadmap' ||
        activeTab === 'project-recs'
      ) {
        setActiveTab('admin-dashboard');
      }
    }
  }, [currentRole]);

  const handleAnalyzeJob = (job: JobOpportunity) => {
    setSelectedJobForAnalysis(job.id);
    setActiveTab('skill-gap');
  };

  const handleSelectStudent = (student: StudentProfile) => {
    setSelectedStudentForView(student);
    setActiveTab('student-profile');
  };

  const handleBackToDirectory = () => {
    setSelectedStudentForView(null);
    if (currentRole === 'STAFF') {
      setActiveTab('staff-dashboard');
    } else {
      setActiveTab('student-directory');
    }
  };

  const handleLoginSuccess = () => {
    if (currentRole === 'STAFF') {
      setActiveTab('staff-dashboard');
    } else if (currentRole === 'STUDENT') {
      setActiveTab('student-dashboard');
    } else {
      setActiveTab('admin-dashboard');
    }
  };

  // Reset window scroll position cleanly when switching pages
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // If user is not authenticated or explicitly navigated to login tab, render LoginPage
  if (!isAuthenticated || activeTab === 'login') {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        defaultRole={currentRole}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex min-w-0 w-full pt-[58px] sm:pt-[66px]">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
          }}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Content Pane */}
        <main id="apex-main-canvas" className="flex-1 min-w-0 max-w-full md:ml-64 p-4 sm:p-6 lg:p-8 bg-[#FFFFFF] text-slate-900">
          {/* Landing / Welcome Option */}
          {activeTab === 'landing' && (
            <LandingPage
              onGetStarted={() =>
                setActiveTab(
                  currentRole === 'STAFF'
                    ? 'staff-dashboard'
                    : currentRole === 'STUDENT'
                    ? 'student-dashboard'
                    : 'admin-dashboard'
                )
              }
              onExploreOpportunities={() => setActiveTab('placement-jobs')}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Staff / Faculty Views */}
          {activeTab === 'staff-dashboard' && (
            <StaffDashboardPage
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectStudent={handleSelectStudent}
            />
          )}

          {/* Student Views */}
          {activeTab === 'student-dashboard' && (
            <StudentDashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'student-profile' && (
            <StudentProfilePage
              customStudent={selectedStudentForView || undefined}
              onBack={selectedStudentForView ? handleBackToDirectory : undefined}
              isFacultyView={currentRole === 'STAFF'}
            />
          )}
          {activeTab === 'resume-intel' && <ResumeIntelligencePage />}
          {activeTab === 'placement-jobs' && (
            currentRole === 'STUDENT' ? (
              <JobOpportunitiesPage onAnalyzeJob={handleAnalyzeJob} />
            ) : (
              <PlacementOfficerPage onNavigate={(tab) => setActiveTab(tab)} />
            )
          )}
          {activeTab === 'skill-gap' && (
            <SkillGapDashboardPage
              selectedJobId={selectedJobForAnalysis}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'roadmap' && <PersonalizedRoadmapPage />}
          {activeTab === 'project-recs' && <ProjectRecommendationsPage />}
          {(activeTab === 'resume-builder' || activeTab === 'resume-studio') && <ResumeBuilderAtsPage />}
          {activeTab === 'placement-guide' && <PlacementGuidePage />}

          {/* Placement Cell & Admin Views */}
          {activeTab === 'dean-portal' && (
            <DeanPortalPage onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'admin-dashboard' && (
            <PlacementCellDashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'college-analytics' && <CollegeAnalyticsPage />}
          {activeTab === 'training-demand' && <TrainingDemandPage />}
          {activeTab === 'student-directory' && (
            <StudentDirectoryPage
              onSelectStudent={handleSelectStudent}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'data-import' && <DataImportCenterPage />}
          {activeTab === 'audit-logs' && <AuditLogsPage />}
          {activeTab === 'login-activity' && (
            <LoginActivityAuditPage onNavigate={(tab) => setActiveTab(tab)} />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
