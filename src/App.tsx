import React from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

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

const ERPContent: React.FC = () => {
  const { currentTab } = useERP();

  const renderTabContent = () => {
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
      case 'settings':
        return <SettingsManager />;
      default:
        return <CEODashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderTabContent()}
        </main>
      </div>
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
