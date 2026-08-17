import React from 'react';
import { useERP } from '../../context/ERPContext';
import { ShieldX, ArrowLeft, Lock, HelpCircle } from 'lucide-react';

interface AccessDeniedProps {
  moduleName?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ moduleName }) => {
  const { setCurrentTab, currentUser } = useERP();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl animate-fadeIn">
        <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30 shadow-lg">
          <ShieldX className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="bg-rose-500/20 text-rose-300 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-rose-500/40">
            HTTP 403 • Restricted Area
          </span>
          <h2 className="text-xl font-extrabold text-white">Access Permission Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your user account (<strong className="text-white">{currentUser.name}</strong> • <span className="text-gold-400">{currentUser.role}</span>) does not have authorization to view the <strong className="text-emerald-400">{moduleName || 'requested'}</strong> module.
          </p>
        </div>

        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-slate-300 font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Role-Based Access Policy</span>
          </div>
          <p className="text-[11px] text-slate-400">
            If you require access to this module for official tasks, please request permission assignment from your System Administrator or General Manager.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="inline-flex items-center space-x-2 bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold px-5 py-2.5 rounded-xl shadow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to CEO Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
