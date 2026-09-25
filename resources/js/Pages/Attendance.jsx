import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Calendar,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronDown,
    Eye,
    FileText,
    X,
} from 'lucide-react';

export default function AdminAttendance({
    students = [],
    selectedDate = '',
    classes = [],
}) {
    const [date, setDate] = useState(
        selectedDate ||
            new Date().toISOString().split('T')[0]
    );

    const [searchQuery, setSearchQuery] =
        useState('');

    const [selectedClass, setSelectedClass] =
        useState('All');

    const [selectedStatus, setSelectedStatus] =
        useState('All');

    const [
        selectedStudent,
        setSelectedStudent,
    ] = useState(null);

    const handleDateChange = (event) => {
        const newDate = event.target.value;

        setDate(newDate);

        router.get(
            '/attendance',
            {
                date: newDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleAbsenceDecision = (
    student,
    newStatus
) => {
    if (!student.attendance_id) {
        alert(
            'Attendance record was not found.'
        );

        return;
    }

    const confirmationMessage =
        newStatus === 'Approved'
            ? `Approve absence submission for ${student.name}?`
            : `Reject absence submission for ${student.name}?`;

    if (!window.confirm(confirmationMessage)) {
        return;
    }

    router.patch(
        `/attendance/${student.attendance_id}/absence-status`,
        {
            absence_status: newStatus,
        },
        {
            preserveScroll: true,

            onSuccess: () => {
                setSelectedStudent(null);
            },

            onError: (errors) => {
                alert(
                    errors.absence_status ||
                        'Unable to update absence status.'
                );
            },
        }
    );
};
    const filteredStudents = students.filter(
        (student) => {
            const matchesSearch = (
                student.name || ''
            )
                .toLowerCase()
                .includes(
                    searchQuery.toLowerCase()
                );

            const matchesClass =
                selectedClass === 'All' ||
                student.class_name ===
                    selectedClass;

            const matchesStatus =
                selectedStatus === 'All' ||
                student.status ===
                    selectedStatus;

            return (
                matchesSearch &&
                matchesClass &&
                matchesStatus
            );
        }
    );

    const totalPresent = students.filter(
        (student) =>
            student.status === 'Present' ||
            student.status === 'Late' ||
            student.status === 'Checked Out'
    ).length;

    const totalAbsent = students.filter(
        (student) =>
            student.status === 'Absent'
    ).length;

    const totalLatePickups = students.filter(
        (student) =>
            student.is_late_pickup
    ).length;

    const totalLatePickupFee = students.reduce(
        (total, student) =>
            total +
            Number(student.late_fee || 0),
        0
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Present':
                return {
                    badge:
                        'bg-emerald-50 text-emerald-700 border-emerald-200',
                    dot: 'bg-emerald-500',
                };

            case 'Checked Out':
                return {
                    badge:
                        'bg-teal-50 text-teal-700 border-teal-200',
                    dot: 'bg-teal-500',
                };

            case 'Late':
            case 'Late Arrival':
                return {
                    badge:
                        'bg-amber-50 text-amber-700 border-amber-200',
                    dot: 'bg-amber-500',
                };

            case 'Absent':
                return {
                    badge:
                        'bg-rose-50 text-rose-700 border-rose-200',
                    dot: 'bg-rose-500',
                };

            default:
                return {
                    badge:
                        'bg-slate-50 text-slate-600 border-slate-200',
                    dot: 'bg-slate-400',
                };
        }
    };

    const getAbsenceStatusStyle = (
        status
    ) => {
        switch (status) {
            case 'Approved':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';

            case 'Rejected':
                return 'bg-rose-50 text-rose-700 border-rose-200';

            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    return (
        <AuthenticatedLayout activeNavId="attendance">
            <Head title="Smart Kids - Attendance Monitoring" />

            <div className="max-w-7xl mx-auto space-y-6 font-sans text-[#2D3142]">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#2D3142] tracking-tight">
                            Attendance Monitoring
                        </h1>

                        <p className="text-sm font-medium text-[#6B7280] mt-1">
                            Track daily attendance,
                            absence submissions and
                            late pickup charges.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-[#F7F6FC] p-2.5 px-4 rounded-2xl border border-slate-100 self-start md:self-auto">
                        <Calendar className="w-4 h-4 text-[#6C63A8]" />

                        <label className="text-xs font-bold text-[#6B7280]">
                            Select Date:
                        </label>

                        <input
                            type="date"
                            value={date}
                            onChange={
                                handleDateChange
                            }
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs font-bold text-[#2D3142] focus:outline-none focus:ring-2 focus:ring-[#6C63A8]"
                        />
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                                Total Present
                            </p>

                            <h3 className="text-3xl font-extrabold text-[#2D3142] mt-1">
                                {totalPresent}
                            </h3>

                            <p className="text-xs font-semibold text-emerald-600 mt-1">
                                Present, late or
                                checked out
                            </p>
                        </div>

                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                                Absent
                            </p>

                            <h3 className="text-3xl font-extrabold text-[#2D3142] mt-1">
                                {totalAbsent}
                            </h3>

                            <p className="text-xs font-semibold text-rose-500 mt-1">
                                Not in nursery
                            </p>
                        </div>

                        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                                Late Pickups
                            </p>

                            <h3 className="text-3xl font-extrabold text-[#2D3142] mt-1">
                                {totalLatePickups}
                            </h3>

                            <p className="text-xs font-semibold text-amber-600 mt-1">
                                Total penalty: RM
                                {totalLatePickupFee.toFixed(
                                    2
                                )}
                            </p>
                        </div>

                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Search and filters */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                        <input
                            type="text"
                            placeholder="Search by student name..."
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(
                                    event.target
                                        .value
                                )
                            }
                            className="w-full pl-10 pr-4 py-2 bg-[#F7F6FC] border-none rounded-2xl text-xs font-medium text-[#2D3142] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63A8]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <select
                                value={
                                    selectedClass
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedClass(
                                        event.target
                                            .value
                                    )
                                }
                                className="w-full appearance-none bg-[#F7F6FC] border-none rounded-2xl pl-4 pr-10 py-2 text-xs font-semibold text-[#2D3142] focus:outline-none focus:ring-2 focus:ring-[#6C63A8]"
                            >
                                <option value="All">
                                    All Classes
                                </option>

                                {classes.map(
                                    (
                                        className,
                                        index
                                    ) => (
                                        <option
                                            key={
                                                index
                                            }
                                            value={
                                                className
                                            }
                                        >
                                            {
                                                className
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <div className="relative flex-1 sm:flex-none">
                            <select
                                value={
                                    selectedStatus
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedStatus(
                                        event.target
                                            .value
                                    )
                                }
                                className="w-full appearance-none bg-[#F7F6FC] border-none rounded-2xl pl-4 pr-10 py-2 text-xs font-semibold text-[#2D3142] focus:outline-none focus:ring-2 focus:ring-[#6C63A8]"
                            >
                                <option value="All">
                                    All Statuses
                                </option>

                                <option value="Present">
                                    Present
                                </option>

                                <option value="Absent">
                                    Absent
                                </option>

                                <option value="Checked Out">
                                    Checked Out
                                </option>
                            </select>

                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Attendance table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-[#6B7280] tracking-wider">
                                    <th className="p-4 px-6">
                                        Student
                                    </th>

                                    <th className="p-4 px-6">
                                        Class
                                    </th>

                                    <th className="p-4 px-6">
                                        Check-In
                                    </th>

                                    <th className="p-4 px-6">
                                        Check-Out
                                    </th>

                                    <th className="p-4 px-6">
                                        Late Pickup
                                    </th>

                                    <th className="p-4 px-6">
                                        Status
                                    </th>

                                    <th className="p-4 px-6 min-w-[220px]">
                                        Reason / MC
                                    </th>

                                    <th className="p-4 px-6 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-[#2D3142]">
                                {filteredStudents.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="p-8 text-center text-slate-400"
                                        >
                                            No attendance
                                            records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map(
                                        (
                                            student,
                                            index
                                        ) => {
                                            const statusStyle =
                                                getStatusStyle(
                                                    student.status
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        student.id ||
                                                        index
                                                    }
                                                    className="hover:bg-[#F7F6FC]/50 transition-colors"
                                                >
                                                    <td className="p-4 px-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-[#EAE8F6] text-[#6C63A8] font-bold flex items-center justify-center text-xs">
                                                                {student.name
                                                                    ? student.name
                                                                          .charAt(
                                                                              0
                                                                          )
                                                                          .toUpperCase()
                                                                    : 'S'}
                                                            </div>

                                                            <span className="font-bold text-[#2D3142]">
                                                                {
                                                                    student.name
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="p-4 px-6 text-[#6B7280]">
                                                        {student.class_name ||
                                                            'Unassigned'}
                                                    </td>

                                                    <td className="p-4 px-6 text-[#6B7280]">
                                                        {student.check_in_time ||
                                                            '-'}
                                                    </td>

                                                    <td className="p-4 px-6 text-[#6B7280]">
                                                        {student.check_out_time ||
                                                            '-'}
                                                    </td>

                                                    <td className="p-4 px-6">
                                                        {student.is_late_pickup ? (
                                                            <div className="space-y-1">
                                                                <span className="inline-flex px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold text-[10px]">
                                                                    {
                                                                        student.late_minutes
                                                                    }{' '}
                                                                    minutes
                                                                </span>

                                                                <p className="text-[10px] text-amber-700">
                                                                    RM
                                                                    {Number(
                                                                        student.late_fee ||
                                                                            0
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="p-4 px-6">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${statusStyle.badge}`}
                                                        >
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                                                            />

                                                            {
                                                                student.status
                                                            }
                                                        </span>

                                                        {student.method && (
                                                            <p className="text-[9px] text-slate-400 mt-1">
                                                                {
                                                                    student.method
                                                                }
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="p-4 px-6">
                                                        {student.absence_reason ? (
                                                            <div className="space-y-1.5">
                                                                <p className="text-[11px] text-slate-700 font-medium line-clamp-2">
                                                                    {
                                                                        student.absence_reason
                                                                    }
                                                                </p>

                                                                {student.absence_status && (
                                                                    <span
                                                                        className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${getAbsenceStatusStyle(
                                                                            student.absence_status
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            student.absence_status
                                                                        }
                                                                    </span>
                                                                )}

                                                                {student.absence_attachment && (
                                                                    <a
                                                                        href={
                                                                            student.absence_attachment
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex items-center gap-1 text-[10px] text-[#6C63A8] font-bold hover:underline"
                                                                    >
                                                                        <FileText className="w-3 h-3" />
                                                                        View
                                                                        MC
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400">
                                                                No
                                                                reason
                                                                submitted
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="p-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {/* View details */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedStudent(
                                                                        student
                                                                    )
                                                                }
                                                                className="p-2 rounded-lg bg-[#F7F6FC] text-[#6C63A8] hover:bg-[#6C63A8] hover:text-white transition-colors"
                                                                title="View attendance details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>

                                                            {/* Approval buttons */}
                                                            {student.absence_reason &&
                                                                (
                                                                    !student.absence_status ||
                                                                    student.absence_status ===
                                                                        'Pending'
                                                                ) && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleAbsenceDecision(
                                                                                    student,
                                                                                    'Approved'
                                                                                )
                                                                            }
                                                                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] font-bold transition-colors"
                                                                        >
                                                                            Approve
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleAbsenceDecision(
                                                                                    student,
                                                                                    'Rejected'
                                                                                )
                                                                            }
                                                                            className="px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-bold transition-colors"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Details modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-extrabold text-[#2D3142]">
                                    Attendance Details
                                </h2>

                                <p className="text-xs text-slate-500 mt-1">
                                    {selectedStudent.name}
                                    {' • '}
                                    {date}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedStudent(
                                        null
                                    )
                                }
                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Status
                                    </p>

                                    <p className="text-sm font-bold mt-1">
                                        {
                                            selectedStudent.status
                                        }
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Method
                                    </p>

                                    <p className="text-sm font-bold mt-1">
                                        {selectedStudent.method ||
                                            '-'}
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Check-In
                                    </p>

                                    <p className="text-sm font-bold mt-1">
                                        {selectedStudent.check_in_time ||
                                            '-'}
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Check-Out
                                    </p>

                                    <p className="text-sm font-bold mt-1">
                                        {selectedStudent.check_out_time ||
                                            '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl">
                                <p className="text-[10px] uppercase font-bold text-amber-700">
                                    Parent Absence Reason
                                </p>

                                <p className="text-sm text-slate-700 mt-2">
                                    {selectedStudent.absence_reason ||
                                        'No reason submitted.'}
                                </p>

                                {selectedStudent.absence_status && (
                                    <p className="text-xs font-bold text-amber-700 mt-2">
                                        Status:{' '}
                                        {
                                            selectedStudent.absence_status
                                        }
                                    </p>
                                )}

                                {selectedStudent.absence_attachment && (
                                    <a
                                        href={
                                            selectedStudent.absence_attachment
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 mt-3 px-3 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Open MC / Attachment
                                    </a>
                                )}
                            </div>
                        </div>

<div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div className="flex items-center gap-2">
        {selectedStudent.absence_reason &&
            (
                !selectedStudent.absence_status ||
                selectedStudent.absence_status ===
                    'Pending'
            ) && (
                <>
                    <button
                        type="button"
                        onClick={() =>
                            handleAbsenceDecision(
                                selectedStudent,
                                'Approved'
                            )
                        }
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                        Approve
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleAbsenceDecision(
                                selectedStudent,
                                'Rejected'
                            )
                        }
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                        Reject
                    </button>
                </>
            )}

        {selectedStudent.absence_status ===
            'Approved' && (
            <span className="inline-flex px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                ✓ Absence Approved
            </span>
        )}

        {selectedStudent.absence_status ===
            'Rejected' && (
            <span className="inline-flex px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
                ✕ Absence Rejected
            </span>
        )}
    </div>

    <button
        type="button"
        onClick={() =>
            setSelectedStudent(null)
        }
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
    >
        Close
    </button>
</div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
