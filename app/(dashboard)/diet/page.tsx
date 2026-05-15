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
  ShareIcon,
  DropletIcon,
  ScaleIcon,
} from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import NutritionCard from "@/components/diet/NutritionCard";
import LogItem from "@/components/diet/LogItem";
import AddLogModal from "@/components/diet/AddLogModal";
import ViewSwitcher from "@/components/diet/ViewSwitcher";
import SetGoalModal from "@/components/diet/SetGoalModal";
import BulkImportModal from "@/components/global/BulkImportModal";
import MainContentWrapper from "@/components/MainContentWrapper";
import CalendarPicker from "@/components/global/CalendarPicker";

export default function DietPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [waterLogs, setWaterLogs] = useState<any[]>([]);
  const [goal, setGoal] = useState<number>(2000);
  const [waterGoal, setWaterGoal] = useState<number>(2000);
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [initialType, setInitialType] = useState<"input" | "output">("input");

  // Weight tracking
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [weightDateTime, setWeightDateTime] = useState<Date | null>(new Date());

  useEffect(() => {
    const handleGlobalPaste = (_e: ClipboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      setIsImportModalOpen(true);
    };
    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, selectedDate, view]);

  async function fetchData() {
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

    const { data: waterData } = await supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", user?.uid)
      .gte("logged_at", start)
      .lte("logged_at", end)
      .order("logged_at", { ascending: false });

    const { data: goalData } = await supabase
      .from("diet_goals")
      .select("daily_target, target_water")
      .eq("user_id", user?.uid)
      .single();

    if (logsData) setLogs(logsData);
    if (waterData) setWaterLogs(waterData);
    if (goalData) {
      setGoal(goalData.daily_target);
      setWaterGoal(goalData.target_water || 2000);
    }
  }

  async function handleAddLog(amount: number, type: "input" | "output", description: string, protein?: number) {
    if (!user) return;
    const { error } = await supabase.from("calorie_logs").insert({
      user_id: user.uid, amount, type, description, protein,
      logged_at: selectedDate.toISOString(),
    });
    if (!error) { setIsModalOpen(false); fetchData(); }
  }

  async function handleAddWater(amount: number) {
    if (!user) return;
    const { error } = await supabase.from("water_logs").insert({
      user_id: user.uid, amount, logged_at: new Date().toISOString(),
    });
    if (!error) fetchData();
  }

  async function deleteWaterLog(id: string) {
    const { error } = await supabase.from("water_logs").delete().eq("id", id);
    if (!error) fetchData();
  }

  async function handleBulkImport(data: any[]) {
    if (!user) return;
    const logsWithUser = data.map((item) => ({
      ...item, user_id: user.uid,
      logged_at: item.logged_at || new Date().toISOString(),
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
      user_id: user.uid, daily_target: newGoal, updated_at: new Date().toISOString(),
    });
    if (!error) { setGoal(newGoal); fetchData(); }
  }

  const openAddModal = (type: "input" | "output") => {
    setInitialType(type);
    setIsModalOpen(true);
  };

  // Weight tracking
  useEffect(() => {
    if (user) fetchWeightLogs();
  }, [user]);

  async function fetchWeightLogs() {
    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user?.uid)
      .order("logged_at", { ascending: false })
      .limit(20);
    if (data) setWeightLogs(data);
  }

  async function handleAddWeight(e: React.SyntheticEvent) {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (!user || isNaN(w) || w <= 0 || !weightDateTime) return;
    const { error } = await supabase.from("weight_logs").insert({
      user_id: user.uid,
      weight: w,
      logged_at: weightDateTime.toISOString(),
    });
    if (!error) {
      setWeightInput("");
      setWeightDateTime(new Date());
      fetchWeightLogs();
    }
  }

  async function deleteWeightLog(id: string) {
    const { error } = await supabase.from("weight_logs").delete().eq("id", id);
    if (!error) fetchWeightLogs();
  }

  const totalInput = logs.filter((l) => l.type === "input").reduce((acc, l) => acc + l.amount, 0);
  const totalOutput = logs.filter((l) => l.type === "output").reduce((acc, l) => acc + l.amount, 0);
  const totalWater = waterLogs.reduce((acc, l) => acc + l.amount, 0);
  const totalProtein = logs.filter((l) => l.type === "input").reduce((acc, l) => acc + (l.protein || 0), 0);
  const netCalories = totalInput - totalOutput;
  const multiplier = view === "daily" ? 1 : view === "weekly" ? 7 : 30;
  const currentGoal = goal * multiplier;
  const currentWaterGoal = waterGoal * multiplier;
  const deficit = currentGoal - netCalories;

  const dateLabel =
    view === "daily"
      ? format(selectedDate, "MMM d, yyyy")
      : view === "weekly"
        ? `${format(startOfWeek(selectedDate), "MMM d")} – ${format(endOfWeek(selectedDate), "MMM d")}`
        : format(selectedDate, "MMMM yyyy");

  return (
    <MainContentWrapper
      topbarBody={
        <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <h2 className="text-[15px] font-black text-slate-800 tracking-tight">Diet Tracker</h2>
            <div className="hidden md:block">
              <ViewSwitcher view={view} onViewChange={setView} />
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center bg-brand-orange-50/80 p-1 rounded-xl border border-brand-orange-100/60">
              <button
                onClick={() => setSelectedDate(subDays(selectedDate, multiplier))}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronLeftIcon size={14} className="text-slate-400" />
              </button>
              <span className="text-slate-700 font-bold text-xs min-w-[110px] text-center px-1">
                {dateLabel}
              </span>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, multiplier))}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronRightIcon size={14} className="text-slate-400" />
              </button>
            </div>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              title="Bulk Import"
            >
              <ShareIcon size={14} className="rotate-180" />
            </button>
            <button
              onClick={() => openAddModal("input")}
              className="hidden sm:flex items-center gap-1.5 bg-brand-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange-200"
            >
              <PlusIcon size={14} />
              Add Meal
            </button>
            <button
              onClick={() => openAddModal("output")}
              className="hidden lg:flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
            >
              <PlusIcon size={14} />
              Activity
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-8 pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <NutritionCard title="Intake" value={totalInput} icon={UtensilsIcon} color="orange" unit="kcal" />
          <NutritionCard title="Burned" value={totalOutput} icon={FlameIcon} color="blue" unit="kcal" />
          <NutritionCard title="Net" value={netCalories} icon={TrendingUpIcon} color="purple" unit="kcal" />
          <NutritionCard
            title={deficit >= 0 ? "Deficit" : "Surplus"}
            value={Math.abs(deficit)}
            icon={deficit >= 0 ? TrendingDownIcon : TrendingUpIcon}
            color={deficit >= 0 ? "emerald" : "red"}
            unit="kcal"
          />
          <NutritionCard title="Protein" value={totalProtein} icon={AppleIcon} color="amber" unit="g" />
          <NutritionCard title="Water" value={totalWater} icon={DropletIcon} color="blue" unit="ml" />
        </div>

        <div className="glass p-8 rounded-[32px] border border-white/60">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Efficiency Progress</p>
                {totalOutput > 0 && (
                  <span className="bg-blue-50 text-blue-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter animate-pulse">
                    +{totalOutput} Activity Bonus
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                {totalInput}{" "}
                <span className="text-slate-400 font-medium text-lg">
                  / {currentGoal + totalOutput} kcal
                </span>
              </h3>
            </div>
            <div className="text-right hidden sm:flex flex-col items-end gap-2">
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="p-2 hover:bg-brand-orange-50 rounded-xl transition-colors text-slate-400 hover:text-brand-orange-500"
              >
                <Settings2Icon size={16} />
              </button>
              <p className="text-sm font-bold text-slate-800 bg-brand-orange-50/60 px-4 py-2 rounded-xl border border-brand-orange-100/60">
                {deficit >= 0 ? `${deficit} kcal remaining` : `${Math.abs(deficit)} kcal over goal`}
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                totalInput > currentGoal + totalOutput
                  ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              }`}
              style={{ width: `${Math.min((totalInput / (currentGoal + totalOutput)) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          <div className="glass rounded-[32px] border border-white/60 overflow-hidden">
            <div className="p-7 border-b border-brand-orange-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center">
                  <UtensilsIcon size={15} />
                </div>
                Daily Meals
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-orange-400 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                  {totalProtein}g Protein
                </span>
                <span className="text-sm font-black text-orange-500">{totalInput} kcal</span>
              </div>
            </div>
            <div className="p-4 space-y-2 min-h-[260px]">
              {logs.filter((l) => l.type === "input").length > 0 ? (
                logs.filter((l) => l.type === "input").map((log) => (
                  <LogItem key={log.id} log={log} onDelete={deleteLog} />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                  <AppleIcon size={36} className="mb-3 opacity-20" />
                  <p className="font-medium">No meals logged yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-[32px] border border-white/60 overflow-hidden">
            <div className="p-7 border-b border-brand-orange-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center">
                  <FlameIcon size={15} />
                </div>
                Activities & Exercise
              </h3>
              <span className="text-sm font-black text-blue-500">{totalOutput} kcal</span>
            </div>
            <div className="p-4 space-y-2 min-h-[260px]">
              {logs.filter((l) => l.type === "output").length > 0 ? (
                logs.filter((l) => l.type === "output").map((log) => (
                  <LogItem key={log.id} log={log} onDelete={deleteLog} />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                  <FlameIcon size={36} className="mb-3 opacity-20" />
                  <p className="font-medium">No activities logged yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-[32px] border border-white/60 overflow-hidden">
          <div className="p-7 border-b border-brand-orange-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                <DropletIcon size={15} />
              </div>
              Water Tracking
            </h3>
            <span className="text-sm font-black text-blue-500">
              {totalWater} / {currentWaterGoal} ml
            </span>
          </div>
          <div className="p-7 space-y-7">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[100, 250, 330, 500, 750, 1000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAddWater(amount)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-brand-orange-50/40 border border-brand-orange-100/40 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <DropletIcon size={20} className="mb-1.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-black text-slate-700">+{amount}ml</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydration Progress</p>
                  <span className="text-sm font-black text-blue-500">
                    {Math.round((totalWater / currentWaterGoal) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                    style={{ width: `${Math.min((totalWater / currentWaterGoal) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 font-medium italic">
                  {totalWater >= currentWaterGoal
                    ? "Goal reached! You're well hydrated."
                    : `${currentWaterGoal - totalWater}ml more to reach your goal.`}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Logs</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                  {waterLogs.length > 0 ? (
                    waterLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-brand-orange-50/40 border border-brand-orange-100/40 group"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700">{log.amount}ml</span>
                          <span className="text-[9px] text-slate-400">
                            {format(new Date(log.logged_at), "h:mm a")}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteWaterLog(log.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <PlusIcon size={11} className="rotate-45" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-center py-4 text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                      No water logged today
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Tracking */}
        <div className="glass rounded-[32px] border border-white/60 overflow-hidden">
          <div className="p-7 border-b border-brand-orange-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-500 flex items-center justify-center">
                <ScaleIcon size={15} />
              </div>
              Weight Log
            </h3>
            {weightLogs.length > 0 && (
              <span className="text-sm font-black text-violet-500">
                Latest: {weightLogs[0].weight} kg
              </span>
            )}
          </div>
          <div className="p-7 space-y-6">
            {/* Log form */}
            <form onSubmit={handleAddWeight} className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-3 flex-1">
                <div className="relative flex-1 max-w-[140px]">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="70.5"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-4 pr-10 text-sm font-black text-slate-800 focus:outline-none focus:border-violet-200 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">kg</span>
                </div>
                <CalendarPicker
                  showTime
                  value={weightDateTime}
                  onChange={setWeightDateTime}
                  className="flex-1"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-violet-600 transition-all shadow-lg shadow-violet-100 shrink-0"
              >
                <PlusIcon size={14} />
                Log Weight
              </button>
            </form>

            {/* Recent entries */}
            {weightLogs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                {weightLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-violet-50/60 border border-violet-100/60 group"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-800">{log.weight} <span className="text-[10px] font-bold text-slate-400">kg</span></p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{format(new Date(log.logged_at), "MMM d, h:mm a")}</p>
                    </div>
                    <button
                      onClick={() => deleteWeightLog(log.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <PlusIcon size={11} className="rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <ScaleIcon size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">No weight entries yet</p>
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
        expectedFields={["amount", "type", "description", "protein"]}
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
    </MainContentWrapper>
  );
}
