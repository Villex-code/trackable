"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useTimers } from "@/lib/TimerContext";
import { useDashboard } from "@/lib/DashboardContext";
import {
  HomeIcon,
  BriefcaseIcon,
  AppleIcon,
  WalletIcon,
  LayoutGridIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/home", icon: HomeIcon },
  { name: "Activities", href: "/activities", icon: LayoutGridIcon },
  { name: "Focus", href: "/work", icon: BriefcaseIcon },
  { name: "Nutrition", href: "/diet", icon: AppleIcon },
  { name: "Finances", href: "/financials", icon: WalletIcon },
];

export default function Sidebar() {
  const { hasFinishedTimers } = useTimers();
  const { setIsSettingsOpen } = useDashboard();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-6 left-6 z-[100] w-12 h-12 bg-white border border-brand-orange-100 rounded-2xl flex items-center justify-center text-brand-orange-500 shadow-lg"
      >
        {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[80]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 h-full z-[90] transition-all duration-500 ease-in-out
        w-24 flex flex-col items-center py-10
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:sticky lg:h-[calc(100vh-48px)] lg:my-6 lg:ml-6 glass rounded-[48px] bg-white/80 border border-brand-orange-100/50 shadow-2xl
      `}
      >
        {/* Logo */}
        <div className="mb-12 relative group">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange-100/20 group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-brand-orange-100 p-2">
            <img
              src="/graphics/logo.png"
              alt="Trackable"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col space-y-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isActivity = item.href === '/activities';
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 relative group ${
                  isActive
                    ? "bg-brand-orange-500 text-white shadow-lg shadow-brand-orange-100"
                    : "text-slate-400 hover:text-brand-orange-600 hover:bg-white"
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />

                {/* Notification Badge */}
                {isActivity && hasFinishedTimers && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-lg" />
                )}

                {/* Enhanced Tooltip */}
                <div className="absolute left-20 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 pointer-events-none z-50 hidden lg:block">
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-2xl flex items-center space-x-2 border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                      {item.name}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-brand-orange-400" />
                  </div>
                </div>

                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute -left-4 w-1.5 h-6 bg-brand-orange-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.6)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout (Restored) */}
        <div className="mt-auto relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`w-12 h-12 rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-300 ${
              showProfileMenu
                ? "border-brand-orange-500 scale-110 shadow-lg shadow-brand-orange-100"
                : "border-white hover:border-brand-orange-200 hover:scale-105"
            }`}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-brand-orange-500 flex items-center justify-center text-white font-bold">
                {user?.displayName?.[0] || user?.email?.[0] || "U"}
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute left-16 bottom-0 w-64 glass rounded-[32px] bg-white p-2 shadow-2xl animate-fade-in z-[100] border border-brand-orange-100/50 overflow-hidden">
              <div className="p-4 border-b border-slate-50 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Manage Account
                </p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-brand-orange-50 text-slate-600 hover:text-brand-orange-600 transition-all font-bold text-sm"
                >
                  <SettingsIcon size={18} />
                  <span>Settings</span>
                </button>
                <div className="h-px bg-slate-50 my-2" />
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-bold"
                >
                  <LogOutIcon size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
