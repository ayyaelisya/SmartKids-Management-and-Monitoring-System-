import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayoutTeacher from '@/Layouts/AuthenticatedLayoutTeacher';
import { Search, Users, UserCheck, UserX } from 'lucide-react';

export default function MyClasses({ classes = [], today = '' }) {
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');

    const totalStudents = classes.reduce(
        (total, group) => total + group.student_count,
        0
    );

    const filteredClasses = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return classes
            .filter(
                (group) =>
                    selectedClass === 'All' ||
                    group.name === selectedClass
            )
            .map((group) => ({
                ...group,
                students: group.students.filter((student) => {
                    if (!keyword) return true;

                    return (
                        student.name?.toLowerCase().includes(keyword) ||
                        student.guardian_name
                            ?.toLowerCase()
                            .includes(keyword)
                    );
                }),
            }))
            .filter((group) => group.students.length > 0 || !keyword);
    }, [classes, search, selectedClass]);

    const attendanceLabel = (status) => {
        if (status === 'Absent') return 'Absent';
        if (status === 'Checked Out') return 'Checked Out';
        if (
            status === 'Present' ||
            status === 'Late' ||
            status === 'Late Arrival'
        ) {
            return 'Present';
        }

        return 'Not Marked';
    };

    const attendanceColor = (status) => {
        if (status === 'Absent') {
            return 'bg-rose-50 text-rose-700';
        }

        if (!status) {
            return 'bg-amber-50 text-amber-700';
        }

        return 'bg-emerald-50 text-emerald-700';
    };

    return (
        <AuthenticatedLayoutTeacher activeNavId="classes">
            <Head title="My Classes - Teacher Portal" />

            <div className="space-y-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#527A5D]">
                        Teacher Portal
                    </p>
                    <h1 className="mt-1 text-2xl font-black text-[#26332A]">
                        My Classes
                    </h1>
                    <p className="mt-1 text-sm text-[#68736B]">
                        Active students by class · {today}
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-2xl border border-[#E4E6E2] bg-white p-5">
                        <div className="rounded-xl bg-[#527A5D]/10 p-3 text-[#527A5D]">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#68736B]">
                                Total Classes
                            </p>
                            <p className="text-2xl font-black text-[#26332A]">
                                {classes.length}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-[#E4E6E2] bg-white p-5">
                        <div className="rounded-xl bg-[#527A5D]/10 p-3 text-[#527A5D]">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#68736B]">
                                Active Students
                            </p>
                            <p className="text-2xl font-black text-[#26332A]">
                                {totalStudents}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-[#68736B]" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search student or guardian..."
                            className="w-full rounded-xl border border-[#E4E6E2] bg-white py-2.5 pl-10 pr-3 text-sm focus:border-[#527A5D] focus:ring-[#527A5D]"
                        />
                    </div>

                    <select
                        value={selectedClass}
                        onChange={(event) =>
                            setSelectedClass(event.target.value)
                        }
                        className="rounded-xl border border-[#E4E6E2] bg-white px-3 py-2.5 text-sm focus:border-[#527A5D] focus:ring-[#527A5D]"
                    >
                        <option value="All">All Classes</option>
                        {classes.map((group) => (
                            <option key={group.name} value={group.name}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                </div>

                {filteredClasses.length === 0 ? (
                    <div className="rounded-2xl border border-[#E4E6E2] bg-white p-10 text-center text-sm text-[#68736B]">
                        No students found.
                    </div>
                ) : (
                    filteredClasses.map((group) => (
                        <section
                            key={group.name}
                            className="overflow-hidden rounded-2xl border border-[#E4E6E2] bg-white"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E6E2] p-5">
                                <div>
                                    <h2 className="text-lg font-black text-[#26332A]">
                                        {group.name}
                                    </h2>
                                    <p className="text-xs text-[#68736B]">
                                        {group.student_count} active students
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs font-bold">
                                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                                        <UserCheck className="h-3.5 w-3.5" />
                                        {group.present_count} Present
                                    </span>
                                    <span className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">
                                        <UserX className="h-3.5 w-3.5" />
                                        {group.absent_count} Absent
                                    </span>
                                </div>
                            </div>

                            {group.students.length === 0 ? (
                                <p className="p-5 text-sm text-[#68736B]">
                                    No matching students in this class.
                                </p>
                            ) : (
                                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {group.students.map((student) => (
                                        <article
                                            key={student.id}
                                            className="rounded-xl border border-[#E4E6E2] bg-[#F8F7F2] p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                {student.profile_photo_url ? (
                                                    <img
                                                        src={
                                                            student.profile_photo_url
                                                        }
                                                        alt={student.name}
                                                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7FAF8A]/20 font-black text-[#527A5D]">
                                                        {student.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <h3 className="truncate text-sm font-black text-[#26332A]">
                                                        {student.name}
                                                    </h3>
                                                    <p className="text-xs text-[#68736B]">
                                                        {student.gender || '—'}
                                                        {student.date_of_birth
                                                            ? ` · Born ${student.date_of_birth}`
                                                            : ''}
                                                    </p>
                                                    <span
                                                        className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${attendanceColor(
                                                            student.attendance_status
                                                        )}`}
                                                    >
                                                        {attendanceLabel(
                                                            student.attendance_status
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-1 border-t border-[#E4E6E2] pt-3 text-xs text-[#68736B]">
                                                <p>
                                                    <span className="font-bold text-[#26332A]">
                                                        Guardian:
                                                    </span>{' '}
                                                    {student.guardian_name ||
                                                        'Not recorded'}
                                                </p>
                                                <p>
                                                    <span className="font-bold text-[#26332A]">
                                                        Phone:
                                                    </span>{' '}
                                                    {student.guardian_phone ||
                                                        'Not recorded'}
                                                </p>
                                                {student.allergies && (
                                                    <p className="text-rose-700">
                                                        <span className="font-bold">
                                                            Allergies:
                                                        </span>{' '}
                                                        {student.allergies}
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))
                )}

                <Link
                    href="/teacher/attendance"
                    className="inline-flex rounded-xl bg-[#527A5D] px-4 py-2.5 text-xs font-bold text-white"
                >
                    Open Attendance
                </Link>
            </div>
        </AuthenticatedLayoutTeacher>
    );
}
