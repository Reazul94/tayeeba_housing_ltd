import { 
  Project, Plot, Customer, Lead, SiteVisit, Booking, Installment, 
  PaymentReceipt, Account, JournalEntry, Expense, LandParcel, 
  Commission, Vendor, Employee, Payroll, AuditLog, NotificationItem, User 
} from '../types/erp';

export const mockUsers: User[] = [
  {
    id: 'USR-01',
    name: 'Al-Haj Engr. Tayeebur Rahman',
    email: 'chairman@tayeebahousing.com',
    role: 'Super Admin',
    permissions: { view: true, create: true, edit: true, delete: true, approve: true, export: true }
  },
  {
    id: 'USR-02',
    name: 'Tariqul Islam Siddiqui',
    email: 'md@tayeebahousing.com',
    role: 'CEO/Director',
    permissions: { view: true, create: true, edit: true, delete: false, approve: true, export: true }
  },
  {
    id: 'USR-03',
    name: 'Mahfuzur Rahman FCA',
    email: 'accounts@tayeebahousing.com',
    role: 'Accounts',
    permissions: { view: true, create: true, edit: true, delete: false, approve: true, export: true }
  },
  {
    id: 'USR-04',
    name: 'Kamrul Hasan',
    email: 'sales.head@tayeebahousing.com',
    role: 'Sales Manager',
    permissions: { view: true, create: true, edit: true, delete: false, approve: true, export: true }
  },
  {
    id: 'USR-05',
    name: 'Rafiqul Islam',
    email: 'rafiq.sales@tayeebahousing.com',
    role: 'Sales Executive',
    permissions: { view: true, create: true, edit: false, delete: false, approve: false, export: true }
  }
];

export const mockProjects: Project[] = [
  {
    id: 'PRJ-101',
    name: 'Tayeeba Smart City',
    code: 'TSC',
    location: 'Savar Extension, Dhaka (Near Dhaka-Aricha Highway)',
    totalLandAreaDecimal: 500,
    totalPlots: 120,
    availablePlotsCount: 45,
    bookedPlotsCount: 40,
    soldPlotsCount: 35,
    description: 'Premier eco-friendly smart township with 60ft wide avenues, central mosque, lake, and commercial zone.',
    status: 'Ongoing',
    launchDate: '2024-01-15',
    expectedCompletionDate: '2027-12-31',
    projectManager: 'Engr. Nazmul Huda',
    developmentBudget: 150000000,
    actualDevelopmentCost: 48500000
  },
  {
    id: 'PRJ-102',
    name: 'Tayeeba Riverside Valley',
    code: 'TRV',
    location: 'Keraniganj South, Dhaka (Adjacent to Buriganga 3rd Bridge)',
    totalLandAreaDecimal: 320,
    totalPlots: 85,
    availablePlotsCount: 20,
    bookedPlotsCount: 30,
    soldPlotsCount: 35,
    description: 'Scenic riverview residential layout with modern drainage, security surveillance, and community park.',
    status: 'Ongoing',
    launchDate: '2023-06-10',
    expectedCompletionDate: '2026-06-30',
    projectManager: 'Engr. Shahadat Hossain',
    developmentBudget: 95000000,
    actualDevelopmentCost: 62000000
  },
  {
    id: 'PRJ-103',
    name: 'Tayeeba Garden Resort City',
    code: 'TGR',
    location: 'Gazipur Chowrasta, Gazipur',
    totalLandAreaDecimal: 450,
    totalPlots: 95,
    availablePlotsCount: 50,
    bookedPlotsCount: 25,
    soldPlotsCount: 20,
    description: 'Green peaceful resort-style gated community with dedicated school, hospital plot, and playground.',
    status: 'Planning',
    launchDate: '2024-09-01',
    expectedCompletionDate: '2028-05-31',
    projectManager: 'Engr. Firoz Mahmud',
    developmentBudget: 120000000,
    actualDevelopmentCost: 15000000
  }
];

