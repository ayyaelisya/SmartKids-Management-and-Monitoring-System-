import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';

export default function AttendanceHistory({
    childrenList = [],
    selectedStudentId = '',
    selectedMonth = new Date().toISOString().slice(0, 7),
    attendances = [],
    stats = { present: 0, late: 0, absent: 0, attendanceRate: 0 },
}) {
    const { auth } = usePage().props ? { auth: usePage().props.auth } : { auth: {} };
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    // Cari indeks pelajar semasa berdasarkan selectedStudentId dari Backend
    const initialIndex = childrenList.findIndex(
        (c) => String(c.id) === String(selectedStudentId)
    );
    const [selectedChildIndex, setSelectedChildIndex] = useState(
        initialIndex >= 0 ? initialIndex : 0
    );

    // Kemaskini indeks jika props childrenList atau selectedStudentId berubah
    useEffect(() => {
        const idx = childrenList.findIndex(
            (c) => String(c.id) === String(selectedStudentId)
        );
        if (idx >= 0) {
            setSelectedChildIndex(idx);
        }
    }, [selectedStudentId, childrenList]);

    const currentChild = childrenList[selectedChildIndex] || null;

    const navItems = [
        { name: 'Home', icon: '🏠', href: '/parent/dashboard', active: false },
        { name: 'My Children', icon: '👶', href: '/parent/children', active: false },
        { name: 'Learning Logs', icon: '📖', href: '/parent/learning-log', active: false },
        { name: 'Attendance History', icon: '📅', href: '/parent/attendance', active: true },
        { name: 'Invoices & Fees', icon: '💳', href: '/parent/fees', active: false },
        { name: 'Announcements', icon: '📢', href: '/parent/announcements', active: false },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: currentChild ? currentChild.id : '',
        date: '',
        reason: '',
        attachment: null,
    });

    // Kemaskini student_id dalam form setiap kali currentChild berubah
    useEffect(() => {
        if (currentChild) {
            setData('student_id', currentChild.id);
        }
    }, [currentChild]);

    // Menukar Anak / Bulan
    const handleFilterChange = (childId, month) => {
        router.get(
            '/parent/attendance',
            { student_id: childId, month: month },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSelectChild = (idx) => {
        setSelectedChildIndex(idx);
        const child = childrenList[idx];
        if (child) {
            handleFilterChange(child.id, selectedMonth);
        }
    };

    const openAbsenceModal = (attendance) => {
        setModalData(attendance);
        setData({
            student_id: currentChild ? currentChild.id : '',
            date: attendance.date,
            reason: attendance.absence_reason || '',
            attachment: null,
        });
    };

    const handleSubmitAbsence = (e) => {
        e.preventDefault();
        post('/parent/attendance/absence', {
            forceFormData: true, // Diperlukan untuk penghantaran muat naik fail
            preserveScroll: true,
            onSuccess: () => {
                setModalData(null);
                reset();
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans relative">
            <Head title="Attendance History - Parent Portal" />

            {/* Mobile Navigation Header */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <img
                        src="/images/logo.jpg"
                        alt="Logo"
                        className="w-9 h-9 rounded-xl object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <div>
                        <h2 className="text-sm font-black text-slate-900 leading-none">Parent Portal</h2>
                        <span className="text-[10px] text-amber-600 font-bold uppercase">Smart Kids</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
                >
                    <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 p-5 flex flex-col justify-between transition-transform duration-300 transform md:relative md:translate-x-0 md:w-80 shrink-0 shadow-lg md:shadow-none ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    <div className="hidden md:flex bg-slate-100/80 border border-slate-200 rounded-2xl p-4 mb-6 items-center gap-3">
                        <img
                            src="/images/logo.jpg"
                            alt="Logo"
                            className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <div className="min-w-0">
                            <h2 className="text-base font-black text-slate-900 leading-tight">Smart Kids</h2>
                            <p className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase mt-0.5">
                                Parent Portal
                            </p>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                                    item.active
                                        ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20'
                                        : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100/80'
                                }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="pt-6 border-t border-slate-200 mt-6">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold text-sm text-rose-600 hover:bg-rose-50 transition-all text-left"
                    >
                        <span>🚪</span> <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 z-30 md:hidden"
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <header className="hidden md:flex h-20 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                            Attendance & Absence
                        </span>
                        <h1 className="text-lg font-black text-slate-900">Attendance History</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
                        <div className="w-8 h-8 rounded-lg bg-emerald-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
                            {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <p className="text-xs font-bold text-slate-800">{auth?.user?.name || 'Parent Account'}</p>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    {/* Child Selector Tabs & Month Filter */}
                    {childrenList.length === 0 ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-800">
                            No registered child found under your account.
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
                                {childrenList.map((child, idx) => (
                                    <button
                                        key={child.id || idx}
                                        onClick={() => handleSelectChild(idx)}
                                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                                            selectedChildIndex === idx
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>👶</span> {child.name} ({child.class})
                                    </button>
                                ))}
                            </div>

                            {/* Month Selector */}
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="text-xs font-bold text-slate-500">Month:</span>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        currentChild && handleFilterChange(currentChild.id, e.target.value)
                                    }
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-amber-400"
                                />
                            </div>
                        </div>
                    )}

                    {currentChild && (
                        <>
                            {/* Attendance Stats Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Attendance Rate</p>
                                    <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                                        {stats.attendanceRate}%
                                    </h3>
                                </div>
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Days Present</p>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                                        {stats.present} Days
                                    </h3>
                                </div>
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Late Arrival</p>
                                    <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                                        {stats.late} Days
                                    </h3>
                                </div>
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Absent</p>
                                    <h3 className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
                                        {stats.absent} Days
                                    </h3>
                                </div>
                            </div>

                            {/* Attendance History Table */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-black text-slate-800 text-sm sm:text-base">
                                        Monthly Attendance Logs
                                    </h3>
                                    <span className="text-xs font-bold text-slate-400">
                                        {attendances.length} Records
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4">Check-In</th>
                                                <th className="py-3 px-4">Check-Out</th>
                                                <th className="py-3 px-4">Reason / MC Attachment</th>
                                                <th className="py-3 px-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {attendances.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="py-8 text-center text-slate-400 font-bold">
                                                        No attendance records found for this month.
                                                    </td>
                                                </tr>
                                            ) : (
                                                attendances.map((att) => (
                                                    <tr
                                                        key={att.id || att.date}
                                                        className="hover:bg-slate-50/80 transition-all"
                                                    >
                                                        <td className="py-3.5 px-4 font-bold text-slate-800">
                                                            {att.formatted_date}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span
                                                                className={`px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase ${
                                                                    att.status === 'Present' || att.status === 'Checked Out'
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : att.status === 'Late'
                                                                        ? 'bg-amber-100 text-amber-800'
                                                                        : 'bg-rose-100 text-rose-800'
                                                                }`}
                                                            >
                                                                {att.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-slate-700">
                                                            {att.check_in_time}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-slate-700">
                                                            {att.check_out_time}
                                                        </td>
                                                        <td className="py-3.5 px-4 max-w-xs">
                                                            {att.absence_reason ? (
                                                                <div className="space-y-1">
                                                                    <p className="text-[11px] text-slate-700 font-medium truncate">
                                                                        {att.absence_reason}
                                                                    </p>
                                                                    {att.absence_attachment && (
                                                                        <a
                                                                            href={att.absence_attachment}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold hover:underline"
                                                                        >
                                                                            📎 View Attachment
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-300 text-[11px] italic">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            {att.status === 'Absent' && (
                                                                <button
                                                                    onClick={() => openAbsenceModal(att)}
                                                                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl text-[10px] font-extrabold transition-all shadow-xs"
                                                                >
                                                                    {att.absence_reason ? 'Update Reason' : 'Submit Reason'}
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
                        </>
                    )}
                </div>
            </main>

            {/* Modal Upload & Reason */}
            {modalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-800">
                                Reason for Absence ({modalData.formatted_date})
                            </h3>
                            <button
                                onClick={() => setModalData(null)}
                                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitAbsence} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Absence Reason <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    required
                                    placeholder="e.g. Medical Sick Leave, Family Emergency, Appointment..."
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                ></textarea>
                                {errors.reason && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.reason}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Upload MC / Document (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setData('attachment', e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Supported format: JPG, PNG, PDF (Max: 2MB)
                                </span>
                                {errors.attachment && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.attachment}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalData(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-400 text-amber-950 font-bold text-xs rounded-xl hover:bg-amber-500 transition-all"
                                >
                                    {processing ? 'Submitting...' : 'Submit Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
