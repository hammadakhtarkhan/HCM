/**
 * Saylani Hackathon HCM Lite
 * Main Application Component
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { JudgeDemoBanner } from './components/common/JudgeDemoBanner';
import { FirstRunSetupModal } from './components/modals/FirstRunSetupModal';
import { ChangePasswordModal } from './components/modals/ChangePasswordModal';
import { LoginView } from './components/auth/LoginView';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { HRDashboard } from './components/dashboard/HRDashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { EmployeeDirectory } from './components/employees/EmployeeDirectory';
import { AttendanceView } from './components/attendance/AttendanceView';
import { LeaveManagementView } from './components/leave/LeaveManagementView';
import { PayrollView } from './components/payroll/PayrollView';
import { OrgSetupView } from './components/setup/OrgSetupView';
import { AuditLogView } from './components/audit/AuditLogView';
import { UserProfileView } from './components/profile/UserProfileView';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { user, isSetupCompleted, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-slate-500 font-medium">Initializing HCM Lite...</p>
      </div>
    );
  }

  // First Run Setup Wizard
  if (!isSetupCompleted) {
    return <FirstRunSetupModal />;
  }

  // Not logged in
  if (!user) {
    return <LoginView />;
  }

  // Render view depending on active tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        if (user.role === 'admin') return <AdminDashboard />;
        if (user.role === 'hr') return <HRDashboard />;
        return (
          <EmployeeDashboard
            onNavigate={tab => setCurrentTab(tab)}
            onOpenAIChat={() => setIsAIChatOpen(true)}
          />
        );

      case 'employees':
        return <EmployeeDirectory />;

      case 'attendance':
        return <AttendanceView />;

      case 'leave':
        return <LeaveManagementView />;

      case 'payroll':
        return <PayrollView />;

      case 'setup':
        return <OrgSetupView />;

      case 'audit':
        return <AuditLogView />;

      case 'profile':
        return <UserProfileView />;

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Mandatory First-Login Password Change Modal */}
      <ChangePasswordModal />

      {/* Evaluator Banner for Saylani Hackathon Judges */}
      <JudgeDemoBanner />

      {/* Top Bar Contract (Brand - 4/5 Links - Action) */}
      <Header
        currentTab={currentTab}
        onTabChange={tab => setCurrentTab(tab)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">{renderTabContent()}</main>

      {/* Floating AI Assistant Trigger */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-lg transition-all hover:scale-105 cursor-pointer"
        title="Open AI Assistant"
      >
        <Sparkles className="w-4 h-4 text-indigo-200" />
        <span>Ask HCM AI</span>
      </button>

      {/* Slide-out AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
