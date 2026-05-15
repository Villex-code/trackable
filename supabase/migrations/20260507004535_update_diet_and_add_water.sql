-- Add protein to calorie_logs
ALTER TABLE calorie_logs ADD COLUMN IF NOT EXISTS protein INTEGER;

-- Create water_logs table
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS for water_logs
ALTER TABLE water_logs DISABLE ROW LEVEL SECURITY;

-- Add target_water to diet_goals
ALTER TABLE diet_goals ADD COLUMN IF NOT EXISTS target_water INTEGER DEFAULT 2000;
