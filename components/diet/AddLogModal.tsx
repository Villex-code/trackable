"use client";

import { useState, useEffect } from "react";
import { PlusIcon, MinusIcon } from "lucide-react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (amount: number, type: "input" | "output", description: string) => void;
  initialType: "input" | "output";
  currentGoal: number;
  currentNet: number;
}

export default function AddLogModal({ isOpen, onClose, onAdd, initialType, currentGoal, currentNet }: AddLogModalProps) {
  const [amount, setAmount] = useState("0");
  const [type, setType] = useState<"input" | "output">(initialType);
  const [description, setDescription] = useState("");

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmount("0");
      setDescription("");
    }
  }, [isOpen, initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseInt(amount) === 0) return;
    onAdd(parseInt(amount), type, description);
    setAmount("0");
    setDescription("");
  };

  const adjustAmount = (delta: number) => {
    setAmount(prev => {
      const current = parseInt(prev) || 0;
      const next = Math.max(0, current + delta);
      return next.toString();
    });
  };

  return (
    <PopupTransition open={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100">
        <PopupLayout 
          title={`Add ${type === 'input' ? 'Meal' : 'Activity'}`}
          description={`Log your caloric ${type === 'input' ? 'intake' : 'burn'} for today.`}
          footer={
            <>
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className={`flex-1 text-white py-4 rounded-2xl font-bold transition-all shadow-xl ${type === 'input' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-100'}`}
              >
                Save Entry
              </button>
            </>
          }
        >
          <div className="space-y-8">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                type="button"
                onClick={() => setType("input")}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${type === 'input' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400'}`}
              >
                Food
              </button>
              <button 
                type="button"
                onClick={() => setType("output")}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${type === 'output' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400'}`}
              >
                Activity
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Calories</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 px-8 text-3xl font-bold text-slate-800 focus:outline-none focus:border-blue-200 transition-colors text-center"
                  required
                />
              </div>

              {/* Symmetric Quick Adjust Buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => adjustAmount(10)} className="py-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-xs hover:bg-emerald-100 transition-all">+10</button>
                  <button type="button" onClick={() => adjustAmount(50)} className="py-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-xs hover:bg-emerald-100 transition-all">+50</button>
                  <button type="button" onClick={() => adjustAmount(100)} className="py-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-xs hover:bg-emerald-100 transition-all">+100</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => adjustAmount(-10)} className="py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold text-xs hover:bg-red-100 transition-all">-10</button>
                  <button type="button" onClick={() => adjustAmount(-50)} className="py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold text-xs hover:bg-red-100 transition-all">-50</button>
                  <button type="button" onClick={() => adjustAmount(-100)} className="py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold text-xs hover:bg-red-100 transition-all">-100</button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={type === 'input' ? "e.g. Lunch" : "e.g. Running"} 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-blue-200 transition-colors"
              />
            </div>

            {/* Projected Impact Preview */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected Remaining</span>
                  <span className={`text-sm font-bold ${
                    (currentGoal - (currentNet + (type === 'input' ? (parseInt(amount) || 0) : -(parseInt(amount) || 0)))) >= 0 
                      ? 'text-emerald-500' 
                      : 'text-red-500'
                  }`}>
                    {currentGoal - (currentNet + (type === 'input' ? (parseInt(amount) || 0) : -(parseInt(amount) || 0)))} kcal
                  </span>
               </div>
            </div>
          </div>
        </PopupLayout>
      </div>
    </PopupTransition>
  );
}
