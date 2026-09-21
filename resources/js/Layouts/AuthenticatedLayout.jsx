import React, { useState } from 'react';
import { Sidebar } from '@/Components/Sidebar';

export default function AuthenticatedLayout({
  children,
  activeNavId = 'dashboard',
  header = null,
}) {
  // Sidebar states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EAE7F6]">
      <Sidebar
        activeNavId={activeNavId}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
          >
            ☰ Menu
          </button>

          <span className="font-extrabold text-slate-800 text-sm">
            SmartKids SKMMS
          </span>
        </div>

        <main className="w-full p-4 sm:p-6 lg:p-8">
          {header && (
            <div className="mb-6">
              {header}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
