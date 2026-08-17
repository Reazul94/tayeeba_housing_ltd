import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Lead, LeadStatus, SiteVisit, Customer } from '../../types/erp';
import { formatBDT, generateCustomerLedgerPDF } from '../../utils/pdfGenerator';
import { 
  Users, UserPlus, Calendar, Phone, Mail, MapPin, 
  Search, CheckCircle2, Clock, FileText, Download, Plus 
} from 'lucide-react';

export const CRMManager: React.FC = () => {
  const { 
    leads, siteVisits, customers, receipts, projects, 
    addLead, addSiteVisit, language, showToast 
  } = useERP();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'leads' | 'siteVisits' | 'customers'>('leads');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // New Lead Modal
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSource, setLeadSource] = useState<Lead['source']>('Facebook');
  const [leadBudget, setLeadBudget] = useState(5000000);
  const [leadProject, setLeadProject] = useState(projects[0]?.id || '');

  // New Site Visit Modal
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [visitClientName, setVisitClientName] = useState('');
  const [visitClientPhone, setVisitClientPhone] = useState('');
  const [visitDate, setVisitDate] = useState('2026-08-18');
  const [visitTime, setVisitTime] = useState('11:00 AM');

  const leadStages: LeadStatus[] = [
    'New', 'Contacted', 'Interested', 'Site Visit Scheduled', 
    'Site Visit Completed', 'Negotiation', 'Booked', 'Converted', 'Lost'
  ];

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    const prj = projects.find(p => p.id === leadProject);
    addLead({
      name: leadName,
      phone: leadPhone,
      email: leadEmail || `${leadName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      source: leadSource,
      interestedProjectId: leadProject,
      interestedProjectName: prj ? prj.name : 'Tayeeba Smart City',
      interestedPlotSizeKatha: 5.0,
      budget: leadBudget,
      assignedSalesExecutiveId: 'USR-05',
      assignedSalesExecutiveName: 'Rafiqul Islam',
      status: 'New',
      followUpDate: new Date().toISOString().split('T')[0],
      notes: 'New inquiry registered'
    });
    showToast("New Lead registered successfully!", 'success', 'Lead Created');
    setShowAddLeadModal(false);
    setLeadName('');
    setLeadPhone('');
  };

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const prj = projects.find(p => p.id === leadProject);
    addSiteVisit({
      clientName: visitClientName,
      clientPhone: visitClientPhone,
      visitDate: visitDate,
      visitTime: visitTime,
      salesExecutiveId: 'USR-05',
      salesExecutiveName: 'Rafiqul Islam',
      projectId: leadProject,
      projectName: prj ? prj.name : 'Tayeeba Smart City',
      interestedPlotNumber: 'A-101',
      remarks: 'Scheduled site visit transport arranged.',
      followUpDate: visitDate,
      status: 'Scheduled'
    });
    showToast("Site Visit scheduled successfully!", 'success', 'Visit Scheduled');
    setShowAddVisitModal(false);
    setVisitClientName('');
  };

  const selectedCustomerObj = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "কাস্টমার সম্পর্ক ও সেলস লিড (CRM)" : "Customer Relationship & Lead Management"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "লিড পাইপলাইন, সাইট ভিজিট শিডিউল ও কাস্টমার ৩৬০° অ্যাকাউন্টস প্রোফাইল" : "Lead funnel pipeline, site visit scheduling & customer 360 degree profile with account statements."}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'leads' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Leads Pipeline ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('siteVisits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'siteVisits' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Site Visits ({siteVisits.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'customers' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Customers ({customers.length})
          </button>
        </div>
      </div>

      {/* 1. LEADS PIPELINE */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-white">Sales Pipeline Stages</h3>
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register New Lead</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto">
            {leadStages.map(stage => {
              const stageLeads = leads.filter(l => l.status === stage);
              return (
                <div key={stage} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 shadow space-y-3 min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="text-xs font-bold text-slate-300">{stage}</span>
                    <span className="bg-slate-900 text-tayeeba-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-700">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stageLeads.map(l => (
                      <div key={l.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/60 text-xs space-y-1.5 hover:border-tayeeba-500/50 transition">
                        <div className="font-bold text-white">{l.name}</div>
                        <div className="text-slate-400 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{l.phone}</span>
                        </div>
                        <div className="text-[10px] text-tayeeba-400 font-semibold">{l.interestedProjectName}</div>
                        <div className="text-[10px] text-slate-400">Budget: {formatBDT(l.budget)}</div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-[11px] text-slate-500 text-center py-4 italic">No leads in stage</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SITE VISITS MANAGER */}
      {activeTab === 'siteVisits' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-white">Scheduled Project Site Visits</h3>
            <button
              onClick={() => setShowAddVisitModal(true)}
              className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>+ Schedule Site Visit</span>
            </button>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
                  <th className="p-3">Client Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Visit Date & Time</th>
                  <th className="p-3">Project & Plot</th>
                  <th className="p-3">Sales Executive</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {siteVisits.map(v => (
                  <tr key={v.id} className="hover:bg-slate-700/40 text-slate-200">
                    <td className="p-3 font-bold text-white">{v.clientName}</td>
                    <td className="p-3 text-slate-300">{v.clientPhone}</td>
                    <td className="p-3 text-tayeeba-400 font-semibold">{v.visitDate} ({v.visitTime})</td>
                    <td className="p-3">{v.projectName} (Plot {v.interestedPlotNumber})</td>
                    <td className="p-3">{v.salesExecutiveName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CUSTOMER 360 PROFILE & STATEMENT */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Directory */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-extrabold text-sm text-white border-b border-slate-700 pb-2">
              Customer Directory ({customers.length})
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {customers.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    selectedCustomerId === c.id 
                      ? 'bg-tayeeba-950 border-tayeeba-500 text-white shadow-md' 
                      : 'bg-slate-900 border-slate-700/70 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-extrabold text-white text-sm">{c.name}</div>
                  <div className="text-[10px] text-tayeeba-400">ID: {c.customerId}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Mobile: {c.mobile} | NID: {c.nid}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Plot: {c.linkedPlotNumber || 'N/A'} ({c.linkedProjectName || 'N/A'})</div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer 360 Detail View */}
          <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg space-y-5">
            {selectedCustomerObj ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700 pb-4 gap-3">
                  <div>
                    <span className="text-xs bg-tayeeba-500/20 text-tayeeba-400 px-2.5 py-0.5 rounded-full font-bold">
                      {selectedCustomerObj.customerId}
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-1">{selectedCustomerObj.name}</h2>
                    <p className="text-xs text-slate-400">{selectedCustomerObj.profession}</p>
                  </div>

                  <button
                    onClick={() => generateCustomerLedgerPDF(selectedCustomerObj, receipts)}
                    className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center space-x-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Ledger PDF</span>
                  </button>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Father / Husband</span>
                    <strong className="text-white">{selectedCustomerObj.fatherMotherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Mobile Number</span>
                    <strong className="text-white">{selectedCustomerObj.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">NID Number</span>
                    <strong className="text-white">{selectedCustomerObj.nid}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Present Address</span>
                    <strong className="text-white">{selectedCustomerObj.presentAddress}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nominee Name</span>
                    <strong className="text-white">{selectedCustomerObj.nomineeName} ({selectedCustomerObj.nomineeRelation})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Sales Executive</span>
                    <strong className="text-tayeeba-400">{selectedCustomerObj.salesExecutiveName}</strong>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Plot Value</span>
                    <strong className="text-white text-sm font-extrabold">{formatBDT(selectedCustomerObj.totalPlotValue)}</strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="text-emerald-400 text-[10px] uppercase font-bold block">Total Paid</span>
                    <strong className="text-emerald-400 text-sm font-extrabold">{formatBDT(selectedCustomerObj.totalPaid)}</strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="text-rose-400 text-[10px] uppercase font-bold block">Outstanding Due</span>
                    <strong className="text-rose-400 text-sm font-extrabold">{formatBDT(selectedCustomerObj.totalDue)}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Select a customer from directory to view full 360° profile & account statement.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-2">Register Lead</h3>
            <form onSubmit={handleSaveLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Client Name *</label>
                <input type="text" required value={leadName} onChange={(e) => setLeadName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Mobile Number *</label>
                <input type="text" required value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Budget (BDT)</label>
                <input type="number" value={leadBudget} onChange={(e) => setLeadBudget(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddLeadModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-tayeeba-600 text-white font-bold px-4 py-2 rounded-xl">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
