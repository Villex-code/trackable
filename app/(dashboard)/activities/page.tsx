"use client";

import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { 
  ZapIcon, 
  CheckCircle2Icon, 
  BellIcon, 
  ClockIcon,
  LayoutGridIcon,
  SparklesIcon,
  TargetIcon,
  ShareIcon
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
    <div className="space-y-10 pb-20 max-w-[1400px] mx-auto animate-fade-in px-4 lg:px-0">
      
      {/* Standardized Page Header (Consistent with Diet/Financials) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Active Engine</h2>
          <div className="flex items-center space-x-3">
             <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Optimized</span>
             </div>
             <p className="text-slate-400 font-medium text-sm">Command center for focus and execution.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
             title="Bulk Import (Cmd+V)"
           >
             <ShareIcon size={18} className="rotate-180" />
           </button>
           <button className="flex items-center space-x-2 bg-brand-orange-500 text-white px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-xl shadow-brand-orange-500/20 active:scale-95">
             <LayoutGridIcon size={18} />
             <span>View All Logs</span>
           </button>
        </div>
      </div>

      {/* Execution Grid (Reminders & Todos) - Optimized Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 px-2">
               <BellIcon size={16} className="text-blue-500" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Alert Center</h3>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-[40px] border border-white/50 shadow-xl shadow-slate-200/20 overflow-hidden">
               <ReminderSection userId={user.uid} />
            </div>
         </div>

         <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 px-2">
               <CheckCircle2Icon size={16} className="text-emerald-500" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Execution List</h3>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-[40px] border border-white/50 shadow-xl shadow-slate-200/20 overflow-hidden">
               <TodoSection userId={user.uid} />
            </div>
         </div>
      </div>

      {/* Focus Hub (Bottom Full Width) */}
      <div className="space-y-4 pt-4">
         <div className="flex items-center space-x-3 px-2">
            <ClockIcon size={16} className="text-brand-orange-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Focus Hub</h3>
         </div>
         <div className="bg-white/60 backdrop-blur-md p-1 rounded-[56px] border border-white/50 shadow-2xl shadow-slate-200/20 overflow-hidden">
            <div className="bg-white/40 backdrop-blur-2xl rounded-[52px] p-8 lg:p-12">
               <TimerManager onLogSession={handleLogSession} />
            </div>
         </div>
      </div>

      {/* Background Graphic */}
      <div className="fixed top-0 right-0 -z-10 opacity-5 pointer-events-none">
         <img src="/graphics/pattern.png" alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
