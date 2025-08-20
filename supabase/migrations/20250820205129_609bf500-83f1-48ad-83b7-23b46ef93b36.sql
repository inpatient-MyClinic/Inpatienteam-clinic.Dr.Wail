-- Fix infinite recursion by dropping all dependent policies and recreating them properly

-- First, drop all problematic policies on profiles table
DROP POLICY IF EXISTS "Users can view limited profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view active profiles in same context" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Drop policies that might depend on is_admin() function
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can manage hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Admins can manage excel uploads" ON public.excel_uploads;
DROP POLICY IF EXISTS "Admins can view excel uploads" ON public.excel_uploads;
DROP POLICY IF EXISTS "Admins can manage excel rows raw" ON public.excel_rows_raw;
DROP POLICY IF EXISTS "Admins can view excel rows raw" ON public.excel_rows_raw;
DROP POLICY IF EXISTS "System can manage password history" ON public.password_history;
DROP POLICY IF EXISTS "Admins can delete pre-approved emails" ON public.pre_approved_emails;
DROP POLICY IF EXISTS "Admins can insert pre-approved emails" ON public.pre_approved_emails;
DROP POLICY IF EXISTS "Admins can update pre-approved emails" ON public.pre_approved_emails;
DROP POLICY IF EXISTS "Admins can view all pre-approved emails" ON public.pre_approved_emails;
DROP POLICY IF EXISTS "Admins can manage SIA settings" ON public.sia_settings;
DROP POLICY IF EXISTS "Admins can manage excel requests" ON public.excel_requests;
DROP POLICY IF EXISTS "Admins and authorized users can view excel requests" ON public.excel_requests;
DROP POLICY IF EXISTS "Restricted message access" ON public.messages;

-- Now drop and recreate the is_admin function without dependencies
DROP FUNCTION IF EXISTS public.is_admin();

-- Create a simple, non-recursive is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() 
    AND u.email IN ('admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@gmail.com')
  );
$$;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins have full access to profiles" 
ON public.profiles 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Recreate other admin policies
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_log 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage hospitals" 
ON public.hospitals 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can manage excel uploads" 
ON public.excel_uploads 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view excel uploads" 
ON public.excel_uploads 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage excel rows raw" 
ON public.excel_rows_raw 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view excel rows raw" 
ON public.excel_rows_raw 
FOR SELECT 
USING (is_admin());

CREATE POLICY "System can manage password history" 
ON public.password_history 
FOR ALL 
USING (is_admin());

CREATE POLICY "Admins can delete pre-approved emails" 
ON public.pre_approved_emails 
FOR DELETE 
USING (is_admin());

CREATE POLICY "Admins can insert pre-approved emails" 
ON public.pre_approved_emails 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update pre-approved emails" 
ON public.pre_approved_emails 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can view all pre-approved emails" 
ON public.pre_approved_emails 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage SIA settings" 
ON public.sia_settings 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can manage excel requests" 
ON public.excel_requests 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins and authorized users can view excel requests" 
ON public.excel_requests 
FOR SELECT 
USING (is_admin() OR (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'finance'::user_role, 'case-coordinator'::user_role])));

CREATE POLICY "Restricted message access" 
ON public.messages 
FOR SELECT 
USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid()) OR is_admin());