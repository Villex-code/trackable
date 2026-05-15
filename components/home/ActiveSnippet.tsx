"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTimers } from "@/lib/TimerContext";
import {
  CheckCircle2Icon,
  BellIcon,
  ClockIcon,
  PlayIcon,
  SquareIcon,
  BellRingIcon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
  CheckIcon,
  TimerIcon,
  XIcon,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Todo = { id: string; task: string; is_completed: boolean };
type Reminder = { id: string; title: string; remind_at: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ActiveSnippet({ userId }: { userId: string }) {
  const supabase = createClient();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const [{ data: t }, { data: r }] = await Promise.all([
        supabase
          .from("work_todos")
          .select("id, task, is_completed")
          .eq("user_id", userId)
          .eq("is_completed", false)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("work_reminders")
          .select("id, title, remind_at")
          .eq("user_id", userId)
          .eq("is_completed", false)
          .gte("remind_at", new Date().toISOString())
          .order("remind_at", { ascending: true })
          .limit(4),
      ]);
      setTodos(t ?? []);
      setReminders(r ?? []);
    }
    load();
  }, [userId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <TimerColumn />
      <AlertColumn userId={userId} reminders={reminders} setReminders={setReminders} />
      <TodoColumn userId={userId} todos={todos} setTodos={setTodos} />
    </div>
  );
}

// ─── Timer Column ─────────────────────────────────────────────────────────────

