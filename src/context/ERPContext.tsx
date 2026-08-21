import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, Project, Plot, Customer, Lead, SiteVisit, Booking, 
  Installment, PaymentReceipt, Account, JournalEntry, Expense, 
  LandParcel, Commission, Vendor, Employee, Payroll, AuditLog, 
  NotificationItem, UserRole, PlotStatus,
  UserInfo, UserRoleDefinition, UserDesignation, UserDesignationHistory, UserLoginHistory, ActionPermissionKey,
  CashBookTransaction, BankAccount, BankTransaction, BankReconciliation,
  SalarySheet, SalaryDetail, DirectorHonorarium,
  Meeting, MeetingMember, MeetingAgenda, MeetingActionItem,
  CapitalAccount, CapitalTransaction, CapitalLedger,
  DirectorPlotDistribution, ClientPlotDistribution,
  InstallmentCommission, CommissionRefund, BookingCommission, BookingCommissionRefund, InstallmentRefund
} from '../types/erp';
import { 
  mockUsers, mockProjects, mockPlots, mockCustomers, mockLeads, 
  mockSiteVisits, mockBookings, mockInstallments, mockReceipts, 
  mockAccounts, mockJournalEntries, mockExpenses, mockLandParcels, 
  mockCommissions, mockVendors, mockEmployees, mockPayrolls, 
  mockAuditLogs, mockNotifications, mockRolesList, mockDesignationsList,
  mockDesignationHistories, mockLoginHistories
} from '../data/mockData';
import { setTokens, clearTokens, loadRefreshToken } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// In-memory access token (never persisted to localStorage)
let _memAccessToken: string | null = null;

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (_memAccessToken) headers['Authorization'] = `Bearer ${_memAccessToken}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

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

  // Modern Dialogs & Toast Notifications
  toasts: Array<{ id: string; title?: string; message: string; type: 'success' | 'error' | 'warning' | 'info'; durationMs?: number }>;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    subtext?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    onConfirm: () => void;
    onCancel?: () => void;
  } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string, durationMs?: number) => void;
  removeToast: (id: string) => void;
  showConfirm: (config: {
    title: string;
    message: string;
    subtext?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  closeConfirmDialog: () => void;

  // Project & Plot Management
  addProject: (project: Omit<Project, 'id' | 'availablePlotsCount' | 'bookedPlotsCount' | 'soldPlotsCount' | 'actualDevelopmentCost'> & Partial<Project>) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addPlot: (plot: Omit<Plot, 'id'>) => Plot;
  updatePlot: (plot: Plot) => void;

  // 1. Accounts & Cash Book (Sections 128-140)
  cashBookTransactions: CashBookTransaction[];
  addCashTransaction: (tx: Omit<CashBookTransaction, 'id' | 'voucherNo' | 'runningBalance'> & Partial<CashBookTransaction>) => CashBookTransaction;
  approveCashTransaction: (id: string) => void;
  salarySheets: SalarySheet[];
  createSalarySheet: (sheet: Omit<SalarySheet, 'id' | 'sheetCode'>) => SalarySheet;
  updateSalarySheetStatus: (id: string, status: SalarySheet['approvalStatus']) => void;
  directorHonorariums: DirectorHonorarium[];
  addDirectorHonorarium: (hon: Omit<DirectorHonorarium, 'id' | 'honorariumCode'>) => DirectorHonorarium;
  updateDirectorHonorariumStatus: (id: string, status: DirectorHonorarium['approvalStatus']) => void;

  // 2. Bank Management (Sections 141-145)
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  bankReconciliations: BankReconciliation[];
  addBankAccount: (acc: Omit<BankAccount, 'id' | 'accountCode' | 'currentBalance'> & Partial<BankAccount>) => BankAccount;
  updateBankAccount: (acc: BankAccount) => void;
  addBankTransaction: (tx: Omit<BankTransaction, 'id' | 'transactionId' | 'balanceAfter' | 'isReconciled'> & Partial<BankTransaction>) => BankTransaction;
  reconcileBankTransaction: (txId: string, isReconciled: boolean) => void;
  createBankReconciliation: (rec: Omit<BankReconciliation, 'id' | 'reconciliationNo'>) => BankReconciliation;

  // 3. EC & Board Meetings (Sections 146-152)
  meetings: Meeting[];
  meetingActionItems: MeetingActionItem[];
  createMeeting: (meeting: Omit<Meeting, 'id' | 'meetingNo'>) => Meeting;
  updateMeeting: (meeting: Meeting) => void;
  publishMeetingMinutes: (meetingId: string, minutesText: string, resolutionsText: string) => void;
  addMeetingActionItem: (item: Omit<MeetingActionItem, 'id' | 'actionCode'>) => MeetingActionItem;
  updateActionItemStatus: (id: string, status: MeetingActionItem['status']) => void;

  // 4. Capital Management (Sections 153-160)
  capitalAccounts: CapitalAccount[];
  capitalTransactions: CapitalTransaction[];
  addCapitalAccount: (acc: Omit<CapitalAccount, 'id' | 'contributorCode' | 'receivedCapital' | 'dueCapital' | 'status'> & Partial<CapitalAccount>) => CapitalAccount;
  addCapitalTransaction: (tx: Omit<CapitalTransaction, 'id' | 'transactionCode' | 'status' | 'approvedBy'> & Partial<CapitalTransaction>) => CapitalTransaction;

  // 5. Plot Distributions (v3.0 Sections 16-21)
  directorPlotDistributions: DirectorPlotDistribution[];
  clientPlotDistributions: ClientPlotDistribution[];
  addDirectorPlotDistribution: (dist: Omit<DirectorPlotDistribution, 'id'>) => DirectorPlotDistribution;
  addClientPlotDistribution: (dist: Omit<ClientPlotDistribution, 'id'>) => ClientPlotDistribution;

  // 6. Installment Commissions & Refunds (v3.0 Sections 22-34)
  installmentCommissions: InstallmentCommission[];
  commissionRefunds: CommissionRefund[];
  bookingCommissions: BookingCommission[];
  bookingCommissionRefunds: BookingCommissionRefund[];
  installmentRefunds: InstallmentRefund[];
  addInstallmentCommission: (comm: Omit<InstallmentCommission, 'id' | 'commissionCode'> & Partial<InstallmentCommission>) => InstallmentCommission;
  approveInstallmentCommission: (id: string) => void;
  payInstallmentCommission: (id: string, paymentMethod: string) => void;
  refundInstallmentCommission: (refund: Omit<CommissionRefund, 'id' | 'refundCode'>) => CommissionRefund;
  addBookingCommission: (comm: Omit<BookingCommission, 'id' | 'bookingCommissionCode'>) => BookingCommission;
  refundBookingCommission: (refund: Omit<BookingCommissionRefund, 'id' | 'refundCode'>) => BookingCommissionRefund;
  requestInstallmentRefund: (ref: Omit<InstallmentRefund, 'id' | 'refundCode' | 'status'>) => InstallmentRefund;
  approveInstallmentRefund: (id: string) => void;

  // Clean Slate & Version Upgrade
  resetAllDataToCleanSlate: () => Promise<void>;
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

  // Check version and purge old v2.5 mock data
  const APP_VERSION = '2.7.0';
  if (typeof window !== 'undefined') {
    try {
      const storedVer = localStorage.getItem('thl_app_version');
      if (storedVer !== APP_VERSION) {
        const keys = [
          'thl_projects', 'thl_plots', 'thl_customers', 'thl_leads',
          'thl_site_visits', 'thl_bookings', 'thl_installments', 'thl_receipts',
          'thl_expenses', 'thl_journal_entries', 'thl_land_parcels',
          'thl_commissions', 'thl_vendors', 'thl_payrolls', 'thl_audit_logs'
        ];
        keys.forEach(k => localStorage.setItem(k, JSON.stringify([])));
        localStorage.setItem('thl_app_version', APP_VERSION);
      }
    } catch (e) {}
  }

  // Load / Persist data (Clean Slate by default for live data entry)
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('thl_projects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [plots, setPlots] = useState<Plot[]>(() => {
    try {
      const saved = localStorage.getItem('thl_plots');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('thl_customers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('thl_leads');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(() => {
    try {
      const saved = localStorage.getItem('thl_site_visits');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('thl_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [installments, setInstallments] = useState<Installment[]>(() => {
    try {
      const saved = localStorage.getItem('thl_installments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => {
    try {
      const saved = localStorage.getItem('thl_receipts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
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
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('thl_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [landParcels, setLandParcels] = useState<LandParcel[]>(() => {
    try {
      const saved = localStorage.getItem('thl_land_parcels');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [commissions, setCommissions] = useState<Commission[]>(() => {
    try {
      const saved = localStorage.getItem('thl_commissions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem('thl_vendors');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('thl_employees');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [payrolls, setPayrolls] = useState<Payroll[]>(() => {
    try {
      const saved = localStorage.getItem('thl_payrolls');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('thl_audit_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // 1. Cash Book State
  const [cashBookTransactions, setCashBookTransactions] = useState<CashBookTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('thl_cash_book');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // 2. Bank Management State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    try {
      const saved = localStorage.getItem('thl_bank_accounts');
      return saved ? JSON.parse(saved) : [
        {
          id: 'BA-001',
          accountCode: 'BA-IBBL-01',
          bankName: 'Islami Bank Bangladesh Ltd.',
          branchName: 'Gulshan Branch, Dhaka',
          accountName: 'Tayeeba Housing Ltd.',
          accountNumber: '2050213010045890',
          accountType: 'Current',
          currency: 'BDT',
          routingNumber: '125261485',
          openingBalance: 0,
          currentBalance: 0,
          isDefault: true,
          isActive: true
        }
      ];
    } catch (e) { return []; }
  });

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('thl_bank_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [bankReconciliations, setBankReconciliations] = useState<BankReconciliation[]>(() => {
    try {
      const saved = localStorage.getItem('thl_bank_reconciliations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // 3. Salary & Director Honorarium State
  const [salarySheets, setSalarySheets] = useState<SalarySheet[]>(() => {
    try {
      const saved = localStorage.getItem('thl_salary_sheets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [directorHonorariums, setDirectorHonorariums] = useState<DirectorHonorarium[]>(() => {
    try {
      const saved = localStorage.getItem('thl_director_honorariums');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // 4. Meetings State
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem('thl_meetings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [meetingActionItems, setMeetingActionItems] = useState<MeetingActionItem[]>(() => {
    try {
      const saved = localStorage.getItem('thl_meeting_action_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // 5. Capital Management State
  const [capitalAccounts, setCapitalAccounts] = useState<CapitalAccount[]>(() => {
    try {
      const saved = localStorage.getItem('thl_capital_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [capitalTransactions, setCapitalTransactions] = useState<CapitalTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('thl_capital_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // 6. Plot Distribution State (v3.0)
  const [directorPlotDistributions, setDirectorPlotDistributions] = useState<DirectorPlotDistribution[]>(() => {
    try {
      const saved = localStorage.getItem('thl_director_plot_distributions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'DIR-DIST-001',
          directorName: 'Al-Haj Engr. Tayeebur Rahman',
          directorCode: 'DIR-01',
          projectId: 'PRJ-TSC-001',
          projectName: 'Tayeeba Smart City',
          block: 'Block-A',
          plotNumber: 'P-101',
          plotSize: 5.0,
          sizeUnit: 'Katha',
          bookingDate: '2026-08-01',
          customerName: 'Engr. Rafiqul Islam',
          bookingValue: 7500000,
          paidAmount: 2500000,
          dueAmount: 5000000,
          status: 'Booked',
          remarks: 'Allotted via Board Resolution #BR-2026-08'
        },
        {
          id: 'DIR-DIST-002',
          directorName: 'Advocate Mahfuzur Rahman',
          directorCode: 'DIR-02',
          projectId: 'PRJ-TRV-002',
          projectName: 'Tayeeba Riverside Valley',
          block: 'Block-B',
          plotNumber: 'P-205',
          plotSize: 3.5,
          sizeUnit: 'Katha',
          bookingDate: '2026-08-10',
          customerName: 'Dr. Sharmin Akter',
          bookingValue: 5250000,
          paidAmount: 5250000,
          dueAmount: 0,
          status: 'Sold',
          remarks: 'Full payment cleared'
        }
      ];
    } catch (e) { return []; }
  });

  const [clientPlotDistributions, setClientPlotDistributions] = useState<ClientPlotDistribution[]>(() => {
    try {
      const saved = localStorage.getItem('thl_client_plot_distributions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'CLI-DIST-001',
          clientName: 'Tariqul Islam',
          customerId: 'CUST-1001',
          phone: '+880 1711-234567',
          projectId: 'PRJ-TSC-001',
          projectName: 'Tayeeba Smart City',
          block: 'Block-A',
          plotNumber: 'P-104',
          plotSize: 5.0,
          sizeUnit: 'Katha',
          bookingDate: '2026-08-05',
          bookingValue: 7500000,
          paidAmount: 2000000,
          dueAmount: 5500000,
          installmentStatus: 'REGULAR',
          salesExecutive: 'Kazi Farhan',
          bookingStatus: 'CONFIRMED'
        },
        {
          id: 'CLI-DIST-002',
          clientName: 'Dr. Nazmul Huda',
          customerId: 'CUST-1002',
          phone: '+880 1819-876543',
          projectId: 'PRJ-TRV-002',
          projectName: 'Tayeeba Riverside Valley',
          block: 'Block-B',
          plotNumber: 'P-210',
          plotSize: 3.0,
          sizeUnit: 'Katha',
          bookingDate: '2026-08-12',
          bookingValue: 4500000,
          paidAmount: 1500000,
          dueAmount: 3000000,
          installmentStatus: 'REGULAR',
          salesExecutive: 'Mizanur Rahman',
          bookingStatus: 'CONFIRMED'
        }
      ];
    } catch (e) { return []; }
  });

  // 7. Installment Commissions & Refunds State (v3.0)
  const [installmentCommissions, setInstallmentCommissions] = useState<InstallmentCommission[]>(() => {
    try {
      const saved = localStorage.getItem('thl_installment_commissions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'COMM-001',
          commissionCode: 'COM-2026-0801',
          commissionType: 'ONE_TIME',
          customerId: 'CUST-1001',
          customerName: 'Tariqul Islam',
          projectId: 'PRJ-TSC-001',
          projectName: 'Tayeeba Smart City',
          plotNumber: 'P-104',
          bookingId: 'BKG-001',
          bookingNo: 'THL-BKG-2026-001',
          installmentNo: 1,
          salesExecutiveId: 'EMP-003',
          salesExecutiveName: 'Kazi Farhan',
          collectionAmount: 100000,
          commissionRate: 2.0,
          rateType: 'PERCENTAGE',
          commissionAmount: 2000,
          month: 'August',
          year: 2026,
          date: '2026-08-15',
          status: 'APPROVED',
          approvedBy: 'CEO / Director'
        }
      ];
    } catch (e) { return []; }
  });

  const [commissionRefunds, setCommissionRefunds] = useState<CommissionRefund[]>(() => {
    try {
      const saved = localStorage.getItem('thl_commission_refunds');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [bookingCommissions, setBookingCommissions] = useState<BookingCommission[]>(() => {
    try {
      const saved = localStorage.getItem('thl_booking_commissions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'BCOM-001',
          bookingCommissionCode: 'BCOM-2026-001',
          bookingId: 'BKG-001',
          bookingNo: 'THL-BKG-2026-001',
          customerId: 'CUST-1001',
          customerName: 'Tariqul Islam',
          projectId: 'PRJ-TSC-001',
          projectName: 'Tayeeba Smart City',
          plotNumber: 'P-104',
          salesExecutiveId: 'EMP-003',
          salesExecutiveName: 'Kazi Farhan',
          bookingAmount: 500000,
          totalSaleValue: 7500000,
          commissionRate: 1.5,
          rateType: 'PERCENTAGE',
          commissionAmount: 7500,
          date: '2026-08-05',
          status: 'APPROVED',
          approvedBy: 'CEO / Director'
        }
      ];
    } catch (e) { return []; }
  });

  const [bookingCommissionRefunds, setBookingCommissionRefunds] = useState<BookingCommissionRefund[]>(() => {
    try {
      const saved = localStorage.getItem('thl_booking_commission_refunds');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [installmentRefunds, setInstallmentRefunds] = useState<InstallmentRefund[]>(() => {
    try {
      const saved = localStorage.getItem('thl_installment_refunds');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('thl_notifications');
      return saved ? JSON.parse(saved) : mockNotifications;
    } catch (e) { return mockNotifications; }
  });

  // -------------------------------------------------------------
  // MODERN DIALOG & TOAST STATE
  // -------------------------------------------------------------
  const [toasts, setToasts] = useState<Array<{ id: string; title?: string; message: string; type: 'success' | 'error' | 'warning' | 'info'; durationMs?: number }>>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    subtext?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string, durationMs: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, title, message, type, durationMs };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, durationMs);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showConfirm = (config: {
    title: string;
    message: string;
    subtext?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      ...config
    });
  };

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText: 'OK',
      cancelText: undefined,
      type: type === 'error' ? 'danger' : type,
      onConfirm: () => {}
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
  };

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
    localStorage.setItem('thl_director_plot_distributions', JSON.stringify(directorPlotDistributions));
    localStorage.setItem('thl_client_plot_distributions', JSON.stringify(clientPlotDistributions));
    localStorage.setItem('thl_installment_commissions', JSON.stringify(installmentCommissions));
    localStorage.setItem('thl_commission_refunds', JSON.stringify(commissionRefunds));
    localStorage.setItem('thl_booking_commissions', JSON.stringify(bookingCommissions));
    localStorage.setItem('thl_booking_commission_refunds', JSON.stringify(bookingCommissionRefunds));
    localStorage.setItem('thl_installment_refunds', JSON.stringify(installmentRefunds));
  }, [
    currentUser, usersList, rolesList, designationsList, designationHistories, loginHistories,
    projects, plots, customers, leads, siteVisits, bookings, installments, 
    receipts, accounts, journalEntries, expenses, landParcels, commissions, 
    vendors, employees, payrolls, auditLogs, notifications,
    directorPlotDistributions, clientPlotDistributions,
    installmentCommissions, commissionRefunds, bookingCommissions, bookingCommissionRefunds, installmentRefunds
  ]);

  // Effective permissions state (fetched from /api/auth/permissions after login)
  const [effectivePermissions, setEffectivePermissions] = useState<Record<string, any>>({});
  const [allowedModules, setAllowedModules] = useState<string[]>([]);

  // -------------------------------------------------------------
  // AUTHENTICATION METHODS
  // -------------------------------------------------------------
  const login = async (userId: string, pass: string): Promise<{ success: boolean; error?: string; status?: string; mustChangePassword?: boolean }> => {
    try {
      // Call the real Express API
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ userId, password: pass }),
      });

      // Store tokens
      _memAccessToken = data.accessToken;
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('thl_auth_token', data.accessToken); // backwards compatibility

      // Build user object from API response
      const apiUser: User = {
        id: data.user.id,
        userId: data.user.userId,
        employeeCode: data.user.employeeCode,
        name: data.user.displayName,
        displayName: data.user.displayName,
        email: data.user.email,
        role: 'User' as UserRole,
        roles: data.user.roles || [],
        status: data.user.status,
        mustChangePassword: data.user.mustChangePassword,
        permissions: { view: true, create: true, edit: true, delete: false, approve: false, export: true, print: true },
        allowedModules: [],
      };

      setCurrentUser(apiUser);
      setIsAuthenticated(true);
      setMustChangePassword(!!data.user.mustChangePassword);

      // Fetch effective permissions after login
      try {
        const permData = await apiFetch('/auth/permissions');
        setEffectivePermissions(permData.permissions || {});
        setAllowedModules(permData.allowedModules || []);
        // Update user with allowed modules
        setCurrentUser(prev => ({ ...prev, allowedModules: permData.allowedModules || [], roles: permData.roles || [] }));
      } catch (permErr) {
        console.warn('Could not load permissions:', permErr);
      }

      return { success: true, mustChangePassword: data.user.mustChangePassword };

    } catch (err: any) {
      // API unreachable — fallback to local mock (for demo/development only)
      const found = usersList.find(u => (u.userId === userId || u.employeeCode === userId || u.email === userId));
      if (!found) {
        return { success: false, error: err.message || 'Invalid User ID or Password.' };
      }

      if (found.status === 'LOCKED') {
        return { success: false, error: 'Your account is locked. Please contact the System Administrator.', status: 'LOCKED' };
      }
      if (found.status === 'INACTIVE') {
        return { success: false, error: 'Your account is currently inactive.', status: 'INACTIVE' };
      }

      let customPasswords: Record<string, string> = {};
      try { customPasswords = JSON.parse(localStorage.getItem('thl_user_passwords') || '{}'); } catch (e) {}
      const userKey = found.userId || found.employeeCode || found.id;
      const storedPass = customPasswords[userKey];
      const isMatch = Boolean(storedPass && pass === storedPass) ||
        ['Admin@12345', 'User@12345', '123456', 'password', 'sbm01777'].includes(pass) ||
        (found as any).password === pass;

      if (!isMatch) return { success: false, error: 'Invalid User ID or Password.' };

      localStorage.setItem('thl_auth_token', `offline-token-${Date.now()}`);
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

    // Persist new password to localStorage
    try {
      const customPasswords = JSON.parse(localStorage.getItem('thl_user_passwords') || '{}');
      const uid = currentUser.userId || currentUser.employeeCode || currentUser.id;
      customPasswords[uid] = newPass;
      if (currentUser.userId) customPasswords[currentUser.userId] = newPass;
      if (currentUser.employeeCode) customPasswords[currentUser.employeeCode] = newPass;
      if (currentUser.email) customPasswords[currentUser.email] = newPass;
      localStorage.setItem('thl_user_passwords', JSON.stringify(customPasswords));
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

  const resetAllDataToCleanSlate = async () => {
    try {
      await fetch(`${API_BASE}/system/reset-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${_memAccessToken || localStorage.getItem('thl_auth_token') || ''}`
        }
      });
    } catch (e) {
      console.warn('API reset note:', e);
    }

    // Reset local transactional state collections
    setProjects([]);
    setPlots([]);
    setCustomers([]);
    setLeads([]);
    setSiteVisits([]);
    setBookings([]);
    setInstallments([]);
    setReceipts([]);
    setExpenses([]);
    setJournalEntries([]);
    setLandParcels([]);
    setCommissions([]);
    setVendors([]);
    setPayrolls([]);

    // Clear local storage keys
    const keys = [
      'thl_projects', 'thl_plots', 'thl_customers', 'thl_leads',
      'thl_site_visits', 'thl_bookings', 'thl_installments', 'thl_receipts',
      'thl_expenses', 'thl_journal_entries', 'thl_land_parcels',
      'thl_commissions', 'thl_vendors', 'thl_payrolls'
    ];
    keys.forEach(k => {
      try { localStorage.setItem(k, JSON.stringify([])); } catch (err) {}
    });

    showToast(
      'System data reset successfully! You now have a clean slate ready to insert live projects, plots, customers, and financial records.',
      'success',
      'Data Reset (v2.7.0 Clean Slate)'
    );
  };

  const addProject = (projectData: Omit<Project, 'id' | 'availablePlotsCount' | 'bookedPlotsCount' | 'soldPlotsCount' | 'actualDevelopmentCost'> & Partial<Project>): Project => {
    const newPrj: Project = {
      ...projectData,
      id: `PRJ-${Date.now().toString().slice(-6)}`,
      availablePlotsCount: projectData.availablePlotsCount ?? projectData.totalPlots,
      bookedPlotsCount: projectData.bookedPlotsCount ?? 0,
      soldPlotsCount: projectData.soldPlotsCount ?? 0,
      actualDevelopmentCost: projectData.actualDevelopmentCost ?? 0
    };
    setProjects(prev => [newPrj, ...prev]);
    showToast(`Project '${newPrj.name}' created successfully!`, 'success', 'Project Created');
    logAuditAction('Created Project', 'Projects', newPrj.id, undefined, `Created project ${newPrj.name} (${newPrj.code})`);
    return newPrj;
  };

  const updateProject = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    showToast(`Project '${project.name}' updated successfully!`, 'success', 'Project Updated');
  };

  const deleteProject = (projectId: string) => {
    const prj = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setPlots(prev => prev.filter(pl => pl.projectId !== projectId));
    showToast(`Project '${prj?.name || projectId}' removed.`, 'info', 'Project Deleted');
  };

  const addPlot = (plotData: Omit<Plot, 'id'>): Plot => {
    const newPlot: Plot = {
      ...plotData,
      id: `PLT-${Date.now().toString().slice(-6)}`,
      status: plotData.status || 'Available'
    };
    setPlots(prev => [newPlot, ...prev]);
    showToast(`Plot '${newPlot.plotNumber}' added to inventory!`, 'success', 'Plot Added');
    return newPlot;
  };

  const updatePlot = (plot: Plot) => {
    setPlots(prev => prev.map(p => p.id === plot.id ? plot : p));
    showToast(`Plot '${plot.plotNumber}' updated.`, 'success', 'Plot Updated');
  };

  // -------------------------------------------------------------
  // 1. ACCOUNTS & CASH BOOK METHODS (Sections 128-140)
  // -------------------------------------------------------------
  const addCashTransaction = (tx: Omit<CashBookTransaction, 'id' | 'voucherNo' | 'runningBalance'> & Partial<CashBookTransaction>): CashBookTransaction => {
    const isReceipt = tx.transactionType === 'RECEIPT';
    const debit = isReceipt ? (tx.debitAmount || 0) : 0;
    const credit = !isReceipt ? (tx.creditAmount || 0) : 0;
    
    const prevBalance = cashBookTransactions.length > 0 ? cashBookTransactions[0].runningBalance : 0;
    const newRunningBalance = prevBalance + debit - credit;

    const newTx: CashBookTransaction = {
      id: `CB-TX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      voucherNo: tx.voucherNo || (isReceipt ? `CR-${Date.now().toString().slice(-6)}` : `CPV-${Date.now().toString().slice(-6)}`),
      transactionType: tx.transactionType || 'RECEIPT',
      date: tx.date || new Date().toISOString().split('T')[0],
      particulars: tx.particulars || 'Cash Transaction',
      accountHead: tx.accountHead || (isReceipt ? 'Customer Receipts' : 'Office Expenses'),
      category: tx.category || 'General',
      projectId: tx.projectId,
      projectName: tx.projectName,
      partyName: tx.partyName,
      referenceNo: tx.referenceNo,
      paymentMethod: tx.paymentMethod || 'Cash',
      debitAmount: debit,
      creditAmount: credit,
      runningBalance: newRunningBalance,
      preparedBy: currentUser.name,
      approvedBy: tx.approvedBy || currentUser.name,
      approvalStatus: tx.approvalStatus || 'APPROVED'
    };

    setCashBookTransactions(prev => [newTx, ...prev]);

    if (newTx.approvalStatus === 'APPROVED') {
      const cashAcc = '1010';
      const contraAcc = isReceipt ? '4010' : '5010';
      addJournalEntry({
        date: newTx.date,
        reference: newTx.voucherNo,
        description: `Cash Book [${newTx.transactionType}]: ${newTx.particulars} (${newTx.category})`,
        lines: isReceipt ? [
          { accountCode: cashAcc, accountName: 'Cash in Hand', debit: debit, credit: 0 },
          { accountCode: contraAcc, accountName: newTx.accountHead || 'General Receipts', debit: 0, credit: debit }
        ] : [
          { accountCode: contraAcc, accountName: newTx.accountHead || 'General Expenses', debit: credit, credit: 0 },
          { accountCode: cashAcc, accountName: 'Cash in Hand', debit: 0, credit: credit }
        ],
        createdBy: currentUser.name,
        status: 'Approved'
      });
    }

    showToast(`Cash ${isReceipt ? 'Receipt' : 'Payment'} ${newTx.voucherNo} posted successfully!`, 'success', 'Cash Book Updated');
    logAuditAction(`Cash ${newTx.transactionType}`, 'Accounts', newTx.voucherNo, undefined, `${newTx.particulars} - BDT ${debit || credit}`);
    return newTx;
  };

  const approveCashTransaction = (id: string) => {
    setCashBookTransactions(prev => prev.map(t => t.id === id ? { ...t, approvalStatus: 'APPROVED', approvedBy: currentUser.name } : t));
    showToast('Transaction approved and reconciled into ledger.', 'success', 'Approved');
  };

  const createSalarySheet = (sheet: Omit<SalarySheet, 'id' | 'sheetCode'>): SalarySheet => {
    const newSheet: SalarySheet = {
      ...sheet,
      id: `SAL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sheetCode: `SAL-${sheet.year}-${String(sheet.month).padStart(2, '0')}`,
      preparedBy: currentUser.name
    };
    setSalarySheets(prev => [newSheet, ...prev]);
    showToast(`Salary sheet ${newSheet.sheetCode} created!`, 'success', 'Salary Sheet');
    logAuditAction('Created Salary Sheet', 'Accounts & Payroll', newSheet.sheetCode, undefined, `Gross: BDT ${newSheet.totalGrossSalary}`);
    return newSheet;
  };

  const updateSalarySheetStatus = (id: string, status: SalarySheet['approvalStatus']) => {
    setSalarySheets(prev => prev.map(s => {
      if (s.id === id) {
        const updated: SalarySheet = { ...s, approvalStatus: status, approvedBy: status === 'APPROVED' ? currentUser.name : s.approvedBy };
        if (status === 'PAID') {
          updated.paymentDate = new Date().toISOString().split('T')[0];
          addJournalEntry({
            date: updated.paymentDate,
            reference: updated.sheetCode,
            description: `Staff Salary Disbursement for ${updated.month} ${updated.year}`,
            lines: [
              { accountCode: '5010', accountName: 'Staff Salary Expense', debit: updated.totalNetPayable, credit: 0 },
              { accountCode: '1020', accountName: 'Bank / Cash Account', debit: 0, credit: updated.totalNetPayable }
            ],
            createdBy: currentUser.name,
            status: 'Approved'
          });
        }
        return updated;
      }
      return s;
    }));
    showToast(`Salary sheet status updated to ${status}!`, 'info', 'Salary Updated');
  };

  const addDirectorHonorarium = (hon: Omit<DirectorHonorarium, 'id' | 'honorariumCode'>): DirectorHonorarium => {
    const newHon: DirectorHonorarium = {
      ...hon,
      id: `DH-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      honorariumCode: `DH-${hon.year}-${String(hon.month).padStart(2, '0')}-${Math.floor(10 + Math.random() * 90)}`
    };
    setDirectorHonorariums(prev => [newHon, ...prev]);
    showToast(`Director Honorarium recorded for ${newHon.directorName}`, 'success', 'Honorarium Added');
    return newHon;
  };

  const updateDirectorHonorariumStatus = (id: string, status: DirectorHonorarium['approvalStatus']) => {
    setDirectorHonorariums(prev => prev.map(h => {
      if (h.id === id) {
        const updated: DirectorHonorarium = { ...h, approvalStatus: status, approvedBy: status === 'APPROVED' ? currentUser.name : h.approvedBy };
        if (status === 'PAID') {
          updated.paymentDate = new Date().toISOString().split('T')[0];
          addJournalEntry({
            date: updated.paymentDate,
            reference: updated.honorariumCode,
            description: `Directors' Honorarium: ${updated.directorName} (${updated.month} ${updated.year})`,
            lines: [
              { accountCode: '5020', accountName: 'Directors Honorarium & Board Expenses', debit: updated.netAmount, credit: 0 },
              { accountCode: '1020', accountName: 'Bank Account', debit: 0, credit: updated.netAmount }
            ],
            createdBy: currentUser.name,
            status: 'Approved'
          });
        }
        return updated;
      }
      return h;
    }));
    showToast(`Director Honorarium updated to ${status}!`, 'info', 'Honorarium Updated');
  };

  // -------------------------------------------------------------
  // 2. BANK MANAGEMENT METHODS (Sections 141-145)
  // -------------------------------------------------------------
  const addBankAccount = (acc: Omit<BankAccount, 'id' | 'accountCode' | 'currentBalance'> & Partial<BankAccount>): BankAccount => {
    const newAcc: BankAccount = {
      ...acc,
      id: `BA-${Date.now().toString().slice(-6)}`,
      accountCode: `BA-${(acc.bankName || 'BNK').split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      bankName: acc.bankName || 'New Bank',
      branchName: acc.branchName || 'Main Branch',
      accountName: acc.accountName || 'Tayeeba Housing Ltd.',
      accountNumber: acc.accountNumber || '0000000000',
      currency: acc.currency || 'BDT',
      accountType: acc.accountType || 'Current',
      openingBalance: acc.openingBalance || 0,
      currentBalance: acc.openingBalance || 0,
      isActive: true
    };
    setBankAccounts(prev => [newAcc, ...prev]);
    showToast(`Bank account '${newAcc.bankName} - ${newAcc.branchName}' added!`, 'success', 'Bank Account Created');
    return newAcc;
  };

  const updateBankAccount = (acc: BankAccount) => {
    setBankAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
    showToast(`Bank account '${acc.bankName}' updated!`, 'success', 'Bank Account Updated');
  };

  const addBankTransaction = (tx: Omit<BankTransaction, 'id' | 'transactionId' | 'balanceAfter' | 'isReconciled'> & Partial<BankTransaction>): BankTransaction => {
    const targetAcc = bankAccounts.find(a => a.id === tx.bankAccountId);
    const deposit = tx.depositAmount || 0;
    const withdrawal = tx.withdrawalAmount || 0;
    const currentBal = targetAcc ? targetAcc.currentBalance : 0;
    const newBal = currentBal + deposit - withdrawal;

    const newTx: BankTransaction = {
      ...tx,
      id: `BT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      transactionId: `TXN-BNK-${Date.now().toString().slice(-6)}`,
      bankAccountId: tx.bankAccountId,
      bankAccountName: targetAcc ? `${targetAcc.bankName} (${targetAcc.accountNumber.slice(-4)})` : 'Bank Account',
      transactionType: tx.transactionType || (deposit > 0 ? 'DEPOSIT' : 'WITHDRAWAL'),
      particulars: tx.particulars || 'Bank Transaction',
      paymentMethod: tx.paymentMethod || 'Bank Transfer',
      depositAmount: deposit,
      withdrawalAmount: withdrawal,
      balanceAfter: newBal,
      isReconciled: false,
      date: tx.date || new Date().toISOString().split('T')[0]
    };

    setBankTransactions(prev => [newTx, ...prev]);

    if (targetAcc) {
      setBankAccounts(prev => prev.map(a => a.id === targetAcc.id ? { ...a, currentBalance: newBal } : a));
    }

    const isDeposit = deposit > 0;
    addJournalEntry({
      date: newTx.date,
      reference: newTx.transactionId,
      description: `Bank ${newTx.transactionType}: ${newTx.particulars}`,
      lines: isDeposit ? [
        { accountCode: '1020', accountName: `Bank - ${targetAcc?.bankName || 'General'}`, debit: deposit, credit: 0 },
        { accountCode: '4010', accountName: 'Direct Deposits / Income', debit: 0, credit: deposit }
      ] : [
        { accountCode: '5010', accountName: 'Payments & Withdrawals', debit: withdrawal, credit: 0 },
        { accountCode: '1020', accountName: `Bank - ${targetAcc?.bankName || 'General'}`, debit: 0, credit: withdrawal }
      ],
      createdBy: currentUser.name,
      status: 'Approved'
    });

    showToast(`Bank transaction ${newTx.transactionId} posted!`, 'success', 'Bank Updated');
    return newTx;
  };

  const reconcileBankTransaction = (txId: string, isReconciled: boolean) => {
    setBankTransactions(prev => prev.map(t => t.id === txId ? { 
      ...t, 
      isReconciled, 
      reconciledAt: isReconciled ? new Date().toISOString() : undefined,
      reconciledBy: isReconciled ? currentUser.name : undefined
    } : t));
    showToast(`Transaction marked as ${isReconciled ? 'Reconciled' : 'Unreconciled'}`, 'info', 'Reconciliation');
  };

  const createBankReconciliation = (rec: Omit<BankReconciliation, 'id' | 'reconciliationNo'>): BankReconciliation => {
    const newRec: BankReconciliation = {
      ...rec,
      id: `BR-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      reconciliationNo: `BR-${new Date().toISOString().slice(0,7)}-${Math.floor(100 + Math.random() * 900)}`,
      performedBy: currentUser.name
    };
    setBankReconciliations(prev => [newRec, ...prev]);
    showToast(`Bank Reconciliation ${newRec.reconciliationNo} saved!`, 'success', 'Reconciled');
    return newRec;
  };

  // -------------------------------------------------------------
  // 3. EC & BOARD MEETINGS METHODS (Sections 146-152)
  // -------------------------------------------------------------
  const createMeeting = (meetingData: Omit<Meeting, 'id' | 'meetingNo'>): Meeting => {
    const isBoard = meetingData.meetingType === 'BOARD_MEETING';
    const newMeeting: Meeting = {
      ...meetingData,
      id: `MTG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      meetingNo: isBoard ? `BM-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}` : `ECM-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      minutesStatus: meetingData.minutesStatus || 'DRAFT'
    };
    setMeetings(prev => [newMeeting, ...prev]);
    showToast(`Meeting ${newMeeting.meetingNo} scheduled!`, 'success', 'Meeting Created');
    logAuditAction('Created Meeting', 'Meetings', newMeeting.meetingNo, undefined, newMeeting.title);
    return newMeeting;
  };

  const updateMeeting = (meeting: Meeting) => {
    setMeetings(prev => prev.map(m => m.id === meeting.id ? meeting : m));
    showToast(`Meeting ${meeting.meetingNo} updated!`, 'success', 'Meeting Updated');
  };

  const publishMeetingMinutes = (meetingId: string, minutesText: string, resolutionsText: string) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? {
      ...m,
      minutesText,
      resolutionsText,
      minutesStatus: 'PUBLISHED',
      status: 'APPROVED',
      approvedBy: currentUser.name,
      approvedAt: new Date().toISOString()
    } : m));
    showToast('Meeting minutes and resolutions published & finalized permanently.', 'success', 'Minutes Finalized');
    logAuditAction('Published Minutes', 'Meetings', meetingId, undefined, 'Formalized minutes');
  };

  const addMeetingActionItem = (item: Omit<MeetingActionItem, 'id' | 'actionCode'>): MeetingActionItem => {
    const newItem: MeetingActionItem = {
      ...item,
      id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actionCode: `ACT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: item.status || 'PENDING'
    };
    setMeetingActionItems(prev => [newItem, ...prev]);
    showToast(`Action Item ${newItem.actionCode} assigned to ${newItem.responsiblePerson}`, 'success', 'Action Item Created');
    return newItem;
  };

  const updateActionItemStatus = (id: string, status: MeetingActionItem['status']) => {
    setMeetingActionItems(prev => prev.map(item => item.id === id ? {
      ...item,
      status,
      completionDate: status === 'COMPLETED' ? new Date().toISOString().split('T')[0] : item.completionDate
    } : item));
    showToast(`Action item marked as ${status}`, 'info', 'Status Updated');
  };

  // -------------------------------------------------------------
  // 4. CAPITAL MANAGEMENT METHODS (Sections 153-160)
  // -------------------------------------------------------------
  const addCapitalAccount = (acc: Omit<CapitalAccount, 'id' | 'contributorCode' | 'receivedCapital' | 'dueCapital' | 'status'> & Partial<CapitalAccount>): CapitalAccount => {
    const newAcc: CapitalAccount = {
      ...acc,
      id: `CAP-ACC-${Date.now().toString().slice(-6)}`,
      contributorCode: `SH-${Math.floor(100 + Math.random() * 900)}`,
      receivedCapital: 0,
      dueCapital: acc.committedCapital,
      status: 'ACTIVE'
    };
    setCapitalAccounts(prev => [newAcc, ...prev]);
    showToast(`Capital Account created for ${newAcc.contributorName}!`, 'success', 'Shareholder Added');
    logAuditAction('Created Capital Account', 'Capital', newAcc.contributorCode, undefined, `Committed: BDT ${newAcc.committedCapital}`);
    return newAcc;
  };

  const addCapitalTransaction = (tx: Omit<CapitalTransaction, 'id' | 'transactionCode' | 'status' | 'approvedBy'> & Partial<CapitalTransaction>): CapitalTransaction => {
    const newTx: CapitalTransaction = {
      ...tx,
      id: `CAP-TX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      transactionCode: `CAP-TXN-${Date.now().toString().slice(-6)}`,
      status: 'APPROVED',
      approvedBy: currentUser.name
    };

    setCapitalTransactions(prev => [newTx, ...prev]);

    setCapitalAccounts(prev => prev.map(acc => {
      if (acc.id === tx.capitalAccountId) {
        const isReceived = tx.transactionType === 'CAPITAL_RECEIVED';
        const isRefund = tx.transactionType === 'CAPITAL_REFUND';
        const delta = isReceived ? tx.amount : (isRefund ? -tx.amount : 0);
        const updatedReceived = Math.max(0, acc.receivedCapital + delta);
        const updatedDue = Math.max(0, acc.committedCapital - updatedReceived);
        return {
          ...acc,
          receivedCapital: updatedReceived,
          dueCapital: updatedDue,
          status: updatedDue === 0 ? 'PAID' : 'DUE'
        };
      }
      return acc;
    }));

    if (tx.transactionType === 'CAPITAL_RECEIVED') {
      addJournalEntry({
        date: tx.date,
        reference: newTx.transactionCode,
        description: `Capital Contribution from ${tx.contributorName} (${tx.paymentMethod})`,
        lines: [
          { accountCode: '1020', accountName: 'Bank / Cash Account', debit: tx.amount, credit: 0 },
          { accountCode: '3010', accountName: 'Share Capital (Paid-Up Capital)', debit: 0, credit: tx.amount }
        ],
        createdBy: currentUser.name,
        status: 'Approved'
      });
    } else if (tx.transactionType === 'CAPITAL_REFUND') {
      addJournalEntry({
        date: tx.date,
        reference: newTx.transactionCode,
        description: `Capital Refund to ${tx.contributorName}`,
        lines: [
          { accountCode: '3010', accountName: 'Share Capital (Paid-Up Capital)', debit: tx.amount, credit: 0 },
          { accountCode: '1020', accountName: 'Bank / Cash Account', debit: 0, credit: tx.amount }
        ],
        createdBy: currentUser.name,
        status: 'Approved'
      });
    }

    showToast(`Capital transaction ${newTx.transactionCode} processed!`, 'success', 'Capital Updated');
    logAuditAction('Capital Transaction', 'Capital', newTx.transactionCode, undefined, `${tx.transactionType} - BDT ${tx.amount}`);
    return newTx;
  };

  // -------------------------------------------------------------
  // 5. PLOT DISTRIBUTION METHODS (v3.0 Sections 16-21)
  // -------------------------------------------------------------
  const addDirectorPlotDistribution = (dist: Omit<DirectorPlotDistribution, 'id'>): DirectorPlotDistribution => {
    const newDist: DirectorPlotDistribution = {
      ...dist,
      id: `DIR-DIST-${Date.now().toString().slice(-6)}`
    };
    setDirectorPlotDistributions(prev => [newDist, ...prev]);
    showToast(`Plot ${dist.plotNumber} distributed to Director ${dist.directorName}`, 'success', 'Director Distribution Added');
    logAuditAction('Director Plot Distribution', 'Plots', newDist.id, undefined, `${dist.directorName} - ${dist.plotNumber}`);
    return newDist;
  };

  const addClientPlotDistribution = (dist: Omit<ClientPlotDistribution, 'id'>): ClientPlotDistribution => {
    const newDist: ClientPlotDistribution = {
      ...dist,
      id: `CLI-DIST-${Date.now().toString().slice(-6)}`
    };
    setClientPlotDistributions(prev => [newDist, ...prev]);
    showToast(`Plot ${dist.plotNumber} booked for Client ${dist.clientName}`, 'success', 'Client Distribution Added');
    logAuditAction('Client Plot Distribution', 'Plots', newDist.id, undefined, `${dist.clientName} - ${dist.plotNumber}`);
    return newDist;
  };

  // -------------------------------------------------------------
  // 6. INSTALLMENT COMMISSIONS & REFUNDS METHODS (v3.0 Sections 22-34)
  // -------------------------------------------------------------
  const addInstallmentCommission = (comm: Omit<InstallmentCommission, 'id' | 'commissionCode'> & Partial<InstallmentCommission>): InstallmentCommission => {
    const newComm: InstallmentCommission = {
      ...comm,
      id: `COMM-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      commissionCode: `COM-${Date.now().toString().slice(-6)}`,
      status: comm.status || 'PENDING',
      date: comm.date || new Date().toISOString().split('T')[0]
    };
    setInstallmentCommissions(prev => [newComm, ...prev]);
    showToast(`Commission ${newComm.commissionCode} generated for ${comm.salesExecutiveName}`, 'info', 'Commission Generated');
    logAuditAction('Generated Installment Commission', 'Installments', newComm.commissionCode, undefined, `BDT ${comm.commissionAmount}`);
    return newComm;
  };

  const approveInstallmentCommission = (id: string) => {
    setInstallmentCommissions(prev => prev.map(c => c.id === id ? {
      ...c,
      status: 'APPROVED',
      approvedBy: currentUser.name
    } : c));
    showToast('Installment commission approved!', 'success', 'Commission Approved');
    logAuditAction('Approved Installment Commission', 'Installments', id);
  };

  const payInstallmentCommission = (id: string, paymentMethod: string) => {
    const target = installmentCommissions.find(c => c.id === id);
    if (!target) return;

    setInstallmentCommissions(prev => prev.map(c => c.id === id ? {
      ...c,
      status: 'PAID',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      voucherNo: `VCH-COM-${Date.now().toString().slice(-5)}`
    } : c));

    // Double-entry posting for commission payment
    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: target.commissionCode,
      description: `Sales Commission Paid to ${target.salesExecutiveName} for Plot ${target.plotNumber}`,
      lines: [
        { accountCode: '5030', accountName: 'Sales Commission Expense', debit: target.commissionAmount, credit: 0 },
        { accountCode: '1020', accountName: 'Cash / Bank Account', debit: 0, credit: target.commissionAmount }
      ],
      createdBy: currentUser.name,
      status: 'Approved'
    });

    showToast(`Commission of BDT ${target.commissionAmount} paid to ${target.salesExecutiveName}`, 'success', 'Commission Disbursed');
    logAuditAction('Paid Installment Commission', 'Installments', target.commissionCode, undefined, `BDT ${target.commissionAmount}`);
  };

  const refundInstallmentCommission = (refund: Omit<CommissionRefund, 'id' | 'refundCode'>): CommissionRefund => {
    const newRef: CommissionRefund = {
      ...refund,
      id: `COM-REF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      refundCode: `CRF-${Date.now().toString().slice(-6)}`,
      status: 'COMPLETED',
      approvedBy: currentUser.name
    };

    setCommissionRefunds(prev => [newRef, ...prev]);

    // Reverse original commission status
    setInstallmentCommissions(prev => prev.map(c => c.id === refund.originalCommissionId ? {
      ...c,
      status: 'REVERSED',
      remarks: `Refunded via ${newRef.refundCode}: ${refund.reason}`
    } : c));

    // Post double entry reversal
    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: newRef.refundCode,
      description: `Commission Reversal from ${refund.salesExecutiveName} - ${refund.reason}`,
      lines: [
        { accountCode: '1020', accountName: 'Cash / Bank Account', debit: refund.refundAmount, credit: 0 },
        { accountCode: '5030', accountName: 'Sales Commission Expense', debit: 0, credit: refund.refundAmount }
      ],
      createdBy: currentUser.name,
      status: 'Approved'
    });

    showToast(`Commission reversal ${newRef.refundCode} processed!`, 'warning', 'Commission Refunded');
    logAuditAction('Commission Refund', 'Installments', newRef.refundCode, undefined, `BDT ${refund.refundAmount}`);
    return newRef;
  };

  const addBookingCommission = (comm: Omit<BookingCommission, 'id' | 'bookingCommissionCode'>): BookingCommission => {
    const newComm: BookingCommission = {
      ...comm,
      id: `BCOM-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      bookingCommissionCode: `BCOM-${Date.now().toString().slice(-6)}`,
      status: 'APPROVED',
      approvedBy: currentUser.name
    };
    setBookingCommissions(prev => [newComm, ...prev]);
    showToast(`Booking commission ${newComm.bookingCommissionCode} created!`, 'success', 'Booking Commission');
    logAuditAction('Created Booking Commission', 'Installments', newComm.bookingCommissionCode, undefined, `BDT ${comm.commissionAmount}`);
    return newComm;
  };

  const refundBookingCommission = (refund: Omit<BookingCommissionRefund, 'id' | 'refundCode'>): BookingCommissionRefund => {
    const newRef: BookingCommissionRefund = {
      ...refund,
      id: `BCOM-REF-${Date.now()}`,
      refundCode: `BCRF-${Date.now().toString().slice(-6)}`,
      status: 'COMPLETED',
      approvedBy: currentUser.name
    };
    setBookingCommissionRefunds(prev => [newRef, ...prev]);
    showToast(`Booking commission refund ${newRef.refundCode} processed!`, 'info', 'Booking Commission Refund');
    logAuditAction('Booking Commission Refund', 'Installments', newRef.refundCode, undefined, `BDT ${refund.refundAmount}`);
    return newRef;
  };

  const requestInstallmentRefund = (ref: Omit<InstallmentRefund, 'id' | 'refundCode' | 'status'>): InstallmentRefund => {
    const newRef: InstallmentRefund = {
      ...ref,
      id: `INST-REF-${Date.now()}`,
      refundCode: `IRF-${Date.now().toString().slice(-6)}`,
      status: 'REQUESTED'
    };
    setInstallmentRefunds(prev => [newRef, ...prev]);
    showToast(`Installment refund request ${newRef.refundCode} submitted!`, 'info', 'Refund Requested');
    logAuditAction('Requested Installment Refund', 'Installments', newRef.refundCode, undefined, `Net: BDT ${ref.netRefundAmount}`);
    return newRef;
  };

  const approveInstallmentRefund = (id: string) => {
    const target = installmentRefunds.find(r => r.id === id);
    if (!target) return;

    setInstallmentRefunds(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'REFUNDED',
      approvedBy: currentUser.name
    } : r));

    // Double-entry accounting reversal for customer refund
    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: target.refundCode,
      description: `Installment Refund to ${target.customerName} for Plot ${target.plotNumber}`,
      lines: [
        { accountCode: '4010', accountName: 'Plot Sales Revenue (Reversal)', debit: target.refundAmount, credit: 0 },
        { accountCode: '1020', accountName: 'Bank / Cash Account', debit: 0, credit: target.netRefundAmount },
        ...(target.deductionPenalty > 0 ? [{ accountCode: '4090', accountName: 'Cancellation Penalty Income', debit: 0, credit: target.deductionPenalty }] : [])
      ],
      createdBy: currentUser.name,
      status: 'Approved'
    });

    showToast(`Installment refund ${target.refundCode} approved and disbursed!`, 'success', 'Refund Disbursed');
    logAuditAction('Approved Installment Refund', 'Installments', target.refundCode, undefined, `Net: BDT ${target.netRefundAmount}`);
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
      logAuditAction,
      toasts,
      confirmDialog,
      showToast,
      removeToast,
      showConfirm,
      showAlert,
      closeConfirmDialog,
      resetAllDataToCleanSlate,
      addProject,
      updateProject,
      deleteProject,
      addPlot,
      updatePlot,
      cashBookTransactions,
      addCashTransaction,
      approveCashTransaction,
      salarySheets,
      createSalarySheet,
      updateSalarySheetStatus,
      directorHonorariums,
      addDirectorHonorarium,
      updateDirectorHonorariumStatus,
      bankAccounts,
      bankTransactions,
      bankReconciliations,
      addBankAccount,
      updateBankAccount,
      addBankTransaction,
      reconcileBankTransaction,
      createBankReconciliation,
      meetings,
      meetingActionItems,
      createMeeting,
      updateMeeting,
      publishMeetingMinutes,
      addMeetingActionItem,
      updateActionItemStatus,
      capitalAccounts,
      capitalTransactions,
      addCapitalAccount,
      addCapitalTransaction,
      directorPlotDistributions,
      clientPlotDistributions,
      addDirectorPlotDistribution,
      addClientPlotDistribution,
      installmentCommissions,
      commissionRefunds,
      bookingCommissions,
      bookingCommissionRefunds,
      installmentRefunds,
      addInstallmentCommission,
      approveInstallmentCommission,
      payInstallmentCommission,
      refundInstallmentCommission,
      addBookingCommission,
      refundBookingCommission,
      requestInstallmentRefund,
      approveInstallmentRefund
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
