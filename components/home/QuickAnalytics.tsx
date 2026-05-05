"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { FlameIcon, TimerIcon, WalletIcon, TrendingUpIcon, TrendingDownIcon, UtensilsIcon } from "lucide-react";

interface AnalyticsData {
  totalInput: number;
  totalOutput: number;
  baseGoal: number;
  workSessions: number;
  avgSessionMins: number;
  monthlySpending: number;
}

export default function QuickAnalytics({ userId }: { userId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Diet Data
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

      const totalInput = dietData ? dietData.filter(l => l.type === 'input').reduce((acc, l) => acc + l.amount, 0) : 0;
      const totalOutput = dietData ? dietData.filter(l => l.type === 'output').reduce((acc, l) => acc + l.amount, 0) : 0;
      const baseGoal = goalData?.daily_target || 2000;

      // Work Data
      const { data: workData } = await supabase
        .from("work_sessions")
        .select("*")
        .eq("user_id", userId);

      const sessionsToday = workData ? workData.filter(s => new Date(s.logged_at) >= today).length : 0;
      const totalDurationSecs = workData ? workData.reduce((acc, s) => acc + s.duration, 0) : 0;
      const avgSessionMins = workData && workData.length > 0 ? Math.floor((totalDurationSecs / workData.length) / 60) : 0;

      // Financials
      const { data: financeData } = await supabase
        .from("financial_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "expense")
        .gte("logged_at", firstOfMonth.toISOString());

      const monthlySpending = financeData ? financeData.reduce((acc, f) => acc + f.amount, 0) : 0;

      setData({ 
        totalInput, 
        totalOutput, 
        baseGoal, 
        workSessions: sessionsToday, 
        avgSessionMins, 
        monthlySpending 
      });
    }

    if (userId) fetchData();
  }, [userId, supabase]);

  if (!data) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    {[1,2,3].map(i => <div key={i} className="h-32 bg-white/50 rounded-[32px]"></div>)}
  </div>;

  const currentLimit = data.baseGoal + data.totalOutput;
  const progressPercent = Math.min((data.totalInput / currentLimit) * 100, 100);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* Diet Progress Section */}
      <div className="xl:col-span-1 bg-white/60 backdrop-blur-md p-8 rounded-[40px] border border-white/50 shadow-xl shadow-slate-200/20">
         <div className="flex items-center justify-between mb-6">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Daily Fuel</p>
               <h4 className="text-xl font-bold text-slate-800">{data.totalInput} <span className="text-slate-400 font-medium">/ {currentLimit} kcal</span></h4>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-orange-500 text-white flex items-center justify-center shadow-lg shadow-brand-orange-500/20">
               <UtensilsIcon size={20} />
            </div>
         </div>

         {/* Progress Bar */}
         <div className="space-y-3">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
               <div 
                  className={`h-full rounded-full transition-all duration-1000 ${data.totalInput > currentLimit ? 'bg-red-500' : 'bg-brand-orange-500'}`}
                  style={{ width: `${progressPercent}%` }}
               />
            </div>
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
               <span className="text-slate-400">Base: {data.baseGoal}</span>
               <span className="text-blue-500">Activity: +{data.totalOutput}</span>
            </div>
         </div>
      </div>

      {/* Work Snapshot */}
      <div className="bg-white/60 backdrop-blur-md p-8 rounded-[40px] border border-white/50 shadow-xl shadow-slate-200/20 flex items-center space-x-6">
        <div className="w-16 h-16 rounded-[24px] bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shadow-sm">
          <TimerIcon size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Focus Today</p>
          <p className="text-2xl font-bold text-slate-800">{data.workSessions} <span className="text-slate-400 font-medium text-lg">Sessions</span></p>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Avg: {data.avgSessionMins} min/block</p>
        </div>
      </div>

      {/* Finance Snapshot */}
      <div className="bg-white/60 backdrop-blur-md p-8 rounded-[40px] border border-white/50 shadow-xl shadow-slate-200/20 flex items-center space-x-6">
        <div className="w-16 h-16 rounded-[24px] bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-100 shadow-sm">
          <WalletIcon size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Monthly Spending</p>
          <p className="text-2xl font-bold text-slate-800">${data.monthlySpending.toLocaleString()}</p>
          <div className="flex items-center space-x-1 mt-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
             <TrendingUpIcon size={12} />
             <span>Budget Optimal</span>
          </div>
        </div>
      </div>

    </div>
  );
}
