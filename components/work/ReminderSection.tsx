"use client";

import { useState, useEffect } from "react";
import { BellIcon, Trash2Icon, TimerIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { differenceInSeconds, isAfter } from "date-fns";
import { useAudio } from "@/lib/useAudio";

export default function ReminderSection({ userId }: { userId: string }) {
  const supabase = createClient();
  const [reminders, setReminders] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const { play } = useAudio();

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(() => {
      checkReminders();
    }, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  async function fetchReminders() {
    const { data } = await supabase
      .from("work_reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("remind_at", { ascending: true });
    if (data) setReminders(data);
  }

  async function addReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !minutes) return;
    
    const remindAt = new Date();
    remindAt.setMinutes(remindAt.getMinutes() + parseInt(minutes));

    const { error } = await supabase.from("work_reminders").insert({
      user_id: userId,
      title,
      remind_at: remindAt.toISOString()
    });
    
    if (!error) {
      setTitle("");
      setMinutes("");
      fetchReminders();
    }
  }

  function checkReminders() {
    const now = new Date();
    setReminders(prev => {
      return prev.map(r => {
        const remindAt = new Date(r.remind_at);
        if (!r.triggered && isAfter(now, remindAt)) {
          play();
          return { ...r, triggered: true };
        }
        return r;
      });
    });
  }

  async function completeReminder(id: string) {
    const { error } = await supabase.from("work_reminders").update({ is_completed: true }).eq("id", id);
    if (!error) fetchReminders();
  }

  async function deleteReminder(id: string) {
    const { error } = await supabase.from("work_reminders").delete().eq("id", id);
    if (!error) fetchReminders();
  }

  return (
    <div className="glass rounded-[32px] border border-white/50 overflow-hidden flex flex-col h-[350px]">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/20">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Quick Reminders</h3>
        <BellIcon size={16} className="text-blue-500" />
      </div>

      <div className="p-5 flex-1 flex flex-col min-h-0">
        <form onSubmit={addReminder} className="space-y-2 mb-4">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Remind me to..." 
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-200"
          />
          <div className="flex space-x-2">
             <input 
              type="number" 
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Min" 
              className="w-20 bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-200 text-center"
            />
            <button type="submit" className="flex-1 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-slate-900/10">
              Set Alert
            </button>
          </div>
        </form>

        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
          {reminders.map((r) => {
            const now = new Date();
            const remindAt = new Date(r.remind_at);
            const diff = differenceInSeconds(remindAt, now);
            const isOverdue = diff <= 0;

            return (
              <div key={r.id} className={`p-3 rounded-2xl border transition-all duration-500 ${isOverdue ? 'bg-red-50/50 border-red-200 shadow-lg shadow-red-500/5 animate-pulse' : 'bg-white/30 border-slate-50 hover:border-blue-100'}`}>
                <div className="flex justify-between items-start mb-1">
                   <h4 className={`text-xs font-bold truncate flex-1 ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>{r.title}</h4>
                   <button onClick={() => deleteReminder(r.id)} className="text-slate-300 hover:text-red-500 transition-colors ml-2">
                      <Trash2Icon size={12} />
                   </button>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <TimerIcon size={10} className={isOverdue ? 'text-red-400' : 'text-blue-400'} />
                      <span className={isOverdue ? 'text-red-500' : ''}>
                        {isOverdue ? 'Overdue' : `${Math.floor(diff / 60)}m ${diff % 60}s`}
                      </span>
                   </div>
                   <button 
                    onClick={() => completeReminder(r.id)}
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${isOverdue ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-blue-600 hover:bg-blue-50'}`}
                   >
                     Done
                   </button>
                </div>
              </div>
            );
          })}
          {reminders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 opacity-30 scale-75">
               <BellIcon size={40} className="text-slate-300 mb-2" />
               <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No Alerts Set</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
