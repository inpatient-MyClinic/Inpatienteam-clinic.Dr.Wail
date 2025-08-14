-- Fix RLS policy for medical_requests to prevent unauthorized access to patient data
-- This replaces the overly permissive policy that allowed all hospital, case-coordinator, 
-- finance, and customer-care users to see ALL medical requests

DROP POLICY IF EXISTS "Users can view requests based on role" ON public.medical_requests;

CREATE POLICY "Users can view requests based on role" ON public.medical_requests
FOR SELECT USING (
  CASE get_current_user_role()
    -- Admins can see everything
    WHEN 'admin'::user_role THEN true
    
    -- Doctors can only see their own created/assigned requests
    WHEN 'doctor'::user_role THEN (
      (created_by = auth.uid()) OR (assigned_to = auth.uid())
    )
    
    -- Nurses can only see requests assigned to them
    WHEN 'nurse'::user_role THEN (
      assigned_to = auth.uid()
    )
    
    -- Hospital users can only see requests from their hospital
    WHEN 'hospital'::user_role THEN (
      hospital_code IN (
        SELECT p.hospital_code 
        FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.hospital_code IS NOT NULL
      )
    )
    
    -- Case coordinators can only see requests from their hospital or assigned to them
    WHEN 'case-coordinator'::user_role THEN (
      (assigned_to = auth.uid()) OR 
      (hospital_code IN (
        SELECT p.hospital_code 
        FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.hospital_code IS NOT NULL
      ))
    )
    
    -- Finance users can only see requests from their hospital or assigned to them
    WHEN 'finance'::user_role THEN (
      (assigned_to = auth.uid()) OR
      (hospital_code IN (
        SELECT p.hospital_code 
        FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.hospital_code IS NOT NULL
      ))
    )
    
    -- Customer care can only see requests from their hospital or assigned to them
    WHEN 'customer-care'::user_role THEN (
      (assigned_to = auth.uid()) OR
      (hospital_code IN (
        SELECT p.hospital_code 
        FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.hospital_code IS NOT NULL
      ))
    )
    
    ELSE false
  END
);