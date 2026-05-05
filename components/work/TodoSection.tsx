"use client";

import { useState, useEffect } from "react";
import { PlusIcon, CheckCircle2Icon, CircleIcon, Trash2Icon } from "lucide-react";
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
    <div className="glass rounded-[32px] border border-white/50 overflow-hidden flex flex-col h-[350px]">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/20">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Quick Todos</h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
          {todos.filter(t => !t.is_completed).length} Pending
        </span>
      </div>
      
      <div className="p-5 flex-1 flex flex-col min-h-0">
        <form onSubmit={addTodo} className="flex space-x-2 mb-4">
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a quick task..." 
            className="flex-1 bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-200 transition-all"
          />
          <button type="submit" className="w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95">
            <PlusIcon size={18} />
          </button>
        </form>

        <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 pr-2">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center justify-between group p-2 hover:bg-white/40 rounded-xl transition-all">
              <button 
                onClick={() => toggleTodo(todo.id, todo.is_completed)}
                className="flex items-center space-x-3 text-left flex-1 min-w-0"
              >
                {todo.is_completed ? (
                  <CheckCircle2Icon size={16} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <CircleIcon size={16} className="text-slate-300 flex-shrink-0" />
                )}
                <span className={`text-xs font-bold truncate transition-all ${todo.is_completed ? 'text-slate-300 line-through' : 'text-slate-600'}`}>
                  {todo.task}
                </span>
              </button>
              <button onClick={() => deleteTodo(todo.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                <Trash2Icon size={14} />
              </button>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-30 scale-75">
               <PlusIcon size={40} className="text-slate-300 mb-2" />
               <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No Active Tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
