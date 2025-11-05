-- Fix Row Level Security Policies for CuraSof Clinic Database
-- Run this script in Supabase SQL Editor to fix RLS policies

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert own patients" ON patients;
DROP POLICY IF EXISTS "Users can update own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete own patients" ON patients;

DROP POLICY IF EXISTS "Users can view own dentists" ON dentists;
DROP POLICY IF EXISTS "Users can insert own dentists" ON dentists;
DROP POLICY IF EXISTS "Users can update own dentists" ON dentists;
DROP POLICY IF EXISTS "Users can delete own dentists" ON dentists;

DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;

DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;

DROP POLICY IF EXISTS "Users can view own inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert own inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory_items" ON inventory_items;

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view own treatment_definitions" ON treatment_definitions;
DROP POLICY IF EXISTS "Users can insert own treatment_definitions" ON treatment_definitions;
DROP POLICY IF EXISTS "Users can update own treatment_definitions" ON treatment_definitions;
DROP POLICY IF EXISTS "Users can delete own treatment_definitions" ON treatment_definitions;

DROP POLICY IF EXISTS "Users can view own treatment_records" ON treatment_records;
DROP POLICY IF EXISTS "Users can insert own treatment_records" ON treatment_records;
DROP POLICY IF EXISTS "Users can update own treatment_records" ON treatment_records;
DROP POLICY IF EXISTS "Users can delete own treatment_records" ON treatment_records;

DROP POLICY IF EXISTS "Users can view own lab_cases" ON lab_cases;
DROP POLICY IF EXISTS "Users can insert own lab_cases" ON lab_cases;
DROP POLICY IF EXISTS "Users can update own lab_cases" ON lab_cases;
DROP POLICY IF EXISTS "Users can delete own lab_cases" ON lab_cases;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON payments;

DROP POLICY IF EXISTS "Users can view own supplier_invoices" ON supplier_invoices;
DROP POLICY IF EXISTS "Users can insert own supplier_invoices" ON supplier_invoices;
DROP POLICY IF EXISTS "Users can update own supplier_invoices" ON supplier_invoices;
DROP POLICY IF EXISTS "Users can delete own supplier_invoices" ON supplier_invoices;

-- Admin policies for user_profiles
DROP POLICY IF EXISTS "Admins can view all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own user_profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own user_profile" ON user_profiles;

-- Permissions policies
DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;

-- Create new simplified policies that work with authenticated users
-- For development/testing, allow authenticated users to access their own data

-- Patients policies
CREATE POLICY "Users can view own patients" ON patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patients" ON patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patients" ON patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own patients" ON patients FOR DELETE USING (auth.uid() = user_id);

-- Dentists policies
CREATE POLICY "Users can view own dentists" ON dentists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dentists" ON dentists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dentists" ON dentists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dentists" ON dentists FOR DELETE USING (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own appointments" ON appointments FOR DELETE USING (auth.uid() = user_id);

-- Suppliers policies
CREATE POLICY "Users can view own suppliers" ON suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suppliers" ON suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suppliers" ON suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own suppliers" ON suppliers FOR DELETE USING (auth.uid() = user_id);

-- Inventory policies
CREATE POLICY "Users can view own inventory_items" ON inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory_items" ON inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory_items" ON inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory_items" ON inventory_items FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Treatment definitions policies
CREATE POLICY "Users can view own treatment_definitions" ON treatment_definitions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own treatment_definitions" ON treatment_definitions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own treatment_definitions" ON treatment_definitions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own treatment_definitions" ON treatment_definitions FOR DELETE USING (auth.uid() = user_id);

-- Treatment records policies
CREATE POLICY "Users can view own treatment_records" ON treatment_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own treatment_records" ON treatment_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own treatment_records" ON treatment_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own treatment_records" ON treatment_records FOR DELETE USING (auth.uid() = user_id);

-- Lab cases policies
CREATE POLICY "Users can view own lab_cases" ON lab_cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lab_cases" ON lab_cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lab_cases" ON lab_cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lab_cases" ON lab_cases FOR DELETE USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payments" ON payments FOR DELETE USING (auth.uid() = user_id);

-- Supplier invoices policies
CREATE POLICY "Users can view own supplier_invoices" ON supplier_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own supplier_invoices" ON supplier_invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own supplier_invoices" ON supplier_invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own supplier_invoices" ON supplier_invoices FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies - Simplified to avoid recursion
-- Allow authenticated users to manage their own profiles
CREATE POLICY "Users can view own user_profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user_profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- For admin operations, we'll handle this through application logic
-- For now, allow all authenticated users to view all profiles (temporary for setup)
CREATE POLICY "Authenticated users can view all user_profiles" ON user_profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage user_profiles" ON user_profiles FOR ALL USING (auth.uid() IS NOT NULL);

-- Permissions policies
CREATE POLICY "Admins can manage permissions" ON permissions FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
);

-- Enable RLS on all tables
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

-- Confirmation message
SELECT 'RLS policies have been fixed and re-enabled successfully!' as status;