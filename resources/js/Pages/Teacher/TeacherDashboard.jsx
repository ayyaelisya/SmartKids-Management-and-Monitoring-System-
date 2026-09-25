import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayoutTeacher from '@/Layouts/AuthenticatedLayoutTeacher';

export default function TeacherDashboard({
    today = '',
    students = [],
    updatedStudentCount = 0,
    activities = [],
    announcements = [],
}) {
    const { auth } = usePage().props;
    const teacherName = auth?.user?.full_name || 'Teacher';

    const presentCount = students.filter(
        (student) =>
            student.status === 'Present' ||
            student.status === 'Checked Out' ||
            student.status === 'Late' ||
            student.status === 'Late Arrival'
    ).length;

    const absentCount = students.filter(
        (student) => student.status === 'Absent'
    ).length;

    const notMarkedCount = students.filter(
        (student) => !student.status
    ).length;

    const progressPercent = students.length
        ? Math.round((updatedStudentCount / students.length) * 100)
        : 0;

    const pendingTasks = [];

    if (notMarkedCount > 0) {
        pendingTasks.push({
            title: `${notMarkedCount} attendance record(s) not marked`,
            url: '/teacher/attendance',
            action: 'Open Attendance',
        });
    }

    if (students.length > updatedStudentCount) {
        pendingTasks.push({
            title: `${students.length - updatedStudentCount} student(s) without today's learning log`,
            url: '/teacher/learning-log',
            action: 'Update Learning Log',
        });
    }

    const displayStatus = (status) => {
        if (status === 'Checked Out') return 'Checked Out';
        if (['Present', 'Late', 'Late Arrival'].includes(status)) return 'Present';
        if (status === 'Absent') return 'Absent';
        return 'Not Marked';
    };

    const statusClass = (status) => {
        if (status === 'Absent') {
            return 'bg-rose-50 text-rose-700';
        }

        if (!status) {
            return 'bg-amber-50 text-amber-700';
        }

        return 'bg-emerald-50 text-emerald-700';
    };

    return (
        <AuthenticatedLayoutTeacher activeNavId="dashboard">
            <Head title="Teacher Dashboard - SKMMS" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-[#E4E6E2] bg-white p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#527A5D]">
                        Teacher Portal
                    </p>
                    <h1 className="mt-1 text-2xl font-black text-[#26332A]">
                        Welcome, {teacherName}!
                    </h1>
                    <p className="mt-1 text-sm text-[#68736B]">{today}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['Active Students', students.length, '👶'],
                        ['Present Today', presentCount, '✅'],
                        ['Absent Today', absentCount, '⚠️'],
                        ['Pending Tasks', pendingTasks.length, '📋'],
                    ].map(([label, value, icon]) => (
                        <div
                            key={label}
                            className="flex items-center justify-between rounded-2xl border border-[#E4E6E2] bg-white p-5"
                        >
                            <div>
                                <p className="text-xs font-bold uppercase text-[#68736B]">
                                    {label}
                                </p>
                                <p className="mt-1 text-2xl font-black text-[#26332A]">
                                    {value}
                                </p>
                            </div>
                            <span className="text-2xl">{icon}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 rounded-2xl border border-[#E4E6E2] bg-white p-5">
                    <Link
                        href="/teacher/attendance"
                        className="rounded-xl bg-[#527A5D] px-4 py-2.5 text-xs font-bold text-white"
                    >
                        Open Attendance
                    </Link>
                    <Link
                        href="/teacher/learning-log"
                        className="rounded-xl bg-[#527A5D] px-4 py-2.5 text-xs font-bold text-white"
                    >
                        Add Learning Log
                    </Link>
                    <Link
                        href="/teacher/announcements"
                        className="rounded-xl border border-[#E4E6E2] px-4 py-2.5 text-xs font-bold text-[#26332A]"
                    >
                        View Announcements
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-[#E4E6E2] bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-black text-[#26332A]">
                                Today's Attendance
                            </h2>
                            <Link
                                href="/teacher/attendance"
                                className="text-xs font-bold text-[#527A5D]"
                            >
                                View All →
                            </Link>
                        </div>

                        {students.length === 0 ? (
                            <p className="text-sm text-[#68736B]">
                                No active students found.
                            </p>
                        ) : (
                            <div className="max-h-80 divide-y divide-[#E4E6E2] overflow-y-auto">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between gap-3 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-[#26332A]">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-[#68736B]">
                                                {student.class_name || 'No class'}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(student.status)}`}>
                                            {displayStatus(student.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-[#E4E6E2] bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-black text-[#26332A]">
                                Today's Learning Logs
                            </h2>
                            <Link
                                href="/teacher/learning-log"
                                className="text-xs font-bold text-[#527A5D]"
                            >
                                Add Log →
                            </Link>
                        </div>

                        <p className="mb-2 text-xs text-[#68736B]">
                            {updatedStudentCount} of {students.length} students updated
                        </p>
                        <div className="mb-5 h-3 overflow-hidden rounded-full bg-[#F8F7F2]">
                            <div
                                className="h-full bg-[#7FAF8A]"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        {activities.length === 0 ? (
                            <p className="text-sm text-[#68736B]">
                                No learning logs recorded today.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="rounded-xl bg-[#F8F7F2] p-3"
                                    >
                                        <p className="text-sm font-bold text-[#26332A]">
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-[#68736B]">
                                            {activity.student_name}
                                            {activity.time ? ` · ${activity.time}` : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-[#E4E6E2] bg-white p-5">
                        <h2 className="mb-4 font-black text-[#26332A]">
                            Announcements
                        </h2>
                        {announcements.length === 0 ? (
                            <p className="text-sm text-[#68736B]">
                                No published announcements.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {announcements.map((announcement) => (
                                    <div
                                        key={announcement.id}
                                        className="rounded-xl bg-[#F8F7F2] p-3"
                                    >
                                        <p className="text-sm font-bold text-[#26332A]">
                                            {announcement.title}
                                        </p>
                                        <p className="mt-1 text-xs text-[#68736B]">
                                            {announcement.content}
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#68736B]">
                                            {announcement.date}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-[#E4E6E2] bg-white p-5">
                        <h2 className="mb-4 font-black text-[#26332A]">
                            Pending Tasks
                        </h2>
                        {pendingTasks.length === 0 ? (
                            <p className="text-sm text-[#68736B]">
                                No pending tasks for today.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {pendingTasks.map((task) => (
                                    <div
                                        key={task.url}
                                        className="rounded-xl bg-[#F8F7F2] p-3"
                                    >
                                        <p className="text-sm font-bold text-[#26332A]">
                                            {task.title}
                                        </p>
                                        <Link
                                            href={task.url}
                                            className="mt-2 inline-block text-xs font-bold text-[#527A5D]"
                                        >
                                            {task.action} →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayoutTeacher>
    );
}
