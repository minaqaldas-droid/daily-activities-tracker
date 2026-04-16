-- ============================================
-- MIGRATION: Add performer_mode column to settings table
-- ============================================

-- Add performer_mode column to settings table if it doesn't exist
ALTER TABLE settings ADD COLUMN IF NOT EXISTS performer_mode VARCHAR DEFAULT 'manual';

-- Add check constraint to ensure valid values
-- Note: This may fail if the constraint already exists
ALTER TABLE settings ADD CONSTRAINT check_performer_mode 
  CHECK (performer_mode IN ('manual', 'auto'));

-- Set default for existing rows (just in case)
UPDATE settings SET performer_mode = 'manual' WHERE performer_mode IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default FROM information_schema.columns 
WHERE table_name = 'settings' AND column_name = 'performer_mode';
