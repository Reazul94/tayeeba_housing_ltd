import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Employee } from '../../types/erp';
import { formatBDT, generateSalarySlipPDF } from '../../utils/pdfGenerator';
import { UserCheck, Plus, Download, Printer, DollarSign, Calendar } from 'lucide-react';

export const HRManager: React.FC = () => {
  const { 
    employees, payrolls, processPayroll, addEmployee, 
    language, showToast 
  } = useERP();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'employees' | 'payroll'>('payroll');
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);

  const [empName, setEmpName] = useState('');
  const [empDept, setEmpDept] = useState<Employee['department']>('Sales');
  const [empDesig, setEmpDesig] = useState('Sales Executive');
  const [empSalary, setEmpSalary] = useState(45000);
  const [empPhone, setEmpPhone] = useState('01700000000');

  const handleSaveEmp = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee({
      name: empName,
      department: empDept,
      designation: empDesig,
      joiningDate: new Date().toISOString().split('T')[0],
      baseSalary: empSalary,
      phone: empPhone,
      email: `${empName.toLowerCase().replace(/\s+/g, '')}@tayeebahousing.com`,
      status: 'Active'
    });
    showToast(`Employee ${empName} added successfully!`, 'success', 'Employee Created');
    setShowAddEmpModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "এইচআর ও পে-রোল ম্যানেজমেন্ট" : "Human Resources & Payroll Management"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "এমপ্লয়ি ডিরেক্টরি, মাসিক সেলারি শিট প্রসেসিং ও স্যালারি স্লিপ জেনারেটর" : "Manage staff, process monthly salary sheets & issue automated PDF salary slips."}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => processPayroll('August', 2026)}
            className="bg-gold-600 hover:bg-gold-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow"
          >
            Process Aug 2026 Payroll
          </button>
          <button
            onClick={() => setShowAddEmpModal(true)}
            className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'payroll' ? 'bg-tayeeba-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Payroll Sheet ({payrolls.length})
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'employees' ? 'bg-tayeeba-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Employee Directory ({employees.length})
        </button>
      </div>

      {activeTab === 'payroll' ? (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
                <th className="p-3">Employee</th>
                <th className="p-3">Department</th>
                <th className="p-3">Pay Period</th>
                <th className="p-3">Base Gross</th>
                <th className="p-3">Commissions</th>
                <th className="p-3">Net Paid</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {payrolls.map(p => (
                <tr key={p.id} className="hover:bg-slate-700/40 text-slate-200">
                  <td className="p-3 font-bold text-white">{p.employeeName}</td>
                  <td className="p-3 text-slate-400">{p.department}</td>
                  <td className="p-3 font-semibold text-tayeeba-400">{p.month} {p.year}</td>
                  <td className="p-3 font-bold">{formatBDT(p.baseSalary)}</td>
                  <td className="p-3 text-emerald-400 font-bold">+{formatBDT(p.commissionBonus)}</td>
                  <td className="p-3 font-extrabold text-gold-400 text-sm">{formatBDT(p.netSalary)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => generateSalarySlipPDF(p)}
                      className="bg-slate-700 hover:bg-slate-600 text-tayeeba-300 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ml-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Salary Slip PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {employees.map(emp => (
            <div key={emp.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-white text-sm">{emp.name}</h3>
                  <p className="text-tayeeba-400 text-[10px] font-semibold">{emp.designation}</p>
                </div>
                <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                  {emp.employeeId}
                </span>
              </div>
              <div className="text-slate-300">Dept: {emp.department}</div>
              <div className="text-slate-400">Mobile: {emp.phone}</div>
              <div className="text-gold-400 font-bold border-t border-slate-700 pt-2">
                Base Salary: {formatBDT(emp.baseSalary)} / month
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-2">Add New Employee</h3>
            <form onSubmit={handleSaveEmp} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Employee Name *</label>
                <input type="text" required value={empName} onChange={(e) => setEmpName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Department</label>
                <select value={empDept} onChange={(e) => setEmpDept(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  <option value="Sales">Sales</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Project & Site">Project & Site</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Designation</label>
                <input type="text" value={empDesig} onChange={(e) => setEmpDesig(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Base Salary (BDT)</label>
                <input type="number" value={empSalary} onChange={(e) => setEmpSalary(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddEmpModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-tayeeba-600 text-white font-bold px-4 py-2 rounded-xl">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
