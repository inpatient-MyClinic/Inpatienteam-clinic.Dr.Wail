-- Create trigger to automatically track password changes
CREATE OR REPLACE TRIGGER on_password_changed
  AFTER UPDATE OF encrypted_password ON auth.users
  FOR EACH ROW
  WHEN (OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password)
  EXECUTE FUNCTION public.handle_password_change();

-- Update the handle_password_change function to be more robust
CREATE OR REPLACE FUNCTION public.handle_password_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only proceed if this is a password change (not initial creation)
  IF OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password AND OLD.encrypted_password IS NOT NULL THEN
    -- Store old password in history
    INSERT INTO public.password_history (user_id, password_hash)
    VALUES (NEW.id, OLD.encrypted_password);
    
    -- Update profile with password change info
    UPDATE public.profiles 
    SET 
      password_changed_at = NOW(),
      must_change_password = FALSE,
      password_change_required_at = NOW() + INTERVAL '3 months'
    WHERE id = NEW.id;
    
    -- Log the password change
    RAISE NOTICE 'Password changed for user: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure password history cleanup (keep only last 10 passwords per user)
CREATE OR REPLACE FUNCTION public.cleanup_old_passwords()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Delete old password history, keeping only the last 10 per user
  DELETE FROM public.password_history
  WHERE id NOT IN (
    SELECT id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM public.password_history
    ) ranked
    WHERE rn <= 10
  );
END;
$function$;