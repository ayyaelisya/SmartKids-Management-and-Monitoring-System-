import React, { useState, useRef, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import {
  ShieldCheck, ChevronLeft, ChevronRight, LayoutDashboard,
  CalendarCheck, CreditCard, LogOut, Baby, ChevronDown, QrCode, ListCheck
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

  // Semak jika URL semasa bermula dengan mana-mana path submenu attendance
  const isAttendanceRoute = url.startsWith('/attendance') || url.startsWith('/student-qr-badges');
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(isAttendanceRoute);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'students', label: 'Student Management', icon: Baby, href: '/students' },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      hasSubmenu: true,
      subItems: [
        { id: 'attendance-monitoring', label: 'Monitoring', icon: ListCheck, href: '/attendance' },
        { id: 'student-qr-badges', label: 'Student QR Badges', icon: QrCode, href: '/student-qr-badges' },
      ]
    },
    { id: 'billing', label: 'Fees & Payments', icon: CreditCard, href: '/fees' },
    { id: 'users', label: 'Staff Accounts', icon: ShieldCheck, href: '/staff-accounts' },
  ];

  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
  const userName = currentUser?.name || 'User';
  const userEmail = currentUser?.email || 'admin@example.com';

  // Fungsi penentuan item aktif berdasarkan URL atau activeNavId
  const checkIsActive = (item) => {
    if (activeNavId && activeNavId === item.id) return true;
    if (item.href === '/dashboard') return url === '/dashboard' || url === '/';
    return url.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
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
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-xl
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header Logo */}
        <div className="flex items-center justify-between px-4 h-24 pt-3 border-b border-white/20 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-1">
              <img
                src="/images/logo.jpg"
                alt="SmartKids Logo"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  if (e.target.parentNode) {
                    e.target.parentNode.innerHTML = '<span class="text-white text-xs font-bold">SK</span>';
                  }
                }}
              />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base tracking-tight text-white leading-tight truncate">
                  SmartKids <span className="text-amber-300">ADMIN</span>
                </span>
                <span className="text-[10px] font-semibold text-white/70 truncate mt-1">
                  Tinta Tots Clubhouse
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSubActive = item.hasSubmenu && item.subItems.some(sub => url.startsWith(sub.href));
            const isActive = checkIsActive(item) || isSubActive;

            // Submenu Attendance
            if (item.hasSubmenu) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      if (isCollapsed) onToggleCollapse();
                      setIsAttendanceOpen(!isAttendanceOpen);
                    }}
                    className={`group relative w-full flex items-center justify-between rounded-xl transition-all duration-200 cursor-pointer ${
                      isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5'
                    } ${isActive ? 'bg-white/15 text-white font-bold' : 'text-white/85 hover:text-white hover:bg-white/15 font-medium'}`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className="w-5 h-5 shrink-0 text-white/80" />
                      {!isCollapsed && <span className="text-xs truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                          isAttendanceOpen ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Submenu Item List */}
                  {isAttendanceOpen && !isCollapsed && (
                    <div className="pl-6 space-y-1 pt-1">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const isChildActive = url.startsWith(sub.href);

                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                              isChildActive
                                ? 'bg-white text-[#524987] font-bold shadow-md'
                                : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
                            }`}
                          >
                            <SubIcon className={`w-4 h-4 shrink-0 ${isChildActive ? 'text-[#524987]' : 'text-white/70'}`} />
                            <span className="truncate">{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single Menu Item
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative w-full flex items-center rounded-xl transition-all duration-200 ${
                  isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 space-x-3'
                } ${isActive ? 'bg-white text-[#524987] font-bold shadow-lg' : 'text-white/85 hover:text-white hover:bg-white/15 font-medium'}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#524987]' : 'text-white/80'}`} />
                {!isCollapsed && <span className="text-xs truncate flex-1">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Bottom Profile Section */}
        <div className="p-3 border-t border-white/20 bg-black/10 shrink-0 relative" ref={profileMenuRef}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-sm shadow-inner">
                {userInitial}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{userName}</p>
                  <p className="text-[10px] text-white/70 truncate">{userEmail}</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <Link
                href="/logout"
                method="post"
                as="button"
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
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
};
