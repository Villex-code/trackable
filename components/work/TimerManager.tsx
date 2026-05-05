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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {timers.map((timer) => (
          <div
            key={timer.id}
            className={`glass p-6 rounded-[32px] border transition-all duration-500 flex flex-col items-center relative group overflow-hidden ${
              timer.isActive 
                ? 'border-blue-400/50 shadow-2xl shadow-blue-500/10' 
                : timer.isFinished
                ? 'border-red-400 bg-red-50/20 shadow-2xl shadow-red-500/10'
                : 'border-white/50 hover:border-blue-200'
            }`}
          >
            {timer.isFinished && (
               <div className="absolute top-3 left-3 animate-bounce">
                  <BellRingIcon size={16} className="text-red-500" />
               </div>
            )}

            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => deleteTimer(timer.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2Icon size={14} />
              </button>
            </div>

            <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {timer.mode === "up" ? (
                <ClockIcon size={10} className="text-blue-500" />
              ) : (
                <TimerIcon size={10} className="text-purple-500" />
              )}
              <span>{timer.name || "Focus Session"}</span>
            </div>

            <div className={`text-4xl font-black tabular-nums transition-colors duration-500 ${
              timer.isFinished ? 'text-red-600 animate-pulse' : 
              timer.isActive ? 'text-blue-600' : 'text-slate-800'
            }`}>
              {formatTime(timer.seconds)}
            </div>

            {timer.mode === "down" && (
              <div className="w-24 h-1 bg-slate-100 rounded-full mt-4 overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${timer.isFinished ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${(timer.seconds / timer.initialCountdown) * 100}%` }}
                />
              </div>
            )}

            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => toggleTimer(timer.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${
                  timer.isActive
                    ? "bg-slate-900 text-white shadow-slate-900/20"
                    : timer.isFinished
                    ? "bg-red-500 text-white shadow-red-500/20 animate-pulse"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                }`}
              >
                {timer.isActive ? (
                  <SquareIcon size={18} fill="currentColor" />
                ) : (
                  <PlayIcon size={18} fill="currentColor" className="ml-0.5" />
                )}
              </button>

              <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 p-1">
                <button
                  onClick={() => resetTimer(timer.id)}
                  className="w-10 h-10 rounded-xl text-slate-400 flex items-center justify-center hover:bg-white hover:text-slate-600 hover:shadow-sm transition-all"
                  title="Reset"
                >
                  <RotateCcwIcon size={16} />
                </button>

                <button
                  onClick={() => logTimer(timer.id, onLogSession)}
                  className="w-10 h-10 rounded-xl text-emerald-500 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                  title="Log Session"
                >
                  <CheckCircle2Icon size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowAddMenu(true)}
          className="group relative p-8 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50/10 transition-all duration-500 min-h-[200px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white group-hover:rotate-90 group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-500 relative z-10">
            <PlusIcon size={28} />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest relative z-10">Add Timer</span>
        </button>
      </div>

      <PopupTransition open={showAddMenu} setOpen={setShowAddMenu}>
        <div className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl border border-slate-100">
          <PopupLayout
            title="Create Timer"
            description="Configure your new stopwatch or countdown."
            footer={
              <button
                onClick={() => setShowAddMenu(false)}
                className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </button>
            }
          >
            <div className="space-y-4 mb-8">
              <input
                type="text"
                value={newTimerName}
                onChange={(e) => setNewTimerName(e.target.value)}
                placeholder="Timer Name (e.g. Coding)"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-200"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Countdown Duration (mins)
                </label>
                <input
                  type="number"
                  value={newTimerMins}
                  onChange={(e) => setNewTimerMins(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAdd("up")}
                className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
              >
                Stopwatch
              </button>
              <button
                onClick={() => handleAdd("down")}
                className="flex-1 bg-slate-800 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all"
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
