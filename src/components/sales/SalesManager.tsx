import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { Award, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';

export const SalesManager: React.FC = () => {
  const { commissions, bookings, employees, language } = useERP();
  const isBn = language === 'bn';

  const salesStaff = employees.filter(e => e.department === 'Sales');

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "সেলস ও কমিশন ম্যানেজমেন্ট" : "Sales Team & Commission Management"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "সেলস টিমের পারফরম্যান্স, টার্গেট বনাম অর্জন ও কমিশন পে-আউট" : "Sales executive targets vs achievements, commission rule calculations & payout status."}
          </p>
        </div>
      </div>

      {/* Sales Team Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {salesStaff.map(staff => {
          const staffBookings = bookings.filter(b => b.salesExecutiveName.includes(staff.name.split(' ')[0]));
          const staffSalesVal = staffBookings.reduce((sum, b) => sum + b.finalPrice, 0);

          return (
            <div key={staff.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-white text-sm">{staff.name}</h3>
                  <p className="text-tayeeba-400 text-[10px] font-semibold">{staff.designation}</p>
                </div>
                <span className="bg-tayeeba-500/20 text-tayeeba-400 border border-tayeeba-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="space-y-1 bg-slate-900 p-3 rounded-xl">
                <div className="flex justify-between"><span className="text-slate-400">Bookings Closed:</span><strong className="text-white">{staffBookings.length} Plots</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Total Sales Value:</span><strong className="text-emerald-400">{formatBDT(staffSalesVal)}</strong></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Commission Ledger Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <h3 className="text-sm font-extrabold text-white mb-3">Executive Commission Payout Register</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
              <th className="p-3">Recipient</th>
              <th className="p-3">Role</th>
              <th className="p-3">Plot & Customer</th>
              <th className="p-3">Sale Value</th>
              <th className="p-3">Rate</th>
              <th className="p-3 font-bold">Commission Amount</th>
              <th className="p-3 text-emerald-400">Paid</th>
              <th className="p-3 text-rose-400">Payable Due</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {commissions.map(c => (
              <tr key={c.id} className="hover:bg-slate-700/40 text-slate-200">
                <td className="p-3 font-bold text-white">{c.recipientName}</td>
                <td className="p-3 text-slate-400">{c.recipientRole}</td>
                <td className="p-3">Plot {c.plotNumber} ({c.customerName})</td>
                <td className="p-3 font-bold">{formatBDT(c.saleValue)}</td>
                <td className="p-3 font-mono text-tayeeba-400">{c.commissionRate}%</td>
                <td className="p-3 font-extrabold text-gold-400">{formatBDT(c.commissionAmount)}</td>
                <td className="p-3 text-emerald-400 font-semibold">{formatBDT(c.paidAmount)}</td>
                <td className="p-3 text-rose-400 font-semibold">{formatBDT(c.dueAmount)}</td>
                <td className="p-3">
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
