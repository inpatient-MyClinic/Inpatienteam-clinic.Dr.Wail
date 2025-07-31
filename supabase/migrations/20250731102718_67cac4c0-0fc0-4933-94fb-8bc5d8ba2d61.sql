-- Fix the search path security issue for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@myclinic.com.sa']) 
      THEN 'admin'::user_role
      ELSE 'doctor'::user_role
    END,
    CASE 
      WHEN NEW.email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@myclinic.com.sa']) 
      THEN 'active'::user_status
      ELSE 'pending'::user_status
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';