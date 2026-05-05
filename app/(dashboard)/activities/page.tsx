"use client";

import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { 
  ZapIcon, 
  CheckCircle2Icon, 
  BellIcon, 
  ClockIcon,
  LayoutGridIcon
} from "lucide-react";

// Components
import TimerManager from "@/components/work/TimerManager";
import TodoSection from "@/components/work/TodoSection";
import ReminderSection from "@/components/work/ReminderSection";

export default function ActivitiesPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const handleLogSession = async (duration: number, name?: string) => {
    if (!user) return;
    const { error } = await supabase.from("work_sessions").insert({
      user_id: user.uid,
      duration,
      comment: name ? `[Timer] ${name}` : "[Timer] Active Session",
      logged_at: new Date().toISOString()
    });
    
    if (error) {
      console.error("Failed to log timer session:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-12 pb-20 max-w-[1400px] mx-auto animate-fade-in px-4 lg:px-0">
      {/* Consistent Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange-500 text-white flex items-center justify-center shadow-xl shadow-brand-orange-500/20">
               <ZapIcon size={24} />
            </div>
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Active Engine</h2>
          </div>
          <p className="text-slate-400 font-medium ml-1">Your command center for real-time focus, upcoming reminders, and active tasks.</p>
        </div>

        <div className="flex items-center space-x-6 bg-white/50 p-4 rounded-3xl border border-slate-100 backdrop-blur-sm">
           <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1">System Status</p>
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Optimized & Active</span>
              </div>
           </div>
           <div className="w-px h-10 bg-slate-100" />
           <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-500">
                 <ClockIcon size={14} />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-purple-500">
                 <BellIcon size={14} />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-500">
                 <CheckCircle2Icon size={14} />
              </div>
           </div>
        </div>
      </div>

      {/* Top Section: Focus Hub (Full Width Horizontal) */}
      <div className="space-y-6">
         <div className="flex items-center space-x-3 px-4">
            <ClockIcon size={18} className="text-brand-orange-500" />
            <h3 className="text-lg font-black uppercase tracking-widest text-slate-800">Focus Hub</h3>
         </div>
         
         <div className="glass-white p-2 rounded-[48px] border border-white/60 shadow-2xl shadow-slate-200/20">
            <div className="bg-white/40 backdrop-blur-xl rounded-[42px] p-8">
              <TimerManager onLogSession={handleLogSession} />
            </div>
         </div>
      </div>

      {/* Bottom Section: 2 Columns Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Column 1: Reminders */}
         <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
               <div className="flex items-center space-x-3">
                  <BellIcon size={18} className="text-blue-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Alert Center</h3>
               </div>
            </div>
            <div className="glass rounded-[40px] border border-white/50 overflow-hidden min-h-[400px]">
              <ReminderSection userId={user.uid} />
            </div>
         </div>

         {/* Column 2: Todos */}
         <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
               <div className="flex items-center space-x-3">
                  <CheckCircle2Icon size={18} className="text-emerald-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Execution List</h3>
               </div>
            </div>
            <div className="glass rounded-[40px] border border-white/50 overflow-hidden min-h-[400px]">
              <TodoSection userId={user.uid} />
            </div>
         </div>

      </div>

      {/* Decorative Graphics */}
      <div className="fixed bottom-0 right-0 -z-10 opacity-10 pointer-events-none">
         <div className="w-[600px] h-[600px] bg-gradient-to-tl from-brand-orange-200 to-transparent rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
}
