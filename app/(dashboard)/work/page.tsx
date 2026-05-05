"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
  PlusIcon,
  HistoryIcon,
  PlusCircleIcon,
  TimerIcon,
  TrendingUpIcon,
  LayoutDashboardIcon,
  ClockIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

// Components
import SessionModal from "@/components/work/SessionModal";
import ManualLogModal from "@/components/work/ManualLogModal";
import SessionLogItem from "@/components/work/SessionLogItem";
import NutritionCard from "@/components/diet/NutritionCard";
import BulkImportModal from "@/components/global/BulkImportModal";
import ViewSwitcher from "@/components/diet/ViewSwitcher"; // Reusing the view switcher

export default function WorkPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"daily" | "weekly" | "monthly" | "yearly">(
    "monthly",
  );
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [lastDuration, setLastDuration] = useState(0);
  const [lastTimerName, setLastTimerName] = useState("");

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;
      setIsImportModalOpen(true);
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, selectedDate, view]);

  async function fetchSessions() {
    setLoading(true);
    let start, end;

    if (view === "daily") {
      start = startOfDay(selectedDate).toISOString();
      end = endOfDay(selectedDate).toISOString();
    } else if (view === "weekly") {
      start = startOfWeek(selectedDate).toISOString();
      end = endOfWeek(selectedDate).toISOString();
    } else if (view === "monthly") {
      start = startOfMonth(selectedDate).toISOString();
      end = endOfMonth(selectedDate).toISOString();
    } else {
      start = startOfYear(selectedDate).toISOString();
      end = endOfYear(selectedDate).toISOString();
    }

    const { data } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("user_id", user?.uid)
      .gte("logged_at", start)
      .lte("logged_at", end)
      .order("logged_at", { ascending: false });

    if (data) setSessions(data);
    setLoading(false);
  }

  const handleSaveSession = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from("work_sessions").insert({
      ...data,
      user_id: user.uid,
      logged_at: selectedDate.toISOString(), // Log to the selected date
      comment: lastTimerName
        ? `[${lastTimerName}] ${data.comment || ""}`
        : data.comment,
    });
    if (!error) {
      setIsSessionModalOpen(false);
      setIsManualModalOpen(false);
      fetchSessions();
    }
  };

  async function handleBulkImport(data: any[]) {
    if (!user) return;
    const logsWithUser = data.map((item) => ({
      ...item,
      user_id: user.uid,
      logged_at: item.logged_at || new Date().toISOString(),
    }));
    const { error } = await supabase.from("work_sessions").insert(logsWithUser);
    if (error) throw error;
    fetchSessions();
  }

  const deleteSession = async (id: string) => {
    const { error } = await supabase
      .from("work_sessions")
      .delete()
      .eq("id", id);
    if (!error) fetchSessions();
  };

  const totalWorkTime = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalMins = Math.floor(totalWorkTime / 60);
  const avgSession =
    sessions.length > 0 ? Math.floor(totalMins / sessions.length) : 0;

  const multiplier =
    view === "daily"
      ? 1
      : view === "weekly"
        ? 7
        : view === "monthly"
          ? 30
          : 365;

  if (!user) return null;

  return (
    <div className="space-y-10 pb-20">
      {/* Header & controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">
            Work Intelligence
          </h2>
          <div className="flex items-center space-x-2">
            <ViewSwitcher
              view={view === "yearly" ? "monthly" : (view as any)}
              onViewChange={setView as any}
            />
            <button
              onClick={() => setView("yearly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === "yearly" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Date Picker */}
          <div className="flex items-center space-x-4 bg-white/50 p-2 rounded-2xl border border-slate-100">
            <button
              onClick={() => setSelectedDate(subDays(selectedDate, multiplier))}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ChevronLeftIcon size={18} className="text-slate-400" />
            </button>
            <span className="text-slate-700 font-bold text-sm min-w-[140px] text-center">
              {view === "daily"
                ? format(selectedDate, "MMM d, yyyy")
                : view === "weekly"
                  ? `${format(startOfWeek(selectedDate), "MMM d")} - ${format(endOfWeek(selectedDate), "MMM d")}`
                  : view === "monthly"
                    ? format(selectedDate, "MMMM yyyy")
                    : format(selectedDate, "yyyy")}
            </span>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, multiplier))}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ChevronRightIcon size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              title="Bulk Import (Cmd+V)"
            >
              <ShareIcon size={18} className="rotate-180" />
            </button>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center space-x-2 bg-brand-orange-500 text-white px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-xl shadow-brand-orange-500/20 active:scale-95"
            >
              <PlusCircleIcon size={18} className="text-white" />
              <span>Log Session</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NutritionCard
          title="Total Focus"
          value={`${Math.floor(totalMins / 60)}h ${totalMins % 60}m`}
          icon={TimerIcon}
          color="blue"
          unit=""
        />
        <NutritionCard
          title="Sessions"
          value={sessions.length}
          icon={LayoutDashboardIcon}
          color="purple"
          unit="blocks"
        />
        <NutritionCard
          title="Avg Duration"
          value={avgSession}
          icon={ClockIcon}
          color="emerald"
          unit="min"
        />
      </div>

      <div className="glass rounded-[40px] border border-white/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-500 flex items-center justify-center">
              <HistoryIcon size={16} />
            </div>
            <span>Session History</span>
          </h3>
          <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <TrendingUpIcon size={12} />
            <span>Recent Performance</span>
          </div>
        </div>

        <div className="p-6 space-y-3 min-h-[400px]">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionLogItem
                key={session.id}
                session={session}
                onDelete={deleteSession}
              />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                <HistoryIcon size={40} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">
                No sessions logged
              </h4>
              <p className="max-w-[200px] text-center text-sm mt-2">
                Log your first work session to start tracking your progress.
              </p>
            </div>
          )}
        </div>
      </div>

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
        title="Work Sessions"
        expectedFields={["duration"]}
      />

      <ManualLogModal
        isOpen={isManualModalOpen}
        onSave={handleSaveSession}
        onCancel={() => setIsManualModalOpen(false)}
      />
    </div>
  );
}
