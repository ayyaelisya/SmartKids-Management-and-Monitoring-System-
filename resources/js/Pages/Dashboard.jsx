import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Users, UserCheck, Wallet, Clock, AlertTriangle,
    Bell, CheckCircle, XCircle, ChevronRight, UserPlus,
    Megaphone, FileText, ArrowUpRight, ShieldAlert, Award
} from 'lucide-react';

export default function Dashboard(props) {
    const {
        auth = {},
        stats = {},
        attendanceDetails = {},
        latePickupAlerts = [],
        feeOverview = {},
        feeMonthlyData = [], // Data kutipan bulanan dari backend
        childProgressData = {}, // Data perkembangan anak dari backend
        pendingRegistrations = [], // Senarai pendaftaran ibu bapa
        recentActivities = [],
        todayAlerts = []
    } = props;

    // State untuk Modal Approve & Link
    const [selectedParent, setSelectedParent] = useState(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedChildId, setSelectedChildId] = useState('');

    const handleOpenApproveModal = (parent) => {
        setSelectedParent(parent);
        setIsApproveModalOpen(true);
    };

    const handleApproveAndLink = (e) => {
        e.preventDefault();
        if (!selectedParent || !selectedChildId) return;

        router.post(`/admin/parent-registrations/${selectedParent.id}/approve`, {
            child_id: selectedChildId
        }, {
            onSuccess: () => setIsApproveModalOpen(false)
        });
    };

    const handleReject = (id) => {
        if (confirm('Adakah anda pasti untuk menolak pendaftaran ini?')) {
            router.post(`/admin/parent-registrations/${id}/reject`);
        }
    };

    // 1. DATA CARTA KEHADIRAN (Donut Chart Calculation)
    const presentCount = attendanceDetails?.present ?? 0;
    const absentCount = attendanceDetails?.absent ?? 0;
    const lateCount = attendanceDetails?.late ?? 0;
    const notCheckedInCount = attendanceDetails?.notCheckedIn ?? 0;
    const totalStudentsAttendance = presentCount + absentCount + lateCount + notCheckedInCount || stats?.totalStudents || 1;

    // Percentages for Donut SVG
    const pPresent = (presentCount / totalStudentsAttendance) * 100;
    const pAbsent = (absentCount / totalStudentsAttendance) * 100;
    const pLate = (lateCount / totalStudentsAttendance) * 100;
    const pNotChecked = (notCheckedInCount / totalStudentsAttendance) * 100;

    // 2. DATA CARTA KUTIPAN YURAN BULANAN (Fallback data jika tiada dari backend)
    const monthlyFees = feeMonthlyData.length > 0 ? feeMonthlyData : [
        { month: 'Jan', collected: feeOverview?.paid ? Number(feeOverview.paid) * 0.8 : 4200 },
        { month: 'Feb', collected: feeOverview?.paid ? Number(feeOverview.paid) * 0.9 : 4800 },
        { month: 'Mar', collected: feeOverview?.paid ? Number(feeOverview.paid) * 0.85 : 4500 },
        { month: 'Apr', collected: feeOverview?.paid ? Number(feeOverview.paid) * 0.95 : 5100 },
        { month: 'May', collected: feeOverview?.paid ? Number(feeOverview.paid) * 0.9 : 4900 },
        { month: 'Jun', collected: feeOverview?.paid ? Number(feeOverview.paid) : 5300 },
    ];

    const maxFeeValue = Math.max(...monthlyFees.map(m => m.collected), 6000);

    // 3. DATA PERKEMBANGAN KANAK-KANAK
    const progressCategories = childProgressData.categories || [
        { name: 'Cognitive', count: childProgressData?.cognitive ?? 42, color: 'bg-[#6C63A8]' },
        { name: 'Language', count: childProgressData?.language ?? 38, color: 'bg-[#F4A261]' },
        { name: 'Physical', count: childProgressData?.physical ?? 45, color: 'bg-[#6FCF97]' },
        { name: 'Social & Emotional', count: childProgressData?.social ?? 40, color: 'bg-[#F2C94C]' },
        { name: 'Creativity', count: childProgressData?.creativity ?? 35, color: 'bg-[#E76F6F]' },
    ];

    const maxProgressValue = Math.max(...progressCategories.map(c => c.count), 50);

    return (
        <AuthenticatedLayout activeNavId="dashboard">
<Head title="Smart Kids - Admin Dashboard" />

            {/* Gunakan max-w-7xl mx-auto space-y-6 untuk samakan kelebaran & susunan */}
            <div className="max-w-7xl mx-auto space-y-6 font-sans text-[#2D3142]">

                {/* 1. DASHBOARD HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3142] tracking-tight">
                            Good Morning, {auth?.user?.name || 'Admin'} 👋
                        </h1>
                        <p className="text-sm font-medium text-[#6B7280] mt-1">
                            Here is today's overview of Smart Kids Management and Monitoring System.
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-3 rounded-2xl bg-[#F7F6FC] hover:bg-[#6C63A8]/10 text-[#6C63A8] transition-colors border border-slate-100">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E76F6F] ring-2 ring-white"></span>
                        </button>

                        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                            <div className="w-10 h-10 rounded-2xl bg-[#6C63A8] text-white font-bold flex items-center justify-center shadow-md">
                                {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-bold text-[#2D3142]">{auth?.user?.name || 'Administrator'}</p>
                                <p className="text-[10px] text-[#6B7280]">System Administrator</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Total Students */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Students</span>
                            <div className="p-2.5 rounded-2xl bg-[#6C63A8]/10 text-[#6C63A8]">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-black text-[#2D3142]">{stats?.totalStudents ?? 0}</p>
                            <span className="inline-block text-[11px] font-semibold text-[#6FCF97] mt-1 bg-[#6FCF97]/15 px-2 py-0.5 rounded-lg">
                                +5 this month
                            </span>
                        </div>
                    </div>

                    {/* Total Teachers */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Teachers</span>
                            <div className="p-2.5 rounded-2xl bg-[#F4A261]/15 text-[#F4A261]">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-black text-[#2D3142]">{stats?.totalTeachers ?? 0}</p>
                            <p className="text-[11px] font-medium text-[#6B7280] mt-1">Active Educators</p>
                        </div>
                    </div>

                    {/* Today's Attendance */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Attendance</span>
                            <div className="p-2.5 rounded-2xl bg-[#6FCF97]/20 text-[#27AE60]">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-black text-[#2D3142]">{stats?.presentToday ?? 0} Present</p>
                            <p className="text-[11px] font-bold text-[#6FCF97] mt-1">
                                {stats?.attendancePercentage ?? 0}% Rate Today
                            </p>
                        </div>
                    </div>

                    {/* Fee Collection */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Fee Collection</span>
                            <div className="p-2.5 rounded-2xl bg-[#F2C94C]/20 text-[#B78103]">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xl font-black text-[#2D3142]">RM {stats?.monthlyCollection ?? '0.00'}</p>
                            <p className="text-[11px] font-semibold text-[#E76F6F] mt-1">
                                Pending: RM {feeOverview?.pending ? Number(feeOverview.pending).toFixed(2) : '0.00'}
                            </p>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Pending Approval</span>
                            <div className="p-2.5 rounded-2xl bg-[#E76F6F]/15 text-[#E76F6F]">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-black text-[#2D3142]">{pendingRegistrations.length}</p>
                            <p className="text-[11px] font-medium text-[#6B7280] mt-1">Requires Admin Action</p>
                        </div>
                    </div>
                </div>

                {/* QUICK ACTION CENTER */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#6C63A8] animate-pulse"></span>
                                <h3 className="font-extrabold text-[#2D3142] text-base">Quick Action Center</h3>
                            </div>
                            <p className="text-xs text-[#6B7280] mt-0.5">Pintasan pantas bagi tugas pentadbiran harian utama</p>
                        </div>

                        {/* Carian Pintasan Ringkas */}
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Cari tindakan pantas..."
                                className="w-full text-xs font-medium pl-9 pr-4 py-2 rounded-2xl bg-[#F7F6FC] border border-slate-200 focus:outline-none focus:border-[#6C63A8] transition-all"
                            />
                            <svg className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Grid Kad Action Utama */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">

                        {/* Add Student */}
                        <Link
                            href="/students/create"
                            className="group p-4 bg-[#F7F6FC] hover:bg-[#6C63A8] rounded-2xl border border-slate-100 hover:border-[#6C63A8] transition-all duration-200 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#6C63A8]/10 group-hover:bg-white/20 text-[#6C63A8] group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-[#2D3142] group-hover:text-white transition-colors">Add Student</span>
                            <span className="text-[10px] text-[#6B7280] group-hover:text-white/80 transition-colors mt-0.5">Daftar Pelajar</span>
                        </Link>

                        {/* Add Teacher */}
                        <Link
                            href="/staff-accounts/create"
                            className="group p-4 bg-[#F7F6FC] hover:bg-[#514A82] rounded-2xl border border-slate-100 hover:border-[#514A82] transition-all duration-200 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#514A82]/10 group-hover:bg-white/20 text-[#514A82] group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                                <UserCheck className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-[#2D3142] group-hover:text-white transition-colors">Add Teacher</span>
                            <span className="text-[10px] text-[#6B7280] group-hover:text-white/80 transition-colors mt-0.5">Akaun Staf</span>
                        </Link>

                        {/* Review Registrations */}
                        <a
                            href="#pending-registrations"
                            className="group p-4 bg-[#F7F6FC] hover:bg-[#F4A261] rounded-2xl border border-slate-100 hover:border-[#F4A261] transition-all duration-200 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#F4A261]/20 group-hover:bg-white/20 text-[#D97706] group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-[#2D3142] group-hover:text-white transition-colors">Review Registrations</span>
                            <span className="text-[10px] text-[#6B7280] group-hover:text-white/80 transition-colors mt-0.5">Semak Ibu Bapa</span>
                        </a>

                        {/* Record Payment */}
                        <Link
                            href="/fees"
                            className="group p-4 bg-[#F7F6FC] hover:bg-[#6FCF97] rounded-2xl border border-slate-100 hover:border-[#6FCF97] transition-all duration-200 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#6FCF97]/20 group-hover:bg-white/20 text-[#219653] group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-[#2D3142] group-hover:text-white transition-colors">Record Payment</span>
                            <span className="text-[10px] text-[#6B7280] group-hover:text-white/80 transition-colors mt-0.5">Kutipan Yuran</span>
                        </Link>

                        {/* Create Announcement */}
                        <Link
                            href="/announcements/create"
                            className="group p-4 bg-[#F7F6FC] hover:bg-[#F2C94C] rounded-2xl border border-slate-100 hover:border-[#F2C94C] transition-all duration-200 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#F2C94C]/25 group-hover:bg-white/20 text-[#B78103] group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-[#2D3142] group-hover:text-white transition-colors">Announcement</span>
                            <span className="text-[10px] text-[#6B7280] group-hover:text-white/80 transition-colors mt-0.5">Cipta Pengumuman</span>
                        </Link>

                        {/* View Reports */}
                        <Link
                            href="/reports"
                            className="group p-4 bg-[#F7F6FC] hover:bg-[#2D3142] rounded-2xl border border-slate-100 hover:border-[#2D3142] transition-all duration-200 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#2D3142]/10 group-hover:bg-white/20 text-[#2D3142] group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-[#2D3142] group-hover:text-white transition-colors">View Reports</span>
                            <span className="text-[10px] text-[#6B7280] group-hover:text-white/80 transition-colors mt-0.5">Laporan Sistem</span>
                        </Link>

                    </div>
                </div>

                {/* MAIN CHARTS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 3. ATTENDANCE CHART (Donut) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-extrabold text-[#2D3142] text-base">Attendance Overview</h3>
                            <Link href="/attendance" className="text-xs font-bold text-[#6C63A8] hover:underline flex items-center">
                                View Attendance <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </Link>
                        </div>

                        {/* Custom SVG Donut */}
                        <div className="relative flex items-center justify-center my-4">
                            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-slate-100"
                                    strokeWidth="3.8"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                {/* Present */}
                                <path
                                    className="text-[#6FCF97]"
                                    strokeDasharray={`${pPresent}, 100`}
                                    strokeWidth="3.8"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-black text-[#2D3142]">{totalStudentsAttendance}</span>
                                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total Kids</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#6FCF97]"></span>
                                <span className="font-medium text-[#6B7280]">Present ({presentCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#E76F6F]"></span>
                                <span className="font-medium text-[#6B7280]">Absent ({absentCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#F2C94C]"></span>
                                <span className="font-medium text-[#6B7280]">Late ({lateCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                                <span className="font-medium text-[#6B7280]">Not Checked-in ({notCheckedInCount})</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. FEE PAYMENT CHART (Bar Chart) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div>
                                <h3 className="font-extrabold text-[#2D3142] text-base">Monthly Fee Collection</h3>
                                <p className="text-xs text-[#6B7280]">Payment collection trends for the first half of the year</p>
                            </div>
                            <div className="flex items-center space-x-3 text-xs font-bold">
                                <span className="text-[#27AE60]">Collected: RM {feeOverview?.paid ? Number(feeOverview.paid).toLocaleString() : '0'}</span>
                                <span className="text-[#F4A261]">Pending: RM {feeOverview?.pending ? Number(feeOverview.pending).toLocaleString() : '0'}</span>
                            </div>
                        </div>

                        {/* SVG Bar Chart */}
                        <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 px-2">
                            {monthlyFees.map((item, idx) => {
                                const heightPercent = Math.min(100, Math.max(10, (item.collected / maxFeeValue) * 100));
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                        <div className="text-[10px] font-bold text-[#6C63A8] opacity-0 group-hover:opacity-100 transition-opacity">
                                            RM{item.collected}
                                        </div>
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            className="w-full max-w-[36px] bg-[#6C63A8] rounded-t-xl hover:bg-[#514A82] transition-all relative"
                                        />
                                        <span className="text-xs font-bold text-[#6B7280]">{item.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 5. CHILD PROGRESS CHART & 7. TODAY'S ALERTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Child Progress Chart */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-extrabold text-[#2D3142] text-base">Child Progress Overview</h3>
                                <p className="text-xs text-[#6B7280]">Development areas monitoring across active students</p>
                            </div>
                            <Award className="w-5 h-5 text-[#6C63A8]" />
                        </div>

                        <div className="space-y-4 my-2">
                            {progressCategories.map((cat, idx) => {
                                const barWidth = Math.min(100, (cat.count / maxProgressValue) * 100);
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-[#2D3142]">{cat.name}</span>
                                            <span className="text-[#6B7280]">{cat.count} Students</span>
                                        </div>
                                        <div className="w-full h-3 bg-[#F7F6FC] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Today's Alerts */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-extrabold text-[#2D3142] text-base">Today's Alerts</h3>
                                <ShieldAlert className="w-5 h-5 text-[#E76F6F]" />
                            </div>

                            <div className="space-y-2.5">
                                <Link href="/attendance" className="flex items-center justify-between p-3 rounded-2xl bg-[#E76F6F]/10 hover:bg-[#E76F6F]/20 transition-colors">
                                    <span className="text-xs font-bold text-[#E76F6F] flex items-center gap-2">
                                        🔴 {attendanceDetails?.absent ?? 0} Students absent today
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-[#E76F6F]" />
                                </Link>

                                <Link href="/attendance" className="flex items-center justify-between p-3 rounded-2xl bg-[#F4A261]/15 hover:bg-[#F4A261]/25 transition-colors">
                                    <span className="text-xs font-bold text-[#D97706] flex items-center gap-2">
                                        🟠 {attendanceDetails?.late ?? 0} Students arrived late
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-[#D97706]" />
                                </Link>

                                <Link href="/attendance" className="flex items-center justify-between p-3 rounded-2xl bg-[#F2C94C]/20 hover:bg-[#F2C94C]/30 transition-colors">
                                    <span className="text-xs font-bold text-[#B78103] flex items-center gap-2">
                                        🟡 {attendanceDetails?.notCheckedOut ?? 0} Not checked out
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-[#B78103]" />
                                </Link>

                                <Link href="/fees" className="flex items-center justify-between p-3 rounded-2xl bg-[#6FCF97]/20 hover:bg-[#6FCF97]/30 transition-colors">
                                    <span className="text-xs font-bold text-[#219653] flex items-center gap-2">
                                        🟢 {stats?.recentPaymentsCount ?? 0} Fee payments today
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-[#219653]" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. PENDING PARENT REGISTRATION TABLE */}
                <div id="pending-registrations" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-extrabold text-[#2D3142] text-base">Pending Parent Registration</h3>
                            <p className="text-xs text-[#6B7280]">Review and link new parents with enrolled children</p>
                        </div>
                        <span className="text-xs font-extrabold px-3 py-1 bg-[#F4A261]/20 text-[#D97706] rounded-full">
                            {pendingRegistrations.length} Pending
                        </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#F7F6FC] text-[#6B7280] font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">Parent Name</th>
                                    <th className="py-3.5 px-4">Child Name</th>
                                    <th className="py-3.5 px-4">Registration Date</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-[#2D3142]">
                                {pendingRegistrations.length > 0 ? (
                                    pendingRegistrations.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-bold">{row.parent_name}</td>
                                            <td className="py-3.5 px-4">{row.child_name || 'Not Linked'}</td>
                                            <td className="py-3.5 px-4 text-[#6B7280]">{row.created_at}</td>
                                            <td className="py-3.5 px-4">
                                                <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-[#F4A261]/15 text-[#D97706]">
                                                    {row.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleOpenApproveModal(row)}
                                                    className="px-3 py-1.5 rounded-xl bg-[#6C63A8] hover:bg-[#514A82] text-white font-bold transition-colors"
                                                >
                                                    Approve & Link
                                                </button>
                                                <button
                                                    onClick={() => handleReject(row.id)}
                                                    className="px-3 py-1.5 rounded-xl bg-[#E76F6F]/10 hover:bg-[#E76F6F]/20 text-[#E76F6F] font-bold transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center text-[#6B7280] font-medium">
                                            Tiada pendaftaran baru yang menunggu kelulusan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
