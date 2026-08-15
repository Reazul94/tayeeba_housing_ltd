import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { BarChart3, FileText, Download, Printer } from 'lucide-react';

export const ReportManager: React.FC = () => {
  const { receipts, bookings, customers, expenses, projects, language } = useERP();
  const isBn = language === 'bn';

  const reportModules = [
    { title: 'Daily & Monthly Collection Summary', desc: 'Itemized cash & bank inflows with customer receipt references.', category: 'Financial' },
    { title: 'Project Profitability & Development Cost Report', desc: 'Project-wise plot sales revenue vs site development expenses.', category: 'Executive' },
    { title: 'Customer Accounts Receivable Aging Analysis', desc: '30, 60, 90+ days overdue customer payment schedules.', category: 'Collections' },
    { title: 'Plot Inventory & Sales Velocity Matrix', desc: 'Available, Booked & Sold plot ratio across all active townships.', category: 'Inventory' },
    { title: 'Trial Balance & Financial Statements Export', desc: 'Audited double-entry General Ledger & Income Statement.', category: 'Accounts' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "রিপোর্টস ও এনালাইটিক্স সেন্টার" : "Reports & Executive Analytics Center"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "সকল ক্যাটাগরির প্রতিবেদন এক্সপোর্ট, ফিল্টার ও প্রিন্ট ফরম্যাট" : "Generate, filter & export high-resolution executive reports & financial statements."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportModules.map((rep, idx) => (
          <div key={idx} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold bg-tayeeba-500/20 text-tayeeba-400 px-2 py-0.5 rounded">
                {rep.category}
              </span>
              <h3 className="font-extrabold text-white text-sm mt-2">{rep.title}</h3>
              <p className="text-slate-400 text-[11px] mt-1">{rep.desc}</p>
            </div>

            <div className="flex space-x-2 pt-3 border-t border-slate-700/60">
              <button
                onClick={() => alert(`Generating ${rep.title} PDF...`)}
                className="flex-1 bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
