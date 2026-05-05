"use client";

import { useState, useEffect } from "react";
import { PlayIcon, SquareIcon, PlusIcon, Trash2Icon, ClockIcon, TimerIcon, RotateCcwIcon, CheckCircle2Icon } from "lucide-react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";

interface Timer {
  id: string;
  name: string;
  mode: "up" | "down";
  seconds: number;
  initialCountdown: number;
  isActive: boolean;
}

interface TimerManagerProps {
  onLogSession: (duration: number, name?: string) => void;
}

export default function TimerManager({ onLogSession }: TimerManagerProps) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerMins, setNewTimerMins] = useState("25");

  // Timer Tick Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(t => {
        if (!t.isActive) return t;
        
        if (t.mode === "up") {
          return { ...t, seconds: t.seconds + 1 };
        } else {
          if (t.seconds <= 1) {
            return { ...t, seconds: 0, isActive: false };
          }
          return { ...t, seconds: t.seconds - 1 };
        }
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTimer = (mode: "up" | "down") => {
    const id = Math.random().toString(36).substr(2, 9);
    const mins = parseInt(newTimerMins) || 25;
    const newTimer: Timer = {
      id,
      name: newTimerName || (mode === "up" ? "Stopwatch" : "Countdown"),
      mode,
      seconds: mode === "down" ? mins * 60 : 0,
      initialCountdown: mins * 60,
      isActive: false
    };
    setTimers([...timers, newTimer]);
    setNewTimerName("");
    setShowAddMenu(false);
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { 
      ...t, 
      seconds: t.mode === "down" ? t.initialCountdown : 0,
      isActive: false 
    } : t));
  };

  const deleteTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const logTimer = (id: string) => {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;
    
    const duration = timer.mode === "up" ? timer.seconds : timer.initialCountdown - timer.seconds;
    if (duration > 0) {
      onLogSession(duration, timer.name);
    }
    resetTimer(id);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Timer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {timers.map((timer) => (
          <div key={timer.id} className="glass p-6 rounded-[32px] border border-white/50 flex flex-col items-center animate-fade-in relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => deleteTimer(timer.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2Icon size={16} />
               </button>
            </div>
            
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
              {timer.mode === 'up' ? <ClockIcon size={12} /> : <TimerIcon size={12} />}
              <span>{timer.name}</span>
            </div>

            <div className="text-4xl font-bold text-slate-800 tabular-nums mb-6">
              {formatTime(timer.seconds)}
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => toggleTimer(timer.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                  timer.isActive ? "bg-slate-800 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {timer.isActive ? <SquareIcon size={18} fill="currentColor" /> : <PlayIcon size={18} fill="currentColor" className="ml-1" />}
              </button>
              
              <button 
                onClick={() => resetTimer(timer.id)}
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-all"
              >
                <RotateCcwIcon size={18} />
              </button>

              <button 
                onClick={() => logTimer(timer.id)}
                className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-100 transition-all"
                title="Log this session"
              >
                <CheckCircle2Icon size={18} />
              </button>
            </div>
          </div>
        ))}

        {/* Add Timer Card */}
        <button 
          onClick={() => setShowAddMenu(true)}
          className="p-8 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all group min-h-[180px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-all">
            <PlusIcon size={24} />
          </div>
          <span className="font-bold text-sm">New Timer</span>
        </button>
      </div>

      <PopupTransition isOpen={showAddMenu} onClose={() => setShowAddMenu(false)} maxWidth="max-w-sm">
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Countdown Duration (mins)</label>
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
               onClick={() => addTimer("up")}
               className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
             >
               Stopwatch
             </button>
             <button 
               onClick={() => addTimer("down")}
               className="flex-1 bg-slate-800 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all"
             >
               Countdown
             </button>
          </div>
        </PopupLayout>
      </PopupTransition>
    </div>
  );
}
