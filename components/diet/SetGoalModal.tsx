"use client";

import { useState, useEffect } from "react";
import { TargetIcon, CheckIcon } from "lucide-react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";

interface SetGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: number) => void;
  currentGoal: number;
}

export default function SetGoalModal({ isOpen, onClose, onSave, currentGoal }: SetGoalModalProps) {
  const [goal, setGoal] = useState(currentGoal.toString());

  // Sync state when prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setGoal(currentGoal.toString());
    }
  }, [currentGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(goal);
    if (isNaN(val) || val <= 0) return;
    onSave(val);
    onClose();
  };

  return (
    <PopupTransition open={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-xs bg-white rounded-[28px] p-6 shadow-2xl border border-slate-100">
        <PopupLayout 
          title="Daily Goal"
          description="Set your daily caloric intake target."
          footer={
            <button 
              onClick={handleSubmit}
              className="w-full bg-brand-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange-100"
            >
              Update Goal
            </button>
          }
        >
          <div className="space-y-3">
            <div className="relative">
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-5 text-2xl font-black text-slate-800 focus:outline-none focus:border-brand-orange-200 transition-colors text-center"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">kcal</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1500, 2000, 2500, 3000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setGoal(val.toString())}
                  className={`py-2 rounded-lg font-bold text-[10px] transition-all ${goal === val.toString() ? "bg-brand-orange-500 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100"}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </PopupLayout>
      </div>
    </PopupTransition>
  );
}
