"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { 
  WalletIcon, 
  ArrowUpRightIcon, 
  ArrowDownRightIcon,
  CreditCardIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshCcwIcon,
  PieChartIcon
} from "lucide-react";
import { format, startOfDay, endOfDay, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

// Components
import FinanceCard from "@/components/financials/FinanceCard";
import TransactionItem from "@/components/financials/TransactionItem";
import AddTransactionModal from "@/components/financials/AddTransactionModal";
import FinanceViewSwitcher from "@/components/financials/FinanceViewSwitcher";

export default function FinancialsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    } else if (view === "monthly") {
      start = startOfMonth(selectedDate).toISOString();
      end = endOfMonth(selectedDate).toISOString();
    } else {
      start = startOfYear(selectedDate).toISOString();
      end = endOfYear(selectedDate).toISOString();
    }

    const { data } = await supabase
      .from("financial_logs")
      .select("*")
      .eq("user_id", user?.uid)
      .gte("logged_at", start)
      .lte("logged_at", end)
      .order("logged_at", { ascending: false });

    if (data) setTransactions(data);
    setLoading(false);
  }

  async function handleAddTransaction(data: any) {
    if (!user) return;
    const { error } = await supabase.from("financial_logs").insert({
      ...data,
      user_id: user.uid
    });
    if (!error) {
      setIsModalOpen(false);
      fetchData();
    }
  }

  async function deleteTransaction(id: string) {
    const { error } = await supabase.from("financial_logs").delete().eq("id", id);
    if (!error) fetchData();
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const recurringTotal = transactions.filter(t => t.type === 'expense' && t.is_recurring).reduce((acc, t) => acc + Number(t.amount), 0);
  const oneTimeTotal = transactions.filter(t => t.type === 'expense' && !t.is_recurring).reduce((acc, t) => acc + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Financials</h2>
          <FinanceViewSwitcher view={view} onViewChange={setView} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
           {/* Date Navigation */}
           <div className="flex items-center space-x-4 bg-white/50 p-2 rounded-2xl border border-slate-100">
              <button onClick={() => setSelectedDate(subDays(selectedDate, view === 'daily' ? 1 : view === 'weekly' ? 7 : view === 'monthly' ? 30 : 365))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ChevronLeftIcon size={18} className="text-slate-400" />
              </button>
              <span className="text-slate-700 font-bold text-sm min-w-[140px] text-center">
                {view === 'daily' ? format(selectedDate, "MMM d, yyyy") : 
                 view === 'weekly' ? `${format(startOfWeek(selectedDate), "MMM d")} - ${format(endOfWeek(selectedDate), "MMM d")}` :
                 view === 'monthly' ? format(selectedDate, "MMMM yyyy") :
                 format(selectedDate, "yyyy")}
              </span>
              <button onClick={() => setSelectedDate(addDays(selectedDate, view === 'daily' ? 1 : view === 'weekly' ? 7 : view === 'monthly' ? 30 : 365))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ChevronRightIcon size={18} className="text-slate-400" />
              </button>
           </div>

           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center space-x-2 bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
           >
             <PlusIcon size={18} />
             <span>Add Transaction</span>
           </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinanceCard 
          title="Net Balance" 
          value={`$${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={WalletIcon} 
          color="slate" 
        />
        <FinanceCard 
          title="Total Income" 
          value={`$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={ArrowUpRightIcon} 
          color="emerald" 
          trend="up"
        />
        <FinanceCard 
          title="Recurring Monthly" 
          value={`$${recurringTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={RefreshCcwIcon} 
          color="blue" 
        />
        <FinanceCard 
          title="One-time Expenses" 
          value={`$${oneTimeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={CreditCardIcon} 
          color="purple" 
        />
      </div>

      {/* Split view for Recurring vs One-time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recurring Payments Section */}
        <div className="glass rounded-[40px] border border-white/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center">
                <RefreshCcwIcon size={16} />
              </div>
              <span>Recurring Subscriptions</span>
            </h3>
            <span className="text-sm font-bold text-blue-500">${recurringTotal.toFixed(2)}</span>
          </div>
          <div className="p-4 space-y-2 min-h-[350px]">
            {transactions.filter(t => t.type === 'expense' && t.is_recurring).length > 0 ? (
              transactions.filter(t => t.type === 'expense' && t.is_recurring).map((t) => (
                <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                <RefreshCcwIcon size={40} className="mb-4 opacity-10" />
                <p className="font-medium">No recurring payments found</p>
              </div>
            )}
          </div>
        </div>

        {/* One-time Payments Section */}
        <div className="glass rounded-[40px] border border-white/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-500 flex items-center justify-center">
                <PieChartIcon size={16} />
              </div>
              <span>One-time Expenses</span>
            </h3>
            <span className="text-sm font-bold text-purple-500">${oneTimeTotal.toFixed(2)}</span>
          </div>
          <div className="p-4 space-y-2 min-h-[350px]">
            {transactions.filter(t => t.type === 'expense' && !t.is_recurring).length > 0 ? (
              transactions.filter(t => t.type === 'expense' && !t.is_recurring).map((t) => (
                <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                <CreditCardIcon size={40} className="mb-4 opacity-10" />
                <p className="font-medium">No one-time payments recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddTransaction} 
      />
    </div>
  );
}
