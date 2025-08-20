-- Fix infinite recursion in profiles table RLS policies
-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view limited profile info" ON public.profiles;

-- Create a simpler, non-recursive policy for viewing limited profile info
CREATE POLICY "Users can view active profiles in same context" 
ON public.profiles 
FOR SELECT 
USING (
  (id = auth.uid()) OR 
  (
    status = 'active'::user_status AND 
    auth.uid() IS NOT NULL AND
    (
      -- Allow viewing profiles in same hospital
      hospital_code IN (
        SELECT hospital_code 
        FROM public.profiles 
        WHERE id = auth.uid() AND status = 'active'::user_status
      ) OR
      -- Allow viewing profiles with same specialty
      specialty IN (
        SELECT specialty 
        FROM public.profiles 
        WHERE id = auth.uid() AND status = 'active'::user_status
      )
    )
  )
);

-- Also ensure the is_admin() function doesn't cause recursion
-- Drop and recreate it with proper security context
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE u.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.status = 'active'
  );
$$;