export const mockPlots: Plot[] = [
  // Tayeeba Smart City Plots
  {
    id: 'PLT-101',
    plotNumber: 'A-101',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    block: 'Block A',
    zone: 'Zone 1',
    road: 'Road 01 (60ft Main Avenue)',
    sizeKatha: 5.0,
    facing: 'South-East',
    perKathaPrice: 1200000,
    basePrice: 6000000,
    discount: 200000,
    finalPrice: 5800000,
    status: 'Booked',
    customerId: 'CUST-201',
    customerName: 'Dr. Anisur Rahman',
    salesExecutiveId: 'USR-05',
    salesExecutiveName: 'Rafiqul Islam',
    bookingDate: '2024-02-10',
    agreementDate: '2024-02-20',
    handoverStatus: 'In Progress'
  },
  {
    id: 'PLT-102',
    plotNumber: 'A-102',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    block: 'Block A',
    zone: 'Zone 1',
    road: 'Road 01 (60ft Main Avenue)',
    sizeKatha: 5.0,
    facing: 'South',
    perKathaPrice: 1200000,
    basePrice: 6000000,
    discount: 100000,
    finalPrice: 5900000,
    status: 'Sold',
    customerId: 'CUST-202',
    customerName: 'Haji Mohammad Younus',
    salesExecutiveId: 'USR-04',
    salesExecutiveName: 'Kamrul Hasan',
    bookingDate: '2024-01-20',
    agreementDate: '2024-02-01',
    handoverStatus: 'Ready'
  },
  {
    id: 'PLT-103',
    plotNumber: 'A-103',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    block: 'Block A',
    zone: 'Zone 1',
    road: 'Road 02 (40ft Road)',
    sizeKatha: 3.0,
    facing: 'North',
    perKathaPrice: 1100000,
    basePrice: 3300000,
    discount: 50000,
    finalPrice: 3250000,
    status: 'Available',
    handoverStatus: 'Pending'
  },
  {
    id: 'PLT-104',
    plotNumber: 'A-104',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    block: 'Block A',
    zone: 'Zone 1',
    road: 'Road 02 (40ft Road)',
    sizeKatha: 3.0,
    facing: 'East',
    perKathaPrice: 1100000,
    basePrice: 3300000,
    discount: 0,
    finalPrice: 3300000,
    status: 'Reserved',
    customerId: 'CUST-203',
    customerName: 'Begum Selina Akhter',
    salesExecutiveId: 'USR-05',
    salesExecutiveName: 'Rafiqul Islam',
    bookingDate: '2024-08-01',
    handoverStatus: 'Pending'
  },
  {
    id: 'PLT-105',
    plotNumber: 'B-201',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    block: 'Block B',
    zone: 'Zone 2',
    road: 'Road 05 (30ft Road)',
    sizeKatha: 10.0,
    facing: 'South',
    perKathaPrice: 1000000,
    basePrice: 10000000,
    discount: 500000,
    finalPrice: 9500000,
    status: 'Available',
    handoverStatus: 'Pending'
  },
  {
    id: 'PLT-106',
    plotNumber: 'B-202',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    block: 'Block B',
    zone: 'Zone 2',
    road: 'Road 05 (30ft Road)',
    sizeKatha: 5.0,
    facing: 'West',
    perKathaPrice: 1050000,
    basePrice: 5250000,
    discount: 50000,
    finalPrice: 5200000,
    status: 'Cancelled',
    handoverStatus: 'Pending'
  },

  // Riverside Valley Plots
  {
    id: 'PLT-201',
    plotNumber: 'R-101',
    projectId: 'PRJ-102',
    projectName: 'Tayeeba Riverside Valley',
    block: 'Block A',
    zone: 'Riverside Block',
    road: 'River Drive 01',
    sizeKatha: 5.0,
    facing: 'South',
    perKathaPrice: 1400000,
    basePrice: 7000000,
    discount: 200000,
    finalPrice: 6800000,
    status: 'Booked',
    customerId: 'CUST-204',
    customerName: 'Kazi Farhana Kabir',
    salesExecutiveId: 'USR-04',
    salesExecutiveName: 'Kamrul Hasan',
    bookingDate: '2023-11-15',
    agreementDate: '2023-12-01',
    handoverStatus: 'In Progress'
  },
  {
    id: 'PLT-202',
    plotNumber: 'R-102',
    projectId: 'PRJ-102',
    projectName: 'Tayeeba Riverside Valley',
    block: 'Block A',
    zone: 'Riverside Block',
    road: 'River Drive 01',
    sizeKatha: 3.5,
    facing: 'East',
    perKathaPrice: 1350000,
    basePrice: 4725000,
    discount: 75000,
    finalPrice: 4650000,
    status: 'Available',
    handoverStatus: 'Pending'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'CUST-201',
    customerId: 'THL-C-8821',
    name: 'Dr. Anisur Rahman',
    fatherMotherName: 'Late Abdul Gafur & Jahanara Begum',
    nid: '19842691238491023',
    dob: '1984-05-12',
    mobile: '01711987654',
    altMobile: '01819123456',
    email: 'dranis.rahman@gmail.com',
    presentAddress: 'House 42, Road 11, Block D, Banani, Dhaka-1213',
    permanentAddress: 'Village: Rampur, Post: Matlab, District: Chandpur',
    profession: 'Senior Consultant (Cardiology), Square Hospital',
    nomineeName: 'Sharmin Sultana',
    nomineeRelation: 'Wife',
    nomineeNid: '19892691238491999',
    referenceName: 'Dr. Kausar Ahmed',
    salesExecutiveId: 'USR-05',
    salesExecutiveName: 'Rafiqul Islam',
    linkedPlotId: 'PLT-101',
    linkedPlotNumber: 'A-101',
    linkedProjectId: 'PRJ-101',
    linkedProjectName: 'Tayeeba Smart City',
    totalPlotValue: 5800000,
    totalPaid: 2300000,
    totalDiscount: 200000,
    totalDue: 3500000,
    documents: [
      { id: 'DOC-1', title: 'Customer NID Copy', fileType: 'pdf', url: '#', uploadDate: '2024-02-10' },
      { id: 'DOC-2', title: 'Booking Agreement Form', fileType: 'pdf', url: '#', uploadDate: '2024-02-20' },
      { id: 'DOC-3', title: 'Passport Photo', fileType: 'jpg', url: '#', uploadDate: '2024-02-10' }
    ],
    notes: 'Requested VIP facing plot. Installment payment via Bank auto-debit.'
  },
  {
    id: 'CUST-202',
    customerId: 'THL-C-8822',
    name: 'Haji Mohammad Younus',
    fatherMotherName: 'Late Al-Haj Osman Gani',
    nid: '19752691238491055',
    dob: '1975-11-25',
    mobile: '01819223344',
    email: 'younus.traders@yahoo.com',
    presentAddress: '68 Chawkbazar Main Road, Lalbagh, Dhaka-1211',
    permanentAddress: 'Same as Present',
    profession: 'Managing Director, Younus Hardware & Metal Ltd.',
    nomineeName: 'Tanvir Younus',
    nomineeRelation: 'Son',
    nomineeNid: '19982691238491888',
    salesExecutiveId: 'USR-04',
    salesExecutiveName: 'Kamrul Hasan',
    linkedPlotId: 'PLT-102',
    linkedPlotNumber: 'A-102',
    linkedProjectId: 'PRJ-101',
    linkedProjectName: 'Tayeeba Smart City',
    totalPlotValue: 5900000,
    totalPaid: 5900000,
    totalDiscount: 100000,
    totalDue: 0,
    documents: [
      { id: 'DOC-4', title: 'Customer NID Copy', fileType: 'pdf', url: '#', uploadDate: '2024-01-20' },
      { id: 'DOC-5', title: 'Full Clearance Certificate', fileType: 'pdf', url: '#', uploadDate: '2024-07-15' }
    ],
    notes: 'Fully paid in lump sum cash + pay order. Ready for handover deed.'
  },
  {
    id: 'CUST-204',
    customerId: 'THL-C-8824',
    name: 'Kazi Farhana Kabir',
    fatherMotherName: 'Kazi Humayun Kabir',
    nid: '19902691238491077',
    dob: '1990-03-18',
    mobile: '01912556677',
    email: 'farhana.kabir@bba.gov.bd',
    presentAddress: 'Flat B-4, Building 12, Govt Officers Colony, Agargaon, Dhaka',
    permanentAddress: 'Brahmanbaria Sadar, Brahmanbaria',
    profession: 'Deputy Secretary, Ministry of Housing & Public Works',
    nomineeName: 'Kazi Saiful Islam',
    nomineeRelation: 'Husband',
    nomineeNid: '19872691238491666',
    salesExecutiveId: 'USR-04',
    salesExecutiveName: 'Kamrul Hasan',
    linkedPlotId: 'PLT-201',
    linkedPlotNumber: 'R-101',
    linkedProjectId: 'PRJ-102',
    linkedProjectName: 'Tayeeba Riverside Valley',
    totalPlotValue: 6800000,
    totalPaid: 3200000,
    totalDiscount: 200000,
    totalDue: 3600000,
    documents: [
      { id: 'DOC-6', title: 'Allotment Letter', fileType: 'pdf', url: '#', uploadDate: '2023-12-01' }
    ],
    notes: 'Monthly 36 installments plan.'
  }
];

