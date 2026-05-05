import { Trash2Icon, RefreshCcwIcon } from "lucide-react";
import { format } from "date-fns";

interface TransactionItemProps {
  transaction: any;
  onDelete: (id: string) => void;
}

export default function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const isExpense = transaction.type === 'expense';
  
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all group">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-slate-50 relative`}>
          {transaction.category === 'Food' ? '🍔' : 
           transaction.category === 'Subscription' ? '📱' : 
           transaction.category === 'Work' ? '💼' : 
           transaction.category === 'Shopping' ? '🛒' : '💰'}
          
          {transaction.is_recurring && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full shadow-sm">
              <RefreshCcwIcon size={10} />
            </div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{transaction.description || transaction.category}</h4>
          <p className="text-xs text-slate-400 font-medium">
            {transaction.category} • {format(new Date(transaction.logged_at), "MMM d")}
            {transaction.is_recurring && <span className="text-blue-500 ml-2">Monthly</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <p className={`font-bold text-lg ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
          {isExpense ? '-' : '+'}${Number(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <button onClick={() => onDelete(transaction.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2Icon size={18} />
        </button>
      </div>
    </div>
  );
}
