-- Add affectedTeeth column to treatment_records table
ALTER TABLE treatment_records ADD COLUMN IF NOT EXISTS affected_teeth TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN treatment_records.affected_teeth IS 'Array of tooth IDs (e.g., UR1, UL2) affected by this treatment';