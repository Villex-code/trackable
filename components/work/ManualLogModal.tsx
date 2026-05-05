"use client";

import { useState } from "react";
import { SmileIcon, MehIcon, FrownIcon, SkullIcon, RocketIcon, ClockIcon } from "lucide-react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";

interface ManualLogModalProps {
  isOpen: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ratings = [
  { label: "Awesome", icon: RocketIcon, color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
  { label: "Good", icon: SmileIcon, color: "text-blue-500 bg-blue-50 border-blue-100" },
  { label: "Okay", icon: MehIcon, color: "text-slate-500 bg-slate-50 border-slate-100" },
  { label: "Bad", icon: FrownIcon, color: "text-orange-500 bg-orange-50 border-orange-100" },
  { label: "Trash", icon: SkullIcon, color: "text-red-500 bg-red-50 border-red-100" },
];

export default function ManualLogModal({ isOpen, onSave, onCancel }: ManualLogModalProps) {
  const [durationMins, setDurationMins] = useState("30");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("Okay");

  const adjustDuration = (amount: number) => {
    const current = parseInt(durationMins) || 0;
    setDurationMins((current + amount).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationSecs = (parseInt(durationMins) || 0) * 60;
    if (durationSecs <= 0) return;
    onSave({ duration: durationSecs, comment, rating });
    setDurationMins("30");
    setComment("");
    setRating("Okay");
  };

  return (
    <PopupTransition open={isOpen} onClose={onCancel}>
      <div className="relative w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100">
        <PopupLayout 
          title="Log Work Session"
          description="How long did you focus and what was the outcome?"
          footer={
            <>
              <button 
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 bg-brand-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-brand-orange-600 transition-all shadow-xl shadow-brand-orange-500/20 text-sm"
              >
                Log Session
              </button>
            </>
          }
        >
          <div className="space-y-8">
             <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (minutes)</label>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                     <ClockIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input 
                        type="number" 
                        value={durationMins}
                        onChange={(e) => setDurationMins(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-blue-200 text-xl font-bold text-slate-800"
                        required
                     />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => adjustDuration(5)} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all">+5</button>
                      <button type="button" onClick={() => adjustDuration(10)} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all">+10</button>
                    </div>
                    <button type="button" onClick={() => adjustDuration(30)} className="w-full py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all">+30 MIN</button>
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-5 gap-3">
                {ratings.map((r) => {
                  const Icon = r.icon;
                  const isActive = rating === r.label;
                  return (
                    <button 
                      key={r.label}
                      type="button"
                      onClick={() => setRating(r.label)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        isActive ? r.color : 'bg-white border-transparent text-slate-300 hover:border-slate-100'
                      }`}
                    >
                      <Icon size={24} className="mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{r.label}</span>
                    </button>
                  );
                })}
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Session Notes</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you work on during this block?" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-6 focus:outline-none focus:border-blue-200 transition-colors h-24 resize-none"
                />
             </div>
          </div>
        </PopupLayout>
      </div>
    </PopupTransition>
  );
}
