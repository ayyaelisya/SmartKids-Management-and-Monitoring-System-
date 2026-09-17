import React, { useState } from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayoutTeacher from '@/Layouts/AuthenticatedLayoutTeacher';

export default function TeacherDashboard({
    assignedClass = { name: 'Butterfly Class', level: '4-5 Years' },
    students = [],
    announcements = [],
    activities = [],
    pendingTasks = [],
    initialLogs = []
}) {
    const { auth } = usePage().props ? { auth: usePage().props.auth } : { auth: {} };
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    const teacherName = auth?.user?.name || 'Teacher Aina';

    // Assigned Class Scope Data
    const sampleStudents = students.length > 0 ? students : [
        { id: 1, name: 'Aisyah Ahmad', class: 'Butterfly Class', status: 'Present', avatar: '👧' },
        { id: 2, name: 'Adam Hakim', class: 'Butterfly Class', status: 'Present', avatar: '👦' },
        { id: 3, name: 'Hana Sofea', class: 'Butterfly Class', status: 'Absent', avatar: '👧' },
        { id: 4, name: 'Danish Amir', class: 'Butterfly Class', status: 'Present', avatar: '👦' },
        { id: 5, name: 'Lucas Tan', class: 'Butterfly Class', status: 'Present', avatar: '👦' },
    ];

    const sampleActivities = activities.length > 0 ? activities : [
        { id: 1, title: 'Arts & Crafts', time: '9:00 AM – 10:00 AM', status: 'Completed' },
        { id: 2, title: 'Storytelling', time: '10:30 AM – 11:00 AM', status: 'In Progress' },
        { id: 3, title: 'Outdoor Play', time: '11:30 AM – 12:00 PM', status: 'Upcoming' },
    ];

    const sampleAnnouncements = announcements.length > 0 ? announcements : [
        { id: 1, title: 'Parent Meeting Reminder', content: 'Parent meeting will be held this Friday.', date: 'Today, 8:00 AM' },
        { id: 2, title: 'Monthly Activity Update', content: 'Please update student activity records before Friday.', date: 'Yesterday' },
    ];

    const samplePendingTasks = pendingTasks.length > 0 ? pendingTasks : [
        { id: 1, title: 'Attendance for Today', status: 'Pending', actionText: 'Complete Now', actionUrl: '/teacher/attendance' },
        { id: 2, title: 'Learning progress not updated', status: 'Pending', actionText: 'Update Now', actionUrl: '/teacher/learning-progress' },
        { id: 3, title: 'Daily activity log submission', status: 'Pending', actionText: 'Submit Now', actionUrl: '/teacher/daily-activities' },
    ];

    const [logsList, setLogsList] = useState(initialLogs.length > 0 ? initialLogs : []);

    const { data, setData, post, processing, reset } = useForm({
        student_id: sampleStudents[0]?.id || '',
        label: '',
        text: '',
        image: null,
    });

    const handleAddLogSubmit = (e) => {
        e.preventDefault();
        const selectedStudent = sampleStudents.find(s => s.id === Number(data.student_id));
        const newEntry = {
            id: Date.now(),
            student_name: selectedStudent ? selectedStudent.name : 'Student',
            label: data.label || 'Daily Activity',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: data.text,
        };

        setLogsList([newEntry, ...logsList]);
        setIsLogModalOpen(false);
        reset('label', 'text', 'image');
    };

    const totalStudents = sampleStudents.length;
    const presentCount = sampleStudents.filter(s => s.status === 'Present').length;
    const absentCount = sampleStudents.filter(s => s.status === 'Absent').length;

    return (
        <AuthenticatedLayoutTeacher
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-[#527A5D] uppercase tracking-wider">Teacher Portal</span>
                        <h1 className="text-xl font-black text-[#26332A]">Teacher Dashboard</h1>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 bg-[#F8F7F2] px-4 py-2 rounded-xl border border-[#E4E6E2]">
                        <div className="w-8 h-8 rounded-lg bg-[#7FAF8A] text-white font-bold flex items-center justify-center text-xs">
                            {teacherName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#26332A]">{teacherName}</p>
                            <p className="text-[10px] text-[#68736B]">{assignedClass.name}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Teacher Dashboard - SKMMS" />

            <div className="py-6 bg-[#F8F7F2] min-h-[calc(100vh-4rem)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Welcome Header */}
                    <div className="bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-[#26332A]">Good Morning, {teacherName}! 👋</h2>
                            <p className="text-sm text-[#68736B] mt-1">Here's what's happening in your classroom today.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-[#F8F7F2] px-4 py-2.5 rounded-xl border border-[#E4E6E2] self-start md:self-auto">
                            <span className="text-lg">🏫</span>
                            <div>
                                <p className="text-xs font-bold text-[#26332A]">{assignedClass.name} · {totalStudents} Students</p>
                                <p className="text-[10px] text-[#68736B]">Monday, 24 August 2026</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#68736B] uppercase">My Students</p>
                                <h3 className="text-2xl font-black text-[#26332A] mt-1">{totalStudents} Students</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[#7FAF8A]/10 text-[#527A5D] flex items-center justify-center text-xl">👶</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#68736B] uppercase">Present Today</p>
                                <h3 className="text-2xl font-black text-[#72A77D] mt-1">{presentCount} Present</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[#72A77D]/10 text-[#72A77D] flex items-center justify-center text-xl">✅</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#68736B] uppercase">Absent Today</p>
                                <h3 className="text-2xl font-black text-[#D97B73] mt-1">{absentCount} Absent</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[#D97B73]/10 text-[#D97B73] flex items-center justify-center text-xl">⚠️</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#68736B] uppercase">Pending Tasks</p>
                                <h3 className="text-2xl font-black text-[#E8B85C] mt-1">{samplePendingTasks.length} Pending</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[#E8B85C]/10 text-[#E8B85C] flex items-center justify-center text-xl">📋</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-3">
                        <h3 className="font-bold text-[#26332A] text-xs uppercase tracking-wider">Quick Actions</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Link href="/teacher/attendance" className="p-3 bg-[#7FAF8A]/15 hover:bg-[#7FAF8A]/25 border border-[#7FAF8A]/30 rounded-xl text-[#527A5D] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all text-center">
                                📋 Mark Attendance
                            </Link>
                            <Link href="/teacher/learning-progress" className="p-3 bg-[#7FAF8A]/15 hover:bg-[#7FAF8A]/25 border border-[#7FAF8A]/30 rounded-xl text-[#527A5D] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all text-center">
                                📈 Update Progress
                            </Link>
                            <button
                                onClick={() => setIsLogModalOpen(true)}
                                className="p-3 bg-[#527A5D] hover:bg-[#668F70] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
                            >
                                ✏️ Add Daily Activity
                            </button>
                            <Link href="/teacher/students" className="p-3 bg-[#F8F7F2] hover:bg-[#E4E6E2] border border-[#E4E6E2] rounded-xl text-[#26332A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all text-center">
                                👥 View Students
                            </Link>
                        </div>
                    </div>

                    {/* Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Today's Attendance Card */}
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-[#26332A] text-base">Today's Attendance</h3>
                                        <p className="text-xs text-[#68736B]">Assigned Students: {assignedClass.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href="/teacher/attendance" className="px-3 py-1.5 bg-[#527A5D] text-white rounded-lg font-bold text-xs hover:bg-[#668F70] transition-all">
                                            Mark Attendance
                                        </Link>
                                        <Link href="/teacher/attendance" className="px-3 py-1.5 bg-[#F8F7F2] text-[#26332A] border border-[#E4E6E2] rounded-lg font-bold text-xs hover:bg-[#E4E6E2] transition-all">
                                            View Attendance
                                        </Link>
                                    </div>
                                </div>

                                <div className="divide-y divide-[#E4E6E2]">
                                    {sampleStudents.map((student) => (
                                        <div key={student.id} className="py-2.5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{student.avatar}</span>
                                                <span className="text-xs font-bold text-[#26332A]">{student.name}</span>
                                            </div>
                                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                                                student.status === 'Present'
                                                    ? 'bg-[#72A77D]/15 text-[#72A77D]'
                                                    : student.status === 'Absent'
                                                    ? 'bg-[#D97B73]/15 text-[#D97B73]'
                                                    : 'bg-[#E8B85C]/15 text-[#E8B85C]'
                                            }`}>
                                                {student.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Learning Progress Card */}
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-[#26332A] text-base">Learning Progress</h3>
                                        <p className="text-xs text-[#68736B]">Developmental domains completion</p>
                                    </div>
                                    <Link href="/teacher/learning-progress" className="text-xs font-bold text-[#527A5D] hover:underline">
                                        Update Progress →
                                    </Link>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold text-[#26332A] mb-1.5">
                                        <span>12 / 15 students updated</span>
                                        <span className="text-[#527A5D]">80%</span>
                                    </div>
                                    <div className="w-full h-3 bg-[#F8F7F2] rounded-full overflow-hidden border border-[#E4E6E2]">
                                        <div className="h-full bg-[#7FAF8A] rounded-full w-[80%]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                                    {['Language', 'Cognitive', 'Physical', 'Social & Emotional', 'Creativity', 'Overall'].map((domain) => (
                                        <div key={domain} className="p-2.5 bg-[#F8F7F2] rounded-xl border border-[#E4E6E2] text-center">
                                            <p className="text-[10px] font-bold text-[#68736B] uppercase">{domain}</p>
                                            <p className="text-xs font-black text-[#26332A] mt-0.5">Updated</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* My Students Overview */}
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-[#26332A] text-base">My Students Overview</h3>
                                    <Link href="/teacher/students" className="text-xs font-bold text-[#527A5D] hover:underline">
                                        View All Students →
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {sampleStudents.slice(0, 4).map((student) => (
                                        <div key={student.id} className="p-3 bg-[#F8F7F2] rounded-xl border border-[#E4E6E2] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-white border border-[#E4E6E2] flex items-center justify-center text-base">
                                                    {student.avatar}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-[#26332A]">{student.name}</h4>
                                                    <p className="text-[10px] text-[#68736B]">{student.class}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold ${student.status === 'Present' ? 'text-[#72A77D]' : 'text-[#D97B73]'}`}>
                                                {student.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">

                            {/* Today's Activities */}
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-[#26332A] text-base">Today's Activities</h3>
                                    <button onClick={() => setIsLogModalOpen(true)} className="text-xs font-bold text-[#527A5D] hover:underline">
                                        + Add Activity
                                    </button>
                                </div>

                                <div className="space-y-2.5">
                                    {sampleActivities.map((act) => (
                                        <div key={act.id} className="p-3 bg-[#F8F7F2] rounded-xl border border-[#E4E6E2]">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-[#26332A]">{act.title}</h4>
                                                <span className="text-[10px] font-bold text-[#68736B]">{act.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Link href="/teacher/daily-activities" className="block text-center w-full py-2 bg-[#F8F7F2] text-[#527A5D] font-bold text-xs rounded-xl border border-[#E4E6E2] hover:bg-[#E4E6E2] transition-all">
                                    View Activities
                                </Link>
                            </div>

                            {/* Admin Announcements */}
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-[#26332A] text-base">Announcements</h3>
                                    <span className="w-2 h-2 rounded-full bg-[#D97B73]" />
                                </div>

                                <div className="space-y-3">
                                    {sampleAnnouncements.map((anc) => (
                                        <div key={anc.id} className="p-3 bg-[#F8F7F2] rounded-xl border border-[#E4E6E2] space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-[#26332A]">{anc.title}</h4>
                                                <span className="text-[9px] font-bold text-[#68736B]">{anc.date}</span>
                                            </div>
                                            <p className="text-xs text-[#68736B] line-clamp-2">{anc.content}</p>
                                        </div>
                                    ))}
                                </div>

                                <Link href="/teacher/announcements" className="block text-xs font-bold text-[#527A5D] hover:underline">
                                    View All Announcements →
                                </Link>
                            </div>

                            {/* Pending Tasks Section */}
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-4">
                                <h3 className="font-black text-[#26332A] text-base">Pending Tasks</h3>
                                <div className="space-y-2.5">
                                    {samplePendingTasks.map((task) => (
                                        <div key={task.id} className="p-3 bg-[#F8F7F2] rounded-xl border border-[#E4E6E2] space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-[#26332A]">{task.title}</span>
                                                <span className="text-[10px] font-extrabold text-[#E8B85C] bg-[#E8B85C]/15 px-2 py-0.5 rounded-full">
                                                    {task.status}
                                                </span>
                                            </div>
                                            <Link href={task.actionUrl} className="block text-center w-full py-1.5 bg-[#527A5D] text-white font-bold text-[11px] rounded-lg hover:bg-[#668F70] transition-all">
                                                {task.actionText}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Add Activity Log */}
            {isLogModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26332A]/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4 border border-[#E4E6E2]">
                        <div className="flex items-center justify-between border-b border-[#E4E6E2] pb-3">
                            <h3 className="text-base font-black text-[#26332A]">✏️ Add Student Activity</h3>
                            <button onClick={() => setIsLogModalOpen(false)} className="text-[#68736B] hover:text-[#26332A] font-bold">✕</button>
                        </div>

                        <form onSubmit={handleAddLogSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] mb-1">Select Student</label>
                                <select
                                    value={data.student_id}
                                    onChange={(e) => setData('student_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#7FAF8A] outline-none"
                                >
                                    {sampleStudents.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] mb-1">Activity Title / Label</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Color Sorting Activity 🎨"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7FAF8A] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] mb-1">Observation Notes</label>
                                <textarea
                                    rows="3"
                                    placeholder="Write details about child progress..."
                                    value={data.text}
                                    onChange={(e) => setData('text', e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7FAF8A] outline-none resize-none"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsLogModalOpen(false)}
                                    className="flex-1 py-2.5 bg-[#F8F7F2] hover:bg-[#E4E6E2] text-[#26332A] font-bold rounded-xl text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-2.5 bg-[#527A5D] hover:bg-[#668F70] text-white font-black rounded-xl text-xs shadow-xs"
                                >
                                    Save Activity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayoutTeacher>
    );
}
