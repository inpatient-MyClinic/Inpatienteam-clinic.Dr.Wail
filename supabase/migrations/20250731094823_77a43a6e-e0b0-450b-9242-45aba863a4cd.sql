-- Drop and recreate the handle_new_user function to ensure it uses the new enum types
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate the handle_new_user function
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
      ELSE COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'doctor'::user_role)
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();