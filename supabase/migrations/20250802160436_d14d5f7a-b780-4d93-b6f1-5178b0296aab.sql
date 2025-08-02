-- Create OTP codes table for email verification
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for OTP codes
CREATE POLICY "Users can view their own OTP codes" 
ON public.otp_codes 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "System can manage OTP codes" 
ON public.otp_codes 
FOR ALL 
USING (true);

-- Create function to generate and store OTP
CREATE OR REPLACE FUNCTION public.generate_otp(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp_code TEXT;
BEGIN
  -- Generate 4-digit code
  otp_code := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Delete old codes for this email
  DELETE FROM public.otp_codes WHERE email = user_email;
  
  -- Insert new code with 2-minute expiry
  INSERT INTO public.otp_codes (email, code, expires_at)
  VALUES (user_email, otp_code, NOW() + INTERVAL '2 minutes');
  
  RETURN otp_code;
END;
$$;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_otp(user_email TEXT, submitted_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_valid BOOLEAN := FALSE;
BEGIN
  -- Check if code exists, is valid, not used, and not expired
  SELECT EXISTS(
    SELECT 1 FROM public.otp_codes 
    WHERE email = user_email 
    AND code = submitted_code 
    AND NOT used 
    AND expires_at > NOW()
  ) INTO is_valid;
  
  -- If valid, mark as used
  IF is_valid THEN
    UPDATE public.otp_codes 
    SET used = TRUE 
    WHERE email = user_email AND code = submitted_code;
  END IF;
  
  RETURN is_valid;
END;
$$;