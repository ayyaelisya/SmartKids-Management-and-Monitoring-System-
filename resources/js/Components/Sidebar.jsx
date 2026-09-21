import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    CalendarCheck,
    CreditCard,
    LogOut,
    Baby,
    ChevronDown,
    QrCode,
    ListCheck,
    Megaphone,
    BarChart3,
    UserRound,
    Settings,
    MoreVertical,
} from 'lucide-react';

export const Sidebar = ({
    activeNavId,
    isCollapsed,
    onToggleCollapse,
    isMobileOpen,
    onCloseMobile,
}) => {
    const { url, props } = usePage();
    const currentUser = props?.auth?.user || null;

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const isAttendanceRoute =
        url.startsWith('/attendance') ||
        url.startsWith('/student-qr-badges');

    const [isAttendanceOpen, setIsAttendanceOpen] =
        useState(isAttendanceRoute);

    const profileMenuRef = useRef(null);

    useEffect(() => {
        if (isAttendanceRoute) {
            setIsAttendanceOpen(true);
        }
    }, [isAttendanceRoute]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, []);

    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
        },
        {
            id: 'students',
            label: 'Student Management',
            icon: Baby,
            href: '/students',
        },
        {
            id: 'attendance',
            label: 'Attendance',
            icon: CalendarCheck,
            hasSubmenu: true,
            subItems: [
                {
                    id: 'attendance-monitoring',
                    label: 'Monitoring',
                    icon: ListCheck,
                    href: '/attendance',
                },
                {
                    id: 'student-qr-badges',
                    label: 'Student QR Badges',
                    icon: QrCode,
                    href: '/student-qr-badges',
                },
            ],
        },
        {
            id: 'billing',
            label: 'Fees & Payments',
            icon: CreditCard,
            href: '/admin/fees',
        },
        {
            id: 'announcements',
            label: 'Announcements',
            icon: Megaphone,
            href: '/admin/announcements',
        },
        {
            id: 'users',
            label: 'Staff Accounts',
            icon: ShieldCheck,
            href: '/staff-accounts',
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: BarChart3,
            href: '/admin/reports',
            disabled: true,
        },
    ];

    const userName =
        currentUser?.full_name ||
        currentUser?.name ||
        'Administrator';

    const userEmail =
        currentUser?.email ||
        'admin@example.com';

    const userInitial =
        userName?.charAt(0)?.toUpperCase() || 'A';

    const checkIsActive = (item) => {
    if (!item.href) {
        return false;
    }

    if (item.href === '/dashboard') {
        return url === '/dashboard' || url === '/';
    }

    return url.startsWith(item.href);
};

    const closeMobileSidebar = () => {
        if (onCloseMobile) {
            onCloseMobile();
        }
    };

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            <aside
                id="main-sidebar"
                style={{
                    background: 'rgba(108, 99, 168, 0.95)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRight:
                        '1px solid rgba(255, 255, 255, 0.2)',
                }}
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col shadow-xl transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    ${
                        isMobileOpen
                            ? 'translate-x-0'
                            : '-translate-x-full lg:translate-x-0'
                    }
                `}
            >
                <div className="flex h-24 shrink-0 items-center justify-between border-b border-white/20 px-4 pt-3">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white/20 p-1 shadow-xs backdrop-blur-md">
                            <img
                                src="/images/logo.jpg"
                                alt="SmartKids Logo"
                                className="h-full w-full rounded-xl object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';

                                    if (e.target.parentNode) {
                                        e.target.parentNode.innerHTML =
                                            '<span class="text-white text-xs font-bold">SK</span>';
                                    }
                                }}
                            />
                        </div>

                        {!isCollapsed && (
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-base font-extrabold leading-tight tracking-tight text-white">
                                    SmartKids{' '}
                                    <span className="text-amber-300">
                                        ADMIN
                                    </span>
                                </span>

                                <span className="mt-1 truncate text-[10px] font-semibold text-white/70">
                                    Tinta Tots Clubhouse
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/15 hover:text-white lg:flex"
                        title={
                            isCollapsed
                                ? 'Expand sidebar'
                                : 'Collapse sidebar'
                        }
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-white" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 text-white" />
                        )}
                    </button>
                </div>

                <div className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        const isSubActive =
                            item.hasSubmenu &&
                            item.subItems.some((sub) =>
                                url.startsWith(sub.href)
                            );

                        const isActive =
                            checkIsActive(item) ||
                            isSubActive;

                        if (item.hasSubmenu) {
                            return (
                                <div
                                    key={item.id}
                                    className="space-y-1"
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isCollapsed) {
                                                onToggleCollapse();
                                            }

                                            setIsAttendanceOpen(
                                                !isAttendanceOpen
                                            );
                                        }}
                                        className={`group relative flex w-full cursor-pointer items-center justify-between rounded-xl transition-all duration-200 ${
                                            isCollapsed
                                                ? 'justify-center p-3'
                                                : 'px-3.5 py-2.5'
                                        } ${
                                            isActive
                                                ? 'bg-white/15 font-bold text-white'
                                                : 'font-medium text-white/85 hover:bg-white/15 hover:text-white'
                                        }`}
                                        title={
                                            isCollapsed
                                                ? item.label
                                                : undefined
                                        }
                                    >
                                        <div className="flex items-center space-x-3 truncate">
                                            <Icon className="h-5 w-5 shrink-0 text-white/80" />

                                            {!isCollapsed && (
                                                <span className="truncate text-xs">
                                                    {item.label}
                                                </span>
                                            )}
                                        </div>

                                        {!isCollapsed && (
                                            <ChevronDown
                                                className={`h-4 w-4 text-white/70 transition-transform duration-200 ${
                                                    isAttendanceOpen
                                                        ? 'rotate-180'
                                                        : ''
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {isAttendanceOpen &&
                                        !isCollapsed && (
                                            <div className="space-y-1 pt-1 pl-6">
                                                {item.subItems.map(
                                                    (sub) => {
                                                        const SubIcon =
                                                            sub.icon;

                                                        const isChildActive =
                                                            url.startsWith(
                                                                sub.href
                                                            );

                                                        return (
                                                            <Link
                                                                key={
                                                                    sub.id
                                                                }
                                                                href={
                                                                    sub.href
                                                                }
                                                                onClick={
                                                                    closeMobileSidebar
                                                                }
                                                                className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 text-xs transition-all ${
                                                                    isChildActive
                                                                        ? 'bg-white font-bold text-[#524987] shadow-md'
                                                                        : 'font-medium text-white/80 hover:bg-white/10 hover:text-white'
                                                                }`}
                                                            >
                                                                <SubIcon
                                                                    className={`h-4 w-4 shrink-0 ${
                                                                        isChildActive
                                                                            ? 'text-[#524987]'
                                                                            : 'text-white/70'
                                                                    }`}
                                                                />

                                                                <span className="truncate">
                                                                    {
                                                                        sub.label
                                                                    }
                                                                </span>
                                                            </Link>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                </div>
                            );
                        }

                        if (item.disabled) {
                            return (
                                <div
                                    key={item.id}
                                    className={`group relative flex w-full cursor-not-allowed items-center rounded-xl opacity-50 ${
                                        isCollapsed
                                            ? 'justify-center p-3'
                                            : 'space-x-3 px-3.5 py-2.5'
                                    } text-white/70`}
                                    title={
                                        isCollapsed
                                            ? `${item.label} - Coming Soon`
                                            : undefined
                                    }
                                >
                                    <Icon className="h-5 w-5 shrink-0 text-white/70" />

                                    {!isCollapsed && (
                                        <>
                                            <span className="flex-1 truncate text-xs font-medium">
                                                {item.label}
                                            </span>

                                            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white/70">
                                                Soon
                                            </span>
                                        </>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={closeMobileSidebar}
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
                                        ? 'bg-white font-bold text-[#524987] shadow-lg'
                                        : 'font-medium text-white/85 hover:bg-white/15 hover:text-white'
                                }`}
                            >
                                <Icon
                                    className={`h-5 w-5 shrink-0 ${
                                        isActive
                                            ? 'text-[#524987]'
                                            : 'text-white/80'
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
                </div>

                <div
                    ref={profileMenuRef}
                    className="relative shrink-0 border-t border-white/20 bg-black/10 p-3"
                >
                    {isProfileMenuOpen &&
                        !isCollapsed && (
                            <div className="absolute right-3 bottom-[76px] left-3 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                                <div className="border-b border-gray-100 px-4 py-3">
                                    <p className="truncate text-xs font-bold text-gray-900">
                                        {userName}
                                    </p>

                                    <p className="mt-0.5 truncate text-[10px] text-gray-500">
                                        {userEmail}
                                    </p>
                                </div>

                                <div className="p-2">
                                    <Link
                                        href="/profile"
                                        onClick={() => {
                                            setIsProfileMenuOpen(
                                                false
                                            );
                                            closeMobileSidebar();
                                        }}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                                    >
                                        <UserRound className="h-4 w-4 text-gray-500" />

                                        My Profile
                                    </Link>

                                    <div
                                        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-400"
                                        title="Settings module will be added later"
                                    >
                                        <Settings className="h-4 w-4" />

                                        Settings

                                        <span className="ml-auto rounded-md bg-gray-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-gray-400">
                                            Soon
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 p-2">
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                    >
                                        <LogOut className="h-4 w-4" />

                                        Logout
                                    </Link>
                                </div>
                            </div>
                        )}

                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (isCollapsed) {
                                    onToggleCollapse();
                                    return;
                                }

                                setIsProfileMenuOpen(
                                    !isProfileMenuOpen
                                );
                            }}
                            className={`flex min-w-0 flex-1 cursor-pointer items-center rounded-xl transition hover:bg-white/10 ${
                                isCollapsed
                                    ? 'justify-center p-1'
                                    : 'gap-2.5 p-1.5'
                            }`}
                            title={
                                isCollapsed
                                    ? 'Account'
                                    : 'Open account menu'
                            }
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-slate-950 shadow-inner">
                                {userInitial}
                            </div>

                            {!isCollapsed && (
                                <>
                                    <div className="min-w-0 flex-1 text-left">
                                        <p className="truncate text-xs font-bold text-white">
                                            {userName}
                                        </p>

                                        <p className="truncate text-[10px] text-white/70">
                                            {userEmail}
                                        </p>
                                    </div>

                                    <MoreVertical className="h-4 w-4 shrink-0 text-white/60" />
                                </>
                            )}
                        </button>

                        {!isCollapsed && (
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="shrink-0 cursor-pointer rounded-xl p-2 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4 text-white" />
                            </Link>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};
