import React, { useState } from 'react';
import SidebarTeacher from '@/Components/SidebarTeacher';

export default function AuthenticatedLayoutTeacher({ children, activeNavId = 'dashboard' }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8F7F2] text-[#26332A] flex">
            {/* Dedicated Teacher Sidebar Component */}
            <SidebarTeacher
                activeNavId={activeNavId}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                onCloseMobile={() => setIsMobileOpen(false)}
            />

            {/* Main Content Workspace - Dynamic Left Padding Based on Sidebar State */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
                }`}
            >
                {/* Mobile Header Bar */}
                <div className="lg:hidden p-4 bg-[#527A5D] text-white border-b border-[#668F70] flex items-center justify-between sticky top-0 z-30 shadow-xs">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
                    >
                        <span>☰</span> Menu
                    </button>
                    <span className="font-extrabold text-white text-sm tracking-tight">SmartKids Teacher</span>
                </div>

                {/* Main Content Body */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
