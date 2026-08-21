import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { CapitalAccount, CapitalTransaction } from '../../types/erp';
import { 
  Award, Landmark, TrendingUp, ArrowUpRight, 
  ArrowDownLeft, Plus, Search, Filter, Printer, 
  Download, CheckCircle2, AlertCircle, Users, 
  Building2, PieChart, ShieldCheck, X, FileText, 
  Percent, DollarSign
} from 'lucide-react';

export const CapitalManager: React.FC = () => {
  const { 
    capitalAccounts, addCapitalAccount,
    capitalTransactions, addCapitalTransaction,
    bankAccounts, projects, language, currentUser, showToast 
  } = useERP();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'received' | 'due' | 'ledger'>('dashboard');

  // Filter States
  const [filterContributor, setFilterContributor] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Shareholder Modal State
  const [showShareholderModal, setShowShareholderModal] = useState(false);
  const [contributorName, setContributorName] = useState('');
  const [contributorType, setContributorType] = useState<CapitalAccount['contributorType']>('Director');
  const [nidOrPassport, setNidOrPassport] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sharePct, setSharePct] = useState<number>(10);
  const [committedCapital, setCommittedCapital] = useState<number>(5000000);

  // Capital Transaction Modal State
  const [showTxModal, setShowTxModal] = useState(false);
  const [txAccountId, setTxAccountId] = useState(capitalAccounts[0]?.id || '');
  const [txType, setTxType] = useState<CapitalTransaction['transactionType']>('CAPITAL_RECEIVED');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txAmount, setTxAmount] = useState<number>(1000000);
  const [txMethod, setTxMethod] = useState<CapitalTransaction['paymentMethod']>('Bank Transfer');
  const [txBankId, setTxBankId] = useState(bankAccounts[0]?.id || '');
  const [txRef, setTxRef] = useState('');
  const [txProjectId, setTxProjectId] = useState('');
  const [txRemarks, setTxRemarks] = useState('');

  // Calculations
  const curMonthStr = new Date().toISOString().slice(0, 7);
  const totalCommitted = capitalAccounts.reduce((sum, a) => sum + a.committedCapital, 0);
  const totalReceived = capitalAccounts.reduce((sum, a) => sum + a.receivedCapital, 0);
  const totalDue = capitalAccounts.reduce((sum, a) => sum + a.dueCapital, 0);
  const monthReceived = capitalTransactions
    .filter(t => t.transactionType === 'CAPITAL_RECEIVED' && t.date.startsWith(curMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  // Submit Shareholder
  const handleSaveShareholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributorName || committedCapital <= 0) {
      showToast('Please enter name and committed capital > 0', 'warning');
      return;
    }

    addCapitalAccount({
      contributorName,
      contributorType,
      nidOrPassport: nidOrPassport || undefined,
      phone: phone || undefined,
      email: email || undefined,
      sharePercentage: sharePct,
      committedCapital
    });

    setShowShareholderModal(false);
    setContributorName('');
    setNidOrPassport('');
    setPhone('');
    setEmail('');
  };

  // Submit Capital Transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAcc = capitalAccounts.find(a => a.id === txAccountId);
    if (!targetAcc || txAmount <= 0) {
      showToast('Please select contributor and valid amount', 'warning');
      return;
    }

    const prj = projects.find(p => p.id === txProjectId);
    const bank = bankAccounts.find(b => b.id === txBankId);

    addCapitalTransaction({
      capitalAccountId: txAccountId,
      contributorName: targetAcc.contributorName,
      transactionType: txType,
      date: txDate,
      amount: txAmount,
      paymentMethod: txMethod,
      bankAccountId: txBankId || undefined,
      bankAccountName: bank ? `${bank.bankName} (${bank.branchName})` : undefined,
      referenceDetails: txRef || undefined,
      projectId: txProjectId || undefined,
      projectName: prj?.name || undefined,
      remarks: txRemarks || undefined
    });

    setShowTxModal(false);
    setTxRef('');
    setTxRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isBn ? "ক্যাপিটাল ও শেয়ারহোল্ডার ফান্ড ম্যানেজমেন্ট" : "Capital & Equity Management"}
            </h1>
            <p className="text-xs text-slate-400">
              {isBn ? "শেয়ারহোল্ডার ইকুইটি, ক্যাপিটাল রিসিভড, বকেয়া হিসাব ও লেজার" : "Shareholder Equity, Capital Inflows, Outstanding Capital & Contributor Ledgers"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowShareholderModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {isBn ? "+ নতুন শেয়ারহোল্ডার" : "+ Add Shareholder"}
          </button>
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            {isBn ? "+ ক্যাপিটাল গ্রহণ এন্ট্রি" : "+ Record Capital Received"}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'dashboard', label: isBn ? "ক্যাপিটাল ড্যাশবোর্ড" : "Capital Dashboard", icon: Award },
          { id: 'received', label: isBn ? "প্রাপ্ত ক্যাপিটাল (Received)" : "Capital Received", icon: ArrowUpRight },
          { id: 'due', label: isBn ? "বকেয়া ক্যাপিটাল তালিকা" : "Capital Due List", icon: AlertCircle },
          { id: 'ledger', label: isBn ? "ক্যাপিটাল লেজার ও স্টেটমেন্ট" : "Capital Ledger & Statement", icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. CAPITAL DASHBOARD VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Committed Capital</span>
                <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Award className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-white mt-3">{formatBDT(totalCommitted)}</div>
              <div className="text-[11px] text-slate-400 mt-2 font-medium">Across {capitalAccounts.length} Shareholders</div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Capital Received</span>
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><ArrowUpRight className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-3">{formatBDT(totalReceived)}</div>
              <div className="text-[11px] text-emerald-400 mt-2">
                {totalCommitted > 0 ? `${((totalReceived / totalCommitted) * 100).toFixed(1)}% of commitment paid` : '0% paid'}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Capital Due</span>
                <span className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><AlertCircle className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-rose-400 mt-3">{formatBDT(totalDue)}</div>
              <div className="text-[11px] text-slate-400 mt-2">Outstanding equity receivable</div>
            </div>

            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Month Received</span>
                <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><TrendingUp className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-cyan-400 mt-3">{formatBDT(monthReceived)}</div>
              <div className="text-[11px] text-slate-400 mt-2">Capital injected this month</div>
            </div>
          </div>

          {/* Shareholders Equity Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capitalAccounts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                No shareholders or capital accounts registered yet. Click <strong>+ Add Shareholder</strong> above to initialize equity accounts.
              </div>
            ) : (
              capitalAccounts.map(acc => (
                <div key={acc.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">{acc.contributorCode}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {acc.sharePercentage}% Share
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{acc.contributorName}</h3>
                    <p className="text-xs text-slate-400">{acc.contributorType}</p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Committed:</span>
                      <span className="font-bold text-white">{formatBDT(acc.committedCapital)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Received:</span>
                      <span className="font-bold">{formatBDT(acc.receivedCapital)}</span>
                    </div>
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span>Due:</span>
                      <span>{formatBDT(acc.dueCapital)}</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, acc.committedCapital > 0 ? (acc.receivedCapital / acc.committedCapital) * 100 : 0)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CAPITAL RECEIVED VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-bold">
              Total Capital Injected: <span className="text-emerald-400 font-black text-sm">{formatBDT(totalReceived)}</span>
            </div>
            <button onClick={() => window.print()} className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700">
              <Printer className="w-3.5 h-3.5" /> Print Capital Inflow List
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Txn Code</th>
                  <th className="py-3 px-4">Shareholder / Contributor</th>
                  <th className="py-3 px-4">Method & Account</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4 text-right text-emerald-400 font-bold">Amount (BDT ৳)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {capitalTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No capital transactions recorded yet. Click <strong>+ Record Capital Received</strong> to log equity contributions.
                    </td>
                  </tr>
                ) : (
                  capitalTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{tx.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">{tx.transactionCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">{tx.contributorName}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {tx.paymentMethod}
                        {tx.bankAccountName && <span className="block text-[10px] text-blue-400">{tx.bankAccountName}</span>}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">{tx.projectName || 'Corporate'}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-400 font-mono">{formatBDT(tx.amount)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {tx.status}
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
      {/* 3. CAPITAL DUE LIST VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'due' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-bold">
              Total Outstanding Equity Receivable: <span className="text-rose-400 font-black text-sm">{formatBDT(totalDue)}</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-rose-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Shareholder Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Committed Capital</th>
                  <th className="py-3 px-4 text-right text-emerald-400">Total Received</th>
                  <th className="py-3 px-4 text-right text-rose-400 font-bold">Due Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {capitalAccounts.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-slate-500">No shareholder due records found.</td></tr>
                ) : (
                  capitalAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-white">{acc.contributorCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">{acc.contributorName}</td>
                      <td className="py-3 px-4 text-slate-400">{acc.contributorType}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{formatBDT(acc.committedCapital)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400">{formatBDT(acc.receivedCapital)}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-400">{formatBDT(acc.dueCapital)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.dueCapital === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {acc.dueCapital === 0 ? 'PAID IN FULL' : 'DUE'}
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
      {/* 4. CAPITAL LEDGER & STATEMENT VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-bold">Select Shareholder:</label>
              <select
                value={filterContributor}
                onChange={(e) => setFilterContributor(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="ALL">All Shareholders Consolidated</option>
                {capitalAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.contributorName} ({a.contributorCode})</option>
                ))}
              </select>
            </div>
            <button onClick={() => window.print()} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print Contributor Ledger
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-amber-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Transaction Code</th>
                  <th className="py-3 px-4">Shareholder</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Payment Method / Ref</th>
                  <th className="py-3 px-4 text-right">Contribution (DR)</th>
                  <th className="py-3 px-4 text-right">Refund / Payout (CR)</th>
                  <th className="py-3 px-4 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {capitalTransactions.length === 0 ? (
                  <tr><td colSpan={8} className="py-10 text-center text-slate-500">No ledger transactions found.</td></tr>
                ) : (
                  capitalTransactions
                    .filter(t => filterContributor === 'ALL' || t.capitalAccountId === filterContributor)
                    .map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{tx.date}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white">{tx.transactionCode}</td>
                        <td className="py-3 px-4 font-medium text-slate-200">{tx.contributorName}</td>
                        <td className="py-3 px-4 text-amber-300 font-medium">{tx.transactionType}</td>
                        <td className="py-3 px-4 text-slate-400">{tx.paymentMethod}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {tx.transactionType === 'CAPITAL_RECEIVED' ? formatBDT(tx.amount) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                          {tx.transactionType === 'CAPITAL_REFUND' ? formatBDT(tx.amount) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
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

      {/* CREATE SHAREHOLDER MODAL */}
      {showShareholderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add New Shareholder / Equity Investor</h3>
              <button onClick={() => setShowShareholderModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveShareholder} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Haj Engr. Tayeebur Rahman"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Contributor Type</label>
                  <select
                    value={contributorType}
                    onChange={(e) => setContributorType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="Director">Director</option>
                    <option value="Shareholder">Shareholder</option>
                    <option value="Sponsor Investor">Sponsor Investor</option>
                    <option value="Institutional Partner">Institutional Partner</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Shareholding (%)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={sharePct}
                    onChange={(e) => setSharePct(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold">Committed Capital (BDT ৳)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={committedCapital}
                  onChange={(e) => setCommittedCapital(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">NID / Passport</label>
                  <input
                    type="text"
                    value={nidOrPassport}
                    onChange={(e) => setNidOrPassport(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowShareholderModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold">Create Equity Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD CAPITAL TRANSACTION MODAL */}
      {showTxModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Record Capital Contribution</h3>
              <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold">Select Shareholder</label>
                <select
                  value={txAccountId}
                  onChange={(e) => setTxAccountId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                >
                  {capitalAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.contributorName} (Due: {formatBDT(a.dueCapital)})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Contribution (৳)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Date</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Payment Method</label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Pay Order">Pay Order</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Receiving Bank</label>
                  <select
                    value={txBankId}
                    onChange={(e) => setTxBankId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.bankName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold">Reference / Money Receipt Details</label>
                <input
                  type="text"
                  placeholder="e.g. MR-CAP-2026-001 / Cheque #584129"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowTxModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">Record & Credit Capital</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
