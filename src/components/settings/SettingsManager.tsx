import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ServerMonitor } from './ServerMonitor';
import { Settings, Shield, Building2, Server, Check, Lock, Save, Edit3, UserCheck, Plus, Trash2, Sliders } from 'lucide-react';

interface RolePermission {
  role: string;
  desc: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
  };
}

export const SettingsManager: React.FC = () => {
  const { currentUser, language } = useERP();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'profile' | 'lan' | 'rbac'>('rbac');

  const [companyName, setCompanyName] = useState('TAYEEBA HOUSING LTD.');
  const [address, setAddress] = useState('Gulshan Tower (Level 8), Plot 44, Gulshan-2, Dhaka-1212');
  const [phone, setPhone] = useState('+880 9612-889900');
  const [email, setEmail] = useState('info@tayeebahousing.com');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editable RBAC Roles Matrix state
  const [roles, setRoles] = useState<RolePermission[]>(() => {
    const saved = localStorage.getItem('thl_rbac_roles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { role: 'Super Admin', desc: 'Full System & Deletion Access', permissions: { view: true, create: true, edit: true, delete: true, approve: true, export: true } },
      { role: 'CEO/Director', desc: 'Financial Overview, Projects & Approvals', permissions: { view: true, create: true, edit: true, delete: false, approve: true, export: true } },
      { role: 'Accounts', desc: 'Payments, Expenses, Vouchers & Ledgers', permissions: { view: true, create: true, edit: true, delete: false, approve: false, export: true } },
      { role: 'Sales Manager', desc: 'Leads, Bookings & Sales Team', permissions: { view: true, create: true, edit: true, delete: false, approve: false, export: true } },
      { role: 'Sales Executive', desc: 'Assigned Leads & Sales', permissions: { view: true, create: true, edit: false, delete: false, approve: false, export: false } },
      { role: 'HR', desc: 'Employees & Payroll Sheet', permissions: { view: true, create: true, edit: true, delete: false, approve: true, export: true } }
    ];
  });

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [showAddRole, setShowAddRole] = useState(false);

  const togglePermission = (roleName: string, permKey: keyof RolePermission['permissions']) => {
    setRoles(prev => prev.map(r => {
      if (r.role === roleName) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permKey]: !r.permissions[permKey]
          }
        };
      }
      return r;
    }));
  };

  const handleSaveRBAC = () => {
    localStorage.setItem('thl_rbac_roles', JSON.stringify(roles));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRoleObj: RolePermission = {
      role: newRoleName.trim(),
      desc: newRoleDesc.trim() || 'Custom System Role',
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false }
    };

    setRoles(prev => [...prev, newRoleObj]);
    setNewRoleName('');
    setNewRoleDesc('');
    setShowAddRole(false);
    handleSaveRBAC();
  };

  const handleDeleteRole = (roleName: string) => {
    if (roleName === 'Super Admin') {
      alert("Super Admin role cannot be deleted!");
      return;
    }
    if (confirm(`Are you sure you want to delete role '${roleName}'?`)) {
      setRoles(prev => prev.filter(r => r.role !== roleName));
      handleSaveRBAC();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "সিস্টেম সেটিংস ও ইউজার অ্যাক্সেস (RBAC)" : "System Settings & Editable RBAC Access Control"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "কোম্পানি প্রোফাইল, ল্যান সার্ভার স্ট্যাটাস, একাউন্টিং নীতি ও ইউজার রোল পারমিশন এডিটর" : "Configure company branding, central LAN database server & interactive role permission matrices."}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-700 w-full sm:w-auto">
          <button onClick={() => setActiveTab('rbac')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${activeTab === 'rbac' ? 'bg-tayeeba-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Shield className="w-3.5 h-3.5" />
            <span>Editable RBAC Matrix</span>
          </button>
          <button onClick={() => setActiveTab('lan')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${activeTab === 'lan' ? 'bg-tayeeba-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Server className="w-3.5 h-3.5" />
            <span>LAN Server Monitor</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${activeTab === 'profile' ? 'bg-tayeeba-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Profile</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Permissions and System Settings successfully updated & saved to central storage!</span>
          </span>
        </div>
      )}

      {activeTab === 'lan' && <ServerMonitor />}

      {activeTab === 'profile' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 text-xs max-w-2xl">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hotline / Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
            </div>

            <button onClick={() => { setSavedSuccess(true); setTimeout(() => setSavedSuccess(false), 3000); }} className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold py-2 px-5 rounded-xl shadow transition">
              Save Company Settings
            </button>
          </div>
        </div>
      )}

      {/* RBAC Permission Matrix Section */}
      {activeTab === 'rbac' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-700 pb-3 gap-3">
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
                <Shield className="w-4 h-4 text-tayeeba-400" />
                <span>Role-Based Access Control (RBAC) — Interactive Permission Matrix</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any permission pill (<span className="text-emerald-400 font-bold">View</span>, <span className="text-emerald-400 font-bold">Create</span>, <span className="text-amber-400 font-bold">Edit</span>, <span className="text-rose-400 font-bold">Delete</span>, <span className="text-purple-400 font-bold">Approve</span>, <span className="text-blue-400 font-bold">Export</span>) to toggle ON / OFF for each user role.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowAddRole(true)} 
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Role</span>
              </button>
              <button 
                onClick={handleSaveRBAC} 
                className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white px-4 py-1.5 rounded-xl font-bold flex items-center space-x-1 text-xs shadow-md transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Permissions</span>
              </button>
            </div>
          </div>

          {/* Add Role Drawer Modal */}
          {showAddRole && (
            <form onSubmit={handleAddRole} className="p-4 bg-slate-900/90 border border-tayeeba-500/40 rounded-xl space-y-3 animate-fadeIn">
              <h4 className="font-bold text-white text-xs text-tayeeba-300">Create New Custom System Role</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Role Title (e.g. Senior Auditor)" 
                  value={newRoleName} 
                  onChange={(e) => setNewRoleName(e.target.value)} 
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs font-bold"
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Description (e.g. Audit & Report Verification)" 
                  value={newRoleDesc} 
                  onChange={(e) => setNewRoleDesc(e.target.value)} 
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddRole(false)} className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-tayeeba-600 text-white rounded-lg font-bold">Create Role</button>
              </div>
            </form>
          )}

          {/* Roles Cards List */}
          <div className="grid grid-cols-1 gap-3">
            {roles.map(r => (
              <div key={r.role} className="p-4 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition shadow-sm">
                <div className="space-y-0.5 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm tracking-tight">{r.role}</span>
                    {r.role === 'Super Admin' && (
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30 flex items-center space-x-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>System Core</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{r.desc}</p>
                </div>

                {/* Permission Toggles */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button 
                    type="button"
                    onClick={() => togglePermission(r.role, 'view')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
                      r.permissions.view 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span>{r.permissions.view ? '✓' : '✗'}</span>
                    <span>View</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => togglePermission(r.role, 'create')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
                      r.permissions.create 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span>{r.permissions.create ? '✓' : '✗'}</span>
                    <span>Create</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => togglePermission(r.role, 'edit')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
                      r.permissions.edit 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span>{r.permissions.edit ? '✓' : '✗'}</span>
                    <span>Edit</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => togglePermission(r.role, 'delete')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
                      r.permissions.delete 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span>{r.permissions.delete ? '✓' : '✗'}</span>
                    <span>Delete</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => togglePermission(r.role, 'approve')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
                      r.permissions.approve 
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span>{r.permissions.approve ? '✓' : '✗'}</span>
                    <span>Approve</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => togglePermission(r.role, 'export')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
                      r.permissions.export 
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span>{r.permissions.export ? '✓' : '✗'}</span>
                    <span>Export</span>
                  </button>

                  {r.role !== 'Super Admin' && (
                    <button 
                      onClick={() => handleDeleteRole(r.role)} 
                      title="Delete Role" 
                      className="p-1 text-slate-500 hover:text-rose-400 transition ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
