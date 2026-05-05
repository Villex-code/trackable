-- Create work sessions table
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  comment TEXT,
  rating TEXT,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Create work todos table
CREATE TABLE IF NOT EXISTS work_todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create work reminders table
CREATE TABLE IF NOT EXISTS work_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS for all work tables
ALTER TABLE work_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_reminders DISABLE ROW LEVEL SECURITY;
