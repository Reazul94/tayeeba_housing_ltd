import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ServerMonitor } from './ServerMonitor';
import { Settings, Shield, Building2, Server, Check, Lock } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { currentUser, language } = useERP();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'profile' | 'lan' | 'rbac'>('lan');

  const [companyName, setCompanyName] = useState('TAYEEBA HOUSING LTD.');
  const [address, setAddress] = useState('Gulshan Tower (Level 8), Plot 44, Gulshan-2, Dhaka-1212');
  const [phone, setPhone] = useState('+880 9612-889900');
  const [email, setEmail] = useState('info@tayeebahousing.com');

  const rolesList = [
    { role: 'Super Admin', desc: 'Full System & Deletion Access' },
    { role: 'CEO/Director', desc: 'Financial Overview, Projects & Approvals' },
    { role: 'Accounts', desc: 'Payments, Expenses, Vouchers & Ledgers' },
    { role: 'Sales Manager', desc: 'Leads, Bookings & Sales Team' },
    { role: 'Sales Executive', desc: 'Assigned Leads & Sales' },
    { role: 'HR', desc: 'Employees & Payroll Sheet' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "সিস্টেম সেটিংস ও ল্যান অ্যাডমিন" : "System Settings & Central LAN Administration"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "কোম্পানি প্রোফাইল, ল্যান সার্ভার স্ট্যাটাস, একাউন্টিং নীতি ও ইউজার রোল পারমিশন" : "Company profile settings, central LAN database monitor & role-based access control."}
          </p>
        </div>

        <div className="flex space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
          <button onClick={() => setActiveTab('lan')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'lan' ? 'bg-tayeeba-600 text-white' : 'text-slate-400'}`}>
            LAN Server Monitor
          </button>
          <button onClick={() => setActiveTab('profile')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'profile' ? 'bg-tayeeba-600 text-white' : 'text-slate-400'}`}>
            Company Profile
          </button>
          <button onClick={() => setActiveTab('rbac')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'rbac' ? 'bg-tayeeba-600 text-white' : 'text-slate-400'}`}>
            RBAC Permissions
          </button>
        </div>
      </div>

      {activeTab === 'lan' && <ServerMonitor />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 text-xs">
          <h3 className="font-extrabold text-white text-sm border-b border-slate-700 pb-2 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-tayeeba-400" />
            <span>Company Branding & Information</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold" />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Corporate Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white h-16" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hotline / Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
            </div>

            <button onClick={() => alert("Company Profile updated!")} className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold py-2 px-4 rounded-xl shadow">
              Save Settings
            </button>
          </div>
        </div>

        {/* RBAC Permission Matrix */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 text-xs">
          <h3 className="font-extrabold text-white text-sm border-b border-slate-700 pb-2 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-tayeeba-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </h3>

          <div className="space-y-2">
            {rolesList.map(r => (
              <div key={r.role} className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{r.role}</div>
                  <div className="text-[10px] text-slate-400">{r.desc}</div>
                </div>
                <div className="flex items-center space-x-2 text-[10px]">
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">View</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Create</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Export</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
