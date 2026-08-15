import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentReceipt, Booking, Customer, Plot, Payroll } from '../types/erp';

// BDT currency formatter helper
export const formatBDT = (amount: number): string => {
  return '৳ ' + amount.toLocaleString('en-IN');
};

// Convert number to words in Taka
export const numberToWordsBDT = (num: number): string => {
  if (num === 0) return 'Zero Taka Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  };

  return inWords(num).trim() + ' Taka Only';
};

// Header Drawer
const drawHeader = (doc: jsPDF, title: string) => {
  // Brand Emerald Header background block
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(0, 0, 210, 32, 'F');

  // Title text & Logo branding
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TAYEEBA HOUSING LTD.', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Corporate Office: Gulshan Tower (Level 8), Plot 44, Gulshan-2, Dhaka-1212', 14, 21);
  doc.text('Hotline: +880 9612-889900 | Email: info@tayeebahousing.com | Web: www.tayeebahousing.com', 14, 26);

  // Document Title Badge (Gold)
  doc.setFillColor(217, 119, 6); // Royal Gold
  doc.rect(140, 8, 56, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(title.toUpperCase(), 144, 18);
};

// 1. Generate Money Receipt PDF
export const generateMoneyReceiptPDF = (receipt: PaymentReceipt) => {
  const doc = new jsPDF();

  drawHeader(doc, 'MONEY RECEIPT');

  let y = 45;

  // Receipt Meta Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt No: ${receipt.receiptNumber}`, 14, y);
  doc.text(`Date: ${receipt.date}`, 150, y);

  y += 8;
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  autoTable(doc, {
    startY: y,
    head: [['Field', 'Details']],
    body: [
      ['Received From (Customer)', `${receipt.customerName} (ID: ${receipt.customerId})`],
      ['Project Name', receipt.projectName],
      ['Plot Number', receipt.plotNumber],
      ['Payment Type', receipt.paymentType],
      ['Payment Method', `${receipt.paymentMethod} ${receipt.bankName ? `(${receipt.bankName})` : ''}`],
      ['Txn / Cheque No', receipt.chequeOrTxnNo || 'N/A'],
      ['Amount Received', `${formatBDT(receipt.amount)} (${numberToWordsBDT(receipt.amount)})`],
      ['Remarks / Notes', receipt.remarks || 'Payment received with thanks.']
    ],
    theme: 'grid',
    headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 25;

  // Signatures
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  doc.line(14, finalY, 64, finalY);
  doc.text('Customer Signature', 14, finalY + 5);

  doc.line(80, finalY, 130, finalY);
  doc.text('Prepared By (Accounts)', 80, finalY + 5);

  doc.line(146, finalY, 196, finalY);
  doc.text('Authorized Director Signature', 146, finalY + 5);

  // Seal / Note
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('* This is a computer-generated official money receipt of Tayeeba Housing Ltd.', 14, finalY + 20);

  doc.save(`Receipt_${receipt.receiptNumber}.pdf`);
};

// 2. Generate Booking Agreement Form PDF
export const generateBookingFormPDF = (booking: Booking, customer: Customer, plot: Plot) => {
  const doc = new jsPDF();

  drawHeader(doc, 'BOOKING FORM');

  let y = 42;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text('1. APPLICANT & PLOT BOOKING DETAILS', 14, y);

  y += 5;
  autoTable(doc, {
    startY: y,
    body: [
      ['Booking No', booking.bookingNumber, 'Booking Date', booking.bookingDate],
      ['Applicant Name', customer.name, 'Customer ID', customer.customerId],
      ['Father / Husband', customer.fatherMotherName, 'Mobile', customer.mobile],
      ['NID Number', customer.nid, 'Email', customer.email],
      ['Project Name', booking.projectName, 'Plot Number', booking.plotNumber],
      ['Plot Size', `${booking.plotSizeKatha} Katha`, 'Facing', plot.facing || 'South']
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 3 }
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text('2. FINANCIAL PAYMENT STRUCTURE', 14, y);

  y += 5;
  autoTable(doc, {
    startY: y,
    head: [['Particulars', 'Amount (BDT)']],
    body: [
      ['Base Plot Price', formatBDT(booking.totalPrice)],
      ['Special Discount', `- ${formatBDT(booking.discount)}`],
      ['Net Final Plot Price', formatBDT(booking.finalPrice)],
      ['Booking Money Paid', formatBDT(booking.bookingMoney)],
      ['Down Payment Paid', formatBDT(booking.downPayment)],
      ['Remaining Balance (Installments)', formatBDT(booking.remainingAmount)],
      ['Installment Tenure & Frequency', `${booking.installmentDurationMonths} Months (${booking.numberOfInstallments} ${booking.frequency} Installments)`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text('3. NOMINEE INFORMATION', 14, y);

  y += 5;
  autoTable(doc, {
    startY: y,
    body: [
      ['Nominee Name', customer.nomineeName],
      ['Relation', customer.nomineeRelation],
      ['Nominee NID', customer.nomineeNid]
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 3 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 25;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.line(14, finalY, 64, finalY);
  doc.text('Applicant Signature', 14, finalY + 5);

  doc.line(80, finalY, 130, finalY);
  doc.text('Sales Executive Signature', 80, finalY + 5);

  doc.line(146, finalY, 196, finalY);
  doc.text('Managing Director Signature', 146, finalY + 5);

  doc.save(`Booking_${booking.bookingNumber}.pdf`);
};

// 3. Generate Customer Ledger Statement PDF
export const generateCustomerLedgerPDF = (customer: Customer, receipts: PaymentReceipt[]) => {
  const doc = new jsPDF();

  drawHeader(doc, 'ACCOUNT STATEMENT');

  let y = 42;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Customer Name: ${customer.name} (ID: ${customer.customerId})`, 14, y);
  doc.text(`Phone: ${customer.mobile} | NID: ${customer.nid}`, 14, y + 5);
  doc.text(`Project: ${customer.linkedProjectName} | Plot: ${customer.linkedPlotNumber}`, 14, y + 10);

  y += 18;

  // Financial summary boxes
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 55, 18, 'F');
  doc.rect(75, y, 55, 18, 'F');
  doc.rect(136, y, 60, 18, 'F');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL PLOT VALUE', 18, y + 5);
  doc.text('TOTAL PAID AMOUNT', 79, y + 5);
  doc.text('OUTSTANDING DUE', 140, y + 5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatBDT(customer.totalPlotValue), 18, y + 13);

  doc.setTextColor(5, 150, 105);
  doc.text(formatBDT(customer.totalPaid), 79, y + 13);

  doc.setTextColor(225, 29, 72);
  doc.text(formatBDT(customer.totalDue), 140, y + 13);

  y += 24;

  const customerReceipts = receipts.filter(r => r.customerId === customer.id);

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Receipt No', 'Payment Type', 'Method', 'Amount Paid']],
    body: customerReceipts.map(r => [
      r.date,
      r.receiptNumber,
      r.paymentType,
      r.paymentMethod,
      formatBDT(r.amount)
    ]),
    theme: 'striped',
    headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 4 }
  });

  doc.save(`Ledger_${customer.customerId}.pdf`);
};

// 4. Generate Payroll Slip PDF
export const generateSalarySlipPDF = (payroll: Payroll) => {
  const doc = new jsPDF();

  drawHeader(doc, 'SALARY SLIP');

  let y = 45;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Employee Name: ${payroll.employeeName}`, 14, y);
  doc.text(`Department: ${payroll.department}`, 14, y + 6);
  doc.text(`Pay Period: ${payroll.month} ${payroll.year}`, 150, y);

  y += 15;

  autoTable(doc, {
    startY: y,
    head: [['Earnings & Deductions', 'Amount (BDT)']],
    body: [
      ['Base Gross Salary', formatBDT(payroll.baseSalary)],
      ['Sales Commission / Incentive', formatBDT(payroll.commissionBonus)],
      ['Advance & Tax Deductions', `- ${formatBDT(payroll.advanceDeductions)}`],
      ['NET SALARY PAID', formatBDT(payroll.netSalary)]
    ],
    theme: 'grid',
    headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255] }
  });

  doc.save(`SalarySlip_${payroll.employeeName}_${payroll.month}.pdf`);
};