export const mockLeads: Lead[] = [
  {
    id: 'LED-301',
    leadId: 'THL-LD-501',
    name: 'Brig. Gen. (Retd.) M. A. Karim',
    phone: '01713009988',
    email: 'akarim.mil@gmail.com',
    source: 'Facebook',
    interestedProjectId: 'PRJ-101',
    interestedProjectName: 'Tayeeba Smart City',
    interestedPlotSizeKatha: 10.0,
    budget: 12000000,
    assignedSalesExecutiveId: 'USR-05',
    assignedSalesExecutiveName: 'Rafiqul Islam',
    status: 'Site Visit Scheduled',
    followUpDate: '2026-08-18',
    notes: 'Interested in Corner 10 katha plot facing south. Wants family site visit transport.',
    createdAt: '2026-08-01'
  },
  {
    id: 'LED-302',
    leadId: 'THL-LD-502',
    name: 'Engr. Mainul Ahsan',
    phone: '01817112233',
    email: 'mainul.ce@buet.ac.bd',
    source: 'Website',
    interestedProjectId: 'PRJ-102',
    interestedProjectName: 'Tayeeba Riverside Valley',
    interestedPlotSizeKatha: 5.0,
    budget: 7000000,
    assignedSalesExecutiveId: 'USR-04',
    assignedSalesExecutiveName: 'Kamrul Hasan',
    status: 'Negotiation',
    followUpDate: '2026-08-16',
    notes: 'Asking for 5% lump sum payment discount.',
    createdAt: '2026-07-20'
  },
  {
    id: 'LED-303',
    leadId: 'THL-LD-503',
    name: 'Syeda Afroza Begum',
    phone: '01911445566',
    email: 'afroza.syed@gmail.com',
    source: 'Exhibition',
    interestedProjectId: 'PRJ-103',
    interestedProjectName: 'Tayeeba Garden Resort City',
    interestedPlotSizeKatha: 3.0,
    budget: 3500000,
    assignedSalesExecutiveId: 'USR-05',
    assignedSalesExecutiveName: 'Rafiqul Islam',
    status: 'New',
    followUpDate: '2026-08-16',
    notes: 'Collected brochure at REHAB Fair 2026.',
    createdAt: '2026-08-10'
  }
];

