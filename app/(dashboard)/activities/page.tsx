"use client";

import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
  CheckCircle2Icon,
  BellIcon,
  ClockIcon,
  LayoutGridIcon,
  ShareIcon,
} from "lucide-react";
import MainContentWrapper from "@/components/MainContentWrapper";
import TimerManager from "@/components/work/TimerManager";
import TodoSection from "@/components/work/TodoSection";
import ReminderSection from "@/components/work/ReminderSection";

export default function ActivitiesPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const handleLogSession = async (duration: number, name?: string) => {
    if (!user) return;
    await supabase.from("work_sessions").insert({
      user_id: user.uid,
      duration,
      comment: name ? `[Timer] ${name}` : "[Timer] Active Session",
      logged_at: new Date().toISOString(),
    });
  };

  if (!user) return null;

  return (
    <MainContentWrapper
      topbarBody={
        <div className="flex items-center justify-between flex-1 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <h2 className="text-[15px] font-black text-slate-800 tracking-tight shrink-0">
              Active Engine
            </h2>
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                System Optimized
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 ml-4 shrink-0">
            <button
              className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              title="Bulk Import"
            >
              <ShareIcon size={15} className="rotate-180" />
            </button>
            <button className="hidden sm:flex items-center gap-2 bg-brand-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange-200">
              <LayoutGridIcon size={14} />
              <span>View All Logs</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-10 pb-24 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 px-1">
              <BellIcon size={14} className="text-blue-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Alert Center
              </h3>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-[32px] border border-brand-orange-100/30 shadow-lg shadow-brand-orange-50/30 overflow-hidden">
              <ReminderSection userId={user.uid} />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 px-1">
              <CheckCircle2Icon size={14} className="text-emerald-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Execution List
              </h3>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-[32px] border border-brand-orange-100/30 shadow-lg shadow-brand-orange-50/30 overflow-hidden">
              <TodoSection userId={user.uid} />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-3 px-1">
            <ClockIcon size={14} className="text-brand-orange-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Focus Hub
            </h3>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-1 rounded-[48px] border border-brand-orange-100/30 shadow-xl shadow-brand-orange-50/40 overflow-hidden">
            <div className="bg-white/50 backdrop-blur-2xl rounded-[44px] p-8 lg:p-12">
              <TimerManager onLogSession={handleLogSession} />
            </div>
          </div>
        </div>
      </div>
    </MainContentWrapper>
  );
}
