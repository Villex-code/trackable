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
      <div className="relative w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100">
        <PopupLayout 
          title="Daily Goal"
          description="Set your daily caloric intake target."
          footer={
            <button 
              onClick={handleSubmit}
              className="w-full bg-brand-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-brand-orange-600 transition-all shadow-xl shadow-brand-orange-100"
            >
              Update Goal
            </button>
          }
        >
          <div className="space-y-6">
            <div className="relative">
              <input 
                type="number" 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 px-8 text-3xl font-bold text-slate-800 focus:outline-none focus:border-brand-orange-200 transition-colors text-center"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">kcal</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[2000, 2500, 3000, 3500].map(val => (
                <button 
                  key={val}
                  type="button"
                  onClick={() => setGoal(val.toString())}
                  className={`py-3 rounded-xl font-bold text-xs transition-all ${goal === val.toString() ? 'bg-brand-orange-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {val} kcal
                </button>
              ))}
            </div>
          </div>
        </PopupLayout>
      </div>
    </PopupTransition>
  );
}
