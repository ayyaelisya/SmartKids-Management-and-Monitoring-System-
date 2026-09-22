import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Baby,
    Bell,
    BookOpen,
    CalendarCheck,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    LayoutDashboard,
    LogOut,
    MessageCircle,
} from 'lucide-react';

export default function SidebarParent({
    activeNavId = 'dashboard',
    isCollapsed = false,
    onToggleCollapse,
    isMobileOpen = false,
    onCloseMobile,
}) {
    const { url, props } = usePage();
    const authUser = props?.auth?.user;

    const parentName =
        authUser?.full_name || authUser?.name || 'Parent Account';

    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/parent/dashboard',
            icon: LayoutDashboard,
        },
        {
            id: 'children',
            label: 'My Children',
            href: '/parent/children',
            icon: Baby,
        },
        {
            id: 'learning-logs',
            label: 'Learning Logs',
            href: '/parent/learning-log',
            icon: BookOpen,
        },
        {
            id: 'messages',
            label: 'Messages',
            href: '/parent/messages',
            icon: MessageCircle,
        },
        {
            id: 'attendance',
            label: 'Attendance History',
            href: '/parent/attendance',
            icon: CalendarCheck,
        },
        {
            id: 'fees',
            label: 'Invoices & Fees',
            href: '/parent/fees',
            icon: CreditCard,
        },
        {
            id: 'announcements',
            label: 'Announcements',
            href: '/parent/announcements',
            icon: Bell,
        },
    ];

    const userInitial = parentName.charAt(0).toUpperCase();

    return (
        <>
            {isMobileOpen && (
                <div
                    onClick={onCloseMobile}
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex shrink-0 select-none flex-col justify-between bg-white text-slate-700 shadow-xl transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'w-20' : 'w-64'
                } ${
                    isMobileOpen
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="space-y-4 p-3">
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2.5">
                        <div className="flex min-w-0 items-center space-x-3 overflow-hidden">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white p-1 shadow-sm">
                                <img
                                    src="/images/logo.jpg"
                                    alt="Smart Kids logo"
                                    className="h-full w-full rounded-lg object-contain"
                                    onError={(event) => {
                                        event.currentTarget.style.display =
                                            'none';
                                    }}
                                />
                            </div>

                            {!isCollapsed && (
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate text-xs font-extrabold leading-tight text-slate-900">
                                        Smart Kids
                                    </span>
                                    <span className="mt-1 block truncate text-[9px] font-black uppercase tracking-wider text-amber-600">
                                        Parent Portal
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-amber-100 hover:text-amber-700 lg:flex"
                            title={
                                isCollapsed
                                    ? 'Expand sidebar'
                                    : 'Collapse sidebar'
                            }
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <ChevronLeft className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                activeNavId === item.id ||
                                url.startsWith(item.href);

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={onCloseMobile}
                                    title={
                                        isCollapsed
                                            ? item.label
                                            : undefined
                                    }
                                    className={`group relative flex w-full items-center rounded-xl transition-all duration-200 ${
                                        isCollapsed
                                            ? 'justify-center p-3'
                                            : 'space-x-3 px-3.5 py-2.5'
                                    } ${
                                        isActive
                                            ? 'bg-amber-400 font-bold text-amber-950 shadow-md shadow-amber-400/20'
                                            : 'font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                    }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 shrink-0 ${
                                            isActive
                                                ? 'text-amber-950'
                                                : 'text-slate-500 group-hover:text-amber-700'
                                        }`}
                                    />

                                    {!isCollapsed && (
                                        <span className="flex-1 truncate text-xs">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center space-x-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-400 text-sm font-black text-emerald-950 shadow-inner">
                                {userInitial}
                            </div>

                            {!isCollapsed && (
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-bold leading-tight text-slate-900">
                                        {parentName}
                                    </p>
                                    <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-500">
                                        {authUser?.email || 'Parent Account'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="shrink-0 rounded-xl p-2 text-rose-500 transition-colors hover:bg-rose-100 hover:text-rose-700"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        )}
                    </div>

                    {isCollapsed && (
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="mt-2 flex w-full justify-center rounded-xl p-2 text-rose-500 hover:bg-rose-100"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}
