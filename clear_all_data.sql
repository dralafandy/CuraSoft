-- Clear All Data Script for CuraSof Clinic Database
-- Run this script in Supabase SQL Editor to clear all data from tables
-- WARNING: This will permanently delete all data in the database!

-- Disable Row Level Security temporarily for deletion
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

-- Clear all data from tables (in correct order due to foreign key constraints)
DELETE FROM payments;
DELETE FROM treatment_records;
DELETE FROM appointments;
DELETE FROM lab_cases;
DELETE FROM supplier_invoices;
DELETE FROM expenses;
DELETE FROM inventory_items;
DELETE FROM suppliers;
DELETE FROM treatment_definitions;
DELETE FROM patients;
DELETE FROM dentists;
DELETE FROM user_profiles;

-- Reset sequences if they exist
-- Note: Supabase handles auto-incrementing IDs automatically

-- Re-enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentists ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Optional: Re-insert default permissions if needed
INSERT INTO permissions (name, description) VALUES
    ('view_patients', 'Can view patient records'),
    ('edit_patients', 'Can add/edit patient records'),
    ('delete_patients', 'Can delete patient records'),
    ('view_appointments', 'Can view appointments'),
    ('edit_appointments', 'Can add/edit appointments'),
    ('view_finances', 'Can view financial data'),
    ('edit_finances', 'Can add/edit financial records'),
    ('view_inventory', 'Can view inventory'),
    ('edit_inventory', 'Can add/edit inventory items'),
    ('view_reports', 'Can view reports'),
    ('manage_users', 'Can manage user accounts and permissions')
ON CONFLICT (name) DO NOTHING;

-- Confirmation message
SELECT 'All data has been cleared successfully!' as status;