import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Plot, Customer } from '../../types/erp';
import { formatBDT, generateBookingFormPDF, generateMoneyReceiptPDF } from '../../utils/pdfGenerator';
import { 
  FileCheck, UserPlus, Calculator, CheckCircle2, 
  ArrowRight, Download, Printer, Plus, AlertCircle 
} from 'lucide-react';

export const BookingWizard: React.FC = () => {
  const { 
    plots, projects, customers, bookings, 
    createBooking, addCustomer, language 
  } = useERP();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // New Customer Modal inside booking wizard
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustNid, setNewCustNid] = useState('');
  const [newCustFather, setNewCustFather] = useState('');
  const [newCustNominee, setNewCustNominee] = useState('');
  const [newCustNomineeNid, setNewCustNomineeNid] = useState('');

  // Financial Config
  const [discount, setDiscount] = useState<number>(100000);
  const [bookingMoney, setBookingMoney] = useState<number>(300000);
  const [downPayment, setDownPayment] = useState<number>(1000000);
  const [durationMonths, setDurationMonths] = useState<number>(36);
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly'>('Monthly');

  // Available Plots in selected project
  const availablePlotsInPrj = plots.filter(p => p.projectId === selectedProjectId && p.status === 'Available');
  const activePlot = plots.find(p => p.id === selectedPlotId);
  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  const basePrice = activePlot ? activePlot.basePrice : 0;
  const finalPrice = Math.max(0, basePrice - discount);
  const remainingInstallmentBalance = Math.max(0, finalPrice - (bookingMoney + downPayment));
  
  const numInstallments = frequency === 'Monthly' ? durationMonths : Math.ceil(durationMonths / 3);
  const perInstallmentAmount = numInstallments > 0 ? Math.round(remainingInstallmentBalance / numInstallments) : 0;

  // Handle Submit Booking
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlotId || !selectedCustomerId || !selectedProjectId) {
      alert("Please select project, plot, and customer.");
      return;
    }

    try {
      const createdBooking = createBooking({
        customerId: selectedCustomerId,
        projectId: selectedProjectId,
        plotId: selectedPlotId,
        totalPrice: basePrice,
        discount: discount,
        bookingMoney: bookingMoney,
        downPayment: downPayment,
        durationMonths: durationMonths,
        frequency: frequency,
        firstInstallmentDate: new Date().toISOString().split('T')[0],
        salesExecutiveId: 'USR-05',
        salesExecutiveName: 'Rafiqul Islam'
      });

      alert(`Booking ${createdBooking.bookingNumber} created successfully! Plot status updated to BOOKED.`);
      
      // Auto trigger PDF download
      if (activeCustomer && activePlot) {
        generateBookingFormPDF(createdBooking, activeCustomer, activePlot);
      }

      setActiveTab('list');
      setSelectedPlotId('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Quick inline new customer handler
  const handleSaveInlineCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustMobile || !newCustNid) {
      alert("Name, Mobile & NID are required.");
      return;
    }

    const createdCust = addCustomer({
      name: newCustName,
      fatherMotherName: newCustFather || 'N/A',
      nid: newCustNid,
      dob: '1990-01-01',
      mobile: newCustMobile,
      email: `${newCustName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      presentAddress: 'Dhaka, Bangladesh',
      permanentAddress: 'Bangladesh',
      profession: 'Business / Private Service',
      nomineeName: newCustNominee || 'N/A',
      nomineeRelation: 'Spouse/Family',
      nomineeNid: newCustNomineeNid || 'N/A',
      salesExecutiveId: 'USR-05',
      salesExecutiveName: 'Rafiqul Islam',
      totalPlotValue: 0,
      totalDiscount: 0,
      documents: []
    });

    setSelectedCustomerId(createdCust.id);
    setShowAddCustomerModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Tabs */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-tayeeba-400" />
            <span>{isBn ? "বুকিং ইঞ্জিন ও এগ্রিমেন্ট" : "Booking Engine & Allotment Management"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isBn ? "নতুন প্লট বুকিং, অটোমেটেড কিস্তি শিডিউল ও একাউন্টস লেজার এন্ট্রি" : "Automated booking creation, installment generation, customer receivables & PDF agreements."}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'create' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            + Create New Booking
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'list' ? 'bg-tayeeba-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            All Bookings ({bookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Project & Plot */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-tayeeba-400 uppercase tracking-wider border-b border-slate-700 pb-2">
                1. Select Project & Plot
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Project Name</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      setSelectedPlotId('');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tayeeba-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Available Plots</label>
                  <select
                    value={selectedPlotId}
                    onChange={(e) => setSelectedPlotId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tayeeba-500"
                  >
                    <option value="">-- Choose Available Plot ({availablePlotsInPrj.length}) --</option>
                    {availablePlotsInPrj.map(p => (
                      <option key={p.id} value={p.id}>Plot {p.plotNumber} ({p.sizeKatha} Katha - {formatBDT(p.basePrice)})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Customer Selection */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <h3 className="text-sm font-bold text-tayeeba-400 uppercase tracking-wider">
                  2. Select / Create Customer
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(true)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-tayeeba-300 px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Quick Add Customer</span>
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Select Registered Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-tayeeba-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Mobile: {c.mobile} | NID: {c.nid})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Pricing & Installment Setup */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-tayeeba-400 uppercase tracking-wider border-b border-slate-700 pb-2">
                3. Configure Payment & Installment Terms
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Special Discount (BDT)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tayeeba-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Booking Money (BDT)</label>
                  <input
                    type="number"
                    value={bookingMoney}
                    onChange={(e) => setBookingMoney(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tayeeba-500 font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Down Payment (BDT)</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tayeeba-500 font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Months)</label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tayeeba-500"
                  >
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tayeeba-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Booking Breakdown Card & Action */}
          <div className="space-y-6">
            <div className="bg-gradient-to-b from-slate-900 to-slate-800 border border-tayeeba-500/40 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-3 flex items-center justify-between">
                <span>Booking Financial Summary</span>
                <span className="text-xs bg-tayeeba-500/20 text-tayeeba-400 px-2.5 py-0.5 rounded-full border border-tayeeba-500/30">
                  Calculated
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Base Price</span>
                  <span className="font-bold text-white">{formatBDT(basePrice)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Special Discount</span>
                  <span className="font-bold text-rose-400">- {formatBDT(discount)}</span>
                </div>
                <div className="flex justify-between py-1.5 bg-tayeeba-950/60 p-2 rounded-lg font-bold">
                  <span className="text-tayeeba-300">Final Agreed Price</span>
                  <span className="text-tayeeba-400 text-sm">{formatBDT(finalPrice)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Booking Money</span>
                  <span className="font-bold text-emerald-400">{formatBDT(bookingMoney)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Down Payment</span>
                  <span className="font-bold text-emerald-400">{formatBDT(downPayment)}</span>
                </div>
                <div className="flex justify-between py-1.5 bg-slate-800 p-2 rounded-lg font-bold">
                  <span className="text-slate-300">Remaining Balance</span>
                  <span className="text-gold-400">{formatBDT(remainingInstallmentBalance)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs space-y-1">
                <div className="text-slate-400 text-[10px]">Installment Calculation</div>
                <div className="font-extrabold text-white text-sm">
                  {numInstallments} {frequency} Installments
                </div>
                <div className="text-tayeeba-400 font-bold">
                  {formatBDT(perInstallmentAmount)} / installment
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-tayeeba-600 to-tayeeba-500 hover:from-tayeeba-500 hover:to-tayeeba-400 text-white font-extrabold py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Generate Booking</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Bookings List View */
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-700">
                <th className="p-3">Booking #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Project & Plot</th>
                <th className="p-3">Final Price</th>
                <th className="p-3">Booking Money</th>
                <th className="p-3">Remaining</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-700/40 transition text-slate-200">
                  <td className="p-3 font-bold text-tayeeba-400">{b.bookingNumber}</td>
                  <td className="p-3 font-semibold text-white">{b.customerName}</td>
                  <td className="p-3">{b.projectName} (Plot {b.plotNumber})</td>
                  <td className="p-3 font-bold">{formatBDT(b.finalPrice)}</td>
                  <td className="p-3 text-emerald-400 font-semibold">{formatBDT(b.bookingMoney)}</td>
                  <td className="p-3 text-rose-400 font-semibold">{formatBDT(b.remainingAmount)}</td>
                  <td className="p-3">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold text-[10px]">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        const cust = customers.find(c => c.id === b.customerId);
                        const plot = plots.find(p => p.id === b.plotId);
                        if (cust && plot) generateBookingFormPDF(b, cust, plot);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-tayeeba-300 p-1.5 rounded-lg text-xs font-bold inline-flex items-center space-x-1"
                      title="Download Booking Form PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-2">
              Quick Add Customer
            </h3>

            <form onSubmit={handleSaveInlineCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={newCustMobile}
                    onChange={(e) => setNewCustMobile(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NID Number *</label>
                  <input
                    type="text"
                    required
                    value={newCustNid}
                    onChange={(e) => setNewCustNid(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Father / Mother Name</label>
                <input
                  type="text"
                  value={newCustFather}
                  onChange={(e) => setNewCustFather(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-tayeeba-600 hover:bg-tayeeba-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
