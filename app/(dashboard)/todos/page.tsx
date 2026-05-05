import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function TodosPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight">Supabase Todos</h2>
        <p className="text-text-muted mt-2 text-lg">Fetched directly from your Supabase database.</p>
      </div>

      <div className="glass p-8 rounded-2xl border border-card-border">
        {todos && todos.length > 0 ? (
          <ul className="space-y-4">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span className="font-medium">{todo.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-muted">No todos found in the 'todos' table.</p>
            <p className="text-sm text-text-muted mt-2">Make sure you have a 'todos' table with a 'name' column.</p>
          </div>
        )}
      </div>
    </div>
  )
}