function TimerColumn() {
  const { timers, addTimer, toggleTimer, resetTimer, deleteTimer } = useTimers();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"down" | "up">("down");
  const [mins, setMins] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  function submit() {
    const m = mode === "down" ? Math.max(1, parseInt(mins) || 1) : 0;
    addTimer(name.trim() || (mode === "up" ? "Stopwatch" : "Countdown"), m, mode);
    setName("");
    setMins("");
    setOpen(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") submit();
    if (e.key === "Escape") setOpen(false);
  }

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <ClockIcon size={16} className="text-blue-500" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
            Timers
          </h4>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            open
              ? "bg-slate-200 text-slate-600 rotate-45"
              : "bg-blue-50 text-blue-500 hover:bg-blue-100"
          }`}
        >
          <PlusIcon size={14} />
        </button>
      </div>

      {/* Inline create form */}
      {open && (
        <div className="bg-white border border-blue-100 rounded-[20px] p-4 space-y-3 shadow-sm">
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Timer name (optional)"
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-300 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          />

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("down")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                mode === "down"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              <TimerIcon size={12} />
              Countdown
            </button>
            <button
              onClick={() => setMode("up")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                mode === "up"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              <ClockIcon size={12} />
              Stopwatch
            </button>
          </div>

          {mode === "down" && (
            <input
              value={mins}
              onChange={(e) => setMins(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Minutes (e.g. 25)"
              type="number"
              min="1"
              className="w-full text-sm font-medium text-slate-800 placeholder-slate-300 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            />
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-xl text-xs font-black text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={mode === "down" && !mins}
              className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-xs font-black uppercase tracking-wider hover:bg-blue-600 transition-all disabled:opacity-40"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* Timer list */}
      <div className="space-y-3">
        {timers.length === 0 ? (
          <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[24px] p-8 text-center">
            <p className="text-xs font-bold text-slate-400">No timers yet</p>
            <p className="text-[10px] text-slate-300 mt-1">Click + to create one</p>
          </div>
        ) : (
          timers.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-[20px] border flex items-center justify-between gap-3 transition-all ${
                t.isFinished
                  ? "bg-red-50 border-red-100"
                  : t.isActive
                  ? "bg-blue-50 border-blue-100"
                  : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    t.isFinished
                      ? "bg-red-100 text-red-500 animate-pulse"
                      : t.isActive
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {t.isFinished ? (
                    <BellRingIcon size={17} />
                  ) : (
                    <ClockIcon size={17} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">
                    {t.name}
                  </p>
                  <p
                    className={`text-lg font-black tabular-nums leading-tight ${
                      t.isFinished ? "text-red-600" : "text-slate-800"
                    }`}
                  >
                    {fmt(t.seconds)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => resetTimer(t.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <RotateCcwIcon size={13} />
                </button>
                <button
                  onClick={() => toggleTimer(t.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    t.isActive
                      ? "bg-slate-800 text-white"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {t.isActive ? (
                    <SquareIcon size={13} fill="currentColor" />
                  ) : (
                    <PlayIcon size={13} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => deleteTimer(t.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
                >
                  <Trash2Icon size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Alert Column ─────────────────────────────────────────────────────────────

function AlertColumn({
  userId,
  reminders,
  setReminders,
}: {
  userId: string;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      titleRef.current?.focus();
      // Default to today + current time + 1h
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      setDate(now.toISOString().split("T")[0]);
      setTime(`${now.getHours().toString().padStart(2, "0")}:00`);
    }
  }, [open]);

  async function submit() {
    if (!title.trim() || !date || !time) return;
    setSaving(true);
    const remind_at = new Date(`${date}T${time}`).toISOString();
    const { data } = await supabase
      .from("work_reminders")
      .insert({ user_id: userId, title: title.trim(), remind_at })
      .select("id, title, remind_at")
      .single();
    if (data) setReminders((prev) => [...prev, data].sort((a, b) => a.remind_at.localeCompare(b.remind_at)));
    setTitle("");
    setOpen(false);
    setSaving(false);
  }

  async function dismiss(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("work_reminders").update({ is_completed: true }).eq("id", id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <BellIcon size={16} className="text-purple-500" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
            Alerts
          </h4>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            open
              ? "bg-slate-200 text-slate-600 rotate-45"
              : "bg-purple-50 text-purple-500 hover:bg-purple-100"
          }`}
        >
          <PlusIcon size={14} />
        </button>
      </div>

      {/* Inline create form */}
      {open && (
        <div className="bg-white border border-purple-100 rounded-[20px] p-4 space-y-3 shadow-sm">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            placeholder="Alert title"
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-300 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all w-full"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all w-full"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-xl text-xs font-black text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={saving || !title.trim() || !date || !time}
              className="flex-1 py-2 rounded-xl bg-purple-500 text-white text-xs font-black uppercase tracking-wider hover:bg-purple-600 transition-all disabled:opacity-40"
            >
              {saving ? "Saving…" : "Set Alert"}
            </button>
          </div>
        </div>
      )}

      {/* Reminder list */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[24px] p-8 text-center">
            <p className="text-xs font-bold text-slate-400">No upcoming alerts</p>
            <p className="text-[10px] text-slate-300 mt-1">Click + to schedule one</p>
          </div>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              className="p-4 bg-white/90 border border-slate-100 rounded-[20px] shadow-sm flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                <BellIcon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{r.title}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {fmtTime(r.remind_at)}
                </p>
              </div>
              <button
                onClick={() => dismiss(r.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
              >
                <XIcon size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Todo Column ──────────────────────────────────────────────────────────────

function TodoColumn({
  userId,
  todos,
  setTodos,
}: {
  userId: string;
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function submit() {
    if (!task.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from("work_todos")
      .insert({ user_id: userId, task: task.trim(), is_completed: false })
      .select("id, task, is_completed")
      .single();
    if (data) setTodos((prev) => [data, ...prev]);
    setTask("");
    setOpen(false);
    setSaving(false);
  }

  async function complete(id: string) {
    setCompleting(id);
    await supabase.from("work_todos").update({ is_completed: true }).eq("id", id);
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setCompleting(null);
    }, 350);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <CheckCircle2Icon size={16} className="text-emerald-500" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
            Tasks
          </h4>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            open
              ? "bg-slate-200 text-slate-600 rotate-45"
              : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
          }`}
        >
          <PlusIcon size={14} />
        </button>
      </div>

      {/* Inline create form */}
      {open && (
        <div className="bg-white border border-emerald-100 rounded-[20px] p-4 space-y-3 shadow-sm">
          <input
            ref={inputRef}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="What needs to be done?"
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-300 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-xl text-xs font-black text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={saving || !task.trim()}
              className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-all disabled:opacity-40"
            >
              {saving ? "Saving…" : "Add Task"}
            </button>
          </div>
        </div>
      )}

      {/* Todo list */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[24px] p-8 text-center">
            <p className="text-xs font-bold text-slate-400">All clear!</p>
            <p className="text-[10px] text-slate-300 mt-1">Click + to add a task</p>
          </div>
        ) : (
          todos.map((t) => (
            <div
              key={t.id}
              className={`p-4 bg-white border border-slate-100 rounded-[20px] shadow-sm flex items-center gap-3 transition-all duration-300 ${
                completing === t.id ? "opacity-0 scale-95" : "opacity-100"
              }`}
            >
              <button
                onClick={() => complete(t.id)}
                className="w-5 h-5 rounded-md border-2 border-slate-200 flex items-center justify-center shrink-0 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
              >
                <CheckIcon
                  size={11}
                  className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  strokeWidth={3}
                />
              </button>
              <p className="text-sm font-bold text-slate-700 flex-1 min-w-0 truncate">
                {t.task}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
