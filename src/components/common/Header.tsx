import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRole } from '../../types/erp';
import { 
  Building2, Search, Bell, Globe, UserCheck, Shield, ChevronDown, 
  CheckCircle, AlertTriangle, FileText, X
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentUser, setCurrentUserRole, language, setLanguage, 
    searchQuery, setSearchQuery, notifications, markNotificationRead, 
    setCurrentTab 
  } = useERP();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roles: UserRole[] = [
    'Super Admin', 
    'CEO/Director', 
    'Accounts', 
    'Sales Manager', 
    'Sales Executive', 
    'Marketing', 
    'HR'
  ];

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-lg">
      {/* Left: Branding */}
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-br from-tayeeba-600 to-tayeeba-800 text-white p-2 rounded-xl shadow-md border border-tayeeba-500/30 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-gold-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold tracking-tight text-lg text-white font-sans">
              TAYEEBA HOUSING <span className="text-gold-400">LTD.</span>
            </h1>
            <span className="bg-tayeeba-950 text-tayeeba-400 text-xs px-2 py-0.5 rounded-full font-bold border border-tayeeba-600/40">
              ERP v2.4
            </span>
            <span className="hidden sm:flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/40" title="Central LAN Database Connected">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>LAN ONLINE</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Real Estate ERP & Accounts Platform</p>
        </div>
      </div>

      {/* Center: Global Quick Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'en' ? "Global Search (Plot, Customer, Mobile, Receipt, NID)..." : "সার্চ করুন (প্লট, কাস্টমার, মোবাইল, রসিদ)..."}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-tayeeba-500 focus:ring-1 focus:ring-tayeeba-500 transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right: Actions, Language Toggle, Role Selector, Notifications */}
      <div className="flex items-center space-x-3">
        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-tayeeba-400" />
          <span>{language === 'en' ? 'EN' : 'বাংলা'}</span>
        </button>

        {/* Role Selector (Demo switcher) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-1.5 bg-tayeeba-950/80 border border-tayeeba-700/50 hover:border-tayeeba-500 text-tayeeba-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline">{currentUser.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-700 uppercase tracking-wider">
                Switch User Role
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentUserRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/70 transition ${currentUser.role === r ? 'text-tayeeba-400 font-bold bg-slate-700/30' : 'text-slate-200'}`}
                >
                  <span>{r}</span>
                  {currentUser.role === r && <CheckCircle className="w-3.5 h-3.5 text-tayeeba-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Drawer */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 transition"
          >
            <Bell className="w-4 h-4 text-slate-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-tayeeba-400" />
                  <span className="font-semibold text-xs text-white">Notifications ({notifications.length})</span>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/60">
                {notifications.map(n => (
                  <div 
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.linkTab) setCurrentTab(n.linkTab);
                      setShowNotifications(false);
                    }}
                    className={`p-3 text-xs hover:bg-slate-700/50 cursor-pointer transition ${!n.read ? 'bg-slate-700/30' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-slate-300">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-tayeeba-700 text-white font-bold text-xs flex items-center justify-center shadow">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-100">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
