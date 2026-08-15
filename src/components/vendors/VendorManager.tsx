import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { ShoppingCart } from 'lucide-react';

export const VendorManager: React.FC = () => {
  const { vendors, language } = useERP();
  const isBn = language === 'bn';

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "ভেন্ডর ও পারচেজ ডিরেক্টরি" : "Vendor Directory & Purchase Management"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "নির্মাণ সামগ্রী ভেন্ডর, হেভি ইকুইপমেন্ট কন্ট্রাক্টর ও বকেয়া পে-অ্যাবল ট্র্যাকার" : "Manage materials suppliers, heavy equipment contractors, purchases & payables."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vendors.map(v => (
          <div key={v.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 text-xs">
            <div className="flex justify-between items-start border-b border-slate-700 pb-2">
              <div>
                <span className="text-[10px] bg-tayeeba-500/20 text-tayeeba-400 px-2 py-0.5 rounded font-bold">
                  {v.category}
                </span>
                <h3 className="font-extrabold text-white text-base mt-1">{v.name}</h3>
                <p className="text-slate-400">Contact: {v.contactPerson} ({v.phone})</p>
              </div>
            </div>

            <div className="text-slate-300">
              <div>Address: {v.address}</div>
              <div>Trade License / NID: {v.nidOrTradeLicense}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-700/60 font-bold">
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Total Purchases</span>
                <span className="text-white">{formatBDT(v.totalPurchases)}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-emerald-400 text-[10px] block">Total Paid</span>
                <span className="text-emerald-400">{formatBDT(v.totalPaid)}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-rose-400 text-[10px] block">Outstanding Due</span>
                <span className="text-rose-400">{formatBDT(v.outstandingBalance)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
