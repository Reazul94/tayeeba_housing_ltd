import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Building2, Users, Network, ArrowRightLeft, History, Check, 
  AlertCircle, ChevronRight, Briefcase, Plus, UserCheck, Shield
} from 'lucide-react';

export const OrganogramManager: React.FC = () => {
  const { 
    designationsList, designationHistories, usersList, employees, 
    transferEmployee, language 
  } = useERP();

  const isBn = language === 'bn';

  const [activeSubTab, setActiveSubTab] = useState<'hierarchy' | 'transfer' | 'history'>('hierarchy');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [targetDesigId, setTargetDesigId] = useState('');
  const [targetDept, setTargetDept] = useState('');
  const [hasPendingTasks, setHasPendingTasks] = useState(false);
  const [transferMsg, setTransferMsg] = useState<{ success: boolean; text: string } | null>(null);

  const divisions = [
    { name: 'Executive & Strategic', departments: ['Board of Directors', 'Executive Management'] },
    { name: 'Commercial & Sales', departments: ['Sales & Marketing', 'Customer Relations'] },
    { name: 'Finance & Accounts', departments: ['Accounts & Finance', 'Audit & Compliance'] },
    { name: 'Operations & Engineering', departments: ['Engineering & Development', 'Land Acquisition'] },
    { name: 'HR & Administration', departments: ['Human Resources', 'Administration'] }
  ];

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !targetDesigId || !targetDept) return;

    if (hasPendingTasks) {
      setTransferMsg({
        success: false,
        text: 'TRANSFER BLOCKED: Employee has pending approval tasks / active unvetted bookings and cannot be transferred until resolved.'
      });
      return;
    }

    const res = transferEmployee(selectedUserId, targetDesigId, targetDept);
    if (res.success) {
      setTransferMsg({
        success: true,
        text: 'Employee successfully transferred! Previous active designation marked TRANSFERRED and historical record preserved.'
      });
      setSelectedUserId('');
      setTargetDesigId('');
      setTargetDept('');
    } else {
      setTransferMsg({ success: false, text: res.error || 'Transfer failed.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Network className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "অরগানোগ্রাম ও পদবি ব্যবস্থাপনা" : "Corporate Organogram & Designation Hierarchy"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? "কোম্পানি বিভাগ, ডিপার্টমেন্ট ও পদবি স্তর বিন্যাস এবং বদলি ইতিহাস" : "Multi-level organizational organogram, designation tracking, and employee transfer management."}
          </p>
        </div>

        <div className="flex space-x-1 bg-slate-900 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'hierarchy' ? 'bg-tayeeba-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Organogram Tree
          </button>
          <button
            onClick={() => setActiveSubTab('transfer')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'transfer' ? 'bg-tayeeba-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Employee Transfer
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'history' ? 'bg-tayeeba-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Transfer History ({designationHistories.length})
          </button>
        </div>
      </div>

      {transferMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-start space-x-2 border animate-fadeIn ${
          transferMsg.success ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        }`}>
          {transferMsg.success ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
          <span>{transferMsg.text}</span>
        </div>
      )}

      {/* SUBTAB 1: ORGANOGRAM HIERARCHY TREE */}
      {activeSubTab === 'hierarchy' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl text-center">
            <div className="inline-block px-5 py-2.5 bg-gradient-to-r from-tayeeba-700 to-tayeeba-800 text-white font-extrabold text-sm rounded-2xl border-2 border-gold-400/60 shadow-lg">
              TAYEEBA HOUSING LTD. — CORPORATE BOARD & EXECUTIVE
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 text-left text-xs">
              {divisions.map((div, i) => (
                <div key={i} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="font-extrabold text-gold-400 text-xs uppercase tracking-wider border-b border-slate-700 pb-2">
                    {div.name}
                  </div>

                  <div className="space-y-2">
                    {div.departments.map(dept => {
                      const desigsInDept = designationsList.filter(d => d.department === dept);
                      return (
                        <div key={dept} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                          <span className="font-bold text-white text-xs block">{dept}</span>
                          <div className="space-y-1 pt-1">
                            {desigsInDept.map(d => (
                              <div key={d.designationId} className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                                <span className="w-1.5 h-1.5 bg-tayeeba-400 rounded-full"></span>
                                <span>{d.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: EMPLOYEE TRANSFER WIZARD */}
      {activeSubTab === 'transfer' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 max-w-2xl mx-auto shadow-xl space-y-4 text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4 text-tayeeba-400" />
              <span>Employee Transfer & Re-Designation Process</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Transfers preserve full historical designation assignments and prevent orphaned pending approvals.
            </p>
          </div>

          <form onSubmit={handleExecuteTransfer} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Select Employee to Transfer</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                required
              >
                <option value="">-- Choose Employee --</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.userId || u.id}>
                    {u.name} ({u.userId || u.employeeCode}) — Current: {u.designationTitle || 'Officer'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">New Target Department</label>
                <input
                  type="text"
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  placeholder="e.g. Accounts & Finance"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">New Designation</label>
                <select
                  value={targetDesigId}
                  onChange={(e) => setTargetDesigId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                >
                  <option value="">-- Choose Designation --</option>
                  {designationsList.map(d => (
                    <option key={d.designationId} value={d.designationId}>{d.name} (Level {d.level})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pending Tasks Checkbox (Simulation) */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center space-x-2">
              <input
                type="checkbox"
                id="pendingCheck"
                checked={hasPendingTasks}
                onChange={(e) => setHasPendingTasks(e.target.checked)}
                className="accent-rose-500 w-4 h-4 rounded"
              />
              <label htmlFor="pendingCheck" className="text-[11px] text-slate-300 cursor-pointer">
                Simulate: Employee has active unresolved approval tasks (will block transfer)
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg transition"
              >
                Execute Transfer & Record History
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 3: TRANSFER HISTORY AUDIT LOG */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Effective Date</th>
                <th className="py-3.5 px-4">Employee Code</th>
                <th className="py-3.5 px-4">Designation Assigned</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {designationHistories.map(dh => (
                <tr key={dh.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-slate-300">{dh.startDate}</td>
                  <td className="py-3 px-4 font-mono text-tayeeba-300 font-bold">{dh.employeeCode}</td>
                  <td className="py-3 px-4 font-bold text-white">{dh.designationTitle}</td>
                  <td className="py-3 px-4 text-slate-300">{dh.department}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      dh.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {dh.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{dh.assignedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
