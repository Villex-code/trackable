"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
  WalletIcon,
  ArrowUpRightIcon,
  CreditCardIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshCcwIcon,
  PieChartIcon,
  ShareIcon,
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
  startOfYear,
  endOfYear,
} from "date-fns";
import NutritionCard from "@/components/diet/NutritionCard";
import TransactionItem from "@/components/financials/TransactionItem";
import AddTransactionModal from "@/components/financials/AddTransactionModal";
import FinanceViewSwitcher from "@/components/financials/FinanceViewSwitcher";
import BulkImportModal from "@/components/global/BulkImportModal";
import MainContentWrapper from "@/components/MainContentWrapper";

export default function FinancialsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [view, setView] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
  }

  async function handleAddTransaction(data: any) {
    if (!user) return;
    const { error } = await supabase.from("financial_logs").insert({ ...data, user_id: user.uid });
    if (!error) { setIsModalOpen(false); fetchData(); }
  }

  async function handleBulkImport(data: any[]) {
    if (!user) return;
    const logsWithUser = data.map((item) => ({
      ...item,
      user_id: user.uid,
      logged_at: item.logged_at || new Date().toISOString(),
    }));
    const { error } = await supabase.from("financial_logs").insert(logsWithUser);
    if (error) throw error;
    fetchData();
  }

  async function deleteTransaction(id: string) {
    const { error } = await supabase.from("financial_logs").delete().eq("id", id);
    if (!error) fetchData();
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0);
  const recurringTotal = transactions.filter((t) => t.type === "expense" && t.is_recurring).reduce((acc, t) => acc + Number(t.amount), 0);
  const oneTimeTotal = transactions.filter((t) => t.type === "expense" && !t.is_recurring).reduce((acc, t) => acc + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  const dayStep = view === "daily" ? 1 : view === "weekly" ? 7 : view === "monthly" ? 30 : 365;
  const dateLabel =
    view === "daily"
      ? format(selectedDate, "MMM d, yyyy")
      : view === "weekly"
        ? `${format(startOfWeek(selectedDate), "MMM d")} – ${format(endOfWeek(selectedDate), "MMM d")}`
        : view === "monthly"
          ? format(selectedDate, "MMMM yyyy")
          : format(selectedDate, "yyyy");

  return (
    <MainContentWrapper
      topbarBody={
        <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <h2 className="text-[15px] font-black text-slate-800 tracking-tight">Financials</h2>
            <div className="hidden md:block">
              <FinanceViewSwitcher view={view} onViewChange={setView} />
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center bg-brand-orange-50/80 p-1 rounded-xl border border-brand-orange-100/60">
              <button
                onClick={() => setSelectedDate(subDays(selectedDate, dayStep))}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronLeftIcon size={14} className="text-slate-400" />
              </button>
              <span className="text-slate-700 font-bold text-xs min-w-[110px] text-center px-1">
                {dateLabel}
              </span>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, dayStep))}
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
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-brand-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange-200"
            >
              <PlusIcon size={14} />
              Add Transaction
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-8 pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <NutritionCard title="Net Balance" value={netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} icon={WalletIcon} color="orange" unit="$" />
          <NutritionCard title="Total Income" value={totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })} icon={ArrowUpRightIcon} color="emerald" unit="$" />
          <NutritionCard title="Recurring" value={recurringTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} icon={RefreshCcwIcon} color="blue" unit="$" />
          <NutritionCard title="Expenses" value={oneTimeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} icon={CreditCardIcon} color="purple" unit="$" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass rounded-[32px] border border-white/60 overflow-hidden">
            <div className="p-7 border-b border-brand-orange-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center">
                  <RefreshCcwIcon size={15} />
                </div>
                Recurring Subscriptions
              </h3>
              <span className="text-sm font-black text-blue-500">${recurringTotal.toFixed(2)}</span>
            </div>
            <div className="p-4 space-y-2 min-h-[300px]">
              {transactions.filter((t) => t.type === "expense" && t.is_recurring).length > 0 ? (
                transactions.filter((t) => t.type === "expense" && t.is_recurring).map((t) => (
                  <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                  <RefreshCcwIcon size={36} className="mb-4 opacity-10" />
                  <p className="font-medium">No recurring payments found</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-[32px] border border-white/60 overflow-hidden">
            <div className="p-7 border-b border-brand-orange-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-500 flex items-center justify-center">
                  <PieChartIcon size={15} />
                </div>
                One-time Expenses
              </h3>
              <span className="text-sm font-black text-purple-500">${oneTimeTotal.toFixed(2)}</span>
            </div>
            <div className="p-4 space-y-2 min-h-[300px]">
              {transactions.filter((t) => t.type === "expense" && !t.is_recurring).length > 0 ? (
                transactions.filter((t) => t.type === "expense" && !t.is_recurring).map((t) => (
                  <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                  <CreditCardIcon size={36} className="mb-4 opacity-10" />
                  <p className="font-medium">No one-time payments recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
        title="Financial Transactions"
        expectedFields={["amount", "type", "category", "is_recurring"]}
      />
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </MainContentWrapper>
  );
}
