import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Plot, PlotStatus } from '../../types/erp';
import { formatBDT } from '../../utils/pdfGenerator';
import { 
  Building, Filter, Search, CheckCircle, Info, X, 
  User, DollarSign, Calendar, FileText, ArrowRight, RefreshCw 
} from 'lucide-react';

export const PlotInventoryMap: React.FC = () => {
  const { 
    plots, projects, customers, bookings, 
    setCurrentTab, language 
  } = useERP();

  const isBn = language === 'bn';

  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [plotSearch, setPlotSearch] = useState<string>('');
  const [activePlot, setActivePlot] = useState<Plot | null>(null);

  // Filtered Plots
  const filteredPlots = plots.filter(p => {
    if (selectedProjectId !== 'ALL' && p.projectId !== selectedProjectId) return false;
    if (selectedBlock !== 'ALL' && p.block !== selectedBlock) return false;
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (plotSearch && !p.plotNumber.toLowerCase().includes(plotSearch.toLowerCase()) && !p.projectName.toLowerCase().includes(plotSearch.toLowerCase())) return false;
    return true;
  });

  // Plot Status Styling Helper
  const getPlotBadge = (status: PlotStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30';
      case 'Booked':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30';
      case 'Sold':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30';
      case 'Reserved':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30';
      case 'Cancelled':
      case 'On Hold':
        return 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const getStatusColorDot = (status: PlotStatus) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500';
      case 'Booked': return 'bg-amber-500';
      case 'Sold': return 'bg-rose-500';
      case 'Reserved': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const activeCustomer = activePlot?.customerId ? customers.find(c => c.id === activePlot.customerId) : null;
  const activeBooking = activePlot?.id ? bookings.find(b => b.plotId === activePlot.id) : null;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <Building className="w-5 h-5 text-tayeeba-400" />
              <span>{isBn ? "প্লট ইনভেন্টরি ও ইন্টারেক্টিভ ম্যাপ" : "Visual Plot Inventory & Layout Map"}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isBn ? "সকল প্রজেক্টের প্লটের কালার-কোডেড স্থিতি, সাইজ, কাস্টমার বুকিং ও আর্থিক অবস্থা" : "Color-coded interactive property map grid with live customer & booking details."}
            </p>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span>
              <span>Available</span>
            </span>
            <span className="flex items-center space-x-1.5 text-amber-400">
              <span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span>
              <span>Booked</span>
            </span>
            <span className="flex items-center space-x-1.5 text-rose-400">
              <span className="w-3 h-3 bg-rose-500 rounded-full inline-block"></span>
              <span>Sold</span>
            </span>
            <span className="flex items-center space-x-1.5 text-blue-400">
              <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
              <span>Reserved</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-3 h-3 bg-slate-500 rounded-full inline-block"></span>
              <span>Cancelled/Hold</span>
            </span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-700/60">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              value={plotSearch}
              onChange={(e) => setPlotSearch(e.target.value)}
              placeholder="Search Plot No (e.g. A-101)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-tayeeba-500"
            />
          </div>

          {/* Project Filter */}
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-tayeeba-500"
          >
            <option value="ALL">All Projects ({projects.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>

          {/* Block Filter */}
          <select 
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-tayeeba-500"
          >
            <option value="ALL">All Blocks</option>
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
            <option value="Block C">Block C</option>
          </select>

          {/* Status Filter */}
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-tayeeba-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available">Available (Green)</option>
            <option value="Booked">Booked (Yellow)</option>
            <option value="Sold">Sold (Red)</option>
            <option value="Reserved">Reserved (Blue)</option>
            <option value="Cancelled">Cancelled (Grey)</option>
          </select>
        </div>
      </div>

      {/* Plot Grid Map */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400">
            Showing {filteredPlots.length} of {plots.length} total plots
          </span>
          <span className="text-xs text-tayeeba-400 font-medium">Click any plot card to view details</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredPlots.map(plot => (
            <button
              key={plot.id}
              onClick={() => setActivePlot(plot)}
              className={`p-3.5 rounded-xl border transition-all text-left relative group shadow-md flex flex-col justify-between h-28 ${getPlotBadge(plot.status)}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-extrabold text-sm tracking-tight">{plot.plotNumber}</div>
                  <div className="text-[10px] opacity-80">{plot.block}</div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${getStatusColorDot(plot.status)}`}></span>
              </div>

              <div>
                <div className="text-xs font-bold">{plot.sizeKatha} Katha</div>
                <div className="text-[10px] opacity-75">{plot.facing}</div>
              </div>

              <div className="text-[10px] font-extrabold text-right border-t border-current/20 pt-1">
                {formatBDT(plot.finalPrice)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Plot Information Modal */}
      {activePlot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPlotBadge(activePlot.status)}`}>
                  {activePlot.status.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Plot {activePlot.plotNumber}</h3>
                  <p className="text-xs text-slate-400">{activePlot.projectName} • {activePlot.block}</p>
                </div>
              </div>
              <button 
                onClick={() => setActivePlot(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Plot Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Plot Size</span>
                  <strong className="text-white text-sm">{activePlot.sizeKatha} Katha</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Facing Direction</span>
                  <strong className="text-white text-sm">{activePlot.facing}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Per Katha Price</span>
                  <strong className="text-white text-sm">{formatBDT(activePlot.perKathaPrice)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Final Plot Price</span>
                  <strong className="text-tayeeba-400 text-sm">{formatBDT(activePlot.finalPrice)}</strong>
                </div>
              </div>

              {/* Road & Zone Info */}
              <div className="text-xs text-slate-300 space-y-1">
                <div><span className="text-slate-400">Road Layout:</span> {activePlot.road}</div>
                <div><span className="text-slate-400">Zone / Section:</span> {activePlot.zone}</div>
              </div>

              {/* Customer & Financial Status if Booked or Sold */}
              {activeCustomer && (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-tayeeba-600/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <span className="text-xs font-bold text-tayeeba-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <User className="w-4 h-4" />
                      <span>Customer & Payment Status</span>
                    </span>
                    <span className="text-xs text-slate-400">ID: {activeCustomer.customerId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Customer Name</span>
                      <strong className="text-white font-bold">{activeCustomer.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Mobile Number</span>
                      <strong className="text-white font-bold">{activeCustomer.mobile}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Paid Amount</span>
                      <strong className="text-emerald-400 font-bold">{formatBDT(activeCustomer.totalPaid)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Outstanding Due</span>
                      <strong className="text-rose-400 font-bold">{formatBDT(activeCustomer.totalDue)}</strong>
                    </div>
                  </div>

                  {/* Payment Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Payment Completion</span>
                      <span className="font-bold text-white">
                        {Math.round((activeCustomer.totalPaid / activePlot.finalPrice) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round((activeCustomer.totalPaid / activePlot.finalPrice) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-end gap-3">
              {activePlot.status === 'Available' && (
                <button
                  onClick={() => {
                    setActivePlot(null);
                    setCurrentTab('bookings');
                  }}
                  className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
                >
                  Proceed to Book Plot
                </button>
              )}

              {activeCustomer && (
                <button
                  onClick={() => {
                    setActivePlot(null);
                    setCurrentTab('collections');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
                >
                  Record Payment
                </button>
              )}

              <button
                onClick={() => setActivePlot(null)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
