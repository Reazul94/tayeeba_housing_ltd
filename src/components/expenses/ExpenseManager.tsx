import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Expense } from '../../types/erp';
import { formatBDT } from '../../utils/pdfGenerator';
import { Receipt, Plus } from 'lucide-react';

export const ExpenseManager: React.FC = () => {
  const { expenses, projects, addExpense, language, showToast } = useERP();
  const isBn = language === 'bn';

  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('Site Development');
  const [amount, setAmount] = useState(50000);
  const [desc, setDesc] = useState('');
  const [vendor, setVendor] = useState('Messrs Alam Traders');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');

  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    const prj = projects.find(p => p.id === projectId);
    addExpense({
      date: new Date().toISOString().split('T')[0],
      category,
      amount,
      description: desc || category,
      projectId,
      projectName: prj ? prj.name : 'Tayeeba Smart City',
      paymentMethod: 'Bank',
      vendorPayee: vendor,
      approvedBy: 'Tariqul Islam Siddiqui',
      createdBy: 'Mahfuzur Rahman'
    });
    showToast(`Expense of BDT ${amount.toLocaleString()} for ${category} recorded successfully!`, 'success', 'Expense Added');
    setShowModal(false);
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "প্রজেক্ট ও অফিস খরচ (Expenses)" : "Office & Site Expense Management"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "প্রজেক্ট-ভিত্তিক ডেভেলপমেন্ট খরচ, অফিস ও মার্কেটিং ব্যয়ের রেকর্ড" : "Categorized site development & administrative expense voucher tracking."}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Expense</span>
        </button>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-700">
              <th className="p-3">Expense ID</th>
              <th className="p-3">Date</th>
              <th className="p-3">Category</th>
              <th className="p-3">Project</th>
              <th className="p-3">Payee / Vendor</th>
              <th className="p-3">Method</th>
              <th className="p-3 text-right font-bold">Amount (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {expenses.map(e => (
              <tr key={e.id} className="hover:bg-slate-700/40 text-slate-200">
                <td className="p-3 font-mono font-bold text-tayeeba-400">{e.expenseId}</td>
                <td className="p-3 text-slate-400">{e.date}</td>
                <td className="p-3 font-bold text-white">{e.category}</td>
                <td className="p-3 text-slate-300">{e.projectName || 'General Office'}</td>
                <td className="p-3 text-slate-300">{e.vendorPayee}</td>
                <td className="p-3">{e.paymentMethod}</td>
                <td className="p-3 text-right font-extrabold text-rose-400">{formatBDT(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-3 text-xs">
            <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-2">Record New Expense</h3>
            <form onSubmit={handleSaveExp} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Expense Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  <option value="Site Development">Site Development & Construction</option>
                  <option value="Land Purchase">Land Purchase / Legal</option>
                  <option value="Office Rent">Office Rent & Utilities</option>
                  <option value="Facebook Ads">Facebook & Marketing Ads</option>
                  <option value="Salary">Salary & Bonus</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Amount (BDT) *</label>
                <input type="number" required value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Vendor / Payee Name</label>
                <input type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Description / Narration</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white h-16" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-tayeeba-600 text-white font-bold px-4 py-2 rounded-xl">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
