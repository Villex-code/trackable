"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { 
  AppleIcon, 
  FlameIcon, 
  UtensilsIcon,
  PlusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";
import { format, startOfDay, endOfDay, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

// Components
import NutritionCard from "@/components/diet/NutritionCard";
import LogItem from "@/components/diet/LogItem";
import AddLogModal from "@/components/diet/AddLogModal";
import ViewSwitcher from "@/components/diet/ViewSwitcher";

export default function DietPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [goal, setGoal] = useState<number>(2000);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialType, setInitialType] = useState<"input" | "output">("input");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, selectedDate, view]);

  async function fetchData() {
    setLoading(true);
    let start, end;

    if (view === "daily") {
      start = startOfDay(selectedDate).toISOString();
      end = endOfDay(selectedDate).toISOString();
    } else if (view === "weekly") {
      start = startOfWeek(selectedDate).toISOString();
      end = endOfWeek(selectedDate).toISOString();
    } else {
      start = startOfMonth(selectedDate).toISOString();
      end = endOfMonth(selectedDate).toISOString();
    }

    const { data: logsData } = await supabase
      .from("calorie_logs")
      .select("*")
      .eq("user_id", user?.uid)
      .gte("logged_at", start)
      .lte("logged_at", end)
      .order("logged_at", { ascending: false });

    const { data: goalData } = await supabase
      .from("diet_goals")
      .select("daily_target")
      .eq("user_id", user?.uid)
      .single();

    if (logsData) setLogs(logsData);
    if (goalData) setGoal(goalData.daily_target);
    setLoading(false);
  }

  async function handleAddLog(amount: number, type: "input" | "output", description: string) {
    if (!user) return;

    const { error } = await supabase.from("calorie_logs").insert({
      user_id: user.uid,
      amount,
      type,
      description,
      logged_at: selectedDate.toISOString()
    });

    if (!error) {
      setIsModalOpen(false);
      fetchData();
    }
  }

  async function deleteLog(id: string) {
    const { error } = await supabase.from("calorie_logs").delete().eq("id", id);
    if (!error) fetchData();
  }

  const openAddModal = (type: "input" | "output") => {
    setInitialType(type);
    setIsModalOpen(true);
  };

  const totalInput = logs.filter(l => l.type === "input").reduce((acc, l) => acc + l.amount, 0);
  const totalOutput = logs.filter(l => l.type === "output").reduce((acc, l) => acc + l.amount, 0);
  const netCalories = totalInput - totalOutput;
  
  // Adjust goal for weekly/monthly
  const multiplier = view === "daily" ? 1 : view === "weekly" ? 7 : 30;
  const currentGoal = goal * multiplier;
  const deficit = currentGoal - netCalories;

  return (
    <div className="space-y-10 pb-20">
      {/* Header & controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Diet Tracker</h2>
          <ViewSwitcher view={view} onViewChange={setView} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
           {/* Date Picker */}
           <div className="flex items-center space-x-4 bg-white/50 p-2 rounded-2xl border border-slate-100">
              <button onClick={() => setSelectedDate(subDays(selectedDate, multiplier))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ChevronLeftIcon size={18} className="text-slate-400" />
              </button>
              <span className="text-slate-700 font-bold text-sm min-w-[120px] text-center">
                {view === 'daily' ? format(selectedDate, "MMM d, yyyy") : 
                 view === 'weekly' ? `${format(startOfWeek(selectedDate), "MMM d")} - ${format(endOfWeek(selectedDate), "MMM d")}` :
                 format(selectedDate, "MMMM yyyy")}
              </span>
              <button onClick={() => setSelectedDate(addDays(selectedDate, multiplier))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ChevronRightIcon size={18} className="text-slate-400" />
              </button>
           </div>

           <div className="flex gap-3">
              <button 
                onClick={() => openAddModal("input")}
                className="flex items-center space-x-2 bg-orange-500 text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
              >
                <PlusIcon size={16} />
                <span>Add Meal</span>
              </button>
              <button 
                onClick={() => openAddModal("output")}
                className="flex items-center space-x-2 bg-blue-500 text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
              >
                <PlusIcon size={16} />
                <span>Add Activity</span>
              </button>
           </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NutritionCard title="Total Intake" value={totalInput} icon={UtensilsIcon} color="orange" />
        <NutritionCard title="Burned" value={totalOutput} icon={FlameIcon} color="blue" />
        <NutritionCard title="Net Balance" value={netCalories} icon={TrendingUpIcon} color="purple" />
        <NutritionCard 
          title={deficit >= 0 ? "Caloric Deficit" : "Caloric Surplus"} 
          value={Math.abs(deficit)} 
          icon={deficit >= 0 ? TrendingDownIcon : TrendingUpIcon} 
          color={deficit >= 0 ? "emerald" : "red"} 
        />
      </div>

      {/* Progress Section */}
      <div className="glass p-10 rounded-[40px] border border-white/50">
        <div className="flex justify-between items-end mb-8">
          <div>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Efficiency Progress</p>
             <h3 className="text-3xl font-bold text-slate-800">
               {netCalories} <span className="text-slate-400 font-medium text-xl">/ {currentGoal} kcal</span>
             </h3>
          </div>
          <div className="text-right hidden sm:block">
             <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
               {deficit >= 0 ? `${deficit} kcal remaining` : `${Math.abs(deficit)} kcal over goal`}
             </p>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 shadow-inner">
           <div 
             className={`h-full rounded-full transition-all duration-1000 ${netCalories > currentGoal ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} 
             style={{ width: `${Math.min((netCalories / currentGoal) * 100, 100)}%` }}
           ></div>
        </div>
      </div>

      {/* Logs Table - 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Logs (Meals) */}
        <div className="glass rounded-[40px] border border-white/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center">
                <UtensilsIcon size={16} />
              </div>
              <span>Daily Meals</span>
            </h3>
            <span className="text-sm font-bold text-orange-500">{totalInput} kcal</span>
          </div>
          <div className="p-4 space-y-2 min-h-[300px]">
            {logs.filter(l => l.type === "input").length > 0 ? (
              logs.filter(l => l.type === "input").map((log) => (
                <LogItem key={log.id} log={log} onDelete={deleteLog} />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                <AppleIcon size={40} className="mb-4 opacity-20" />
                <p className="font-medium">No meals logged yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Output Logs (Activities) */}
        <div className="glass rounded-[40px] border border-white/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center">
                <FlameIcon size={16} />
              </div>
              <span>Activities & Exercise</span>
            </h3>
            <span className="text-sm font-bold text-blue-500">{totalOutput} kcal</span>
          </div>
          <div className="p-4 space-y-2 min-h-[300px]">
            {logs.filter(l => l.type === "output").length > 0 ? (
              logs.filter(l => l.type === "output").map((log) => (
                <LogItem key={log.id} log={log} onDelete={deleteLog} />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                <FlameIcon size={40} className="mb-4 opacity-20" />
                <p className="font-medium">No activities logged yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddLogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddLog}
        initialType={initialType}
      />
    </div>
  );
}
