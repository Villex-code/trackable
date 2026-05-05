import { format } from "date-fns";
import { 
  RocketIcon, 
  SmileIcon, 
  MehIcon, 
  FrownIcon, 
  SkullIcon,
  ClockIcon,
  Trash2Icon
} from "lucide-react";

interface SessionLogItemProps {
  session: any;
  onDelete: (id: string) => void;
}

const ratingIcons: any = {
  Awesome: RocketIcon,
  Good: SmileIcon,
  Okay: MehIcon,
  Bad: FrownIcon,
  Trash: SkullIcon,
};

const ratingColors: any = {
  Awesome: "text-emerald-500 bg-emerald-50",
  Good: "text-blue-500 bg-blue-50",
  Okay: "text-slate-500 bg-slate-50",
  Bad: "text-orange-500 bg-orange-50",
  Trash: "text-red-500 bg-red-50",
};

export default function SessionLogItem({ session, onDelete }: SessionLogItemProps) {
  const Icon = ratingIcons[session.rating] || MehIcon;
  const durationMins = Math.floor(session.duration / 60);
  
  return (
    <div className="flex items-center justify-between p-6 rounded-[32px] bg-white/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all group">
      <div className="flex items-center space-x-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${ratingColors[session.rating]}`}>
          <Icon size={24} />
        </div>
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h4 className="font-bold text-slate-800 text-lg">{session.rating} Session</h4>
            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg">
              {durationMins}m
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium line-clamp-1 max-w-md">
            {session.comment || "No notes provided."}
          </p>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2">
            {format(new Date(session.logged_at), "MMMM d, h:mm a")}
          </p>
        </div>
      </div>
      <button onClick={() => onDelete(session.id)} className="text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
        <Trash2Icon size={20} />
      </button>
    </div>
  );
}
