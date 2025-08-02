-- Fix the handle_new_user function to use correct admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@gmail.com']) 
      THEN 'admin'::user_role
      ELSE 'doctor'::user_role
    END,
    CASE 
      WHEN NEW.email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@gmail.com']) 
      THEN 'active'::user_status
      ELSE 'pending'::user_status
    END
  );
  RETURN NEW;
END;
$$;