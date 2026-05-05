"use client";

import { useState } from "react";
import { RefreshCcwIcon } from "lucide-react";
import PopupTransition from "@/components/global/PopupTransition";
import PopupLayout from "@/components/global/PopupLayout";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

export default function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Shopping");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onAdd({
      amount: parseFloat(amount),
      type,
      category,
      description,
      is_recurring: isRecurring,
      logged_at: new Date().toISOString()
    });
    setAmount("");
    setDescription("");
    setIsRecurring(false);
  };

  return (
    <PopupTransition isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <PopupLayout 
        title={`Add ${type === 'expense' ? 'Expense' : 'Income'}`}
        description="Track your finances by recording your latest transactions."
        footer={
          <>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className={`flex-1 text-white py-4 rounded-2xl font-bold transition-all shadow-xl ${type === 'expense' ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'}`}
            >
              Save Transaction
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
            >
              Expense
            </button>
            <button 
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'}`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" 
                className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-blue-200 transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-blue-200 transition-colors appearance-none"
              >
                <option>Shopping</option>
                <option>Food</option>
                <option>Subscription</option>
                <option>Work</option>
                <option>Housing</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?" 
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-blue-200 transition-colors"
            />
          </div>

          <div 
            onClick={() => setIsRecurring(!isRecurring)}
            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
              isRecurring ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            <div className="flex items-center space-x-3">
               <RefreshCcwIcon size={20} className={isRecurring ? 'animate-spin-slow' : ''} />
               <span className="font-bold text-sm">Recurring Monthly</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${isRecurring ? 'bg-blue-500' : 'bg-slate-200'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRecurring ? 'left-7' : 'left-1'}`}></div>
            </div>
          </div>
        </div>
      </PopupLayout>
    </PopupTransition>
  );
}
