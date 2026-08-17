import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import logoImg from '../../assets/logo.jpg';
import { KeyRound, ShieldAlert, Check, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const FirstLogin: React.FC = () => {
  const { currentUser, changePassword } = useERP();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please complete all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and Confirmation do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative font-sans select-none">
      <div className="w-full max-w-md bg-slate-900 border border-tayeeba-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 relative z-10 animate-fadeIn">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-block p-1 bg-black rounded-2xl border-2 border-gold-500/50 shadow-xl">
            <img 
              src={logoImg} 
              alt="Tayeeba Housing Ltd. Logo" 
              className="w-14 h-14 object-contain rounded-xl"
            />
          </div>
          <div>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30 inline-flex items-center space-x-1 mb-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Mandatory Security Setup</span>
            </span>
            <h1 className="text-xl font-extrabold text-white">First-Time Login Setup</h1>
            <p className="text-xs text-slate-400 mt-1">
              Welcome, <span className="text-gold-400 font-bold">{currentUser.name}</span> ({currentUser.userId || currentUser.employeeCode}). For security, you must set a new permanent password to activate your ERP account.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Current Temporary Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter temporary password issued by admin"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs outline-none focus:border-tayeeba-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">New Permanent Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters (e.g. Pass@123)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs outline-none focus:border-tayeeba-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Confirm New Password</label>
            <div className="relative">
              <Check className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs outline-none focus:border-tayeeba-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span>Updating Credentials...</span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Activate Account & Enter ERP</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
