"use client";

import { useAuth } from "@/lib/AuthContext";
import { useDashboard } from "@/lib/DashboardContext";
import { BellIcon, SettingsIcon, LogOutIcon } from "lucide-react";
import { ReactNode, useState, useRef, useEffect } from "react";

interface TopBarProps {
  body?: ReactNode;
}

export default function TopBar({ body }: TopBarProps) {
  const { user, logout } = useAuth();
  const { setIsSettingsOpen } = useDashboard();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "User";

  return (
    <header className="flex items-center justify-between h-[64px] px-6 lg:px-8 border-b border-brand-orange-100/50 bg-white/80 backdrop-blur-xl shrink-0 z-30">
      {/* Left: page-specific content */}
      <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
        {body}
      </div>

      {/* Right: actions + profile */}
      <div className="flex items-center gap-2.5 ml-4 shrink-0">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-9 h-9 rounded-xl bg-brand-orange-50 text-brand-orange-500 border border-brand-orange-100/60 flex items-center justify-center hover:bg-brand-orange-100 hover:border-brand-orange-200 transition-all"
          title="Appearance"
        >
          <SettingsIcon size={15} />
        </button>

        <button
          className="w-9 h-9 rounded-xl bg-brand-orange-50 text-brand-orange-500 border border-brand-orange-100/60 flex items-center justify-center hover:bg-brand-orange-100 hover:border-brand-orange-200 transition-all group"
          title="Notifications"
        >
          <BellIcon size={15} className="group-hover:rotate-12 transition-transform duration-300" />
        </button>

        {/* Profile chip */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-2xl border-2 transition-all duration-300 ${
              showMenu
                ? "border-brand-orange-400 bg-brand-orange-50 shadow-lg shadow-brand-orange-100/50"
                : "border-brand-orange-100 bg-white hover:border-brand-orange-200 hover:shadow-sm"
            }`}
          >
            <div className="w-7 h-7 rounded-[10px] overflow-hidden shrink-0 shadow-sm">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-orange-400 to-brand-orange-600 flex items-center justify-center text-white font-black text-[11px]">
                  {displayName[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <p className="text-[11px] font-black text-slate-800 truncate max-w-[100px]">
                {displayName}
              </p>
              <p className="text-[9px] font-bold text-brand-orange-500 uppercase tracking-wider mt-0.5">
                Personal
              </p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[20px] border border-brand-orange-100/60 shadow-2xl shadow-brand-orange-100/20 animate-fade-in z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-[13px] font-bold text-slate-800 truncate">{user.email}</p>
              </div>
              <div className="p-2 space-y-0.5">
                <button
                  onClick={() => { setIsSettingsOpen(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-orange-50 text-slate-600 hover:text-brand-orange-600 transition-all font-bold text-sm"
                >
                  <SettingsIcon size={15} />
                  <span>Appearance</span>
                </button>
                <button
                  onClick={() => { logout(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-bold"
                >
                  <LogOutIcon size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
