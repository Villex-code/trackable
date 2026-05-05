"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAudio } from "@/lib/useAudio";

interface Timer {
  id: string;
  name: string;
  mode: "up" | "down";
  seconds: number;
  initialCountdown: number;
  isActive: boolean;
  isFinished: boolean;
}

interface TimerContextType {
  timers: Timer[];
  addTimer: (name: string, mins: number, mode: "up" | "down") => void;
  toggleTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  deleteTimer: (id: string) => void;
  logTimer: (id: string, onLog: (duration: number, name: string) => void) => void;
  hasFinishedTimers: boolean;
  clearFinishedStatus: (id: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const { play } = useAudio();

  const hasFinishedTimers = timers.some(t => t.isFinished);

  const clearFinishedStatus = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, isFinished: false } : t));
  };

  const addTimer = (name: string, mins: number, mode: "up" | "down") => {
    const id = Math.random().toString(36).substr(2, 9);
    const newTimer: Timer = {
      id,
      name: name || (mode === "up" ? "Stopwatch" : "Countdown"),
      mode,
      seconds: mode === "down" ? mins * 60 : 0,
      initialCountdown: mins * 60,
      isActive: false,
      isFinished: false,
    };
    setTimers(prev => [...prev, newTimer]);
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive, isFinished: false } : t));
  };

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { 
      ...t, 
      seconds: t.mode === "down" ? t.initialCountdown : 0, 
      isActive: false,
      isFinished: false 
    } : t));
  };

  const deleteTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const logTimer = (id: string, onLog: (duration: number, name: string) => void) => {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;

    const duration = timer.mode === "up" ? timer.seconds : timer.initialCountdown - timer.seconds;
    if (duration > 0) {
      onLog(duration, timer.name);
    }
    resetTimer(id);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isActive) return t;

          if (t.mode === "up") {
            return { ...t, seconds: t.seconds + 1 };
          } else {
            if (t.seconds <= 1) {
              play(); // Sound!
              return { ...t, seconds: 0, isActive: false, isFinished: true };
            }
            return { ...t, seconds: t.seconds - 1 };
          }
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [play]);

  return (
    <TimerContext.Provider value={{ 
      timers, addTimer, toggleTimer, resetTimer, deleteTimer, logTimer, 
      hasFinishedTimers, clearFinishedStatus 
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimers() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimers must be used within a TimerProvider");
  }
  return context;
}
