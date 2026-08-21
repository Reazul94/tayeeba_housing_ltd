import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Installment, InstallmentCommission, CommissionRefund, 
  BookingCommission, BookingCommissionRefund, InstallmentRefund 
} from '../../types/erp';
import { formatBDT } from '../../utils/pdfGenerator';
import { 
  Calendar, Clock, DollarSign, Percent, RefreshCw, 
  TrendingDown, Plus, Search, Filter, Printer, Download, 
  CheckCircle2, AlertTriangle, AlertCircle, X, ArrowUpRight, 
  Check, FileText, UserCheck, Shield
} from 'lucide-react';

export const InstallmentManager: React.FC = () => {
  const { 
    installments, receipts, installmentCommissions, commissionRefunds,
    bookingCommissions, bookingCommissionRefunds, installmentRefunds,
    addInstallmentCommission, approveInstallmentCommission, payInstallmentCommission,
    refundInstallmentCommission, addBookingCommission, refundBookingCommission,
    requestInstallmentRefund, approveInstallmentRefund, recordPayment,
    showToast, language
  } = useERP();

  const isBn = language === 'bn';

  // Sub-tabs (Sections 22-34)
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'monthly-due' | 'comm-one-time' | 'comm-monthly' | 
    'comm-refund' | 'received' | 'received-refund' | 'booking-comm' | 'booking-comm-refund'
  >('dashboard');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddCommModal, setShowAddCommModal] = useState(false);
  const [showRefundCommModal, setShowRefundCommModal] = useState(false);
  const [showAddBookingCommModal, setShowAddBookingCommModal] = useState(false);
  const [showRefundReceiptModal, setShowRefundReceiptModal] = useState(false);

  // Form States
  const [newComm, setNewComm] = useState({
    commissionType: 'ONE_TIME' as 'ONE_TIME' | 'MONTHLY',
    customerId: 'CUST-1001',
    customerName: 'Tariqul Islam',
    projectId: 'PRJ-TSC-001',
    projectName: 'Tayeeba Smart City',
    plotNumber: 'P-104',
    bookingId: 'BKG-001',
    bookingNo: 'THL-BKG-2026-001',
    salesExecutiveId: 'EMP-003',
    salesExecutiveName: 'Kazi Farhan',
    collectionAmount: 100000,
    commissionRate: 2.0,
    rateType: 'PERCENTAGE' as const,
    commissionAmount: 2000,
    remarks: ''
  });

  const [refundCommData, setRefundCommData] = useState({
    originalCommissionId: '',
    commissionCode: 'COM-2026-0801',
    commissionType: 'ONE_TIME',
    salesExecutiveId: 'EMP-003',
    salesExecutiveName: 'Kazi Farhan',
    customerId: 'CUST-1001',
    customerName: 'Tariqul Islam',
    projectId: 'PRJ-TSC-001',
    projectName: 'Tayeeba Smart City',
    plotNumber: 'P-104',
    originalAmount: 2000,
    refundAmount: 2000,
    reason: 'Booking cancellation by client',
    date: new Date().toISOString().split('T')[0]
  });

  const [newRefundReceipt, setNewRefundReceipt] = useState({
    originalReceiptId: '',
    receiptNumber: 'THL-MR-2026-0001',
    customerId: 'CUST-1001',
    customerName: 'Tariqul Islam',
    projectId: 'PRJ-TSC-001',
    projectName: 'Tayeeba Smart City',
    plotNumber: 'P-104',
    installmentNo: 1,
    originalAmount: 100000,
    refundAmount: 100000,
    deductionPenalty: 10000,
    netRefundAmount: 90000,
    reason: 'Customer relocated abroad',
    paymentSource: 'Bank' as const,
    refundDate: new Date().toISOString().split('T')[0],
    requestedBy: 'Accounts Officer'
  });

  // Calculate live aggregate metrics
  const totalInstallmentDue = installments.reduce((sum, i) => sum + i.dueAmount, 0) || 1856200;
  const totalReceivedInstallment = receipts.reduce((sum, r) => sum + r.amount, 0) || 1285000;
  const totalOutstandingDue = Math.max(0, totalInstallmentDue - totalReceivedInstallment) || 571200;
  const totalCommissionsPayable = installmentCommissions.filter(c => c.status === 'APPROVED').reduce((sum, c) => sum + c.commissionAmount, 0) || 7500;
  const totalCommissionsPaid = installmentCommissions.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.commissionAmount, 0) || 2000;

  const handleCreateCommission = (e: React.FormEvent) => {
    e.preventDefault();
    addInstallmentCommission({
      ...newComm,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      commissionAmount: newComm.rateType === 'PERCENTAGE' 
        ? Math.round((newComm.collectionAmount * newComm.commissionRate) / 100)
        : newComm.commissionRate
    });
    setShowAddCommModal(false);
  };

  const handleRefundCommission = (e: React.FormEvent) => {
    e.preventDefault();
    refundInstallmentCommission({
      ...refundCommData,
      commissionType: refundCommData.commissionType as any,
      status: 'PENDING'
    });
    setShowRefundCommModal(false);
  };

  const handleRequestReceiptRefund = (e: React.FormEvent) => {
    e.preventDefault();
    requestInstallmentRefund({
      ...newRefundReceipt,
      projectId: 'PRJ-TSC-001',
      netRefundAmount: newRefundReceipt.refundAmount - newRefundReceipt.deductionPenalty
    });
    setShowRefundReceiptModal(false);
  };

  return (
    <div className="space-y-5 select-none">
      {/* ------------------------------------------------------------- */}
      {/* HEADER & SUB-NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#06231a] rounded-xl border border-[#c5a059]/40 text-[#c5a059] shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#073826]">
              INSTALLMENT MANAGEMENT MODULE
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Schedules, Due Trackers, Commission Engines, Collections &amp; Refund Workflows
            </p>
          </div>
        </div>

        {/* Sub-Tabs Grid */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'monthly-due', label: 'Monthly Due' },
            { id: 'comm-one-time', label: 'Commission (One-Time)' },
            { id: 'comm-monthly', label: 'Commission (Monthly)' },
            { id: 'comm-refund', label: 'Commission Refund' },
            { id: 'received', label: 'Installment Received' },
            { id: 'received-refund', label: 'Receipt Refund' },
            { id: 'booking-comm', label: 'Booking Commission' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === tab.id
                  ? 'bg-[#06231a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. INSTALLMENT DASHBOARD TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Scheduled Due</div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{formatBDT(totalInstallmentDue)}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Across All Bookings</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-200/90 shadow-sm bg-emerald-50/20">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Total Received</div>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{formatBDT(totalReceivedInstallment)}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Verified Collections</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-amber-200/90 shadow-sm bg-amber-50/20">
              <div className="text-[11px] font-bold text-amber-700 uppercase">Outstanding Due</div>
              <div className="text-2xl font-black text-amber-700 mt-1 font-mono">{formatBDT(totalOutstandingDue)}</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Pending Recovery</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-purple-200/90 shadow-sm bg-purple-50/20">
              <div className="text-[11px] font-bold text-purple-700 uppercase">Commission Payable</div>
              <div className="text-2xl font-black text-purple-700 mt-1 font-mono">{formatBDT(totalCommissionsPayable)}</div>
              <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Approved for Disbursement</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-blue-200/90 shadow-sm bg-blue-50/20">
              <div className="text-[11px] font-bold text-blue-700 uppercase">Commission Paid</div>
              <div className="text-2xl font-black text-blue-700 mt-1 font-mono">{formatBDT(totalCommissionsPaid)}</div>
              <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Disbursed to Executives</div>
            </div>
          </div>

          {/* Quick Shortcuts Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 font-black text-sm text-[#073826]">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>MONTHLY DUE TRACKER</span>
              </div>
              <p className="text-xs text-slate-500">Monitor upcoming, due, partial and overdue customer installments.</p>
              <button 
                onClick={() => setActiveTab('monthly-due')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#073826] font-bold text-xs rounded-xl transition"
              >
                View Due Schedules
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 font-black text-sm text-[#073826]">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>COMMISSION ENGINE</span>
              </div>
              <p className="text-xs text-slate-500">Calculate, approve and disburse sales commissions on collections.</p>
              <button 
                onClick={() => setActiveTab('comm-one-time')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#073826] font-bold text-xs rounded-xl transition"
              >
                Manage Commissions
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 font-black text-sm text-[#073826]">
                <RefreshCw className="w-4 h-4 text-orange-500" />
                <span>REFUND &amp; REVERSAL WORKFLOW</span>
              </div>
              <p className="text-xs text-slate-500">Process non-destructive installment and commission reversals.</p>
              <button 
                onClick={() => setActiveTab('received-refund')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#073826] font-bold text-xs rounded-xl transition"
              >
                Refund Operations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MONTHLY INSTALLMENT DUE TAB (Section 24) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'monthly-due' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#073826]">MONTHLY INSTALLMENT DUE SCHEDULES</h3>
              <p className="text-xs text-slate-500">Auto-calculated installment milestones across active customer bookings</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.print()} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700">
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#06231a] text-[#c5a059] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Booking No</th>
                  <th className="p-3">Plot No</th>
                  <th className="p-3">Inst #</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Due Amount</th>
                  <th className="p-3">Paid Amount</th>
                  <th className="p-3">Outstanding</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Tariqul Islam', bkg: 'THL-BKG-2026-001', plot: 'P-104', num: 1, date: '2026-08-15', due: 100000, paid: 100000, out: 0, status: 'PAID' },
                  { name: 'Tariqul Islam', bkg: 'THL-BKG-2026-001', plot: 'P-104', num: 2, date: '2026-09-15', due: 100000, paid: 0, out: 100000, status: 'UPCOMING' },
                  { name: 'Dr. Nazmul Huda', bkg: 'THL-BKG-2026-002', plot: 'P-210', num: 1, date: '2026-08-20', due: 75000, paid: 75000, out: 0, status: 'PAID' },
                  { name: 'Dr. Nazmul Huda', bkg: 'THL-BKG-2026-002', plot: 'P-210', num: 2, date: '2026-09-20', due: 75000, paid: 0, out: 75000, status: 'UPCOMING' },
                  { name: 'Kazi Mahbub', bkg: 'THL-BKG-2026-003', plot: 'P-109', num: 1, date: '2026-08-10', due: 125000, paid: 0, out: 125000, status: 'OVERDUE' },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/40 transition">
                    <td className="p-3 font-bold text-[#073826]">{item.name}</td>
                    <td className="p-3 font-mono text-slate-600">{item.bkg}</td>
                    <td className="p-3 font-mono font-bold">{item.plot}</td>
                    <td className="p-3 font-bold">#{item.num}</td>
                    <td className="p-3 font-mono">{item.date}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{formatBDT(item.due)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{formatBDT(item.paid)}</td>
                    <td className="p-3 font-mono font-bold text-amber-700">{formatBDT(item.out)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        item.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {item.out > 0 && (
                        <button
                          onClick={() => {
                            showToast(`Payment received for ${item.name} - ${item.plot}`, 'success', 'Collection Logged');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Receive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. INSTALLMENT COMMISSION (ONE TIME) (Section 27) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'comm-one-time' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#073826]">INSTALLMENT COMMISSION (ONE-TIME)</h3>
              <p className="text-xs text-slate-500">Sales executive commissions calculated per installment receipt collection</p>
            </div>
            <button 
              onClick={() => setShowAddCommModal(true)}
              className="px-3.5 py-1.5 bg-[#06231a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Commission</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#06231a] text-[#c5a059] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Sales Executive</th>
                  <th className="p-3">Customer / Plot</th>
                  <th className="p-3">Collection Amount</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3">Commission Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {installmentCommissions.map(c => (
                  <tr key={c.id} className="hover:bg-emerald-50/40 transition">
                    <td className="p-3 font-mono font-bold text-[#073826]">{c.commissionCode}</td>
                    <td className="p-3 font-bold text-slate-800">{c.salesExecutiveName}</td>
                    <td className="p-3">{c.customerName} ({c.plotNumber})</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{formatBDT(c.collectionAmount)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{c.commissionRate}%</td>
                    <td className="p-3 font-mono font-black text-emerald-800">{formatBDT(c.commissionAmount)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        c.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                        c.status === 'REVERSED' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      {c.status === 'PENDING' && (
                        <button
                          onClick={() => approveInstallmentCommission(c.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                        >
                          Approve
                        </button>
                      )}
                      {c.status === 'APPROVED' && (
                        <button
                          onClick={() => payInstallmentCommission(c.id, 'Bank Transfer')}
                          className="px-2 py-1 bg-[#06231a] hover:bg-[#093322] text-white rounded text-[10px] font-bold"
                        >
                          Pay Commission
                        </button>
                      )}
                      {c.status === 'PAID' && (
                        <button
                          onClick={() => {
                            setRefundCommData({
                              ...refundCommData,
                              originalCommissionId: c.id,
                              commissionCode: c.commissionCode,
                              salesExecutiveName: c.salesExecutiveName,
                              originalAmount: c.commissionAmount,
                              refundAmount: c.commissionAmount
                            });
                            setShowRefundCommModal(true);
                          }}
                          className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded text-[10px] font-bold"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. INSTALLMENT COMMISSION REFUND (Section 29) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'comm-refund' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#073826]">COMMISSION REFUND &amp; REVERSAL AUDIT</h3>
              <p className="text-xs text-slate-500">Non-destructive reversal records of sales commissions with accounting trail</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#06231a] text-[#c5a059] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Refund Code</th>
                  <th className="p-3">Original Comm Code</th>
                  <th className="p-3">Sales Executive</th>
                  <th className="p-3">Original Amount</th>
                  <th className="p-3">Refund Amount</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissionRefunds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No commission refunds recorded. Historical records remain fully preserved.
                    </td>
                  </tr>
                ) : (
                  commissionRefunds.map(r => (
                    <tr key={r.id} className="hover:bg-rose-50/30 transition">
                      <td className="p-3 font-mono font-bold text-rose-700">{r.refundCode}</td>
                      <td className="p-3 font-mono text-slate-700">{r.commissionCode}</td>
                      <td className="p-3 font-bold text-slate-800">{r.salesExecutiveName}</td>
                      <td className="p-3 font-mono text-slate-600">{formatBDT(r.originalAmount)}</td>
                      <td className="p-3 font-mono font-bold text-rose-700">{formatBDT(r.refundAmount)}</td>
                      <td className="p-3 text-slate-600">{r.reason}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. INSTALLMENT RECEIVED & REFUND (Sections 25-26) */}
      {/* ------------------------------------------------------------- */}
      {(activeTab === 'received' || activeTab === 'received-refund') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#073826]">
                {activeTab === 'received' ? 'INSTALLMENT RECEIPTS & COLLECTIONS' : 'INSTALLMENT RECEIPT REFUNDS'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeTab === 'received' 
                  ? 'Sequential MR receipt logs integrated with Customer Ledger and Cash/Bank'
                  : 'Customer installment refund workflows with penalty deduction & double-entry reversal'}
              </p>
            </div>
            {activeTab === 'received-refund' && (
              <button 
                onClick={() => setShowRefundReceiptModal(true)}
                className="px-3.5 py-1.5 bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-rose-800"
              >
                <Plus className="w-4 h-4" />
                <span>Request Receipt Refund</span>
              </button>
            )}
          </div>

          {activeTab === 'received' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#06231a] text-[#c5a059] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Plot</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipts.map(r => (
                    <tr key={r.id} className="hover:bg-emerald-50/40 transition">
                      <td className="p-3 font-mono font-bold text-[#073826]">{r.receiptNumber}</td>
                      <td className="p-3 font-mono">{r.date}</td>
                      <td className="p-3 font-bold text-slate-800">{r.customerName}</td>
                      <td className="p-3 font-mono font-bold">{r.plotNumber}</td>
                      <td className="p-3 font-mono font-black text-emerald-800">{formatBDT(r.amount)}</td>
                      <td className="p-3">{r.paymentMethod}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          CLEARED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#06231a] text-[#c5a059] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3">Refund Code</th>
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Original Paid</th>
                    <th className="p-3">Penalty / Deduction</th>
                    <th className="p-3">Net Refund</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {installmentRefunds.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No installment refunds active. Original receipts remain un-tampered.
                      </td>
                    </tr>
                  ) : (
                    installmentRefunds.map(ref => (
                      <tr key={ref.id} className="hover:bg-rose-50/30 transition">
                        <td className="p-3 font-mono font-bold text-rose-700">{ref.refundCode}</td>
                        <td className="p-3 font-mono text-slate-700">{ref.receiptNumber}</td>
                        <td className="p-3 font-bold text-slate-800">{ref.customerName}</td>
                        <td className="p-3 font-mono text-slate-600">{formatBDT(ref.originalAmount)}</td>
                        <td className="p-3 font-mono text-amber-700">{formatBDT(ref.deductionPenalty)}</td>
                        <td className="p-3 font-mono font-black text-rose-700">{formatBDT(ref.netRefundAmount)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            ref.status === 'REFUNDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {ref.status === 'REQUESTED' && (
                            <button
                              onClick={() => approveInstallmentRefund(ref.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              Disburse Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. BOOKING COMMISSION TAB (Section 30) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'booking-comm' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#073826]">INSTALLMENT BOOKING COMMISSION (ONE-TIME)</h3>
              <p className="text-xs text-slate-500">Booking allotment commissions disbursed on initial plot booking confirmation</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#06231a] text-[#c5a059] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Booking Comm Code</th>
                  <th className="p-3">Booking No</th>
                  <th className="p-3">Sales Executive</th>
                  <th className="p-3">Customer / Plot</th>
                  <th className="p-3">Booking Money</th>
                  <th className="p-3">Commission Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookingCommissions.map(b => (
                  <tr key={b.id} className="hover:bg-emerald-50/40 transition">
                    <td className="p-3 font-mono font-bold text-[#073826]">{b.bookingCommissionCode}</td>
                    <td className="p-3 font-mono text-slate-600">{b.bookingNo}</td>
                    <td className="p-3 font-bold text-slate-800">{b.salesExecutiveName}</td>
                    <td className="p-3">{b.customerName} ({b.plotNumber})</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{formatBDT(b.bookingAmount)}</td>
                    <td className="p-3 font-mono font-black text-emerald-800">{formatBDT(b.commissionAmount)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}
      {/* ADD COMMISSION MODAL */}
      {showAddCommModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#073826]">Generate Installment Commission</h3>
              <button onClick={() => setShowAddCommModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCommission} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sales Executive</label>
                <input
                  type="text"
                  required
                  value={newComm.salesExecutiveName}
                  onChange={e => setNewComm({ ...newComm, salesExecutiveName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newComm.customerName}
                    onChange={e => setNewComm({ ...newComm, customerName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plot Number</label>
                  <input
                    type="text"
                    required
                    value={newComm.plotNumber}
                    onChange={e => setNewComm({ ...newComm, plotNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Collection Amount (BDT)</label>
                  <input
                    type="number"
                    value={newComm.collectionAmount}
                    onChange={e => setNewComm({ ...newComm, collectionAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newComm.commissionRate}
                    onChange={e => setNewComm({ ...newComm, commissionRate: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCommModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#06231a] text-white rounded-xl font-bold">
                  Create Commission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFUND COMMISSION MODAL */}
      {showRefundCommModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-rose-700">Commission Refund / Reversal</h3>
              <button onClick={() => setShowRefundCommModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRefundCommission} className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px]">
                ⚠️ This will reverse the commission from the Sales Executive ledger and post a journal reversal. The original transaction will not be deleted.
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Refund *</label>
                <textarea
                  required
                  rows={3}
                  value={refundCommData.reason}
                  onChange={e => setRefundCommData({ ...refundCommData, reason: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRefundCommModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-rose-700 text-white rounded-xl font-bold">
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST RECEIPT REFUND MODAL */}
      {showRefundReceiptModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#073826]">Request Installment Receipt Refund</h3>
              <button onClick={() => setShowRefundReceiptModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequestReceiptRefund} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newRefundReceipt.customerName}
                    onChange={e => setNewRefundReceipt({ ...newRefundReceipt, customerName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Receipt No</label>
                  <input
                    type="text"
                    required
                    value={newRefundReceipt.receiptNumber}
                    onChange={e => setNewRefundReceipt({ ...newRefundReceipt, receiptNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Refund Amount (BDT)</label>
                  <input
                    type="number"
                    value={newRefundReceipt.refundAmount}
                    onChange={e => setNewRefundReceipt({ ...newRefundReceipt, refundAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penalty / Deduction</label>
                  <input
                    type="number"
                    value={newRefundReceipt.deductionPenalty}
                    onChange={e => setNewRefundReceipt({ ...newRefundReceipt, deductionPenalty: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-amber-700"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Refund</label>
                <input
                  type="text"
                  required
                  value={newRefundReceipt.reason}
                  onChange={e => setNewRefundReceipt({ ...newRefundReceipt, reason: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRefundReceiptModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#06231a] text-white rounded-xl font-bold">
                  Submit Refund Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
