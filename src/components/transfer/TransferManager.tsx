import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export const TransferManager: React.FC = () => {
  const { 
    bookings, customers, plots, 
    cancelBooking, transferPlot, language 
  } = useERP();

  const isBn = language === 'bn';

  const [activeSub, setActiveSub] = useState<'transfer' | 'cancel'>('cancel');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [cancellationFee, setCancellationFee] = useState(100000);
  const [cancelReason, setCancelReason] = useState('Personal reasons');

  const [transferPlotId, setTransferPlotId] = useState('');
  const [fromCustId, setFromCustId] = useState('');
  const [toCustId, setToCustId] = useState('');
  const [transferFee, setTransferFee] = useState(50000);

  const handleProcessCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;

    cancelBooking(selectedBookingId, cancellationFee, cancelReason);
    alert("Booking cancelled! Plot reset to AVAILABLE (Green). Refund voucher generated.");
    setSelectedBookingId('');
  };

  const handleProcessTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferPlotId || !fromCustId || !toCustId) return;

    transferPlot(transferPlotId, fromCustId, toCustId, transferFee);
    alert("Plot Ownership Transferred successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "প্লট ট্রান্সফার ও রিফান্ড ক্যান্সেলেশন" : "Plot Transfer & Refund Cancellation Workflows"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "প্লট হস্তান্তর, ক্যান্সেলেশন চার্জ কর্তন ও প্লটের স্থিতি রিকভারি" : "Transfer plot ownership or cancel bookings with automated cancellation charge deduction & accounting reversal."}
          </p>
        </div>

        <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
          <button onClick={() => setActiveSub('cancel')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activeSub === 'cancel' ? 'bg-tayeeba-600 text-white' : 'text-slate-400'}`}>
            Plot Cancellation
          </button>
          <button onClick={() => setActiveSub('transfer')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activeSub === 'transfer' ? 'bg-tayeeba-600 text-white' : 'text-slate-400'}`}>
            Plot Ownership Transfer
          </button>
        </div>
      </div>

      {activeSub === 'cancel' ? (
        <form onSubmit={handleProcessCancel} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg max-w-lg mx-auto space-y-4 text-xs">
          <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-2">
            Process Booking Cancellation & Refund
          </h3>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Select Active Booking *</label>
            <select required value={selectedBookingId} onChange={(e) => setSelectedBookingId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
              <option value="">-- Select Booking --</option>
              {bookings.filter(b => b.status === 'Active').map(b => (
                <option key={b.id} value={b.id}>{b.bookingNumber} ({b.customerName} - Plot {b.plotNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Cancellation Penalty Fee (BDT)</label>
            <input type="number" value={cancellationFee} onChange={(e) => setCancellationFee(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-rose-400" />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Reason for Cancellation</label>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white h-20" />
          </div>

          <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3 rounded-xl shadow transition">
            Confirm Cancellation & Reset Plot to Available
          </button>
        </form>
      ) : (
        <form onSubmit={handleProcessTransfer} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg max-w-lg mx-auto space-y-4 text-xs">
          <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-2">
            Process Plot Ownership Transfer
          </h3>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Select Booked Plot</label>
            <select required value={transferPlotId} onChange={(e) => setTransferPlotId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
              <option value="">-- Choose Plot --</option>
              {plots.filter(p => p.status === 'Booked').map(p => (
                <option key={p.id} value={p.id}>Plot {p.plotNumber} ({p.customerName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Transfer From (Old)</label>
              <select required value={fromCustId} onChange={(e) => setFromCustId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
                <option value="">-- Choose Old Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Transfer To (New)</label>
              <select required value={toCustId} onChange={(e) => setToCustId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
                <option value="">-- Choose New Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Plot Transfer Fee (BDT)</label>
            <input type="number" value={transferFee} onChange={(e) => setTransferFee(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-tayeeba-400" />
          </div>

          <button type="submit" className="w-full bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-extrabold py-3 rounded-xl shadow transition">
            Confirm Plot Transfer
          </button>
        </form>
      )}
    </div>
  );
};
