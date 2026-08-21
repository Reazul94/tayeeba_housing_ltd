import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { BankAccount, BankTransaction, BankReconciliation } from '../../types/erp';
import { 
  Landmark, CreditCard, ArrowUpRight, ArrowDownLeft, 
  Plus, Search, Filter, Printer, Download, CheckCircle2, 
  AlertCircle, Building2, RefreshCw, X, ShieldCheck, 
  FileText, Calendar, CheckSquare, Square, Eye, EyeOff
} from 'lucide-react';

export const BankManager: React.FC = () => {
  const { 
    bankAccounts, addBankAccount, updateBankAccount,
    bankTransactions, addBankTransaction, reconcileBankTransaction,
    bankReconciliations, createBankReconciliation,
    language, currentUser, showToast 
  } = useERP();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'statement' | 'reconciliation'>('dashboard');

  // Filter States
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMasked, setShowMasked] = useState<boolean>(true);

  // Modals State
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [bankName, setBankName] = useState('Islami Bank Bangladesh Ltd.');
  const [branchName, setBranchName] = useState('Gulshan Branch, Dhaka');
  const [accountName, setAccountName] = useState('Tayeeba Housing Ltd.');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<BankAccount['accountType']>('Current');
  const [routingNumber, setRoutingNumber] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  // Bank Transaction Modal
  const [showTxModal, setShowTxModal] = useState(false);
  const [txBankId, setTxBankId] = useState(bankAccounts[0]?.id || '');
  const [txType, setTxType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txParticulars, setTxParticulars] = useState('');
  const [txReference, setTxReference] = useState('');
  const [txCheque, setTxCheque] = useState('');
  const [txAmount, setTxAmount] = useState<number>(100000);

  // Reconciliation Modal State
  const [showRecModal, setShowRecModal] = useState(false);
  const [recBankId, setRecBankId] = useState(bankAccounts[0]?.id || '');
  const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [statementBalance, setStatementBalance] = useState<number>(0);
  const [recNotes, setRecNotes] = useState('');

  // Calculations
  const curMonthStr = new Date().toISOString().slice(0, 7);
  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const monthBankDeposits = bankTransactions.filter(t => t.date.startsWith(curMonthStr)).reduce((sum, t) => sum + t.depositAmount, 0);
  const monthBankWithdrawals = bankTransactions.filter(t => t.date.startsWith(curMonthStr)).reduce((sum, t) => sum + t.withdrawalAmount, 0);
  const monthNetBankMovement = monthBankDeposits - monthBankWithdrawals;

  const maskAccNo = (num: string) => {
    if (!showMasked) return num;
    if (num.length <= 4) return num;
    return '••••••••' + num.slice(-4);
  };

  // Submit Bank Account
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber) {
      showToast('Please provide bank name and account number', 'warning');
      return;
    }

    addBankAccount({
      bankName,
      branchName,
      accountName,
      accountNumber,
      accountType,
      routingNumber: routingNumber || undefined,
      openingBalance,
      currency: 'BDT',
      isActive: true
    });

    setShowAccountModal(false);
    setAccountNumber('');
    setOpeningBalance(0);
  };

  // Submit Bank Transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txBankId || !txParticulars || txAmount <= 0) {
      showToast('Please fill all transaction fields', 'warning');
      return;
    }

    addBankTransaction({
      bankAccountId: txBankId,
      transactionType: txType,
      date: txDate,
      particulars: txParticulars,
      referenceNo: txReference || undefined,
      chequeNumber: txCheque || undefined,
      paymentMethod: 'Bank Transfer',
      depositAmount: txType === 'DEPOSIT' ? txAmount : 0,
      withdrawalAmount: txType === 'WITHDRAWAL' ? txAmount : 0
    });

    setShowTxModal(false);
    setTxParticulars('');
    setTxAmount(100000);
  };

  // Submit Reconciliation
  const handleSaveReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAcc = bankAccounts.find(a => a.id === recBankId);
    const bookBal = targetAcc ? targetAcc.currentBalance : 0;
    const diff = bookBal - statementBalance;

    createBankReconciliation({
      bankAccountId: recBankId,
      bankAccountName: targetAcc ? targetAcc.bankName : 'Bank Account',
      statementDate: recDate,
      bookBalance: bookBal,
      bankStatementBalance: statementBalance,
      differenceAmount: diff,
      status: Math.abs(diff) < 0.01 ? 'RECONCILED' : 'DISCREPANCY',
      notes: recNotes,
      performedBy: currentUser.name
    });

    setShowRecModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isBn ? "ব্যাংক একাউন্ট ও স্টেটমেন্ট ম্যানেজমেন্ট" : "Bank Accounts & Statement Management"}
            </h1>
            <p className="text-xs text-slate-400">
              {isBn ? "মাল্টি-ব্যাংক ব্যালেন্স, স্টেটমেন্ট ট্র্যাকিং ও ব্যাংক রিকনসিলিয়েশন" : "Multi-Bank Balances, Transaction Feeds & Bank Reconciliation"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {isBn ? "+ নতুন ব্যাংক একাউন্ট" : "+ Add Bank Account"}
          </button>
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {isBn ? "+ ব্যাংক ট্রানজেকশন" : "+ Post Transaction"}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'dashboard', label: isBn ? "ব্যাংক ড্যাশবোর্ড" : "Bank Dashboard", icon: Landmark },
          { id: 'accounts', label: isBn ? "ব্যাংক একাউন্ট ব্যালেন্স" : "Bank Account Balance", icon: CreditCard },
          { id: 'statement', label: isBn ? "ব্যাংক স্টেটমেন্ট" : "Bank Statement", icon: FileText },
          { id: 'reconciliation', label: isBn ? "ব্যাংক রিকনসিলিয়েশন" : "Bank Reconciliation", icon: RefreshCw },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. BANK DASHBOARD VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bank Balance</span>
                <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Landmark className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-white mt-3">{formatBDT(totalBankBalance)}</div>
              <div className="text-[11px] text-blue-400 mt-2 font-medium">
                Across {bankAccounts.length} Active Accounts
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Month Bank Deposits</span>
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><ArrowUpRight className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-3">{formatBDT(monthBankDeposits)}</div>
              <div className="text-[11px] text-slate-400 mt-2">Incoming funds this month</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Month Withdrawals</span>
                <span className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><ArrowDownLeft className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-rose-400 mt-3">{formatBDT(monthBankWithdrawals)}</div>
              <div className="text-[11px] text-slate-400 mt-2">Disbursed funds this month</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Bank Movement</span>
                <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><RefreshCw className="w-5 h-5" /></span>
              </div>
              <div className={`text-2xl font-black mt-3 ${monthNetBankMovement >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBDT(monthNetBankMovement)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">Net change this month</div>
            </div>
          </div>

          {/* Bank Accounts Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map(acc => (
              <div key={acc.id} className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    {acc.accountType} Account
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{acc.bankName}</h3>
                  <p className="text-xs text-slate-400">{acc.branchName}</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Account No:</span>
                    <span className="font-mono text-slate-200 font-bold">{maskAccNo(acc.accountNumber)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Routing No:</span>
                    <span className="font-mono text-slate-300">{acc.routingNumber || '—'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Current Balance:</span>
                  <span className="text-base font-black text-emerald-400 font-mono">{formatBDT(acc.currentBalance)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. BANK ACCOUNT BALANCE VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-bold">
              Total Company Bank Holdings: <span className="text-emerald-400 font-black text-sm">{formatBDT(totalBankBalance)}</span>
            </div>
            <button
              onClick={() => setShowMasked(!showMasked)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-lg"
            >
              {showMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {showMasked ? 'Reveal Account Numbers' : 'Mask Account Numbers'}
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">Bank Name & Branch</th>
                  <th className="py-3 px-4">Account Title</th>
                  <th className="py-3 px-4">Account Number</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Opening Balance</th>
                  <th className="py-3 px-4 text-right text-emerald-400 font-bold">Current Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bankAccounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-white">{acc.accountCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{acc.bankName}</div>
                      <div className="text-[11px] text-slate-400">{acc.branchName}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{acc.accountName}</td>
                    <td className="py-3 px-4 font-mono text-slate-200">{maskAccNo(acc.accountNumber)}</td>
                    <td className="py-3 px-4 text-blue-400">{acc.accountType}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{formatBDT(acc.openingBalance)}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-400">{formatBDT(acc.currentBalance)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ACTIVE
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
      {/* 3. BANK STATEMENT VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'statement' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="ALL">All Bank Accounts</option>
                {bankAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.bankName} ({a.branchName})</option>
                ))}
              </select>

              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>

            <button onClick={() => window.print()} className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700">
              <Printer className="w-3.5 h-3.5" /> Print Statement
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">Bank Account</th>
                  <th className="py-3 px-4">Particulars / Cheque</th>
                  <th className="py-3 px-4 text-right text-emerald-400">Deposit (DR)</th>
                  <th className="py-3 px-4 text-right text-rose-400">Withdrawal (CR)</th>
                  <th className="py-3 px-4 text-right text-white">Balance</th>
                  <th className="py-3 px-4 text-center">Reconciled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bankTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No bank transactions recorded. Click <strong>+ Post Transaction</strong> to log deposits or withdrawals.
                    </td>
                  </tr>
                ) : (
                  bankTransactions
                    .filter(t => selectedAccountId === 'ALL' || t.bankAccountId === selectedAccountId)
                    .filter(t => !filterMonth || t.date.startsWith(filterMonth))
                    .map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{tx.date}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white">{tx.transactionId}</td>
                        <td className="py-3 px-4 text-blue-400 font-medium">{tx.bankAccountName}</td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200">{tx.particulars}</div>
                          {tx.chequeNumber && <span className="text-[10px] text-slate-500 font-mono">Cheque #{tx.chequeNumber}</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400 font-mono">
                          {tx.depositAmount > 0 ? formatBDT(tx.depositAmount) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-400 font-mono">
                          {tx.withdrawalAmount > 0 ? formatBDT(tx.withdrawalAmount) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-white font-mono">{formatBDT(tx.balanceAfter)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => reconcileBankTransaction(tx.id, !tx.isReconciled)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                              tx.isReconciled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500 hover:text-white'
                            }`}
                          >
                            {tx.isReconciled ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
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
      {/* 4. BANK RECONCILIATION VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Bank Statement Reconciliation Engine</h3>
              <p className="text-xs text-slate-400">Match general ledger book balances against certified bank statements</p>
            </div>
            <button
              onClick={() => setShowRecModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Reconciliation Session
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Session No</th>
                  <th className="py-3 px-4">Bank Account</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Book Balance</th>
                  <th className="py-3 px-4 text-right">Bank Statement Balance</th>
                  <th className="py-3 px-4 text-right">Discrepancy</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bankReconciliations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No reconciliation sessions performed. Click <strong>New Reconciliation Session</strong> to compare statements.
                    </td>
                  </tr>
                ) : (
                  bankReconciliations.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-white">{rec.reconciliationNo}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{rec.bankAccountName}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{rec.statementDate}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatBDT(rec.bookBalance)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-400">{formatBDT(rec.bankStatementBalance)}</td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${Math.abs(rec.differenceAmount) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatBDT(rec.differenceAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          rec.status === 'RECONCILED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {rec.status}
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

      {/* CREATE BANK ACCOUNT MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add New Bank Account</h3>
              <button onClick={() => setShowAccountModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Islami Bank Bangladesh Ltd."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Branch Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Gulshan Branch"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="Current">Current Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="SND">SND Account</option>
                    <option value="FDR">FDR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold">Account Title</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="2050123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Opening Balance (৳)</label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAccountModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST BANK TRANSACTION MODAL */}
      {showTxModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Post Bank Transaction</h3>
              <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Transaction Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="DEPOSIT">Deposit (Inflow)</option>
                    <option value="WITHDRAWAL">Withdrawal (Outflow)</option>
                  </select>
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
                <label className="text-slate-400 font-bold">Target Bank Account</label>
                <select
                  value={txBankId}
                  onChange={(e) => setTxBankId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                >
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.bankName} - {a.branchName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 font-bold">Particulars</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client deposit / Contractor pay order"
                  value={txParticulars}
                  onChange={(e) => setTxParticulars(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Cheque / PO Number</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={txCheque}
                    onChange={(e) => setTxCheque(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono mt-1"
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
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowTxModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">Post to Bank & Ledger</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECONCILIATION MODAL */}
      {showRecModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">New Bank Reconciliation</h3>
              <button onClick={() => setShowRecModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveReconciliation} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold">Select Bank Account</label>
                <select
                  value={recBankId}
                  onChange={(e) => setRecBankId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                >
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.bankName} (Book Bal: {formatBDT(a.currentBalance)})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Statement Date</label>
                  <input
                    type="date"
                    required
                    value={recDate}
                    onChange={(e) => setRecDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Certified Bank Statement Balance (৳)</label>
                  <input
                    type="number"
                    required
                    value={statementBalance}
                    onChange={(e) => setStatementBalance(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold">Audit Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on uncredited cheques or unpresented vouchers"
                  value={recNotes}
                  onChange={(e) => setRecNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowRecModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">Verify & Save Reconciliation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
