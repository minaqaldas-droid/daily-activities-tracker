-- ============================================
-- MIGRATION: Add missing columns to activities table
-- ============================================

-- Add system column if it doesn't exist
ALTER TABLE activities ADD COLUMN IF NOT EXISTS system TEXT DEFAULT '';

-- Add editedBy column if it doesn't exist  
ALTER TABLE activities ADD COLUMN IF NOT EXISTS editedBy TEXT;

-- Verify the columns were added
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'activities' ORDER BY ordinal_position;
