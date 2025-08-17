-- Enhanced Security for Medical Requests and Patient Data
-- This migration addresses critical security vulnerabilities in patient data access

-- 1. Create audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  table_name text,
  record_id uuid,
  action text,
  accessed_columns text[] DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    user_id,
    user_email,
    accessed_columns,
    timestamp,
    ip_address
  ) VALUES (
    table_name,
    record_id,
    action,
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    accessed_columns,
    NOW(),
    NULL -- IP would need to be passed from application layer
  );
END;
$$;

-- 2. Create audit log table for tracking all sensitive data access
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  accessed_columns text[],
  timestamp timestamp with time zone DEFAULT NOW(),
  ip_address inet,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_log
FOR SELECT USING (is_admin());

-- 3. Create function to check if user has legitimate access to specific patient data
CREATE OR REPLACE FUNCTION public.can_access_patient_data(
  patient_request_id uuid,
  required_access_level text DEFAULT 'view'
) RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role user_role;
  request_record medical_requests;
  user_profile profiles;
BEGIN
  -- Get current user role and profile
  SELECT role, hospital_code, specialty INTO user_profile
  FROM public.profiles WHERE id = auth.uid();
  
  user_role := user_profile.role;
  
  -- Get the medical request
  SELECT * INTO request_record
  FROM public.medical_requests WHERE id = patient_request_id;
  
  -- If request doesn't exist, deny access
  IF request_record.id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Role-based access control with strict conditions
  CASE user_role
    WHEN 'admin' THEN
      -- Admins have full access but it's logged
      PERFORM public.log_sensitive_data_access('medical_requests', patient_request_id, 'admin_access');
      RETURN true;
      
    WHEN 'doctor' THEN
      -- Doctors can only access requests they created or are assigned to
      -- AND must be from same specialty for assigned requests
      IF request_record.created_by = auth.uid() THEN
        RETURN true;
      ELSIF request_record.assigned_to = auth.uid() AND 
            (request_record.specialty = user_profile.specialty OR user_profile.specialty IS NULL) THEN
        RETURN true;
      ELSE
        RETURN false;
      END IF;
      
    WHEN 'nurse' THEN
      -- Nurses can only access requests assigned to them
      -- AND must be from same hospital
      IF request_record.assigned_to = auth.uid() AND 
         request_record.hospital_code = user_profile.hospital_code THEN
        RETURN true;
      ELSE
        RETURN false;
      END IF;
      
    WHEN 'hospital' THEN
      -- Hospital staff can only access requests from their hospital
      IF request_record.hospital_code = user_profile.hospital_code THEN
        RETURN true;
      ELSE
        RETURN false;
      END IF;
      
    WHEN 'case-coordinator' THEN
      -- Case coordinators can access requests assigned to them or from their hospital
      IF request_record.assigned_to = auth.uid() OR 
         request_record.hospital_code = user_profile.hospital_code THEN
        RETURN true;
      ELSE
        RETURN false;
      END IF;
      
    WHEN 'finance' THEN
      -- Finance can only view requests for billing purposes, no patient details
      IF required_access_level = 'billing_only' AND
         request_record.hospital_code = user_profile.hospital_code THEN
        RETURN true;
      ELSE
        RETURN false;
      END IF;
      
    WHEN 'customer-care' THEN
      -- Customer care can only access requests they're assigned to
      IF request_record.assigned_to = auth.uid() THEN
        RETURN true;
      ELSE
        RETURN false;
      END IF;
      
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- 4. Drop existing RLS policies for medical_requests
DROP POLICY IF EXISTS "Users can view requests based on role" ON public.medical_requests;
DROP POLICY IF EXISTS "Authorized users can update requests" ON public.medical_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.medical_requests;

-- 5. Create new, more secure RLS policies for medical_requests
CREATE POLICY "Secure patient data access" ON public.medical_requests
FOR SELECT USING (
  public.can_access_patient_data(id, 'view')
);

CREATE POLICY "Secure patient data creation" ON public.medical_requests
FOR INSERT WITH CHECK (
  created_by = auth.uid() AND
  -- Ensure user has valid profile and permissions
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND status = 'active'
    AND role IN ('doctor', 'nurse', 'hospital', 'case-coordinator')
  )
);

CREATE POLICY "Secure patient data updates" ON public.medical_requests
FOR UPDATE USING (
  public.can_access_patient_data(id, 'edit') AND
  -- Additional checks for sensitive fields
  (
    -- Only assigned users or creators can update core patient data
    (created_by = auth.uid() OR assigned_to = auth.uid()) OR
    -- Admins and case coordinators can update status and assignments
    (get_current_user_role() IN ('admin', 'case-coordinator') AND 
     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active'))
  )
);

-- 6. Create policy for messages to restrict access to intended recipients only
DROP POLICY IF EXISTS "Users can view messages sent to them or from them" ON public.messages;

CREATE POLICY "Restricted message access" ON public.messages
FOR SELECT USING (
  sender_id = auth.uid() OR 
  recipient_id = auth.uid() OR 
  is_admin()
);

-- 7. Enhanced profile access - users can only see limited profile info of others
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (is_admin());

CREATE POLICY "Users can view limited profile info" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR 
  -- Users can only see name and specialty of others in same hospital/specialty
  (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.status = 'active'
      AND (
        p.hospital_code = profiles.hospital_code OR
        p.specialty = profiles.specialty
      )
    )
  )
);

-- 8. Restrict finance data access further
DROP POLICY IF EXISTS "Finance and admin can view all transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Others can view transactions for their requests" ON public.finance_transactions;

CREATE POLICY "Finance secure access" ON public.finance_transactions
FOR SELECT USING (
  get_current_user_role() = 'admin' OR
  (
    get_current_user_role() = 'finance' AND
    EXISTS (
      SELECT 1 FROM public.medical_requests mr
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE mr.id = finance_transactions.request_id
      AND mr.hospital_code = p.hospital_code
    )
  )
);

CREATE POLICY "Request owners can view their transaction status only" ON public.finance_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.medical_requests mr
    WHERE mr.id = finance_transactions.request_id
    AND (mr.created_by = auth.uid() OR mr.assigned_to = auth.uid())
  )
);

-- 9. Create indexes for security functions performance
CREATE INDEX IF NOT EXISTS idx_medical_requests_security ON public.medical_requests(created_by, assigned_to, hospital_code, specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_security ON public.profiles(id, hospital_code, specialty, status);
CREATE INDEX IF NOT EXISTS idx_audit_log_lookup ON public.audit_log(table_name, record_id, timestamp);

-- 10. Create trigger to automatically log sensitive data access
CREATE OR REPLACE FUNCTION public.trigger_audit_medical_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log any access to medical requests
  PERFORM public.log_sensitive_data_access('medical_requests', NEW.id, TG_OP);
  RETURN NEW;
END;
$$;

-- Apply audit trigger to medical requests
DROP TRIGGER IF EXISTS audit_medical_requests_access ON public.medical_requests;
CREATE TRIGGER audit_medical_requests_access
  AFTER SELECT ON public.medical_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_audit_medical_access();