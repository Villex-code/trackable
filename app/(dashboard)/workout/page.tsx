import MainContentWrapper from "@/components/MainContentWrapper";
import { DumbbellIcon } from "lucide-react";

export default function WorkoutPage() {
  return (
    <MainContentWrapper
      topbarBody={
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-black text-slate-800 tracking-tight">Workouts</h2>
        </div>
      }
    >
      <div className="space-y-8 pb-24">
        <div className="glass p-8 rounded-[32px] border border-white/60">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange-100 text-brand-orange-500 flex items-center justify-center">
                <DumbbellIcon size={16} />
              </div>
              Recent Sessions
            </h3>
            <button className="flex items-center gap-2 bg-brand-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange-200">
              Add Workout
            </button>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-2xl bg-brand-orange-50/40 border border-brand-orange-100/40 hover:border-brand-orange-200/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-orange-100 rounded-xl flex items-center justify-center text-brand-orange-500">
                    <DumbbellIcon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Strength Training</p>
                    <p className="text-sm text-slate-400">May {i + 1}, 2024 · 45 mins</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-800">320 kcal</p>
                  <p className="text-xs font-bold text-brand-orange-400 uppercase tracking-wide">High Intensity</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainContentWrapper>
  );
}