export const mockSiteVisits: SiteVisit[] = [
  {
    id: 'SV-401',
    leadId: 'LED-301',
    clientName: 'Brig. Gen. (Retd.) M. A. Karim',
    clientPhone: '01713009988',
    visitDate: '2026-08-18',
    visitTime: '11:00 AM',
    salesExecutiveId: 'USR-05',
    salesExecutiveName: 'Rafiqul Islam',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    interestedPlotNumber: 'B-201',
    remarks: 'Company microbus arranged for client pickup from DOHS Mohakhali.',
    followUpDate: '2026-08-19',
    status: 'Scheduled'
  },
  {
    id: 'SV-402',
    leadId: 'LED-302',
    clientName: 'Engr. Mainul Ahsan',
    clientPhone: '01817112233',
    visitDate: '2026-08-05',
    visitTime: '03:30 PM',
    salesExecutiveId: 'USR-04',
    salesExecutiveName: 'Kamrul Hasan',
    projectId: 'PRJ-102',
    projectName: 'Tayeeba Riverside Valley',
    interestedPlotNumber: 'R-101',
    remarks: 'Client visited project site, liked the river embankment height and 40ft road layout.',
    followUpDate: '2026-08-16',
    status: 'Completed'
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'BKG-501',
    bookingNumber: 'THL-BK-2024-001',
    customerId: 'CUST-201',
    customerName: 'Dr. Anisur Rahman',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    plotId: 'PLT-101',
    plotNumber: 'A-101',
    plotSizeKatha: 5.0,
    totalPrice: 6000000,
    discount: 200000,
    finalPrice: 5800000,
    bookingMoney: 300000,
    downPayment: 1000000,
    remainingAmount: 4500000,
    installmentDurationMonths: 36,
    numberOfInstallments: 36,
    frequency: 'Monthly',
    firstInstallmentDate: '2024-04-01',
    agreementDate: '2024-02-20',
    salesExecutiveId: 'USR-05',
    salesExecutiveName: 'Rafiqul Islam',
    bookingDate: '2024-02-10',
    status: 'Active'
  },
  {
    id: 'BKG-502',
    bookingNumber: 'THL-BK-2023-089',
    customerId: 'CUST-204',
    customerName: 'Kazi Farhana Kabir',
    projectId: 'PRJ-102',
    projectName: 'Tayeeba Riverside Valley',
    plotId: 'PLT-201',
    plotNumber: 'R-101',
    plotSizeKatha: 5.0,
    totalPrice: 7000000,
    discount: 200000,
    finalPrice: 6800000,
    bookingMoney: 500000,
    downPayment: 1500000,
    remainingAmount: 4800000,
    installmentDurationMonths: 36,
    numberOfInstallments: 36,
    frequency: 'Monthly',
    firstInstallmentDate: '2024-01-01',
    agreementDate: '2023-12-01',
    salesExecutiveId: 'USR-04',
    salesExecutiveName: 'Kamrul Hasan',
    bookingDate: '2023-11-15',
    status: 'Active'
  }
];

