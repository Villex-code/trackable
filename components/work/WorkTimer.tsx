"use client";

import { useState, useEffect, useRef } from "react";
import { PlayIcon, SquareIcon, TimerIcon, RotateCcwIcon, ClockIcon } from "lucide-react";

interface WorkTimerProps {
  onStop: (seconds: number) => void;
}

export default function WorkTimer({ onStop }: WorkTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"up" | "down">("up");
  const [initialCountdown, setInitialCountdown] = useState(25 * 60); // Default 25 mins
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (mode === "up") {
          setSeconds(s => s + 1);
        } else {
          setSeconds(s => {
            if (s <= 1) {
              handleStop();
              return 0;
            }
            return s - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const handleStart = () => {
    if (mode === "down" && seconds === 0) {
      setSeconds(initialCountdown);
    }
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
    const duration = mode === "up" ? seconds : initialCountdown - seconds;
    if (duration > 0) {
      onStop(duration);
    }
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass p-10 rounded-[40px] border border-white/50 flex flex-col items-center">
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-12">
        <button 
          onClick={() => { setMode("up"); setSeconds(0); setIsActive(false); }}
          className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center space-x-2 ${mode === 'up' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
        >
          <ClockIcon size={14} />
          <span>Count Up</span>
        </button>
        <button 
          onClick={() => { setMode("down"); setSeconds(initialCountdown); setIsActive(false); }}
          className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center space-x-2 ${mode === 'down' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
        >
          <TimerIcon size={14} />
          <span>Countdown</span>
        </button>
      </div>

      <div className="text-8xl font-black text-slate-800 tracking-tighter mb-12 tabular-nums">
        {formatTime(seconds)}
      </div>

      <div className="flex items-center space-x-6">
        {!isActive ? (
          <button 
            onClick={handleStart}
            className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <PlayIcon size={32} fill="currentColor" />
          </button>
        ) : (
          <button 
            onClick={handleStop}
            className="w-20 h-20 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
          >
            <SquareIcon size={32} fill="currentColor" />
          </button>
        )}
        
        <button 
          onClick={() => { setIsActive(false); setSeconds(mode === 'down' ? initialCountdown : 0); }}
          className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-all"
        >
          <RotateCcwIcon size={24} />
        </button>
      </div>

      {mode === "down" && !isActive && (
        <div className="mt-10 flex items-center space-x-4">
           {[15, 25, 45, 60].map(mins => (
             <button 
               key={mins}
               onClick={() => { setInitialCountdown(mins * 60); setSeconds(mins * 60); }}
               className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${initialCountdown === mins * 60 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-400'}`}
             >
               {mins}m
             </button>
           ))}
        </div>
      )}
    </div>
  );
}
