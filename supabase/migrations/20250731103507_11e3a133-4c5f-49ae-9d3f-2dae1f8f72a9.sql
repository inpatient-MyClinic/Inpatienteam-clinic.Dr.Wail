-- Add password history and policies table
CREATE TABLE IF NOT EXISTS public.password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on password history
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Create policy for password history
CREATE POLICY "Users can view their own password history" 
ON public.password_history 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage password history" 
ON public.password_history 
FOR ALL 
USING (is_admin());

-- Add password change tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS password_change_required_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '3 months';

-- Create function to check password similarity
CREATE OR REPLACE FUNCTION public.check_password_similarity(user_id_param UUID, new_password_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  last_passwords TEXT[];
BEGIN
  -- Get last 5 password hashes for this user
  SELECT ARRAY(
    SELECT password_hash 
    FROM public.password_history 
    WHERE user_id = user_id_param 
    ORDER BY created_at DESC 
    LIMIT 5
  ) INTO last_passwords;
  
  -- Check if new password is similar to any of the last 5
  RETURN new_password_hash = ANY(last_passwords);
END;
$$;

-- Create function to handle password change
CREATE OR REPLACE FUNCTION public.handle_password_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for password changes (if not exists)
DROP TRIGGER IF EXISTS on_auth_password_change ON auth.users;
CREATE TRIGGER on_auth_password_change
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_password_change();

-- Create function to check if password change is required
CREATE OR REPLACE FUNCTION public.is_password_change_required(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT password_change_required_at, must_change_password
  INTO profile_record
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Return true if password change is required or overdue
  RETURN COALESCE(profile_record.must_change_password, FALSE) OR 
         COALESCE(profile_record.password_change_required_at, NOW()) <= NOW();
END;
$$;

-- Update existing profiles to have proper password change dates
UPDATE public.profiles 
SET 
  password_changed_at = COALESCE(password_changed_at, created_at),
  password_change_required_at = COALESCE(password_change_required_at, created_at + INTERVAL '3 months')
WHERE password_changed_at IS NULL OR password_change_required_at IS NULL;