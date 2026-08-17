import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Project, Plot, Customer, Lead, SiteVisit, Booking, 
  Installment, PaymentReceipt, Account, JournalEntry, Expense, 
  LandParcel, Commission, Vendor, Employee, Payroll, AuditLog, 
  NotificationItem, UserRole, PlotStatus,
  UserInfo, UserRoleDefinition, UserDesignation, UserDesignationHistory, UserLoginHistory, ActionPermissionKey
} from '../types/erp';
import { 
  mockUsers, mockProjects, mockPlots, mockCustomers, mockLeads, 
  mockSiteVisits, mockBookings, mockInstallments, mockReceipts, 
  mockAccounts, mockJournalEntries, mockExpenses, mockLandParcels, 
  mockCommissions, mockVendors, mockEmployees, mockPayrolls, 
  mockAuditLogs, mockNotifications, mockRolesList, mockDesignationsList,
  mockDesignationHistories, mockLoginHistories
} from '../data/mockData';

interface ERPContextType {
  // Navigation & System State
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  currentUser: User;
  setCurrentUserRole: (role: UserRole) => void;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Authentication & Security State
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (userId: string, pass: string) => Promise<{ success: boolean; error?: string; status?: string; mustChangePassword?: boolean }>;
  logout: () => void;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (moduleName: string, action?: ActionPermissionKey) => boolean;

  // Security Management Collections & Actions
  usersList: User[];
  rolesList: UserRoleDefinition[];
  designationsList: UserDesignation[];
  designationHistories: UserDesignationHistory[];
  loginHistories: UserLoginHistory[];
  createUser: (userData: any) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, updatedFields: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateUserStatus: (userId: string, status: string, isActive?: boolean, isLocked?: boolean, reason?: string) => void;
  resetUserPassword: (userId: string) => void;
  saveRole: (role: UserRoleDefinition) => void;
  transferEmployee: (userId: string, newDesigId: string, newDept: string) => { success: boolean; error?: string };

