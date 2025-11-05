-- Script to temporarily disable Row Level Security (RLS) on all tables for development testing
-- This script disables RLS on all clinic management tables and provides confirmation

-- Disable RLS on all tables
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE dentists DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE lab_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;

-- Confirmation: Check RLS status for all tables
-- This query will show 'f' (false) for rowsecurity column if RLS is disabled
SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM
    pg_tables
WHERE
    schemaname = 'public'
    AND tablename IN (
        'patients',
        'dentists',
        'appointments',
        'suppliers',
        'inventory_items',
        'expenses',
        'treatment_definitions',
        'treatment_records',
        'lab_cases',
        'payments',
        'supplier_invoices',
        'user_profiles',
        'permissions'
    )
ORDER BY
    tablename;

-- Note: To re-enable RLS, run the corresponding ALTER TABLE ... ENABLE ROW LEVEL SECURITY; commands
-- This is typically done after development testing is complete