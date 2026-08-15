import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { HardHat, CheckCircle2 } from 'lucide-react';

export const DevelopmentManager: React.FC = () => {
  const { projects, language } = useERP();
  const isBn = language === 'bn';

  const devTasks = [
    { name: 'Road Construction (60ft Main Avenue Earthfilling)', budget: 35000000, actual: 28000000, progress: 80, vendor: 'Royal Builders Ltd.' },
    { name: 'Underground Drainage System & Sewerage', budget: 22000000, actual: 19500000, progress: 90, vendor: 'Alam Pipe & Sanitation' },
    { name: 'Central Mosque & Commercial Plaza Foundation', budget: 15000000, actual: 11000000, progress: 75, vendor: 'Messrs Civil Const' },
    { name: 'Project Boundary Wall & Security Gate', budget: 12000000, actual: 12000000, progress: 100, vendor: 'Royal Builders Ltd.' },
    { name: 'Electrical Substation & Solar Street Lighting', budget: 18000000, actual: 9000000, progress: 50, vendor: 'Energy Power Ltd.' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <HardHat className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "প্রজেক্ট সাইট ডেভেলপমেন্ট ট্র্যাকার" : "Project Site Development & Construction Tracker"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "রাস্তা, ড্রেনেজ, বিদ্যুৎ, মসজিদ, সিকিউরিটি গেট ও বাউন্ডারি ওয়ালের বাজেট বনাম খরচ" : "Roads, drainage, mosque, solar lights & boundary wall construction progress."}
          </p>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="font-extrabold text-white text-sm">Site Development Milestone Tasks</h3>
        <div className="space-y-3">
          {devTasks.map((t, idx) => (
            <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-700/70 space-y-2 text-xs">
              <div className="flex justify-between items-start font-bold">
                <span className="text-white text-sm">{t.name}</span>
                <span className="text-tayeeba-400 font-extrabold">{t.progress}% Completed</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-tayeeba-500 h-full rounded-full transition-all" style={{ width: `${t.progress}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Contractor: <strong className="text-slate-200">{t.vendor}</strong></span>
                <span>Budget: <strong className="text-slate-200">{formatBDT(t.budget)}</strong> | Spent: <strong className="text-rose-400">{formatBDT(t.actual)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
