-- Update the generate_otp function to be case-insensitive
CREATE OR REPLACE FUNCTION public.generate_otp(user_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  otp_code TEXT;
  normalized_email TEXT;
BEGIN
  -- Normalize email to lowercase and trim
  normalized_email := LOWER(TRIM(user_email));
  
  -- Generate 4-digit code
  otp_code := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Delete old codes for this email (case-insensitive)
  DELETE FROM public.otp_codes WHERE LOWER(email) = normalized_email;
  
  -- Insert new code with 2-minute expiry
  INSERT INTO public.otp_codes (email, code, expires_at)
  VALUES (normalized_email, otp_code, NOW() + INTERVAL '2 minutes');
  
  RETURN otp_code;
END;
$function$;

-- Update the verify_otp function to be case-insensitive
CREATE OR REPLACE FUNCTION public.verify_otp(user_email text, submitted_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  is_valid BOOLEAN := FALSE;
  normalized_email TEXT;
BEGIN
  -- Normalize email to lowercase and trim
  normalized_email := LOWER(TRIM(user_email));
  
  -- Check if code exists, is valid, not used, and not expired
  SELECT EXISTS(
    SELECT 1 FROM public.otp_codes 
    WHERE LOWER(email) = normalized_email 
    AND code = submitted_code 
    AND NOT used 
    AND expires_at > NOW()
  ) INTO is_valid;
  
  -- If valid, mark as used
  IF is_valid THEN
    UPDATE public.otp_codes 
    SET used = TRUE 
    WHERE LOWER(email) = normalized_email AND code = submitted_code;
  END IF;
  
  RETURN is_valid;
END;
$function$;