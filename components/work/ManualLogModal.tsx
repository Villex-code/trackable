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
  const [durationMins, setDurationMins] = useState("25");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("Okay");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationSecs = (parseInt(durationMins) || 0) * 60;
    if (durationSecs <= 0) return;
    onSave({ duration: durationSecs, comment, rating });
    setDurationMins("25");
    setComment("");
    setRating("Okay");
  };

  return (
    <PopupTransition isOpen={isOpen} onClose={onCancel}>
      <PopupLayout 
        title="Force Log Session"
        description="Manually enter a work block for your history."
        footer={
          <>
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
            >
              Log Session
            </button>
          </>
        }
      >
        <div className="space-y-8">
           <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (minutes)</label>
              <div className="relative">
                 <ClockIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input 
                    type="number" 
                    value={durationMins}
                    onChange={(e) => setDurationMins(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-blue-200"
                    required
                 />
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
                className="w-full bg-white border border-slate-100 rounded-[24px] py-5 px-6 focus:outline-none focus:border-blue-200 transition-colors h-24 resize-none"
              />
           </div>
        </div>
      </PopupLayout>
    </PopupTransition>
  );
}
