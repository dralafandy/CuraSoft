-- CuraSof Clinic Database Schema - Generated from TypeScript interfaces
-- This schema ensures all columns used in the application are present in the database
-- Run this in Supabase SQL Editor to add any missing columns

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- PATIENTS TABLE - Complete column check
-- ===========================================
-- Check and add missing columns to patients table
DO $$
BEGIN
    -- Basic patient info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'id') THEN
        ALTER TABLE patients ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'user_id') THEN
        ALTER TABLE patients ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'name') THEN
        ALTER TABLE patients ADD COLUMN name TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'dob') THEN
        ALTER TABLE patients ADD COLUMN dob DATE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'gender') THEN
        ALTER TABLE patients ADD COLUMN gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'phone') THEN
        ALTER TABLE patients ADD COLUMN phone TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'email') THEN
        ALTER TABLE patients ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'address') THEN
        ALTER TABLE patients ADD COLUMN address TEXT;
    END IF;

    -- Medical info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'medical_history') THEN
        ALTER TABLE patients ADD COLUMN medical_history TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'treatment_notes') THEN
        ALTER TABLE patients ADD COLUMN treatment_notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'last_visit') THEN
        ALTER TABLE patients ADD COLUMN last_visit DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'allergies') THEN
        ALTER TABLE patients ADD COLUMN allergies TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'medications') THEN
        ALTER TABLE patients ADD COLUMN medications TEXT;
    END IF;

    -- Insurance info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'insurance_provider') THEN
        ALTER TABLE patients ADD COLUMN insurance_provider TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'insurance_policy_number') THEN
        ALTER TABLE patients ADD COLUMN insurance_policy_number TEXT;
    END IF;

    -- Emergency contacts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact_phone TEXT;
    END IF;

    -- Dental chart and images
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'dental_chart') THEN
        ALTER TABLE patients ADD COLUMN dental_chart JSONB NOT NULL DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'images') THEN
        ALTER TABLE patients ADD COLUMN images TEXT[] DEFAULT '{}';
    END IF;

    -- Timestamps
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'created_at') THEN
        ALTER TABLE patients ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'updated_at') THEN
        ALTER TABLE patients ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- DENTISTS TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dentists' AND column_name = 'id') THEN
        ALTER TABLE dentists ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dentists' AND column_name = 'user_id') THEN
        ALTER TABLE dentists ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dentists' AND column_name = 'name') THEN
        ALTER TABLE dentists ADD COLUMN name TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dentists' AND column_name = 'specialty') THEN
        ALTER TABLE dentists ADD COLUMN specialty TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dentists' AND column_name = 'color') THEN
        ALTER TABLE dentists ADD COLUMN color TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dentists' AND column_name = 'created_at') THEN
        ALTER TABLE dentists ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dentists' AND column_name = 'updated_at') THEN
        ALTER TABLE dentists ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- APPOINTMENTS TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'id') THEN
        ALTER TABLE appointments ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'user_id') THEN
        ALTER TABLE appointments ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'patient_id') THEN
        ALTER TABLE appointments ADD COLUMN patient_id UUID REFERENCES patients(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'dentist_id') THEN
        ALTER TABLE appointments ADD COLUMN dentist_id UUID REFERENCES dentists(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'start_time') THEN
        ALTER TABLE appointments ADD COLUMN start_time TIMESTAMP WITH TIME ZONE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'end_time') THEN
        ALTER TABLE appointments ADD COLUMN end_time TIMESTAMP WITH TIME ZONE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'reason') THEN
        ALTER TABLE appointments ADD COLUMN reason TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'status') THEN
        ALTER TABLE appointments ADD COLUMN status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'reminder_time') THEN
        ALTER TABLE appointments ADD COLUMN reminder_time TEXT CHECK (reminder_time IN ('none', '1_hour_before', '2_hours_before', '1_day_before'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'reminder_sent') THEN
        ALTER TABLE appointments ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'created_at') THEN
        ALTER TABLE appointments ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'updated_at') THEN
        ALTER TABLE appointments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- SUPPLIERS TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'id') THEN
        ALTER TABLE suppliers ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'user_id') THEN
        ALTER TABLE suppliers ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'name') THEN
        ALTER TABLE suppliers ADD COLUMN name TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'contact_person') THEN
        ALTER TABLE suppliers ADD COLUMN contact_person TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'phone') THEN
        ALTER TABLE suppliers ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'email') THEN
        ALTER TABLE suppliers ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'type') THEN
        ALTER TABLE suppliers ADD COLUMN type TEXT NOT NULL CHECK (type IN ('Material Supplier', 'Dental Lab'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'created_at') THEN
        ALTER TABLE suppliers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'updated_at') THEN
        ALTER TABLE suppliers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- INVENTORY_ITEMS TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'id') THEN
        ALTER TABLE inventory_items ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'user_id') THEN
        ALTER TABLE inventory_items ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'name') THEN
        ALTER TABLE inventory_items ADD COLUMN name TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'description') THEN
        ALTER TABLE inventory_items ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'supplier_id') THEN
        ALTER TABLE inventory_items ADD COLUMN supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'current_stock') THEN
        ALTER TABLE inventory_items ADD COLUMN current_stock INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'unit_cost') THEN
        ALTER TABLE inventory_items ADD COLUMN unit_cost DECIMAL(10,2) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'min_stock_level') THEN
        ALTER TABLE inventory_items ADD COLUMN min_stock_level INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'expiry_date') THEN
        ALTER TABLE inventory_items ADD COLUMN expiry_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'created_at') THEN
        ALTER TABLE inventory_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'updated_at') THEN
        ALTER TABLE inventory_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- EXPENSES TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'id') THEN
        ALTER TABLE expenses ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'user_id') THEN
        ALTER TABLE expenses ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'date') THEN
        ALTER TABLE expenses ADD COLUMN date DATE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'description') THEN
        ALTER TABLE expenses ADD COLUMN description TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'amount') THEN
        ALTER TABLE expenses ADD COLUMN amount DECIMAL(10,2) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'category') THEN
        ALTER TABLE expenses ADD COLUMN category TEXT NOT NULL CHECK (category IN ('RENT', 'SALARIES', 'UTILITIES', 'LAB_FEES', 'SUPPLIES', 'MARKETING', 'MISC'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'supplier_id') THEN
        ALTER TABLE expenses ADD COLUMN supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'supplier_invoice_id') THEN
        ALTER TABLE expenses ADD COLUMN supplier_invoice_id UUID REFERENCES supplier_invoices(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'created_at') THEN
        ALTER TABLE expenses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'updated_at') THEN
        ALTER TABLE expenses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- TREATMENT_DEFINITIONS TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_definitions' AND column_name = 'id') THEN
        ALTER TABLE treatment_definitions ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_definitions' AND column_name = 'user_id') THEN
        ALTER TABLE treatment_definitions ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_definitions' AND column_name = 'name') THEN
        ALTER TABLE treatment_definitions ADD COLUMN name TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_definitions' AND column_name = 'description') THEN
        ALTER TABLE treatment_definitions ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_definitions' AND column_name = 'base_price') THEN
        ALTER TABLE treatment_definitions ADD COLUMN base_price DECIMAL(10,2) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_definitions' AND column_name = 'doctor_percentage') THEN
        ALTER TABLE treatment_definitions ADD COLUMN doctor_percentage DECIMAL(5,4) NOT NULL CHECK (doctor_percentage >= 0 AND doctor_percentage <= 1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_definitions' AND column_name = 'clinic_percentage') THEN
        ALTER TABLE treatment_definitions ADD COLUMN clinic_percentage DECIMAL(5,4) NOT NULL CHECK (clinic_percentage >= 0 AND clinic_percentage <= 1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_definitions' AND column_name = 'created_at') THEN
        ALTER TABLE treatment_definitions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_definitions' AND column_name = 'updated_at') THEN
        ALTER TABLE treatment_definitions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- TREATMENT_RECORDS TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'id') THEN
        ALTER TABLE treatment_records ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'user_id') THEN
        ALTER TABLE treatment_records ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'patient_id') THEN
        ALTER TABLE treatment_records ADD COLUMN patient_id UUID REFERENCES patients(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'dentist_id') THEN
        ALTER TABLE treatment_records ADD COLUMN dentist_id UUID REFERENCES dentists(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'treatment_date') THEN
        ALTER TABLE treatment_records ADD COLUMN treatment_date DATE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'treatment_definition_id') THEN
        ALTER TABLE treatment_records ADD COLUMN treatment_definition_id UUID REFERENCES treatment_definitions(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'notes') THEN
        ALTER TABLE treatment_records ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'inventory_items_used') THEN
        ALTER TABLE treatment_records ADD COLUMN inventory_items_used JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'total_treatment_cost') THEN
        ALTER TABLE treatment_records ADD COLUMN total_treatment_cost DECIMAL(10,2) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'doctor_share') THEN
        ALTER TABLE treatment_records ADD COLUMN doctor_share DECIMAL(10,2) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'clinic_share') THEN
        ALTER TABLE treatment_records ADD COLUMN clinic_share DECIMAL(10,2) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'created_at') THEN
        ALTER TABLE treatment_records ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_records' AND column_name = 'updated_at') THEN
        ALTER TABLE treatment_records ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- PAYMENTS TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'id') THEN
        ALTER TABLE payments ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'user_id') THEN
        ALTER TABLE payments ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'patient_id') THEN
        ALTER TABLE payments ADD COLUMN patient_id UUID REFERENCES patients(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'date') THEN
        ALTER TABLE payments ADD COLUMN date DATE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount') THEN
        ALTER TABLE payments ADD COLUMN amount DECIMAL(10,2) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'method') THEN
        ALTER TABLE payments ADD COLUMN method TEXT NOT NULL CHECK (method IN ('Cash', 'Credit Card', 'Bank Transfer', 'Other', 'Discount'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'notes') THEN
        ALTER TABLE payments ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'created_at') THEN
        ALTER TABLE payments ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'updated_at') THEN
        ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- LAB_CASES TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'id') THEN
        ALTER TABLE lab_cases ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'user_id') THEN
        ALTER TABLE lab_cases ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'patient_id') THEN
        ALTER TABLE lab_cases ADD COLUMN patient_id UUID REFERENCES patients(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'lab_id') THEN
        ALTER TABLE lab_cases ADD COLUMN lab_id UUID REFERENCES suppliers(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'case_type') THEN
        ALTER TABLE lab_cases ADD COLUMN case_type TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'sent_date') THEN
        ALTER TABLE lab_cases ADD COLUMN sent_date DATE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'due_date') THEN
        ALTER TABLE lab_cases ADD COLUMN due_date DATE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'return_date') THEN
        ALTER TABLE lab_cases ADD COLUMN return_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'status') THEN
        ALTER TABLE lab_cases ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT_TO_LAB', 'RECEIVED_FROM_LAB', 'FITTED_TO_PATIENT', 'CANCELLED'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'lab_cost') THEN
        ALTER TABLE lab_cases ADD COLUMN lab_cost DECIMAL(10,2) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'notes') THEN
        ALTER TABLE lab_cases ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'created_at') THEN
        ALTER TABLE lab_cases ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_cases' AND column_name = 'updated_at') THEN
        ALTER TABLE lab_cases ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- SUPPLIER_INVOICES TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'id') THEN
        ALTER TABLE supplier_invoices ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'user_id') THEN
        ALTER TABLE supplier_invoices ADD COLUMN user_id UUID NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'supplier_id') THEN
        ALTER TABLE supplier_invoices ADD COLUMN supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'invoice_number') THEN
        ALTER TABLE supplier_invoices ADD COLUMN invoice_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'invoice_date') THEN
        ALTER TABLE supplier_invoices ADD COLUMN invoice_date DATE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'due_date') THEN
        ALTER TABLE supplier_invoices ADD COLUMN due_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'amount') THEN
        ALTER TABLE supplier_invoices ADD COLUMN amount DECIMAL(10,2) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'status') THEN
        ALTER TABLE supplier_invoices ADD COLUMN status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'items') THEN
        ALTER TABLE supplier_invoices ADD COLUMN items JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'invoice_image_url') THEN
        ALTER TABLE supplier_invoices ADD COLUMN invoice_image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'images') THEN
        ALTER TABLE supplier_invoices ADD COLUMN images TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'payments') THEN
        ALTER TABLE supplier_invoices ADD COLUMN payments JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'created_at') THEN
        ALTER TABLE supplier_invoices ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_invoices' AND column_name = 'updated_at') THEN
        ALTER TABLE supplier_invoices ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- USER_PROFILES TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'id') THEN
        ALTER TABLE user_profiles ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
        ALTER TABLE user_profiles ADD COLUMN user_id UUID NOT NULL UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'username') THEN
        ALTER TABLE user_profiles ADD COLUMN username TEXT NOT NULL UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE user_profiles ADD COLUMN role TEXT NOT NULL CHECK (role IN ('ADMIN', 'DOCTOR', 'ASSISTANT', 'RECEPTIONIST'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'permissions') THEN
        ALTER TABLE user_profiles ADD COLUMN permissions TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'created_at') THEN
        ALTER TABLE user_profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- PERMISSIONS TABLE - Complete column check
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'id') THEN
        ALTER TABLE permissions ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'name') THEN
        ALTER TABLE permissions ADD COLUMN name TEXT NOT NULL UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'description') THEN
        ALTER TABLE permissions ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'created_at') THEN
        ALTER TABLE permissions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
DO $$
BEGIN
    RAISE NOTICE 'Database schema verification completed. All required columns have been added or verified.';
END $$;