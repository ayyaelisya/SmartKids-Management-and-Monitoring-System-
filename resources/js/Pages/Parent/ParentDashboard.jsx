import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';

export default function ParentDashboard({ childrenList = [], announcements = [] }) {
    const [selectedChildIndex, setSelectedChildIndex] = useState(0);


    const currentChild = childrenList[selectedChildIndex] || null;

    return (
        <AuthenticatedLayoutParent activeNavId="dashboard" pageTitle="Child Dashboard" pageSubtitle="Parent Overview">
            <Head title="Parent Portal - Smart Kids" />

            <main className="w-full">

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
        </AuthenticatedLayoutParent>
    );
}
