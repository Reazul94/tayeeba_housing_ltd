import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { Landmark, MapPin, CheckCircle } from 'lucide-react';

export const LandManager: React.FC = () => {
  const { landParcels, language } = useERP();
  const isBn = language === 'bn';

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "জমি অধিগ্রহণ ও ওনার একাউন্ট" : "Land Acquisition & Parcel Management"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "মৌজা, দাগ, খতিয়ান ও জমি বিক্রেতার মূল্য পরিশোধ বিবরণী" : "Track Mouza, Dag/Khatian numbers, land area (Decimals), seller payment schedules & registration costs."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {landParcels.map(lp => (
          <div key={lp.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 text-xs">
            <div className="flex justify-between items-start border-b border-slate-700 pb-2">
              <div>
                <span className="text-[10px] bg-tayeeba-500/20 text-tayeeba-400 px-2 py-0.5 rounded font-bold">
                  {lp.status}
                </span>
                <h3 className="font-extrabold text-white text-base mt-1">{lp.ownerName}</h3>
                <p className="text-slate-400">Phone: {lp.ownerPhone} | NID: {lp.ownerNid}</p>
              </div>
              <div className="text-right font-extrabold text-tayeeba-400 text-sm">
                {lp.landAreaDecimal} Decimals
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300 bg-slate-900 p-3 rounded-xl">
              <div><span className="text-slate-400 text-[10px] block">Mouza Location</span><strong>{lp.mouza}</strong></div>
              <div><span className="text-slate-400 text-[10px] block">Dag Number</span><strong>{lp.dagNumber}</strong></div>
              <div><span className="text-slate-400 text-[10px] block">Khatian Number</span><strong>{lp.khatianNumber}</strong></div>
              <div><span className="text-slate-400 text-[10px] block">Land Type</span><strong>{lp.landType}</strong></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-700/60 pt-2">
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Purchase Price</span>
                <strong className="text-white font-bold">{formatBDT(lp.landPrice)}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-emerald-400 text-[10px] block">Paid Amount</span>
                <strong className="text-emerald-400 font-bold">{formatBDT(lp.paidAmount)}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-rose-400 text-[10px] block">Payable Due</span>
                <strong className="text-rose-400 font-bold">{formatBDT(lp.dueAmount)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
