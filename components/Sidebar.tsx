"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  HomeIcon,
  BriefcaseIcon,
  AppleIcon,
  WalletIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/home", icon: HomeIcon },
  { name: "Work", href: "/work", icon: BriefcaseIcon },
  { name: "Diet", href: "/diet", icon: AppleIcon },
  { name: "Financials", href: "/financials", icon: WalletIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
    <aside className="w-20 h-[calc(100vh-48px)] my-6 ml-6 glass rounded-[32px] flex flex-col items-center py-8 fixed left-0 top-0 z-50">
      {/* Logo Icon */}
      <div className="mb-10 text-slate-800">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <nav className="flex-1 flex flex-col space-y-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 relative group ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />

              {/* Tooltip */}
              <span className="absolute left-16 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.name}
              </span>

              {/* Indicator dot */}
              {isActive && (
                <div className="absolute -left-1 w-1 h-4 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Avatar with Dropdown */}
      <div className="mt-auto relative" ref={menuRef}>
        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`w-10 h-10 rounded-full border-2 shadow-sm overflow-hidden cursor-pointer transition-all ${
            showProfileMenu
              ? "border-blue-500 scale-110"
              : "border-white hover:scale-105"
          }`}
        >
          <img
            src={
              user?.photoURL ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=Rob"
            }
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Dropdown */}
        {showProfileMenu && (
          <div className="absolute left-14 bottom-0 w-64 glass rounded-[24px] bg-white p-2 shadow-2xl animate-fade-in z-[60] border border-white/50 overflow-hidden">
            <div className="p-4 border-b border-slate-100/50 mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Logged in as
              </p>
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.email}
              </p>
            </div>

            <div className="space-y-1">
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
  );
}
