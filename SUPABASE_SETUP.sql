-- ============================================
-- SUPABASE SQL SETUP SCRIPT
-- Daily Activities Tracker Database Schema
-- ============================================

-- 1. Add system and editedBy columns to existing activities table
-- (Skip instrument column if it already exists)
ALTER TABLE activities ADD COLUMN system TEXT NOT NULL DEFAULT '';
ALTER TABLE activities ADD COLUMN editedBy TEXT;

-- 2. Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_activities_performer ON activities(performer);
CREATE INDEX IF NOT EXISTS idx_activities_instrument ON activities(instrument);
CREATE INDEX IF NOT EXISTS idx_activities_system ON activities(system);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);

-- ============================================
-- OPTIONAL: Enable Row Level Security (RLS)
-- ============================================
-- Uncomment these if you want to enable RLS (recommended for production)

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFY TABLE STRUCTURES (Run these separately to check)
-- ============================================
-- SELECT * FROM information_schema.columns WHERE table_name = 'activities';
-- SELECT * FROM information_schema.columns WHERE table_name = 'users';

