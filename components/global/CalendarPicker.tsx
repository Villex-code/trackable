"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDay,
  getDaysInMonth,
  isSameDay,
  isToday,
  setDate,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "lucide-react";

interface CalendarPickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  showTime?: boolean;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarPicker({
  value,
  onChange,
  showTime = false,
  placeholder = "Pick a date",
  className = "",
  align = "left",
}: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value ?? new Date());
  const [hours, setHoursState] = useState(value?.getHours() ?? new Date().getHours());
  const [mins, setMinsState] = useState(value?.getMinutes() ?? 0);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal time state when value changes externally
  useEffect(() => {
    if (value) {
      setViewMonth(value);
      setHoursState(value.getHours());
      setMinsState(value.getMinutes());
    }
  }, [value]);

  function computeDropStyle() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropW = 296;
    const dropH = showTime ? 430 : 340;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const fitsBelow = rect.bottom + dropH + 8 <= viewH;
    const top = fitsBelow ? rect.bottom + 8 : Math.max(8, rect.top - dropH - 8);
    let left = align === "right" ? rect.right - dropW : rect.left;
    left = Math.max(8, Math.min(left, viewW - dropW - 8));
    setDropStyle({ top, left, width: dropW });
  }

  // Close on outside click or ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onMouse(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onScroll() { setOpen(false); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouse);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouse);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  // Calendar grid — leading nulls + day numbers
  const firstWeekday = getDay(startOfMonth(viewMonth));
  const totalDays = getDaysInMonth(viewMonth);
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function buildDate(day: number, h = hours, m = mins): Date {
    return showTime
      ? setMinutes(setHours(setDate(viewMonth, day), h), m)
      : startOfDay(setDate(viewMonth, day));
  }

  function pickDay(day: number) {
    onChange(buildDate(day));
    if (!showTime) setOpen(false);
  }

  function changeHour(delta: number) {
    const h = (hours + delta + 24) % 24;
    setHoursState(h);
    if (value) onChange(setHours(setMinutes(value, mins), h));
  }

  function changeMin(delta: number) {
    const m = (mins + delta + 60) % 60;
    setMinsState(m);
    if (value) onChange(setMinutes(setHours(value, hours), m));
  }

  function handleHourInput(raw: string) {
    const h = Math.max(0, Math.min(23, parseInt(raw) || 0));
    setHoursState(h);
    if (value) onChange(setHours(setMinutes(value, mins), h));
  }

  function handleMinInput(raw: string) {
    const m = Math.max(0, Math.min(59, parseInt(raw) || 0));
    setMinsState(m);
    if (value) onChange(setMinutes(setHours(value, hours), m));
  }

  const displayLabel = value
    ? showTime
      ? format(value, "MMM d, yyyy  ·  HH:mm")
      : format(value, "MMM d, yyyy")
    : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={() => { if (!open) computeDropStyle(); setOpen(v => !v); }}
        className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm text-left transition-all duration-200 ${
          open
            ? "border-brand-orange-400 bg-brand-orange-50/60 shadow-md shadow-brand-orange-100/30"
            : "border-brand-orange-100/70 bg-white/80 hover:border-brand-orange-200 hover:bg-brand-orange-50/30"
        }`}
      >
        <CalendarIcon
          size={15}
          className={`shrink-0 transition-colors ${open ? "text-brand-orange-500" : "text-slate-400"}`}
        />
        <span className={`flex-1 truncate ${displayLabel ? "font-bold text-slate-800" : "text-slate-400"}`}>
          {displayLabel ?? placeholder}
        </span>
      </button>

      {/* ── Dropdown — fixed so it escapes any overflow:hidden parent ── */}
      {open && (
        <div
          style={{ position: "fixed", ...dropStyle }}
          className="z-[9999] bg-white backdrop-blur-2xl rounded-[24px] border border-brand-orange-100/60 shadow-2xl shadow-brand-orange-100/25 overflow-hidden animate-fade-in"
        >
          {/* Month header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-brand-orange-50">
            <button
              type="button"
              onClick={() => setViewMonth(v => subMonths(v, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-brand-orange-50 text-slate-400 hover:text-brand-orange-500 transition-all"
            >
              <ChevronLeftIcon size={14} />
            </button>
            <span className="text-[13px] font-black text-slate-800 tracking-tight">
              {format(viewMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(v => addMonths(v, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-brand-orange-50 text-slate-400 hover:text-brand-orange-500 transition-all"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>

          {/* Day grid */}
          <div className="px-4 pt-3 pb-2">
            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest py-1.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, i) => {
                if (!day) return <div key={`_${i}`} className="h-9" />;
                const cellDate = setDate(viewMonth, day);
                const selected = value ? isSameDay(cellDate, value) : false;
                const current = isToday(cellDate);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => pickDay(day)}
                    className={`mx-auto w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-bold transition-all duration-150 ${
                      selected
                        ? "bg-brand-orange-500 text-white shadow-lg shadow-brand-orange-200/60"
                        : current
                          ? "text-brand-orange-600 ring-2 ring-brand-orange-300 ring-offset-1 bg-brand-orange-50"
                          : "text-slate-700 hover:bg-brand-orange-50 hover:text-brand-orange-600"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time picker */}
          {showTime && (
            <div className="mx-4 mb-4 mt-1 border-t border-brand-orange-50 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <ClockIcon size={11} className="text-brand-orange-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[10px] font-black text-brand-orange-500 hover:text-brand-orange-600 uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-brand-orange-50 transition-all"
                >
                  Done ✓
                </button>
              </div>

              <div className="flex items-center justify-center gap-3">
                {/* Hours */}
                <div className="flex flex-col items-center gap-1">
                  <button type="button" onClick={() => changeHour(1)} className="w-9 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-orange-500 hover:bg-brand-orange-50 transition-all">
                    <ChevronLeftIcon size={13} className="rotate-90" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={String(hours).padStart(2, "0")}
                    onChange={e => handleHourInput(e.target.value)}
                    className="w-14 text-center bg-brand-orange-50/70 border border-brand-orange-100/70 rounded-xl py-2 text-lg font-black text-slate-800 focus:outline-none focus:border-brand-orange-400 transition-colors"
                  />
                  <button type="button" onClick={() => changeHour(-1)} className="w-9 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-orange-500 hover:bg-brand-orange-50 transition-all">
                    <ChevronLeftIcon size={13} className="-rotate-90" />
                  </button>
                </div>

                <span className="text-2xl font-black text-slate-300 translate-y-[-2px]">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center gap-1">
                  <button type="button" onClick={() => changeMin(5)} className="w-9 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-orange-500 hover:bg-brand-orange-50 transition-all">
                    <ChevronLeftIcon size={13} className="rotate-90" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={String(mins).padStart(2, "0")}
                    onChange={e => handleMinInput(e.target.value)}
                    className="w-14 text-center bg-brand-orange-50/70 border border-brand-orange-100/70 rounded-xl py-2 text-lg font-black text-slate-800 focus:outline-none focus:border-brand-orange-400 transition-colors"
                  />
                  <button type="button" onClick={() => changeMin(-5)} className="w-9 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-orange-500 hover:bg-brand-orange-50 transition-all">
                    <ChevronLeftIcon size={13} className="-rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Date-only confirm row */}
          {!showTime && (
            <div className="px-4 pb-4 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-2.5 rounded-xl bg-brand-orange-500 text-white text-xs font-black uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-md shadow-brand-orange-200"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
