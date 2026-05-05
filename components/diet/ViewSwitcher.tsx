"use client";

interface ViewSwitcherProps {
  view: "daily" | "weekly" | "monthly";
  onViewChange: (view: "daily" | "weekly" | "monthly") => void;
}

export default function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
  const views: ("daily" | "weekly" | "monthly")[] = ["daily", "weekly", "monthly"];

  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
      {views.map((v) => (
        <button
          key={v}
          onClick={() => onViewChange(v)}
          className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
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
