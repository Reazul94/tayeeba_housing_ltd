import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { CashBookTransaction, SalarySheet, DirectorHonorarium } from '../../types/erp';
import { 
  Calculator, Landmark, FileText, CheckCircle2, 
  Plus, AlertCircle, TrendingUp, TrendingDown, BookOpen,
  DollarSign, Calendar, Filter, Download, Printer, Search,
  Users, Award, ArrowUpRight, ArrowDownLeft, Wallet, ShieldCheck,
  Building, ChevronRight, CheckCircle, Clock, X, Sparkles
} from 'lucide-react';

export const AccountsManager: React.FC = () => {
  const { 
    accounts, journalEntries, receipts, expenses, landParcels, vendors, employees,
    cashBookTransactions, addCashTransaction, approveCashTransaction,
    salarySheets, createSalarySheet, updateSalarySheetStatus,
    directorHonorariums, addDirectorHonorarium, updateDirectorHonorariumStatus,
    projects, language, currentUser, showToast, showConfirm 
  } = useERP();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cashbook' | 'monthly-receipts' | 'monthly-payments' | 'statement' | 'salary'>('dashboard');
  const [salarySubTab, setSalarySubTab] = useState<'staff' | 'director'>('staff');

  // Filters
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // '2026-08'
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cash Book Modal
  const [showCashModal, setShowCashModal] = useState(false);
  const [txType, setTxType] = useState<'RECEIPT' | 'PAYMENT'>('RECEIPT');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txParticulars, setTxParticulars] = useState('');
  const [txAccountHead, setTxAccountHead] = useState('Customer Booking Collection');
  const [txCategory, setTxCategory] = useState('Customer Collection');
  const [txPartyName, setTxPartyName] = useState('');
  const [txReference, setTxReference] = useState('');
  const [txMethod, setTxMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [txAmount, setTxAmount] = useState<number>(50000);
  const [txProjectId, setTxProjectId] = useState('');

  // Salary Modal State
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryMonth, setSalaryMonth] = useState(new Date().toISOString().slice(0, 7));

  // Director Honorarium Modal State
  const [showHonModal, setShowHonModal] = useState(false);
  const [honDirectorName, setHonDirectorName] = useState('Al-Haj Engr. Tayeebur Rahman');
  const [honDesignation, setHonDesignation] = useState('Chairman & Managing Director');
  const [honAmount, setHonAmount] = useState<number>(100000);
  const [honTax, setHonTax] = useState<number>(10000);
  const [honMeetingCount, setHonMeetingCount] = useState<number>(2);
  const [honRemarks, setHonRemarks] = useState('Board meeting honorarium and conveyance allowance');

  // Dynamic Financial KPI Calculations from Transactions
  const todayStr = new Date().toISOString().split('T')[0];
  const curMonthStr = new Date().toISOString().slice(0, 7);

  // Receipts
  const allReceiptsTotal = receipts.reduce((sum, r) => sum + r.amount, 0) + 
    cashBookTransactions.filter(t => t.transactionType === 'RECEIPT' && t.approvalStatus === 'APPROVED').reduce((sum, t) => sum + t.debitAmount, 0);

  const todayReceipts = receipts.filter(r => r.date === todayStr).reduce((sum, r) => sum + r.amount, 0) +
    cashBookTransactions.filter(t => t.date === todayStr && t.transactionType === 'RECEIPT' && t.approvalStatus === 'APPROVED').reduce((sum, t) => sum + t.debitAmount, 0);

  const monthReceipts = receipts.filter(r => r.date.startsWith(curMonthStr)).reduce((sum, r) => sum + r.amount, 0) +
    cashBookTransactions.filter(t => t.date.startsWith(curMonthStr) && t.transactionType === 'RECEIPT' && t.approvalStatus === 'APPROVED').reduce((sum, t) => sum + t.debitAmount, 0);

  // Payments
  const allExpensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0) +
    cashBookTransactions.filter(t => t.transactionType === 'PAYMENT' && t.approvalStatus === 'APPROVED').reduce((sum, t) => sum + t.creditAmount, 0);

  const todayPayments = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0) +
    cashBookTransactions.filter(t => t.date === todayStr && t.transactionType === 'PAYMENT' && t.approvalStatus === 'APPROVED').reduce((sum, t) => sum + t.creditAmount, 0);

  const monthPayments = expenses.filter(e => e.date.startsWith(curMonthStr)).reduce((sum, e) => sum + e.amount, 0) +
    cashBookTransactions.filter(t => t.date.startsWith(curMonthStr) && t.transactionType === 'PAYMENT' && t.approvalStatus === 'APPROVED').reduce((sum, t) => sum + t.creditAmount, 0);

  // Net Cash Calculations
  const todayNetCash = todayReceipts - todayPayments;
  const monthNetCash = monthReceipts - monthPayments;
  const currentCashBalance = allReceiptsTotal - allExpensesTotal;

  // Salary KPIs
  const currentMonthSalaries = salarySheets.filter(s => s.month === curMonthStr);
  const pendingSalaryTotal = currentMonthSalaries.filter(s => s.approvalStatus !== 'PAID').reduce((sum, s) => sum + s.totalNetPayable, 0);
  const paidSalaryTotal = currentMonthSalaries.filter(s => s.approvalStatus === 'PAID').reduce((sum, s) => sum + s.totalPaidAmount, 0);

  // Submit Cash Transaction
  const handleSaveCashTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txParticulars || txAmount <= 0) {
      showToast('Please enter particulars and amount > 0', 'warning', 'Validation');
      return;
    }

    const prj = projects.find(p => p.id === txProjectId);
    addCashTransaction({
      transactionType: txType,
      date: txDate,
      particulars: txParticulars,
      accountHead: txAccountHead,
      category: txCategory,
      partyName: txPartyName || undefined,
      referenceNo: txReference || undefined,
      paymentMethod: txMethod,
      debitAmount: txType === 'RECEIPT' ? txAmount : 0,
      creditAmount: txType === 'PAYMENT' ? txAmount : 0,
      projectId: txProjectId || undefined,
      projectName: prj?.name || undefined,
      preparedBy: currentUser.name,
      approvalStatus: 'APPROVED'
    });

    setShowCashModal(false);
    setTxParticulars('');
    setTxAmount(50000);
    setTxPartyName('');
    setTxReference('');
  };

  // Generate Salary Sheet
  const handleGenerateSalarySheet = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = salarySheets.find(s => s.month === salaryMonth);
    if (existing) {
      showToast(`Salary sheet for ${salaryMonth} already exists!`, 'warning', 'Duplicate');
      return;
    }

    const activeEmployees = employees.filter(emp => emp.status === 'Active');
    const grossTotal = activeEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0);
    const netTotal = grossTotal; // base calculation

    createSalarySheet({
      month: salaryMonth,
      year: parseInt(salaryMonth.split('-')[0]),
      totalStaffCount: activeEmployees.length,
      totalGrossSalary: grossTotal,
      totalDeductions: 0,
      totalNetPayable: netTotal,
      totalPaidAmount: 0,
      approvalStatus: 'PREPARED',
      preparedBy: currentUser.name
    });

    setShowSalaryModal(false);
  };

  // Record Director Honorarium
  const handleSaveHonorarium = (e: React.FormEvent) => {
    e.preventDefault();
    if (honAmount <= 0) return;

    addDirectorHonorarium({
      directorName: honDirectorName,
      directorDesignation: honDesignation,
      month: filterMonth,
      year: parseInt(filterMonth.split('-')[0]),
      meetingCount: honMeetingCount,
      honorariumAmount: honAmount,
      taxDeduction: honTax,
      netAmount: Math.max(0, honAmount - honTax),
      approvalStatus: 'APPROVED',
      remarks: honRemarks
    });

    setShowHonModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {isBn ? "একাউন্টস ও ক্যাশ বুক ম্যানেজমেন্ট" : "Accounts & Cash Operations"}
              </h1>
              <p className="text-xs text-slate-400">
                {isBn ? "দৈনিক ক্যাশ বুক, মাসিক রসিদ/খরচ, আর্থিক স্টেটমেন্ট এবং স্যালারি শিট" : "Daily Cash Book, Monthly Inflows/Outflows, Financial Statements & Payroll"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setTxType('RECEIPT'); setShowCashModal(true); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            {isBn ? "+ ক্যাশ রসিদ এন্ট্রি" : "+ Cash Receipt"}
          </button>
          <button
            onClick={() => { setTxType('PAYMENT'); setShowCashModal(true); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/30 transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            {isBn ? "- ক্যাশ পেমেন্ট ভাউচার" : "- Cash Payment"}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'dashboard', label: isBn ? "একাউন্টস ড্যাশবোর্ড" : "Accounts Dashboard", icon: LayoutGridIcon },
          { id: 'cashbook', label: isBn ? "ক্যাশ বুক (Cash Book)" : "Cash Book", icon: BookOpen },
          { id: 'monthly-receipts', label: isBn ? "মাসিক রসিদ ও আয়" : "Monthly Receipts / Income", icon: TrendingUp },
          { id: 'monthly-payments', label: isBn ? "মাসিক খরচ ও পেমেন্ট" : "Monthly Payments / Expenses", icon: TrendingDown },
          { id: 'statement', label: isBn ? "মাসিক স্টেটমেন্ট" : "Monthly Statement", icon: FileText },
          { id: 'salary', label: isBn ? "স্যালারি ও সম্মানী শিট" : "Salary & Honorarium", icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ACCOUNTS DASHBOARD VIEW (Section 129) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Cash Position */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Cash Balance</span>
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Wallet className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-white mt-3">{formatBDT(currentCashBalance)}</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Synchronized from double-entry ledger</span>
              </div>
            </div>

            {/* Today's Net Movement */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Net Cash</span>
                <span className={`p-2 rounded-lg ${todayNetCash >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {todayNetCash >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                </span>
              </div>
              <div className={`text-2xl font-black mt-3 ${todayNetCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBDT(todayNetCash)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
                <span>In: {formatBDT(todayReceipts)}</span>
                <span>Out: {formatBDT(todayPayments)}</span>
              </div>
            </div>

            {/* Current Month Net Movement */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Month Net Balance</span>
                <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><TrendingUp className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-cyan-400 mt-3">{formatBDT(monthNetCash)}</div>
              <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
                <span>Recv: {formatBDT(monthReceipts)}</span>
                <span>Paid: {formatBDT(monthPayments)}</span>
              </div>
            </div>

            {/* Salary Status */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Salary Disbursement</span>
                <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Users className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-white mt-3">{formatBDT(pendingSalaryTotal + paidSalaryTotal)}</div>
              <div className="text-[11px] text-amber-400 mt-2 flex justify-between font-medium">
                <span>Paid: {formatBDT(paidSalaryTotal)}</span>
                <span>Pending: {formatBDT(pendingSalaryTotal)}</span>
              </div>
            </div>
          </div>

          {/* Quick Access Matrix Cards (Section 129) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setActiveTab('cashbook')}
              className="bg-gradient-to-br from-slate-900 to-slate-800/80 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Daily Cash Book</h3>
                    <p className="text-xs text-slate-400">View daily receipts, payments & running cash balance</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('statement')}
              className="bg-gradient-to-br from-slate-900 to-slate-800/80 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Monthly Statement</h3>
                    <p className="text-xs text-slate-400">Comprehensive cash flow & expense breakdowns</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('salary')}
              className="bg-gradient-to-br from-slate-900 to-slate-800/80 p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Salary & Honorarium</h3>
                    <p className="text-xs text-slate-400">Staff salary sheet and Directors' honorarium approvals</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* Recent Cash Flow Feed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Recent Cash Movements
              </h3>
              <button onClick={() => setActiveTab('cashbook')} className="text-xs text-emerald-400 hover:underline">
                View Full Cash Book →
              </button>
            </div>
            {cashBookTransactions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No recent cash book entries recorded. Click <strong>+ Cash Receipt</strong> or <strong>- Cash Payment</strong> above to add entries.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {cashBookTransactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-lg text-xs font-bold ${tx.transactionType === 'RECEIPT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {tx.transactionType === 'RECEIPT' ? '+' : '-'}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{tx.particulars}</div>
                        <div className="text-[11px] text-slate-400">{tx.voucherNo} • {tx.accountHead} • {tx.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${tx.transactionType === 'RECEIPT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatBDT(tx.transactionType === 'RECEIPT' ? tx.debitAmount : tx.creditAmount)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Bal: {formatBDT(tx.runningBalance)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CASH BOOK VIEW (Sections 130-133) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cashbook' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search particulars, voucher, party..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Movements</option>
                <option value="RECEIPT">Daily Receipts Only</option>
                <option value="PAYMENT">Daily Payments Only</option>
              </select>

              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
              </input>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Cash Book
              </button>
            </div>
          </div>

          {/* Cash Book Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Particulars / Details</th>
                    <th className="py-3 px-4">Account Head</th>
                    <th className="py-3 px-4">Party / Project</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right text-emerald-400">Receipt (DR)</th>
                    <th className="py-3 px-4 text-right text-rose-400">Payment (CR)</th>
                    <th className="py-3 px-4 text-right text-white">Running Balance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cashBookTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500">
                        No cash book transactions found for this period.
                      </td>
                    </tr>
                  ) : (
                    cashBookTransactions
                      .filter(tx => filterType === 'ALL' || tx.transactionType === filterType)
                      .filter(tx => !filterMonth || tx.date.startsWith(filterMonth))
                      .filter(tx => !searchQuery || tx.particulars.toLowerCase().includes(searchQuery.toLowerCase()) || tx.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{tx.date}</td>
                          <td className="py-3 px-4 font-mono font-bold text-white">{tx.voucherNo}</td>
                          <td className="py-3 px-4 font-medium text-slate-200">
                            {tx.particulars}
                            {tx.referenceNo && <span className="block text-[10px] text-slate-500">Ref: {tx.referenceNo}</span>}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{tx.accountHead}</td>
                          <td className="py-3 px-4">
                            <span className="text-slate-300 font-medium">{tx.partyName || '—'}</span>
                            {tx.projectName && <span className="block text-[10px] text-emerald-400">{tx.projectName}</span>}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{tx.paymentMethod}</td>
                          <td className="py-3 px-4 text-right font-bold font-mono text-emerald-400">
                            {tx.debitAmount > 0 ? formatBDT(tx.debitAmount) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold font-mono text-rose-400">
                            {tx.creditAmount > 0 ? formatBDT(tx.creditAmount) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-black font-mono text-white">
                            {formatBDT(tx.runningBalance)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {tx.approvalStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MONTHLY RECEIPTS / INCOME VIEW (Section 134) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'monthly-receipts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-bold">Select Month:</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="text-xs text-emerald-400 font-bold">
              Total Inflow for Period: {formatBDT(monthReceipts)}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Receipt Date</th>
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Customer / Party</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Income Head</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right text-emerald-400">Amount</th>
                  <th className="py-3 px-4">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {receipts
                  .filter(r => !filterMonth || r.date.startsWith(filterMonth))
                  .map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{r.date}</td>
                      <td className="py-3 px-4 font-bold font-mono text-white">{r.receiptNumber}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{r.customerName}</td>
                      <td className="py-3 px-4 text-emerald-400">{r.projectName}</td>
                      <td className="py-3 px-4 text-slate-400">{r.paymentType}</td>
                      <td className="py-3 px-4 text-slate-400">{r.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatBDT(r.amount)}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{r.chequeOrTxnNo || '—'}</td>
                    </tr>
                  ))}
                {cashBookTransactions
                  .filter(t => t.transactionType === 'RECEIPT' && (!filterMonth || t.date.startsWith(filterMonth)))
                  .map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{t.date}</td>
                      <td className="py-3 px-4 font-bold font-mono text-white">{t.voucherNo}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{t.partyName || t.particulars}</td>
                      <td className="py-3 px-4 text-emerald-400">{t.projectName || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{t.accountHead}</td>
                      <td className="py-3 px-4 text-slate-400">{t.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatBDT(t.debitAmount)}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{t.referenceNo || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MONTHLY PAYMENTS / EXPENSES VIEW (Section 135) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'monthly-payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-bold">Select Month:</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="text-xs text-rose-400 font-bold">
              Total Outflow for Period: {formatBDT(monthPayments)}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Voucher No</th>
                  <th className="py-3 px-4">Payee / Particulars</th>
                  <th className="py-3 px-4">Expense Head</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right text-rose-400">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses
                  .filter(e => !filterMonth || e.date.startsWith(filterMonth))
                  .map(e => (
                    <tr key={e.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{e.date}</td>
                      <td className="py-3 px-4 font-bold font-mono text-white">{e.expenseId}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{e.description}</td>
                      <td className="py-3 px-4 text-slate-400">{e.category}</td>
                      <td className="py-3 px-4 text-cyan-400">{e.projectName || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{e.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-bold text-rose-400">{formatBDT(e.amount)}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Approved</span></td>
                    </tr>
                  ))}
                {cashBookTransactions
                  .filter(t => t.transactionType === 'PAYMENT' && (!filterMonth || t.date.startsWith(filterMonth)))
                  .map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{t.date}</td>
                      <td className="py-3 px-4 font-bold font-mono text-white">{t.voucherNo}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{t.particulars}</td>
                      <td className="py-3 px-4 text-slate-400">{t.accountHead}</td>
                      <td className="py-3 px-4 text-cyan-400">{t.projectName || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{t.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-bold text-rose-400">{formatBDT(t.creditAmount)}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">{t.approvalStatus}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MONTHLY STATEMENT VIEW (Section 136) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'statement' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Monthly Statement of Cash Movements</h2>
                <p className="text-xs text-slate-400">Statement for Month: {filterMonth}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print Statement
                </button>
              </div>
            </div>

            {/* Statement Summary Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Inflows */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" /> Cash Receipts & Incomes
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Customer Plot Collections</span>
                    <span className="font-bold text-white">{formatBDT(receipts.reduce((sum, r) => sum + r.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Direct Cash Receipts</span>
                    <span className="font-bold text-white">{formatBDT(cashBookTransactions.filter(t => t.transactionType === 'RECEIPT').reduce((sum, t) => sum + t.debitAmount, 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-emerald-400 pt-2">
                    <span>Total Cash Receipts</span>
                    <span>{formatBDT(monthReceipts)}</span>
                  </div>
                </div>
              </div>

              {/* Outflows */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4" /> Cash Payments & Expenses
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">General Administrative Expenses</span>
                    <span className="font-bold text-white">{formatBDT(expenses.reduce((sum, e) => sum + e.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Cash Payment Vouchers</span>
                    <span className="font-bold text-white">{formatBDT(cashBookTransactions.filter(t => t.transactionType === 'PAYMENT').reduce((sum, t) => sum + t.creditAmount, 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-rose-400 pt-2">
                    <span>Total Cash Outflows</span>
                    <span>{formatBDT(monthPayments)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Movement Bar */}
            <div className="mt-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Net Cash Flow for Selected Month:</span>
              <span className={`text-lg font-black ${monthNetCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBDT(monthNetCash)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. SALARY & DIRECTORS' HONORARIUM VIEW (Sections 137-140) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'salary' && (
        <div className="space-y-6">
          {/* Salary Type Switcher */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSalarySubTab('staff')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  salarySubTab === 'staff'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1. Staff Salary Sheet
              </button>
              <button
                onClick={() => setSalarySubTab('director')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  salarySubTab === 'director'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                2. Directors' Honorarium
              </button>
            </div>

            {salarySubTab === 'staff' ? (
              <button
                onClick={() => setShowSalaryModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
              >
                <Plus className="w-4 h-4" /> + Generate Salary Sheet
              </button>
            ) : (
              <button
                onClick={() => setShowHonModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
              >
                <Plus className="w-4 h-4" /> + Record Director Honorarium
              </button>
            )}
          </div>

          {/* STAFF SALARY SUBTAB */}
          {salarySubTab === 'staff' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Sheet Code</th>
                      <th className="py-3 px-4">Month</th>
                      <th className="py-3 px-4">Employees</th>
                      <th className="py-3 px-4 text-right">Gross Salary</th>
                      <th className="py-3 px-4 text-right text-emerald-400">Net Payable</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Workflow Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {salarySheets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500">
                          No salary sheets generated yet. Click <strong>+ Generate Salary Sheet</strong> to prepare this month's payroll.
                        </td>
                      </tr>
                    ) : (
                      salarySheets.map(sheet => (
                        <tr key={sheet.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-white">{sheet.sheetCode}</td>
                          <td className="py-3 px-4 font-medium text-slate-300">{sheet.month}</td>
                          <td className="py-3 px-4">{sheet.totalStaffCount} Staff</td>
                          <td className="py-3 px-4 text-right font-mono">{formatBDT(sheet.totalGrossSalary)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">{formatBDT(sheet.totalNetPayable)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sheet.approvalStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                              sheet.approvalStatus === 'APPROVED' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              {sheet.approvalStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {sheet.approvalStatus === 'PREPARED' && (
                              <button
                                onClick={() => updateSalarySheetStatus(sheet.id, 'APPROVED')}
                                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
                              >
                                Approve Sheet
                              </button>
                            )}
                            {sheet.approvalStatus === 'APPROVED' && (
                              <button
                                onClick={() => updateSalarySheetStatus(sheet.id, 'PAID')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                              >
                                Disburse / Pay
                              </button>
                            )}
                            {sheet.approvalStatus === 'PAID' && (
                              <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Disbursed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DIRECTORS' HONORARIUM SUBTAB */}
          {salarySubTab === 'director' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-purple-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Director Name</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Month</th>
                      <th className="py-3 px-4">Meetings</th>
                      <th className="py-3 px-4 text-right">Honorarium</th>
                      <th className="py-3 px-4 text-right text-rose-400">Tax Deduct</th>
                      <th className="py-3 px-4 text-right text-purple-400 font-bold">Net Payable</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {directorHonorariums.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-500">
                          No Director Honorariums recorded. Click <strong>+ Record Director Honorarium</strong> to add.
                        </td>
                      </tr>
                    ) : (
                      directorHonorariums.map(hon => (
                        <tr key={hon.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-white">{hon.honorariumCode}</td>
                          <td className="py-3 px-4 font-bold text-white">{hon.directorName}</td>
                          <td className="py-3 px-4 text-slate-400">{hon.directorDesignation}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{hon.month}</td>
                          <td className="py-3 px-4">{hon.meetingCount} meetings</td>
                          <td className="py-3 px-4 text-right font-mono">{formatBDT(hon.honorariumAmount)}</td>
                          <td className="py-3 px-4 text-right font-mono text-rose-400">-{formatBDT(hon.taxDeduction)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-purple-400">{formatBDT(hon.netAmount)}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                              {hon.approvalStatus}
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
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CASH TRANSACTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCashModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                {txType === 'RECEIPT' ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : <ArrowDownLeft className="w-5 h-5 text-rose-400" />}
                {txType === 'RECEIPT' ? 'Record Cash Receipt' : 'Record Cash Payment Voucher'}
              </h3>
              <button onClick={() => setShowCashModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCashTx} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Amount (BDT ৳)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold">Particulars / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Booking money received / Office stationery"
                  value={txParticulars}
                  onChange={(e) => setTxParticulars(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Account Head</label>
                  <select
                    value={txAccountHead}
                    onChange={(e) => setTxAccountHead(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="Customer Booking Collection">Customer Booking Collection</option>
                    <option value="Installment Receipt">Installment Receipt</option>
                    <option value="Capital Received">Capital Contribution</option>
                    <option value="Office Administrative Expense">Office Admin Expense</option>
                    <option value="Site Development Expense">Site Development Expense</option>
                    <option value="Staff Salary Disbursement">Staff Salary</option>
                    <option value="Vendor Material Purchase">Vendor Purchase</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Payment Method</label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Party / Payee Name</label>
                  <input
                    type="text"
                    placeholder="Customer or Vendor"
                    value={txPartyName}
                    onChange={(e) => setTxPartyName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Link Project (Optional)</label>
                  <select
                    value={txProjectId}
                    onChange={(e) => setTxProjectId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="">None / Corporate</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCashModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl font-bold shadow-lg ${
                    txType === 'RECEIPT' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Save & Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SALARY SHEET MODAL */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Generate Monthly Salary Sheet</h3>
              <button onClick={() => setShowSalaryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateSalarySheet} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-bold">Target Month</label>
                <input
                  type="month"
                  required
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <p className="text-slate-400 text-[11px]">
                This will calculate base salaries, allowances, and bonuses for all active employees ({employees.filter(e => e.status === 'Active').length} staff).
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowSalaryModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">Generate Sheet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECTOR HONORARIUM MODAL */}
      {showHonModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Record Director Honorarium</h3>
              <button onClick={() => setShowHonModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveHonorarium} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold">Director Name</label>
                <input
                  type="text"
                  required
                  value={honDirectorName}
                  onChange={(e) => setHonDirectorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Honorarium (BDT ৳)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={honAmount}
                    onChange={(e) => setHonAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Tax Deduction (৳)</label>
                  <input
                    type="number"
                    value={honTax}
                    onChange={(e) => setHonTax(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowHonModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold">Save Honorarium</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icon component
const LayoutGridIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);
