-- First, ensure the trigger exists properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    status, 
    approved_by, 
    approved_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN public.is_admin_email(NEW.email) THEN 'admin'
      ELSE 'doctor'
    END::user_role,
    CASE 
      WHEN public.is_admin_email(NEW.email) THEN 'active'
      ELSE 'pending'
    END::user_status,
    CASE 
      WHEN public.is_admin_email(NEW.email) THEN NEW.id
      ELSE NULL
    END,
    CASE 
      WHEN public.is_admin_email(NEW.email) THEN NOW()
      ELSE NULL
    END,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and continue
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();