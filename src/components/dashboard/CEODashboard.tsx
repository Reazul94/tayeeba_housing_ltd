import React from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, Wallet, CreditCard, DollarSign, Building, 
  PieChart as PieIcon, CheckCircle2, AlertTriangle, ArrowUpRight, 
  ArrowDownRight, Users, Clock, FileText, ChevronRight 
} from 'lucide-react';

export const CEODashboard: React.FC = () => {
  const { 
    projects, plots, customers, bookings, receipts, 
    expenses, accounts, setCurrentTab, language 
  } = useERP();

  const isBn = language === 'bn';

  // Calculate Live Dashboard Aggregates
  const totalSalesValue = bookings.reduce((sum, b) => sum + b.finalPrice, 0);
  const totalCollections = receipts.reduce((sum, r) => sum + r.amount, 0);
  
  // Today's Collection
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollection = receipts
    .filter(r => r.date === todayStr)
    .reduce((sum, r) => sum + r.amount, 0);

  // Monthly Collection (August 2026 or current month)
  const currentMonthPrefix = todayStr.substring(0, 7);
  const monthlyCollection = receipts
    .filter(r => r.date.startsWith(currentMonthPrefix))
    .reduce((sum, r) => sum + r.amount, 0);

  const totalOutstandingDue = customers.reduce((sum, c) => sum + c.totalDue, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Cash & Bank Balances from Accounts COA
  const cashAccount = accounts.find(a => a.code === '1010');
  const bankAccount1 = accounts.find(a => a.code === '1020');
  const bankAccount2 = accounts.find(a => a.code === '1025');
  const cashBalance = cashAccount ? cashAccount.balance : 0;
  const bankBalance = (bankAccount1 ? bankAccount1.balance : 0) + (bankAccount2 ? bankAccount2.balance : 0);

  // Plot Status Counters
  const availablePlots = plots.filter(p => p.status === 'Available').length;
  const reservedPlots = plots.filter(p => p.status === 'Reserved').length;
  const bookedPlots = plots.filter(p => p.status === 'Booked').length;
  const soldPlots = plots.filter(p => p.status === 'Sold').length;
  const totalPlotsCount = plots.length;

  // Chart Data: Monthly Collections & Sales Trend from Live Bookings & Receipts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const monthlyTrendData = months.map((m, idx) => {
    const monthNum = String(idx + 1).padStart(2, '0');
    const monthPrefix = `${currentYear}-${monthNum}`;
    const monthBookingsSales = bookings
      .filter(b => b.bookingDate && b.bookingDate.startsWith(monthPrefix))
      .reduce((sum, b) => sum + b.finalPrice, 0);
    const monthReceiptsCol = receipts
      .filter(r => r.date && r.date.startsWith(monthPrefix))
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      month: m,
      sales: monthBookingsSales,
      collection: monthReceiptsCol
    };
  });

  // Pie Chart Data: Plot Inventory Breakdown
  const inventoryPieData = [
    { name: isBn ? 'Available' : 'Available', value: availablePlots, color: '#10b981' },
    { name: isBn ? 'Booked' : 'Booked', value: bookedPlots, color: '#eab308' },
    { name: isBn ? 'Sold' : 'Sold', value: soldPlots, color: '#ef4444' },
    { name: isBn ? 'Reserved' : 'Reserved', value: reservedPlots, color: '#3b82f6' },
  ];

  // Project-wise Comparison
  const projectComparisonData = projects.map(p => {
    const prjPlots = plots.filter(pl => pl.projectId === p.id);
    const prjBookings = bookings.filter(b => b.projectId === p.id);
    const prjSales = prjBookings.reduce((sum, b) => sum + b.finalPrice, 0);
    const prjCollection = receipts.filter(r => r.projectId === p.id).reduce((sum, r) => sum + r.amount, 0);

    return {
      name: p.code,
      fullName: p.name,
      budget: p.developmentBudget / 1000000, // In Millions BDT
      actualCost: (p.actualDevelopmentCost || 0) / 1000000,
      sales: prjSales / 1000000,
      collection: prjCollection / 1000000
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-black text-white">
              {isBn ? "চেয়ারম্যান ও সিইও ড্যাশবোর্ড" : "CEO & Executive Command Dashboard"}
            </h1>
            <span className="bg-gradient-to-r from-emerald-950 to-tayeeba-900 text-emerald-300 border border-emerald-500/50 text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-sm">
              v2.7 LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isBn ? "তৈয়্যবা হাউজিং লিঃ এর সকল প্রজেক্ট, সেলস, কাস্টমার কালেকশন ও একাউন্টসের লাইভ চিত্র" : "Real-time overview of housing projects, plot inventory, customer ledgers, sales targets & cash flow."}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setCurrentTab('projects')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-1.5"
          >
            <span>+ Add Project</span>
          </button>
          <button 
            onClick={() => setCurrentTab('bookings')}
            className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-1.5"
          >
            <span>+ New Booking</span>
          </button>
          <button 
            onClick={() => setCurrentTab('collections')}
            className="bg-gold-600 hover:bg-gold-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-1.5"
          >
            <span>+ Record Collection</span>
          </button>
        </div>
      </div>

      {/* Clean Slate Quickstart Guide */}
      {projects.length === 0 && (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40 flex-shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Clean Slate (v2.7) Ready for Live Production Data</h3>
              <p className="text-xs text-slate-300">
                The database is reset and ready. Begin by adding your actual housing projects (e.g. Tayeeba Smart City) and plot layouts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('projects')}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-1.5 flex-shrink-0"
          >
            <span>+ Create First Project</span>
          </button>
        </div>
      )}

      {/* Row 1: Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-tayeeba-500/50 transition">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isBn ? "মোট বিক্রয় মূল্য" : "Total Plot Sales"}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{formatBDT(totalSalesValue)}</h3>
            </div>
            <div className="p-3 bg-tayeeba-500/10 text-tayeeba-400 rounded-xl border border-tayeeba-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-[11px] text-tayeeba-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>{bookings.length} Bookings Recorded</span>
          </div>
        </div>

        {/* Total Collection */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isBn ? "মোট কালেকশন" : "Total Collections"}
              </span>
              <h3 className="text-xl font-bold text-emerald-400 mt-1">{formatBDT(totalCollections)}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
            <span>Monthly: <strong className="text-white">{formatBDT(monthlyCollection)}</strong></span>
            <span>Today: <strong className="text-emerald-400">{formatBDT(todayCollection)}</strong></span>
          </div>
        </div>

        {/* Total Outstanding Due */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/50 transition">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isBn ? "মোট বকেয়া (Customer Due)" : "Outstanding Customer Due"}
              </span>
              <h3 className="text-xl font-bold text-rose-400 mt-1">{formatBDT(totalOutstandingDue)}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-[11px] text-rose-400 font-medium">
            <span>Receivables across {customers.length} Customers</span>
          </div>
        </div>

        {/* Cash & Bank Balance */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-gold-500/50 transition">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isBn ? "ক্যাশ ও ব্যাংক ব্যালেন্স" : "Liquid Cash & Bank"}
              </span>
              <h3 className="text-xl font-bold text-gold-400 mt-1">{formatBDT(cashBalance + bankBalance)}</h3>
            </div>
            <div className="p-3 bg-gold-500/10 text-gold-400 rounded-xl border border-gold-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
            <span>Cash: <strong className="text-white">{formatBDT(cashBalance)}</strong></span>
            <span>Bank: <strong className="text-white">{formatBDT(bankBalance)}</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: Visual Plot Inventory Matrix & Main Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales & Collection Trend */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white">Monthly Sales & Collection Performance</h3>
              <p className="text-[11px] text-slate-400">Comparing gross plot bookings vs actual cash inflow (BDT)</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center text-tayeeba-400">
                <span className="w-2.5 h-2.5 bg-tayeeba-500 rounded-full mr-1.5 inline-block"></span> Sales
              </span>
              <span className="flex items-center text-gold-400">
                <span className="w-2.5 h-2.5 bg-gold-500 rounded-full mr-1.5 inline-block"></span> Collection
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: number) => [formatBDT(val)]}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="collection" stroke="#f59e0b" fillOpacity={1} fill="url(#colorColl)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot Inventory Status Pie */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-white">Plot Inventory Distribution</h3>
              <button 
                onClick={() => setCurrentTab('inventory')}
                className="text-xs text-tayeeba-400 hover:underline flex items-center"
              >
                <span>View Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Total {totalPlotsCount} plots registered across {projects.length} projects</p>
          </div>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {inventoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-700/60">
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-semibold">Available</span>
              <span className="font-extrabold text-white">{availablePlots}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-yellow-400 font-semibold">Booked</span>
              <span className="font-extrabold text-white">{bookedPlots}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-400 font-semibold">Sold</span>
              <span className="font-extrabold text-white">{soldPlots}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="text-blue-400 font-semibold">Reserved</span>
              <span className="font-extrabold text-white">{reservedPlots}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Project Budget vs Actual Expense & Top Dues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Development Cost Variance */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <h3 className="font-bold text-sm text-white mb-1">Project Budget vs Actual Development Expense</h3>
          <p className="text-[11px] text-slate-400 mb-4">Values formatted in Millions BDT (৳)</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="budget" name="Dev Budget (M)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualCost" name="Actual Cost (M)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overdue Customers List Widget */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-white">Overdue & Upcoming Customer Dues</h3>
              </div>
              <button 
                onClick={() => setCurrentTab('dues')}
                className="text-xs text-tayeeba-400 hover:underline flex items-center"
              >
                <span>View All Dues</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {customers.slice(0, 3).map(c => (
                <div key={c.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Plot {c.linkedPlotNumber || 'N/A'} • {c.linkedProjectName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-rose-400">{formatBDT(c.totalDue)}</div>
                    <div className="text-[10px] text-slate-400">Total Paid: {formatBDT(c.totalPaid)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Automated WhatsApp/SMS reminders configured</span>
            <button 
              onClick={() => setCurrentTab('dues')}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-3 py-1 rounded-lg text-xs font-semibold transition border border-rose-500/30"
            >
              Send Batch Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
