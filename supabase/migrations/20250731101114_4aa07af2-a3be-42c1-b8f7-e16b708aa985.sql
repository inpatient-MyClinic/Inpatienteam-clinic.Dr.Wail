-- Manually confirm existing admin emails
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email IN ('wail.ahmed@myclinic.com.sa', 'admin@myclinic.com.sa', 'inpatienteam@gmail.com')
AND email_confirmed_at IS NULL;

-- Also ensure they have proper profiles
UPDATE public.profiles 
SET 
  role = 'admin'::user_role,
  status = 'active'::user_status,
  approved_by = id,
  approved_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('wail.ahmed@myclinic.com.sa', 'admin@myclinic.com.sa', 'inpatienteam@gmail.com')
);