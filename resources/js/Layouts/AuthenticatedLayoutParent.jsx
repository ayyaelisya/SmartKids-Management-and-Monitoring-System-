import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import SidebarParent from '@/Components/SidebarParent';

export default function AuthenticatedLayoutParent({
    children,
    activeNavId = 'dashboard',
    pageTitle = 'Parent Portal',
    pageSubtitle = 'Smart Kids',
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const mobileNav = [
        {
            id: 'dashboard',
            label: 'Home',
            href: '/parent/dashboard',
        },
        {
            id: 'attendance',
            label: 'Attendance',
            href: '/parent/attendance',
        },
        {
            id: 'learning-log',
            label: 'Progress',
            href: '/parent/learning-log',
        },
        {
            id: 'announcements',
            label: 'Notices',
            href: '/parent/announcements',
        },
    ];

    return (
        <div className="min-h-screen bg-[#FFF9E9] font-sans text-[#302C22]">
            <SidebarParent
                activeNavId={activeNavId}
                isCollapsed={isCollapsed}
                onToggleCollapse={() =>
                    setIsCollapsed((current) => !current)
                }
                isMobileOpen={isMobileOpen}
                onCloseMobile={() => setIsMobileOpen(false)}
            />

            <div
                className={`min-h-screen ${
                    isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                }`}
            >
                {/* Mobile app header */}
                <header className="sticky top-0 z-30 border-b border-[#E9DEC3] bg-[#FFF9E9] lg:hidden">
                    <div className="flex h-[68px] items-center justify-between gap-3 px-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#806300]">
                                {pageSubtitle}
                            </p>
                            <h1 className="truncate text-lg font-bold leading-6">
                                {pageTitle}
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(true)}
                            aria-label="Open navigation menu"
                            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-xl border border-[#E9DEC3] bg-[#FFFEFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08300]"
                        >
                            <span className="h-[2px] w-[18px] bg-[#302C22]" />
                            <span className="h-[2px] w-[18px] bg-[#302C22]" />
                            <span className="h-[2px] w-[18px] bg-[#302C22]" />
                        </button>
                    </div>
                </header>

                {/* Desktop header */}
                <header className="hidden h-[72px] items-center border-b border-[#E9DEC3] bg-[#FFF9E9] px-8 lg:flex">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#806300]">
                            {pageSubtitle}
                        </p>
                        <h1 className="text-xl font-bold">{pageTitle}</h1>
                    </div>
                </header>

                {/* Extra bottom space keeps content above the mobile navigation */}
                <main className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
                    {children}
                </main>
            </div>


        </div>
    );
}
