"use client";

interface FinanceViewSwitcherProps {
  view: "daily" | "weekly" | "monthly" | "yearly";
  onViewChange: (view: "daily" | "weekly" | "monthly" | "yearly") => void;
}

export default function FinanceViewSwitcher({ view, onViewChange }: FinanceViewSwitcherProps) {
  const views: ("daily" | "weekly" | "monthly" | "yearly")[] = ["daily", "weekly", "monthly", "yearly"];

  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
      {views.map((v) => (
        <button
          key={v}
          onClick={() => onViewChange(v)}
          className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
            view === v 
              ? "bg-white text-slate-800 shadow-sm" 
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
