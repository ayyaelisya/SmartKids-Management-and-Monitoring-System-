import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import QRCode from 'react-qr-code';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';

function ChildPhoto({ child }) {
    const [failed, setFailed] = useState(false);
    const photo = child.profile_photo_url || child.avatar || null;

    if (!photo || failed) {
        return (
            <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FFF9E9] text-xl font-bold text-[#705800]"
                aria-label={`No profile photo for ${child.name}`}
            >
                {(child.name || 'C').trim().charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        <img
            src={photo}
            alt={child.name}
            onError={() => setFailed(true)}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
        />
    );
}

export default function ParentDashboard({
    childrenList = [],
    announcements = [],
}) {
    const [selectedChildIndex, setSelectedChildIndex] = useState(0);
    const [showQr, setShowQr] = useState(false);

    const child = childrenList[selectedChildIndex] ?? null;
    const attendance = child?.attendance ?? {};
    const fee = child?.fee ?? {};
    const latestLog = child?.latest_log ?? null;
    const isAbsent = attendance.status?.toLowerCase() === 'absent';

    const today = new Intl.DateTimeFormat('en-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    }).format(new Date());

    useEffect(() => {
        if (!showQr) return;

        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setShowQr(false);
        };

        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [showQr]);

    return (
        <AuthenticatedLayoutParent
            activeNavId="dashboard"
            pageTitle="Child Dashboard"
            pageSubtitle="Parent Overview"
        >
            <Head title="Parent Dashboard - Smart Kids" />

            {!child ? (
                <section className="rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] p-5">
                    <h2 className="text-base font-bold">
                        No child linked to your account
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#756D5D]">
                        Your child’s information will appear here once the
                        centre links your account.
                    </p>
                </section>
            ) : (
                <div className="mx-auto max-w-3xl space-y-4">
                    {/* 1. Child profile */}
                    {childrenList.length > 1 && (
                        <div>
                            <p className="mb-2 text-xs font-semibold text-[#756D5D]">
                                Select child
                            </p>
                            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                                {childrenList.map((item, index) => (
                                    <button
                                        key={item.id ?? index}
                                        type="button"
                                        aria-pressed={index === selectedChildIndex}
                                        onClick={() => {
                                            setSelectedChildIndex(index);
                                            setShowQr(false);
                                        }}
                                        className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#806300] ${
                                            index === selectedChildIndex
                                                ? 'bg-[#FFD444] text-[#302C22]'
                                                : 'border border-[#E9DEC3] bg-[#FFFEFA] text-[#514A3F]'
                                        }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <section className="rounded-2xl bg-[#FFD444] p-5 text-[#302C22]">
                        <p className="mb-4 text-xs font-bold uppercase tracking-wide text-[#655000]">
                            Your child
                        </p>

                        <div className="flex items-center gap-4">
                            <ChildPhoto
                                key={child.id ?? selectedChildIndex}
                                child={child}
                            />
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold leading-snug">
                                    {child.name}
                                </h2>
                                <p className="mt-1 text-sm text-[#655000]">
                                    {child.class || 'Class not assigned'}
                                </p>
                            </div>
                        </div>

                        {child.qr_code_token && (
                            <button
                                type="button"
                                onClick={() => setShowQr(true)}
                                className="mt-5 min-h-11 rounded-xl bg-[#302C22] px-4 py-2 text-sm font-semibold text-[#FFFEFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#302C22]"
                            >
                                View attendance QR
                            </button>
                        )}
                    </section>

                    {/* 2. Attendance */}
                    <section className="rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-base font-bold">
                                    Attendance today
                                </h2>
                                <p className="mt-1 text-xs text-[#756D5D]">
                                    {today}
                                </p>
                            </div>
                            <Link
                                href="/parent/attendance"
                                className="shrink-0 text-xs font-bold text-[#806300] underline underline-offset-4"
                            >
                                History
                            </Link>
                        </div>

                        <p className="mt-5 text-xl font-bold">
                            {attendance.status || 'Not Checked In'}
                        </p>

                        {(attendance.time || attendance.check_out_time) && (
                            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#EFE5CD] pt-4">
                                <div>
                                    <p className="text-xs text-[#756D5D]">
                                        Check-in
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {attendance.time || 'Not recorded'}
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
                        )}

                        {isAbsent && (
                            <Link
                                href="/parent/attendance"
                                className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#FFD444] px-4 text-sm font-bold text-[#302C22]"
                            >
                                Provide absence reason
                            </Link>
                        )}
                    </section>

                    {/* 3. Latest activity */}
                    <section className="rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-base font-bold">
                                Latest activity
                            </h2>
                            <Link
                                href="/parent/learning-log"
                                className="shrink-0 text-xs font-bold text-[#806300] underline underline-offset-4"
                            >
                                All logs
                            </Link>
                        </div>

                        {latestLog ? (
                            <article className="mt-4 border-t border-[#EFE5CD] pt-4">
                                <p className="text-xs font-semibold text-[#806300]">
                                    {[latestLog.category, latestLog.time]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-[#514A3F]">
                                    {latestLog.text ||
                                        'No description provided.'}
                                </p>
                                {latestLog.teacher_name && (
                                    <p className="mt-2 text-xs text-[#756D5D]">
                                        Shared by {latestLog.teacher_name}
                                    </p>
                                )}
                            </article>
                        ) : (
                            <p className="mt-4 border-t border-[#EFE5CD] pt-4 text-sm text-[#756D5D]">
                                No recent activity update.
                            </p>
                        )}
                    </section>

                    {/* 4. Fees */}
                    <section className="rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-base font-bold">
                                Fees
                            </h2>
                            <Link
                                href="/parent/fees"
                                className="shrink-0 text-xs font-bold text-[#806300] underline underline-offset-4"
                            >
                                View details
                            </Link>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EFE5CD] pt-4">
                            <div>
                                <p className="text-xs text-[#756D5D]">
                                    Outstanding balance
                                </p>
                                <p className="mt-1 text-xl font-bold">
                                    RM {fee.unpaid_amount ?? '0.00'}
                                </p>
                                {fee.next_due_date && (
                                    <p className="mt-1 text-xs text-[#756D5D]">
                                        Next due: {fee.next_due_date}
                                    </p>
                                )}
                            </div>
                            <span
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                                    fee.is_unpaid
                                        ? 'bg-[#F6DCCB] text-[#854327]'
                                        : 'bg-[#FFF0AD] text-[#655000]'
                                }`}
                            >
                                {fee.is_unpaid ? 'Payment due' : 'Paid'}
                            </span>
                        </div>
                    </section>

                    {/* 5. Announcements */}
                    <section className="rounded-2xl border border-[#E9DEC3] bg-[#FFFEFA] p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-base font-bold">
                                Announcements
                            </h2>
                            <Link
                                href="/parent/announcements"
                                className="shrink-0 text-xs font-bold text-[#806300] underline underline-offset-4"
                            >
                                View all
                            </Link>
                        </div>

                        {announcements.length === 0 ? (
                            <p className="mt-4 border-t border-[#EFE5CD] pt-4 text-sm text-[#756D5D]">
                                No announcements available.
                            </p>
                        ) : (
                            <div className="mt-4 divide-y divide-[#EFE5CD] border-t border-[#EFE5CD]">
                                {announcements.slice(0, 2).map((notice, index) => (
                                    <article
                                        key={notice.id ?? index}
                                        className="py-4 last:pb-0"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-sm font-bold">
                                                {notice.title}
                                            </h3>
                                            {notice.priority?.toLowerCase() ===
                                                'urgent' && (
                                                <span className="shrink-0 rounded-md bg-[#F6DCCB] px-2 py-1 text-[10px] font-bold text-[#854327]">
                                                    Urgent
                                                </span>
                                            )}
                                        </div>
                                        {notice.date && (
                                            <p className="mt-1 text-xs text-[#806300]">
                                                {notice.date}
                                            </p>
                                        )}
                                        {notice.content && (
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#756D5D]">
                                                {notice.content}
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {showQr && child?.qr_code_token && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#302C22]/75 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowQr(false);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="attendance-qr-title"
                        className="w-full max-w-sm rounded-2xl bg-[#FFF9E9] p-6 text-center"
                    >
                        <h2
                            id="attendance-qr-title"
                            className="text-lg font-bold"
                        >
                            Attendance QR
                        </h2>
                        <p className="mt-1 text-sm text-[#756D5D]">
                            {child.name}
                        </p>

                        <div className="mx-auto mt-5 flex w-fit items-center justify-center rounded-xl bg-white p-4">
                        <QRCode
                            value={child.qr_code_token}
                            size={220}
                            bgColor="#FFFFFF"
                            fgColor="#302C22"
                            level="M"
                            style={{ width: '100%', height: 'auto', maxWidth: 220 }}
                        />
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowQr(false)}
                            className="mt-5 min-h-11 w-full rounded-xl bg-[#FFD444] px-4 text-sm font-bold"
                        >
                            Close
                        </button>
                    </section>
                </div>
            )}
        </AuthenticatedLayoutParent>
    );
}
