import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, School, CalendarCheck, FileText, Megaphone,
    MessageCircle, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function SidebarTeacher({
    activeNavId = 'dashboard',
    isCollapsed = false,
    onToggleCollapse,
    isMobileOpen = false,
    onCloseMobile,
}) {
    const { url, props } = usePage();
    const user = props?.auth?.user || {
        full_name: 'Teacher',
        email: 'teacher@skmms.edu.my',
    };
    const userName = user.full_name || user.name || 'Teacher';

    // Keep all teacher navigation links in this component only.
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
        { id: 'classes', label: 'My Classes', href: '/teacher/classes', icon: School },
        { id: 'attendance', label: 'Attendance', href: '/teacher/attendance', icon: CalendarCheck },
        { id: 'logs', label: 'Learning Logs', href: '/teacher/learning-log', icon: FileText },
        { id: 'messages', label: 'Messages', href: '/teacher/messages', icon: MessageCircle },
        { id: 'announcements', label: 'Announcements', href: '/teacher/announcements', icon: Megaphone },
    ];

    return (
        <>
            {isMobileOpen && (
                <div onClick={onCloseMobile} className="fixed inset-0 z-40 bg-[#26332A]/50 backdrop-blur-xs lg:hidden" />
            )}

            <aside className={`fixed bottom-0 left-0 top-0 z-50 flex shrink-0 flex-col justify-between bg-[#527A5D] text-white shadow-xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="space-y-4 p-3">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-2 py-2.5">
                        <div className="flex min-w-0 items-center space-x-3 overflow-hidden">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white p-1 shadow-xs">
                                <img src="/images/logo.jpg" alt="Smart Kids" className="h-full w-full rounded-lg object-contain" />
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0">
                                    <span className="block truncate text-xs font-extrabold">Smart Kids</span>
                                    <span className="mt-1 block truncate text-[9px] font-black uppercase tracking-wider text-[#A3E0B3]">Teacher Portal</span>
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={onToggleCollapse} className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 lg:flex" title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </button>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeNavId === item.id || url.startsWith(item.href);
                            return (
                                <Link key={item.id} href={item.href} onClick={onCloseMobile} title={isCollapsed ? item.label : undefined}
                                    className={`group relative flex w-full items-center rounded-xl transition-all ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'} ${isActive ? 'bg-white font-bold text-[#527A5D] shadow-lg' : 'font-medium text-white/85 hover:bg-white/15 hover:text-white'}`}>
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {!isCollapsed && <span className="flex-1 truncate text-xs">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="shrink-0 border-t border-white/20 bg-black/10 p-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center space-x-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-[#7FAF8A] text-sm font-black">{userName.charAt(0).toUpperCase()}</div>
                            {!isCollapsed && <div className="min-w-0"><p className="truncate text-xs font-bold">{userName}</p><p className="mt-0.5 truncate text-[10px] text-white/70">{user.email}</p></div>}
                        </div>
                        {!isCollapsed && (
                            <Link href="/logout" method="post" as="button" className="shrink-0 rounded-xl p-2 text-white/80 hover:bg-rose-500/30 hover:text-white" title="Logout"><LogOut className="h-4 w-4" /></Link>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
