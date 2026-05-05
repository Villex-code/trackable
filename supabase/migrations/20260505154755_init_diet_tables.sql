-- Create the caloric logs table
CREATE TABLE IF NOT EXISTS calorie_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, 
  amount INTEGER NOT NULL,
  type TEXT CHECK (type IN ('input', 'output')), 
  description TEXT,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Create the diet goals table
CREATE TABLE IF NOT EXISTS diet_goals (
  user_id TEXT PRIMARY KEY,
  daily_target INTEGER DEFAULT 2000,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Disable security checks for these tables
ALTER TABLE calorie_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE diet_goals DISABLE ROW LEVEL SECURITY;
