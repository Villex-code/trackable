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
  ChevronRightIcon,
  Settings2Icon,
  ShareIcon
} from "lucide-react";
import { format, startOfDay, endOfDay, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

// Components
import NutritionCard from "@/components/diet/NutritionCard";
import LogItem from "@/components/diet/LogItem";
import AddLogModal from "@/components/diet/AddLogModal";
import ViewSwitcher from "@/components/diet/ViewSwitcher";
import SetGoalModal from "@/components/diet/SetGoalModal";
import BulkImportModal from "@/components/global/BulkImportModal";

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
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [initialType, setInitialType] = useState<"input" | "output">("input");

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      setIsImportModalOpen(true);
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

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

    const { data: logsData, error: logsError } = await supabase
      .from("calorie_logs")
      .select("*")
      .eq("user_id", user?.uid)
      .gte("logged_at", start)
      .lte("logged_at", end)
      .order("logged_at", { ascending: false });

    const { data: goalData, error: goalError } = await supabase
      .from("diet_goals")
      .select("daily_target")
      .eq("user_id", user?.uid)
      .single();

    if (logsError && logsError.code !== 'PGRST116') console.error("Logs Fetch Error:", logsError);
    if (goalError && goalError.code !== 'PGRST116') console.error("Goal Fetch Error:", goalError);

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

  async function handleBulkImport(data: any[]) {
    if (!user) return;
    const logsWithUser = data.map(item => ({
      ...item,
      user_id: user.uid,
      logged_at: item.logged_at || new Date().toISOString()
    }));
    const { error } = await supabase.from("calorie_logs").insert(logsWithUser);
    if (error) throw error;
    fetchData();
  }

  async function deleteLog(id: string) {
    const { error } = await supabase.from("calorie_logs").delete().eq("id", id);
    if (!error) fetchData();
  }

  async function handleUpdateGoal(newGoal: number) {
    if (!user) return;
    const { error } = await supabase.from("diet_goals").upsert({
      user_id: user.uid,
      daily_target: newGoal,
      updated_at: new Date().toISOString()
    });
    if (!error) {
      setGoal(newGoal);
      fetchData();
    }
  }

  const openAddModal = (type: "input" | "output") => {
    setInitialType(type);
    setIsModalOpen(true);
  };

  const totalInput = logs.filter(l => l.type === "input").reduce((acc, l) => acc + l.amount, 0);
  const totalOutput = logs.filter(l => l.type === "output").reduce((acc, l) => acc + l.amount, 0);
  const netCalories = totalInput - totalOutput;
  const multiplier = view === "daily" ? 1 : view === "weekly" ? 7 : 30;
  const currentGoal = goal * multiplier;
  const deficit = currentGoal - netCalories;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Diet Tracker</h2>
          <ViewSwitcher view={view} onViewChange={setView} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
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
                onClick={() => setIsImportModalOpen(true)}
                className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                title="Bulk Import (Cmd+V)"
              >
                <ShareIcon size={18} className="rotate-180" />
              </button>
              <button 
                onClick={() => openAddModal("input")}
                className="flex items-center space-x-2 bg-brand-orange-500 text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-lg shadow-orange-100"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NutritionCard title="Total Intake" value={totalInput} icon={UtensilsIcon} color="orange" unit="kcal" />
        <NutritionCard title="Burned" value={totalOutput} icon={FlameIcon} color="blue" unit="kcal" />
        <NutritionCard title="Net Balance" value={netCalories} icon={TrendingUpIcon} color="purple" unit="kcal" />
        <NutritionCard 
          title={deficit >= 0 ? "Caloric Deficit" : "Caloric Surplus"} 
          value={Math.abs(deficit)} 
          icon={deficit >= 0 ? TrendingDownIcon : TrendingUpIcon} 
          color={deficit >= 0 ? "emerald" : "red"} 
          unit="kcal"
        />
      </div>

      <div className="glass p-10 rounded-[40px] border border-white/50">
        <div className="flex justify-between items-end mb-8">
          <div>
             <div className="flex items-center space-x-3 mb-2">
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Efficiency Progress</p>
               {totalOutput > 0 && (
                 <span className="bg-blue-50 text-blue-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter animate-pulse">
                   +{totalOutput} Activity Bonus
                 </span>
               )}
             </div>
             <h3 className="text-3xl font-bold text-slate-800">
               {totalInput} <span className="text-slate-400 font-medium text-xl">/ {currentGoal + totalOutput} kcal</span>
             </h3>
          </div>
          <div className="text-right hidden sm:flex flex-col items-end gap-2">
             <button 
               onClick={() => setIsGoalModalOpen(true)}
               className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-brand-orange-500"
               title="Set Daily Goal"
             >
               <Settings2Icon size={18} />
             </button>
             <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
               {deficit >= 0 ? `${deficit} kcal remaining` : `${Math.abs(deficit)} kcal over goal`}
             </p>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 shadow-inner relative">
           <div 
             className="absolute top-1 bottom-1 left-1 bg-blue-100/50 rounded-full transition-all duration-1000"
             style={{ width: "100%" }} 
           ></div>
           <div 
             className={`h-full rounded-full transition-all duration-1000 relative z-10 ${totalInput > (currentGoal + totalOutput) ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} 
             style={{ width: `${Math.min((totalInput / (currentGoal + totalOutput)) * 100, 100)}%` }}
           ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

      <BulkImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
        title="Diet Logs"
        expectedFields={["amount", "type", "description"]}
      />

      <AddLogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddLog}
        initialType={initialType}
        currentGoal={currentGoal}
        currentNet={netCalories}
      />

      <SetGoalModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        onSave={handleUpdateGoal}
        currentGoal={goal}
      />
    </div>
  );
}