export const mockInstallments: Installment[] = [
  // Dr Anisur Rahman installments (Booking BKG-501)
  {
    id: 'INS-101',
    bookingId: 'BKG-501',
    installmentNumber: 1,
    dueDate: '2024-04-01',
    dueAmount: 125000,
    paidAmount: 125000,
    remainingAmount: 0,
    paymentDate: '2024-03-28',
    paymentMethod: 'Bank Transfer',
    status: 'Paid'
  },
  {
    id: 'INS-102',
    bookingId: 'BKG-501',
    installmentNumber: 2,
    dueDate: '2024-05-01',
    dueAmount: 125000,
    paidAmount: 125000,
    remainingAmount: 0,
    paymentDate: '2024-04-30',
    paymentMethod: 'bKash',
    status: 'Paid'
  },
  {
    id: 'INS-103',
    bookingId: 'BKG-501',
    installmentNumber: 3,
    dueDate: '2024-06-01',
    dueAmount: 125000,
    paidAmount: 125000,
    remainingAmount: 0,
    paymentDate: '2024-06-02',
    paymentMethod: 'Bank Transfer',
    status: 'Paid'
  },
  {
    id: 'INS-104',
    bookingId: 'BKG-501',
    installmentNumber: 4,
    dueDate: '2024-07-01',
    dueAmount: 125000,
    paidAmount: 125000,
    remainingAmount: 0,
    paymentDate: '2024-07-05',
    paymentMethod: 'Bank Transfer',
    status: 'Paid'
  },
  {
    id: 'INS-105',
    bookingId: 'BKG-501',
    installmentNumber: 5,
    dueDate: '2024-08-01',
    dueAmount: 125000,
    paidAmount: 0,
    remainingAmount: 125000,
    status: 'Due'
  },
  {
    id: 'INS-106',
    bookingId: 'BKG-501',
    installmentNumber: 6,
    dueDate: '2024-09-01',
    dueAmount: 125000,
    paidAmount: 0,
    remainingAmount: 125000,
    status: 'Due'
  }
];

export const mockReceipts: PaymentReceipt[] = [
  {
    id: 'RCP-801',
    receiptNumber: 'THL-MR-2024-0412',
    customerId: 'CUST-201',
    customerName: 'Dr. Anisur Rahman',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    plotId: 'PLT-101',
    plotNumber: 'A-101',
    paymentType: 'Booking Money',
    amount: 300000,
    paymentMethod: 'Bank Transfer',
    bankName: 'Dutch-Bangla Bank Ltd.',
    chequeOrTxnNo: 'FT2404109823',
    date: '2024-02-10',
    receivedBy: 'Mahfuzur Rahman (Accounts)',
    authorizedSignature: 'Signed',
    remarks: 'Booking Money Received against Plot A-101'
  },
  {
    id: 'RCP-802',
    receiptNumber: 'THL-MR-2024-0489',
    customerId: 'CUST-201',
    customerName: 'Dr. Anisur Rahman',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    plotId: 'PLT-101',
    plotNumber: 'A-101',
    paymentType: 'Down Payment',
    amount: 1000000,
    paymentMethod: 'Cheque',
    bankName: 'Islami Bank Bangladesh PLC',
    chequeOrTxnNo: 'CQ-7890123',
    date: '2024-02-20',
    receivedBy: 'Mahfuzur Rahman (Accounts)',
    authorizedSignature: 'Signed',
    remarks: 'Down payment for 5 Katha Plot A-101'
  },
  {
    id: 'RCP-803',
    receiptNumber: 'THL-MR-2024-0920',
    customerId: 'CUST-201',
    customerName: 'Dr. Anisur Rahman',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    plotId: 'PLT-101',
    plotNumber: 'A-101',
    paymentType: 'Installment',
    amount: 125000,
    paymentMethod: 'Bank Transfer',
    bankName: 'Eastern Bank PLC',
    chequeOrTxnNo: 'EBL-TR-99812',
    date: '2024-03-28',
    receivedBy: 'Mahfuzur Rahman (Accounts)',
    authorizedSignature: 'Signed',
    remarks: 'Installment #1 payment'
  }
];

