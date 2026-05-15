"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
  PlusCircleIcon,
  TimerIcon,
  TrendingUpIcon,
  LayoutDashboardIcon,
  ClockIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
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
import ManualLogModal from "@/components/work/ManualLogModal";
import SessionLogItem from "@/components/work/SessionLogItem";
import NutritionCard from "@/components/diet/NutritionCard";
import BulkImportModal from "@/components/global/BulkImportModal";
import ViewSwitcher from "@/components/diet/ViewSwitcher";
import MainContentWrapper from "@/components/MainContentWrapper";

export default function WorkPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);
  const [view, setView] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [lastTimerName] = useState("");

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      setIsImportModalOpen(true);
    };
    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user, selectedDate, view]);

  async function fetchSessions() {
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
  }

  const handleSaveSession = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from("work_sessions").insert({
      ...data,
      user_id: user.uid,
      logged_at: selectedDate.toISOString(),
      comment: lastTimerName ? `[${lastTimerName}] ${data.comment || ""}` : data.comment,
    });
    if (!error) {
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
    const { error } = await supabase.from("work_sessions").delete().eq("id", id);
    if (!error) fetchSessions();
  };

  const totalWorkTime = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalMins = Math.floor(totalWorkTime / 60);
  const avgSession = sessions.length > 0 ? Math.floor(totalMins / sessions.length) : 0;
  const multiplier = view === "daily" ? 1 : view === "weekly" ? 7 : view === "monthly" ? 30 : 365;

  if (!user) return null;

  const dateLabel =
    view === "daily"
      ? format(selectedDate, "MMM d, yyyy")
      : view === "weekly"
        ? `${format(startOfWeek(selectedDate), "MMM d")} – ${format(endOfWeek(selectedDate), "MMM d")}`
        : view === "monthly"
          ? format(selectedDate, "MMMM yyyy")
          : format(selectedDate, "yyyy");

  return (
    <MainContentWrapper
      topbarBody={
        <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <h2 className="text-[15px] font-black text-slate-800 tracking-tight">
              Work Intelligence
            </h2>
            <div className="hidden md:flex items-center gap-1.5">
              <ViewSwitcher
                view={view === "yearly" ? "monthly" : (view as any)}
                onViewChange={setView as any}
              />
              <button
                onClick={() => setView("yearly")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  view === "yearly" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Year
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center bg-brand-orange-50/80 p-1 rounded-xl border border-brand-orange-100/60">
              <button
                onClick={() => setSelectedDate(subDays(selectedDate, multiplier))}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronLeftIcon size={14} className="text-slate-400" />
              </button>
              <span className="text-slate-700 font-bold text-xs min-w-[110px] text-center px-1">
                {dateLabel}
              </span>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, multiplier))}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronRightIcon size={14} className="text-slate-400" />
              </button>
            </div>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              title="Bulk Import"
            >
              <ShareIcon size={14} className="rotate-180" />
            </button>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-brand-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange-200"
            >
              <PlusCircleIcon size={14} />
              Log Session
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-8 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <NutritionCard
            title="Total Focus"
            value={`${Math.floor(totalMins / 60)}h ${totalMins % 60}m`}
            icon={TimerIcon}
            color="blue"
            unit=""
          />
          <NutritionCard title="Sessions" value={sessions.length} icon={LayoutDashboardIcon} color="purple" unit="blocks" />
          <NutritionCard title="Avg Duration" value={avgSession} icon={ClockIcon} color="emerald" unit="min" />
        </div>

        <div className="glass rounded-[32px] border border-white/60 overflow-hidden">
          <div className="p-7 border-b border-brand-orange-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-500 flex items-center justify-center">
                <HistoryIcon size={15} />
              </div>
              Session History
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <TrendingUpIcon size={12} />
              <span>Recent Performance</span>
            </div>
          </div>
          <div className="p-5 space-y-2.5 min-h-[360px]">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <SessionLogItem key={session.id} session={session} onDelete={deleteSession} />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-brand-orange-50 flex items-center justify-center text-brand-orange-200 mb-4">
                  <HistoryIcon size={32} />
                </div>
                <h4 className="text-base font-bold text-slate-800">No sessions logged</h4>
                <p className="max-w-[180px] text-center text-sm mt-1">
                  Log your first work session to start tracking.
                </p>
              </div>
            )}
          </div>
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
    </MainContentWrapper>
  );
}
