"use client";

import { useState, useEffect, useRef } from "react";
import { BellIcon, PlusIcon, Trash2Icon, TimerIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { format, differenceInSeconds, isAfter } from "date-fns";

export default function ReminderSection({ userId }: { userId: string }) {
  const supabase = createClient();
  const [reminders, setReminders] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
          playNotification();
          return { ...r, triggered: true };
        }
        return r;
      });
    });
  }

  function playNotification() {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    }
    audioRef.current.play().catch(e => console.log("Audio play failed:", e));
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
    <div className="glass rounded-[32px] border border-white/50 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Quick Reminders</h3>
        <BellIcon size={18} className="text-blue-500" />
      </div>

      <div className="p-6">
        <form onSubmit={addReminder} className="space-y-3 mb-6">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Remind me to..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-200"
          />
          <div className="flex space-x-3">
             <input 
              type="number" 
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="In minutes" 
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-200"
            />
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors text-xs font-bold uppercase tracking-widest">
              Set
            </button>
          </div>
        </form>

        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
          {reminders.map((r) => {
            const now = new Date();
            const remindAt = new Date(r.remind_at);
            const diff = differenceInSeconds(remindAt, now);
            const isOverdue = diff <= 0;

            return (
              <div key={r.id} className={`p-4 rounded-2xl border transition-all ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-white/50 border-transparent hover:border-slate-100'}`}>
                <div className="flex justify-between items-start mb-2">
                   <h4 className={`text-sm font-bold truncate ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>{r.title}</h4>
                   <button onClick={() => deleteReminder(r.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2Icon size={14} />
                   </button>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <TimerIcon size={12} />
                      <span>{isOverdue ? 'Overdue' : `${Math.floor(diff / 60)}m ${diff % 60}s left`}</span>
                   </div>
                   <button 
                    onClick={() => completeReminder(r.id)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                   >
                     Done
                   </button>
                </div>
              </div>
            );
          })}
          {reminders.length === 0 && (
            <p className="text-center text-slate-300 text-xs py-4 italic">No active reminders.</p>
          )}
        </div>
      </div>
    </div>
  );
}