export const mockAccounts: Account[] = [
  // Assets
  { code: '1010', name: 'Cash in Hand (Main Office Treasury)', type: 'Asset', subCategory: 'Current Assets', balance: 3450000 },
  { code: '1020', name: 'Dutch-Bangla Bank Ltd (A/C: 110-120-4567)', type: 'Asset', subCategory: 'Current Assets', balance: 18500000 },
  { code: '1025', name: 'Islami Bank Bangladesh PLC (A/C: 2050-7890)', type: 'Asset', subCategory: 'Current Assets', balance: 24200000 },
  { code: '1050', name: 'Customer Accounts Receivable', type: 'Asset', subCategory: 'Accounts Receivable', balance: 7100000 },
  { code: '1100', name: 'Land & Project Inventory (Unsold Plots)', type: 'Asset', subCategory: 'Inventory Assets', balance: 280000000 },

  // Liabilities
  { code: '2010', name: 'Customer Advance Bookings Payable', type: 'Liability', subCategory: 'Current Liabilities', balance: 12500000 },
  { code: '2020', name: 'Supplier & Vendor Payables', type: 'Liability', subCategory: 'Accounts Payable', balance: 4800000 },
  { code: '2030', name: 'Land Owner Payable (Acquisition Dues)', type: 'Liability', subCategory: 'Long Term Liabilities', balance: 15000000 },

  // Equity
  { code: '3010', name: 'Paid-Up Share Capital', type: 'Equity', subCategory: 'Owners Equity', balance: 250000000 },
  { code: '3020', name: 'Retained Earnings', type: 'Equity', subCategory: 'Owners Equity', balance: 88750000 },

  // Revenue
  { code: '4010', name: 'Plot Sales Revenue', type: 'Revenue', subCategory: 'Direct Revenue', balance: 68500000 },
  { code: '4020', name: 'Plot Transfer & Registration Fees Revenue', type: 'Revenue', subCategory: 'Indirect Revenue', balance: 1850000 },
  { code: '4030', name: 'Late Payment Penalty Fee Revenue', type: 'Revenue', subCategory: 'Other Revenue', balance: 350000 },

  // Expense
  { code: '5010', name: 'Site Development & Construction Expense', type: 'Expense', subCategory: 'Direct Expense', balance: 48500000 },
  { code: '5020', name: 'Land Acquisition Purchase Expense', type: 'Expense', subCategory: 'Direct Expense', balance: 65000000 },
  { code: '5030', name: 'Employee Salary & Payroll Expense', type: 'Expense', subCategory: 'Operating Expense', balance: 6400000 },
  { code: '5040', name: 'Marketing, FB Ads & Billboard Expense', type: 'Expense', subCategory: 'Operating Expense', balance: 3200000 },
  { code: '5050', name: 'Sales Commission Expense', type: 'Expense', subCategory: 'Selling Expense', balance: 2800000 },
  { code: '5060', name: 'Office Rent & Utilities Expense', type: 'Expense', subCategory: 'Administrative Expense', balance: 1800000 }
];

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'JV-901',
    voucherNumber: 'JV-2024-0012',
    date: '2024-02-10',
    reference: 'Booking THL-BK-2024-001',
    description: 'Booking Money Payment Received from Dr. Anisur Rahman',
    lines: [
      { accountCode: '1020', accountName: 'Dutch-Bangla Bank Ltd', debit: 300000, credit: 0 },
      { accountCode: '1050', accountName: 'Customer Accounts Receivable', debit: 0, credit: 300000 }
    ],
    createdBy: 'Mahfuzur Rahman FCA',
    status: 'Approved'
  },
  {
    id: 'JV-902',
    voucherNumber: 'JV-2024-0045',
    date: '2024-03-01',
    reference: 'PO-CON-881',
    description: 'Payment for Road Earthfilling Work - Royal Builders Ltd.',
    lines: [
      { accountCode: '5010', accountName: 'Site Development & Construction Expense', debit: 1200000, credit: 0 },
      { accountCode: '1025', accountName: 'Islami Bank Bangladesh PLC', debit: 0, credit: 1200000 }
    ],
    createdBy: 'Mahfuzur Rahman FCA',
    status: 'Approved'
  }
];

