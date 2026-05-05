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
    <div className="glass rounded-[32px] border border-white/50 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Quick Todos</h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {todos.filter(t => !t.is_completed).length} Pending
        </span>
      </div>
      
      <div className="p-6">
        <form onSubmit={addTodo} className="flex space-x-3 mb-6">
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a quick task..." 
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-200"
          />
          <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <PlusIcon size={18} />
          </button>
        </form>

        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center justify-between group">
              <button 
                onClick={() => toggleTodo(todo.id, todo.is_completed)}
                className="flex items-center space-x-3 text-left"
              >
                {todo.is_completed ? (
                  <CheckCircle2Icon size={18} className="text-emerald-500" />
                ) : (
                  <CircleIcon size={18} className="text-slate-300" />
                )}
                <span className={`text-sm font-medium ${todo.is_completed ? 'text-slate-300 line-through' : 'text-slate-600'}`}>
                  {todo.task}
                </span>
              </button>
              <button onClick={() => deleteTodo(todo.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2Icon size={14} />
              </button>
            </div>
          ))}
          {todos.length === 0 && (
            <p className="text-center text-slate-300 text-xs py-4 italic">No tasks for now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
