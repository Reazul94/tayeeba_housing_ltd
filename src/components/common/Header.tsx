import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRole } from '../../types/erp';
import logoImg from '../../assets/logo.jpg';
import { 
  Search, Bell, Globe, ChevronDown, 
  X, User, LogOut, Menu, CheckCircle2, Shield
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { 
    currentUser, setCurrentUserRole, language, setLanguage, 
    searchQuery, setSearchQuery, notifications, markNotificationRead, 
    setCurrentTab, logout, usersList
  } = useERP();

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length || 7;

  return (
    <header className="erp-header-landscape border-b border-emerald-800/20 text-slate-800 px-4 md:px-8 py-3.5 sticky top-0 z-30 shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Hero Titles */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {onToggleMobileSidebar && (
            <button 
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 bg-white/80 backdrop-blur-md rounded-xl text-forest-900 border border-forest-800/20 shadow-sm"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <img 
            src={logoImg} 
            alt="Tayeeba Housing Ltd. Logo" 
            className="w-11 h-11 md:w-12 md:h-12 rounded-xl object-contain bg-forest-900 border-2 border-gold-500 p-1 shadow-md flex-shrink-0"
          />

          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-[#073826] font-sans">
              TAYEEBA HOUSING LTD. <span className="text-[#c5a059]">ERP</span>
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm font-black tracking-wider text-[#b38838] uppercase">
              BUILDING DREAMS, CREATING LANDMARKS
            </p>
            <p className="hidden sm:block text-[10px] sm:text-xs text-[#20523e] font-medium">
              A Complete Real Estate, Financial &amp; Management Solution
            </p>
          </div>
        </div>

        {/* Right: Search, Notifications, Language & User Pill */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Quick Search Toggle / Input */}
          <div className="relative">
            {showSearchInput ? (
              <div className="flex items-center bg-white/95 border border-forest-600/30 rounded-xl px-3 py-1.5 shadow-lg w-48 sm:w-64">
                <Search className="w-4 h-4 text-forest-700 mr-2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plot, customer..."
                  className="w-full bg-transparent text-xs text-forest-950 focus:outline-none placeholder:text-slate-400"
                />
                <button onClick={() => setShowSearchInput(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-2 bg-white/70 hover:bg-white text-forest-800 rounded-full border border-forest-800/20 shadow-sm transition"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Notifications with Red Badge [7] */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white/70 hover:bg-white text-forest-800 rounded-full border border-forest-800/20 shadow-sm transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {unreadCount}
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 bg-forest-900 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-gold-400" />
                    <span className="font-bold text-xs">Notifications ({notifications.length})</span>
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-300 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTab) setCurrentTab(n.linkTab);
                        setShowNotifications(false);
                      }}
                      className="p-3 text-xs hover:bg-slate-50 cursor-pointer transition text-slate-700"
                    >
                      <div className="font-bold text-forest-900">{n.title}</div>
                      <p className="text-[11px] text-slate-500">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="flex items-center space-x-1 bg-white/70 hover:bg-white text-forest-900 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-forest-800/20 shadow-sm transition"
          >
            <Globe className="w-3.5 h-3.5 text-forest-700" />
            <span>{language === 'en' ? 'English' : 'বাংলা'}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* User Profile Pill (CEO / Director) */}
          <div className="relative">
            <button 
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2.5 bg-white/85 hover:bg-white px-3 py-1.5 rounded-2xl border border-forest-800/20 shadow-sm transition group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-forest-800 to-forest-600 text-gold-300 font-bold text-xs flex items-center justify-center shadow-md border-2 border-gold-500">
                {currentUser.name ? currentUser.name.charAt(0) : 'T'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-black text-forest-950">
                  {currentUser.name || "Al-Haj Engr. Tayeebur Rahman"}
                </div>
                <div className="text-[10px] text-[#b38838] font-bold">
                  {currentUser.role === 'Super Admin' ? 'CEO / Director' : currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Role / User
                </div>
                {usersList.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUserRole(u.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition ${currentUser.role === u.role ? 'text-forest-900 font-bold bg-emerald-50/80' : 'text-slate-700'}`}
                  >
                    <div>
                      <div className="font-bold">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.role}</div>
                    </div>
                    {currentUser.role === u.role && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
