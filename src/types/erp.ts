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

// ============================================================
// ACCOUNTS & CASH BOOK (Sections 128-140)
// ============================================================
export interface CashBookTransaction {
  id: string;
  voucherNo: string;
  transactionType: 'RECEIPT' | 'PAYMENT';
  date: string;
  particulars: string;
  accountHead: string;
  category: string;
  projectId?: string;
  projectName?: string;
  partyName?: string;
  referenceNo?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'bKash' | 'Nagad' | 'Rocket' | 'Other';
  debitAmount: number;   // Receipt Amount
  creditAmount: number;  // Payment Amount
  runningBalance: number;
  preparedBy: string;
  approvedBy?: string;
  approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

// ============================================================
// BANK MANAGEMENT (Sections 141-145)
// ============================================================
export interface BankAccount {
  id: string;
  accountCode: string;
  bankName: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  accountType: 'Current' | 'Savings' | 'SND' | 'FDR' | 'Other';
  currency: string;
  routingNumber?: string;
  swiftCode?: string;
  openingBalance: number;
  currentBalance: number;
  isDefault?: boolean;
  isActive: boolean;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  bankAccountName?: string;
  transactionId: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'INTEREST' | 'BANK_CHARGE';
  date: string;
  particulars: string;
  referenceNo?: string;
  chequeNumber?: string;
  paymentMethod: string;
  depositAmount: number;
  withdrawalAmount: number;
  balanceAfter: number;
  isReconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
}

export interface BankReconciliation {
  id: string;
  reconciliationNo: string;
  bankAccountId: string;
  bankAccountName: string;
  statementDate: string;
  bookBalance: number;
  bankStatementBalance: number;
  differenceAmount: number;
  status: 'DRAFT' | 'RECONCILED' | 'DISCREPANCY';
  notes?: string;
  performedBy: string;
  approvedBy?: string;
}

// ============================================================
// SALARY & DIRECTORS' HONORARIUM (Sections 137-140)
// ============================================================
export interface SalarySheet {
  id: string;
  sheetCode: string;
  month: string;
  year: number;
  totalStaffCount: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetPayable: number;
  totalPaidAmount: number;
  approvalStatus: 'PREPARED' | 'REVIEWED' | 'APPROVED' | 'PAID' | 'CANCELLED';
  preparedBy: string;
  approvedBy?: string;
  paymentDate?: string;
  paymentMethod?: string;
  bankAccountId?: string;
  details?: SalaryDetail[];
}

export interface SalaryDetail {
  id: string;
  salarySheetId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  conveyance: number;
  bonus: number;
  overtimeAmount: number;
  grossSalary: number;
  providentFund: number;
  advanceDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPayable: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'HOLD';
  paymentDate?: string;
}

export interface DirectorHonorarium {
  id: string;
  honorariumCode: string;
  directorName: string;
  directorDesignation: string;
  month: string;
  year: number;
  meetingCount: number;
  honorariumAmount: number;
  taxDeduction: number;
  netAmount: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  voucherNo?: string;
  paymentDate?: string;
  paymentMethod?: string;
  bankAccountId?: string;
  remarks?: string;
  approvedBy?: string;
}

// ============================================================
// EC & BOARD MEETINGS (Sections 146-152)
// ============================================================
export interface MeetingMember {
  id: string;
  meetingId?: string;
  memberName: string;
  designation: string;
  roleInMeeting: 'Chairperson' | 'Member' | 'Secretary' | 'Invited Guest' | 'Observer';
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'LEAVE_OF_ABSENCE' | 'ONLINE';
}

export interface MeetingAgenda {
  id: string;
  meetingId?: string;
  itemNumber: number;
  title: string;
  description?: string;
  presenter?: string;
  decisionOutcome?: string;
}

export interface MeetingActionItem {
  id: string;
  meetingId: string;
  meetingNo?: string;
  actionCode: string;
  title: string;
  description?: string;
  responsiblePerson: string;
  department: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  completionDate?: string;
  remarks?: string;
}

export interface Meeting {
  id: string;
  meetingNo: string;
  meetingType: 'EC_MEETING' | 'BOARD_MEETING' | 'ANNUAL_GENERAL_MEETING' | 'SPECIAL_MEETING';
  title: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  chairperson: string;
  secretary: string;
  status: 'SCHEDULED' | 'HELD' | 'MINUTES_PENDING' | 'APPROVED' | 'CANCELLED';
  agendaSummary?: string;
  discussionNotes?: string;
  resolutionsText?: string;
  minutesText?: string;
  minutesStatus: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
  approvedBy?: string;
  approvedAt?: string;
  members: MeetingMember[];
  agendas: MeetingAgenda[];
  actionItems: MeetingActionItem[];
  documents?: { id: string; title: string; url: string }[];
}

// ============================================================
// CAPITAL MANAGEMENT (Sections 153-160)
// ============================================================
export interface CapitalAccount {
  id: string;
  contributorCode: string;
  contributorName: string;
  contributorType: 'Director' | 'Shareholder' | 'Sponsor Investor' | 'Institutional Partner';
  nidOrPassport?: string;
  phone?: string;
  email?: string;
  sharePercentage: number;
  committedCapital: number;
  receivedCapital: number;
  dueCapital: number;
  status: 'ACTIVE' | 'PAID' | 'DUE' | 'INACTIVE';
}

export interface CapitalTransaction {
  id: string;
  transactionCode: string;
  capitalAccountId: string;
  contributorName: string;
  transactionType: 'CAPITAL_RECEIVED' | 'CAPITAL_ADJUSTMENT' | 'CAPITAL_REFUND' | 'CAPITAL_TRANSFER' | 'DIVIDEND_PAYOUT';
  date: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Pay Order' | 'Cash' | 'Other';
  bankAccountId?: string;
  bankAccountName?: string;
  receiptVoucherNo?: string;
  referenceDetails?: string;
  projectId?: string;
  projectName?: string;
  remarks?: string;
  status: 'PENDING' | 'APPROVED' | 'REVERSED';
  approvedBy: string;
}

export interface CapitalLedger {
  id: string;
  capitalAccountId: string;
  contributorName: string;
  openingBalance: number;
  totalContributions: number;
  totalAdjustments: number;
  totalRefunds: number;
  totalReceived: number;
  outstandingDue: number;
  closingBalance: number;
  transactions: CapitalTransaction[];
}

// ============================================================
// PLOT DISTRIBUTIONS (Sections 16-21)
// ============================================================
export interface DirectorPlotDistribution {
  id: string;
  directorName: string;
  directorCode?: string;
  projectId: string;
  projectName: string;
  block: string;
  plotNumber: string;
  plotSize: number;
  sizeUnit: 'Decimal' | 'Katha' | 'Bigha' | 'Acre' | 'SqFt';
  bookingDate: string;
  customerName?: string;
  bookingValue: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Allotted' | 'Booked' | 'Sold' | 'Transferred' | 'Reserved';
  remarks?: string;
}

export interface ClientPlotDistribution {
  id: string;
  clientName: string;
  customerId: string;
  phone: string;
  projectId: string;
  projectName: string;
  block: string;
  plotNumber: string;
  plotSize: number;
  sizeUnit: 'Decimal' | 'Katha' | 'Bigha' | 'Acre' | 'SqFt';
  bookingDate: string;
  bookingValue: number;
  paidAmount: number;
  dueAmount: number;
  installmentStatus: 'REGULAR' | 'OVERDUE' | 'COMPLETED' | 'DEFAULTED';
  salesExecutive: string;
  bookingStatus: 'ACTIVE' | 'CONFIRMED' | 'TRANSFERRED' | 'CANCELLED';
  remarks?: string;
}

// ============================================================
// INSTALLMENT COMMISSIONS & REFUNDS (Sections 22-34)
// ============================================================
export interface InstallmentCommission {
  id: string;
  commissionCode: string;
  commissionType: 'ONE_TIME' | 'MONTHLY';
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  plotNumber: string;
  bookingId: string;
  bookingNo: string;
  installmentNo?: number;
  salesExecutiveId: string;
  salesExecutiveName: string;
  collectionAmount: number;
  commissionRate: number; // e.g. 2% or 5000 BDT
  rateType: 'PERCENTAGE' | 'FIXED';
  commissionAmount: number;
  month?: string;
  year?: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REVERSED';
  approvedBy?: string;
  paidDate?: string;
  paymentMethod?: string;
  voucherNo?: string;
  remarks?: string;
}

export interface CommissionRefund {
  id: string;
  refundCode: string;
  originalCommissionId: string;
  commissionCode: string;
  commissionType: 'ONE_TIME' | 'MONTHLY' | 'BOOKING';
  salesExecutiveId: string;
  salesExecutiveName: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  plotNumber: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  approvedBy?: string;
  journalEntryId?: string;
  remarks?: string;
}

export interface BookingCommission {
  id: string;
  bookingCommissionCode: string;
  bookingId: string;
  bookingNo: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  plotNumber: string;
  salesExecutiveId: string;
  salesExecutiveName: string;
  bookingAmount: number;
  totalSaleValue: number;
  commissionRate: number;
  rateType: 'PERCENTAGE' | 'FIXED';
  commissionAmount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REVERSED';
  approvedBy?: string;
  paidDate?: string;
  remarks?: string;
}

export interface BookingCommissionRefund {
  id: string;
  refundCode: string;
  originalBookingCommissionId: string;
  bookingCommissionCode: string;
  bookingNo: string;
  customerId: string;
  customerName: string;
  salesExecutiveName: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED';
  approvedBy?: string;
  remarks?: string;
}

export interface InstallmentRefund {
  id: string;
  refundCode: string;
  originalReceiptId: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  plotNumber: string;
  installmentNo: number;
  originalAmount: number;
  refundAmount: number;
  deductionPenalty: number;
  netRefundAmount: number;
  reason: string;
  paymentSource: 'Bank' | 'Cash';
  bankAccountId?: string;
  refundDate: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'REQUESTED' | 'REVIEWED' | 'APPROVED' | 'REFUNDED' | 'REJECTED';
  journalEntryId?: string;
  remarks?: string;
}

