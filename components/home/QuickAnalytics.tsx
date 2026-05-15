"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { TimerIcon, ZapIcon, PlusIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import AddLogModal from "@/components/diet/AddLogModal";

interface AnalyticsData {
  totalInput: number;
  totalOutput: number;
  baseGoal: number;
  workSessions: number;
  avgSessionMins: number;
  totalProtein: number;
}

export default function QuickAnalytics({ userId }: { userId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"input" | "output">("input");
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const { data: dietData } = await supabase
      .from("calorie_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", today.toISOString())
      .lt("logged_at", tomorrow.toISOString());

    const { data: goalData } = await supabase
      .from("diet_goals")
      .select("daily_target")
      .eq("user_id", userId)
      .single();

    const inputLogs = dietData ? dietData.filter(l => l.type === "input") : [];
    const totalInput = inputLogs.reduce((acc, l) => acc + l.amount, 0);
    const totalOutput = dietData ? dietData.filter(l => l.type === "output").reduce((acc, l) => acc + l.amount, 0) : 0;
    const totalProtein = inputLogs.reduce((acc, l) => acc + (l.protein ?? 0), 0);
    const baseGoal = goalData?.daily_target || 2000;

    const { data: workData } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("user_id", userId);

    const sessionsToday = workData ? workData.filter(s => new Date(s.logged_at) >= today).length : 0;
    const totalDurationSecs = workData ? workData.reduce((acc, s) => acc + s.duration, 0) : 0;
    const avgSessionMins = workData && workData.length > 0 ? Math.floor((totalDurationSecs / workData.length) / 60) : 0;

    setData({ totalInput, totalOutput, baseGoal, workSessions: sessionsToday, avgSessionMins, totalProtein });
  }, [userId, supabase]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  const handleAddLog = async (amount: number, type: "input" | "output", description: string, protein?: number) => {
    await supabase.from("calorie_logs").insert({
      user_id: userId,
      amount,
      type,
      description,
      protein,
      logged_at: new Date().toISOString(),
    });
    setIsAddModalOpen(false);
    fetchData();
  };

  const openModal = (type: "input" | "output") => {
    setModalType(type);
    setIsAddModalOpen(true);
  };

  if (!data) return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-36 bg-white/50 rounded-[32px]" />)}
    </div>
  );

  const currentLimit = data.baseGoal + data.totalOutput;
  const progressPercent = Math.min((data.totalInput / currentLimit) * 100, 100);

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Daily Fuel */}
        <div className="bg-white/85 backdrop-blur-md p-6 rounded-[32px] border border-brand-orange-100/30 shadow-lg shadow-brand-orange-50/20">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">Daily Fuel</p>
              <h4 className="text-xl font-black text-slate-800">
                {data.totalInput}
                <span className="text-slate-400 font-medium text-sm ml-1">/ {currentLimit} kcal</span>
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openModal("output")}
                title="Log activity"
                className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center hover:bg-blue-100 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </button>
              <button
                onClick={() => openModal("input")}
                title="Log meal"
                className="w-8 h-8 rounded-xl bg-brand-orange-500 text-white flex items-center justify-center hover:bg-brand-orange-600 transition-all shadow-md shadow-brand-orange-200"
              >
                <PlusIcon size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${data.totalInput > currentLimit ? "bg-red-500" : "bg-brand-orange-500"}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Base: {data.baseGoal}</span>
              <span className="text-blue-500">Activity: +{data.totalOutput}</span>
            </div>
          </div>
        </div>

        {/* Focus Today */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-brand-orange-100/30 shadow-lg shadow-brand-orange-50/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shrink-0">
              <TimerIcon size={26} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">Focus Today</p>
              <p className="text-xl font-black text-slate-800">
                {data.workSessions} <span className="text-slate-400 font-medium text-sm">Sessions</span>
              </p>
              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                Avg: {data.avgSessionMins} min/block
              </p>
            </div>
          </div>
          <Link
            href="/activities"
            className="w-8 h-8 rounded-xl bg-blue-50 text-blue-400 border border-blue-100 flex items-center justify-center hover:bg-blue-100 transition-all shrink-0"
          >
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        {/* Protein Today */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-brand-orange-100/30 shadow-lg shadow-brand-orange-50/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shrink-0">
              <ZapIcon size={26} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">Protein Today</p>
              <p className="text-xl font-black text-slate-800">
                {data.totalProtein}
                <span className="text-slate-400 font-medium text-sm ml-1">g</span>
              </p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                From today&apos;s meals
              </p>
            </div>
          </div>
          <Link
            href="/diet"
            className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-400 border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 transition-all shrink-0"
          >
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>

      <AddLogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddLog}
        initialType={modalType}
        currentGoal={data.baseGoal}
        currentNet={data.totalInput - data.totalOutput}
      />
    </>
  );
}
