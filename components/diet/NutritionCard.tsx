import { LucideIcon } from "lucide-react";

interface NutritionCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "orange" | "blue" | "purple" | "emerald" | "red";
  unit?: string;
}

export default function NutritionCard({ title, value, icon: Icon, color, unit = "kcal" }: NutritionCardProps) {
  const colors = {
    orange: "text-orange-500 bg-orange-50",
    blue: "text-blue-500 bg-blue-50",
    purple: "text-purple-500 bg-purple-50",
    emerald: "text-emerald-500 bg-emerald-50",
    red: "text-red-500 bg-red-50",
  };

  return (
    <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800 mt-1">
        {value} <span className="text-sm font-medium text-slate-400">{unit}</span>
      </h4>
    </div>
  );
}
