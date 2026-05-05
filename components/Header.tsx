"use client";

import { useAuth } from "@/lib/AuthContext";
import { BellIcon, SearchIcon } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="h-20 flex items-center justify-between px-10 animate-fade-in pointer-events-none">
      {/* Notifications Icon Only */}
      <div className="flex items-center space-x-6 pointer-events-auto">
        <button className="w-12 h-12 rounded-2xl bg-white border border-brand-orange-100 text-brand-orange-500 flex items-center justify-center hover:bg-brand-orange-50 transition-all shadow-sm group">
          <BellIcon
            size={20}
            className="group-hover:rotate-12 transition-transform"
          />
        </button>
      </div>
    </header>
  );
}
