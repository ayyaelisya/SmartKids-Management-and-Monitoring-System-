import React, { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';

function StatusBadge({ status }) {
    const normalized = String(status || '').toLowerCase();

    const colors =
        normalized === 'present' || normalized === 'checked out'
            ? 'bg-[#E4EBD9] text-[#355741]'
            : normalized === 'late'
              ? 'bg-[#FFF0AD] text-[#735500]'
              : normalized === 'absent'
                ? 'bg-[#F8DFD8] text-[#8A4736]'
                : 'bg-[#F0EBDD] text-[#655F50]';

    return (
        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${colors}`}>
            {status || 'Unknown'}
        </span>
    );
}

function ReviewBadge({ status }) {
    const normalized = status || 'Pending';

    const colors =
        normalized === 'Approved'
            ? 'bg-[#E4EBD9] text-[#355741]'
            : normalized === 'Rejected'
              ? 'bg-[#F8DFD8] text-[#8A4736]'
              : 'bg-[#FFF0AD] text-[#735500]';

    return (
        <span className={`inline-flex rounded-lg px-2 py-1 text-[11px] font-bold ${colors}`}>
            {normalized}
        </span>
    );
}

function AbsenceAction({ attendance, onOpen }) {
    if (attendance.status !== 'Absent') return null;

    if (!attendance.absence_reason) {
        return (
            <button
                type="button"
                onClick={() => onOpen(attendance)}
                className="min-h-10 rounded-xl bg-[#FFD444] px-3 py-2 text-xs font-bold text-[#302C22]"
            >
                Submit reason
            </button>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ReviewBadge status={attendance.absence_status} />

            {attendance.absence_status !== 'Approved' && (
                <button
                    type="button"
                    onClick={() => onOpen(attendance)}
                    className="min-h-10 rounded-xl border border-[#DCCFAE] bg-[#FFFEFA] px-3 py-2 text-xs font-bold text-[#604B00]"
                >
                    {attendance.absence_status === 'Rejected'
                        ? 'Edit and resubmit'
                        : 'Update reason'}
                </button>
            )}
        </div>
    );
}

function AbsenceDetails({ attendance }) {
    if (!attendance.absence_reason && !attendance.absence_attachment) {
        return null;
    }

    return (
        <div className="space-y-2">
            {attendance.absence_reason && (
                <div>
                    <p className="text-xs text-[#756D5D]">Absence reason</p>
                    <p className="mt-1 break-words text-sm text-[#302C22]">
                        {attendance.absence_reason}
                    </p>
                </div>
            )}

            {attendance.absence_attachment && (
                <a
                    href={attendance.absence_attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs font-bold text-[#806300] underline underline-offset-4"
                >
                    View attachment
                </a>
            )}
        </div>
    );
}

export default function AttendanceHistory({
    childrenList = [],
    selectedStudentId = '',
    selectedMonth = new Date().toISOString().slice(0, 7),
    attendances = [],
    stats = { present: 0, late: 0, absent: 0, attendanceRate: 0 },
}) {
    const [modalData, setModalData] = useState(null);

    const initialIndex = childrenList.findIndex(
        (child) => String(child.id) === String(selectedStudentId)
    );

    const [selectedChildIndex, setSelectedChildIndex] = useState(
        initialIndex >= 0 ? initialIndex : 0
    );

    const currentChild = childrenList[selectedChildIndex] || null;

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        student_id: currentChild?.id || '',
        date: '',
        reason: '',
        attachment: null,
    });

    useEffect(() => {
        const index = childrenList.findIndex(
            (child) => String(child.id) === String(selectedStudentId)
        );

        if (index >= 0) setSelectedChildIndex(index);
    }, [selectedStudentId, childrenList]);

    useEffect(() => {
        if (currentChild) {
            setData('student_id', currentChild.id);
        }
    }, [currentChild?.id]);

    useEffect(() => {
        if (!modalData) return;

        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setModalData(null);
        };

        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [modalData]);

    const handleFilterChange = (childId, month) => {
        router.get(
            '/parent/attendance',
            { student_id: childId, month },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSelectChild = (index) => {
        setSelectedChildIndex(index);

        const selectedChild = childrenList[index];
        if (selectedChild) {
            handleFilterChange(selectedChild.id, selectedMonth);
        }
    };

    const openAbsenceModal = (attendance) => {
        setModalData(attendance);
        setData({
            student_id: currentChild?.id || '',
            date: attendance.date,
            reason: attendance.absence_reason || '',
            attachment: null,
        });
    };

    const handleSubmitAbsence = (event) => {
        event.preventDefault();

        post('/parent/attendance/absence', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setModalData(null);
                reset();
            },
        });
    };

    const summary = [
        {
            label: 'Attendance rate',
            value: `${stats.attendanceRate ?? 0}%`,
        },
        {
            label: 'Days present',
            value: `${stats.present ?? 0}`,
        },
        {
            label: 'Late arrivals',
            value: `${stats.late ?? 0}`,
        },
        {
            label: 'Absent days',
            value: `${stats.absent ?? 0}`,
        },
    ];

    return (
        <AuthenticatedLayoutParent
            activeNavId="attendance"
            pageTitle="Attendance History"
            pageSubtitle="Attendance & Absence"
        >
            <Head title="Attendance History - Parent Portal" />

            {/* The parent layout already adds the page padding. */}
            <div className="mx-auto w-full max-w-6xl space-y-5">
                {childrenList.length === 0 ? (
                    <div className="rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] p-5 text-sm text-[#756D5D]">
                        No child linked to your account.
                    </div>
                ) : (
                    <>
                        <section className="space-y-4">
                            {childrenList.length > 1 && (
                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-[#756D5D]">
                                        Select child
                                    </label>

                                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                                        {childrenList.map((child, index) => (
                                            <button
                                                key={child.id ?? index}
                                                type="button"
                                                aria-pressed={
                                                    selectedChildIndex === index
                                                }
                                                onClick={() =>
                                                    handleSelectChild(index)
                                                }
                                                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                                                    selectedChildIndex === index
                                                        ? 'bg-[#FFD444] text-[#302C22]'
                                                        : 'border border-[#E9DEC3] bg-[#FFFEFA] text-[#514A3F]'
                                                }`}
                                            >
                                                {child.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-xs text-[#756D5D]">
                                        Viewing attendance for
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold leading-snug">
                                        {currentChild?.name}
                                    </h2>
                                </div>

                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold text-[#756D5D]">
                                        Month
                                    </span>
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(event) =>
                                            currentChild &&
                                            handleFilterChange(
                                                currentChild.id,
                                                event.target.value
                                            )
                                        }
                                        className="min-h-11 w-full rounded-xl border border-[#E9DEC3] bg-[#FFFEFA] px-3 text-sm text-[#302C22] focus:border-[#B08300] focus:ring-[#FFD444]"
                                    />
                                </label>
                            </div>
                        </section>

                        <section
                            aria-label="Attendance summary"
                            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                        >
                            {summary.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] p-4"
                                >
                                    <p className="text-xs leading-4 text-[#756D5D]">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-[#302C22]">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </section>

                        <section aria-labelledby="attendance-records-heading">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h2
                                    id="attendance-records-heading"
                                    className="text-base font-bold"
                                >
                                    Monthly attendance
                                </h2>
                                <span className="text-xs text-[#756D5D]">
                                    {attendances.length}{' '}
                                    {attendances.length === 1
                                        ? 'record'
                                        : 'records'}
                                </span>
                            </div>

                            {attendances.length === 0 ? (
                                <div className="rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] p-6 text-center text-sm text-[#756D5D]">
                                    No attendance records found for this month.
                                </div>
                            ) : (
                                <>
                                    {/* Phone: readable record cards */}
                                    <div className="space-y-3 md:hidden">
                                        {attendances.map((attendance) => (
                                            <article
                                                key={
                                                    attendance.id ??
                                                    attendance.date
                                                }
                                                className="rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="min-w-0 text-sm font-bold">
                                                        {attendance.formatted_date ||
                                                            attendance.date}
                                                    </h3>
                                                    <StatusBadge
                                                        status={
                                                            attendance.status
                                                        }
                                                    />
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#EFE5CD] pt-3">
                                                    <div>
                                                        <p className="text-xs text-[#756D5D]">
                                                            Check-in
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold">
                                                            {attendance.check_in_time ||
                                                                'Not recorded'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-[#756D5D]">
                                                            Check-out
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold">
                                                            {attendance.check_out_time ||
                                                                'Not recorded'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {attendance.status ===
                                                    'Absent' && (
                                                    <div className="mt-4 space-y-3 border-t border-[#EFE5CD] pt-3">
                                                        <AbsenceDetails
                                                            attendance={
                                                                attendance
                                                            }
                                                        />
                                                        <AbsenceAction
                                                            attendance={
                                                                attendance
                                                            }
                                                            onOpen={
                                                                openAbsenceModal
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </article>
                                        ))}
                                    </div>

                                    {/* Tablet and desktop: full table */}
                                    <div className="hidden overflow-x-auto rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] md:block">
                                        <table className="w-full min-w-[850px] text-left text-sm">
                                            <thead className="border-b border-[#E9DEC3] bg-[#FFF6DC] text-xs text-[#655F50]">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Check-in
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Check-out
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Reason and attachment
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#EFE5CD]">
                                                {attendances.map(
                                                    (attendance) => (
                                                        <tr
                                                            key={
                                                                attendance.id ??
                                                                attendance.date
                                                            }
                                                        >
                                                            <td className="whitespace-nowrap px-4 py-4 font-semibold">
                                                                {attendance.formatted_date ||
                                                                    attendance.date}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <StatusBadge
                                                                    status={
                                                                        attendance.status
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="whitespace-nowrap px-4 py-4">
                                                                {attendance.check_in_time ||
                                                                    '—'}
                                                            </td>
                                                            <td className="whitespace-nowrap px-4 py-4">
                                                                {attendance.check_out_time ||
                                                                    '—'}
                                                            </td>
                                                            <td className="max-w-[240px] px-4 py-4">
                                                                <AbsenceDetails
                                                                    attendance={
                                                                        attendance
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <AbsenceAction
                                                                    attendance={
                                                                        attendance
                                                                    }
                                                                    onOpen={
                                                                        openAbsenceModal
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                )}
            </div>

            {modalData && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#302C22]/70 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setModalData(null);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="absence-modal-heading"
                        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#FFF9E9] p-5 sm:p-6"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2
                                    id="absence-modal-heading"
                                    className="text-lg font-bold"
                                >
                                    Reason for absence
                                </h2>
                                <p className="mt-1 text-sm text-[#756D5D]">
                                    {modalData.formatted_date ||
                                        modalData.date}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalData(null)}
                                aria-label="Close"
                                className="min-h-10 shrink-0 rounded-lg border border-[#E9DEC3] bg-[#FFFEFA] px-3 text-sm font-bold"
                            >
                                Close
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmitAbsence}
                            className="mt-5 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="absence-reason"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Absence reason
                                </label>
                                <textarea
                                    id="absence-reason"
                                    rows={4}
                                    required
                                    value={data.reason}
                                    onChange={(event) =>
                                        setData(
                                            'reason',
                                            event.target.value
                                        )
                                    }
                                    placeholder="Tell the centre why your child was absent"
                                    className="w-full rounded-xl border border-[#DCCFAE] bg-[#FFFEFA] p-3 text-sm focus:border-[#B08300] focus:ring-[#FFD444]"
                                />
                                {errors.reason && (
                                    <p className="mt-1 text-xs text-[#8A4736]">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="absence-attachment"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Supporting document (optional)
                                </label>
                                <input
                                    id="absence-attachment"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(event) =>
                                        setData(
                                            'attachment',
                                            event.target.files?.[0] || null
                                        )
                                    }
                                    className="block w-full rounded-xl border border-[#DCCFAE] bg-[#FFFEFA] p-3 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#FFD444] file:px-3 file:py-2 file:text-xs file:font-bold"
                                />
                                <p className="mt-1 text-xs text-[#756D5D]">
                                    JPG, PNG or PDF. Maximum 2 MB.
                                </p>
                                {errors.attachment && (
                                    <p className="mt-1 text-xs text-[#8A4736]">
                                        {errors.attachment}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="min-h-11 w-full rounded-xl bg-[#FFD444] px-4 text-sm font-bold text-[#302C22] disabled:opacity-60"
                            >
                                {processing
                                    ? 'Submitting...'
                                    : 'Submit absence reason'}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </AuthenticatedLayoutParent>
    );
}
