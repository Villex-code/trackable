import { LucideIcon, ArrowUpRightIcon, ArrowDownRightIcon } from "lucide-react";

interface FinanceCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color: "emerald" | "red" | "blue" | "slate" | "purple";
}

export default function FinanceCard({ title, value, change, trend, icon: Icon, color }: FinanceCardProps) {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50",
    red: "text-red-600 bg-red-50",
    blue: "text-blue-600 bg-blue-50",
    slate: "text-slate-600 bg-slate-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-lg ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
            trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
          }`}>
            {trend === 'up' ? <ArrowUpRightIcon size={14} /> : trend === 'down' ? <ArrowDownRightIcon size={14} /> : null}
            <span>{change}</span>
          </div>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h4 className="text-3xl font-bold text-slate-800 mt-1">{value}</h4>
    </div>
  );
}
