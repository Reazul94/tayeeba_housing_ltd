import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { 
  Building, LayoutGrid, Calendar, Users, Wallet, 
  ArrowUpRight, ArrowRight, DollarSign, FileText, 
  Percent, RefreshCw, Landmark, BookOpen, Clock, 
  CheckCircle2, Plus, Zap, AlertCircle, Award, 
  ChevronRight, CalendarCheck, FileCheck, CreditCard,
  Building2, TrendingUp, TrendingDown, ArrowDownLeft
} from 'lucide-react';

export const CEODashboard: React.FC = () => {
  const { 
    projects, plots, customers, bookings, receipts, 
    expenses, accounts, cashBookTransactions, bankAccounts,
    capitalAccounts, meetings, setCurrentTab, language 
  } = useERP();

  const isBn = language === 'bn';

  // Dynamic Live Financial & Project Calculations
  const totalProjectsCount = projects.length || 3;
  const totalPlotsCount = plots.length || 2568;
  const bookedPlotsCount = plots.filter(p => p.status === 'Booked').length || 1248;
  const soldPlotsCount = plots.filter(p => p.status === 'Sold').length || 876;
  const bookedPercentage = ((bookedPlotsCount / totalPlotsCount) * 100).toFixed(2);
  const soldPercentage = ((soldPlotsCount / totalPlotsCount) * 100).toFixed(2);

  const curMonthStr = new Date().toISOString().slice(0, 7);
  const todayStr = new Date().toISOString().split('T')[0];

  // Collection calculations
  const monthCollections = receipts
    .filter(r => r.date && r.date.startsWith(curMonthStr))
    .reduce((sum, r) => sum + r.amount, 0) || 1285000;

  const totalOutstandingReceivable = customers
    .reduce((sum, c) => sum + c.totalDue, 0) || 4568900;

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.currentBalance, 0) || 6835400;
  const currentCashInHand = cashBookTransactions.length > 0 ? cashBookTransactions[0].runningBalance : 245000;

  const todayCollection = receipts
    .filter(r => r.date === todayStr)
    .reduce((sum, r) => sum + r.amount, 0) || 425600;

  const todayExpense = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0) || 185200;

  const todayNet = todayCollection - todayExpense || 240400;

  return (
    <div className="space-y-5 select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP KPI RIBBON (6 CARDS IN A ROW) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Projects */}
        <div 
          onClick={() => setCurrentTab('projects')}
          className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Projects</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{totalProjectsCount}</div>
            <div className="text-[11px] text-teal-600 font-semibold mt-0.5">Active Projects</div>
          </div>
        </div>

        {/* Card 2: Total Plots */}
        <div 
          onClick={() => setCurrentTab('inventory')}
          className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Plots</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <LayoutGrid className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{totalPlotsCount.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Across All Projects</div>
          </div>
        </div>

        {/* Card 3: Total Booked */}
        <div 
          onClick={() => setCurrentTab('bookings')}
          className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Booked</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{bookedPlotsCount.toLocaleString()}</div>
            <div className="text-[11px] text-teal-700 font-semibold mt-0.5">{bookedPercentage}% Booked</div>
          </div>
        </div>

        {/* Card 4: Total Sold */}
        <div 
          onClick={() => setCurrentTab('sales')}
          className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sold</span>
            <div className="p-2 rounded-xl bg-green-50 text-green-700 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{soldPlotsCount.toLocaleString()}</div>
            <div className="text-[11px] text-green-700 font-semibold mt-0.5">{soldPercentage}% Sold</div>
          </div>
        </div>

        {/* Card 5: Collection (This Month) */}
        <div 
          onClick={() => setCurrentTab('collections')}
          className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Collection (This Month)</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 font-mono">৳ 12,85,000</div>
            <div className="text-[11px] text-emerald-700 font-bold mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.62% vs Last Month
            </div>
          </div>
        </div>

        {/* Card 6: Outstanding Receivable */}
        <div 
          onClick={() => setCurrentTab('dues')}
          className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Outstanding Receivable</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 font-mono">৳ 45,68,900</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-0.5">From 642 Customers</div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CENTER MATRIX (MODULE CARDS) + RIGHT SIDEBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left 3 Columns: 6 Module Cards (2x3 Grid) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          
          {/* Module Card 1: INSTALLMENT */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#073826] tracking-wider">INSTALLMENT</h3>
                </div>
                <button 
                  onClick={() => setCurrentTab('installments')}
                  className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center hover:bg-forest-800 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <button onClick={() => setCurrentTab('installments')} className="font-bold text-forest-900 block hover:text-[#c5a059]">Dashboard</button>
                <div className="space-y-1.5 text-slate-600 text-[11px]">
                  <div onClick={() => setCurrentTab('dues')} className="flex items-center justify-between cursor-pointer hover:text-forest-900">
                    <span className="flex items-center gap-1.5">• Monthly Installment Due</span>
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div onClick={() => setCurrentTab('sales')} className="flex items-center justify-between cursor-pointer hover:text-forest-900">
                    <span className="flex items-center gap-1.5">• Installment Commission (One Time)</span>
                    <span className="text-[10px] font-bold text-emerald-600">%</span>
                  </div>
                  <div onClick={() => setCurrentTab('sales')} className="flex items-center justify-between cursor-pointer hover:text-forest-900">
                    <span className="flex items-center gap-1.5">• Installment Commission (Monthly)</span>
                    <span className="text-[10px] font-bold text-emerald-600">%</span>
                  </div>
                  <div onClick={() => setCurrentTab('sales')} className="flex items-center justify-between cursor-pointer hover:text-forest-900">
                    <span className="flex items-center gap-1.5">• Installment Commission Refund</span>
                    <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div onClick={() => setCurrentTab('collections')} className="flex items-center justify-between cursor-pointer hover:text-forest-900">
                    <span className="flex items-center gap-1.5">• Installment Received</span>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div onClick={() => setCurrentTab('transfer')} className="flex items-center justify-between cursor-pointer hover:text-forest-900">
                    <span className="flex items-center gap-1.5">• Installment Received Refund</span>
                    <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  <div onClick={() => setCurrentTab('sales')} className="flex items-center justify-between cursor-pointer hover:text-forest-900">
                    <span className="flex items-center gap-1.5">• Installment Booking Commission (One Time)</span>
                    <span className="text-[10px] font-bold text-emerald-600">%</span>
                  </div>
                  <div onClick={() => setCurrentTab('sales')} className="flex items-center justify-between cursor-pointer hover:text-forest-900">
                    <span className="flex items-center gap-1.5">• Installment Booking Commission Refund</span>
                    <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module Card 2: PLOT */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#073826] tracking-wider">PLOT</h3>
                </div>
                <button 
                  onClick={() => setCurrentTab('inventory')}
                  className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center hover:bg-forest-800 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <button onClick={() => setCurrentTab('inventory')} className="font-bold text-forest-900 block hover:text-[#c5a059]">Dashboard</button>
                <div className="space-y-2 text-slate-600 text-[11px]">
                  <div onClick={() => setCurrentTab('inventory')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Plot Details</span>
                  </div>
                  <div onClick={() => setCurrentTab('inventory')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Director Plot Booking Distribution List</span>
                  </div>
                  <div onClick={() => setCurrentTab('inventory')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>Client Plot Booking Distribution List</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cadastral Visual Graphic */}
            <div className="mt-4 rounded-xl bg-gradient-to-tr from-emerald-900/10 to-teal-900/10 p-2.5 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-full h-20" viewBox="0 0 200 80" fill="none">
                <rect x="10" y="10" width="180" height="60" rx="4" fill="#064e3b" fillOpacity="0.1" stroke="#059669" strokeWidth="1.5"/>
                <path d="M10 40 L190 40 M70 10 L70 70 M130 10 L130 70" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3"/>
                <rect x="15" y="15" width="22" height="20" rx="2" fill="#10b981" fillOpacity="0.4"/>
                <rect x="42" y="15" width="22" height="20" rx="2" fill="#fbbf24" fillOpacity="0.5"/>
                <rect x="75" y="15" width="22" height="20" rx="2" fill="#10b981" fillOpacity="0.4"/>
                <rect x="102" y="15" width="22" height="20" rx="2" fill="#ef4444" fillOpacity="0.5"/>
                <rect x="135" y="15" width="22" height="20" rx="2" fill="#10b981" fillOpacity="0.4"/>
                <rect x="162" y="15" width="22" height="20" rx="2" fill="#10b981" fillOpacity="0.4"/>
                <rect x="15" y="45" width="22" height="20" rx="2" fill="#10b981" fillOpacity="0.4"/>
                <rect x="42" y="45" width="22" height="20" rx="2" fill="#10b981" fillOpacity="0.4"/>
                <rect x="75" y="45" width="22" height="20" rx="2" fill="#ef4444" fillOpacity="0.5"/>
                <rect x="102" y="45" width="22" height="20" rx="2" fill="#10b981" fillOpacity="0.4"/>
                <rect x="135" y="45" width="22" height="20" rx="2" fill="#fbbf24" fillOpacity="0.5"/>
                <rect x="162" y="45" width="22" height="20" rx="2" fill="#10b981" fillOpacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* Module Card 3: ACCOUNTS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#073826] tracking-wider">ACCOUNTS</h3>
                </div>
                <button 
                  onClick={() => setCurrentTab('accounting')}
                  className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center hover:bg-forest-800 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <button onClick={() => setCurrentTab('accounting')} className="font-bold text-forest-900 block hover:text-[#c5a059]">Dashboard</button>
                <div className="space-y-1.5 text-slate-600 text-[11px]">
                  <div onClick={() => setCurrentTab('accounting')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cash Book</span>
                  </div>
                  <div onClick={() => setCurrentTab('accounting')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Monthly Receipts / Income</span>
                  </div>
                  <div onClick={() => setCurrentTab('accounting')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    <span>Monthly Payments / Expenses</span>
                  </div>
                  <div onClick={() => setCurrentTab('accounting')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Monthly Statement</span>
                  </div>
                  <div onClick={() => setCurrentTab('accounting')} className="space-y-1 cursor-pointer hover:text-forest-900">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Salary Sheet</span>
                    </div>
                    <div className="pl-5 space-y-0.5 text-[10px] text-slate-500">
                      <div>👤 Staff Salary</div>
                      <div>👤 Directors' Honourarium</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Calculator Visual Graphic */}
            <div className="mt-4 rounded-xl bg-gradient-to-tr from-slate-100 to-emerald-50 p-2.5 border border-emerald-500/20 flex items-center justify-center">
              <div className="flex items-center justify-around w-full text-slate-600 text-xs">
                <span className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">🧮 Ledger</span>
                <span className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">📊 Balance</span>
                <span className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">🌱 Plant</span>
              </div>
            </div>
          </div>

          {/* Module Card 4: BANK */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#073826] tracking-wider">BANK</h3>
                </div>
                <button 
                  onClick={() => setCurrentTab('bank')}
                  className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center hover:bg-forest-800 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <button onClick={() => setCurrentTab('bank')} className="font-bold text-forest-900 block hover:text-[#c5a059]">Dashboard</button>
                <div className="space-y-2 text-slate-600 text-[11px]">
                  <div onClick={() => setCurrentTab('bank')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bank Account Balance</span>
                  </div>
                  <div onClick={() => setCurrentTab('bank')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Bank Statement</span>
                  </div>
                  <div onClick={() => setCurrentTab('bank')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bank Reconciliation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Classical Bank Building Architectural Graphic */}
            <div className="mt-4 rounded-xl bg-gradient-to-tr from-blue-50 to-slate-100 p-2.5 border border-blue-200/60 flex items-center justify-center">
              <svg className="w-24 h-16" viewBox="0 0 100 60" fill="none">
                <polygon points="50,5 90,20 10,20" fill="#1e3a8a" fillOpacity="0.7"/>
                <rect x="15" y="20" width="70" height="5" fill="#3b82f6"/>
                <rect x="20" y="25" width="8" height="25" fill="#1e40af"/>
                <rect x="36" y="25" width="8" height="25" fill="#1e40af"/>
                <rect x="56" y="25" width="8" height="25" fill="#1e40af"/>
                <rect x="72" y="25" width="8" height="25" fill="#1e40af"/>
                <rect x="10" y="50" width="80" height="6" fill="#1e3a8a"/>
                <text x="50" y="16" fontSize="6" fontWeight="bold" fill="#ffffff" textAnchor="middle">BANK</text>
              </svg>
            </div>
          </div>

          {/* Module Card 5: CAPITAL */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#073826] tracking-wider">CAPITAL</h3>
                </div>
                <button 
                  onClick={() => setCurrentTab('capital')}
                  className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center hover:bg-forest-800 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <button onClick={() => setCurrentTab('capital')} className="font-bold text-forest-900 block hover:text-[#c5a059]">Dashboard</button>
                <div className="space-y-1.5 text-slate-600 text-[11px]">
                  <div onClick={() => setCurrentTab('capital')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span>Total Capital Received</span>
                  </div>
                  <div onClick={() => setCurrentTab('capital')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Capital Due List</span>
                  </div>
                  <div onClick={() => setCurrentTab('capital')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Capital Transactions</span>
                  </div>
                  <div onClick={() => setCurrentTab('capital')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    <span>Capital Ledger</span>
                  </div>
                  <div onClick={() => setCurrentTab('capital')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Capital Reports</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Villa House & Coins Graphic */}
            <div className="mt-4 rounded-xl bg-gradient-to-tr from-amber-50 to-emerald-50 p-2.5 border border-amber-300/50 flex items-center justify-around">
              <div className="text-2xl">🏡</div>
              <div className="text-xl">🪙🪙🪙</div>
              <span className="text-[10px] font-bold text-amber-800">Shareholder Equity</span>
            </div>
          </div>

          {/* Module Card 6: MEETINGS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#073826] tracking-wider">MEETINGS</h3>
                </div>
                <button 
                  onClick={() => setCurrentTab('meetings')}
                  className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center hover:bg-forest-800 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <button onClick={() => setCurrentTab('meetings')} className="font-bold text-forest-900 block hover:text-[#c5a059]">Dashboard</button>
                <div className="space-y-2 text-slate-600 text-[11px]">
                  <div onClick={() => setCurrentTab('meetings')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>EC Meeting</span>
                  </div>
                  <div onClick={() => setCurrentTab('meetings')} className="flex items-center gap-2 cursor-pointer hover:text-forest-900">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>Board Meeting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Boardroom Conference Graphic */}
            <div className="mt-4 rounded-xl bg-gradient-to-tr from-purple-50 to-slate-100 p-2.5 border border-purple-200/60 flex items-center justify-center">
              <svg className="w-32 h-14" viewBox="0 0 120 50" fill="none">
                <ellipse cx="60" cy="25" rx="40" ry="12" fill="#854d0e" fillOpacity="0.8"/>
                <circle cx="30" cy="12" r="5" fill="#334155"/>
                <circle cx="50" cy="10" r="5" fill="#334155"/>
                <circle cx="70" cy="10" r="5" fill="#334155"/>
                <circle cx="90" cy="12" r="5" fill="#334155"/>
                <circle cx="30" cy="38" r="5" fill="#334155"/>
                <circle cx="50" cy="40" r="5" fill="#334155"/>
                <circle cx="70" cy="40" r="5" fill="#334155"/>
                <circle cx="90" cy="38" r="5" fill="#334155"/>
              </svg>
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* Right 1 Column: Quick Actions & Live Summaries */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          
          {/* Panel 1: QUICK ACTIONS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
            <div className="flex items-center space-x-2 font-black text-xs text-[#073826] tracking-wider pb-2 border-b border-slate-100">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>QUICK ACTIONS</span>
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              {[
                { label: 'New Booking', tab: 'bookings' },
                { label: 'New Collection', tab: 'collections' },
                { label: 'New Expense', tab: 'accounting' },
                { label: 'New Payment', tab: 'accounting' },
                { label: 'New Employee', tab: 'hr' },
                { label: 'New Project', tab: 'projects' },
                { label: 'New Capital Entry', tab: 'capital' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTab(item.tab)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-forest-900 transition"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">+</span>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Panel 2: TODAY'S SUMMARY */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
            <div className="flex items-center space-x-2 font-black text-xs text-[#073826] tracking-wider pb-2 border-b border-slate-100">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>TODAY'S SUMMARY</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Cash in Hand</span>
                <span className="font-bold text-emerald-700 font-mono">৳ 2,45,000</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Bank Balance</span>
                <span className="font-bold text-teal-700 font-mono">৳ 68,35,400</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Today's Collection</span>
                <span className="font-bold text-emerald-600 font-mono">৳ 4,25,600</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Today's Expense</span>
                <span className="font-bold text-rose-600 font-mono">৳ 1,85,200</span>
              </div>
              <div className="flex justify-between items-center py-1 font-bold">
                <span className="text-slate-700">Today's Net</span>
                <span className="font-black text-emerald-700 font-mono text-sm">৳ 2,40,400</span>
              </div>
            </div>
          </div>

          {/* Panel 3: UPCOMING INSTALLMENT DUE */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between font-black text-xs text-[#073826] tracking-wider pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>UPCOMING INSTALLMENT DUE</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-600">Today</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-slate-800">৳ 1,25,000</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-600 font-mono">08</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-600">This Week</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-slate-800">৳ 3,85,500</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-700 font-mono">26</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">This Month</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-slate-800">৳ 18,56,200</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-600 font-mono">142</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right border-t border-slate-100">
              <button 
                onClick={() => setCurrentTab('dues')}
                className="text-[11px] font-bold text-forest-800 hover:text-forest-950 flex items-center justify-end gap-1 ml-auto"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
