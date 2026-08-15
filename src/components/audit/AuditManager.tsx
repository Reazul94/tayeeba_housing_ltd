import React from 'react';
import { useERP } from '../../context/ERPContext';
import { ShieldAlert, Search, Lock } from 'lucide-react';

export const AuditManager: React.FC = () => {
  const { auditLogs, language } = useERP();
  const isBn = language === 'bn';

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "অডিট ট্রেইল ও নিরাপত্তা লগ" : "System Audit Trail & Operations Log"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "সিস্টেমের গুরুত্বপূর্ণ অ্যাকশন, পরিবর্তন ও ফিন্যান্সিয়াল অপারেশনের সুরক্ষিত ট্র্যাকিং" : "Immutable system event log tracking plot status updates, financial receipts & user actions."}
          </p>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
              <th className="p-3">User & Role</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Module</th>
              <th className="p-3">Action</th>
              <th className="p-3">Record ID</th>
              <th className="p-3">Old Value</th>
              <th className="p-3">New Value / Description</th>
              <th className="p-3 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-700/40 text-slate-200">
                <td className="p-3">
                  <div className="font-bold text-white">{log.userName}</div>
                  <div className="text-[10px] text-tayeeba-400">{log.userRole}</div>
                </td>
                <td className="p-3 text-slate-400">
                  <div>{log.date}</div>
                  <div className="text-[10px]">{log.time}</div>
                </td>
                <td className="p-3 font-semibold text-gold-400">{log.module}</td>
                <td className="p-3 font-extrabold text-emerald-400">{log.action}</td>
                <td className="p-3 font-mono text-slate-300">{log.recordId}</td>
                <td className="p-3 text-rose-400">{log.oldValue || 'N/A'}</td>
                <td className="p-3 font-semibold text-slate-100">{log.newValue}</td>
                <td className="p-3 text-right font-mono text-slate-400">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
