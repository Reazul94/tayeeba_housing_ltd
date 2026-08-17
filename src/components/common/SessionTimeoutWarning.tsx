import React, { useEffect, useState, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import { Clock, ShieldAlert, CheckCircle, LogOut } from 'lucide-react';

const INACTIVITY_LIMIT_MS = 2 * 60 * 1000; // 2 minutes (120,000 ms)
const WARNING_BEFORE_MS = 20 * 1000; // Show warning 20 seconds before logout (at 1m40s)

export const SessionTimeoutWarning: React.FC = () => {
  const { isAuthenticated, logout } = useERP();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const lastActivityRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset activity timestamp on user interaction
  const resetActivity = () => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(20);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setShowWarning(false);
      return;
    }

    lastActivityRef.current = Date.now();

    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handleEvent = () => resetActivity();

    activityEvents.forEach(event => {
      window.addEventListener(event, handleEvent, { passive: true });
    });

    // Check inactivity every 1 second
    timerIntervalRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;

      if (idleTime >= INACTIVITY_LIMIT_MS) {
        // Auto Logout
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setShowWarning(false);
        logout();
      } else if (idleTime >= (INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS)) {
        // Show Warning Modal
        setShowWarning(true);
        const rem = Math.max(1, Math.ceil((INACTIVITY_LIMIT_MS - idleTime) / 1000));
        setSecondsRemaining(rem);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isAuthenticated, logout]);

  if (!showWarning || !isAuthenticated) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-center text-xs">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>

        <div className="space-y-1">
          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-500/40">
            Security Policy: 2-Minute Inactivity Rule
          </span>
          <h3 className="font-extrabold text-white text-base">Session Expiring Soon</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            No activity detected. To protect company real estate & financial records, you will be automatically logged out in:
          </p>
        </div>

        {/* Countdown Ring */}
        <div className="py-2">
          <div className="inline-block px-5 py-2.5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            <span className="text-3xl font-black font-mono text-gold-400">
              00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-xl font-bold border border-slate-700 transition flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Now</span>
          </button>

          <button
            type="button"
            onClick={resetActivity}
            className="px-6 py-2.5 bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-extrabold rounded-xl shadow-lg transition flex items-center space-x-1.5"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>Stay Signed In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
