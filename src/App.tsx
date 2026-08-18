import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Login } from './components/auth/Login';
import { FirstLogin } from './components/auth/FirstLogin';
import { AccessDenied } from './components/common/AccessDenied';
import { SessionTimeoutWarning } from './components/common/SessionTimeoutWarning';
import { ConfirmDialogModal, ToastContainer } from './components/common/ModernDialogs';

import { CEODashboard } from './components/dashboard/CEODashboard';
import { ProjectManager } from './components/projects/ProjectManager';
import { PlotInventoryMap } from './components/inventory/PlotInventoryMap';
import { CRMManager } from './components/crm/CRMManager';
import { BookingWizard } from './components/bookings/BookingWizard';
import { CollectionManager } from './components/collections/CollectionManager';
import { AccountingManager } from './components/accounting/AccountingManager';
import { ExpenseManager } from './components/expenses/ExpenseManager';
import { LandManager } from './components/land/LandManager';
import { SalesManager } from './components/sales/SalesManager';
import { DueManager } from './components/dues/DueManager';
import { HRManager } from './components/hr/HRManager';
import { DevelopmentManager } from './components/development/DevelopmentManager';
import { VendorManager } from './components/vendors/VendorManager';
import { TransferManager } from './components/transfer/TransferManager';
import { DocumentManager } from './components/documents/DocumentManager';
import { ReportManager } from './components/reports/ReportManager';
import { AuditManager } from './components/audit/AuditManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { UserManager } from './components/security/UserManager';
import { RoleManager } from './components/security/RoleManager';
import { OrganogramManager } from './components/security/OrganogramManager';
import { LoginHistory } from './components/security/LoginHistory';

const ERPContent: React.FC = () => {
  const { currentTab, isAuthenticated, mustChangePassword, hasPermission } = useERP();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Unauthenticated -> Show Enterprise Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <ConfirmDialogModal />
        <ToastContainer />
      </>
    );
  }

  // 2. Mandatory First-Login Password Change -> Show FirstLogin Wizard
  if (mustChangePassword) {
    return (
      <>
        <FirstLogin />
        <ConfirmDialogModal />
        <ToastContainer />
      </>
    );
  }

  // 3. Permission Route Guard Evaluation
  const renderTabContent = () => {
    // Check if user has permission to view current module
    if (!hasPermission(currentTab, 'view') && currentTab !== 'dashboard') {
      return <AccessDenied moduleName={currentTab} />;
    }

    switch (currentTab) {
      case 'dashboard':
        return <CEODashboard />;
      case 'projects':
        return <ProjectManager />;
      case 'inventory':
        return <PlotInventoryMap />;
      case 'crm':
        return <CRMManager />;
      case 'bookings':
      case 'installments':
        return <BookingWizard />;
      case 'collections':
        return <CollectionManager />;
      case 'accounting':
        return <AccountingManager />;
      case 'expenses':
        return <ExpenseManager />;
      case 'land':
        return <LandManager />;
      case 'sales':
        return <SalesManager />;
      case 'dues':
        return <DueManager />;
      case 'hr':
        return <HRManager />;
      case 'organogram':
        return <OrganogramManager />;
      case 'development':
        return <DevelopmentManager />;
      case 'vendors':
        return <VendorManager />;
      case 'transfer':
        return <TransferManager />;
      case 'documents':
        return <DocumentManager />;
      case 'reports':
        return <ReportManager />;
      case 'audit':
        return <AuditManager />;
      case 'users':
        return <UserManager />;
      case 'roles':
        return <RoleManager />;
      case 'login-history':
        return <LoginHistory />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <CEODashboard />;
    }
  };

  return (
    <div className="min-h-screen housing-watermark-bg flex flex-col font-sans text-slate-100 relative">
      <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className="flex flex-1 relative">
        <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full min-w-0">
          {renderTabContent()}
        </main>
      </div>
      <SessionTimeoutWarning />
      <ConfirmDialogModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <ERPContent />
    </ERPProvider>
  );
}
