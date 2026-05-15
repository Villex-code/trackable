"use client";

import { useState, useEffect } from "react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (amount: number, type: "input" | "output", description: string, protein?: number) => void;
  initialType: "input" | "output";
  currentGoal: number;
  currentNet: number;
}

export default function AddLogModal({ isOpen, onClose, onAdd, initialType, currentGoal, currentNet }: AddLogModalProps) {
  const [amount, setAmount] = useState("0");
  const [protein, setProtein] = useState("");
  const [type, setType] = useState<"input" | "output">(initialType);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmount("0");
      setProtein("");
      setDescription("");
    }
  }, [isOpen, initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseInt(amount) === 0) return;
    onAdd(parseInt(amount), type, description, type === "input" && protein ? parseInt(protein) : undefined);
    setAmount("0");
    setProtein("");
    setDescription("");
  };

  const adjustAmount = (delta: number) => {
    setAmount((prev) => Math.max(0, (parseInt(prev) || 0) + delta).toString());
  };

  const projected = currentGoal - (currentNet + (type === "input" ? (parseInt(amount) || 0) : -(parseInt(amount) || 0)));

  return (
    <PopupTransition open={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100">
        <PopupLayout
          title={`Add ${type === "input" ? "Meal" : "Activity"}`}
          footer={
            <>
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`flex-1 text-white py-3 rounded-xl font-bold transition-all shadow-lg text-sm ${type === "input" ? "bg-orange-500 hover:bg-orange-600 shadow-orange-100" : "bg-blue-500 hover:bg-blue-600 shadow-blue-100"}`}
              >
                Save Entry
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Type toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button type="button" onClick={() => setType("input")} className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${type === "input" ? "bg-white text-orange-500 shadow-sm" : "text-slate-400"}`}>
                Food
              </button>
              <button type="button" onClick={() => setType("output")} className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${type === "output" ? "bg-white text-blue-500 shadow-sm" : "text-slate-400"}`}>
                Activity
              </button>
            </div>

            {/* Calorie input + nudge buttons */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Calories (kcal)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-5 text-2xl font-black text-slate-800 focus:outline-none focus:border-orange-200 transition-colors text-center"
                required
              />
              <div className="grid grid-cols-6 gap-1.5">
                {[-100, -50, -10, 10, 50, 100].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => adjustAmount(d)}
                    className={`py-1.5 rounded-lg font-black text-[10px] transition-all ${d < 0 ? "bg-red-50 text-red-500 hover:bg-red-100 border border-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"}`}
                  >
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
              </div>
            </div>

            {/* Description + optional protein side by side */}
            <div className={`grid gap-3 ${type === "input" ? "grid-cols-2" : "grid-cols-1"}`}>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={type === "input" ? "e.g. Lunch" : "e.g. Running"}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-orange-200 transition-colors font-medium"
                />
              </div>
              {type === "input" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-orange-200 transition-colors font-medium"
                  />
                </div>
              )}
            </div>

            {/* Projected remaining — compact */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected remaining</span>
              <span className={`text-sm font-black ${projected >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {projected} kcal
              </span>
            </div>
          </div>
        </PopupLayout>
      </div>
    </PopupTransition>
  );
}
