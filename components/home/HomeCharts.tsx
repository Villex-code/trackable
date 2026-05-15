"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export default function HomeCharts({ userId }: { userId: string }) {
  const [calorieData, setCalorieData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [baseGoal, setBaseGoal] = useState(2000);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const sevenDaysAgo = startOfDay(subDays(new Date(), 6));

      // Calorie logs (last 7 days)
      const [{ data: dietLogs }, { data: goalData }, { data: weightLogs }] = await Promise.all([
        supabase.from("calorie_logs").select("*").eq("user_id", userId).gte("logged_at", sevenDaysAgo.toISOString()),
        supabase.from("diet_goals").select("daily_target").eq("user_id", userId).single(),
        supabase.from("weight_logs").select("*").eq("user_id", userId).order("logged_at", { ascending: true }),
      ]);

      const goal = goalData?.daily_target || 2000;
      setBaseGoal(goal);

      // Build 7-day calorie map
      const dayMap = new Map<string, { name: string; calories: number }>();
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        dayMap.set(format(d, "MMM d"), { name: format(d, "MMM d"), calories: 0 });
      }
      dietLogs?.forEach(log => {
        if (log.type !== "input") return;
        const key = format(new Date(log.logged_at), "MMM d");
        if (dayMap.has(key)) dayMap.get(key)!.calories += log.amount;
      });
      setCalorieData(Array.from(dayMap.values()));

      // Weight data — deduplicate to one entry per day (latest reading)
      if (weightLogs && weightLogs.length > 0) {
        const wMap = new Map<string, { name: string; weight: number }>();
        weightLogs.forEach(log => {
          const key = format(new Date(log.logged_at), "MMM d");
          wMap.set(key, { name: key, weight: Number(log.weight) });
        });
        setWeightData(Array.from(wMap.values()));
      }
    }

    if (userId) fetchData();
  }, [userId]);

  const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100 text-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="font-black text-slate-800">{payload[0].value} {unit}</p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Calorie line chart */}
      <div className="bg-white/85 backdrop-blur-md p-7 rounded-[32px] border border-brand-orange-100/30 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800">Calorie Intake</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Last 7 days</p>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-orange-500" />
              <span className="text-slate-400">Intake</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0 border-t-2 border-dashed border-slate-300" />
              <span className="text-slate-400">Goal</span>
            </div>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calorieData} margin={{ top: 5, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="calorieGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} width={40} />
              <Tooltip content={<CustomTooltip unit="kcal" />} cursor={{ stroke: "#f97316", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <ReferenceLine y={baseGoal} stroke="#cbd5e1" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="url(#calorieGlow)"
                strokeWidth={3}
                dot={{ fill: "#f97316", strokeWidth: 0, r: 4 }}
                activeDot={{ fill: "#ea580c", r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight line chart */}
      <div className="bg-white/85 backdrop-blur-md p-7 rounded-[32px] border border-brand-orange-100/30 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800">Body Weight</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">All entries</p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-slate-400">kg</span>
          </div>
        </div>
        {weightData.length > 0 ? (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 5, right: 8, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="weightGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={8} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  width={40}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<CustomTooltip unit="kg" />} cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="url(#weightGlow)"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 4 }}
                  activeDot={{ fill: "#7c3aed", r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <p className="text-sm font-bold text-slate-500">No weight data yet</p>
            <p className="text-xs mt-1 text-slate-400">Log your weight in the Diet tracker</p>
          </div>
        )}
      </div>
    </div>
  );
}
