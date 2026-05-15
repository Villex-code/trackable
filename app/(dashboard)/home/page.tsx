"use client";

import { useAuth } from "@/lib/AuthContext";
import AlternatingWelcome from "@/components/home/AlternatingWelcome";
import HomeProfile from "@/components/home/HomeProfile";
import QuickAnalytics from "@/components/home/QuickAnalytics";
import ActiveSnippet from "@/components/home/ActiveSnippet";
import { LayoutGridIcon, ActivityIcon } from "lucide-react";
import HomeCharts from "@/components/home/HomeCharts";
import MainContentWrapper from "@/components/MainContentWrapper";

export default function HomePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <MainContentWrapper
      topbarBody={
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-brand-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">
            Overview
          </span>
        </div>
      }
    >
      <div className="space-y-12 pb-24 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-20">
          <AlternatingWelcome />
          <HomeProfile />
        </div>

        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-sm">
            <ActivityIcon size={12} className="text-brand-orange-500" />
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
              Intelligence Snapshot
            </h3>
          </div>
          <QuickAnalytics userId={user.uid} />
        </section>

        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-sm">
            <LayoutGridIcon size={12} className="text-blue-500" />
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
              Active Engine Snippet
            </h3>
          </div>
          <ActiveSnippet userId={user.uid} />
        </section>

        <section className="space-y-8 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-sm">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
              Activity Trends
            </h3>
          </div>
          <HomeCharts userId={user.uid} />
        </section>
      </div>
    </MainContentWrapper>
  );
}
