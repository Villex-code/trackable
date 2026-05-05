"use client";

import { useState } from "react";
import { SmileIcon, MehIcon, FrownIcon, SkullIcon, RocketIcon } from "lucide-react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";

interface SessionModalProps {
  isOpen: boolean;
  duration: number;
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

export default function SessionModal({ isOpen, duration, onSave, onCancel }: SessionModalProps) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("Okay");

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <PopupTransition open={isOpen} onClose={onCancel}>
      <div className="relative w-full max-w-lg bg-white rounded-[40px] p-12 shadow-2xl border border-slate-100">
        <PopupLayout 
          title="Session Complete!"
          description={`You worked for ${formatDuration(duration)}. How did it go?`}
          footer={
            <>
              <button 
                onClick={onCancel}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={() => onSave({ duration, comment, rating })}
                className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
              >
                Save Session
              </button>
            </>
          }
        >
          <div className="space-y-8">
             <div className="grid grid-cols-5 gap-3">
                {ratings.map((r) => {
                  const Icon = r.icon;
                  const isActive = rating === r.label;
                  return (
                    <button 
                      key={r.label}
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
                  placeholder="What did you achieve? Any blockers?" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-6 focus:outline-none focus:border-blue-200 transition-colors h-32 resize-none"
                />
             </div>
          </div>
        </PopupLayout>
      </div>
    </PopupTransition>
  );
}
