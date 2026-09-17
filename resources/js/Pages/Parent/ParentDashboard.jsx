import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function ParentDashboard({ childrenList = [], announcements = [] }) {
    const { auth } = usePage().props ? { auth: usePage().props.auth } : { auth: {} };
    const [selectedChildIndex, setSelectedChildIndex] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const currentChild = childrenList[selectedChildIndex] || null;

    const navItems = [
        { name: 'Home', icon: '🏠', href: '/parent/dashboard', active: true },
        { name: 'My Children', icon: '👶', href: '/parent/children', active: false },
        { name: 'Learning Logs', icon: '📖', href: '/parent/learning-log', active: false },
        { name: 'Attendance History', icon: '📅', href: '/parent/attendance', active: false },
        { name: 'Invoices & Fees', icon: '💳', href: '/parent/fees', active: false },
        { name: 'Announcements', icon: '📢', href: '/parent/announcements', active: false },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans relative">
            <Head title="Parent Portal - Smart Kids" />

            {/* Mobile Navigation Header */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.jpg" alt="Logo" className="w-9 h-9 rounded-xl object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
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
                        <img src="/images/logo.jpg" alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                        <div className="min-w-0">
                            <h2 className="text-base font-black text-slate-900 leading-tight">Smart Kids</h2>
                            <p className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase mt-0.5">Parent Portal</p>
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
                    <Link href="/logout" method="post" as="button" className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold text-sm text-rose-600 hover:bg-rose-50 transition-all text-left">
                        <span>🚪</span> <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" />}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <header className="hidden md:flex h-20 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Parent Overview</span>
                        <h1 className="text-lg font-black text-slate-900">Child Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
                        <div className="w-8 h-8 rounded-lg bg-emerald-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
                            {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <p className="text-xs font-bold text-slate-800">{auth?.user?.name || 'Parent Account'}</p>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    {/* Child Selector Tabs */}
                    {childrenList.length === 0 ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-800">
                            No registered child found under your account.
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {childrenList.map((child, idx) => (
                                <button
                                    key={child.id || idx}
                                    onClick={() => setSelectedChildIndex(idx)}
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
                    )}

                    {currentChild && (
                        <>
                            {/* Daily Status Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Attendance Today</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`w-3 h-3 rounded-full ${currentChild.attendance.time ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                        <h3 className="text-lg font-black text-slate-800">
                                            {currentChild.attendance.status}
                                            {currentChild.attendance.time && ` (${currentChild.attendance.time})`}
                                        </h3>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Class / Teacher</p>
                                    <h3 className="text-lg font-black text-slate-800 mt-1">
                                        {currentChild.class} • {currentChild.teacher}
                                    </h3>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Fee Status</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <h3 className="text-lg font-black text-amber-600">RM {currentChild.fee.unpaid_amount}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                            currentChild.fee.is_unpaid ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {currentChild.fee.is_unpaid ? 'Unpaid' : 'Paid'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Daily Updates & Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-black text-slate-800 text-base">Latest Activity Update</h3>
                                        <Link href="/parent/learning-log" className="text-xs font-bold text-amber-600 hover:underline">
                                            View All Logs →
                                        </Link>
                                    </div>

                                    {currentChild.latest_log ? (
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-amber-600">
                                                    {currentChild.latest_log.category} • {currentChild.latest_log.time}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    By {currentChild.latest_log.teacher_name}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                {currentChild.latest_log.text || 'No detailed description provided.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs font-bold text-slate-400">
                                            No recent activity log recorded yet for today.
                                        </div>
                                    )}
                                </div>

                                {/* Recent Notice Card */}
                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-black text-slate-800 text-base">Center Announcement</h3>
                                        <Link href="/parent/announcements" className="text-xs font-bold text-amber-600 hover:underline">
                                            View All →
                                        </Link>
                                    </div>

                                    {announcements.length === 0 ? (
                                        <p className="text-xs text-slate-400 font-bold py-2">No announcements available.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {announcements.map((notice) => (
                                                <div key={notice.id} className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-2xl space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-bold text-amber-950 text-xs">📢 {notice.title}</h4>
                                                        <span className="text-[9px] text-amber-700 font-medium">{notice.date}</span>
                                                    </div>
                                                    <p className="text-[11px] text-amber-900 leading-relaxed line-clamp-2">
                                                        {notice.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
