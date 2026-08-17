import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { PaymentReceipt } from '../../types/erp';
import { formatBDT, generateMoneyReceiptPDF } from '../../utils/pdfGenerator';
import { CreditCard, Plus, Download, Printer, Search, CheckCircle } from 'lucide-react';

export const CollectionManager: React.FC = () => {
  const { customers, projects, receipts, recordPayment, language, showToast } = useERP();

  const isBn = language === 'bn';

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentType, setPaymentType] = useState<'Booking Money' | 'Down Payment' | 'Installment' | 'Registration Fee' | 'Other'>('Installment');
  const [paymentAmount, setPaymentAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'bKash'>('Bank Transfer');
  const [bankName, setBankName] = useState('Dutch-Bangla Bank Ltd.');
  const [chequeOrTxnNo, setChequeOrTxnNo] = useState('');

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || paymentAmount <= 0) {
      showToast("Select customer and enter valid payment amount.", "warning", "Validation Error");
      return;
    }

    if (!activeCustomer || !activeCustomer.linkedPlotId) {
      showToast("Selected customer does not have a linked plot.", "warning", "Missing Linked Plot");
      return;
    }

    const createdReceipt = recordPayment({
      customerId: activeCustomer.id,
      projectId: activeCustomer.linkedProjectId || projects[0]?.id || '',
      plotId: activeCustomer.linkedPlotId,
      paymentType: paymentType,
      amount: paymentAmount,
      paymentMethod: paymentMethod,
      bankName: bankName,
      chequeOrTxnNo: chequeOrTxnNo || 'TXN-998811',
      remarks: `${paymentType} payment received.`
    });

    showToast(`Receipt ${createdReceipt.receiptNumber} generated successfully!`, 'success', 'Payment Recorded');
    generateMoneyReceiptPDF(createdReceipt);
    setShowAddPaymentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "কালেকশন ও মানি রসিদ (Money Receipts)" : "Collections & Money Receipts Management"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "কাস্টমার পেমেন্ট ভাউচার, রসিদ জেনারেটর ও ডাবল এন্ট্রি একাউন্টিং সিঙ্ক" : "Record payments, issue unique receipts & sync with Double-Entry Cash/Bank ledgers."}
          </p>
        </div>

        <button
          onClick={() => setShowAddPaymentModal(true)}
          className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Payment & Receipt</span>
        </button>
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
              <th className="p-3">Receipt No</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Project & Plot</th>
              <th className="p-3">Payment Type</th>
              <th className="p-3">Method</th>
              <th className="p-3 text-right">Amount (BDT)</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {receipts.map(r => (
              <tr key={r.id} className="hover:bg-slate-700/40 text-slate-200">
                <td className="p-3 font-mono font-bold text-tayeeba-400">{r.receiptNumber}</td>
                <td className="p-3 text-slate-400">{r.date}</td>
                <td className="p-3 font-semibold text-white">{r.customerName}</td>
                <td className="p-3">{r.projectName} (Plot {r.plotNumber})</td>
                <td className="p-3 font-bold text-emerald-400">{r.paymentType}</td>
                <td className="p-3">{r.paymentMethod}</td>
                <td className="p-3 text-right font-extrabold text-white">{formatBDT(r.amount)}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => generateMoneyReceiptPDF(r)}
                    className="bg-slate-700 hover:bg-slate-600 text-tayeeba-300 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ml-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Receipt</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-2">Record Collection Payment</h3>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Customer *</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Plot: {c.linkedPlotNumber || 'N/A'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Payment Type</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Installment">Installment Payment</option>
                  <option value="Down Payment">Down Payment</option>
                  <option value="Booking Money">Booking Money</option>
                  <option value="Development Charge">Development Charge</option>
                  <option value="Transfer Fee">Transfer Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Payment Amount (BDT) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Cash">Cash in Hand</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddPaymentModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-tayeeba-600 text-white font-bold px-4 py-2 rounded-xl">Post Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
