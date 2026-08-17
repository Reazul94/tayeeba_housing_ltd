import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRoleDefinition, ActionPermissions } from '../../types/erp';
import { 
  Shield, Plus, Lock, CheckCircle2, Save, Trash2, Sliders, 
  Layers, Check, X, Building2, AlertCircle
} from 'lucide-react';

export const RoleManager: React.FC = () => {
  const { rolesList, saveRole, language } = useERP();
  const isBn = language === 'bn';

  const [roles, setRoles] = useState<UserRoleDefinition[]>(rolesList);
  const [selectedRole, setSelectedRole] = useState<UserRoleDefinition>(rolesList[0]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const modulesList = [
    { id: 'dashboard', name: 'Executive Dashboard' },
    { id: 'projects', name: 'Project Management' },
    { id: 'inventory', name: 'Plot Map & Inventory' },
    { id: 'crm', name: 'CRM & Lead Pipeline' },
    { id: 'bookings', name: 'Booking Engine' },
    { id: 'collections', name: 'Collections & Money Receipts' },
    { id: 'dues', name: 'Dues & Automated Reminders' },
    { id: 'sales', name: 'Sales & Commissions' },
    { id: 'accounting', name: 'Double-Entry Accounting' },
    { id: 'expenses', name: 'Expenses Management' },
    { id: 'land', name: 'Land Acquisition' },
    { id: 'vendors', name: 'Vendors & Purchases' },
    { id: 'development', name: 'Site Development' },
    { id: 'hr', name: 'HR & Payroll' },
    { id: 'transfer', name: 'Plot Transfers & Refunds' },
    { id: 'documents', name: 'Document Vault' },
    { id: 'reports', name: 'Reports & Analytics' },
    { id: 'users', name: 'User Management' },
    { id: 'roles', name: 'Role & Permissions' },
    { id: 'organogram', name: 'Organogram' },
    { id: 'settings', name: 'System Settings' }
  ];

  const togglePermission = (moduleId: string, action: keyof ActionPermissions) => {
    setSelectedRole(prev => {
      const currentPerms = prev.menuPermissions[moduleId] || {
        view: false, create: false, edit: false, delete: false, approve: false, export: false, print: false
      };

      const updatedPerms = {
        ...currentPerms,
        [action]: !currentPerms[action]
      };

      const updatedRole: UserRoleDefinition = {
        ...prev,
        menuPermissions: {
          ...prev.menuPermissions,
          [moduleId]: updatedPerms
        }
      };

      return updatedRole;
    });
  };

  const handleSaveCurrentRole = () => {
    saveRole(selectedRole);
    setRoles(prev => prev.map(r => r.id === selectedRole.id ? selectedRole : r));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: UserRoleDefinition = {
      id: `ROLE-${Date.now()}`,
      roleName: newRoleName.trim().toUpperCase(),
      description: newRoleDesc.trim() || 'Custom ERP Role',
      isSystem: false,
      isActive: true,
      menuPermissions: {
        'dashboard': { view: true, create: false, edit: false, delete: false, approve: false, export: false, print: false }
      }
    };

    saveRole(newRole);
    setRoles(prev => [...prev, newRole]);
    setSelectedRole(newRole);
    setNewRoleName('');
    setNewRoleDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "রোল ও পারমিশন কন্ট্রোল ম্যাট্রিক্স" : "Role-Based Access Control (RBAC) Matrix"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? "মডিউল ও মেন্যু লেভেল অ্যাকশন পারমিশন (View, Create, Edit, Delete, Approve, Export, Print) কনফিগার করুন" : "Configure granular action-level permissions per module & create custom operational roles."}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 border border-slate-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Role</span>
          </button>
          <button
            onClick={handleSaveCurrentRole}
            className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Role Permissions</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Role permissions for '{selectedRole.roleName}' saved successfully to system security registry!</span>
        </div>
      )}

      {/* Main Grid: Role Selector on Left, Action Permission Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Roles List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-2">
            System & Custom Roles ({roles.length})
          </div>
          {roles.map(r => {
            const isSelected = selectedRole.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  isSelected 
                    ? 'bg-tayeeba-950 border-tayeeba-500 text-white shadow-md' 
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{r.roleName}</span>
                  {r.isSystem && (
                    <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold border border-amber-500/40 flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>SYSTEM</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{r.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Module ↔ Action Permission Matrix */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
                <span>Configuring Permissions:</span>
                <span className="text-gold-400">{selectedRole.roleName}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Click any permission pill to toggle access for this role</p>
            </div>
            <button
              onClick={handleSaveCurrentRole}
              className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">ERP Module</th>
                  <th className="py-3 px-2 text-center">View</th>
                  <th className="py-3 px-2 text-center">Create</th>
                  <th className="py-3 px-2 text-center">Edit</th>
                  <th className="py-3 px-2 text-center">Delete</th>
                  <th className="py-3 px-2 text-center">Approve</th>
                  <th className="py-3 px-2 text-center">Export</th>
                  <th className="py-3 px-2 text-center">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {modulesList.map(mod => {
                  const isWildcard = selectedRole.menuPermissions['*']?.view;
                  const perms = selectedRole.menuPermissions[mod.id] || (isWildcard ? selectedRole.menuPermissions['*'] : {
                    view: false, create: false, edit: false, delete: false, approve: false, export: false, print: false
                  });

                  return (
                    <tr key={mod.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-200">
                        {mod.name}
                      </td>
                      {(['view', 'create', 'edit', 'delete', 'approve', 'export', 'print'] as const).map(action => {
                        const hasP = perms[action];
                        return (
                          <td key={action} className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => togglePermission(mod.id, action)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition inline-flex items-center justify-center border ${
                                hasP 
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm' 
                                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                              }`}
                            >
                              {hasP ? '✓' : '✗'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE CUSTOM ROLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                <Plus className="w-5 h-5 text-tayeeba-400" />
                <span>Create Custom System Role</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Role Title (e.g. AUDITOR)</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. SENIOR AUDITOR"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Brief description of responsibilities..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white h-20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-tayeeba-600 hover:bg-tayeeba-500 text-white rounded-xl font-bold">Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
