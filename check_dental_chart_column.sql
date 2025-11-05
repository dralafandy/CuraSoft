-- Check if 'dental_chart' column exists in 'patients' table and add it if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'patients'
        AND column_name = 'dental_chart'
    ) THEN
        ALTER TABLE patients ADD COLUMN dental_chart JSONB;
        RAISE NOTICE 'Column dental_chart added to patients table.';
    ELSE
        RAISE NOTICE 'Column dental_chart already exists in patients table.';
    END IF;
END $$;