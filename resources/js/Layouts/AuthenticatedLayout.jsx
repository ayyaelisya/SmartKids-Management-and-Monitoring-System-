import React, { useState } from 'react';
import { Sidebar } from '@/Components/Sidebar';


export default function AuthenticatedLayout({ children, activeNavId = 'dashboard' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EAE7F6] flex">
      {/* Sidebar Component */}
      <Sidebar
        activeNavId={activeNavId}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area - Padding Kiri Disesuaikan Ikut Keadaan Sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Mobile Header Bar */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
          >
            ☰ Menu
          </button>
          <span className="font-extrabold text-slate-800 text-sm">SmartKids SKMMS</span>
        </div>

        {/* Dashboard Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
