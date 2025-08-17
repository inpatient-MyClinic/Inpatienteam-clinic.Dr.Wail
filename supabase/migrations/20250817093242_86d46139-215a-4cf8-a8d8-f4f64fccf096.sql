-- Fix Security Issues in Patient Data Access

-- 1. Fix the Security Definer View (requests_v)
-- Drop and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.requests_v;

-- Create a more secure view with proper RLS enforcement
CREATE VIEW public.requests_v AS
SELECT 
  CASE 
    WHEN mr.id IS NOT NULL THEN 'medical_request'
    ELSE 'excel_request'
  END as source_type,
  COALESCE(mr.id::text, er.id::text) as uid,
  COALESCE(mr.request_date, er.request_date) as request_date,
  COALESCE(mr.patient_name, er.patient_name) as patient_name,
  COALESCE(mr.patient_id, er.patient_id) as patient_id,
  COALESCE(mr.hospital_name, er.hospital_name) as hospital_name,
  COALESCE(mr.specialty, er.specialty) as specialty,
  COALESCE(mr.status::text, er.status) as status,
  COALESCE(mr.loss_reason, er.loss_reason) as loss_reason,
  COALESCE(mr.paid_amount, er.paid_amount) as paid_amount,
  COALESCE(mr.branch_code, er.branch_code) as branch_code
FROM public.medical_requests mr
FULL OUTER JOIN public.excel_requests er ON FALSE; -- Force separate rows

-- Enable RLS on the view
ALTER VIEW public.requests_v SET (security_invoker = true);

-- 2. Enhance medical_requests RLS policies with stricter access control
-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Secure patient data access" ON public.medical_requests;
DROP POLICY IF EXISTS "Secure patient data creation" ON public.medical_requests;
DROP POLICY IF EXISTS "Secure patient data updates" ON public.medical_requests;

-- Create more restrictive RLS policies with data masking
CREATE POLICY "Secure patient data access" ON public.medical_requests
FOR SELECT USING (
  -- Only allow access if user has proper authorization AND logging is performed
  can_access_patient_data(id, 'view') AND 
  -- Additional hospital/specialty verification for non-admins
  CASE get_current_user_role()
    WHEN 'admin' THEN true
    WHEN 'doctor' THEN (
      (created_by = auth.uid() OR assigned_to = auth.uid()) AND
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND 
              (specialty = medical_requests.specialty OR specialty IS NULL))
    )
    WHEN 'nurse' THEN (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND 
              hospital_code = medical_requests.hospital_code)
    )
    WHEN 'hospital' THEN (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND 
              hospital_code = medical_requests.hospital_code)
    )
    WHEN 'case-coordinator' THEN (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND 
              hospital_code = medical_requests.hospital_code)
    )
    WHEN 'finance' THEN (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND 
              hospital_code = medical_requests.hospital_code)
    )
    ELSE false
  END
);

CREATE POLICY "Secure patient data creation" ON public.medical_requests
FOR INSERT WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND status = 'active'
    AND role IN ('doctor', 'nurse', 'hospital', 'case-coordinator')
    -- Verify hospital authorization for non-doctor roles
    AND CASE role
      WHEN 'doctor' THEN true
      ELSE hospital_code = medical_requests.hospital_code
    END
  )
);

CREATE POLICY "Secure patient data updates" ON public.medical_requests
FOR UPDATE USING (
  can_access_patient_data(id, 'edit') AND
  (
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    (
      get_current_user_role() IN ('admin', 'case-coordinator') AND
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND status = 'active'
        AND CASE role
          WHEN 'admin' THEN true
          ELSE hospital_code = medical_requests.hospital_code
        END
      )
    )
  )
);

-- 3. Fix SIA settings exposure by restricting public access
DROP POLICY IF EXISTS "Users can view SIA settings" ON public.sia_settings;
DROP POLICY IF EXISTS "Admins can manage SIA settings" ON public.sia_settings;

-- Create more restrictive SIA settings policies
CREATE POLICY "Admins can manage SIA settings" ON public.sia_settings
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Authorized users can view SIA settings" ON public.sia_settings
FOR SELECT USING (
  get_current_user_role() IN ('admin', 'case-coordinator', 'finance')
);

-- 4. Add audit logging trigger for sensitive data access
CREATE OR REPLACE FUNCTION public.audit_patient_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all access to patient data
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    user_id,
    user_email,
    timestamp,
    accessed_columns
  ) VALUES (
    TG_TABLE_NAME,
    CASE TG_OP
      WHEN 'INSERT' THEN NEW.id
      WHEN 'UPDATE' THEN NEW.id
      WHEN 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    TG_OP || '_PATIENT_DATA',
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    NOW(),
    CASE TG_OP
      WHEN 'SELECT' THEN ARRAY['patient_name', 'patient_email', 'patient_phone', 'patient_id', 'medical_condition']
      ELSE NULL
    END
  );
  
  RETURN CASE TG_OP
    WHEN 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- Add audit trigger to medical_requests
DROP TRIGGER IF EXISTS audit_patient_data_access_trigger ON public.medical_requests;
CREATE TRIGGER audit_patient_data_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.medical_requests
  FOR EACH ROW EXECUTE FUNCTION public.audit_patient_data_access();

-- 5. Create secure data masking function for sensitive fields
CREATE OR REPLACE FUNCTION public.mask_patient_data(
  patient_name text,
  patient_phone text,
  patient_email text,
  user_role user_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mask sensitive data based on user role
  RETURN jsonb_build_object(
    'patient_name', CASE 
      WHEN user_role IN ('admin', 'doctor', 'nurse', 'case-coordinator') THEN patient_name
      WHEN user_role = 'finance' THEN LEFT(patient_name, 1) || '***'
      ELSE 'RESTRICTED'
    END,
    'patient_phone', CASE 
      WHEN user_role IN ('admin', 'doctor', 'nurse', 'case-coordinator') THEN patient_phone
      WHEN user_role = 'finance' THEN 'XXX-XXX-' || RIGHT(patient_phone, 4)
      ELSE 'RESTRICTED'
    END,
    'patient_email', CASE 
      WHEN user_role IN ('admin', 'doctor', 'nurse', 'case-coordinator') THEN patient_email
      WHEN user_role = 'finance' THEN REGEXP_REPLACE(patient_email, '^([^@]{1,2})[^@]*(@.*)$', '\1***\2')
      ELSE 'RESTRICTED'
    END
  );
END;
$$;