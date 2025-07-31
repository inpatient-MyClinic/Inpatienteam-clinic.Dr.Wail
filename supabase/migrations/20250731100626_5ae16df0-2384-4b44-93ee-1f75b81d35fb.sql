-- Update the handle_new_user function to also confirm admin emails directly
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
  
  -- If admin email, confirm the email directly in auth.users
  IF public.is_admin_email(NEW.email) THEN
    UPDATE auth.users 
    SET 
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and continue
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;