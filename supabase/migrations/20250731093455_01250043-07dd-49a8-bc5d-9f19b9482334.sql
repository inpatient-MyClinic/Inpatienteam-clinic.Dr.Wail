-- Create function to check if email should be admin
CREATE OR REPLACE FUNCTION public.is_admin_email(email_address text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT email_address IN (
    'wail.ahmed@myclinic.com.sa',
    'admin@myclinic.com.sa', 
    'inpatienteam@gmail.com'
  );
$$;

-- Update the handle_new_user function to auto-approve admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status, approved_by, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CASE 
      WHEN public.is_admin_email(NEW.email) THEN 'admin'::user_role
      ELSE COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'doctor')
    END,
    CASE 
      WHEN public.is_admin_email(NEW.email) THEN 'active'::user_status
      ELSE 'pending'::user_status
    END,
    CASE 
      WHEN public.is_admin_email(NEW.email) THEN NEW.id  -- Self-approved
      ELSE NULL
    END,
    CASE 
      WHEN public.is_admin_email(NEW.email) THEN NOW()
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;