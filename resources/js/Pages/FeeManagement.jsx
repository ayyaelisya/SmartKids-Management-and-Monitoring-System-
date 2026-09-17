import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminFees({
    auth,
    monthlyFees = [],
    latePickups = [],
    feeStructures = [],
    students = [],
    summary = {
        totalFees: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
    }
}) {
    // Ekstrak array senarai yuran (mengendalikan Inertia Paginated Object atau Pure Array)
    const feesList = Array.isArray(monthlyFees)
        ? monthlyFees
        : (monthlyFees && Array.isArray(monthlyFees.data) ? monthlyFees.data : []);

    // Search and Filter States
    const [search, setSearch] = useState('');
    const [monthFilter, setMonthFilter] = useState('August');
    const [yearFilter, setYearFilter] = useState('2026');
    const [classFilter, setClassFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [feeTypeFilter, setFeeTypeFilter] = useState('All');

    // Modals & UI States
    const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'structure' | 'latepickup'
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    // Record Payment Form State
    const [recordForm, setRecordForm] = useState({
        student_id: '',
        fee_type: 'Monthly Fee',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        reference_no: '',
        remarks: ''
    });

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Derived Collection Rates
    const totalFees = summary?.totalFees || 0;
    const totalPaid = summary?.totalPaid || 0;
    const totalPending = summary?.totalPending || 0;
    const totalOverdue = summary?.totalOverdue || 0;
    const collectionRate = totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(1) : '0.0';

    // Filtering Logic menggunakan feesList yang telah disemak
    const filteredFees = feesList.filter(fee => {
        const matchSearch = (fee.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
                            (fee.parent_name || '').toLowerCase().includes(search.toLowerCase()) ||
                            (fee.invoice_ref || fee.invoice_no || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || fee.status === statusFilter;
        const matchClass = classFilter === 'All' || fee.class_name === classFilter;
        const matchType = feeTypeFilter === 'All' || fee.fee_type === feeTypeFilter;
        return matchSearch && matchStatus && matchClass && matchType;
    });

    const handleRecordSubmit = (e) => {
        e.preventDefault();
        router.post('/admin/fees/record-payment', recordForm, {
            onSuccess: () => {
                setShowRecordModal(false);
                setRecordForm({
                    student_id: '',
                    fee_type: 'Monthly Fee',
                    amount: '',
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_method: 'Cash',
                    reference_no: '',
                    remarks: ''
                });
                triggerToast('Payment recorded successfully.');
            }
        });
    };

    const handleSendReminder = (feeId, studentName) => {
        router.post(`/admin/fees/${feeId}/send-reminder`, {}, {
            onSuccess: () => {
                triggerToast(`Payment reminder sent successfully to ${studentName}'s parent.`);
            }
        });
    };

    const handleToggleFeeStatus = (structureId) => {
        router.patch(`/admin/fees/structure/${structureId}/toggle`, {}, {
            onSuccess: () => {
                triggerToast('Fee structure updated successfully.');
            }
        });
    };

    const handleIncludeLateFee = (latePickupId) => {
        router.post(`/admin/fees/late-pickup/${latePickupId}/include`, {}, {
            onSuccess: () => {
                triggerToast('Late fee included in payment record.');
            }
        });
    };

    return (
        <AuthenticatedLayout activeNavId="billing"
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Fee Management</h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Manage student fees, payments, outstanding balances, and late pickup charges.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab(activeTab === 'structure' ? 'payments' : 'structure')}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                        >
                            {activeTab === 'structure' ? '← Back to Payments' : 'Manage Fee Structure'}
                        </button>
                        <button
                            onClick={() => setShowRecordModal(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                            <span className="text-sm font-bold">+</span> Record Payment
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Fee Management - Smart Kids" />

            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
                    <span>✓</span> {toastMessage}
                </div>
            )}

            <div className="py-6 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500">Total Fees</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">RM {Number(totalFees).toFixed(2)}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Expected for {monthFilter} {yearFilter}</p>
                        </div>
                        <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">💰</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-600">Paid</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">RM {Number(totalPaid).toFixed(2)}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Successfully collected</p>
                        </div>
                        <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg">✓</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-amber-600">Pending</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">RM {Number(totalPending).toFixed(2)}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting payment</p>
                        </div>
                        <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-lg">⏳</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-rose-600">Overdue</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">RM {Number(totalOverdue).toFixed(2)}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Passed due date</p>
                        </div>
                        <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold text-lg">!</div>
                    </div>
                </div>

                {/* FEE COLLECTION OVERVIEW */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Fee Collection Overview</h2>
                            <p className="text-xs text-slate-500">Real-time status of targets for selected period</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                            >
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected</span>
                            <p className="text-base font-bold text-slate-800 mt-0.5">RM {Number(totalFees).toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Collected</span>
                            <p className="text-base font-bold text-emerald-700 mt-0.5">RM {Number(totalPaid).toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Outstanding</span>
                            <p className="text-base font-bold text-rose-600 mt-0.5">RM {Number(totalPending + totalOverdue).toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Collection Rate</span>
                            <p className="text-base font-bold text-indigo-700 mt-0.5">{collectionRate}%</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.min(Number(collectionRate), 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                            <span>0%</span>
                            <span>Target: 100%</span>
                        </div>
                    </div>
                </div>

                {/* TAB SWITCHER */}
                <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`pb-3 transition-all ${activeTab === 'payments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'hover:text-slate-800'}`}
                    >
                        Payment Records
                    </button>
                    <button
                        onClick={() => setActiveTab('latepickup')}
                        className={`pb-3 transition-all ${activeTab === 'latepickup' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'hover:text-slate-800'}`}
                    >
                        Late Pickup Charges
                    </button>
                    <button
                        onClick={() => setActiveTab('structure')}
                        className={`pb-3 transition-all ${activeTab === 'structure' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'hover:text-slate-800'}`}
                    >
                        Fee Structure Configuration
                    </button>
                </div>

                {/* TAB 1: PAYMENT RECORDS & FILTERS */}
                {activeTab === 'payments' && (
                    <div className="space-y-4">
                        {/* SEARCH & FILTERS */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
                            <div className="relative flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search student, parent, or invoice ref..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white transition-all"
                                />
                                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={classFilter}
                                    onChange={(e) => setClassFilter(e.target.value)}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                                >
                                    <option value="All">All Classes</option>
                                    {[...new Set(feesList.map(f => f.class_name).filter(Boolean))].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>

                                <select
                                    value={feeTypeFilter}
                                    onChange={(e) => setFeeTypeFilter(e.target.value)}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                                >
                                    <option value="All">All Fee Types</option>
                                    {[...new Set(feesList.map(f => f.fee_type).filter(Boolean))].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>
                        </div>

                        {/* PAYMENT RECORDS TABLE */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                                            <th className="p-4">Invoice Ref</th>
                                            <th className="p-4">Student & Parent</th>
                                            <th className="p-4">Class</th>
                                            <th className="p-4">Fee Breakdown</th>
                                            <th className="p-4">Total Amount</th>
                                            <th className="p-4">Due Date</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                        {filteredFees.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="p-12 text-center text-slate-400">
                                                    No payment records found matching your filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFees.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                                                    <td className="p-4 font-bold text-indigo-600">
                                                        {item.invoice_ref || item.invoice_no || `INV-${item.id}`}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-900">{item.student_name}</div>
                                                        <div className="text-[11px] text-slate-400">Parent: {item.parent_name || '-'}</div>
                                                    </td>
                                                    <td className="p-4 font-medium">{item.class_name || '-'}</td>
                                                    <td className="p-4 leading-relaxed">
                                                        <div className="text-slate-600">Base: RM {Number(item.base_fee || item.amount || 0).toFixed(2)}</div>
                                                        {item.late_pickup_fee > 0 && (
                                                            <div className="font-bold text-rose-600">
                                                                + Late Fee: RM {Number(item.late_pickup_fee).toFixed(2)}
                                                            </div>
                                                        )}
                                                        {item.fpx_fee > 0 && (
                                                            <div className="text-[10px] text-slate-400">
                                                                + FPX Fee: RM {Number(item.fpx_fee).toFixed(2)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 font-bold text-slate-900 text-sm">
                                                        RM {Number(item.total_amount || item.amount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="p-4 text-slate-500">{item.due_date || '-'}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                                                            item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            item.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => setSelectedDetail(item)}
                                                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                                                            >
                                                                View
                                                            </button>

                                                            {item.status === 'Paid' ? (
                                                                <a
                                                                    href={`/admin/fees/receipt/${item.id}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-[11px] transition-all flex items-center gap-1"
                                                                >
                                                                    💵 Receipt
                                                                </a>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleSendReminder(item.id, item.student_name)}
                                                                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] transition-all flex items-center gap-1"
                                                                >
                                                                    🚀 Remind
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: LATE PICKUP FEES */}
                {activeTab === 'latepickup' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Late Pickup Fee Tracking</h2>
                            <p className="text-xs text-slate-500">Automatically tracked via SKMMS student check-out system</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                                        <th className="p-3.5">Student Name</th>
                                        <th className="p-3.5">Class</th>
                                        <th className="p-3.5">Expected Pickup</th>
                                        <th className="p-3.5">Actual Pickup</th>
                                        <th className="p-3.5">Late Duration</th>
                                        <th className="p-3.5">Late Fee</th>
                                        <th className="p-3.5">Status</th>
                                        <th className="p-3.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                    {(!latePickups || latePickups.length === 0) ? (
                                        <tr>
                                            <td colSpan="8" className="p-8 text-center text-slate-400">
                                                No late pickup records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        latePickups.map((row) => (
                                            <tr key={row.id}>
                                                <td className="p-3.5 font-bold text-slate-900">{row.student_name}</td>
                                                <td className="p-3.5">{row.class_name || '-'}</td>
                                                <td className="p-3.5 text-slate-500">{row.expected_time || '-'}</td>
                                                <td className="p-3.5 font-semibold text-rose-600">{row.actual_time || '-'}</td>
                                                <td className="p-3.5">{row.late_duration || '-'}</td>
                                                <td className="p-3.5 font-bold text-slate-900">RM {Number(row.fee || 0).toFixed(2)}</td>
                                                <td className="p-3.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        row.status === 'Unpaid' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-right">
                                                    {row.status === 'Unpaid' && (
                                                        <button
                                                            onClick={() => handleIncludeLateFee(row.id)}
                                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold"
                                                        >
                                                            Include in Payment
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: FEE STRUCTURE */}
                {activeTab === 'structure' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Fee Structure Configuration</h2>
                                <p className="text-xs text-slate-500">Add or deactivate recurring student charges</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                                        <th className="p-3.5">Fee Type</th>
                                        <th className="p-3.5">Amount (RM)</th>
                                        <th className="p-3.5">Frequency</th>
                                        <th className="p-3.5">Status</th>
                                        <th className="p-3.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                                    {(!feeStructures || feeStructures.length === 0) ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-400">
                                                No fee structures configured.
                                            </td>
                                        </tr>
                                    ) : (
                                        feeStructures.map((f) => (
                                            <tr key={f.id}>
                                                <td className="p-3.5 font-bold text-slate-900">{f.name}</td>
                                                <td className="p-3.5 font-bold">RM {Number(f.amount || 0).toFixed(2)}</td>
                                                <td className="p-3.5">{f.frequency}</td>
                                                <td className="p-3.5">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                        f.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {f.status}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-right">
                                                    <button
                                                        onClick={() => handleToggleFeeStatus(f.id)}
                                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                                                    >
                                                        {f.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MONTHLY FEE REPORT */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Monthly Fee Statement Report</h2>
                        <p className="text-xs text-slate-500">Generate printable financial reports for {monthFilter} {yearFilter}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <a
                            href={`/admin/fees/export-pdf?month=${monthFilter}&year=${yearFilter}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 md:flex-none text-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all"
                        >
                            Export PDF
                        </a>
                        <a
                            href={`/admin/fees/export-csv?month=${monthFilter}&year=${yearFilter}`}
                            className="flex-1 md:flex-none text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all"
                        >
                            Export CSV
                        </a>
                    </div>
                </div>

            </div>

            {/* PAYMENT DETAILS MODAL */}
            {selectedDetail && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-base font-bold text-slate-900">Payment & Invoice Details</h3>
                            <button onClick={() => setSelectedDetail(null)} className="text-slate-400 font-bold">✕</button>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Invoice Ref:</span> <strong className="text-indigo-600">{selectedDetail.invoice_ref || selectedDetail.invoice_no || `INV-${selectedDetail.id}`}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Student Name:</span> <strong className="text-slate-900">{selectedDetail.student_name}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Parent Name:</span> <strong className="text-slate-900">{selectedDetail.parent_name || '-'}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Class:</span> <strong>{selectedDetail.class_name || '-'}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Base Fee:</span> <strong>RM {Number(selectedDetail.base_fee || selectedDetail.amount || 0).toFixed(2)}</strong>
                            </div>
                            {selectedDetail.late_pickup_fee > 0 && (
                                <div className="flex justify-between py-1 border-b border-slate-50 text-rose-600">
                                    <span>Late Pickup Fee:</span> <strong>+ RM {Number(selectedDetail.late_pickup_fee).toFixed(2)}</strong>
                                </div>
                            )}
                            {selectedDetail.fpx_fee > 0 && (
                                <div className="flex justify-between py-1 border-b border-slate-50 text-slate-500">
                                    <span>FPX Fee:</span> <strong>+ RM {Number(selectedDetail.fpx_fee).toFixed(2)}</strong>
                                </div>
                            )}
                            <div className="flex justify-between py-1 border-b border-slate-50 bg-slate-50 px-2 rounded-lg my-1">
                                <span className="font-bold text-slate-800">Total Amount:</span> <strong className="text-emerald-700 text-sm">RM {Number(selectedDetail.total_amount || selectedDetail.amount || 0).toFixed(2)}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Due Date:</span> <strong>{selectedDetail.due_date || '-'}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Payment Date:</span> <strong>{selectedDetail.payment_date || '-'}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Payment Method:</span> <strong>{selectedDetail.payment_method || '-'}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Transaction ID:</span> <strong>{selectedDetail.transaction_id || '-'}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span>Remarks:</span> <strong>{selectedDetail.remarks || '-'}</strong>
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            {selectedDetail.status === 'Paid' && (
                                <a
                                    href={`/admin/fees/receipt/${selectedDetail.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                                >
                                    Download Receipt
                                </a>
                            )}
                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RECORD PAYMENT MODAL */}
            {showRecordModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-base font-bold text-slate-900">Record Manual Payment</h3>
                            <button onClick={() => setShowRecordModal(false)} className="text-slate-400 font-bold">✕</button>
                        </div>

                        <form onSubmit={handleRecordSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                                <select
                                    required
                                    value={recordForm.student_id}
                                    onChange={(e) => setRecordForm({ ...recordForm, student_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="">-- Choose Student --</option>
                                    {(students || []).map((s) => (
                                        <option key={s.id || s.student_id} value={s.id || s.student_id}>
                                            {s.name} {s.class_name ? `(${s.class_name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Fee Type</label>
                                <select
                                    value={recordForm.fee_type}
                                    onChange={(e) => setRecordForm({ ...recordForm, fee_type: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="Monthly Fee">Monthly Tuition Fee</option>
                                    <option value="Registration Fee">Registration Fee</option>
                                    <option value="Activity Fee">Activity Fee</option>
                                    <option value="Late Pickup Fee">Late Pickup Fee</option>
                                    <option value="Other Fee">Other Fee</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Amount (RM)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        value={recordForm.amount}
                                        onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={recordForm.payment_date}
                                        onChange={(e) => setRecordForm({ ...recordForm, payment_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                                <select
                                    value={recordForm.payment_method}
                                    onChange={(e) => setRecordForm({ ...recordForm, payment_method: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Online Payment">Online Payment</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Transaction / Reference Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. REC-12345"
                                    value={recordForm.reference_no}
                                    onChange={(e) => setRecordForm({ ...recordForm, reference_no: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Remarks</label>
                                <input
                                    type="text"
                                    placeholder="Optional notes"
                                    value={recordForm.remarks}
                                    onChange={(e) => setRecordForm({ ...recordForm, remarks: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRecordModal(false)}
                                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                                >
                                    Save Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
