-- Create a trigger function to automatically create profiles for new users
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users who don't have them
INSERT INTO public.profiles (id, email, full_name, role, status, approved_by, approved_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  CASE 
    WHEN au.email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@myclinic.com.sa']) 
    THEN 'admin'::user_role
    ELSE 'doctor'::user_role
  END,
  CASE 
    WHEN au.email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@myclinic.com.sa']) 
    THEN 'active'::user_status
    ELSE 'pending'::user_status
  END,
  CASE 
    WHEN au.email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@myclinic.com.sa']) 
    THEN au.id
    ELSE NULL
  END,
  CASE 
    WHEN au.email = ANY(ARRAY['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@myclinic.com.sa']) 
    THEN NOW()
    ELSE NULL
  END
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;