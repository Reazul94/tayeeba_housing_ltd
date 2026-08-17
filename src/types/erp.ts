export * from './security';

export type UserRole = 
  | 'Super Admin'
  | 'CEO/Director'
  | 'Accounts'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Marketing'
  | 'HR'
  | string;

export interface User {
  id: string;
  userId?: string;
  employeeCode?: string;
  name: string;
  displayName?: string;
  email: string;
  mobile?: string;
  role: UserRole;
  roles?: string[];
  status?: string;
  mustChangePassword?: boolean;
  department?: string;
  designationTitle?: string;
  avatar?: string;
  allowedModules?: string[];
  menuPermissions?: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean; approve: boolean; export: boolean; print?: boolean }>;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
    print?: boolean;
  };
}

export type PlotStatus = 'Available' | 'Reserved' | 'Booked' | 'Sold' | 'Transferred' | 'Cancelled' | 'On Hold';

export interface Plot {
  id: string;
  plotNumber: string;
  projectId: string;
  projectName: string;
  block: string;
  zone: string;
  road: string;
  sizeKatha: number;
  facing: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'South-East' | 'North-West' | 'South-West';
  perKathaPrice: number;
  basePrice: number;
  discount: number;
  finalPrice: number;
  status: PlotStatus;
  customerId?: string;
  customerName?: string;
  salesExecutiveId?: string;
  salesExecutiveName?: string;
  bookingDate?: string;
  agreementDate?: string;
  handoverStatus?: 'Pending' | 'In Progress' | 'Ready' | 'Handed Over';
}

export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  totalLandAreaDecimal: number;
  totalPlots: number;
  availablePlotsCount: number;
  bookedPlotsCount: number;
  soldPlotsCount: number;
  description: string;
  status: 'Planning' | 'Ongoing' | 'Near Completion' | 'Completed';
  launchDate: string;
  expectedCompletionDate: string;
  projectManager: string;
  developmentBudget: number;
  actualDevelopmentCost: number;
}

export interface Customer {
  id: string;
  customerId: string;
  name: string;
  fatherMotherName: string;
  nid: string;
  dob: string;
  mobile: string;
  altMobile?: string;
  email: string;
  presentAddress: string;
  permanentAddress: string;
  profession: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeNid: string;
  referenceName?: string;
  salesExecutiveId: string;
  salesExecutiveName: string;
  linkedPlotId?: string;
  linkedPlotNumber?: string;
  linkedProjectId?: string;
  linkedProjectName?: string;
  totalPlotValue: number;
  totalPaid: number;
  totalDiscount: number;
  totalDue: number;
  documents: { id: string; title: string; fileType: string; url: string; uploadDate: string }[];
  notes?: string;
}

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Site Visit Scheduled'
  | 'Site Visit Completed'
  | 'Negotiation'
  | 'Booked'
  | 'Converted'
  | 'Lost';

export interface Lead {
  id: string;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  source: 'Facebook' | 'Website' | 'Phone Call' | 'Referral' | 'Exhibition' | 'Walk-in';
  interestedProjectId: string;
  interestedProjectName: string;
  interestedPlotSizeKatha: number;
  budget: number;
  assignedSalesExecutiveId: string;
  assignedSalesExecutiveName: string;
  status: LeadStatus;
  followUpDate: string;
  notes: string;
  createdAt: string;
}

export interface SiteVisit {
  id: string;
  leadId?: string;
  customerId?: string;
  clientName: string;
  clientPhone: string;
  visitDate: string;
  visitTime: string;
  salesExecutiveId: string;
  salesExecutiveName: string;
  projectId: string;
  projectName: string;
  interestedPlotNumber: string;
  remarks: string;
  followUpDate: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  plotId: string;
  plotNumber: string;
  plotSizeKatha: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  bookingMoney: number;
  downPayment: number;
  remainingAmount: number;
  installmentDurationMonths: number;
  numberOfInstallments: number;
  frequency: 'Monthly' | 'Quarterly' | 'Custom';
  firstInstallmentDate: string;
  agreementDate: string;
  salesExecutiveId: string;
  salesExecutiveName: string;
  bookingDate: string;
  status: 'Active' | 'Settled' | 'Cancelled' | 'Transferred';
}

export type InstallmentStatus = 'Paid' | 'Partially Paid' | 'Due' | 'Overdue';

export interface Installment {
  id: string;
  bookingId: string;
  installmentNumber: number;
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentDate?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque' | 'bKash' | 'Nagad' | 'Rocket';
  status: InstallmentStatus;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  plotId: string;
  plotNumber: string;
  paymentType: 'Booking Money' | 'Down Payment' | 'Installment' | 'Development Charge' | 'Registration Fee' | 'Transfer Fee' | 'Other';
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'bKash' | 'Nagad' | 'Rocket';
  chequeOrTxnNo?: string;
  bankName?: string;
  date: string;
  receivedBy: string;
  authorizedSignature: string;
  remarks?: string;
}

export interface Account {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subCategory: string;
  balance: number;
  description?: string;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  voucherNumber: string;
  date: string;
  reference: string;
  description: string;
  lines: JournalEntryLine[];
  createdBy: string;
  status: 'Approved' | 'Draft' | 'Posted';
}

export interface Expense {
  id: string;
  expenseId: string;
  date: string;
  category: string;
  projectId?: string;
  projectName?: string;
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank' | 'Cheque' | 'Mobile Banking';
  vendorPayee: string;
  approvedBy: string;
  createdBy: string;
  attachmentUrl?: string;
}

export interface LandParcel {
  id: string;
  ownerName: string;
  ownerPhone: string;
  ownerNid: string;
  landAreaDecimal: number;
  mouza: string;
  dagNumber: string;
  khatianNumber: string;
  landType: string;
  landPrice: number;
  paidAmount: number;
  dueAmount: number;
  registrationCost: number;
  legalCost: number;
  developmentCost: number;
  status: 'Under Negotiation' | 'Acquired' | 'Registered' | 'Developed';
}

export interface Commission {
  id: string;
  recipientName: string;
  recipientRole: 'Sales Executive' | 'Sales Manager' | 'Marketing Executive' | 'Dealer' | 'Broker' | 'Team Leader';
  bookingId: string;
  plotNumber: string;
  customerName: string;
  saleValue: number;
  commissionType: 'Percentage' | 'Fixed';
  commissionRate: number; // % or flat
  commissionAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Partially Paid';
  date: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  nidOrTradeLicense: string;
  category: 'Construction Materials' | 'Heavy Equipment' | 'Legal/Consultant' | 'Marketing Agency' | 'General Supplier';
  totalPurchases: number;
  totalPaid: number;
  outstandingBalance: number;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: 'Sales' | 'Accounts & Finance' | 'Project & Site' | 'Marketing' | 'HR & Admin';
  designation: string;
  joiningDate: string;
  baseSalary: number;
  phone: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Resigned';
}

export interface Payroll {
  id: string;
  month: string;
  year: number;
  employeeId: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  commissionBonus: number;
  advanceDeductions: number;
  netSalary: number;
  paymentStatus: 'Pending' | 'Paid';
  paymentDate?: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  date: string;
  time: string;
  action: string;
  module: string;
  recordId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  date: string;
  read: boolean;
  linkTab?: string;
}
