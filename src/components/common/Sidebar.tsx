import React from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  LayoutDashboard, Building, MapPin, Users, CalendarCheck, FileCheck, 
  Clock, CreditCard, AlertCircle, Calculator, Receipt, Landmark, 
  Award, HardHat, ShoppingCart, UserCheck, RefreshCw, FolderLock, 
  BarChart3, ShieldAlert, Settings, ChevronRight, ChevronLeft, X, Shield, 
  KeyRound, Network, History, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { currentTab, setCurrentTab, language, hasPermission, sidebarCollapsed, setSidebarCollapsed } = useERP();

  const isBn = language === 'bn';

  const menuSections = [
    {
      title: isBn ? "এক্সিকিউটিভ ও মিটিং" : "Executive & Governance",
      items: [
        { id: 'dashboard', label: isBn ? "ড্যাশবোর্ড" : "CEO Dashboard", icon: LayoutDashboard },
        { id: 'meetings', label: isBn ? "ইসি ও বোর্ড মিটিং" : "EC & Board Meetings", icon: CalendarCheck },
        { id: 'projects', label: isBn ? "প্রজেক্ট ম্যানেজমেন্ট" : "Projects", icon: Building },
        { id: 'inventory', label: isBn ? "প্লট ইনভেন্টরি ম্যাপ" : "Plot Map & Inventory", icon: MapPin },
      ]
    },
    {
      title: isBn ? "সিআরএম ও সেলস" : "CRM & Sales Operations",
      items: [
        { id: 'crm', label: isBn ? "লিড ও সাইট ভিজিট CRM" : "Leads & Site Visits", icon: Users },
        { id: 'bookings', label: isBn ? "বুকিং ম্যানেজমেন্ট" : "Bookings Engine", icon: FileCheck },
        { id: 'installments', label: isBn ? "কিস্তি (ইনস্টলমেন্ট)" : "Installment Schedules", icon: Clock },
        { id: 'collections', label: isBn ? "কালেকশন ও রসিদ" : "Collections & Receipts", icon: CreditCard },
        { id: 'dues', label: isBn ? "বকেয়া ও রিমাইন্ডার" : "Dues & Reminders", icon: AlertCircle },
        { id: 'sales', label: isBn ? "সেলস ও কমিশন" : "Sales & Commission", icon: Award },
      ]
    },
    {
      title: isBn ? "একাউন্টস, ব্যাংক ও ফান্ড" : "Accounts, Bank & Capital",
      items: [
        { id: 'accounting', label: isBn ? "একাউন্টস ও ক্যাশ বুক" : "Accounts & Cash Operations", icon: Calculator },
        { id: 'bank', label: isBn ? "ব্যাংক ম্যানেজমেন্ট" : "Bank Management", icon: Landmark },
        { id: 'capital', label: isBn ? "ক্যাপিটাল ও শেয়ারহোল্ডার" : "Capital & Equity Fund", icon: Award },
        { id: 'expenses', label: isBn ? "খরচ (Expense)" : "Expenses", icon: Receipt },
        { id: 'land', label: isBn ? "জমি ক্রয় (Land)" : "Land Acquisition", icon: Landmark },
        { id: 'vendors', label: isBn ? "ভেন্ডর ও ক্রয়" : "Vendors & Purchases", icon: ShoppingCart },
      ]
    },
    {
      title: isBn ? "অপারেশনস ও এইচআর" : "Operations & HR",
      items: [
        { id: 'development', label: isBn ? "সাইট ডেভেলপমেন্ট" : "Site Development", icon: HardHat },
        { id: 'hr', label: isBn ? "এইচআর ও পে-রোল" : "HR & Payroll", icon: UserCheck },
        { id: 'organogram', label: isBn ? "অরগানোগ্রাম পদবি" : "Organogram Hierarchy", icon: Network },
        { id: 'transfer', label: isBn ? "প্লট ট্রান্সফার ও রিফান্ড" : "Plot Transfer & Refund", icon: RefreshCw },
        { id: 'documents', label: isBn ? "ডকুমেন্ট ভল্ট" : "Document Vault", icon: FolderLock },
      ]
    },
    {
      title: isBn ? "সিকিউরিটি ও অ্যাডমিন" : "Security & System Admin",
      items: [
        { id: 'users', label: isBn ? "ইউজার ম্যানেজমেন্ট" : "User Management", icon: Users },
        { id: 'roles', label: isBn ? "রোল ও পারমিশন (RBAC)" : "Role & Permissions", icon: Shield },
        { id: 'login-history', label: isBn ? "লগইন অডিট ট্রেইল" : "Login Audit Trail", icon: History },
        { id: 'reports', label: isBn ? "রিপোর্টস ও এনালাইটিক্স" : "Reports & Analytics", icon: BarChart3 },
        { id: 'audit', label: isBn ? "সিস্টেম অডিট লগ" : "System Audit Log", icon: ShieldAlert },
        { id: 'settings', label: isBn ? "সিস্টেম সেটিংস & LAN" : "System Settings", icon: Settings },
      ]
    }
  ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 ease-in-out select-none overflow-y-auto overflow-x-hidden
        md:translate-x-0 md:static md:z-0 md:h-[calc(100vh-4rem)] md:sticky md:top-16
        ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
      `}>
        {/* Mobile Header Close Button */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-800">
          <span className="font-extrabold text-white text-xs uppercase tracking-wider text-tayeeba-400">Navigation Menu</span>
          <button onClick={onCloseMobile} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Collapse / Expand Header Pill */}
        <div className="hidden md:flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-slate-950/40">
          {!sidebarCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              MAIN NAVIGATION
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-1 text-slate-400 hover:text-gold-400 rounded-lg hover:bg-slate-800 transition ${sidebarCollapsed ? 'mx-auto' : ''}`}
            title={sidebarCollapsed ? "Expand Sidebar Menu (Ctrl+B)" : "Collapse Sidebar Menu (Ctrl+B)"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-gold-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className={`py-3 ${sidebarCollapsed ? 'px-1.5' : 'px-3'} space-y-4 flex-1`}>
          {menuSections.map((section, idx) => {
            // Filter section items by user's view permission
            const permittedItems = section.items.filter(item => hasPermission(item.id, 'view'));
            if (permittedItems.length === 0) return null;

            return (
              <div key={idx}>
                {!sidebarCollapsed ? (
                  <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    {section.title}
                  </div>
                ) : (
                  <div className="my-1.5 border-t border-slate-800/60" />
                )}

                <div className="space-y-0.5">
                  {permittedItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        title={item.label}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-tayeeba-800 to-tayeeba-900 text-white font-bold shadow-md border-l-4 border-gold-400' 
                            : 'hover:bg-slate-800/80 hover:text-slate-100 text-slate-300'
                        }`}
                      >
                        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2.5'}`}>
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!sidebarCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Footer Info & Collapse Toggle */}
        <div className={`mt-auto p-2.5 border-t border-slate-800 bg-slate-950/60 text-center ${sidebarCollapsed ? 'px-1' : ''}`}>
          {!sidebarCollapsed ? (
            <>
              <div className="text-[11px] text-slate-400 font-semibold truncate">Tayeeba Housing Ltd. ERP</div>
              <div className="text-[10px] text-slate-500 font-mono">v2.7 • Production Cloud & LAN</div>
            </>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              title="Expand Sidebar"
              className="p-1.5 text-slate-400 hover:text-gold-400 hover:bg-slate-800 rounded-lg transition"
            >
              <PanelLeftOpen className="w-4 h-4 text-gold-400" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