  // Data Collections
  projects: Project[];
  plots: Plot[];
  customers: Customer[];
  leads: Lead[];
  siteVisits: SiteVisit[];
  bookings: Booking[];
  installments: Installment[];
  receipts: PaymentReceipt[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  expenses: Expense[];
  landParcels: LandParcel[];
  commissions: Commission[];
  vendors: Vendor[];
  employees: Employee[];
  payrolls: Payroll[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];

  // Operational Transaction Actions
  addLead: (lead: Omit<Lead, 'id' | 'leadId' | 'createdAt'>) => void;
  addSiteVisit: (visit: Omit<SiteVisit, 'id'>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'customerId' | 'totalPaid' | 'totalDue'>) => Customer;
  
  createBooking: (data: {
    customerId: string;
    projectId: string;
    plotId: string;
    totalPrice: number;
    discount: number;
    bookingMoney: number;
    downPayment: number;
    durationMonths: number;
    frequency: 'Monthly' | 'Quarterly';
    firstInstallmentDate: string;
    salesExecutiveId: string;
    salesExecutiveName: string;
  }) => Booking;

  recordPayment: (payment: {
    customerId: string;
    projectId: string;
    plotId: string;
    bookingId?: string;
    paymentType: PaymentReceipt['paymentType'];
    amount: number;
    paymentMethod: PaymentReceipt['paymentMethod'];
    bankName?: string;
    chequeOrTxnNo?: string;
    remarks?: string;
  }) => PaymentReceipt;

  cancelBooking: (bookingId: string, cancellationCharge: number, reason: string) => void;
  transferPlot: (plotId: string, fromCustomerId: string, toCustomerId: string, transferFee: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'expenseId'>) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'voucherNumber'>) => void;
  addLandParcel: (land: Omit<LandParcel, 'id'>) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'employeeId'>) => void;
  processPayroll: (month: string, year: number) => void;
  markNotificationRead: (id: string) => void;
  logAuditAction: (action: string, module: string, recordId: string, oldValue?: string, newValue?: string) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('thl_sidebar_collapsed');
      return saved === 'true';
    } catch (e) { return false; }
  });
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('thl_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('thl_auth_token');
    return !!saved;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedUser = localStorage.getItem('thl_current_user');
      return savedUser ? JSON.parse(savedUser) : mockUsers[0];
    } catch (e) {
      return mockUsers[0];
    }
  });

  const [mustChangePassword, setMustChangePassword] = useState<boolean>(() => {
    return currentUser.status === 'INITIAL' || !!currentUser.mustChangePassword;
  });

  // Security Collections
  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('thl_users_list');
      return saved ? JSON.parse(saved) : mockUsers;
    } catch (e) { return mockUsers; }
  });

  const [rolesList, setRolesList] = useState<UserRoleDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('thl_roles_list');
      return saved ? JSON.parse(saved) : mockRolesList;
    } catch (e) { return mockRolesList; }
  });

  const [designationsList, setDesignationsList] = useState<UserDesignation[]>(() => {
    try {
      const saved = localStorage.getItem('thl_designations_list');
      return saved ? JSON.parse(saved) : mockDesignationsList;
    } catch (e) { return mockDesignationsList; }
  });

  const [designationHistories, setDesignationHistories] = useState<UserDesignationHistory[]>(() => {
    try {
      const saved = localStorage.getItem('thl_designation_histories');
      return saved ? JSON.parse(saved) : mockDesignationHistories;
    } catch (e) { return mockDesignationHistories; }
  });

  const [loginHistories, setLoginHistories] = useState<UserLoginHistory[]>(() => {
    try {
      const saved = localStorage.getItem('thl_login_histories');
      return saved ? JSON.parse(saved) : mockLoginHistories;
    } catch (e) { return mockLoginHistories; }
  });

  // Load / Persist data
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('thl_projects');
      return saved ? JSON.parse(saved) : mockProjects;
    } catch (e) { return mockProjects; }
  });

  const [plots, setPlots] = useState<Plot[]>(() => {
    try {
      const saved = localStorage.getItem('thl_plots');
      return saved ? JSON.parse(saved) : mockPlots;
    } catch (e) { return mockPlots; }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('thl_customers');
      return saved ? JSON.parse(saved) : mockCustomers;
    } catch (e) { return mockCustomers; }
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('thl_leads');
      return saved ? JSON.parse(saved) : mockLeads;
    } catch (e) { return mockLeads; }
  });

  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(() => {
    try {
      const saved = localStorage.getItem('thl_site_visits');
      return saved ? JSON.parse(saved) : mockSiteVisits;
    } catch (e) { return mockSiteVisits; }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('thl_bookings');
      return saved ? JSON.parse(saved) : mockBookings;
    } catch (e) { return mockBookings; }
  });

  const [installments, setInstallments] = useState<Installment[]>(() => {
    try {
      const saved = localStorage.getItem('thl_installments');
      return saved ? JSON.parse(saved) : mockInstallments;
    } catch (e) { return mockInstallments; }
  });

  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => {
    try {
      const saved = localStorage.getItem('thl_receipts');
      return saved ? JSON.parse(saved) : mockReceipts;
    } catch (e) { return mockReceipts; }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('thl_accounts');
      return saved ? JSON.parse(saved) : mockAccounts;
    } catch (e) { return mockAccounts; }
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('thl_journal_entries');
      return saved ? JSON.parse(saved) : mockJournalEntries;
    } catch (e) { return mockJournalEntries; }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('thl_expenses');
      return saved ? JSON.parse(saved) : mockExpenses;
    } catch (e) { return mockExpenses; }
  });

  const [landParcels, setLandParcels] = useState<LandParcel[]>(() => {
    try {
      const saved = localStorage.getItem('thl_land_parcels');
      return saved ? JSON.parse(saved) : mockLandParcels;
    } catch (e) { return mockLandParcels; }
  });

  const [commissions, setCommissions] = useState<Commission[]>(() => {
    try {
      const saved = localStorage.getItem('thl_commissions');
      return saved ? JSON.parse(saved) : mockCommissions;
    } catch (e) { return mockCommissions; }
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem('thl_vendors');
      return saved ? JSON.parse(saved) : mockVendors;
    } catch (e) { return mockVendors; }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('thl_employees');
      return saved ? JSON.parse(saved) : mockEmployees;
    } catch (e) { return mockEmployees; }
  });

  const [payrolls, setPayrolls] = useState<Payroll[]>(() => {
    try {
      const saved = localStorage.getItem('thl_payrolls');
      return saved ? JSON.parse(saved) : mockPayrolls;
    } catch (e) { return mockPayrolls; }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('thl_audit_logs');
      return saved ? JSON.parse(saved) : mockAuditLogs;
    } catch (e) { return mockAuditLogs; }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('thl_notifications');
      return saved ? JSON.parse(saved) : mockNotifications;
    } catch (e) { return mockNotifications; }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('thl_current_user', JSON.stringify(currentUser));
    localStorage.setItem('thl_users_list', JSON.stringify(usersList));
    localStorage.setItem('thl_roles_list', JSON.stringify(rolesList));
    localStorage.setItem('thl_designations_list', JSON.stringify(designationsList));
    localStorage.setItem('thl_designation_histories', JSON.stringify(designationHistories));
    localStorage.setItem('thl_login_histories', JSON.stringify(loginHistories));
    localStorage.setItem('thl_projects', JSON.stringify(projects));
    localStorage.setItem('thl_plots', JSON.stringify(plots));
    localStorage.setItem('thl_customers', JSON.stringify(customers));
    localStorage.setItem('thl_leads', JSON.stringify(leads));
    localStorage.setItem('thl_site_visits', JSON.stringify(siteVisits));
    localStorage.setItem('thl_bookings', JSON.stringify(bookings));
    localStorage.setItem('thl_installments', JSON.stringify(installments));
    localStorage.setItem('thl_receipts', JSON.stringify(receipts));
    localStorage.setItem('thl_accounts', JSON.stringify(accounts));
    localStorage.setItem('thl_journal_entries', JSON.stringify(journalEntries));
    localStorage.setItem('thl_expenses', JSON.stringify(expenses));
    localStorage.setItem('thl_land_parcels', JSON.stringify(landParcels));
    localStorage.setItem('thl_commissions', JSON.stringify(commissions));
    localStorage.setItem('thl_vendors', JSON.stringify(vendors));
    localStorage.setItem('thl_employees', JSON.stringify(employees));
    localStorage.setItem('thl_payrolls', JSON.stringify(payrolls));
    localStorage.setItem('thl_audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem('thl_notifications', JSON.stringify(notifications));
  }, [
    currentUser, usersList, rolesList, designationsList, designationHistories, loginHistories,
    projects, plots, customers, leads, siteVisits, bookings, installments, 
    receipts, accounts, journalEntries, expenses, landParcels, commissions, 
    vendors, employees, payrolls, auditLogs, notifications
  ]);

  // -------------------------------------------------------------
  // AUTHENTICATION METHODS
  // -------------------------------------------------------------
  const login = async (userId: string, pass: string): Promise<{ success: boolean; error?: string; status?: string; mustChangePassword?: boolean }> => {
    try {
      // 1. Attempt central LAN server login API
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password: pass })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('thl_auth_token', data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setMustChangePassword(!!data.user.mustChangePassword);

        // Record in local history
        const newHist: UserLoginHistory = {
          id: `LH-${Date.now()}`,
          userId: data.user.userId,
          employeeCode: data.user.employeeCode,
          userName: data.user.name,
          loginTime: new Date().toLocaleString(),
          ipAddress: '127.0.0.1',
          device: 'Browser Client',
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Edge/Firefox',
          status: 'SUCCESS'
        };
        setLoginHistories(prev => [newHist, ...prev]);

        return { success: true, mustChangePassword: data.user.mustChangePassword };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Authentication failed.', status: errData.status };
      }
    } catch (networkErr) {
      // Offline fallback: Check local users
      const found = usersList.find(u => (u.userId === userId || u.employeeCode === userId || u.email === userId));
      if (!found) {
        return { success: false, error: 'Invalid User ID or Password.' };
      }

      if (found.status === 'LOCKED') {
        return { success: false, error: 'Your account is locked. Please contact the System Administrator.', status: 'LOCKED' };
      }

      if (found.status === 'INACTIVE') {
        return { success: false, error: 'Your account is currently inactive. Please contact the System Administrator.', status: 'INACTIVE' };
      }

      // Default mock passwords
      const validPass = pass === 'Admin@12345' || pass === 'User@12345' || pass === '123456' || pass === 'password';
      if (!validPass) {
        return { success: false, error: 'Invalid User ID or Password.' };
      }

      localStorage.setItem('thl_auth_token', `token-${Date.now()}`);
      setCurrentUser(found);
      setIsAuthenticated(true);
      const mustChange = found.status === 'INITIAL' || !!found.mustChangePassword;
      setMustChangePassword(mustChange);

      const newHist: UserLoginHistory = {
        id: `LH-${Date.now()}`,
        userId: found.userId || found.id,
        employeeCode: found.employeeCode || found.id,
        userName: found.name,
        loginTime: new Date().toLocaleString(),
        ipAddress: '127.0.0.1 (Offline LAN)',
        device: 'Browser Client',
        browser: 'Web Browser',
        status: 'SUCCESS'
      };
      setLoginHistories(prev => [newHist, ...prev]);

      return { success: true, mustChangePassword: mustChange };
    }
  };

  const logout = () => {
    localStorage.removeItem('thl_auth_token');
    setIsAuthenticated(false);
    setMustChangePassword(false);
    setCurrentTab('dashboard');
  };

  const changePassword = async (currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    try {
      await fetch('http://127.0.0.1:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.userId || currentUser.id, currentPassword: currentPass, newPassword: newPass })
      });
    } catch (e) {}

    // Update local user state
    setCurrentUser(prev => ({
      ...prev,
      status: 'ACTIVE',
      mustChangePassword: false
    }));
    setMustChangePassword(false);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? { ...u, status: 'ACTIVE', mustChangePassword: false } : u));
    logAuditAction('Password Changed', 'Security', currentUser.userId || currentUser.id, 'Temporary/Initial', 'Active Password');

    return { success: true };
  };

  // -------------------------------------------------------------
  // PERMISSION EVALUATION ENGINE
  // -------------------------------------------------------------
  const hasPermission = (moduleName: string, action: ActionPermissionKey = 'view'): boolean => {
    if (!currentUser) return false;

    // 1. Super Admin has unrestricted access to everything
    if (currentUser.role === 'Super Admin' || currentUser.roles?.includes('SUPER ADMIN')) {
      return true;
    }

    // 2. Check Allowed Modules List
    const allowed = currentUser.allowedModules || ['dashboard'];
    if (allowed.includes('ALL')) return true;

    if (!allowed.includes(moduleName) && moduleName !== 'dashboard') {
      return false;
    }

    // 3. Check granular menu permissions
    if (currentUser.menuPermissions && currentUser.menuPermissions[moduleName]) {
      const perms = currentUser.menuPermissions[moduleName];
      return perms[action] !== undefined ? perms[action] : true;
    }

    // 4. Default action checks based on basic permissions
    if (currentUser.permissions) {
      return currentUser.permissions[action] !== undefined ? currentUser.permissions[action] : true;
    }

    return true;
  };

  // -------------------------------------------------------------
  // USER & SECURITY MANAGEMENT ACTIONS
  // -------------------------------------------------------------
  const createUser = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        // Append to local state
        const newUserObj: User = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          userId: userData.employeeCode,
          employeeCode: userData.employeeCode,
          name: userData.displayName,
          email: userData.email,
          role: userData.roles[0] || 'Sales Executive',
          roles: userData.roles,
          status: 'INITIAL',
          mustChangePassword: true,
          designationTitle: userData.designationTitle,
          department: userData.department,
          allowedModules: userData.allowedModules,
          menuPermissions: userData.menuPermissions,
          permissions: { view: true, create: true, edit: false, delete: false, approve: false, export: true, print: true }
        };
        setUsersList(prev => [newUserObj, ...prev]);
        logAuditAction('Created User Account', 'User Management', userData.employeeCode, undefined, `Provisioned user for ${userData.displayName} (${userData.employeeCode})`);
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error };
      }
    } catch (e) {
      // Local fallback
      const newUserObj: User = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        userId: userData.employeeCode,
        employeeCode: userData.employeeCode,
        name: userData.displayName,
        email: userData.email,
        role: userData.roles[0] || 'Sales Executive',
        roles: userData.roles,
        status: 'INITIAL',
        mustChangePassword: true,
        designationTitle: userData.designationTitle,
        department: userData.department,
        allowedModules: userData.allowedModules,
        menuPermissions: userData.menuPermissions,
        permissions: { view: true, create: true, edit: false, delete: false, approve: false, export: true, print: true }
      };
      setUsersList(prev => [newUserObj, ...prev]);
      logAuditAction('Created User Account', 'User Management', userData.employeeCode, undefined, `Provisioned user for ${userData.displayName}`);
      return { success: true };
    }
  };

  const updateUser = async (userId: string, updatedFields: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId || u.userId === userId) {
        return {
          ...u,
          ...updatedFields,
          name: updatedFields.name !== undefined ? updatedFields.name : u.name,
          displayName: updatedFields.name !== undefined ? updatedFields.name : (u as any).displayName,
          designationTitle: updatedFields.designationTitle !== undefined ? updatedFields.designationTitle : u.designationTitle,
          department: updatedFields.department !== undefined ? updatedFields.department : u.department,
          division: (updatedFields as any).division !== undefined ? (updatedFields as any).division : (u as any).division,
          email: updatedFields.email !== undefined ? updatedFields.email : u.email,
          mobile: updatedFields.mobile !== undefined ? updatedFields.mobile : u.mobile,
          roles: updatedFields.roles !== undefined ? updatedFields.roles : u.roles,
          role: updatedFields.role !== undefined ? updatedFields.role : (updatedFields.roles ? updatedFields.roles[0] : u.role)
        };
      }
      return u;
    }));

    // If current logged-in user is updated, update currentUser state
    if (currentUser.id === userId || currentUser.userId === userId) {
      setCurrentUser(prev => ({
        ...prev,
        ...updatedFields,
        name: updatedFields.name !== undefined ? updatedFields.name : prev.name,
        designationTitle: updatedFields.designationTitle !== undefined ? updatedFields.designationTitle : prev.designationTitle,
        department: updatedFields.department !== undefined ? updatedFields.department : prev.department
      }));
    }

    try {
      await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: updatedFields.name,
          email: updatedFields.email,
          mobile: updatedFields.mobile,
          designationTitle: updatedFields.designationTitle,
          department: updatedFields.department,
          roles: updatedFields.roles
        })
      });
    } catch (e) {}

    logAuditAction('Updated User Profile', 'User Management', userId, undefined, `Updated details for ${updatedFields.name || userId}`);
    return { success: true };
  };

  const updateUserStatus = (userId: string, newStatus: string, isActive?: boolean, isLocked?: boolean, reason?: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId || u.userId === userId) {
        return {
          ...u,
          status: newStatus as any,
          isActive: isActive !== undefined ? isActive : newStatus === 'ACTIVE',
          isLocked: isLocked !== undefined ? isLocked : newStatus === 'LOCKED'
        };
      }
      return u;
    }));

    try {
      fetch(`http://127.0.0.1:5000/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, isActive, isLocked, reason })
      });
    } catch (e) {}

    logAuditAction('User Status Changed', 'User Management', userId, undefined, `${newStatus} (Reason: ${reason || 'Admin Action'})`);
  };

  const resetUserPassword = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId || u.userId === userId) {
        return {
          ...u,
          status: 'INITIAL',
          mustChangePassword: true
        };
      }
      return u;
    }));

    try {
      fetch(`http://127.0.0.1:5000/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newTempPassword: 'User@12345' })
      });
    } catch (e) {}

    logAuditAction('Reset Password', 'User Management', userId, 'Active Password', 'Temporary Password Set');
  };

  const saveRole = (role: UserRoleDefinition) => {
    setRolesList(prev => {
      const idx = prev.findIndex(r => r.id === role.id || r.roleName === role.roleName);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = role;
        return updated;
      }
      return [...prev, role];
    });
    logAuditAction('Updated Role Permissions', 'Role Management', role.roleName, undefined, JSON.stringify(role.menuPermissions));
  };

  const transferEmployee = (userId: string, newDesigId: string, newDept: string): { success: boolean; error?: string } => {
    const user = usersList.find(u => u.id === userId || u.userId === userId);
    if (!user) return { success: false, error: 'User not found.' };

    const desig = designationsList.find(d => d.designationId === newDesigId);
    if (!desig) return { success: false, error: 'Designation not found.' };

    // Update user designation history
    const newHist: UserDesignationHistory = {
      id: `DH-${Date.now()}`,
      userId: user.userId || user.id,
      employeeCode: user.employeeCode || user.id,
      designationId: desig.designationId,
      designationTitle: desig.name,
      department: newDept,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      isActive: true,
      assignedBy: currentUser.name,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setDesignationHistories(prev => [newHist, ...prev.map(h => h.userId === user.userId ? { ...h, isActive: false, status: 'TRANSFERRED' as any, endDate: new Date().toISOString().split('T')[0] } : h)]);

    setUsersList(prev => prev.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          designationTitle: desig.name,
          department: newDept
        };
      }
      return u;
    }));

    logAuditAction('Transferred Employee', 'Organogram', user.userId || user.id, user.designationTitle, `${desig.name} in ${newDept}`);
    return { success: true };
  };

  const setCurrentUserRole = (role: UserRole) => {
    const found = usersList.find(u => u.role === role) || {
      id: 'USR-SW',
      userId: `THL-EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: `User (${role})`,
      email: `${role.toLowerCase().replace('/', '')}@tayeebahousing.com`,
      role: role,
      roles: [role],
      status: 'ACTIVE',
      mustChangePassword: false,
      permissions: { view: true, create: true, edit: role !== 'Sales Executive', delete: role === 'Super Admin', approve: ['Super Admin', 'CEO/Director', 'Accounts'].includes(role), export: true, print: true }
    };
    setCurrentUser(found);
  };

  const logAuditAction = (action: string, moduleName: string, recordId: string, oldValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      userName: currentUser.name,
      userRole: currentUser.role,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      action,
      module: moduleName,
      recordId,
      oldValue,
      newValue,
      ipAddress: '103.114.98.' + Math.floor(Math.random() * 50 + 10)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'leadId' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `LED-${Date.now().toString().slice(-5)}`,
      leadId: `THL-LD-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [newLead, ...prev]);
    logAuditAction('Created Lead', 'CRM & Leads', newLead.leadId, undefined, `Lead ${newLead.name} (${newLead.phone})`);
  };

  const addSiteVisit = (visitData: Omit<SiteVisit, 'id'>) => {
    const newVisit: SiteVisit = {
      ...visitData,
      id: `SV-${Date.now().toString().slice(-5)}`
    };
    setSiteVisits(prev => [newVisit, ...prev]);
    logAuditAction('Scheduled Site Visit', 'Site Visit', newVisit.id, undefined, `Visit for ${newVisit.clientName} on ${newVisit.visitDate}`);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'customerId' | 'totalPaid' | 'totalDue'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `CUST-${Date.now().toString().slice(-5)}`,
      customerId: `THL-CUST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      totalPaid: 0,
      totalDue: customerData.totalPlotValue - customerData.totalDiscount
    };
    setCustomers(prev => [newCustomer, ...prev]);
    logAuditAction('Added Customer', 'Customers', newCustomer.customerId, undefined, `Customer ${newCustomer.name} (${newCustomer.mobile})`);
    return newCustomer;
  };

  const createBooking = (data: {
    customerId: string;
    projectId: string;
    plotId: string;
    totalPrice: number;
    discount: number;
    bookingMoney: number;
    downPayment: number;
    durationMonths: number;
    frequency: 'Monthly' | 'Quarterly';
    firstInstallmentDate: string;
    salesExecutiveId: string;
    salesExecutiveName: string;
  }): Booking => {
    const customer = customers.find(c => c.id === data.customerId);
    const plot = plots.find(p => p.id === data.plotId);
    const project = projects.find(pr => pr.id === data.projectId);

    if (!customer || !plot || !project) {
      throw new Error("Customer, Plot or Project not found");
    }

    const finalPrice = data.totalPrice - data.discount;
    const remainingForInstallments = finalPrice - (data.bookingMoney + data.downPayment);
    const numInstallments = Math.ceil(data.durationMonths / (data.frequency === 'Monthly' ? 1 : 3));
    const installmentAmount = Math.round(remainingForInstallments / numInstallments);

    const bookingId = `BKG-${Date.now().toString().slice(-6)}`;
    const bookingNumber = `THL-BK-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking: Booking = {
      id: bookingId,
      bookingNumber,
      customerId: customer.id,
      customerName: customer.name,
      projectId: project.id,
      projectName: project.name,
      plotId: plot.id,
      plotNumber: plot.plotNumber,
      plotSizeKatha: plot.sizeKatha,
      totalPrice: data.totalPrice,
      discount: data.discount,
      finalPrice,
      bookingMoney: data.bookingMoney,
      downPayment: data.downPayment,
      remainingAmount: remainingForInstallments,
      installmentDurationMonths: data.durationMonths,
      numberOfInstallments: numInstallments,
      frequency: data.frequency,
      firstInstallmentDate: data.firstInstallmentDate,
      agreementDate: new Date().toISOString().split('T')[0],
      salesExecutiveId: data.salesExecutiveId,
      salesExecutiveName: data.salesExecutiveName,
      bookingDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    // Update Plot Status to 'Booked'
    setPlots(prev => prev.map(p => p.id === plot.id ? {
      ...p,
      status: 'Booked',
      customerId: customer.id,
      customerName: customer.name,
      salesExecutiveId: data.salesExecutiveId,
      salesExecutiveName: data.salesExecutiveName,
      bookingDate: newBooking.bookingDate,
      finalPrice: newBooking.finalPrice
    } : p));

    // Update Customer details
    setCustomers(prev => prev.map(c => c.id === customer.id ? {
      ...c,
      linkedPlotId: plot.id,
      linkedPlotNumber: plot.plotNumber,
      linkedProjectId: project.id,
      linkedProjectName: project.name,
      totalPlotValue: finalPrice,
      totalPaid: c.totalPaid + data.bookingMoney,
      totalDue: finalPrice - (c.totalPaid + data.bookingMoney)
    } : c));

    // Generate Installment Schedule
    const newInstallments: Installment[] = [];
    const startDate = new Date(data.firstInstallmentDate);

    for (let i = 1; i <= numInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1) * (data.frequency === 'Monthly' ? 1 : 3));

      newInstallments.push({
        id: `INS-${bookingId}-${i}`,
        bookingId,
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        dueAmount: i === numInstallments ? remainingForInstallments - (installmentAmount * (numInstallments - 1)) : installmentAmount,
        paidAmount: 0,
        remainingAmount: i === numInstallments ? remainingForInstallments - (installmentAmount * (numInstallments - 1)) : installmentAmount,
        status: 'Due'
      });
    }

    setInstallments(prev => [...prev, ...newInstallments]);
    setBookings(prev => [newBooking, ...prev]);

    // Record Money Receipt for Booking Money
    const receiptId = `RCP-${Date.now().toString().slice(-6)}`;
    const receiptNumber = `THL-MR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReceipt: PaymentReceipt = {
      id: receiptId,
      receiptNumber,
      customerId: customer.id,
      customerName: customer.name,
      projectId: project.id,
      projectName: project.name,
      plotId: plot.id,
      plotNumber: plot.plotNumber,
      paymentType: 'Booking Money',
      amount: data.bookingMoney,
      paymentMethod: 'Cash',
      date: new Date().toISOString().split('T')[0],
      receivedBy: currentUser.name,
      authorizedSignature: 'Signed',
      remarks: 'Initial Booking Money Received'
    };

    setReceipts(prev => [newReceipt, ...prev]);

    // Post double entry journal voucher
    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: bookingNumber,
      description: `Plot Booking: ${plot.plotNumber} (${project.name}) by ${customer.name}`,
      lines: [
        { accountCode: '1010', accountName: 'Cash in Hand', debit: data.bookingMoney, credit: 0 },
        { accountCode: '1030', accountName: 'Customer Receivables', debit: finalPrice - data.bookingMoney, credit: 0 },
        { accountCode: '4010', accountName: 'Plot Sales Revenue', debit: 0, credit: finalPrice }
      ],
      createdBy: currentUser.name,
      status: 'Posted'
    });

    logAuditAction('Created Booking', 'Bookings', bookingNumber, 'Plot Available', `Booked Plot ${plot.plotNumber} for BDT ${finalPrice}`);

    return newBooking;
  };

  const recordPayment = (payment: {
    customerId: string;
    projectId: string;
    plotId: string;
    bookingId?: string;
    paymentType: PaymentReceipt['paymentType'];
    amount: number;
    paymentMethod: PaymentReceipt['paymentMethod'];
    bankName?: string;
    chequeOrTxnNo?: string;
    remarks?: string;
  }): PaymentReceipt => {
    const customer = customers.find(c => c.id === payment.customerId);
    const plot = plots.find(p => p.id === payment.plotId);
    const project = projects.find(pr => pr.id === payment.projectId);

    const receiptId = `RCP-${Date.now().toString().slice(-6)}`;
    const receiptNumber = `THL-MR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReceipt: PaymentReceipt = {
      id: receiptId,
      receiptNumber,
      customerId: customer?.id || payment.customerId,
      customerName: customer?.name || 'Customer',
      projectId: project?.id || payment.projectId,
      projectName: project?.name || 'Project',
      plotId: plot?.id || payment.plotId,
      plotNumber: plot?.plotNumber || 'Plot',
      paymentType: payment.paymentType,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      bankName: payment.bankName,
      chequeOrTxnNo: payment.chequeOrTxnNo,
      date: new Date().toISOString().split('T')[0],
      receivedBy: currentUser.name,
      authorizedSignature: 'Signed',
      remarks: payment.remarks
    };

    setReceipts(prev => [newReceipt, ...prev]);

    // Update Customer Ledger Balance
    setCustomers(prev => prev.map(c => c.id === payment.customerId ? {
      ...c,
      totalPaid: c.totalPaid + payment.amount,
      totalDue: Math.max(0, c.totalDue - payment.amount)
    } : c));

    // Update Next Due Installment
    if (payment.bookingId) {
      setInstallments(prev => {
        let amtLeft = payment.amount;
        return prev.map(ins => {
          if (ins.bookingId === payment.bookingId && ins.status !== 'Paid' && amtLeft > 0) {
            const payForThis = Math.min(amtLeft, ins.remainingAmount);
            amtLeft -= payForThis;
            const newPaid = ins.paidAmount + payForThis;
            const newRem = ins.dueAmount - newPaid;
            return {
              ...ins,
              paidAmount: newPaid,
              remainingAmount: newRem,
              status: newRem === 0 ? 'Paid' : 'Partially Paid',
              paymentDate: new Date().toISOString().split('T')[0],
              paymentMethod: payment.paymentMethod
            };
          }
          return ins;
        });
      });
    }

    // Double Entry Journal Post
    const debitAccount = payment.paymentMethod === 'Cash' ? '1010' : '1020';
    const debitAccountName = payment.paymentMethod === 'Cash' ? 'Cash in Hand' : 'Bank Accounts';

    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: receiptNumber,
      description: `Payment Collection (${payment.paymentType}): ${customer?.name} - ${plot?.plotNumber}`,
      lines: [
        { accountCode: debitAccount, accountName: debitAccountName, debit: payment.amount, credit: 0 },
        { accountCode: '1030', accountName: 'Customer Receivables', debit: 0, credit: payment.amount }
      ],
      createdBy: currentUser.name,
      status: 'Posted'
    });

    logAuditAction('Recorded Payment', 'Collections', receiptNumber, undefined, `Collected BDT ${payment.amount} (${payment.paymentType})`);

    return newReceipt;
  };

  const cancelBooking = (bookingId: string, cancellationCharge: number, reason: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    setPlots(prev => prev.map(p => p.id === booking.plotId ? { ...p, status: 'Available', customerId: undefined, customerName: undefined } : p));

    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: `CAN-${booking.bookingNumber}`,
      description: `Cancellation of Booking ${booking.bookingNumber}. Reason: ${reason}`,
      lines: [
        { accountCode: '4010', accountName: 'Plot Sales Revenue', debit: booking.finalPrice, credit: 0 },
        { accountCode: '1030', accountName: 'Customer Receivables', debit: 0, credit: booking.finalPrice - cancellationCharge },
        { accountCode: '4030', accountName: 'Cancellation Fee Income', debit: 0, credit: cancellationCharge }
      ],
      createdBy: currentUser.name,
      status: 'Posted'
    });

    logAuditAction('Cancelled Booking', 'Bookings', booking.bookingNumber, 'Active', `Cancelled with charge BDT ${cancellationCharge}`);
  };

  const transferPlot = (plotId: string, fromCustomerId: string, toCustomerId: string, transferFee: number) => {
    const plot = plots.find(p => p.id === plotId);
    const toCustomer = customers.find(c => c.id === toCustomerId);
    const fromCustomer = customers.find(c => c.id === fromCustomerId);

    if (!plot || !toCustomer || !fromCustomer) return;

    setPlots(prev => prev.map(p => p.id === plotId ? { ...p, customerId: toCustomer.id, customerName: toCustomer.name } : p));
    setBookings(prev => prev.map(b => b.plotId === plotId ? { ...b, customerId: toCustomer.id, customerName: toCustomer.name } : b));

    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: `TRF-${plot.plotNumber}`,
      description: `Plot Transfer: ${plot.plotNumber} from ${fromCustomer.name} to ${toCustomer.name}`,
      lines: [
        { accountCode: '1010', accountName: 'Cash in Hand', debit: transferFee, credit: 0 },
        { accountCode: '4020', accountName: 'Plot Transfer Fee Revenue', debit: 0, credit: transferFee }
      ],
      createdBy: currentUser.name,
      status: 'Posted'
    });

    logAuditAction('Transferred Plot', 'Plot Transfer', plot.plotNumber, fromCustomer.name, `Transferred to ${toCustomer.name}`);
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'expenseId'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `EXP-${Date.now().toString().slice(-5)}`,
      expenseId: `THL-EXP-${Math.floor(100 + Math.random() * 900)}`
    };
    setExpenses(prev => [newExpense, ...prev]);

    const creditAccount = expenseData.paymentMethod === 'Cash' ? '1010' : '1020';
    const creditAccountName = expenseData.paymentMethod === 'Cash' ? 'Cash in Hand' : 'Bank Accounts';

    addJournalEntry({
      date: expenseData.date,
      reference: newExpense.expenseId,
      description: `Expense: ${expenseData.category} - ${expenseData.description}`,
      lines: [
        { accountCode: '5010', accountName: 'General Administrative Expenses', debit: expenseData.amount, credit: 0 },
        { accountCode: creditAccount, accountName: creditAccountName, debit: 0, credit: expenseData.amount }
      ],
      createdBy: currentUser.name,
      status: 'Posted'
    });

    logAuditAction('Logged Expense', 'Expenses', newExpense.expenseId, undefined, `Expense BDT ${expenseData.amount} for ${expenseData.category}`);
  };

  const addJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'voucherNumber'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `JV-${Date.now().toString().slice(-6)}`,
      voucherNumber: `THL-JV-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  const addLandParcel = (landData: Omit<LandParcel, 'id'>) => {
    const newLand: LandParcel = {
      ...landData,
      id: `LND-${Date.now().toString().slice(-4)}`
    };
    setLandParcels(prev => [newLand, ...prev]);
    logAuditAction('Added Land Parcel', 'Land Acquisition', `${newLand.mouza} (Dag ${newLand.dagNumber})`, undefined, `Acquired ${newLand.landAreaDecimal} decimals from ${newLand.ownerName}`);
  };

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'employeeId'>) => {
    const newEmp: Employee = {
      ...employeeData,
      id: `EMP-${Date.now().toString().slice(-4)}`,
      employeeId: `THL-EMP-${Math.floor(100 + Math.random() * 900)}`
    };
    setEmployees(prev => [newEmp, ...prev]);
    logAuditAction('Added Employee', 'HR & Payroll', newEmp.employeeId, undefined, `Employee ${newEmp.name} (${newEmp.department})`);
  };

  const processPayroll = (month: string, year: number) => {
    const newPayrolls: Payroll[] = employees.filter(e => e.status === 'Active').map(emp => {
      const bonus = emp.department === 'Sales' ? 15000 : 0;
      return {
        id: `PAY-${emp.id}-${month}-${year}`,
        month,
        year,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        baseSalary: emp.baseSalary,
        commissionBonus: bonus,
        advanceDeductions: 0,
        netSalary: emp.baseSalary + bonus,
        paymentStatus: 'Paid',
        paymentDate: new Date().toISOString().split('T')[0]
      };
    });

    setPayrolls(prev => [...newPayrolls, ...prev]);
    const totalPayroll = newPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: `PAY-${month}-${year}`,
      description: `Payroll Salary Disbursement for ${month} ${year}`,
      lines: [
        { accountCode: '5010', accountName: 'General Administrative Expenses (Salaries)', debit: totalPayroll, credit: 0 },
        { accountCode: '1020', accountName: 'Bank Accounts (Payroll)', debit: 0, credit: totalPayroll }
      ],
      createdBy: currentUser.name,
      status: 'Posted'
    });

    logAuditAction('Processed Payroll', 'HR & Payroll', `${month} ${year}`, undefined, `Disbursed BDT ${totalPayroll} to ${newPayrolls.length} employees`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <ERPContext.Provider value={{
      currentTab,
      setCurrentTab,
      sidebarCollapsed,
      setSidebarCollapsed,
      currentUser,
      setCurrentUserRole,
      language,
      setLanguage,
      searchQuery,
      setSearchQuery,
      isAuthenticated,
      mustChangePassword,
      login,
      logout,
      changePassword,
      hasPermission,
      usersList,
      rolesList,
      designationsList,
      designationHistories,
      loginHistories,
      createUser,
      updateUser,
      updateUserStatus,
      resetUserPassword,
      saveRole,
      transferEmployee,
      projects,
      plots,
      customers,
      leads,
      siteVisits,
      bookings,
      installments,
      receipts,
      accounts,
      journalEntries,
      expenses,
      landParcels,
      commissions,
      vendors,
      employees,
      payrolls,
      auditLogs,
      notifications,
      addLead,
      addSiteVisit,
      addCustomer,
      createBooking,
      recordPayment,
      cancelBooking,
      transferPlot,
      addExpense,
      addJournalEntry,
      addLandParcel,
      addEmployee,
      processPayroll,
      markNotificationRead,
      logAuditAction
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
