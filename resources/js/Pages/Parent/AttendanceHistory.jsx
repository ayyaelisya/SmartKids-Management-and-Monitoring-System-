import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';

export default function AttendanceHistory({
    childrenList = [],
    selectedStudentId = '',
    selectedMonth = new Date().toISOString().slice(0, 7),
    attendances = [],
    stats = { present: 0, late: 0, absent: 0, attendanceRate: 0 },
}) {
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

    const getAbsenceStatusStyle = (status) => {
    switch (status) {
        case 'Approved':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';

        case 'Rejected':
            return 'bg-rose-100 text-rose-700 border-rose-200';

        case 'Pending':
        default:
            return 'bg-amber-100 text-amber-700 border-amber-200';
    }
};
    return (
        <AuthenticatedLayoutParent activeNavId="attendance" pageTitle="Attendance History" pageSubtitle="Attendance & Absence">
            <Head title="Attendance History - Parent Portal" />

            <main className="w-full">

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
                                                            {att.status === 'Absent' ? (
                                                                <div className="flex flex-col items-end gap-2">
                                                                    {att.absence_reason ? (
                                                                        <>
                                                                            {/* Review status */}
                                                                            <span
                                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[9px] font-extrabold uppercase ${getAbsenceStatusStyle(
                                                                                    att.absence_status ||
                                                                                        'Pending'
                                                                                )}`}
                                                                            >
                                                                                {att.absence_status ||
                                                                                    'Pending'}
                                                                            </span>

                                                                            {/* Parent can update while pending */}
                                                                            {(
                                                                                !att.absence_status ||
                                                                                att.absence_status ===
                                                                                    'Pending'
                                                                            ) && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        openAbsenceModal(
                                                                                            att
                                                                                        )
                                                                                    }
                                                                                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl text-[10px] font-extrabold transition-all shadow-xs"
                                                                                >
                                                                                    Update Reason
                                                                                </button>
                                                                            )}

                                                                            {/* Rejected reason can be corrected */}
                                                                            {att.absence_status ===
                                                                                'Rejected' && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        openAbsenceModal(
                                                                                            att
                                                                                        )
                                                                                    }
                                                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-extrabold transition-all"
                                                                                >
                                                                                    Edit & Resubmit
                                                                                </button>
                                                                            )}

                                                                            {/* Approved reason is locked */}
                                                                            {att.absence_status ===
                                                                                'Approved' && (
                                                                                <span className="text-[9px] font-semibold text-emerald-600">
                                                                                    Reviewed by staff
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openAbsenceModal(att)
                                                                            }
                                                                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl text-[10px] font-extrabold transition-all shadow-xs"
                                                                        >
                                                                            Submit Reason
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-300">
                                                                    -
                                                                </span>
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
        </AuthenticatedLayoutParent>
    );
}
