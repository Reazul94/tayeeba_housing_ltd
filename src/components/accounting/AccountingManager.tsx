import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { 
  Calculator, Landmark, FileText, CheckCircle2, 
  Plus, AlertCircle, TrendingUp, TrendingDown, BookOpen 
} from 'lucide-react';

export const AccountingManager: React.FC = () => {
  const { 
    accounts, journalEntries, addJournalEntry, 
    language, currentUser 
  } = useERP();

  const isBn = language === 'bn';

  const [activeSubTab, setActiveSubTab] = useState<'coa' | 'jv' | 'trial' | 'pl' | 'bs'>('coa');

  // JV Form State
  const [jvRef, setJvRef] = useState('');
  const [jvDesc, setJvDesc] = useState('');
  const [debitAccount, setDebitAccount] = useState('1010');
  const [creditAccount, setCreditAccount] = useState('1050');
  const [jvAmount, setJvAmount] = useState<number>(50000);

  // Financial aggregates calculation
  const totalAssets = accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = accounts.filter(a => a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0);
  const totalRevenue = accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);

  const netProfit = totalRevenue - totalExpenses;

  // Handle Post Journal Voucher
  const handlePostJV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jvDesc || jvAmount <= 0) {
      alert("Please provide description and amount > 0");
      return;
    }

    const dbAcc = accounts.find(a => a.code === debitAccount);
    const crAcc = accounts.find(a => a.code === creditAccount);

    if (!dbAcc || !crAcc) return;

    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: jvRef || 'MANUAL-JV',
      description: jvDesc,
      lines: [
        { accountCode: dbAcc.code, accountName: dbAcc.name, debit: jvAmount, credit: 0 },
        { accountCode: crAcc.code, accountName: crAcc.name, debit: 0, credit: jvAmount }
      ],
      createdBy: currentUser.name,
      status: 'Approved'
    });

    alert("Journal Voucher posted successfully!");
    setJvDesc('');
    setJvRef('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "ডাবল-এন্ট্রি একাউন্টিং ও ফাইন্যান্স" : "Double-Entry Accounting & Financial Statements"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "চার্ট অব একাউন্টস, জার্নাল ভাউচার, ট্রায়াল ব্যালেন্স, লাভ-ক্ষতি ও ব্যালেন্স শীট" : "Chart of Accounts, Journal Entries, General Ledger, Trial Balance, P&L & Balance Sheet."}
          </p>
        </div>

        {/* Sub tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSubTab('coa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === 'coa' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Chart of Accounts
          </button>
          <button
            onClick={() => setActiveSubTab('jv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === 'jv' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Journal Vouchers
          </button>
          <button
            onClick={() => setActiveSubTab('trial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === 'trial' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Trial Balance
          </button>
          <button
            onClick={() => setActiveSubTab('pl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === 'pl' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Profit & Loss (P&L)
          </button>
          <button
            onClick={() => setActiveSubTab('bs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === 'bs' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Balance Sheet
          </button>
        </div>
      </div>

      {/* 1. CHART OF ACCOUNTS VIEW */}
      {activeSubTab === 'coa' && (
        <div className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex justify-between items-center">
              <span className="text-slate-400 uppercase">Total Assets</span>
              <span className="text-emerald-400 text-sm">{formatBDT(totalAssets)}</span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex justify-between items-center">
              <span className="text-slate-400 uppercase">Total Liabilities</span>
              <span className="text-rose-400 text-sm">{formatBDT(totalLiabilities)}</span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex justify-between items-center">
              <span className="text-slate-400 uppercase">Total Net Revenue</span>
              <span className="text-gold-400 text-sm">{formatBDT(totalRevenue)}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
            <h3 className="text-sm font-extrabold text-white mb-3">Company Chart of Accounts (COA)</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
                  <th className="p-3">Code</th>
                  <th className="p-3">Account Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Sub-Category</th>
                  <th className="p-3 text-right">Current Ledger Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {accounts.map(acc => (
                  <tr key={acc.code} className="hover:bg-slate-700/40 text-slate-200">
                    <td className="p-3 font-mono font-bold text-tayeeba-400">{acc.code}</td>
                    <td className="p-3 font-semibold text-white">{acc.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.type === 'Asset' ? 'bg-emerald-500/20 text-emerald-400' :
                        acc.type === 'Liability' ? 'bg-rose-500/20 text-rose-400' :
                        acc.type === 'Revenue' ? 'bg-gold-500/20 text-gold-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{acc.subCategory}</td>
                    <td className="p-3 text-right font-bold text-white">{formatBDT(acc.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. JOURNAL VOUCHER ENTRY & LOG */}
      {activeSubTab === 'jv' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post JV Form */}
          <form onSubmit={handlePostJV} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-extrabold text-white border-b border-slate-700 pb-2">
              Post Manual Journal Voucher
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reference / Document No</label>
                <input 
                  type="text" 
                  value={jvRef} 
                  onChange={(e) => setJvRef(e.target.value)} 
                  placeholder="e.g. JV-2026-AUG-01" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Narration / Description *</label>
                <textarea 
                  required 
                  value={jvDesc} 
                  onChange={(e) => setJvDesc(e.target.value)} 
                  placeholder="Describe transaction details..." 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white h-20"
                />
              </div>

              <div>
                <label className="block text-emerald-400 font-semibold mb-1">Debit Account (+)</label>
                <select 
                  value={debitAccount} 
                  onChange={(e) => setDebitAccount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {accounts.map(a => (
                    <option key={a.code} value={a.code}>[{a.code}] {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-rose-400 font-semibold mb-1">Credit Account (-)</label>
                <select 
                  value={creditAccount} 
                  onChange={(e) => setCreditAccount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {accounts.map(a => (
                    <option key={a.code} value={a.code}>[{a.code}] {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Voucher Amount (BDT) *</label>
                <input 
                  type="number" 
                  required 
                  value={jvAmount} 
                  onChange={(e) => setJvAmount(Number(e.target.value))} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-gold-400"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold py-2.5 rounded-xl transition shadow"
              >
                Post Journal Voucher
              </button>
            </div>
          </form>

          {/* Journal Entries History Register */}
          <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-extrabold text-white border-b border-slate-700 pb-2">
              Approved Journal Vouchers Register ({journalEntries.length})
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {journalEntries.map(jv => (
                <div key={jv.id} className="p-4 bg-slate-900/90 rounded-xl border border-slate-700/70 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-tayeeba-400">{jv.voucherNumber}</span>
                    <span className="text-slate-400">{jv.date}</span>
                  </div>

                  <p className="text-slate-200 font-medium">{jv.description}</p>

                  <div className="bg-slate-950 p-2 rounded-lg space-y-1 text-[11px]">
                    {jv.lines.map((l, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-slate-300">[{l.accountCode}] {l.accountName}</span>
                        <span>
                          {l.debit > 0 && <strong className="text-emerald-400">Dr: {formatBDT(l.debit)}</strong>}
                          {l.credit > 0 && <strong className="text-rose-400">Cr: {formatBDT(l.credit)}</strong>}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-500 text-right">
                    Posted by {jv.createdBy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. TRIAL BALANCE STATEMENT */}
      {activeSubTab === 'trial' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg space-y-4 max-w-4xl mx-auto">
          <div className="text-center border-b border-slate-700 pb-4">
            <h2 className="text-lg font-extrabold text-white">TAYEEBA HOUSING LTD.</h2>
            <h3 className="text-sm font-bold text-tayeeba-400">TRIAL BALANCE STATEMENT</h3>
            <p className="text-xs text-slate-400">As of August 2026</p>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
                <th className="p-3">Account Code</th>
                <th className="p-3">Account Title</th>
                <th className="p-3 text-right">Debit Balance (BDT)</th>
                <th className="p-3 text-right">Credit Balance (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {accounts.map(acc => {
                const isDebit = acc.type === 'Asset' || acc.type === 'Expense';
                return (
                  <tr key={acc.code} className="hover:bg-slate-700/40 text-slate-200">
                    <td className="p-3 font-mono text-tayeeba-400 font-bold">{acc.code}</td>
                    <td className="p-3 font-semibold text-white">{acc.name}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {isDebit ? formatBDT(acc.balance) : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-400">
                      {!isDebit ? formatBDT(acc.balance) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-tayeeba-950 font-extrabold text-sm text-white border-t-2 border-tayeeba-500">
                <td colSpan={2} className="p-3 text-right">TOTAL TRIAL BALANCE:</td>
                <td className="p-3 text-right text-emerald-400">{formatBDT(totalAssets + totalExpenses)}</td>
                <td className="p-3 text-right text-rose-400">{formatBDT(totalLiabilities + totalEquity + totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 4. PROFIT & LOSS STATEMENT */}
      {activeSubTab === 'pl' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg space-y-6 max-w-3xl mx-auto">
          <div className="text-center border-b border-slate-700 pb-4">
            <h2 className="text-lg font-extrabold text-white">TAYEEBA HOUSING LTD.</h2>
            <h3 className="text-sm font-bold text-gold-400">PROFIT & LOSS STATEMENT (INCOME STATEMENT)</h3>
            <p className="text-xs text-slate-400">For Period Ended August 2026</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-tayeeba-400 uppercase tracking-wider text-xs border-b border-slate-700 pb-1">
                OPERATING REVENUE
              </h4>
              {accounts.filter(a => a.type === 'Revenue').map(a => (
                <div key={a.code} className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-300">[{a.code}] {a.name}</span>
                  <span className="font-bold text-white">{formatBDT(a.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold text-sm bg-slate-900 p-2 rounded-lg">
                <span className="text-gold-400">TOTAL REVENUE</span>
                <span className="text-gold-400">{formatBDT(totalRevenue)}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-rose-400 uppercase tracking-wider text-xs border-b border-slate-700 pb-1">
                OPERATING & PROJECT EXPENSES
              </h4>
              {accounts.filter(a => a.type === 'Expense').map(a => (
                <div key={a.code} className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-300">[{a.code}] {a.name}</span>
                  <span className="font-bold text-rose-400">{formatBDT(a.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold text-sm bg-slate-900 p-2 rounded-lg">
                <span className="text-rose-400">TOTAL EXPENSES</span>
                <span className="text-rose-400">{formatBDT(totalExpenses)}</span>
              </div>
            </div>

            {/* Net Profit Summary */}
            <div className="p-4 bg-gradient-to-r from-tayeeba-950 to-slate-900 border border-tayeeba-500 rounded-xl flex items-center justify-between font-extrabold text-base text-white">
              <span>NET OPERATING PROFIT</span>
              <span className="text-tayeeba-400 text-lg">{formatBDT(netProfit)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
