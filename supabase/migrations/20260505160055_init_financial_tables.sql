-- Create the financial logs table
CREATE TABLE IF NOT EXISTS financial_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, 
  amount DECIMAL(12,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')), 
  category TEXT NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Disable security checks for these tables
ALTER TABLE financial_logs DISABLE ROW LEVEL SECURITY;
