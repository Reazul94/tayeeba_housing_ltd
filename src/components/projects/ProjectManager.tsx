import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { Building, MapPin, Layers, CheckCircle2, TrendingUp } from 'lucide-react';

export const ProjectManager: React.FC = () => {
  const { projects, plots, language, setCurrentTab } = useERP();
  const isBn = language === 'bn';

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Building className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "প্রজেক্ট ম্যানেজমেন্ট" : "Project Portfolio Management"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "প্রজেক্ট হাইরার্কি: প্রজেক্ট → ব্লক → জোন → রোড → প্লট" : "Hierarchy: Project → Block → Zone → Road → Plot."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map(p => {
          const prjPlots = plots.filter(pl => pl.projectId === p.id);
          const avail = prjPlots.filter(pl => pl.status === 'Available').length;
          const booked = prjPlots.filter(pl => pl.status === 'Booked').length;
          const sold = prjPlots.filter(pl => pl.status === 'Sold').length;

          return (
            <div key={p.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold bg-tayeeba-500/20 text-tayeeba-400 px-2.5 py-0.5 rounded border border-tayeeba-500/30">
                    {p.code}
                  </span>
                  <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded font-bold border border-slate-700">
                    {p.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-base">{p.name}</h3>
                <p className="text-xs text-slate-400 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-tayeeba-400" />
                  <span>{p.location}</span>
                </p>
                <p className="text-xs text-slate-300 line-clamp-2">{p.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-700/60 text-xs">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Land Area</span>
                    <strong className="text-white font-bold">{p.totalLandAreaDecimal} Decimals</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Total Plots</span>
                    <strong className="text-white font-bold">{p.totalPlots} Plots</strong>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 text-center font-bold text-[11px]">
                  <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded border border-emerald-500/20">
                    Avail: {avail}
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 p-1.5 rounded border border-amber-500/20">
                    Booked: {booked}
                  </div>
                  <div className="bg-rose-500/10 text-rose-400 p-1.5 rounded border border-rose-500/20">
                    Sold: {sold}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentTab('inventory')}
                  className="w-full bg-slate-900 hover:bg-slate-700 text-tayeeba-300 font-bold py-2 rounded-xl border border-slate-700 transition"
                >
                  View Plot Map Grid
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
