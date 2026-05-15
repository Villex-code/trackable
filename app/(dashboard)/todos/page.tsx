import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import MainContentWrapper from '@/components/MainContentWrapper'

export default async function TodosPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: todos } = await supabase.from('todos').select()

  return (
    <MainContentWrapper
      topbarBody={
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-brand-orange-500" />
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Todos</h2>
        </div>
      }
    >
      <div className="space-y-8 pb-24">
        <div className="glass p-8 rounded-[32px] border border-white/60">
          <h3 className="text-xl font-bold text-slate-800 mb-8">Todo List</h3>
          {todos && todos.length > 0 ? (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li key={todo.id} className="flex items-center gap-3 p-4 rounded-2xl bg-brand-orange-50/40 border border-brand-orange-100/40">
                  <div className="w-2 h-2 rounded-full bg-brand-orange-500 shrink-0" />
                  <span className="font-medium text-slate-800">{todo.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="font-medium">No todos found</p>
              <p className="text-sm mt-1 opacity-70">Make sure you have a todos table with a name column.</p>
            </div>
          )}
        </div>
      </div>
    </MainContentWrapper>
  )
}
