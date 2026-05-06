"use client";

import { useState } from "react";
import { 
  PlayIcon, 
  SquareIcon, 
  PlusIcon, 
  Trash2Icon, 
  ClockIcon, 
  TimerIcon, 
  RotateCcwIcon, 
  CheckCircle2Icon,
  BellRingIcon
} from "lucide-react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";
import { useTimers } from "@/lib/TimerContext";

interface TimerManagerProps {
  onLogSession: (duration: number, name?: string) => void;
}

export default function TimerManager({ onLogSession }: TimerManagerProps) {
  const { 
    timers, addTimer, toggleTimer, resetTimer, deleteTimer, logTimer, clearFinishedStatus 
  } = useTimers();
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerMins, setNewTimerMins] = useState("25");

  const handleAdd = (mode: "up" | "down") => {
    addTimer(newTimerName, parseInt(newTimerMins) || 25, mode);
    setNewTimerName("");
    setShowAddMenu(false);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {timers.map((timer) => (
          <div
            key={timer.id}
            className={`group bg-white p-8 rounded-[40px] border transition-all duration-500 flex flex-col items-center relative overflow-hidden ${
              timer.isActive 
                ? 'border-blue-100 shadow-[0_20px_50px_rgba(59,130,246,0.12)] scale-[1.02]' 
                : timer.isFinished
                ? 'border-red-100 bg-red-50/20 shadow-[0_20px_50px_rgba(239,68,68,0.12)]'
                : 'border-slate-50 hover:border-slate-100 shadow-xl shadow-slate-200/20'
            }`}
          >
            {/* Top Indicator */}
            <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] mb-8">
              {timer.mode === "up" ? (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              )}
              <span className="text-slate-400">{timer.name || "Focus Session"}</span>
            </div>

            {/* Time Display */}
            <div className={`text-5xl font-black tabular-nums transition-colors duration-500 mb-2 ${
              timer.isFinished ? 'text-red-600 animate-pulse' : 
              timer.isActive ? 'text-slate-900' : 'text-slate-300'
            }`}>
              {formatTime(timer.seconds)}
            </div>

            {/* Sub-label */}
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-10">
              {timer.mode === "up" ? "Elapsed Time" : "Time Remaining"}
            </p>

            {/* Controls */}
            <div className="flex items-center space-x-4 w-full">
               <button
                 onClick={() => toggleTimer(timer.id)}
                 className={`flex-1 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                   timer.isActive
                     ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                     : timer.isFinished
                     ? "bg-red-500 text-white shadow-xl shadow-red-500/20 animate-pulse"
                     : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                 }`}
               >
                 {timer.isActive ? (
                   <SquareIcon size={18} fill="currentColor" />
                 ) : (
                   <div className="flex items-center space-x-2">
                     <PlayIcon size={16} fill="currentColor" className="ml-0.5" />
                     <span className="text-xs font-black uppercase tracking-widest">Start</span>
                   </div>
                 )}
               </button>

               <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl">
                 <button
                   onClick={() => resetTimer(timer.id)}
                   className="w-11 h-11 rounded-xl text-slate-400 flex items-center justify-center hover:bg-white hover:text-slate-600 hover:shadow-sm transition-all"
                   title="Reset"
                 >
                   <RotateCcwIcon size={18} />
                 </button>
                 <button
                   onClick={() => logTimer(timer.id, onLogSession)}
                   className="w-11 h-11 rounded-xl text-emerald-500 flex items-center justify-center hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all"
                   title="Complete & Log"
                 >
                   <CheckCircle2Icon size={18} />
                 </button>
               </div>
            </div>

            {/* Trash Icon - Subtle */}
            <button
              onClick={() => deleteTimer(timer.id)}
              className="absolute top-4 right-4 p-2 text-slate-100 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2Icon size={14} />
            </button>
          </div>
        ))}

        {/* Add Timer Button - Minimalist */}
        <button
          onClick={() => setShowAddMenu(true)}
          className="group relative p-8 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:bg-blue-50/5 transition-all duration-500 min-h-[250px]"
        >
          <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-blue-500/20">
            <PlusIcon size={28} />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">Add New Timer</span>
        </button>
      </div>

      {/* Popups remain standard but styled consistently */}
      <PopupTransition open={showAddMenu} setOpen={setShowAddMenu}>
        <div className="relative w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100">
          <PopupLayout
            title="Create Timer"
            description="Configure your next session."
            footer={
              <button
                onClick={() => setShowAddMenu(false)}
                className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            }
          >
            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label</p>
                <input
                  type="text"
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  placeholder="e.g. Design Sprint"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal (Minutes)</p>
                <input
                  type="number"
                  value={newTimerMins}
                  onChange={(e) => setNewTimerMins(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAdd("up")}
                className="bg-blue-600 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                Stopwatch
              </button>
              <button
                onClick={() => handleAdd("down")}
                className="bg-slate-900 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg"
              >
                Countdown
              </button>
            </div>
          </PopupLayout>
        </div>
      </PopupTransition>
    </div>
  );
}
