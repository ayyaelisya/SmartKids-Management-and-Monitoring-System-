import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    School,
    CalendarCheck,
    FileText,
    Megaphone,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

export default function SidebarTeacher({
    activeNavId = 'dashboard',
    isCollapsed = false,
    onToggleCollapse,
    isMobileOpen = false,
    onCloseMobile,
}) {
    const { url, props } = usePage();
    const user = props?.auth?.user || { name: 'Teacher Aina', email: 'teacher@skmms.edu.my' };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
        { id: 'classes', label: 'My Classes', href: '/teacher/classes', icon: School },
        { id: 'attendance', label: 'Attendance', href: '/teacher/attendance', icon: CalendarCheck },
        { id: 'logs', label: 'Learning Logs', href: '/teacher/learning-log', icon: FileText },
        { id: 'announcements', label: 'Announcements', href: '/teacher/announcements', icon: Megaphone },
    ];

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'T';

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    onClick={onCloseMobile}
                    className="fixed inset-0 bg-[#26332A]/50 backdrop-blur-xs z-40 lg:hidden"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 bg-[#527A5D] text-white flex flex-col justify-between shrink-0 shadow-xl select-none transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'w-20' : 'w-64'
                } ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* TOP SECTION */}
                <div className="p-3 space-y-4">
                    {/* Header Logo Box */}
                    <div className="flex items-center justify-between px-2 py-2.5 rounded-2xl bg-white/10 border border-white/10 shrink-0">
                        <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                            {/* Kotak Logo Utama */}
                            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs border border-white/30">
                                <img
                                    src="/images/logo.jpg"
                                    alt="Logo"
                                    className="w-full h-full object-contain rounded-lg"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        if (e.target.parentNode) {
                                            e.target.parentNode.innerHTML = '<span class="font-black text-[#527A5D] text-xs">SK</span>';
                                        }
                                    }}
                                />
                            </div>

                            {!isCollapsed && (
                                <div className="flex flex-col min-w-0">
                                    <span className="font-extrabold text-xs text-white leading-tight truncate">
                                        Smart Kids
                                    </span>
                                    <span className="text-[9px] font-black text-[#A3E0B3] uppercase tracking-wider block mt-1 truncate">
                                        Teacher Portal
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Toggle Arrow Button */}
                        <button
                            onClick={onToggleCollapse}
                            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
                            title={isCollapsed ? 'Kembangkan Sidebar' : 'Kecilkan Sidebar'}
                        >
                            {isCollapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeNavId === item.id || url.startsWith(item.href);

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={onCloseMobile}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`group relative w-full flex items-center rounded-xl transition-all duration-200 ${
                                        isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 space-x-3'
                                    } ${
                                        isActive
                                            ? 'bg-white text-[#527A5D] font-bold shadow-lg'
                                            : 'text-white/85 hover:text-white hover:bg-white/15 font-medium'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#527A5D]' : 'text-white/80'}`} />
                                    {!isCollapsed && <span className="text-xs truncate flex-1">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* BOTTOM SECTION: PROFILE & LOGOUT */}
                <div className="p-3 border-t border-white/20 bg-black/10 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#7FAF8A] text-white font-black flex items-center justify-center shrink-0 text-sm shadow-inner border border-white/20">
                                {userInitial}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate leading-tight">{user.name}</p>
                                    <p className="text-[10px] text-white/70 truncate leading-tight mt-0.5">{user.email}</p>
                                </div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-rose-500/30 transition-colors cursor-pointer shrink-0"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4 text-white" />
                            </Link>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