export const mockExpenses: Expense[] = [
  {
    id: 'EXP-101',
    expenseId: 'THL-EX-441',
    date: '2026-08-01',
    category: 'Site Development',
    projectId: 'PRJ-101',
    projectName: 'Tayeeba Smart City',
    description: 'Boundary Wall Brick & Cement Supply',
    amount: 850000,
    paymentMethod: 'Bank',
    vendorPayee: 'Messrs. Alam Building Materials',
    approvedBy: 'Engr. Nazmul Huda',
    createdBy: 'Mahfuzur Rahman'
  },
  {
    id: 'EXP-102',
    expenseId: 'THL-EX-442',
    date: '2026-08-05',
    category: 'Facebook Ads',
    description: 'Facebook Lead Generation Campaign (August 2026)',
    amount: 150000,
    paymentMethod: 'Bank',
    vendorPayee: 'Digital Edge Marketing Ltd.',
    approvedBy: 'Tariqul Islam Siddiqui',
    createdBy: 'Kamrul Hasan'
  },
  {
    id: 'EXP-103',
    expenseId: 'THL-EX-443',
    date: '2026-08-10',
    category: 'Office Rent',
    description: 'Head Office Rent - Gulshan 2 (August 2026)',
    amount: 350000,
    paymentMethod: 'Bank',
    vendorPayee: 'Gulshan Tower Mgmt',
    approvedBy: 'Tariqul Islam Siddiqui',
    createdBy: 'Mahfuzur Rahman'
  }
];

export const mockLandParcels: LandParcel[] = [
  {
    id: 'LND-01',
    ownerName: 'Al-Haj Md. Mokbul Hossain',
    ownerPhone: '01711334455',
    ownerNid: '19652691238491011',
    landAreaDecimal: 180,
    mouza: 'Valkuti Mouza, Savar',
    dagNumber: 'Dag 1402, 1403',
    khatianNumber: 'SA Khatian 45, BS 112',
    landType: 'Nal / High Land',
    landPrice: 36000000,
    paidAmount: 28000000,
    dueAmount: 8000000,
    registrationCost: 2800000,
    legalCost: 150000,
    developmentCost: 4500000,
    status: 'Acquired'
  },
  {
    id: 'LND-02',
    ownerName: 'Choudhury Fazlul Haque',
    ownerPhone: '01819556677',
    ownerNid: '19582691238491022',
    landAreaDecimal: 120,
    mouza: 'Keraniganj Mouza',
    dagNumber: 'Dag 890, 891',
    khatianNumber: 'BS Khatian 340',
    landType: 'Viti / Solid Land',
    landPrice: 28000000,
    paidAmount: 28000000,
    dueAmount: 0,
    registrationCost: 2200000,
    legalCost: 120000,
    developmentCost: 3200000,
    status: 'Registered'
  }
];

export const mockCommissions: Commission[] = [
  {
    id: 'COM-01',
    recipientName: 'Rafiqul Islam',
    recipientRole: 'Sales Executive',
    bookingId: 'BKG-501',
    plotNumber: 'A-101',
    customerName: 'Dr. Anisur Rahman',
    saleValue: 5800000,
    commissionType: 'Percentage',
    commissionRate: 1.5,
    commissionAmount: 87000,
    paidAmount: 50000,
    dueAmount: 37000,
    status: 'Partially Paid',
    date: '2024-02-15'
  },
  {
    id: 'COM-02',
    recipientName: 'Kamrul Hasan',
    recipientRole: 'Sales Manager',
    bookingId: 'BKG-502',
    plotNumber: 'R-101',
    customerName: 'Kazi Farhana Kabir',
    saleValue: 6800000,
    commissionType: 'Percentage',
    commissionRate: 2.0,
    commissionAmount: 136000,
    paidAmount: 136000,
    dueAmount: 0,
    status: 'Paid',
    date: '2023-12-05'
  }
];

