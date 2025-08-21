-- Simplified migration without generated columns that cause immutability issues

-- Create unified requests table without generated columns
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
  custom_fields jsonb DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_unified_requests_date ON unified_requests(request_date DESC);
CREATE INDEX idx_unified_requests_status ON unified_requests(status);
CREATE INDEX idx_unified_requests_hospital ON unified_requests(hospital_code);
CREATE INDEX idx_unified_requests_specialty ON unified_requests(specialty);
CREATE INDEX idx_unified_requests_branch ON unified_requests(branch_code);
CREATE INDEX idx_unified_requests_created_by ON unified_requests(created_by);
CREATE INDEX idx_unified_requests_assigned_to ON unified_requests(assigned_to);
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

-- Enhanced user profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- Enhanced finance transactions linking
ALTER TABLE public.finance_transactions 
  DROP CONSTRAINT IF EXISTS finance_transactions_request_id_fkey,
  ADD CONSTRAINT finance_transactions_request_id_fkey 
  FOREIGN KEY (request_id) REFERENCES unified_requests(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE unified_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_upload_batches ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
CREATE POLICY "Admin full access unified requests" ON unified_requests FOR ALL USING (is_admin());

CREATE POLICY "Users can access unified requests based on role" ON unified_requests
  FOR SELECT USING (
    get_current_user_role() = 'admin' OR
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND (
        (p.role = 'doctor' AND p.specialty = unified_requests.specialty) OR
        (p.role IN ('nurse', 'hospital', 'case-coordinator', 'finance') AND p.hospital_code = unified_requests.hospital_code)
      )
    )
  );

CREATE POLICY "Users can create unified requests" ON unified_requests
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.status = 'active'
      AND p.role IN ('doctor', 'nurse', 'hospital', 'case-coordinator')
    )
  );

CREATE POLICY "Users can update unified requests" ON unified_requests
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    (
      get_current_user_role() IN ('admin', 'case-coordinator') AND
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND (p.hospital_code = unified_requests.hospital_code OR get_current_user_role() = 'admin')
      )
    )
  );

-- Excel upload policies
CREATE POLICY "Users can view their uploads" ON excel_upload_batches
  FOR SELECT USING (uploaded_by = auth.uid() OR is_admin());

CREATE POLICY "Users can create uploads" ON excel_upload_batches
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());