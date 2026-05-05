"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ReferenceLine, ComposedChart, Line
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export default function HomeCharts({ userId }: { userId: string }) {
  const [dietData, setDietData] = useState<any[]>([]);
  const [workData, setWorkData] = useState<any[]>([]);
  const [baseGoal, setBaseGoal] = useState(2000);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
      
      // Fetch Diet Logs
      const { data: dietLogs } = await supabase
        .from("calorie_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("logged_at", sevenDaysAgo.toISOString());

      // Fetch Goal
      const { data: goalData } = await supabase
        .from("diet_goals")
        .select("daily_target")
        .eq("user_id", userId)
        .single();
      
      if (goalData) setBaseGoal(goalData.daily_target);

      // Fetch Work Sessions
      const { data: workLogs } = await supabase
        .from("work_sessions")
        .select("*")
        .eq("user_id", userId)
        .gte("logged_at", sevenDaysAgo.toISOString());

      // Process Diet Data
      const dietMap = new Map();
      for (let i = 0; i <= 7; i++) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "MMM dd");
        dietMap.set(dateStr, { name: dateStr, intake: 0, activity: 0, totalLimit: baseGoal });
      }

      dietLogs?.forEach(log => {
        const dateStr = format(new Date(log.logged_at), "MMM dd");
        if (dietMap.has(dateStr)) {
          const entry = dietMap.get(dateStr);
          if (log.type === "input") entry.intake += log.amount;
          else entry.activity += log.amount;
        }
      });

      // Update totalLimit after processing activities
      const processedDiet = Array.from(dietMap.values()).map(item => ({
        ...item,
        totalLimit: baseGoal + item.activity
      })).reverse();

      setDietData(processedDiet);

      // Process Work Data
      const workMap = new Map();
      for (let i = 0; i <= 7; i++) {
        const dateStr = format(subDays(new Date(), i), "MMM dd");
        workMap.set(dateStr, { name: dateStr, duration: 0 });
      }

      workLogs?.forEach(log => {
        const dateStr = format(new Date(log.logged_at), "MMM dd");
        if (workMap.has(dateStr)) {
          const entry = workMap.get(dateStr);
          entry.duration += Math.floor(log.duration / 60);
        }
      });

      setWorkData(Array.from(workMap.values()).reverse());
    }

    if (userId) fetchData();
  }, [userId, baseGoal, supabase]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Diet Chart */}
      <div className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white/50 shadow-xl shadow-slate-200/10 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Nutrition vs Limit</h3>
          <div className="flex items-center space-x-4 text-[9px] font-black uppercase tracking-widest">
            <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-orange-500"></div><span>Intake</span></div>
            <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div><span>Activity</span></div>
            <div className="flex items-center space-x-1.5"><div className="w-3 h-0.5 bg-slate-400 border-t border-dashed"></div><span>Base Goal</span></div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dietData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <ReferenceLine y={baseGoal} stroke="#94a3b8" strokeDasharray="5 5" label={{ position: 'right', value: 'Base', fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
              <Bar dataKey="intake" fill="#f97316" radius={[6, 6, 0, 0]} barSize={20} />
              <Bar dataKey="activity" fill="#60a5fa" radius={[6, 6, 0, 0]} barSize={20} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Work Chart */}
      <div className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white/50 shadow-xl shadow-slate-200/10 space-y-8">
        <h3 className="text-xl font-bold text-slate-800">Focus Performance (mins)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={workData}>
              <defs>
                <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
              />
              <Area type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorDur)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
