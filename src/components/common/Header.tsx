import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRole } from '../../types/erp';
import logoImg from '../../assets/logo.jpg';
import { 
  Building2, Search, Bell, Globe, UserCheck, Shield, ChevronDown, 
  CheckCircle, AlertTriangle, FileText, X, Edit3, User, Check, Menu, LogOut, KeyRound
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { 
    currentUser, setCurrentUserRole, language, setLanguage, 
    searchQuery, setSearchQuery, notifications, markNotificationRead, 
    setCurrentTab, logout, usersList, sidebarCollapsed, setSidebarCollapsed
  } = useERP();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Editable Profile state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profileRole, setProfileRole] = useState<UserRole>(currentUser.role);
  const [profileSuccess, setProfileSuccess] = useState(false);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    currentUser.name = profileName;
    currentUser.email = profileEmail;
    currentUser.role = profileRole;
    setCurrentUserRole(profileRole);
    setProfileSuccess(true);
    setTimeout(() => {
      setProfileSuccess(false);
      setShowProfileModal(false);
    }, 1500);
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between px-3 md:px-6 sticky top-0 z-30 shadow-lg">
      {/* Left: Mobile & Desktop Menu Toggle & Branding */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {onToggleMobileSidebar && (
          <button 
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 transition"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 transition hover:text-gold-400"
          title={sidebarCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
        >
          <Menu className="w-4 h-4" />
        </button>

        <img 
          src={logoImg} 
          alt="Tayeeba Housing Ltd. Logo" 
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-contain bg-black border border-gold-500/50 p-0.5 shadow-md flex-shrink-0"
        />
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold tracking-tight text-sm md:text-lg text-white font-sans">
              TAYEEBA HOUSING <span className="text-gold-400">LTD.</span>
            </h1>
            <span className="bg-gradient-to-r from-emerald-950 to-tayeeba-900 text-emerald-300 text-[10px] md:text-xs px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-500/50 shadow-sm shadow-emerald-950/50">
              ERP v2.7
            </span>
            <span className="hidden sm:flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/40" title="Central Relational Database Connected">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>LIVE CLOUD & LAN</span>
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-slate-400 font-medium">Real Estate ERP, CRM & Accounts Platform</p>
        </div>
      </div>

      {/* Center: Global Quick Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-6 relative">
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

      {/* Right: Actions, Language Toggle, Role Selector, Notifications, Logout */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-tayeeba-400" />
          <span>{language === 'en' ? 'EN' : 'বাংলা'}</span>
        </button>

        {/* Role Switcher (For testing permissions) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-1.5 bg-tayeeba-950/80 border border-tayeeba-700/50 hover:border-tayeeba-500 text-tayeeba-200 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline">{currentUser.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-700 uppercase tracking-wider">
                Switch User Account / Role
              </div>
              {usersList.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUserRole(u.role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/70 transition ${currentUser.role === u.role ? 'text-tayeeba-400 font-bold bg-slate-700/30' : 'text-slate-200'}`}
                >
                  <div>
                    <div className="font-bold">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.role} ({u.userId || u.employeeCode})</div>
                  </div>
                  {currentUser.role === u.role && <CheckCircle className="w-3.5 h-3.5 text-tayeeba-400 flex-shrink-0" />}
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
            <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
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

        {/* User Profile Avatar & ID Badge */}
        <button 
          onClick={() => setShowProfileModal(true)}
          className="flex items-center space-x-2 pl-2 border-l border-slate-800 hover:opacity-90 transition group text-left cursor-pointer"
          title="Click to View/Edit Profile"
        >
          <div className="w-8 h-8 rounded-full bg-tayeeba-600 text-white font-bold text-xs flex items-center justify-center shadow-md border border-tayeeba-400 group-hover:scale-105 transition">
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-100 flex items-center space-x-1">
              <span>{currentUser.name}</span>
            </div>
            <div className="text-[10px] text-tayeeba-400 font-mono font-bold">
              {currentUser.userId || currentUser.employeeCode || currentUser.role}
            </div>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 transition"
          title="Sign Out of ERP"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* User Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 relative text-xs">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-tayeeba-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg border-2 border-gold-400">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">{currentUser.name}</h3>
                <p className="text-xs text-tayeeba-400 font-mono font-bold">{currentUser.userId || currentUser.employeeCode}</p>
                <p className="text-[11px] text-slate-400">{currentUser.designationTitle || currentUser.role} • {currentUser.department || 'Management'}</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>User Profile successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-bold mb-1">User ID / Employee Code</label>
                <input 
                  type="text"
                  value={currentUser.userId || currentUser.employeeCode || 'THL-EMP-00001'}
                  disabled
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-400 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Display Name</label>
                <input 
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-tayeeba-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Corporate Email</label>
                <input 
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-tayeeba-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => { setShowProfileModal(false); logout(); }}
                  className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold flex items-center space-x-1.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
                
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-tayeeba-600 hover:bg-tayeeba-500 text-white rounded-xl font-bold shadow-lg transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
