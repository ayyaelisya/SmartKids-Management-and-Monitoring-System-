import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';

const CATEGORY_FIELDS = {
    'Check In': ['who_sent', 'temperature', 'health_symptoms', 'scars_bruises', 'fingernails', 'pee_poo'],
    'Check Out': ['who_pickup'],
    'Meal': ['meal_type', 'portion_eaten'],
    'Diaper': ['pee_poo', 'new_diaper'],
    'Milk': ['milk_type', 'amount_oz'],
    'Sleep': ['sleep_start', 'sleep_end', 'duration'],
    'Bath': ['taken_bath', 'brush_teeth'],
    'Circle & Play': ['activity_name', 'participation'],
    'Development Activity': ['activity_name', 'milestone', 'notes'],
};

export default function ParentLearningLog({ childrenList = [], initialLogs = [], selectedDate = '', currentUser = {} }) {
    const { props, url } = usePage();
    const auth = props?.auth || {};
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const userEmail = currentUser?.email || auth?.user?.email || 'parent@example.com';
    const userName = currentUser?.name || auth?.user?.name || 'Parent / Guardian';

    const [selectedChildId, setSelectedChildId] = useState('');
    const [logsList, setLogsList] = useState(initialLogs);
    const [filterDate, setFilterDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);

    useEffect(() => {
        setLogsList(initialLogs);
        if (selectedDate) setFilterDate(selectedDate);

        if (childrenList.length > 0) {
            const exists = childrenList.some((c) => String(c.id) === String(selectedChildId));
            if (!selectedChildId || !exists) {
                setSelectedChildId(String(childrenList[0].id));
            }
        }
    }, [initialLogs, childrenList, selectedDate]);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setFilterDate(newDate);

        // Hantar permintaan Inertia untuk tarik data berdasarkan tarikh baharu
        router.get(
            '/parent/learning-log',
            { date: newDate },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const selectedChild = childrenList.find((c) => String(c.id) === String(selectedChildId));
    const filteredLogs = logsList.filter((log) => String(log.child_id) === String(selectedChildId));

    // Semak secara dinamik mengikut URL semasa
    const navItems = [
        { name: 'Home', icon: '🏠', href: '/parent/dashboard' },
        { name: 'My Children', icon: '👶', href: '/parent/children' },
        { name: 'Learning Logs', icon: '📖', href: '/parent/learning-log' },
        { name: 'Attendance History', icon: '📅', href: '/parent/attendance' },
        { name: 'Invoices & Fees', icon: '💳', href: '/parent/invoices' },
        { name: 'Announcements', icon: '📢', href: '/parent/announcements' },
    ].map((item) => ({
        ...item,
        active: url.startsWith(item.href),
    }));

    const handleToggleLike = (logId) => {
        setLogsList(logsList.map((log) => {
            if (log.id === logId) {
                const updatedStatus = !log.isLikedByParent;
                return {
                    ...log,
                    isLikedByParent: updatedStatus,
                    likes: updatedStatus ? log.likes + 1 : Math.max(0, log.likes - 1),
                };
            }
            return log;
        }));

        router.post(`/parent/learning-log/${logId}/like`, {}, { preserveScroll: true });
    };

    const formatLabel = (key) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans relative">
            <Head title="Child Learning Log - Smart Kids" />

            {/* MOBILE HEADER */}
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

            {/* SIDEBAR NAVIGATION */}
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
                            <p className="text-[10px] text-amber-600 font-bold tracking-wider uppercase mt-0.5">Parent Portal</p>
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

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <header className="hidden md:flex h-20 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Child Daily Activities</span>
                        <h1 className="text-lg font-black text-slate-900">Learning Log</h1>
                    </div>

                    <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200 px-4 py-2 rounded-2xl">
                        <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-sm">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black text-slate-900">{userName}</p>
                            <p className="text-[11px] font-semibold text-amber-700">{userEmail}</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT COLUMN: CHILD SELECTION */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                                <h2 className="text-base font-black text-slate-900 tracking-tight">Select Child</h2>
                                <p className="text-xs font-medium text-slate-500">View activity reports by child.</p>

                                {childrenList.length === 0 ? (
                                    <div className="p-4 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        No child registered under this account.
                                    </div>
                                ) : (
                                    <div className="space-y-2 pt-2">
                                        {childrenList.map((child) => {
                                            const isSelected = String(child.id) === String(selectedChildId);
                                            return (
                                                <button
                                                    key={child.id}
                                                    onClick={() => setSelectedChildId(String(child.id))}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left border transition-all ${
                                                        isSelected
                                                            ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-sm'
                                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-amber-200 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-sm shrink-0 overflow-hidden">
                                                        {child.avatar ? (
                                                            <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            child.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-black truncate">{child.name}</p>
                                                        <p className="text-[11px] font-medium text-slate-500">{child.class}</p>
                                                    </div>
                                                    {isSelected && <span className="text-amber-600 text-sm font-bold">✓</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {selectedChild && (
                                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Child Information</span>
                                    <div className="flex items-center gap-3 pt-1">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-black text-lg overflow-hidden shrink-0">
                                            {selectedChild.avatar ? (
                                                <img src={selectedChild.avatar} alt={selectedChild.name} className="w-full h-full object-cover" />
                                            ) : (
                                                selectedChild.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">{selectedChild.name}</h3>
                                            <p className="text-xs font-semibold text-slate-500">{selectedChild.class} • {selectedChild.age}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: TIMELINE LOGS WITH DATE PICKER */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">Activity Timeline</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Daily updates for <span className="font-bold text-amber-600">{selectedChild?.name || 'Selected Child'}</span>
                                        </p>
                                    </div>

                                    {/* DATE PICKER FILTER */}
                                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                                        <span className="text-xs font-bold text-slate-600 pl-1">📅 Date:</span>
                                        <input
                                            type="date"
                                            value={filterDate}
                                            onChange={handleDateChange}
                                            className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                        />
                                    </div>
                                </div>

                                {filteredLogs.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-4xl mb-2">🌱</div>
                                        <p className="text-sm font-bold text-slate-500">
                                            No activity logs found for this date ({filterDate}).
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Try selecting another date using the date picker above.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                                        {filteredLogs.map((log) => {
                                            const allowedKeys = CATEGORY_FIELDS[log.category];

                                            return (
                                                <div key={log.id} className="relative bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                                                    <div className="absolute -left-[35px] top-5 w-5 h-5 rounded-full bg-amber-400 border-4 border-white shadow-sm" />

                                                    <div className="flex items-center justify-between">
                                                        <span className="px-3 py-1 bg-amber-400 text-amber-950 text-xs font-black rounded-full uppercase tracking-wider">
                                                            {log.category}
                                                        </span>
                                                        <div className="text-right">
                                                            <span className="text-xs font-bold text-slate-500">⏰ {log.time}</span>
                                                            {log.log_date && (
                                                                <span className="block text-[10px] text-slate-400 font-medium">{log.log_date}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {log.activity_data && typeof log.activity_data === 'object' && Object.keys(log.activity_data).length > 0 && (
                                                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 text-xs space-y-2 my-2">
                                                            {Object.entries(log.activity_data)
                                                                .filter(([key, val]) => {
                                                                    if (val === null || val === undefined || val === '' || val === 'none') return false;
                                                                    if (key === 'remarks' || key === 'time') return false;
                                                                    if (allowedKeys) {
                                                                        return allowedKeys.includes(key);
                                                                    }
                                                                    return true;
                                                                })
                                                                .map(([key, val]) => (
                                                                    <div key={key} className="flex items-center gap-2 border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                                                                        <span className="capitalize font-semibold text-slate-500 min-w-[110px]">
                                                                            {formatLabel(key)}:
                                                                        </span>
                                                                        <span className="font-bold text-slate-800">
                                                                            {String(val)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    )}

                                                    {log.text && (
                                                        <p className="text-xs text-slate-700 font-medium bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                                                            📝 <span className="font-bold text-amber-900">Remarks:</span> {log.text}
                                                        </p>
                                                    )}

                                                    {log.image && (
                                                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-64 bg-slate-100">
                                                            <img src={log.image} alt="Activity Log" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}

                                                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 mt-2">
                                                        <span>Teacher: <strong className="text-slate-600">{log.teacher_name}</strong></span>
                                                        <button
                                                            onClick={() => handleToggleLike(log.id)}
                                                            className={`px-3 py-1 rounded-lg font-bold border transition-all flex items-center gap-1 ${
                                                                log.isLikedByParent ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-500 border-slate-200'
                                                            }`}
                                                        >
                                                            <span>{log.isLikedByParent ? '❤️' : '🤍'}</span>
                                                            <span>{log.likes > 0 ? `${log.likes} Liked` : 'Like'}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
