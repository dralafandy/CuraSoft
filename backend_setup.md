# Supabase Backend Setup Guide for CuraSoft

Follow these steps to set up your free cloud database and authentication for the CuraSoft application. This will take about 10-15 minutes.

## Step 1: Create a Supabase Account and Project

1.  Go to [supabase.com](https://supabase.com) and click **"Start your project"**.
2.  Sign up using your GitHub account or email. It's completely free.
3.  Once you are in the Supabase dashboard, click **"New project"**.
4.  Choose an organization (you can just use the default one).
5.  Give your project a **Name** (e.g., `curasoft-clinic`).
6.  Generate a secure **Database Password**. Save this password somewhere safe, although you won't need it for the app itself.
7.  Choose a **Region** that is closest to you.
8.  Click **"Create new project"**. Wait a few minutes for your project to be set up.

## Step 2: Get Your API Keys

Once your project is ready, you need to get two special keys to connect your app to Supabase.

1.  In the left sidebar of your Supabase project, click the **Settings** icon (the gear).
2.  In the new list that appears, click on **API**.
3.  You will see a section called **Project API Keys**.
4.  You need two values from here:
    *   **Project URL:** It looks like `https://<some-long-id>.supabase.co`. Copy this value.
    *   **Project API Keys (public anon key):** Find the key labeled `public` and `anon`. Copy this long value.

## Step 3: Add Your Keys to the Application

Now, you will add these keys directly into the application's code.

1.  In the file explorer, open the file `frontend/supabaseClient.ts`.
2.  You will see two placeholder variables at the top of the file:
    ```typescript
    const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'; // Replace this with your actual URL
    const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Replace this with your actual key
    ```
3.  Replace `'YOUR_SUPABASE_URL_HERE'` with the **Project URL** you copied from your own Supabase project.
4.  Replace `'YOUR_SUPABASE_ANON_KEY_HERE'` with the **public anon key** you copied from your own Supabase project.
5.  Save the file.

After editing, that section of the file should look something like this, but with **your** actual URL and Key:

```typescript
// --- PASTE YOUR SUPABASE KEYS HERE ---
// ...
const supabaseUrl = 'https://abcdefghijkl.supabase.co'; // Your actual URL will be here
const supabaseAnonKey = 'ey...abc...xyz'; // Your actual key will be here
// ...
```

> **Security Warning:** Do not share this code publicly (e.g., on a public GitHub repository) with your keys visible. For personal use and in secure environments like this one, this method is fine.

Your application will now be able to connect to your Supabase backend.

## Step 4: Run SQL to Create Your Database Tables

This is the most important step. We will create all the tables needed for the application.

1.  In your Supabase project, click the **SQL Editor** icon in the left sidebar (it looks like a database with "SQL" on it).
2.  Click **"+ New query"**.
3.  **Copy the entire block of code below** and paste it into the SQL editor.
4.  Click the green **"RUN"** button. This will create all the tables for your clinic data.

```sql
-- Create Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    medical_history TEXT,
    treatment_notes TEXT,
    last_visit TEXT,
    allergies TEXT,
    medications TEXT,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    dental_chart JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Dentists Table
CREATE TABLE dentists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id UUID REFERENCES dentists(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reason TEXT,
    status TEXT,
    reminder_time TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Suppliers Table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Inventory Items Table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    current_stock INT NOT NULL,
    unit_cost REAL NOT NULL,
    min_stock_level INT,
    expiry_date TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Expenses Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_invoice_id UUID, -- Will reference supplier_invoices table
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Treatment Definitions Table
CREATE TABLE treatment_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_price REAL NOT NULL,
    doctor_percentage REAL NOT NULL,
    clinic_percentage REAL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Treatment Records Table
CREATE TABLE treatment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id UUID REFERENCES dentists(id) ON DELETE SET NULL,
    treatment_date TEXT NOT NULL,
    treatment_definition_id UUID REFERENCES treatment_definitions(id) ON DELETE SET NULL,
    notes TEXT,
    inventory_items_used JSONB,
    total_treatment_cost REAL NOT NULL,
    doctor_share REAL NOT NULL,
    clinic_share REAL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Lab Cases Table
CREATE TABLE lab_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    case_type TEXT NOT NULL,
    sent_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    return_date TEXT,
    status TEXT NOT NULL,
    lab_cost REAL NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Supplier Invoices Table
CREATE TABLE supplier_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    invoice_number TEXT,
    invoice_date TEXT NOT NULL,
    due_date TEXT,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    items JSONB,
    invoice_image_url TEXT,
    payments JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## Step 5: Run SQL to Secure Your Data

This is the final and most magical step. This code will ensure that each user can **only** see and manage their own data.

1.  In the **SQL Editor**, click **"+ New query"** again.
2.  **Copy the entire block of code below** and paste it into the SQL editor.
3.  Click the green **"RUN"** button.

```sql
-- Enable Row Level Security (RLS) and create policies for all tables.
-- This script ensures that users can only access their own data.

-- List of all your tables
-- NOTE: If you add more tables in the future, you must add them here too.
DO $$
DECLARE
    table_name TEXT;
    tables_list TEXT[] := ARRAY[
        'patients', 'dentists', 'appointments', 'suppliers', 'inventory_items',
        'expenses', 'treatment_definitions', 'treatment_records', 'lab_cases',
        'payments', 'supplier_invoices'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_list
    LOOP
        -- 1. Enable Row Level Security (RLS) on the table
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);

        -- 2. Drop existing policies to avoid errors on re-run
        EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own %s." ON public.%I;', table_name, table_name);

        -- 3. Create a new policy
        -- This policy allows users to SELECT, INSERT, UPDATE, and DELETE
        -- only the rows where the 'user_id' column matches their own authenticated user ID.
        EXECUTE format('
            CREATE POLICY "Users can manage their own %s."
            ON public.%I
            FOR ALL
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());
        ', table_name, table_name);
    END LOOP;
END;
$$;
```

## All Done!

That's it! Your backend is now fully configured. You can now go back to the application, **create a new account**, log in, and start adding your clinic's data. All data you add will be securely stored online and will only be visible to you when you log in.