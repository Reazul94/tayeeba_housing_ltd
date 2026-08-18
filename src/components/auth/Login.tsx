import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import logoImg from '../../assets/logo.jpg';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Building2, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useERP();
  const [userId, setUserId] = useState('THL-EMP-00001');
  const [password, setPassword] = useState('Admin@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccessBanner, setResetSuccessBanner] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setErrorMsg('Please enter both User ID and Password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await login(userId.trim(), password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  const handleQuickDemoUser = (uId: string, pass: string) => {
    setUserId(uId);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans select-none">
      {/* Background Glow Decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-tayeeba-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-block p-1 bg-black rounded-2xl border-2 border-gold-500/50 shadow-xl">
            <img 
              src={logoImg} 
              alt="Tayeeba Housing Ltd. Logo" 
              className="w-16 h-16 object-contain rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              TAYEEBA HOUSING <span className="text-gold-400">LTD.</span>
            </h1>
            <p className="text-xs text-tayeeba-400 font-bold uppercase tracking-widest mt-0.5">
              Enterprise ERP & Accounts Platform (v2.7)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Authorized Corporate Access Only
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Reset Success Banner */}
        {resetSuccessBanner && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{resetSuccessBanner}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              User ID / Employee Code
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. THL-EMP-00001"
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-tayeeba-500 focus:ring-1 focus:ring-tayeeba-500 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-xs outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-tayeeba-500 focus:ring-1 focus:ring-tayeeba-500 rounded-xl pl-10 pr-10 py-3 text-white text-xs outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Prominent Forgot Password Link */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-gold-400 hover:text-gold-300 font-bold flex items-center space-x-1.5 transition underline hover:no-underline"
            >
              <KeyRound className="w-3.5 h-3.5 text-gold-400" />
              <span>Forgot Password? Reset via Email OTP</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-tayeeba-600 to-tayeeba-700 hover:from-tayeeba-500 hover:to-tayeeba-600 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-tayeeba-950/50 flex items-center justify-center space-x-2 transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating with Central Server...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </span>
            )}
          </button>
        </form>

        {/* Security Policy Reminder */}
        <div className="pt-2 border-t border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted LAN Relational Database Session</span>
          </div>

          {/* Quick Demo Credential Pills */}
          <div className="pt-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Quick Sign-in (Demo Accounts):</p>
            <div className="flex flex-wrap justify-center gap-1.5 text-[10px]">
              <button 
                type="button" 
                onClick={() => handleQuickDemoUser('THL-EMP-00001', 'Admin@12345')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-emerald-500/30 font-bold transition"
              >
                Super Admin
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickDemoUser('THL-EMP-00021', 'Acct@12345')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gold-400 rounded-lg border border-gold-500/30 font-bold transition"
              >
                Accounts Officer
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickDemoUser('THL-EMP-00045', 'Sales@12345')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-blue-500/30 font-bold transition"
              >
                Sales Executive
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickDemoUser('THL-EMP-00012', 'Admin@12345')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg border border-purple-500/30 font-bold transition"
              >
                HR Manager
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-6 text-center text-[11px] text-slate-500">
        © 2026 Tayeeba Housing Ltd. • Gulshan-2, Dhaka • Central LAN Network
      </footer>

      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
          onSuccessLogin={(resetUid) => {
            setShowForgotPassword(false);
            setUserId(resetUid);
            setPassword('');
            setResetSuccessBanner(`Password for ${resetUid} reset successfully! Please sign in with your new credentials.`);
          }}
        />
      )}
    </div>
  );
};
