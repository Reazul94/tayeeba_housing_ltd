import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Customer } from '../../types/erp';
import { formatBDT } from '../../utils/pdfGenerator';
import { AlertCircle, MessageSquare, Send, Phone, CheckCircle2, Clock } from 'lucide-react';

export const DueManager: React.FC = () => {
  const { customers, language } = useERP();
  const isBn = language === 'bn';

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const dueCustomers = customers.filter(c => c.totalDue > 0);
  const totalDueAmount = dueCustomers.reduce((sum, c) => sum + c.totalDue, 0);

  const handleSendReminder = (channel: 'WhatsApp' | 'SMS') => {
    if (!selectedCustomer) return;
    alert(`${channel} Payment Reminder sent to ${selectedCustomer.name} (${selectedCustomer.mobile})!\n\nDue Amount: BDT ${selectedCustomer.totalDue.toLocaleString()}`);
    setShowReminderModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{isBn ? "বকেয়া ও রিমাইন্ডার সেন্টার" : "Customer Due & Reminder Center"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "ওভারডিউ কাস্টমার ট্র্যাকিং ও অটোমেটেড SMS / WhatsApp রিমাইন্ডার সেন্ডার" : "Track overdue installments & dispatch automated SMS / WhatsApp payment reminders."}
          </p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2 rounded-xl text-xs font-bold">
          Total Due: {formatBDT(totalDueAmount)}
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
              <th className="p-3">Customer Name</th>
              <th className="p-3">Mobile & NID</th>
              <th className="p-3">Project & Plot</th>
              <th className="p-3 font-bold">Total Plot Value</th>
              <th className="p-3 text-emerald-400 font-bold">Total Paid</th>
              <th className="p-3 text-rose-400 font-bold">Outstanding Due</th>
              <th className="p-3 text-right">Reminder Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {dueCustomers.map(c => (
              <tr key={c.id} className="hover:bg-slate-700/40 text-slate-200">
                <td className="p-3 font-bold text-white">{c.name}</td>
                <td className="p-3 text-slate-400">{c.mobile}</td>
                <td className="p-3">{c.linkedProjectName} (Plot {c.linkedPlotNumber})</td>
                <td className="p-3 font-bold">{formatBDT(c.totalPlotValue)}</td>
                <td className="p-3 text-emerald-400 font-bold">{formatBDT(c.totalPaid)}</td>
                <td className="p-3 text-rose-400 font-extrabold text-sm">{formatBDT(c.totalDue)}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      setSelectedCustomer(c);
                      setShowReminderModal(true);
                    }}
                    className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow flex items-center space-x-1 ml-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Reminder</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-2 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-tayeeba-400" />
              <span>Send Payment Reminder</span>
            </h3>

            <div className="p-3 bg-slate-800 rounded-xl space-y-1">
              <div><span className="text-slate-400">Customer:</span> <strong className="text-white">{selectedCustomer.name}</strong></div>
              <div><span className="text-slate-400">Mobile:</span> <strong className="text-white">{selectedCustomer.mobile}</strong></div>
              <div><span className="text-slate-400">Plot:</span> <strong className="text-white">{selectedCustomer.linkedPlotNumber} ({selectedCustomer.linkedProjectName})</strong></div>
              <div><span className="text-slate-400">Outstanding Due:</span> <strong className="text-rose-400">{formatBDT(selectedCustomer.totalDue)}</strong></div>
            </div>

            {/* Template Preview */}
            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Reminder Message Template</label>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-700 font-sans text-slate-200 leading-relaxed text-[11px]">
                Dear {selectedCustomer.name}, this is a gentle payment reminder from Tayeeba Housing Ltd. Your upcoming installment of BDT {selectedCustomer.totalDue.toLocaleString()} for Plot {selectedCustomer.linkedPlotNumber} ({selectedCustomer.linkedProjectName}) is due. Kindly deposit to DBBL A/C: 110-120-4567 or visit Gulshan Office. Helpline: +880 9612-889900.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button onClick={() => setShowReminderModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
              <button onClick={() => handleSendReminder('SMS')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 rounded-xl">Send SMS</button>
              <button onClick={() => handleSendReminder('WhatsApp')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl">Send WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
