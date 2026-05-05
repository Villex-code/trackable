import { format } from "date-fns";
import { UtensilsIcon, FlameIcon, Trash2Icon } from "lucide-react";

interface LogItemProps {
  log: any;
  onDelete: (id: string) => void;
}

export default function LogItem({ log, onDelete }: LogItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all group">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.type === 'input' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
          {log.type === 'input' ? <UtensilsIcon size={18} /> : <FlameIcon size={18} />}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 truncate max-w-[120px] md:max-w-none">
            {log.description || (log.type === 'input' ? 'Meal' : 'Activity')}
          </h4>
          <p className="text-xs text-slate-400 font-medium">{format(new Date(log.logged_at), "h:mm a")}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className={`font-bold ${log.type === 'input' ? 'text-orange-500' : 'text-blue-500'}`}>
          {log.type === 'input' ? '+' : '-'}{log.amount}
        </span>
        <button onClick={() => onDelete(log.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2Icon size={18} />
        </button>
      </div>
    </div>
  );
}
