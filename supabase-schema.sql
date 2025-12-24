-- Supabase SQL Schema for API Keys Management
-- Run this in your Supabase SQL Editor (Database > SQL Editor)

-- Create the api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(10) NOT NULL DEFAULT 'dev' CHECK (type IN ('dev', 'prod')),
  usage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the key column for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust based on your auth needs)
-- For now, this allows anonymous access - you should adjust this for production
CREATE POLICY "Allow all operations on api_keys" ON api_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions to the anon role
GRANT ALL ON api_keys TO anon;
GRANT ALL ON api_keys TO authenticated;

