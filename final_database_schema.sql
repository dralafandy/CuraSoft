-- CuraSoft Clinic Database Schema - FINAL VERSION
-- Complete schema matching existing database structure with snake_case columns
-- Execute this script in Supabase SQL Editor to create all required tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- CORE ENTITIES
-- ===========================================

-- Patients table (assuming this exists, but defining for completeness)
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    medical_history TEXT,
    treatment_notes TEXT,
    last_visit DATE,
    allergies TEXT,
    medications TEXT,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    dental_chart JSONB NOT NULL DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dentists table (assuming this exists, but defining for completeness)
CREATE TABLE IF NOT EXISTS dentists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- APPOINTMENT MANAGEMENT
-- ===========================================

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id UUID REFERENCES dentists(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    reminder_time TEXT CHECK (reminder_time IN ('none', '1_hour_before', '2_hours_before', '1_day_before')),
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- SUPPLIER MANAGEMENT
-- ===========================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    type TEXT NOT NULL CHECK (type IN ('Material Supplier', 'Dental Lab')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INVENTORY MANAGEMENT
-- ===========================================

-- Inventory Items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- FINANCIAL MANAGEMENT
-- ===========================================

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('RENT', 'SALARIES', 'UTILITIES', 'LAB_FEES', 'SUPPLIES', 'MARKETING', 'MISC')),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_invoice_id UUID REFERENCES supplier_invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment Definitions table
CREATE TABLE IF NOT EXISTS treatment_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    doctor_percentage DECIMAL(5,4) NOT NULL CHECK (doctor_percentage >= 0 AND doctor_percentage <= 1),
    clinic_percentage DECIMAL(5,4) NOT NULL CHECK (clinic_percentage >= 0 AND clinic_percentage <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment Records table
CREATE TABLE IF NOT EXISTS treatment_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id UUID REFERENCES dentists(id) ON DELETE CASCADE,
    treatment_date DATE NOT NULL,
    treatment_definition_id UUID REFERENCES treatment_definitions(id) ON DELETE CASCADE,
    notes TEXT,
    inventory_items_used JSONB DEFAULT '[]',
    total_treatment_cost DECIMAL(10,2) NOT NULL,
    doctor_share DECIMAL(10,2) NOT NULL,
    clinic_share DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('Cash', 'Credit Card', 'Bank Transfer', 'Other', 'Discount')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- LAB CASE MANAGEMENT
-- ===========================================

-- Lab Cases table
CREATE TABLE IF NOT EXISTS lab_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    case_type TEXT NOT NULL,
    sent_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT_TO_LAB', 'RECEIVED_FROM_LAB', 'FITTED_TO_PATIENT', 'CANCELLED')),
    lab_cost DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- SUPPLIER INVOICES
-- ===========================================

-- Supplier Invoices table
CREATE TABLE IF NOT EXISTS supplier_invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    invoice_number TEXT,
    invoice_date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID')),
    items JSONB DEFAULT '[]',
    invoice_image_url TEXT,
    images TEXT[] DEFAULT '{}',
    payments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- USER MANAGEMENT
-- ===========================================

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'DOCTOR', 'ASSISTANT', 'RECEPTIONIST')),
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Dentists indexes
CREATE INDEX IF NOT EXISTS idx_dentists_user_id ON dentists(user_id);
CREATE INDEX IF NOT EXISTS idx_dentists_name ON dentists(name);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dentist_id ON appointments(dentist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_id ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON inventory_items(name);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_supplier_id ON expenses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_expenses_supplier_invoice_id ON expenses(supplier_invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Treatment definitions indexes
CREATE INDEX IF NOT EXISTS idx_treatment_definitions_user_id ON treatment_definitions(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_definitions_name ON treatment_definitions(name);

-- Treatment records indexes
CREATE INDEX IF NOT EXISTS idx_treatment_records_user_id ON treatment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_records_patient_id ON treatment_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_records_dentist_id ON treatment_records(dentist_id);
CREATE INDEX IF NOT EXISTS idx_treatment_records_treatment_date ON treatment_records(treatment_date);

-- Lab cases indexes
CREATE INDEX IF NOT EXISTS idx_lab_cases_user_id ON lab_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_cases_patient_id ON lab_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_cases_lab_id ON lab_cases(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_cases_status ON lab_cases(status);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

-- Supplier invoices indexes
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_user_id ON supplier_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier_id ON supplier_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_status ON supplier_invoices(status);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Note: RLS is enabled after policies are created to avoid conflicts during initial setup
-- If you need to insert data during setup, temporarily disable RLS for specific tables

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- Patients policies
DROP POLICY IF EXISTS "Users can view own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert own patients" ON patients;
DROP POLICY IF EXISTS "Users can update own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete own patients" ON patients;
CREATE POLICY "Users can view own patients" ON patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patients" ON patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patients" ON patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own patients" ON patients FOR DELETE USING (auth.uid() = user_id);

-- Dentists policies
DROP POLICY IF EXISTS "Users can view own dentists" ON dentists;
DROP POLICY IF EXISTS "Users can insert own dentists" ON dentists;
DROP POLICY IF EXISTS "Users can update own dentists" ON dentists;
DROP POLICY IF EXISTS "Users can delete own dentists" ON dentists;
CREATE POLICY "Users can view own dentists" ON dentists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dentists" ON dentists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dentists" ON dentists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dentists" ON dentists FOR DELETE USING (auth.uid() = user_id);

-- Appointments policies
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own appointments" ON appointments FOR DELETE USING (auth.uid() = user_id);

-- Suppliers policies
DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
CREATE POLICY "Users can view own suppliers" ON suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suppliers" ON suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suppliers" ON suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own suppliers" ON suppliers FOR DELETE USING (auth.uid() = user_id);

-- Inventory policies
DROP POLICY IF EXISTS "Users can view own inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert own inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory_items" ON inventory_items;
CREATE POLICY "Users can view own inventory_items" ON inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory_items" ON inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory_items" ON inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory_items" ON inventory_items FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Treatment definitions policies
DROP POLICY IF EXISTS "Users can view own treatment_definitions" ON treatment_definitions;
DROP POLICY IF EXISTS "Users can insert own treatment_definitions" ON treatment_definitions;
DROP POLICY IF EXISTS "Users can update own treatment_definitions" ON treatment_definitions;
DROP POLICY IF EXISTS "Users can delete own treatment_definitions" ON treatment_definitions;
CREATE POLICY "Users can view own treatment_definitions" ON treatment_definitions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own treatment_definitions" ON treatment_definitions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own treatment_definitions" ON treatment_definitions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own treatment_definitions" ON treatment_definitions FOR DELETE USING (auth.uid() = user_id);

-- Treatment records policies
DROP POLICY IF EXISTS "Users can view own treatment_records" ON treatment_records;
DROP POLICY IF EXISTS "Users can insert own treatment_records" ON treatment_records;
DROP POLICY IF EXISTS "Users can update own treatment_records" ON treatment_records;
DROP POLICY IF EXISTS "Users can delete own treatment_records" ON treatment_records;
CREATE POLICY "Users can view own treatment_records" ON treatment_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own treatment_records" ON treatment_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own treatment_records" ON treatment_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own treatment_records" ON treatment_records FOR DELETE USING (auth.uid() = user_id);

-- Lab cases policies
DROP POLICY IF EXISTS "Users can view own lab_cases" ON lab_cases;
DROP POLICY IF EXISTS "Users can insert own lab_cases" ON lab_cases;
DROP POLICY IF EXISTS "Users can update own lab_cases" ON lab_cases;
DROP POLICY IF EXISTS "Users can delete own lab_cases" ON lab_cases;
CREATE POLICY "Users can view own lab_cases" ON lab_cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lab_cases" ON lab_cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lab_cases" ON lab_cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lab_cases" ON lab_cases FOR DELETE USING (auth.uid() = user_id);

-- Payments policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payments" ON payments FOR DELETE USING (auth.uid() = user_id);

-- Supplier invoices policies
DROP POLICY IF EXISTS "Users can view own supplier_invoices" ON supplier_invoices;
DROP POLICY IF EXISTS "Users can insert own supplier_invoices" ON supplier_invoices;
DROP POLICY IF EXISTS "Users can update own supplier_invoices" ON supplier_invoices;
DROP POLICY IF EXISTS "Users can delete own supplier_invoices" ON supplier_invoices;
CREATE POLICY "Users can view own supplier_invoices" ON supplier_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own supplier_invoices" ON supplier_invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own supplier_invoices" ON supplier_invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own supplier_invoices" ON supplier_invoices FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies (special admin policies)
DROP POLICY IF EXISTS "Admins can view all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own user_profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own user_profile" ON user_profiles;
CREATE POLICY "Admins can view all user_profiles" ON user_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Admins can insert user_profiles" ON user_profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Admins can update user_profiles" ON user_profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Admins can delete user_profiles" ON user_profiles FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Users can view own user_profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own user_profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Permissions policies
DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;
CREATE POLICY "Admins can manage permissions" ON permissions FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
);

-- ===========================================
-- ROW LEVEL SECURITY - DISABLED FOR DEVELOPMENT
-- ===========================================

-- Note: RLS is DISABLED for development/testing purposes
-- Re-enable these when authentication is properly configured

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

-- ===========================================
-- DEFAULT DATA
-- ===========================================

-- Insert default permissions (RLS is enabled, so this will work for authenticated admin users)
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