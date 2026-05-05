"use client";

import { useAuth } from "@/lib/AuthContext";
import AlternatingWelcome from "@/components/home/AlternatingWelcome";
import HomeProfile from "@/components/home/HomeProfile";
import QuickAnalytics from "@/components/home/QuickAnalytics";
import ActiveSnippet from "@/components/home/ActiveSnippet";
import { LayoutGridIcon, ActivityIcon } from "lucide-react";

import HomeCharts from "@/components/home/HomeCharts";

export default function HomePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      {/* Header with Welcome Message & Profile */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <AlternatingWelcome />
        <HomeProfile />
      </div>

      {/* Quick Analytics Summary (The Snapshot) */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 px-2">
           <ActivityIcon size={18} className="text-brand-orange-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Snapshot</h3>
        </div>
        <QuickAnalytics userId={user.uid} />
      </section>

      {/* Active Snippet Section (The "Active" Hub) */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 px-2">
           <LayoutGridIcon size={18} className="text-blue-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Active Engine Snippet</h3>
        </div>
        <ActiveSnippet userId={user.uid} />
      </section>

      {/* Charts & Trends */}
      <section className="space-y-8 pb-10">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Activity Trends</h3>
        </div>
        <HomeCharts userId={user.uid} />
      </section>

      {/* Background Graphic */}
      <div className="fixed top-0 right-0 -z-10 opacity-5 pointer-events-none">
         <img src="/graphics/pattern.png" alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
