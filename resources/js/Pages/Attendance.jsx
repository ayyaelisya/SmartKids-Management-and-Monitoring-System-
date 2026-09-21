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
    Edit,
    Filter
} from 'lucide-react';

export default function AdminAttendance({ auth, students = [], selectedDate = '', classes = [] }) {
    const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        router.get('/attendance', { date: newDate }, { preserveState: true });
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = selectedClass === 'All' || student.class_name === selectedClass;
        const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;
        return matchesSearch && matchesClass && matchesStatus;
    });

    const totalPresent = students.filter(s => s.status === 'Present' || s.status === 'Checked Out').length;
    const totalAbsent = students.filter(s => s.status === 'Absent').length;
    const totalLatePickups = students.filter(s => s.is_late_pickup).length;

    return (
        <AuthenticatedLayout activeNavId="attendance">
            <Head title="Smart Kids - Attendance Monitoring" />

            <div className="max-w-7xl mx-auto space-y-6 font-sans text-[#2D3142]">

                {/* 1. HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl sm:text-1xl font-extrabold text-[#2D3142] tracking-tight">
                            Attendance Monitoring
                        </h1>
                        <p className="text-sm font-medium text-[#6B7280] mt-1">
                            Track daily attendance records and late pickup charges.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-[#F7F6FC] p-2.5 px-4 rounded-2xl border border-slate-100 self-start md:self-auto">
                        <Calendar className="w-4 h-4 text-[#6C63A8]" />
                        <label className="text-xs font-bold text-[#6B7280]">Select Date:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={handleDateChange}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs font-bold text-[#2D3142] focus:outline-none focus:ring-2 focus:ring-[#6C63A8]"
                        />
                    </div>
                </div>

                {/* 2. STAT CARDS SECTION */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                                TOTAL PRESENT
                            </p>
                            <h3 className="text-3xl font-extrabold text-[#2D3142] mt-1">{totalPresent}</h3>
                            <p className="text-xs font-semibold text-emerald-600 mt-1">Checked in today</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                                ABSENT
                            </p>
                            <h3 className="text-3xl font-extrabold text-[#2D3142] mt-1">{totalAbsent}</h3>
                            <p className="text-xs font-semibold text-rose-500 mt-1">Not in nursery</p>
                        </div>
                        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                                LATE PICKUPS (&gt;5 PM)
                            </p>
                            <h3 className="text-3xl font-extrabold text-[#2D3142] mt-1">
                                {totalLatePickups}
                            </h3>
                            <p className="text-xs font-semibold text-amber-600 mt-1">
                                Total Penalty: RM{totalLatePickups * 10}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* 3. SEARCH & FILTER BAR */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by Student Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[#F7F6FC] border-none rounded-2xl text-xs font-medium text-[#2D3142] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63A8]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full appearance-none bg-[#F7F6FC] border-none rounded-2xl pl-4 pr-10 py-2 text-xs font-semibold text-[#2D3142] focus:outline-none focus:ring-2 focus:ring-[#6C63A8]"
                            >
                                <option value="All">All Classes</option>
                                {classes.map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <div className="relative flex-1 sm:flex-none">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full appearance-none bg-[#F7F6FC] border-none rounded-2xl pl-4 pr-10 py-2 text-xs font-semibold text-[#2D3142] focus:outline-none focus:ring-2 focus:ring-[#6C63A8]"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Checked Out">Checked Out</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* 4. DATA TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-[#6B7280] tracking-wider">
                                    <th className="p-4 px-6">Student</th>
                                    <th className="p-4 px-6">Class</th>
                                    <th className="p-4 px-6">Check-In</th>
                                    <th className="p-4 px-6">Check-Out</th>
                                    <th className="p-4 px-6">Late Pickup</th>
                                    <th className="p-4 px-6">Status</th>
                                    <th className="p-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-[#2D3142]">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-400">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student, index) => (
                                        <tr key={student.id || index} className="hover:bg-[#F7F6FC]/50 transition-colors">
                                            <td className="p-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#EAE8F6] text-[#6C63A8] font-bold flex items-center justify-center text-xs">
                                                        {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                                                    </div>
                                                    <span className="font-bold text-[#2D3142]">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6 text-[#6B7280]">
                                                {student.class_name || 'Unassigned'}
                                            </td>
                                            <td className="p-4 px-6 text-[#6B7280]">{student.check_in_time || '-'}</td>
                                            <td className="p-4 px-6 text-[#6B7280]">{student.check_out_time || '-'}</td>
                                            <td className="p-4 px-6">
                                                {student.is_late_pickup ? (
                                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold text-[10px]">
                                                        Late (&gt;5 PM)
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                                                    student.status === 'Present' || student.status === 'Checked Out'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        student.status === 'Present' || student.status === 'Checked Out' ? 'bg-emerald-500' : 'bg-rose-500'
                                                    }`} />
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="p-4 px-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button className="p-1.5 rounded-lg bg-[#F7F6FC] text-[#6C63A8] hover:bg-[#6C63A8] hover:text-white transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 rounded-lg bg-[#F7F6FC] text-slate-600 hover:bg-slate-200 transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
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
        </AuthenticatedLayout>
    );
}
