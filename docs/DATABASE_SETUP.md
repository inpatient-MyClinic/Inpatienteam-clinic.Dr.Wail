# Database Setup for Medical Management System

## Overview
This document outlines the database structure and setup process for the medical management system using Supabase.

## Database Schema

### Tables Created:

1. **users** - User accounts and permissions
2. **medical_requests** - Patient medical requests and treatments
3. **finance_transactions** - Financial records and payments
4. **admin_tasks** - Administrative tasks and workflows
5. **hospital_privileges** - Hospital access permissions for users
6. **system_settings** - Application configuration
7. **audit_trail** - System activity logging

## Setup Instructions

### 1. Run Database Migrations

Execute these SQL commands in your Supabase SQL editor:

```sql
-- Create database tables for medical management system

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Admin', 'Doctor', 'Nurse', 'Case Coordinator', 'Hospital', 'Finance', 'Customer Service')),
  specialty TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  field_permissions JSONB DEFAULT '{}',
  hospital_privileges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical requests table
CREATE TABLE medical_requests (
  id SERIAL PRIMARY KEY,
  date_created DATE NOT NULL,
  time_created TIME NOT NULL,
  patient_name TEXT NOT NULL,
  patient_national_id TEXT,
  patient_mobile_no TEXT,
  specialty TEXT NOT NULL,
  doctor_name TEXT,
  referred_from TEXT,
  referred_to_hospital TEXT,
  hospital_mrn TEXT,
  hospital_name TEXT,
  service_description TEXT NOT NULL,
  expected_surgery_date DATE,
  admission_type TEXT,
  history TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_by TEXT,
  is_delayed BOOLEAN DEFAULT FALSE,
  notifications TEXT[] DEFAULT '{}',
  payment_status TEXT DEFAULT 'Not Paid' CHECK (payment_status IN ('Paid', 'Not Paid')),
  assigned_coordinator TEXT,
  coordinator_action_time TIMESTAMP WITH TIME ZONE,
  delay_cause TEXT CHECK (delay_cause IN ('doctor', 'hospital', 'insurance', 'patient')),
  agreed_surgery_date DATE,
  assigned_doctor TEXT,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance transactions table
CREATE TABLE finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  service_description TEXT NOT NULL,
  hospital TEXT NOT NULL,
  doctor TEXT NOT NULL,
  specialty TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Delay Payment')),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin tasks table
CREATE TABLE admin_tasks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Completed', 'In Progress', 'Rejected', 'Cancelled')),
  task_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low', 'Emergency')),
  specialty TEXT,
  hospital TEXT,
  case_coordinator TEXT,
  request_date DATE,
  completion_date DATE,
  service_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital privileges table
CREATE TABLE hospital_privileges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hospital_name)
);

-- System settings table
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trail table
CREATE TABLE audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Create Indexes

```sql
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_category ON users(category);
CREATE INDEX idx_users_specialty ON users(specialty);
CREATE INDEX idx_medical_requests_status ON medical_requests(status);
CREATE INDEX idx_medical_requests_specialty ON medical_requests(specialty);
CREATE INDEX idx_medical_requests_hospital ON medical_requests(hospital_name);
CREATE INDEX idx_medical_requests_doctor ON medical_requests(doctor_name);
CREATE INDEX idx_medical_requests_date ON medical_requests(date_created);
CREATE INDEX idx_finance_transactions_status ON finance_transactions(status);
CREATE INDEX idx_finance_transactions_hospital ON finance_transactions(hospital);
CREATE INDEX idx_finance_transactions_date ON finance_transactions(transaction_date);
CREATE INDEX idx_admin_tasks_status ON admin_tasks(status);
CREATE INDEX idx_admin_tasks_priority ON admin_tasks(priority);
CREATE INDEX idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_table ON audit_trail(table_name);
CREATE INDEX idx_audit_trail_date ON audit_trail(created_at);
```

### 3. Add Triggers

```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_requests_updated_at BEFORE UPDATE ON medical_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_transactions_updated_at BEFORE UPDATE ON finance_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_tasks_updated_at BEFORE UPDATE ON admin_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Insert Sample Data

```sql
-- Insert default users
INSERT INTO users (email, category, specialty, status, field_permissions, hospital_privileges) VALUES
('admin@medical.com', 'Admin', null, 'Active', '{"patientName": "edit", "mrn": "edit", "serviceDescription": "edit", "hospital": "edit", "status": "edit", "assignedDoctor": "edit", "phone": "edit", "expectedSurgeryDate": "edit", "paymentStatus": "edit", "notes": "edit"}', '{"DSAH", "DSFH (Basateen Branch)", "Al Salamah Hospital", "EMC/ European Medical Center", "King''s College Hospital", "IMC", "DSFH (main)", "Al Batal Eye Centre", "Bin Rushd Eye Center"}'),
('dr.ahmed@medical.com', 'Doctor', 'Cardiology', 'Active', '{"patientName": "edit", "mrn": "edit", "serviceDescription": "edit", "hospital": "edit", "status": "edit", "assignedDoctor": "edit", "phone": "edit", "expectedSurgeryDate": "edit", "paymentStatus": "view", "notes": "edit"}', '{"DSAH", "DSFH (main)", "King''s College Hospital"}'),
('nurse.sara@medical.com', 'Nurse', null, 'Active', '{"patientName": "edit", "mrn": "edit", "serviceDescription": "edit", "hospital": "edit", "status": "edit", "assignedDoctor": "edit", "phone": "edit", "expectedSurgeryDate": "edit", "paymentStatus": "none", "notes": "edit"}', '{"DSAH", "DSFH (main)"}'),
('finance@medical.com', 'Finance', null, 'Active', '{"patientName": "view", "mrn": "view", "serviceDescription": "view", "hospital": "view", "status": "view", "assignedDoctor": "view", "phone": "view", "expectedSurgeryDate": "view", "paymentStatus": "edit", "notes": "view"}', '{}');
```

## Environment Variables

Add these to your `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

1. Run the SQL commands in your Supabase dashboard
2. Configure environment variables
3. Update application components to use Supabase instead of localStorage
4. Test database connectivity and CRUD operations

## Data Migration

To migrate existing localStorage data to Supabase, use the migration utilities that will be created in the application.