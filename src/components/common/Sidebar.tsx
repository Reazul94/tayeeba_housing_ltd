import React from 'react';
import { useERP } from '../../context/ERPContext';
import logoImg from '../../assets/logo.jpg';
import { 
  Home, Users, Building, UserSquare2, MapPin, 
  FileCheck, CreditCard, Clock, Calculator, Landmark, 
  Award, BookOpen, CalendarCheck, UserCheck, Map, 
  ShoppingCart, HardHat, RefreshCw, FolderLock, BarChart3, 
  Settings, ChevronRight, X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { currentTab, setCurrentTab, language, sidebarCollapsed } = useERP();

  const isBn = language === 'bn';

  // Navigation Items matching the reference screenshot
  const navigationItems = [
    { id: 'dashboard', label: isBn ? "ড্যাশবোর্ড" : "Dashboard", icon: Home },
    { id: 'crm', label: isBn ? "সিআরএম ও সেলস" : "CRM & Sales", icon: Users },
    { id: 'projects', label: isBn ? "প্রজেক্টসমূহ" : "Projects", icon: Building },
    { id: 'customers', label: isBn ? "কাস্টমারসমূহ" : "Customers", icon: UserSquare2 },
    { id: 'plots', label: isBn ? "প্লটস ইনভেন্টরি" : "Plots", icon: MapPin },
    { id: 'bookings', label: isBn ? "বুকিং ম্যানেজমেন্ট" : "Bookings", icon: FileCheck },
    { id: 'collections', label: isBn ? "কালেকশন ও রসিদ" : "Collections", icon: CreditCard },
    { id: 'installments', label: isBn ? "কিস্তি (Installments)" : "Installments", icon: Clock },
    { id: 'accounts', label: isBn ? "একাউন্টস ও ক্যাশ বুক" : "Accounts", icon: Calculator },
    { id: 'bank', label: isBn ? "ব্যাংক ম্যানেজমেন্ট" : "Bank", icon: Landmark },
    { id: 'capital', label: isBn ? "ক্যাপিটাল ও ইকুইটি" : "Capital", icon: Award },
    { id: 'accounting', label: isBn ? "ডাবল-এন্ট্রি একাউন্টিং" : "Accounting", icon: BookOpen },
    { id: 'meetings', label: isBn ? "ইসি ও বোর্ড মিটিং" : "Meetings", icon: CalendarCheck },
    { id: 'hr', label: isBn ? "এইচআর ও পে-রোল" : "HR & Payroll", icon: UserCheck },
    { id: 'land', label: isBn ? "জমি ক্রয় (Land)" : "Land", icon: Map },
    { id: 'vendors', label: isBn ? "ভেন্ডর ও ক্রয়" : "Vendors", icon: ShoppingCart },
    { id: 'development', label: isBn ? "সাইট ডেভেলপমেন্ট" : "Development", icon: HardHat },
    { id: 'transfer', label: isBn ? "ট্রান্সফার ও রিফান্ড" : "Transfer & Refund", icon: RefreshCw },
    { id: 'documents', label: isBn ? "ডকুমেন্ট ভল্ট" : "Documents", icon: FolderLock },
    { id: 'reports', label: isBn ? "রিপোর্টস ও অডিট" : "Reports", icon: BarChart3 },
    { id: 'settings', label: isBn ? "এডমিনিস্ট্রেশন ও সেটিংস" : "Administration", icon: Settings },
  ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#06231a] text-slate-200 flex flex-col transition-all duration-300 ease-in-out select-none border-r border-[#c5a059]/20
        md:translate-x-0 md:static md:z-0 md:h-[calc(100vh-4.5rem)] md:sticky md:top-[4.5rem]
        ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
      `}>
        {/* Top Logo / Branding in Sidebar */}
        <div className="p-4 border-b border-[#c5a059]/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-[#0a3325] border border-[#c5a059]/40 rounded-xl">
              <Building className="w-5 h-5 text-[#c5a059]" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="text-xs font-black tracking-wider text-white">TAYEEBA</div>
                <div className="text-[9px] text-[#c5a059] font-bold tracking-tight uppercase">ERP Management System</div>
              </div>
            )}
          </div>
          {mobileOpen && (
            <button onClick={onCloseMobile} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'plots' && currentTab === 'inventory');

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'badge-gold-active font-bold text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-[#0c3b28]/60'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#c5a059]'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.id !== 'dashboard' && (
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Server Status Card */}
        {!sidebarCollapsed && (
          <div className="p-3 m-2.5 rounded-2xl bg-[#041912] border border-[#c5a059]/20 text-center space-y-1">
            <div className="text-[10px] text-slate-400">Server Status</div>
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LAN ONLINE</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800">
              v3.0.0 | TAYEEBA ERP
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
