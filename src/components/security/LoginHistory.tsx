import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ShieldCheck, Search, Filter, Laptop, Monitor, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export const LoginHistory: React.FC = () => {
  const { loginHistories, language } = useERP();
  const isBn = language === 'bn';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredHistory = loginHistories.filter(log => {
    const matchSearch = (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (log.userId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (log.ipAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "লগইন অডিট হিস্ট্রি" : "User Login & Session Security Audit"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? "সকল ইউজারের লগইন ও সিকিউরিটি চেকের অডিট রেকর্ড" : "Real-time audit log of user logins, LAN IP addresses, device signatures and failed lockout events."}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] px-3 py-1 rounded-full font-bold">
            Total Sessions: {loginHistories.length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by User ID, Name, LAN IP Address..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-tayeeba-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none font-medium"
        >
          <option value="ALL">All Login Statuses</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
          <option value="LOCKED">LOCKED OUT</option>
        </select>
      </div>

      {/* Login History Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User ID & Name</th>
                <th className="py-3.5 px-4">Client LAN IP</th>
                <th className="py-3.5 px-4">Device & Browser</th>
                <th className="py-3.5 px-4">Status / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredHistory.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {log.loginTime}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{log.userName}</div>
                    <div className="text-[11px] font-mono text-tayeeba-400">{log.userId}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200 flex items-center space-x-1">
                      <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.device}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{log.browser}</div>
                  </td>
                  <td className="py-3 px-4">
                    {log.status === 'SUCCESS' ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>SUCCESS</span>
                      </span>
                    ) : log.status === 'LOCKED' ? (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-rose-400" />
                        <span>ACCOUNT LOCKED</span>
                      </span>
                    ) : (
                      <div>
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          FAILED
                        </span>
                        {log.failureReason && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{log.failureReason}</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
