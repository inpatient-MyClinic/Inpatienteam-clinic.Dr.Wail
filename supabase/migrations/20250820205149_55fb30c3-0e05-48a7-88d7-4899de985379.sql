-- Drop ALL existing policies on profiles table completely
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can view limited profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view active profiles in same context" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- Drop and recreate is_admin function to prevent recursion
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create a simple, non-recursive is_admin function that checks email directly from auth.users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'auth'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@gmail.com')
  );
$$;

-- Create simple, non-recursive policies for profiles table
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins full access profiles" 
ON public.profiles 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());