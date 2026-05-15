CREATE TABLE IF NOT EXISTS public_profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  show_on_leaderboard BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accountability_pledges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  penalty TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accountability_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pledge_id UUID REFERENCES accountability_pledges(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pledge_id, date)
);

ALTER TABLE public_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_pledges DISABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_checkins DISABLE ROW LEVEL SECURITY;
