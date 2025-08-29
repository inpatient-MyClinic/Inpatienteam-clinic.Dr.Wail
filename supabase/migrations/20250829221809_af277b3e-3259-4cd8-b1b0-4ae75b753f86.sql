-- Create admin profile for testing (assuming admin user already exists in auth.users)
-- This will allow admin@myclinic.com.sa to login once created through normal signup

-- First, let's see if we need to create a trigger to handle new admins
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- Auto-approve admin emails and set their role
  IF NEW.email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@gmail.com']) THEN
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      role, 
      status,
      approved_at,
      approved_by
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'),
      'admin'::user_role,
      'active'::user_status,
      NOW(),
      NEW.id
    ) ON CONFLICT (id) DO UPDATE SET
      role = 'admin'::user_role,
      status = 'active'::user_status,
      approved_at = NOW();
      
    -- Confirm email immediately for admin users
    UPDATE auth.users 
    SET email_confirmed_at = NOW(), 
        confirmed_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;