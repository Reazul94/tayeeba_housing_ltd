import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Plot, PlotStatus, DirectorPlotDistribution, ClientPlotDistribution } from '../../types/erp';
import { formatBDT } from '../../utils/pdfGenerator';
import { 
  LayoutGrid, MapPin, Users, FileText, Search, Filter, 
  Plus, Download, Printer, CheckCircle2, AlertCircle, 
  Compass, Eye, X, Building, ArrowUpRight, Check
} from 'lucide-react';

export const PlotManager: React.FC = () => {
  const { 
    plots, projects, directorPlotDistributions, clientPlotDistributions,
    addPlot, updatePlot, addDirectorPlotDistribution, addClientPlotDistribution,
    showToast, language
  } = useERP();

  const isBn = language === 'bn';

  // Sub-tabs based on Sections 16-21
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'details' | 'director-distribution' | 'client-distribution' | 'map'
  >('dashboard');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [blockFilter, setBlockFilter] = useState('ALL');

  // Modals
  const [showAddPlotModal, setShowAddPlotModal] = useState(false);
  const [showAddDirectorDistModal, setShowAddDirectorDistModal] = useState(false);
  const [showAddClientDistModal, setShowAddClientDistModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

  // Form States
  const [newPlot, setNewPlot] = useState({
    plotNumber: '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || 'Tayeeba Smart City',
    block: 'Block-A',
    zone: 'Zone-1',
    road: 'Road-01',
    sizeKatha: 5.0,
    facing: 'South' as Plot['facing'],
    perKathaPrice: 1500000,
    basePrice: 7500000,
    discount: 0,
    finalPrice: 7500000,
    status: 'Available' as PlotStatus
  });

  const [newDirDist, setNewDirDist] = useState({
    directorName: 'Al-Haj Engr. Tayeebur Rahman',
    directorCode: 'DIR-01',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || 'Tayeeba Smart City',
    block: 'Block-A',
    plotNumber: 'P-105',
    plotSize: 5.0,
    sizeUnit: 'Katha' as 'Katha' | 'Decimal',
    bookingDate: new Date().toISOString().split('T')[0],
    customerName: '',
    bookingValue: 7500000,
    paidAmount: 2500000,
    dueAmount: 5000000,
    status: 'Allotted' as const,
    remarks: ''
  });

  const [newCliDist, setNewCliDist] = useState({
    clientName: '',
    customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || 'Tayeeba Smart City',
    block: 'Block-A',
    plotNumber: '',
    plotSize: 5.0,
    sizeUnit: 'Katha' as 'Katha' | 'Decimal',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingValue: 7500000,
    paidAmount: 2000000,
    dueAmount: 5500000,
    installmentStatus: 'REGULAR' as const,
    salesExecutive: 'Kazi Farhan',
    bookingStatus: 'CONFIRMED' as const,
    remarks: ''
  });

  // Calculate live counts
  const totalPlots = plots.length || 2568;
  const availablePlots = plots.filter(p => p.status === 'Available').length || 444;
  const reservedPlots = plots.filter(p => p.status === 'Reserved').length || 100;
  const bookedPlots = plots.filter(p => p.status === 'Booked').length || 1248;
  const soldPlots = plots.filter(p => p.status === 'Sold').length || 876;
  const transferredPlots = plots.filter(p => p.status === 'Transferred').length || 0;
  const cancelledPlots = plots.filter(p => p.status === 'Cancelled').length || 0;

  // Filtered Plot list
  const filteredPlots = plots.filter(p => {
    const matchSearch = p.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.customerName && p.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchProject = projectFilter === 'ALL' || p.projectId === projectFilter;
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchBlock = blockFilter === 'ALL' || p.block === blockFilter;
    return matchSearch && matchProject && matchStatus && matchBlock;
  });

  const handleCreatePlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlot.plotNumber || !newPlot.finalPrice) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const prj = projects.find(p => p.id === newPlot.projectId);
    addPlot({
      ...newPlot,
      projectName: prj?.name || 'Tayeeba Smart City',
      basePrice: newPlot.finalPrice,
      perKathaPrice: Math.round(newPlot.finalPrice / newPlot.sizeKatha)
    });
    setShowAddPlotModal(false);
  };

  const handleCreateDirDist = (e: React.FormEvent) => {
    e.preventDefault();
    addDirectorPlotDistribution(newDirDist);
    setShowAddDirectorDistModal(false);
  };

  const handleCreateCliDist = (e: React.FormEvent) => {
    e.preventDefault();
    addClientPlotDistribution(newCliDist);
    setShowAddClientDistModal(false);
  };

  return (
    <div className="space-y-5 select-none">
      {/* ------------------------------------------------------------- */}
      {/* HEADER & SUB-NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#06231a] rounded-xl border border-[#c5a059]/40 text-[#c5a059] shadow-sm">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#073826]">
              PLOT MANAGEMENT MODULE
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Land Parcels, Distribution Matrix, Cadastral Maps &amp; Inventories
            </p>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          {[
            { id: 'dashboard', label: 'Plot Dashboard' },
            { id: 'details', label: 'Plot Details' },
            { id: 'director-distribution', label: 'Director Distribution' },
            { id: 'client-distribution', label: 'Client Distribution' },
            { id: 'map', label: 'Interactive Map' },
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
      {/* 1. PLOT DASHBOARD TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Plots</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalPlots.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Across All Blocks</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-200/90 shadow-sm bg-emerald-50/20">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Available</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{availablePlots.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Ready for Booking</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-amber-200/90 shadow-sm bg-amber-50/20">
              <div className="text-[11px] font-bold text-amber-700 uppercase">Reserved</div>
              <div className="text-2xl font-black text-amber-700 mt-1">{reservedPlots.toLocaleString()}</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Under Hold Period</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-orange-200/90 shadow-sm bg-orange-50/20">
              <div className="text-[11px] font-bold text-orange-700 uppercase">Booked</div>
              <div className="text-2xl font-black text-orange-700 mt-1">{bookedPlots.toLocaleString()}</div>
              <div className="text-[10px] text-orange-600 font-semibold mt-0.5">Installments Active</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-rose-200/90 shadow-sm bg-rose-50/20">
              <div className="text-[11px] font-bold text-rose-700 uppercase">Sold</div>
              <div className="text-2xl font-black text-rose-700 mt-1">{soldPlots.toLocaleString()}</div>
              <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Deed Registered</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-blue-200/90 shadow-sm bg-blue-50/20">
              <div className="text-[11px] font-bold text-blue-700 uppercase">Transferred</div>
              <div className="text-2xl font-black text-blue-700 mt-1">{transferredPlots.toLocaleString()}</div>
              <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Ownership Updated</div>
            </div>
          </div>

          {/* Distribution & Value Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Value Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-[#073826]">PLOT VALUATION SUMMARY</h3>
                <span className="text-xs font-mono font-bold text-[#c5a059]">BDT (৳)</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Total Valuation</span>
                  <span className="font-bold font-mono text-slate-900">৳ 1,92,60,00,000</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Booked Plot Value</span>
                  <span className="font-bold font-mono text-orange-600">৳ 93,60,00,000</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Sold Plot Value</span>
                  <span className="font-bold font-mono text-rose-600">৳ 65,70,00,000</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Available Inventory Value</span>
                  <span className="font-bold font-mono text-emerald-600">৳ 33,30,00,000</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold">
                  <span className="text-slate-800">Total Receivable from Bookings</span>
                  <span className="font-black font-mono text-teal-700 text-sm">৳ 45,68,900</span>
                </div>
              </div>
            </div>

            {/* Quick Actions to Details / Lists */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-[#073826]">PROJECT-WISE PLOT DISTRIBUTION</h3>
                  <button 
                    onClick={() => setActiveTab('details')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <span>View All Plots</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    { name: 'Tayeeba Smart City', code: 'PRJ-TSC-001', plots: 1200, booked: 620, sold: 410, available: 170 },
                    { name: 'Tayeeba Riverside Valley', code: 'PRJ-TRV-002', plots: 850, booked: 430, sold: 320, available: 100 },
                    { name: 'Tayeeba Garden Resort City', code: 'PRJ-TGR-003', plots: 518, booked: 198, sold: 146, available: 174 },
                  ].map((prj, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="font-bold text-xs text-[#073826]">{prj.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{prj.code}</div>
                      <div className="text-xs space-y-1 pt-1 border-t border-slate-200">
                        <div className="flex justify-between"><span>Total:</span> <strong className="font-mono">{prj.plots}</strong></div>
                        <div className="flex justify-between text-orange-600"><span>Booked:</span> <strong className="font-mono">{prj.booked}</strong></div>
                        <div className="flex justify-between text-rose-600"><span>Sold:</span> <strong className="font-mono">{prj.sold}</strong></div>
                        <div className="flex justify-between text-emerald-600"><span>Available:</span> <strong className="font-mono">{prj.available}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowAddPlotModal(true)}
                  className="px-4 py-2 bg-[#06231a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#093322]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Plot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. PLOT DETAILS TAB (Section 18) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#073826]">ALL PLOT INVENTORY &amp; DETAILS</h3>
              <p className="text-xs text-slate-500">Filter, edit, view and manage plots across all active projects</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAddPlotModal(true)}
                className="px-3.5 py-1.5 bg-[#06231a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Plot</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search plot number, block, customer..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Booked">Booked</option>
              <option value="Sold">Sold</option>
              <option value="Transferred">Transferred</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={blockFilter}
              onChange={e => setBlockFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold"
            >
              <option value="ALL">All Blocks</option>
              <option value="Block-A">Block-A</option>
              <option value="Block-B">Block-B</option>
              <option value="Block-C">Block-C</option>
              <option value="Block-D">Block-D</option>
            </select>
          </div>

          {/* Plots Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#06231a] text-[#c5a059] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Plot No</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Block / Road</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Facing / Corner</th>
                  <th className="p-3">Total Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Customer / Allotment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlots.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No plots matching search query. Click <strong>Add Plot</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  filteredPlots.map(p => (
                    <tr key={p.id} className="hover:bg-emerald-50/40 transition">
                      <td className="p-3 font-bold font-mono text-[#073826]">{p.plotNumber}</td>
                      <td className="p-3 font-semibold text-slate-700">{p.projectName || 'Tayeeba Smart City'}</td>
                      <td className="p-3">{p.block} / {p.road}</td>
                      <td className="p-3 font-mono font-bold">{p.sizeKatha} Katha</td>
                      <td className="p-3">{p.facing}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{formatBDT(p.finalPrice)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          p.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'Booked' ? 'bg-orange-100 text-orange-700' :
                          p.status === 'Sold' ? 'bg-rose-100 text-rose-700' :
                          p.status === 'Reserved' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{p.customerName || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. DIRECTOR PLOT BOOKING DISTRIBUTION (Section 20) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'director-distribution' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#073826]">DIRECTOR PLOT BOOKING DISTRIBUTION LIST</h3>
              <p className="text-xs text-slate-500">Track and monitor plot quotas and distribution allocated to directors</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowAddDirectorDistModal(true)}
                className="px-3.5 py-1.5 bg-[#06231a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Director Allotment</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#06231a] text-[#c5a059] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Director Name</th>
                  <th className="p-3">Project / Block</th>
                  <th className="p-3">Plot Number</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Customer (Client)</th>
                  <th className="p-3">Booking Value</th>
                  <th className="p-3">Paid Amount</th>
                  <th className="p-3">Due Balance</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {directorPlotDistributions.map(d => (
                  <tr key={d.id} className="hover:bg-emerald-50/40 transition">
                    <td className="p-3 font-bold text-[#073826]">{d.directorName}</td>
                    <td className="p-3">{d.projectName} ({d.block})</td>
                    <td className="p-3 font-mono font-bold">{d.plotNumber}</td>
                    <td className="p-3">{d.plotSize} {d.sizeUnit}</td>
                    <td className="p-3 text-slate-700">{d.customerName || 'Direct Booking'}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{formatBDT(d.bookingValue)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{formatBDT(d.paidAmount)}</td>
                    <td className="p-3 font-mono font-bold text-amber-700">{formatBDT(d.dueAmount)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {d.status}
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
      {/* 4. CLIENT PLOT BOOKING DISTRIBUTION (Section 21) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'client-distribution' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#073826]">CLIENT PLOT BOOKING DISTRIBUTION LIST</h3>
              <p className="text-xs text-slate-500">Client-wise booking schedules, paid amounts, dues and assigned sales executives</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAddClientDistModal(true)}
                className="px-3.5 py-1.5 bg-[#06231a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Client Allotment</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#06231a] text-[#c5a059] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Client Name</th>
                  <th className="p-3">Customer ID</th>
                  <th className="p-3">Project / Block</th>
                  <th className="p-3">Plot No</th>
                  <th className="p-3">Booking Value</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Sales Executive</th>
                  <th className="p-3">Installment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientPlotDistributions.map(c => (
                  <tr key={c.id} className="hover:bg-emerald-50/40 transition">
                    <td className="p-3 font-bold text-[#073826]">{c.clientName}</td>
                    <td className="p-3 font-mono text-slate-600">{c.customerId}</td>
                    <td className="p-3">{c.projectName} ({c.block})</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{c.plotNumber}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{formatBDT(c.bookingValue)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{formatBDT(c.paidAmount)}</td>
                    <td className="p-3 font-mono font-bold text-amber-700">{formatBDT(c.dueAmount)}</td>
                    <td className="p-3 text-slate-700 font-semibold">{c.salesExecutive}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800">
                        {c.installmentStatus}
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
      {/* 5. INTERACTIVE COLOR-CODED PLOT MAP (Section 19) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#073826]">INTERACTIVE CADASTRAL PLOT MAP</h3>
              <p className="text-xs text-slate-500">Live graphical layout of residential blocks, roads and plot status</p>
            </div>
            {/* Color Legend */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500"></span> Reserved</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500"></span> Booked</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500"></span> Sold</span>
            </div>
          </div>

          {/* Interactive Cadastral Canvas */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/5 via-slate-50 to-teal-950/5 border border-emerald-500/20">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-3">
              {Array.from({ length: 40 }).map((_, idx) => {
                const pNum = `P-${101 + idx}`;
                const status = idx % 5 === 0 ? 'Sold' : idx % 3 === 0 ? 'Booked' : idx % 7 === 0 ? 'Reserved' : 'Available';
                const colorClass = 
                  status === 'Available' ? 'bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100' :
                  status === 'Reserved' ? 'bg-amber-50 border-amber-400 text-amber-800 hover:bg-amber-100' :
                  status === 'Booked' ? 'bg-orange-50 border-orange-400 text-orange-800 hover:bg-orange-100' :
                  'bg-rose-50 border-rose-400 text-rose-800 hover:bg-rose-100';

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      showToast(`Plot ${pNum} (${status}) - 5.0 Katha - BDT 75,00,000`, 'info', 'Plot Details');
                    }}
                    className={`p-3 rounded-xl border-2 text-center transition shadow-sm ${colorClass}`}
                  >
                    <div className="text-xs font-black font-mono">{pNum}</div>
                    <div className="text-[10px] font-bold mt-1 uppercase tracking-tight">{status}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">5.0 K</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADD PLOT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showAddPlotModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#073826]">Add New Plot</h3>
              <button onClick={() => setShowAddPlotModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plot Number *</label>
                  <input
                    type="text"
                    required
                    value={newPlot.plotNumber}
                    onChange={e => setNewPlot({ ...newPlot, plotNumber: e.target.value })}
                    placeholder="e.g. P-105"
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Block *</label>
                  <input
                    type="text"
                    required
                    value={newPlot.block}
                    onChange={e => setNewPlot({ ...newPlot, block: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Road</label>
                  <input
                    type="text"
                    value={newPlot.road}
                    onChange={e => setNewPlot({ ...newPlot, road: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Size (Katha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPlot.sizeKatha}
                    onChange={e => setNewPlot({ ...newPlot, sizeKatha: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Facing</label>
                  <select
                    value={newPlot.facing}
                    onChange={e => setNewPlot({ ...newPlot, facing: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    <option value="South">South</option>
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Price (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={newPlot.finalPrice}
                    onChange={e => setNewPlot({ ...newPlot, finalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={newPlot.status}
                    onChange={e => setNewPlot({ ...newPlot, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Booked">Booked</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlotModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#06231a] text-white rounded-xl font-bold hover:bg-[#093322]"
                >
                  Save Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DIRECTOR ALLOTMENT MODAL */}
      {showAddDirectorDistModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#073826]">Add Director Plot Allotment</h3>
              <button onClick={() => setShowAddDirectorDistModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDirDist} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Director Name</label>
                <input
                  type="text"
                  required
                  value={newDirDist.directorName}
                  onChange={e => setNewDirDist({ ...newDirDist, directorName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plot Number</label>
                  <input
                    type="text"
                    required
                    value={newDirDist.plotNumber}
                    onChange={e => setNewDirDist({ ...newDirDist, plotNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Size (Katha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDirDist.plotSize}
                    onChange={e => setNewDirDist({ ...newDirDist, plotSize: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Booking Value</label>
                  <input
                    type="number"
                    value={newDirDist.bookingValue}
                    onChange={e => setNewDirDist({ ...newDirDist, bookingValue: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Paid Amount</label>
                  <input
                    type="number"
                    value={newDirDist.paidAmount}
                    onChange={e => setNewDirDist({ ...newDirDist, paidAmount: parseFloat(e.target.value) || 0, dueAmount: newDirDist.bookingValue - (parseFloat(e.target.value) || 0) })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDirectorDistModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#06231a] text-white rounded-xl font-bold">
                  Save Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CLIENT ALLOTMENT MODAL */}
      {showAddClientDistModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#073826]">Add Client Plot Allotment</h3>
              <button onClick={() => setShowAddClientDistModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCliDist} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={newCliDist.clientName}
                  onChange={e => setNewCliDist({ ...newCliDist, clientName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newCliDist.phone}
                    onChange={e => setNewCliDist({ ...newCliDist, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plot Number</label>
                  <input
                    type="text"
                    required
                    value={newCliDist.plotNumber}
                    onChange={e => setNewCliDist({ ...newCliDist, plotNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Booking Value</label>
                  <input
                    type="number"
                    value={newCliDist.bookingValue}
                    onChange={e => setNewCliDist({ ...newCliDist, bookingValue: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Paid Amount</label>
                  <input
                    type="number"
                    value={newCliDist.paidAmount}
                    onChange={e => setNewCliDist({ ...newCliDist, paidAmount: parseFloat(e.target.value) || 0, dueAmount: newCliDist.bookingValue - (parseFloat(e.target.value) || 0) })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientDistModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#06231a] text-white rounded-xl font-bold">
                  Save Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
