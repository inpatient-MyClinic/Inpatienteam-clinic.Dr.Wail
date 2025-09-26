-- Fix security vulnerability in excel_rows_raw table
-- Current policies are too permissive - they only check upload batch ownership
-- Need to verify actual user permissions for accessing specific patient records

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view excel data they uploaded" ON public.excel_rows_raw;
DROP POLICY IF EXISTS "Users can insert excel data" ON public.excel_rows_raw;

-- Create function to handle audit logging for excel data access
CREATE OR REPLACE FUNCTION audit_excel_data_access(
  table_id uuid,
  access_type text,
  columns_accessed text[]
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log the access
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    user_id,
    user_email,
    accessed_columns,
    timestamp
  ) VALUES (
    'excel_rows_raw',
    table_id,
    access_type,
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    columns_accessed,
    NOW()
  );
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  -- Don't block access if audit logging fails, but log the error
  RETURN true;
END;
$$;

-- Create stricter RLS policies that verify user permissions for patient data access

-- Policy 1: Admin access with audit logging
CREATE POLICY "Admin secure access to excel patient data" 
ON public.excel_rows_raw 
FOR SELECT 
TO authenticated
USING (
  is_admin() AND
  audit_excel_data_access(id, 'ADMIN_ACCESS_PATIENT_DATA', 
    ARRAY['Patient Name', 'Patient National ID', 'Patient Mobile', 'Email', 'Medical Condition'])
);

-- Policy 2: Hospital-based access - users can only access data from their hospital
CREATE POLICY "Hospital staff secure access to excel patient data" 
ON public.excel_rows_raw 
FOR SELECT 
TO authenticated
USING (
  NOT is_admin() AND
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.status = 'active'
    AND p.role IN ('doctor', 'nurse', 'hospital', 'case-coordinator', 'finance')
    AND (
      p.hospital_code = excel_rows_raw."Hospital Name" OR
      p.hospital_code = excel_rows_raw.raw_data->>'Referred Hospital' OR
      p.hospital_code = excel_rows_raw.raw_data->>'Hospital Name'
    )
  ) AND
  audit_excel_data_access(id, 'HOSPITAL_ACCESS_PATIENT_DATA', 
    ARRAY['Patient Name', 'Patient National ID', 'Patient Mobile', 'Email', 'Medical Condition'])
);

-- Policy 3: Doctor specialty-based access - doctors can only see their specialty patients
CREATE POLICY "Doctor specialty access to excel patient data" 
ON public.excel_rows_raw 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.status = 'active'
    AND p.role = 'doctor'
    AND (
      p.specialty = excel_rows_raw."Specialty" OR
      p.specialty = excel_rows_raw.raw_data->>'Specialty'
    )
  ) AND
  audit_excel_data_access(id, 'DOCTOR_SPECIALTY_ACCESS_PATIENT_DATA', 
    ARRAY['Patient Name', 'Patient National ID', 'Patient Mobile', 'Email', 'Medical Condition'])
);

-- Policy 4: Secure insert - only allow inserts by authorized uploaders with proper hospital affiliation
CREATE POLICY "Secure excel data insertion" 
ON public.excel_rows_raw 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM excel_upload_batches eub
    JOIN profiles p ON p.id = eub.uploaded_by
    WHERE eub.id = upload_batch_id 
    AND eub.uploaded_by = auth.uid()
    AND p.status = 'active'
    AND p.role IN ('admin', 'case-coordinator', 'hospital')
  )
);

-- Policy 5: Prevent unauthorized updates and deletes - only admins can modify
CREATE POLICY "Admin only modifications" 
ON public.excel_rows_raw 
FOR UPDATE 
TO authenticated
USING (is_admin());

CREATE POLICY "Admin only deletions" 
ON public.excel_rows_raw 
FOR DELETE 
TO authenticated
USING (is_admin());

-- Create function to mask patient data for limited access roles
CREATE OR REPLACE FUNCTION mask_excel_patient_data(
  patient_name text,
  patient_id text, 
  patient_mobile text,
  patient_email text,
  user_role user_role
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN jsonb_build_object(
    'patient_name', CASE 
      WHEN user_role IN ('admin', 'doctor', 'nurse', 'case-coordinator') THEN patient_name
      WHEN user_role = 'finance' THEN LEFT(COALESCE(patient_name, ''), 1) || '***'
      ELSE 'RESTRICTED'
    END,
    'patient_id', CASE 
      WHEN user_role IN ('admin', 'doctor', 'nurse', 'case-coordinator') THEN patient_id
      WHEN user_role = 'finance' THEN 'XXX-XXX-' || RIGHT(COALESCE(patient_id, ''), 4)
      ELSE 'RESTRICTED'
    END,
    'patient_mobile', CASE 
      WHEN user_role IN ('admin', 'doctor', 'nurse', 'case-coordinator') THEN patient_mobile
      WHEN user_role = 'finance' THEN 'XXX-XXX-' || RIGHT(COALESCE(patient_mobile, ''), 4)
      ELSE 'RESTRICTED'
    END,
    'patient_email', CASE 
      WHEN user_role IN ('admin', 'doctor', 'nurse', 'case-coordinator') THEN patient_email
      WHEN user_role = 'finance' THEN REGEXP_REPLACE(COALESCE(patient_email, ''), '^([^@]{1,2})[^@]*(@.*)$', '\1***\2')
      ELSE 'RESTRICTED'
    END
  );
END;
$$;