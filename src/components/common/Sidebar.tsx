import React from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  LayoutDashboard, Building, MapPin, Users, CalendarCheck, FileCheck, 
  Clock, CreditCard, AlertCircle, Calculator, Receipt, Landmark, 
  Award, HardHat, ShoppingCart, UserCheck, RefreshCw, FolderLock, 
  BarChart3, ShieldAlert, Settings, ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, language, currentUser } = useERP();

  const isBn = language === 'bn';

  const menuSections = [
    {
      title: isBn ? "এক্সিকিউটিভ ও প্রজেক্ট" : "Executive & Projects",
      items: [
        { id: 'dashboard', label: isBn ? "ড্যাশবোর্ড" : "CEO Dashboard", icon: LayoutDashboard, roleReq: [] },
        { id: 'projects', label: isBn ? "প্রজেক্ট ম্যানেজমেন্ট" : "Projects", icon: Building, roleReq: [] },
        { id: 'inventory', label: isBn ? "প্লট ইনভেন্টরি ম্যাপ" : "Plot Map & Inventory", icon: MapPin, roleReq: [] },
      ]
    },
    {
      title: isBn ? "সিআরএম ও সেলস" : "CRM & Sales Operations",
      items: [
        { id: 'crm', label: isBn ? "লিড ও সাইট ভিজিট CRM" : "Leads & Site Visits", icon: Users, roleReq: [] },
        { id: 'bookings', label: isBn ? "বুকিং ম্যানেজমেন্ট" : "Bookings Engine", icon: FileCheck, roleReq: [] },
        { id: 'installments', label: isBn ? "কিস্তি (ইনস্টলমেন্ট)" : "Installment Schedules", icon: Clock, roleReq: [] },
        { id: 'collections', label: isBn ? "ক কালেকশন ও রসিদ" : "Collections & Receipts", icon: CreditCard, roleReq: [] },
        { id: 'dues', label: isBn ? "বকেয়া ও রিমাইন্ডার" : "Dues & Reminders", icon: AlertCircle, roleReq: [] },
        { id: 'sales', label: isBn ? "সেলস ও কমিশন" : "Sales & Commission", icon: Award, roleReq: [] },
      ]
    },
    {
      title: isBn ? "একাউন্টস ও ফাইন্যান্স" : "Accounts & Finance",
      items: [
        { id: 'accounting', label: isBn ? "ডাবল-এন্ট্রি একাউন্টিং" : "Accounts & Finance", icon: Calculator, roleReq: [] },
        { id: 'expenses', label: isBn ? "খরচ (Expense)" : "Expenses", icon: Receipt, roleReq: [] },
        { id: 'land', label: isBn ? "জমি ক্রয় (Land)" : "Land Acquisition", icon: Landmark, roleReq: [] },
        { id: 'vendors', label: isBn ? "ভেন্ডর ও ক্রয়" : "Vendors & Purchases", icon: ShoppingCart, roleReq: [] },
      ]
    },
    {
      title: isBn ? "অপারেশনস ও এইচআর" : "Operations & Operations",
      items: [
        { id: 'development', label: isBn ? "সাইট ডেভেলপমেন্ট" : "Site Development", icon: HardHat, roleReq: [] },
        { id: 'hr', label: isBn ? "এইচআর ও পে-রোল" : "HR & Payroll", icon: UserCheck, roleReq: [] },
        { id: 'transfer', label: isBn ? "প্লট ট্রান্সফার ও রিফান্ড" : "Plot Transfer & Refund", icon: RefreshCw, roleReq: [] },
        { id: 'documents', label: isBn ? "ডকুমেন্ট ভল্ট" : "Document Vault", icon: FolderLock, roleReq: [] },
      ]
    },
    {
      title: isBn ? "রিপোর্টস ও সিকিউরিটি" : "Reports & System Admin",
      items: [
        { id: 'reports', label: isBn ? "রিপোর্টস ও এনালাইটিক্স" : "Reports & Analytics", icon: BarChart3, roleReq: [] },
        { id: 'audit', label: isBn ? "অডিট ট্রেইল লগ" : "Audit Trail", icon: ShieldAlert, roleReq: [] },
        { id: 'settings', label: isBn ? "সিস্টেম সেটিংস & RBAC" : "System Settings", icon: Settings, roleReq: [] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto">
      <div className="py-3 px-3 space-y-5">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-tayeeba-800 to-tayeeba-900 text-white font-semibold shadow-md border-l-4 border-gold-400' 
                        : 'hover:bg-slate-800/80 hover:text-slate-100 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-gold-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottom Footer Info */}
      <div className="mt-auto p-3 border-t border-slate-800 bg-slate-950/60 text-center">
        <div className="text-[11px] text-slate-400 font-semibold">Tayeeba Housing Ltd.</div>
        <div className="text-[10px] text-slate-500">Dhaka, Bangladesh • 2026</div>
      </div>
    </aside>
  );
};
