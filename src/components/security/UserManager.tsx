import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { User, UserRole } from '../../types/erp';
import { 
  Users, UserPlus, Shield, KeyRound, Lock, Unlock, CheckCircle2, 
  XCircle, AlertTriangle, Search, Eye, Edit3, Trash2, Check, X,
  Building2, Briefcase, FileCheck, Layers, ChevronRight, RefreshCw, Sliders
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const { 
    usersList, employees, rolesList, designationsList, createUser, 
    updateUser, updateUserStatus, resetUserPassword, currentUser, language 
  } = useERP();

  const isBn = language === 'bn';

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Wizard Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  // New User Form State
  const [formEmployeeCode, setFormEmployeeCode] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formTempPassword, setFormTempPassword] = useState('User@12345');
  const [formDesignation, setFormDesignation] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formDivision, setFormDivision] = useState('Operations');
  const [formRoles, setFormRoles] = useState<string[]>(['SALES EXECUTIVE']);
  const [formAllowedModules, setFormAllowedModules] = useState<string[]>(['dashboard', 'crm', 'bookings', 'inventory']);
  const [formActionPermissions, setFormActionPermissions] = useState<{
    view: boolean; create: boolean; edit: boolean; delete: boolean; approve: boolean; export: boolean; print: boolean;
  }>({
    view: true, create: true, edit: false, delete: false, approve: false, export: true, print: true
  });

  // Selected User Detail Modal
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  
  // Edit User Information Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name || (user as any).displayName || '');
    setEditDesignation(user.designationTitle || user.role || 'Officer');
    setEditDepartment(user.department || 'General');
    setEditEmail(user.email || '');
    setEditMobile((user as any).mobile || '');
    setEditRoles(user.roles || [user.role]);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) {
      alert('Please enter a valid Name.');
      return;
    }

    setEditLoading(true);
    const res = await updateUser(editingUser.id, {
      name: editName.trim(),
      designationTitle: editDesignation.trim(),
      department: editDepartment.trim(),
      email: editEmail.trim(),
      mobile: editMobile.trim(),
      roles: editRoles,
      role: editRoles[0] as UserRole
    });
    setEditLoading(false);

    if (res.success) {
      setEditingUser(null);
      setSuccessBanner(`User profile for ${editName} (${editingUser.userId || editingUser.employeeCode}) updated successfully!`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } else {
      alert(res.error || 'Failed to update user profile.');
    }
  };

  const allAvailableModules = [
    { id: 'dashboard', name: 'CEO Dashboard' },
    { id: 'projects', name: 'Project Management' },
    { id: 'inventory', name: 'Plot Map & Inventory' },
    { id: 'crm', name: 'CRM & Lead Pipeline' },
    { id: 'bookings', name: 'Booking Engine & Installments' },
    { id: 'collections', name: 'Collections & Money Receipts' },
    { id: 'dues', name: 'Dues & Automated Reminders' },
    { id: 'sales', name: 'Sales & Executive Commissions' },
    { id: 'accounting', name: 'Double-Entry Accounting & Ledger' },
    { id: 'expenses', name: 'Expense Management' },
    { id: 'land', name: 'Land Acquisition & Mouza Dag' },
    { id: 'vendors', name: 'Vendors & Purchases' },
    { id: 'development', name: 'Site Development & Engineering' },
    { id: 'hr', name: 'HR & Payroll Sheet' },
    { id: 'transfer', name: 'Plot Transfers & Refunds' },
    { id: 'documents', name: 'Document Vault' },
    { id: 'reports', name: 'Reports & Analytics' },
    { id: 'users', name: 'User Management & Security' },
    { id: 'roles', name: 'Role & Permission Matrix' },
    { id: 'organogram', name: 'Organogram & Designations' },
    { id: 'login-history', name: 'Login Audit Trail' },
    { id: 'settings', name: 'System Settings & LAN Monitor' }
  ];

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setFormEmployeeCode(emp.employeeId || `THL-EMP-${Math.floor(100 + Math.random() * 900)}`);
      setFormDisplayName(emp.name);
      setFormEmail(emp.email || '');
      setFormMobile(emp.phone || '');
      setFormDepartment(emp.department || 'General');
      setFormDesignation(emp.designation || 'Officer');
    }
  };

  const toggleModuleSelection = (modId: string) => {
    setFormAllowedModules(prev => 
      prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]
    );
  };

  const handleCreateSubmit = async () => {
    const payload = {
      employeeCode: formEmployeeCode,
      displayName: formDisplayName,
      email: formEmail,
      mobile: formMobile,
      tempPassword: formTempPassword,
      roles: formRoles,
      designationTitle: formDesignation,
      department: formDepartment,
      division: formDivision,
      allowedModules: formAllowedModules,
      menuPermissions: {
        '*': formActionPermissions
      },
      createdBy: currentUser.userId || currentUser.name
    };

    const res = await createUser(payload);
    if (res.success) {
      setShowCreateModal(false);
      setWizardStep(1);
      setSuccessBanner(`User account for ${formDisplayName} (${formEmployeeCode}) provisioned successfully in INITIAL status!`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } else {
      alert(res.error || 'Failed to create user account.');
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.userId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter || u.roles?.includes(roleFilter);
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "ইউজার ম্যানেজমেন্ট ও এক্সেস কন্ট্রোল" : "User Management & Security Administration"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? "কর্মচারী একাউন্ট তৈরি, রোল ও মডিউল পারমিশন নির্ধারণ এবং সিকিউরিটি ম্যানেজমেন্ট" : "Provision employee user accounts, configure multi-tier module/menu permissions & manage account statuses."}
          </p>
        </div>

        <button
          onClick={() => { setShowCreateModal(true); setWizardStep(1); }}
          className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-tayeeba-950/40 transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {successBanner && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by User ID (THL-EMP-...), Name, Email..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-tayeeba-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 outline-none font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER ADMIN">Super Admin</option>
            <option value="CEO/Director">CEO / Director</option>
            <option value="ACCOUNTS MANAGER">Accounts Manager</option>
            <option value="SALES MANAGER">Sales Manager</option>
            <option value="SALES EXECUTIVE">Sales Executive</option>
            <option value="HR MANAGER">HR Manager</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 outline-none font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INITIAL">INITIAL (Pending Setup)</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="LOCKED">LOCKED</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">User ID / Code</th>
                <th className="py-3.5 px-4">Full Name & Contact</th>
                <th className="py-3.5 px-4">Designation & Department</th>
                <th className="py-3.5 px-4">Assigned Roles</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map(user => {
                const isSuperAdmin = user.role === 'Super Admin' || user.roles?.includes('SUPER ADMIN');
                const isLocked = user.status === 'LOCKED' || (user as any).isLocked;
                const isInactive = user.status === 'INACTIVE' || (user as any).isActive === false;
                const isInitial = user.status === 'INITIAL' || user.mustChangePassword;

                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-tayeeba-300">
                      {user.userId || user.employeeCode || user.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span>{user.name}</span>
                        {isSuperAdmin && (
                          <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.2 rounded font-bold border border-amber-500/40">
                            CORE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{user.designationTitle || 'Officer'}</div>
                      <div className="text-[10px] text-slate-400">{user.department || 'General'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(user.roles || [user.role]).map((r, i) => (
                          <span key={i} className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isLocked ? (
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                          <Lock className="w-3 h-3 text-rose-400" />
                          <span>LOCKED</span>
                        </span>
                      ) : isInitial ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          <span>INITIAL</span>
                        </span>
                      ) : isInactive ? (
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          INACTIVE
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setViewingUser(user)}
                          title="View Access Summary"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Edit User Profile (Name, Designation, Department)"
                          className="p-1.5 bg-slate-800 hover:bg-tayeeba-600/30 text-slate-300 hover:text-gold-400 border border-slate-700 hover:border-gold-500/40 rounded-lg transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {!isSuperAdmin && (
                          <>
                            {isLocked ? (
                              <button
                                onClick={() => updateUserStatus(user.id, 'ACTIVE', true, false, 'Admin Unlocked Account')}
                                title="Unlock Account"
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg transition"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(user.id, isInactive ? 'ACTIVE' : 'INACTIVE', isInactive, false, 'Admin Toggle')}
                                title={isInactive ? "Activate Account" : "Deactivate Account"}
                                className={`p-1.5 rounded-lg transition border ${
                                  isInactive 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                    : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border-slate-700'
                                }`}
                              >
                                {isInactive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Reset password for ${user.name}? This will set a temporary password and status to INITIAL.`)) {
                                  resetUserPassword(user.id);
                                  alert(`Password for ${user.name} reset to temporary password 'User@12345'. First login will require change.`);
                                }
                              }}
                              title="Reset Password"
                              className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 rounded-lg transition border border-slate-700"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9-STEP USER PROVISIONING WIZARD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-tayeeba-400" />
                  <span>Provision New User Account — Step {wizardStep} of 4</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Enterprise security: Linked directly to Employee master record</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
              <div className={`py-1 rounded-lg border ${wizardStep >= 1 ? 'bg-tayeeba-600/30 text-tayeeba-300 border-tayeeba-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>1. Employee</div>
              <div className={`py-1 rounded-lg border ${wizardStep >= 2 ? 'bg-tayeeba-600/30 text-tayeeba-300 border-tayeeba-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>2. Credentials</div>
              <div className={`py-1 rounded-lg border ${wizardStep >= 3 ? 'bg-tayeeba-600/30 text-tayeeba-300 border-tayeeba-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>3. Modules & Actions</div>
              <div className={`py-1 rounded-lg border ${wizardStep >= 4 ? 'bg-tayeeba-600/30 text-tayeeba-300 border-tayeeba-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>4. Summary & Save</div>
            </div>

            {/* STEP 1: Select Employee */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-2">Select Existing Employee Record</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {employees.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => handleSelectEmployee(emp.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                          selectedEmployeeId === emp.id 
                            ? 'bg-tayeeba-950 border-tayeeba-500 text-white shadow-md' 
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-white">{emp.name}</div>
                          <div className="text-[11px] text-slate-400">{emp.designation} • {emp.department}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-tayeeba-400 font-bold">{emp.employeeId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={!selectedEmployeeId}
                    onClick={() => setWizardStep(2)}
                    className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold px-5 py-2 rounded-xl flex items-center space-x-1.5 disabled:opacity-40"
                  >
                    <span>Next: User Credentials</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Account Information & Roles */}
            {wizardStep === 2 && (
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">User ID (Employee Code)</label>
                    <input
                      type="text"
                      value={formEmployeeCode}
                      onChange={(e) => setFormEmployeeCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formDisplayName}
                      onChange={(e) => setFormDisplayName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Email</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Temporary Password (Initial Login)</label>
                    <input
                      type="text"
                      value={formTempPassword}
                      onChange={(e) => setFormTempPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-gold-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Assigned System Role</label>
                  <select
                    value={formRoles[0]}
                    onChange={(e) => setFormRoles([e.target.value])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {rolesList.map(r => (
                      <option key={r.id} value={r.roleName}>{r.roleName} — {r.description}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-800">
                  <button onClick={() => setWizardStep(1)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Back</button>
                  <button onClick={() => setWizardStep(3)} className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold px-5 py-2 rounded-xl flex items-center space-x-1.5">
                    <span>Next: Module Access</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Modules & Action Permissions */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-2">Permitted ERP Modules</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {allAvailableModules.map(mod => {
                      const isChecked = formAllowedModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleModuleSelection(mod.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center space-x-2 transition ${
                            isChecked ? 'bg-tayeeba-950 border-tayeeba-500 text-white font-bold' : 'bg-slate-800/40 border-slate-700 text-slate-400'
                          }`}
                        >
                          <input type="checkbox" checked={isChecked} onChange={() => {}} className="accent-tayeeba-500" />
                          <span className="truncate">{mod.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-2">Action Permissions</label>
                  <div className="flex flex-wrap gap-2">
                    {(['view', 'create', 'edit', 'delete', 'approve', 'export', 'print'] as const).map(action => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => setFormActionPermissions(prev => ({ ...prev, [action]: !prev[action] }))}
                        className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] border transition ${
                          formActionPermissions[action] 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm' 
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {formActionPermissions[action] ? '✓ ' : '✗ '} {action}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-800">
                  <button onClick={() => setWizardStep(2)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Back</button>
                  <button onClick={() => setWizardStep(4)} className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold px-5 py-2 rounded-xl flex items-center space-x-1.5">
                    <span>Review Access Summary</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Access Summary & Activation */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-extrabold text-sm text-gold-400 border-b border-slate-800 pb-1.5">Access Summary Review</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-400">User ID:</span> <strong className="text-white font-mono">{formEmployeeCode}</strong></div>
                    <div><span className="text-slate-400">Name:</span> <strong className="text-white">{formDisplayName}</strong></div>
                    <div><span className="text-slate-400">Designation:</span> <strong className="text-white">{formDesignation}</strong></div>
                    <div><span className="text-slate-400">Department:</span> <strong className="text-white">{formDepartment}</strong></div>
                    <div><span className="text-slate-400">Assigned Role:</span> <strong className="text-emerald-400">{formRoles.join(', ')}</strong></div>
                    <div><span className="text-slate-400">Initial Status:</span> <strong className="text-amber-400">INITIAL (Must Change Password)</strong></div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Allowed Modules ({formAllowedModules.length}):</span>
                    <div className="flex flex-wrap gap-1">
                      {formAllowedModules.map(m => (
                        <span key={m} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-700">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button onClick={() => setWizardStep(3)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Back</button>
                  <button onClick={handleCreateSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg transition">
                    Activate & Save User
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* USER DETAIL ACCESS SUMMARY MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-tayeeba-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                  {viewingUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">{viewingUser.name}</h3>
                  <p className="text-[11px] text-tayeeba-400 font-mono font-bold">{viewingUser.userId || viewingUser.employeeCode}</p>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-400">Designation:</span> <strong className="text-white">{viewingUser.designationTitle || 'Officer'}</strong></div>
                <div><span className="text-slate-400">Department:</span> <strong className="text-white">{viewingUser.department || 'General'}</strong></div>
                <div><span className="text-slate-400">Primary Role:</span> <strong className="text-emerald-400">{viewingUser.role}</strong></div>
                <div><span className="text-slate-400">Status:</span> <strong className="text-white">{viewingUser.status || 'ACTIVE'}</strong></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-300 mb-1.5">Assigned Modules</h4>
              <div className="flex flex-wrap gap-1.5">
                {(viewingUser.allowedModules || ['dashboard', 'crm', 'bookings']).map(m => (
                  <span key={m} className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-slate-700">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-300 mb-1.5">Effective Action Permissions</h4>
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                <div className={`p-1.5 rounded-lg border ${viewingUser.permissions.view ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>View: {viewingUser.permissions.view ? 'YES' : 'NO'}</div>
                <div className={`p-1.5 rounded-lg border ${viewingUser.permissions.create ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>Create: {viewingUser.permissions.create ? 'YES' : 'NO'}</div>
                <div className={`p-1.5 rounded-lg border ${viewingUser.permissions.edit ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>Edit: {viewingUser.permissions.edit ? 'YES' : 'NO'}</div>
                <div className={`p-1.5 rounded-lg border ${viewingUser.permissions.delete ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>Delete: {viewingUser.permissions.delete ? 'YES' : 'NO'}</div>
                <div className={`p-1.5 rounded-lg border ${viewingUser.permissions.approve ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>Approve: {viewingUser.permissions.approve ? 'YES' : 'NO'}</div>
                <div className={`p-1.5 rounded-lg border ${viewingUser.permissions.export ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>Export: {viewingUser.permissions.export ? 'YES' : 'NO'}</div>
                <div className={`p-1.5 rounded-lg border ${viewingUser.permissions.print !== false ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>Print: YES</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setViewingUser(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Close Summary</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER PROFILE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-tayeeba-600/30 text-gold-400 border border-gold-500/40 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">Edit User Profile & Designation</h3>
                  <p className="text-[11px] text-tayeeba-400 font-mono font-bold">{editingUser.userId || editingUser.employeeCode}</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">User ID / Code</label>
                  <input
                    type="text"
                    value={editingUser.userId || editingUser.employeeCode}
                    disabled
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-400 font-mono font-bold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-tayeeba-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Designation Title</label>
                  <input
                    type="text"
                    list="designations-datalist"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    placeholder="e.g. Managing Director & CEO"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-tayeeba-500"
                    required
                  />
                  <datalist id="designations-datalist">
                    {designationsList.map(d => (
                      <option key={d.designationId} value={d.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="e.g. Executive Management"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-tayeeba-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-tayeeba-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-tayeeba-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Assigned Role</label>
                <select
                  value={editRoles[0] || 'SALES EXECUTIVE'}
                  onChange={(e) => setEditRoles([e.target.value])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  {rolesList.map(r => (
                    <option key={r.id} value={r.roleName}>{r.roleName}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-tayeeba-600 hover:bg-tayeeba-500 text-white rounded-xl font-bold shadow-lg transition flex items-center space-x-1.5"
                >
                  {editLoading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
