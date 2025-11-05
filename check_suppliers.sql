-- Check current suppliers table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'suppliers'
ORDER BY ordinal_position;

-- Check if suppliers table exists and has data
SELECT COUNT(*) as supplier_count FROM suppliers;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'suppliers';