"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTimers } from "@/lib/TimerContext";
import { 
  ZapIcon, 
  CheckCircle2Icon, 
  BellIcon, 
  ClockIcon,
  PlayIcon,
  SquareIcon,
  BellRingIcon
} from "lucide-react";

export default function ActiveSnippet({ userId }: { userId: string }) {
  const supabase = createClient();
  const { timers, toggleTimer, hasFinishedTimers } = useTimers();
  const [todos, setTodos] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch incomplete todos
      const { data: todoData } = await supabase
        .from("work_todos")
        .select("*")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .limit(3);

      // Fetch upcoming reminders
      const { data: reminderData } = await supabase
        .from("work_reminders")
        .select("*")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .gte("remind_at", new Date().toISOString())
        .order("remind_at", { ascending: true })
        .limit(2);

      if (todoData) setTodos(todoData);
      if (reminderData) setReminders(reminderData);
    }

    if (userId) fetchData();
  }, [userId, supabase]);

  const activeTimers = timers.filter(t => t.isActive || t.isFinished);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Active Timers Column */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 px-2">
          <ClockIcon size={16} className="text-blue-500" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Active Clocks</h4>
        </div>
        <div className="space-y-3">
          {activeTimers.length > 0 ? (
            activeTimers.map(t => (
              <div key={t.id} className={`p-5 rounded-[24px] border flex items-center justify-between transition-all ${t.isFinished ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center space-x-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.isFinished ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-blue-50 text-blue-500'}`}>
                      {t.isFinished ? <BellRingIcon size={20} /> : <ClockIcon size={20} />}
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.name}</p>
                      <p className={`text-xl font-black tabular-nums ${t.isFinished ? 'text-red-600' : 'text-slate-800'}`}>
                        {Math.floor(t.seconds / 60)}:{(t.seconds % 60).toString().padStart(2, "0")}
                      </p>
                   </div>
                </div>
                <button 
                  onClick={() => toggleTimer(t.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${t.isActive ? 'bg-slate-900 text-white' : 'bg-blue-500 text-white'}`}
                >
                  {t.isActive ? <SquareIcon size={16} fill="currentColor" /> : <PlayIcon size={16} fill="currentColor" className="ml-0.5" />}
                </button>
              </div>
            ))
          ) : (
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[24px] p-8 text-center">
              <p className="text-xs font-bold text-slate-400">No active timers</p>
            </div>
          )}
        </div>
      </div>

      {/* Reminders Column */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 px-2">
          <BellIcon size={16} className="text-purple-500" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Upcoming Alerts</h4>
        </div>
        <div className="space-y-3">
          {reminders.length > 0 ? (
            reminders.map(r => (
              <div key={r.id} className="p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm flex items-center space-x-4">
                 <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                    <BellIcon size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{r.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {new Date(r.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                 </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[24px] p-8 text-center">
              <p className="text-xs font-bold text-slate-400">Quiet for now</p>
            </div>
          )}
        </div>
      </div>

      {/* Todo Column */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 px-2">
          <CheckCircle2Icon size={16} className="text-emerald-500" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Top Priorities</h4>
        </div>
        <div className="space-y-3">
          {todos.length > 0 ? (
            todos.map(t => (
              <div key={t.id} className="p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm flex items-center space-x-4">
                 <div className="w-6 h-6 rounded-lg border-2 border-slate-100" />
                 <p className="text-sm font-bold text-slate-700 truncate">{t.task}</p>
              </div>
            ))
          ) : (
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[24px] p-8 text-center">
              <p className="text-xs font-bold text-slate-400">All tasks cleared!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
