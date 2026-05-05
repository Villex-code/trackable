"use client";

import { useAuth } from "@/lib/AuthContext";
import { 
  TrendingUpIcon, 
  ActivityIcon, 
  PieChartIcon,
  ClockIcon
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Daily Activity" 
          value="84%" 
          change="+12%" 
          icon={ActivityIcon} 
          color="blue"
        />
        <StatCard 
          title="Growth Rate" 
          value="3.2x" 
          change="+0.5" 
          icon={TrendingUpIcon} 
          color="purple"
        />
        <StatCard 
          title="Productivity" 
          value="7.5h" 
          change="-20m" 
          icon={ClockIcon} 
          color="emerald"
        />
        <StatCard 
          title="Resource Use" 
          value="62%" 
          change="+5%" 
          icon={PieChartIcon} 
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100">
           <h3 className="text-xl font-semibold mb-6">Weekly Performance</h3>
           <div className="h-64 flex items-end justify-between px-4 pb-2">
              {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
                <div key={i} className="w-8 bg-blue-500/20 rounded-t-lg relative group transition-all hover:bg-blue-500/40" style={{ height: `${height}%` }}>
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {height}%
                   </div>
                </div>
              ))}
           </div>
           <div className="flex justify-between px-4 mt-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
           </div>
        </div>

        <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col justify-center items-center text-center space-y-4">
           <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
              <TrendingUpIcon size={32} />
           </div>
           <h3 className="text-2xl font-bold">Great Progress!</h3>
           <p className="text-slate-500 leading-relaxed max-w-xs">
            You've completed 85% of your goals this week. Keep maintaining this pace!
           </p>
           <button className="bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-slate-900 transition-all">
             View Detailed Report
           </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-100 border-blue-200",
    purple: "text-purple-600 bg-purple-100 border-purple-200",
    emerald: "text-emerald-600 bg-emerald-100 border-emerald-200",
    orange: "text-orange-600 bg-orange-100 border-orange-200",
  };

  return (
    <div className="p-6 rounded-[28px] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color].split(' ')[1]} ${colorMap[color].split(' ')[0]}`}>
          <Icon size={20} />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {change}
        </span>
      </div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
    </div>
  );
}
