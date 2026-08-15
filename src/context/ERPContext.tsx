import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Project, Plot, Customer, Lead, SiteVisit, Booking, 
  Installment, PaymentReceipt, Account, JournalEntry, Expense, 
  LandParcel, Commission, Vendor, Employee, Payroll, AuditLog, 
  NotificationItem, UserRole, PlotStatus 
} from '../types/erp';
import { 
  mockUsers, mockProjects, mockPlots, mockCustomers, mockLeads, 
  mockSiteVisits, mockBookings, mockInstallments, mockReceipts, 
  mockAccounts, mockJournalEntries, mockExpenses, mockLandParcels, 
  mockCommissions, mockVendors, mockEmployees, mockPayrolls, 
  mockAuditLogs, mockNotifications 
} from '../data/mockData';

interface ERPContextType {
  // Navigation & System State
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  setCurrentUserRole: (role: UserRole) => void;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data Collections
  users: User[];
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
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]); // Default Super Admin

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
    projects, plots, customers, leads, siteVisits, bookings, installments, 
    receipts, accounts, journalEntries, expenses, landParcels, commissions, 
    vendors, employees, payrolls, auditLogs, notifications
  ]);

  const setCurrentUserRole = (role: UserRole) => {
    const found = mockUsers.find(u => u.role === role) || {
      id: 'USR-SW',
      name: `User (${role})`,
      email: `${role.toLowerCase().replace('/', '')}@tayeebahousing.com`,
      role: role,
      permissions: { view: true, create: true, edit: role !== 'Sales Executive', delete: role === 'Super Admin', approve: ['Super Admin', 'CEO/Director', 'Accounts'].includes(role), export: true }
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
      customerId: `THL-C-${Math.floor(8000 + Math.random() * 1000)}`,
      totalPaid: 0,
      totalDue: customerData.totalPlotValue,
      documents: customerData.documents || []
    };
    setCustomers(prev => [newCustomer, ...prev]);
    logAuditAction('Created Customer Account', 'Customers', newCustomer.customerId, undefined, `${newCustomer.name} (NID: ${newCustomer.nid})`);
    return newCustomer;
  };

  // -------------------------------------------------------------
  // AUTOMATED CORE WORKFLOW: CREATE BOOKING
  // -------------------------------------------------------------
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
    const targetPlot = plots.find(p => p.id === data.plotId);
    const targetCustomer = customers.find(c => c.id === data.customerId);
    const targetProject = projects.find(p => p.id === data.projectId);

    if (!targetPlot || !targetCustomer || !targetProject) {
      throw new Error("Invalid plot, customer or project ID for booking.");
    }

    const finalPrice = data.totalPrice - data.discount;
    const remainingForInstallments = finalPrice - (data.bookingMoney + data.downPayment);
    
    const numInstallments = data.frequency === 'Monthly' ? data.durationMonths : Math.ceil(data.durationMonths / 3);
    const installmentAmount = Math.round(remainingForInstallments / numInstallments);

    const bookingNum = `THL-BK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking: Booking = {
      id: `BKG-${Date.now().toString().slice(-6)}`,
      bookingNumber: bookingNum,
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      projectId: targetProject.id,
      projectName: targetProject.name,
      plotId: targetPlot.id,
      plotNumber: targetPlot.plotNumber,
      plotSizeKatha: targetPlot.sizeKatha,
      totalPrice: data.totalPrice,
      discount: data.discount,
      finalPrice: finalPrice,
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

    // 1. Generate Installment Schedule
    const newInstallments: Installment[] = [];
    const startDate = new Date(data.firstInstallmentDate || Date.now());

    for (let i = 1; i <= numInstallments; i++) {
      const dueDateObj = new Date(startDate);
      if (data.frequency === 'Monthly') {
        dueDateObj.setMonth(dueDateObj.getMonth() + (i - 1));
      } else {
        dueDateObj.setMonth(dueDateObj.getMonth() + (i - 1) * 3);
      }

      newInstallments.push({
        id: `INS-${Date.now()}-${i}`,
        bookingId: newBooking.id,
        installmentNumber: i,
        dueDate: dueDateObj.toISOString().split('T')[0],
        dueAmount: i === numInstallments ? remainingForInstallments - (installmentAmount * (numInstallments - 1)) : installmentAmount,
        paidAmount: 0,
        remainingAmount: i === numInstallments ? remainingForInstallments - (installmentAmount * (numInstallments - 1)) : installmentAmount,
        status: 'Due'
      });
    }

    // 2. Update Plot Status to 'Booked'
    setPlots(prev => prev.map(p => p.id === data.plotId ? {
      ...p,
      status: 'Booked' as PlotStatus,
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      salesExecutiveId: data.salesExecutiveId,
      salesExecutiveName: data.salesExecutiveName,
      bookingDate: newBooking.bookingDate,
      discount: data.discount,
      finalPrice: finalPrice
    } : p));

    // 3. Update Project Plot Counters
    setProjects(prev => prev.map(prj => prj.id === data.projectId ? {
      ...prj,
      availablePlotsCount: Math.max(0, prj.availablePlotsCount - 1),
      bookedPlotsCount: prj.bookedPlotsCount + 1
    } : prj));

    // 4. Update Customer Ledger
    setCustomers(prev => prev.map(c => c.id === data.customerId ? {
      ...c,
      linkedPlotId: targetPlot.id,
      linkedPlotNumber: targetPlot.plotNumber,
      linkedProjectId: targetProject.id,
      linkedProjectName: targetProject.name,
      totalPlotValue: finalPrice,
      totalPaid: data.bookingMoney, // initial booking money paid
      totalDiscount: data.discount,
      totalDue: finalPrice - data.bookingMoney
    } : c));

    // 5. Generate Booking Money Payment Receipt
    const receiptNum = `THL-MR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingReceipt: PaymentReceipt = {
      id: `RCP-${Date.now().toString().slice(-6)}`,
      receiptNumber: receiptNum,
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      projectId: targetProject.id,
      projectName: targetProject.name,
      plotId: targetPlot.id,
      plotNumber: targetPlot.plotNumber,
      paymentType: 'Booking Money',
      amount: data.bookingMoney,
      paymentMethod: 'Cash',
      date: new Date().toISOString().split('T')[0],
      receivedBy: currentUser.name,
      authorizedSignature: 'Authorized Signature',
      remarks: `Booking money for plot ${targetPlot.plotNumber} (${targetProject.name})`
    };

    // 6. Post Double-Entry Accounting Journal Entry:
    // Debit: Cash/Bank | Credit: Customer Accounts Receivable
    const journalVoucherNum = `JV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newJournalEntry: JournalEntry = {
      id: `JV-${Date.now()}`,
      voucherNumber: journalVoucherNum,
      date: new Date().toISOString().split('T')[0],
      reference: bookingNum,
      description: `Plot Booking Created - Plot ${targetPlot.plotNumber} (${targetCustomer.name})`,
      lines: [
        { accountCode: '1010', accountName: 'Cash in Hand (Main Office Treasury)', debit: data.bookingMoney, credit: 0 },
        { accountCode: '1050', accountName: 'Customer Accounts Receivable', debit: 0, credit: data.bookingMoney }
      ],
      createdBy: currentUser.name,
      status: 'Approved'
    };

    // 7. Auto Sales Commission calculation (1.5%)
    const commAmount = Math.round(finalPrice * 0.015);
    const newCommission: Commission = {
      id: `COM-${Date.now().toString().slice(-5)}`,
      recipientName: data.salesExecutiveName,
      recipientRole: 'Sales Executive',
      bookingId: newBooking.id,
      plotNumber: targetPlot.plotNumber,
      customerName: targetCustomer.name,
      saleValue: finalPrice,
      commissionType: 'Percentage',
      commissionRate: 1.5,
      commissionAmount: commAmount,
      paidAmount: 0,
      dueAmount: commAmount,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    // Save states
    setBookings(prev => [newBooking, ...prev]);
    setInstallments(prev => [...newInstallments, ...prev]);
    setReceipts(prev => [bookingReceipt, ...prev]);
    setJournalEntries(prev => [newJournalEntry, ...prev]);
    setCommissions(prev => [newCommission, ...prev]);

    // Update Accounts Balances
    setAccounts(prev => prev.map(acc => {
      if (acc.code === '1010') return { ...acc, balance: acc.balance + data.bookingMoney };
      if (acc.code === '4010') return { ...acc, balance: acc.balance + finalPrice };
      return acc;
    }));

    // Notification
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: 'New Booking Created!',
      message: `Plot ${targetPlot.plotNumber} booked by ${targetCustomer.name} (Total BDT ${finalPrice.toLocaleString('en-IN')}).`,
      type: 'success',
      date: new Date().toISOString().split('T')[0],
      read: false,
      linkTab: 'bookings'
    };
    setNotifications(prev => [notif, ...prev]);

    logAuditAction('Created Booking', 'Bookings', newBooking.bookingNumber, 'Plot Available', `Booked Plot ${targetPlot.plotNumber} for ${targetCustomer.name}`);

    return newBooking;
  };

  // -------------------------------------------------------------
  // AUTOMATED CORE WORKFLOW: RECORD COLLECTION / PAYMENT
  // -------------------------------------------------------------
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
    const project = projects.find(p => p.id === payment.projectId);

    const receiptNum = `THL-MR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReceipt: PaymentReceipt = {
      id: `RCP-${Date.now().toString().slice(-6)}`,
      receiptNumber: receiptNum,
      customerId: payment.customerId,
      customerName: customer ? customer.name : 'Unknown Customer',
      projectId: payment.projectId,
      projectName: project ? project.name : 'Unknown Project',
      plotId: payment.plotId,
      plotNumber: plot ? plot.plotNumber : 'N/A',
      paymentType: payment.paymentType,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      bankName: payment.bankName,
      chequeOrTxnNo: payment.chequeOrTxnNo,
      date: new Date().toISOString().split('T')[0],
      receivedBy: currentUser.name,
      authorizedSignature: 'Authorized Signature',
      remarks: payment.remarks
    };

    // 1. Update Customer Total Paid & Due
    setCustomers(prev => prev.map(c => {
      if (c.id === payment.customerId) {
        const newPaid = c.totalPaid + payment.amount;
        const newDue = Math.max(0, c.totalDue - payment.amount);
        return { ...c, totalPaid: newPaid, totalDue: newDue };
      }
      return c;
    }));

    // 2. If Installment payment, apply to earliest due installment schedule
    if (payment.paymentType === 'Installment' && payment.bookingId) {
      setInstallments(prev => {
        let remainingToApply = payment.amount;
        return prev.map(ins => {
          if (ins.bookingId === payment.bookingId && ins.status !== 'Paid' && remainingToApply > 0) {
            const needed = ins.dueAmount - ins.paidAmount;
            if (remainingToApply >= needed) {
              remainingToApply -= needed;
              return {
                ...ins,
                paidAmount: ins.dueAmount,
                remainingAmount: 0,
                status: 'Paid',
                paymentDate: newReceipt.date,
                paymentMethod: payment.paymentMethod
              };
            } else {
              const newPaid = ins.paidAmount + remainingToApply;
              remainingToApply = 0;
              return {
                ...ins,
                paidAmount: newPaid,
                remainingAmount: ins.dueAmount - newPaid,
                status: 'Partially Paid',
                paymentDate: newReceipt.date,
                paymentMethod: payment.paymentMethod
              };
            }
          }
          return ins;
        });
      });
    }

    // 3. Double Entry Accounting Update:
    // Debit Cash/Bank | Credit Accounts Receivable
    const assetAccountCode = payment.paymentMethod === 'Cash' ? '1010' : '1020';
    setAccounts(prev => prev.map(acc => {
      if (acc.code === assetAccountCode) return { ...acc, balance: acc.balance + payment.amount };
      if (acc.code === '1050') return { ...acc, balance: Math.max(0, acc.balance - payment.amount) };
      return acc;
    }));

    setReceipts(prev => [newReceipt, ...prev]);

    logAuditAction('Recorded Collection Payment', 'Collections', newReceipt.receiptNumber, undefined, `Received BDT ${payment.amount.toLocaleString()} from ${customer?.name} (${payment.paymentType})`);

    return newReceipt;
  };

  const cancelBooking = (bookingId: string, cancellationCharge: number, reason: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // 1. Update Booking status to Cancelled
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));

    // 2. Reset Plot status to Available
    setPlots(prev => prev.map(p => p.id === booking.plotId ? { 
      ...p, 
      status: 'Available', 
      customerId: undefined, 
      customerName: undefined, 
      bookingDate: undefined 
    } : p));

    // 3. Update Project plot count
    setProjects(prev => prev.map(prj => prj.id === booking.projectId ? {
      ...prj,
      bookedPlotsCount: Math.max(0, prj.bookedPlotsCount - 1),
      availablePlotsCount: prj.availablePlotsCount + 1
    } : prj));

    logAuditAction('Cancelled Booking & Released Plot', 'Refund & Cancellation', booking.bookingNumber, 'Booked', `Plot ${booking.plotNumber} reset to Available. Charge: BDT ${cancellationCharge}`);
  };

  const transferPlot = (plotId: string, fromCustomerId: string, toCustomerId: string, transferFee: number) => {
    const targetPlot = plots.find(p => p.id === plotId);
    const newCustomer = customers.find(c => c.id === toCustomerId);
    const oldCustomer = customers.find(c => c.id === fromCustomerId);

    if (!targetPlot || !newCustomer || !oldCustomer) return;

    // 1. Transfer Plot to New Customer
    setPlots(prev => prev.map(p => p.id === plotId ? {
      ...p,
      customerId: newCustomer.id,
      customerName: newCustomer.name
    } : p));

    // 2. Transfer Booking Record
    setBookings(prev => prev.map(b => b.plotId === plotId ? {
      ...b,
      customerId: newCustomer.id,
      customerName: newCustomer.name
    } : b));

    // 3. Record Transfer Fee Payment Receipt
    recordPayment({
      customerId: newCustomer.id,
      projectId: targetPlot.projectId,
      plotId: targetPlot.id,
      paymentType: 'Transfer Fee',
      amount: transferFee,
      paymentMethod: 'Bank Transfer',
      remarks: `Plot Transfer Fee from ${oldCustomer.name} to ${newCustomer.name}`
    });

    logAuditAction('Transferred Plot Ownership', 'Plot Transfer', targetPlot.plotNumber, oldCustomer.name, `Transferred to ${newCustomer.name}. Fee: BDT ${transferFee}`);
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'expenseId'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: `EXP-${Date.now().toString().slice(-6)}`,
      expenseId: `THL-EX-${Math.floor(500 + Math.random() * 500)}`
    };

    setExpenses(prev => [newExp, ...prev]);

    // Debit Expense Account & Credit Cash/Bank Account
    setAccounts(prev => prev.map(acc => {
      if (acc.code === '5010') return { ...acc, balance: acc.balance + newExp.amount };
      if (acc.code === '1010') return { ...acc, balance: acc.balance - newExp.amount };
      return acc;
    }));

    if (newExp.projectId) {
      setProjects(prev => prev.map(p => p.id === newExp.projectId ? {
        ...p,
        actualDevelopmentCost: p.actualDevelopmentCost + newExp.amount
      } : p));
    }

    logAuditAction('Posted Expense', 'Expenses', newExp.expenseId, undefined, `${newExp.category} - BDT ${newExp.amount.toLocaleString()}`);
  };

  const addJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'voucherNumber'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `JV-${Date.now()}`,
      voucherNumber: `JV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setJournalEntries(prev => [newEntry, ...prev]);
    logAuditAction('Created Journal Voucher', 'Accounting', newEntry.voucherNumber, undefined, entryData.description);
  };

  const addLandParcel = (landData: Omit<LandParcel, 'id'>) => {
    const newLand: LandParcel = {
      ...landData,
      id: `LND-${Date.now().toString().slice(-5)}`
    };
    setLandParcels(prev => [newLand, ...prev]);
    logAuditAction('Added Land Parcel', 'Land Acquisition', newLand.id, undefined, `${newLand.landAreaDecimal} Decimals in ${newLand.mouza}`);
  };

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'employeeId'>) => {
    const newEmp: Employee = {
      ...employeeData,
      id: `EMP-${Date.now().toString().slice(-5)}`,
      employeeId: `THL-EMP-${Math.floor(200 + Math.random() * 800)}`
    };
    setEmployees(prev => [newEmp, ...prev]);
    logAuditAction('Created Employee', 'HR & Payroll', newEmp.employeeId, undefined, `${newEmp.name} (${newEmp.designation})`);
  };

  const processPayroll = (month: string, year: number) => {
    const newPayrolls: Payroll[] = employees.map(emp => ({
      id: `PAY-${emp.id}-${month}-${year}`,
      month,
      year,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      baseSalary: emp.baseSalary,
      commissionBonus: emp.department === 'Sales' ? 15000 : 0,
      advanceDeductions: 0,
      netSalary: emp.baseSalary + (emp.department === 'Sales' ? 15000 : 0),
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0]
    }));

    setPayrolls(prev => [...newPayrolls, ...prev]);
    logAuditAction('Processed Payroll', 'HR & Payroll', `${month} ${year}`, undefined, `Processed salary for ${employees.length} employees`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <ERPContext.Provider value={{
      currentTab, setCurrentTab, currentUser, setCurrentUserRole, language, setLanguage, searchQuery, setSearchQuery,
      users: mockUsers, projects, plots, customers, leads, siteVisits, bookings, installments, receipts,
      accounts, journalEntries, expenses, landParcels, commissions, vendors, employees, payrolls, auditLogs, notifications,
      addLead, addSiteVisit, addCustomer, createBooking, recordPayment, cancelBooking, transferPlot,
      addExpense, addJournalEntry, addLandParcel, addEmployee, processPayroll, markNotificationRead, logAuditAction
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
