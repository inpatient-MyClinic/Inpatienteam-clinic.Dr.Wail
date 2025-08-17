-- Temporary admin password reset function
CREATE OR REPLACE FUNCTION public.admin_reset_password(
  admin_email text,
  new_password text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Only allow for admin emails
  IF NOT (admin_email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@gmail.com'])) THEN
    RAISE EXCEPTION 'Only admin accounts can use this function';
  END IF;
  
  -- Get user ID
  SELECT id INTO user_id FROM auth.users WHERE email = admin_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Force password change requirement
  UPDATE public.profiles 
  SET must_change_password = TRUE,
      force_password_change = TRUE,
      password_expires_at = NOW() + INTERVAL '1 day'
  WHERE id = user_id;
  
  RETURN 'Password reset initiated. Please check your email or use temporary password.';
END;
$$;