-- Phase 1: Database Schema Optimization
-- Drop existing inconsistent tables and rebuild unified schema

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
  
  -- Patient information (encrypted/masked based on role)
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

-- Enhanced finance transactions with better linking
ALTER TABLE public.finance_transactions 
  DROP CONSTRAINT IF EXISTS finance_transactions_request_id_fkey,
  ADD CONSTRAINT finance_transactions_request_id_fkey 
  FOREIGN KEY (request_id) REFERENCES unified_requests(id) ON DELETE CASCADE;

-- Create analytics materialized views for performance
CREATE MATERIALIZED VIEW public.daily_analytics AS
SELECT 
  request_date,
  hospital_code,
  hospital_name,
  branch_code,
  specialty,
  status,
  COUNT(*) as request_count,
  SUM(paid_amount) as total_amount,
  AVG(paid_amount) as avg_amount,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status IN ('cancelled', 'rejected')) as failed_count,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric) * 100, 2
  ) as success_rate
FROM unified_requests
GROUP BY request_date, hospital_code, hospital_name, branch_code, specialty, status;

CREATE UNIQUE INDEX idx_daily_analytics_unique ON daily_analytics(
  request_date, hospital_code, branch_code, specialty, status
);

-- Create triggers for real-time updates
CREATE OR REPLACE FUNCTION refresh_daily_analytics()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_analytics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_analytics
  AFTER INSERT OR UPDATE OR DELETE ON unified_requests
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_daily_analytics();

-- Enhanced RLS policies
ALTER TABLE unified_requests ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to unified requests" ON unified_requests
  FOR ALL USING (is_admin());

-- Role-based access policies
CREATE POLICY "Users can access requests based on role and hospital" ON unified_requests
  FOR SELECT USING (
    CASE get_current_user_role()
      WHEN 'doctor' THEN (
        created_by = auth.uid() OR 
        assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles p 
          WHERE p.id = auth.uid() 
          AND p.specialty = unified_requests.specialty
        )
      )
      WHEN 'nurse', 'hospital', 'case-coordinator' THEN (
        EXISTS (
          SELECT 1 FROM profiles p 
          WHERE p.id = auth.uid() 
          AND p.hospital_code = unified_requests.hospital_code
        )
      )
      WHEN 'finance' THEN (
        EXISTS (
          SELECT 1 FROM profiles p 
          WHERE p.id = auth.uid() 
          AND p.hospital_code = unified_requests.hospital_code
        )
      )
      WHEN 'customer-care' THEN (
        assigned_to = auth.uid()
      )
      ELSE false
    END
  );

CREATE POLICY "Users can create requests based on role" ON unified_requests
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.status = 'active'
      AND p.role IN ('doctor', 'nurse', 'hospital', 'case-coordinator')
    )
  );

CREATE POLICY "Users can update requests they have access to" ON unified_requests
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

-- Enable RLS on new tables
ALTER TABLE excel_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access_matrix ENABLE ROW LEVEL SECURITY;

-- Basic policies for new tables
CREATE POLICY "Users can view their uploads" ON excel_upload_batches
  FOR SELECT USING (uploaded_by = auth.uid() OR is_admin());

CREATE POLICY "Users can create uploads" ON excel_upload_batches
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Access matrix visible to admins and self" ON user_access_matrix
  FOR SELECT USING (user_id = auth.uid() OR is_admin());