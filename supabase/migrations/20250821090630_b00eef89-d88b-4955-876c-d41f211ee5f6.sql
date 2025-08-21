-- Fix the syntax error in the CASE statement and complete the migration

-- Drop existing tables that need restructuring
DROP TABLE IF EXISTS excel_requests CASCADE;
DROP TABLE IF EXISTS excel_rows_raw CASCADE;
DROP TABLE IF EXISTS excel_uploads CASCADE;

-- Create unified requests table with proper structure
CREATE TABLE public.unified_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Source tracking
  source_type text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'excel', 'api')),
  excel_upload_id uuid,
  excel_row_number integer,
  
  -- Request metadata
  request_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- User relationships
  created_by uuid REFERENCES auth.users(id),
  assigned_to uuid REFERENCES auth.users(id),
  
  -- Patient information
  patient_name text NOT NULL,
  patient_id text,
  patient_phone text,
  patient_email text,
  
  -- Medical details
  medical_condition text NOT NULL,
  specialty text NOT NULL,
  urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  
  -- Hospital/Branch information
  hospital_code text NOT NULL,
  hospital_name text,
  branch_code text,
  
  -- Status and workflow
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in-progress', 'scheduled', 'completed', 
    'cancelled', 'rejected', 'postponed', 'privilege'
  )),
  loss_reason text,
  
  -- Financial
  paid_amount numeric DEFAULT 0,
  currency text DEFAULT 'SAR',
  
  -- Additional data
  notes text,
  attachments jsonb DEFAULT '[]'::jsonb,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  
  -- Analytics optimization
  year_month text GENERATED ALWAYS AS (to_char(request_date, 'YYYY-MM')) STORED,
  fiscal_quarter text GENERATED ALWAYS AS (
    CASE 
      WHEN EXTRACT(MONTH FROM request_date) IN (1,2,3) THEN 'Q1'
      WHEN EXTRACT(MONTH FROM request_date) IN (4,5,6) THEN 'Q2'
      WHEN EXTRACT(MONTH FROM request_date) IN (7,8,9) THEN 'Q3'
      ELSE 'Q4'
    END || '-' || EXTRACT(YEAR FROM request_date)
  ) STORED
);

-- Create indexes for performance
CREATE INDEX idx_unified_requests_date ON unified_requests(request_date DESC);
CREATE INDEX idx_unified_requests_status ON unified_requests(status);
CREATE INDEX idx_unified_requests_hospital ON unified_requests(hospital_code);
CREATE INDEX idx_unified_requests_specialty ON unified_requests(specialty);
CREATE INDEX idx_unified_requests_branch ON unified_requests(branch_code);
CREATE INDEX idx_unified_requests_created_by ON unified_requests(created_by);
CREATE INDEX idx_unified_requests_assigned_to ON unified_requests(assigned_to);
CREATE INDEX idx_unified_requests_year_month ON unified_requests(year_month);
CREATE INDEX idx_unified_requests_source ON unified_requests(source_type);

-- Create excel upload tracking table
CREATE TABLE public.excel_upload_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  total_rows integer NOT NULL DEFAULT 0,
  processed_rows integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  warnings_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  processing_log jsonb DEFAULT '[]'::jsonb,
  column_mappings jsonb DEFAULT '{}'::jsonb
);

-- Enhanced user profiles with better structure
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- Create user-hospital-specialty matrix for access control
CREATE TABLE IF NOT EXISTS public.user_access_matrix (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  hospital_code text NOT NULL,
  specialty text,
  access_level text NOT NULL CHECK (access_level IN ('read', 'write', 'admin')),
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  UNIQUE(user_id, hospital_code, specialty)
);