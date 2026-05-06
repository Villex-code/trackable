"use client";

import { useState, useEffect } from "react";
import { PlusIcon, CheckCircle2Icon, CircleIcon, Trash2Icon, TargetIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function TodoSection({ userId }: { userId: string }) {
  const supabase = createClient();
  const [todos, setTodos] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTodos();
  }, [userId]);

  async function fetchTodos() {
    const { data } = await supabase
      .from("work_todos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setTodos(data);
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    const { error } = await supabase.from("work_todos").insert({
      user_id: userId,
      task: newTask
    });
    if (!error) {
      setNewTask("");
      fetchTodos();
    }
  }

  async function toggleTodo(id: string, isCompleted: boolean) {
    const { error } = await supabase.from("work_todos").update({ is_completed: !isCompleted }).eq("id", id);
    if (!error) fetchTodos();
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase.from("work_todos").delete().eq("id", id);
    if (!error) fetchTodos();
  }

  return (
    <div className="flex flex-col h-full bg-white/40 p-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Tasks</p>
        <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">
          {todos.filter(t => !t.is_completed).length} Active
        </span>
      </div>

      {/* Minimal Input Bar */}
      <form onSubmit={addTodo} className="flex items-center space-x-3 mb-8">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task..." 
          className="flex-1 bg-white/80 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-300 transition-all shadow-sm"
        />
        <button type="submit" className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-90">
          <PlusIcon size={20} />
        </button>
      </form>

      {/* List Area */}
      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 min-h-0">
        {todos.map((todo) => (
          <div key={todo.id} className="group flex items-center justify-between p-4 bg-white hover:bg-emerald-50/30 rounded-3xl border border-slate-50 hover:border-emerald-100 transition-all duration-300">
            <button 
              onClick={() => toggleTodo(todo.id, todo.is_completed)}
              className="flex items-center space-x-4 text-left flex-1 min-w-0"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${todo.is_completed ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-emerald-400'}`}>
                {todo.is_completed ? <CheckCircle2Icon size={16} /> : <CircleIcon size={16} />}
              </div>
              <span className={`text-sm font-bold truncate transition-all ${todo.is_completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                {todo.task}
              </span>
            </button>
            <button onClick={() => deleteTodo(todo.id)} className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2Icon size={14} />
            </button>
          </div>
        ))}
        {todos.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4 border border-slate-100/50">
               <TargetIcon size={24} />
             </div>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero pending tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
