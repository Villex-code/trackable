"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { 
  PlusIcon, 
  TimerIcon,
  TrendingUpIcon,
  HistoryIcon,
  PlusCircleIcon
} from "lucide-react";

// Components
import TimerManager from "@/components/work/TimerManager";
import SessionModal from "@/components/work/SessionModal";
import ManualLogModal from "@/components/work/ManualLogModal";
import SessionLogItem from "@/components/work/SessionLogItem";
import TodoSection from "@/components/work/TodoSection";
import ReminderSection from "@/components/work/ReminderSection";

export default function WorkPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [lastDuration, setLastDuration] = useState(0);
  const [lastTimerName, setLastTimerName] = useState("");

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  async function fetchSessions() {
    setLoading(true);
    const { data } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("user_id", user?.uid)
      .order("logged_at", { ascending: false });

    if (data) setSessions(data);
    setLoading(false);
  }

  const handleTimerLog = (duration: number, name?: string) => {
    setLastDuration(duration);
    setLastTimerName(name || "");
    setIsSessionModalOpen(true);
  };

  const handleSaveSession = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from("work_sessions").insert({
      ...data,
      user_id: user.uid,
      comment: lastTimerName ? `[${lastTimerName}] ${data.comment || ""}` : data.comment
    });
    if (!error) {
      setIsSessionModalOpen(false);
      setIsManualModalOpen(false);
      fetchSessions();
    }
  };

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from("work_sessions").delete().eq("id", id);
    if (!error) fetchSessions();
  };

  const totalWorkTime = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalMins = Math.floor(totalWorkTime / 60);

  if (!user) return null;

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Work Tracker</h2>
          <p className="text-slate-400 font-medium mt-2">Manage focus timers, tasks, and stay on schedule.</p>
        </div>
        
        <div className="flex items-center space-x-6">
           <button 
             onClick={() => setIsManualModalOpen(true)}
             className="flex items-center space-x-2 bg-white border border-slate-100 p-4 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
           >
              <PlusCircleIcon size={20} className="text-blue-500" />
              <span>Force Log</span>
           </button>
           <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1">Total Focus Time</p>
              <p className="text-2xl font-bold text-slate-800">{Math.floor(totalMins / 60)}h {totalMins % 60}m</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <TrendingUpIcon size={24} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
        {/* Left Column: Timer & Utilities */}
        <div className="xl:col-span-2 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-slate-800">
                <TimerIcon size={20} className="text-blue-500" />
                <h3 className="text-xl font-bold">Focus Timers</h3>
              </div>
            </div>
            <TimerManager onLogSession={handleTimerLog} />
          </section>

          <section className="grid grid-cols-1 gap-8">
             <TodoSection userId={user.uid} />
             <ReminderSection userId={user.uid} />
          </section>
        </div>

        {/* Right Column: History */}
        <div className="xl:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-slate-800">
              <HistoryIcon size={20} className="text-purple-500" />
              <h3 className="text-xl font-bold">Session History</h3>
            </div>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              View Analytics
            </button>
          </div>

          <div className="space-y-4">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <SessionLogItem 
                  key={session.id} 
                  session={session} 
                  onDelete={deleteSession} 
                />
              ))
            ) : (
              <div className="glass rounded-[40px] border border-white/50 py-20 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                    <HistoryIcon size={40} />
                 </div>
                 <h4 className="text-lg font-bold text-slate-800">No sessions yet</h4>
                 <p className="text-slate-400 max-w-xs mt-2">Start a timer or use "Force Log" to add your first work block.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timer Log Modal */}
      <SessionModal 
        isOpen={isSessionModalOpen} 
        duration={lastDuration} 
        onSave={handleSaveSession} 
        onCancel={() => setIsSessionModalOpen(false)} 
      />

      {/* Manual Force Log Modal */}
      <ManualLogModal 
        isOpen={isManualModalOpen} 
        onSave={handleSaveSession} 
        onCancel={() => setIsManualModalOpen(false)} 
      />
    </div>
  );
}
