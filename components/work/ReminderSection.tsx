"use client";

import { useState, useEffect } from "react";
import { BellIcon, Trash2Icon, TimerIcon, PlusIcon } from "lucide-react";
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
    <div className="flex flex-col h-full bg-white/40 p-6">
      {/* Minimal Input Bar */}
      <form onSubmit={addReminder} className="space-y-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick alert..." 
              className="w-full bg-white/80 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 transition-all shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <input 
                type="number" 
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="Min" 
                className="w-12 bg-transparent border-none text-center text-xs font-bold text-blue-500 focus:ring-0 placeholder:text-slate-300"
              />
            </div>
          </div>
          <button type="submit" className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-90">
            <PlusIcon size={20} />
          </button>
        </div>

        {/* Quick Minute Buttons */}
        <div className="flex items-center gap-2 px-1">
          {[1, 3, 5, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setMinutes(num.toString())}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                minutes === num.toString() 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20' 
                  : 'bg-white/50 text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-500'
              }`}
            >
              +{num}M
            </button>
          ))}
          <div className="flex-1" />
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Select Interval</p>
        </div>
      </form>

      {/* List Area */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 min-h-0">
        {reminders.map((r) => {
          const now = new Date();
          const remindAt = new Date(r.remind_at);
          const diff = differenceInSeconds(remindAt, now);
          const isOverdue = diff <= 0;

          return (
            <div key={r.id} className={`group p-4 rounded-3xl border transition-all duration-300 ${isOverdue ? 'bg-red-50 border-red-100 shadow-lg shadow-red-500/5' : 'bg-white border-slate-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-blue-50 text-blue-500'}`}>
                    <BellIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold truncate ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>{r.title}</h4>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                       <TimerIcon size={12} className={isOverdue ? 'text-red-400' : 'text-slate-300'} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                         {isOverdue ? 'Overdue' : `${Math.floor(diff / 60)}m ${diff % 60}s`}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                   <button 
                    onClick={() => completeReminder(r.id)}
                    className={`h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isOverdue ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white'}`}
                   >
                     Done
                   </button>
                   <button onClick={() => deleteReminder(r.id)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2Icon size={14} />
                   </button>
                </div>
              </div>
            </div>
          );
        })}
        {reminders.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4 border border-slate-100/50">
               <BellIcon size={24} />
             </div>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Silence is golden</p>
          </div>
        )}
      </div>
    </div>
  );
}