export const mockVendors: Vendor[] = [
  {
    id: 'VND-01',
    name: 'Royal Builders & Earthmovers Ltd.',
    contactPerson: 'Engr. Sohel Rana',
    phone: '01712889900',
    address: 'Plot 14, Sector 7, Uttara, Dhaka',
    nidOrTradeLicense: 'TL-DH-992144',
    category: 'Heavy Equipment',
    totalPurchases: 18500000,
    totalPaid: 16000000,
    outstandingBalance: 2500000
  },
  {
    id: 'VND-02',
    name: 'Alam Cement & Steel Traders',
    contactPerson: 'Md. Shah Alam',
    phone: '01819776655',
    address: 'Gabtoli Bus Terminal Road, Mirpur, Dhaka',
    nidOrTradeLicense: 'TL-DH-881200',
    category: 'Construction Materials',
    totalPurchases: 12000000,
    totalPaid: 9700000,
    outstandingBalance: 2300000
  }
];

export const mockEmployees: Employee[] = [
  {
    id: 'EMP-01',
    employeeId: 'THL-EMP-101',
    name: 'Mahfuzur Rahman FCA',
    department: 'Accounts & Finance',
    designation: 'Chief Financial Officer (CFO)',
    joiningDate: '2021-03-01',
    baseSalary: 150000,
    phone: '01711000111',
    email: 'mahfuz.cfo@tayeebahousing.com',
    status: 'Active'
  },
  {
    id: 'EMP-02',
    employeeId: 'THL-EMP-102',
    name: 'Kamrul Hasan',
    department: 'Sales',
    designation: 'Head of Sales',
    joiningDate: '2022-01-15',
    baseSalary: 120000,
    phone: '01819000222',
    email: 'kamrul.sales@tayeebahousing.com',
    status: 'Active'
  },
  {
    id: 'EMP-03',
    employeeId: 'THL-EMP-103',
    name: 'Rafiqul Islam',
    department: 'Sales',
    designation: 'Senior Sales Executive',
    joiningDate: '2023-05-01',
    baseSalary: 45000,
    phone: '01912000333',
    email: 'rafiq.sales@tayeebahousing.com',
    status: 'Active'
  }
];

export const mockPayrolls: Payroll[] = [
  {
    id: 'PAY-01',
    month: 'July',
    year: 2026,
    employeeId: 'EMP-01',
    employeeName: 'Mahfuzur Rahman FCA',
    department: 'Accounts & Finance',
    baseSalary: 150000,
    commissionBonus: 20000,
    advanceDeductions: 0,
    netSalary: 170000,
    paymentStatus: 'Paid',
    paymentDate: '2026-08-01'
  },
  {
    id: 'PAY-02',
    month: 'July',
    year: 2026,
    employeeId: 'EMP-02',
    employeeName: 'Kamrul Hasan',
    department: 'Sales',
    baseSalary: 120000,
    commissionBonus: 45000,
    advanceDeductions: 5000,
    netSalary: 160000,
    paymentStatus: 'Paid',
    paymentDate: '2026-08-01'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'LOG-01',
    userName: 'Al-Haj Engr. Tayeebur Rahman',
    userRole: 'Super Admin',
    date: '2026-08-15',
    time: '11:30 AM',
    action: 'Plot Status Change',
    module: 'Plot Inventory',
    recordId: 'PLT-101',
    oldValue: 'Available',
    newValue: 'Booked',
    ipAddress: '103.114.98.12'
  },
  {
    id: 'LOG-02',
    userName: 'Mahfuzur Rahman FCA',
    userRole: 'Accounts',
    date: '2026-08-15',
    time: '10:15 AM',
    action: 'Payment Receipt Created',
    module: 'Collections',
    recordId: 'RCP-803',
    oldValue: 'N/A',
    newValue: 'Receipt BDT 125,000 for Dr. Anisur Rahman',
    ipAddress: '103.114.98.15'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    title: 'Installment Overdue',
    message: 'Dr. Anisur Rahman (Plot A-101) installment #5 is due (BDT 125,000).',
    type: 'warning',
    date: '2026-08-15',
    read: false,
    linkTab: 'dues'
  },
  {
    id: 'NOTIF-02',
    title: 'New Site Visit Scheduled',
    message: 'Brig. Gen. M. A. Karim scheduled for Tayeeba Smart City on 18th Aug.',
    type: 'info',
    date: '2026-08-14',
    read: false,
    linkTab: 'crm'
  },
  {
    id: 'NOTIF-03',
    title: 'Collection Received',
    message: 'BDT 125,000 received via Bank Transfer for Plot A-101.',
    type: 'success',
    date: '2026-08-12',
    read: true,
    linkTab: 'collections'
  }
];
