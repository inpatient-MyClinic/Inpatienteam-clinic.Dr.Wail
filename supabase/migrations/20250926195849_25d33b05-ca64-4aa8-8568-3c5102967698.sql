-- CRITICAL SECURITY FIX: Remove overly permissive policy that exposes patient data
-- The "Allow all authenticated users to read" policy allows ANY authenticated user 
-- to read ALL patient medical records, which is a severe HIPAA and privacy violation

-- Remove the dangerous policy
DROP POLICY IF EXISTS "Allow all authenticated users to read" ON public.unified_requests;

-- Ensure the get_current_user_role function exists and works properly
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT role INTO user_role_result
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role_result, 'doctor'::user_role);
END;
$$;

-- Verify that we still have the proper role-based access policy
-- This should already exist: "Users can access unified requests based on role"
-- If it doesn't exist, we need to create it

DO $$
BEGIN
  -- Check if the role-based policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'unified_requests' 
    AND policyname = 'Users can access unified requests based on role'
  ) THEN
    -- Create the proper role-based policy if it doesn't exist
    EXECUTE 'CREATE POLICY "Users can access unified requests based on role" 
      ON public.unified_requests 
      FOR SELECT 
      TO authenticated
      USING (
        (get_current_user_role() = ''admin''::user_role) OR 
        (created_by = auth.uid()) OR 
        (assigned_to = auth.uid()) OR 
        (EXISTS (
          SELECT 1 FROM profiles p 
          WHERE p.id = auth.uid() 
          AND p.status = ''active''::user_status
          AND (
            (p.role = ''doctor''::user_role AND p.specialty = unified_requests.specialty) OR
            (p.role = ANY (ARRAY[''nurse''::user_role, ''hospital''::user_role, ''case-coordinator''::user_role, ''finance''::user_role]) 
             AND p.hospital_code = unified_requests.hospital_code)
          )
        ))
      )';
  END IF;
END;
$$;

-- Add documentation about the security fix
COMMENT ON TABLE public.unified_requests IS 
'SECURITY FIX APPLIED: Removed overly permissive policy that allowed any authenticated user to read all patient medical records. Access is now restricted to proper role-based access controls only.';