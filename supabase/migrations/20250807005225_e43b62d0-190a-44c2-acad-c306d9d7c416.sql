-- Add password expiration tracking and forgot password functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 months'),
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;

-- Update existing users to require password change if they don't have one set
UPDATE public.profiles 
SET must_change_password = TRUE, 
    force_password_change = TRUE,
    password_expires_at = NOW() + INTERVAL '3 months'
WHERE password_changed_at IS NULL;

-- Create function to check if password is expired
CREATE OR REPLACE FUNCTION public.is_password_expired(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT password_expires_at, must_change_password, force_password_change
  INTO profile_record
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Return true if password is expired, must change, or forced to change
  RETURN COALESCE(profile_record.must_change_password, FALSE) OR 
         COALESCE(profile_record.force_password_change, FALSE) OR
         COALESCE(profile_record.password_expires_at, NOW()) <= NOW();
END;
$function$;

-- Update password change handler to reset expiration
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
    
    -- Update profile with password change info and reset expiration
    UPDATE public.profiles 
    SET 
      password_changed_at = NOW(),
      last_password_change = NOW(),
      must_change_password = FALSE,
      force_password_change = FALSE,
      password_expires_at = NOW() + INTERVAL '3 months'
    WHERE id = NEW.id;
    
    -- Log the password change
    RAISE NOTICE 'Password changed for user: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$function$;