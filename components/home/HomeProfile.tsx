"use client";

import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { LogOutIcon, UserIcon, SettingsIcon, ChevronDownIcon } from "lucide-react";
import { useDashboard } from "@/lib/DashboardContext";

export default function HomeProfile() {
  const { user, logout } = useAuth();
  const { setIsSettingsOpen } = useDashboard();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  return (
    <div className="relative animate-fade-in">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-5 p-2 pr-6 rounded-[32px] bg-white border border-brand-orange-100 hover:border-brand-orange-200 transition-all shadow-xl shadow-brand-orange-100/10 group"
      >
        <div className="w-14 h-14 rounded-[24px] overflow-hidden border-2 border-brand-orange-200 shadow-sm transition-transform group-hover:scale-105">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || "Avatar"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brand-orange-500 flex items-center justify-center text-white font-bold text-xl">
              {user.displayName?.[0] || user.email?.[0] || "U"}
            </div>
          )}
        </div>
        
        <div className="text-left">
          <div className="flex items-center space-x-2">
            <p className="text-lg font-black text-slate-800 leading-tight">
              {user.displayName || "User"}
            </p>
            <ChevronDownIcon size={16} className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </div>
          <p className="text-[10px] font-black text-brand-orange-500 uppercase tracking-widest mt-0.5">
            Level 1 Pioneer
          </p>
        </div>
      </button>

      {/* Profile Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-4 w-64 bg-white rounded-[32px] shadow-2xl border border-brand-orange-100 p-4 z-50 animate-fade-in origin-top-right">
            <div className="p-4 border-b border-slate-50 mb-2">
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated</p>
               <p className="font-bold text-slate-800 truncate text-sm">{user.email}</p>
            </div>
            
            <div className="space-y-1">
              <button 
                onClick={() => {
                  setIsSettingsOpen(true);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-brand-orange-50 text-slate-600 hover:text-brand-orange-600 transition-all font-bold text-sm"
              >
                <SettingsIcon size={18} />
                <span>Preferences</span>
              </button>
              <div className="h-px bg-slate-50 my-2" />
              <button 
                onClick={logout}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 text-red-500 transition-all font-bold text-sm"
              >
                <LogOutIcon size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
