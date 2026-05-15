"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTimers } from "@/lib/TimerContext";
import { useDashboard } from "@/lib/DashboardContext";
import {
  HomeIcon,
  BriefcaseIcon,
  AppleIcon,
  WalletIcon,
  LayoutGridIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/home", icon: HomeIcon },
  { name: "Activities", href: "/activities", icon: LayoutGridIcon },
  { name: "Focus", href: "/work", icon: BriefcaseIcon },
  { name: "Nutrition", href: "/diet", icon: AppleIcon },
  { name: "Finances", href: "/financials", icon: WalletIcon },
  { name: "Accountability", href: "/accountability", icon: ShieldCheckIcon },
];

export default function Sidebar() {
  const { hasFinishedTimers } = useTimers();
  const { setIsSettingsOpen } = useDashboard();
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside data-sidebar="true" className="hidden lg:flex sticky left-0 top-0 h-screen mb-6 w-[72px] flex-col items-center py-8 glass rounded-b-[40px] bg-white/85 border border-brand-orange-100/50 shadow-xl shadow-brand-orange-50/40 z-[90] shrink-0">
        {/* Logo */}
        <div className="mb-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md shadow-brand-orange-100/30 hover:scale-105 transition-transform duration-300 overflow-hidden border border-brand-orange-100/60 p-1.5">
            <img
              src="/graphics/logo.png"
              alt="Trackable"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col space-y-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isActivity = item.href === "/activities";
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? "bg-brand-orange-500 text-white shadow-lg shadow-brand-orange-200"
                    : "text-slate-400 hover:text-brand-orange-500 hover:bg-brand-orange-50"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />

                {/* Notification Badge */}
                {isActivity && hasFinishedTimers && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-md" />
                )}

                {/* Tooltip */}
                <div className="absolute left-[52px] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 pointer-events-none z-50 hidden lg:block">
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 border border-white/10 whitespace-nowrap">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {item.name}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-brand-orange-400 shrink-0" />
                  </div>
                </div>

              </Link>
            );
          })}
        </nav>

        {/* Settings button at bottom */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-xl text-slate-400 hover:text-brand-orange-500 hover:bg-brand-orange-50 flex items-center justify-center transition-all duration-300 mt-auto"
          title="Appearance"
        >
          <SettingsIcon size={18} strokeWidth={1.8} />
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav data-sidebar="mobile" className="lg:hidden fixed bottom-5 left-5 right-5 h-[68px] glass bg-white/92 rounded-[28px] border border-brand-orange-100/60 shadow-[0_16px_40px_rgba(249,115,22,0.12),0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around px-4 z-[100] backdrop-blur-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isActivity = item.href === "/activities";
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-center transition-all duration-300 relative ${
                isActive ? "scale-110" : ""
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-brand-orange-500 text-white shadow-lg shadow-brand-orange-200"
                    : "text-slate-400"
                }`}
              >
                <item.icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              {isActivity && hasFinishedTimers && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </Link>
          );
        })}

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center justify-center text-slate-400 hover:text-brand-orange-500 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <SettingsIcon size={19} strokeWidth={1.8} />
          </div>
        </button>
      </nav>
    </>
  );
}
