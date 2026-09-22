import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import SidebarParent from '@/Components/SidebarParent';

export default function AuthenticatedLayoutParent({
    children,
    activeNavId = 'dashboard',
    pageTitle = 'Parent Portal',
    pageSubtitle = 'Smart Kids',
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
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
                className={`min-h-screen transition-all duration-300 ${
                    isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                }`}
            >
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:h-20 lg:px-8">
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen(true)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        aria-label="Open navigation"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 sm:text-xs">
                            {pageSubtitle}
                        </span>
                        <h1 className="text-base font-black text-slate-900 sm:text-lg">
                            {pageTitle}
                        </h1>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
