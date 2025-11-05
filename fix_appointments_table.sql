-- Fix appointments table by adding missing reminder_sent column
-- Run this in Supabase SQL Editor if the appointments table is missing the reminder_sent column

-- Add missing reminder_sent column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'reminder_sent';