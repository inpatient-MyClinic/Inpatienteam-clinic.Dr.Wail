-- Secure OTP storage and access hardening (idempotent)
-- 1) Ensure pgcrypto for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Add hashed column and migrate data safely
DO $$
BEGIN
  -- Add column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='otp_codes' AND column_name='code_hash'
  ) THEN
    ALTER TABLE public.otp_codes ADD COLUMN code_hash text;
  END IF;

  -- Backfill from existing plaintext column if it exists and hash is null
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='otp_codes' AND column_name='code'
  ) THEN
    UPDATE public.otp_codes 
    SET code_hash = encode(digest(code, 'sha256'), 'hex')
    WHERE code_hash IS NULL;
  END IF;

  -- Enforce NOT NULL on hash if the column exists and there are no NULLs left
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='otp_codes' AND column_name='code_hash'
  ) THEN
    -- Set a default for any rows still null just in case (won't match any code)
    UPDATE public.otp_codes SET code_hash = '' WHERE code_hash IS NULL;
    ALTER TABLE public.otp_codes ALTER COLUMN code_hash SET NOT NULL;
  END IF;

  -- Drop plaintext column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='otp_codes' AND column_name='code'
  ) THEN
    ALTER TABLE public.otp_codes DROP COLUMN code;
  END IF;
END$$;

-- 3) Update functions to use hashed codes and never store plaintext
CREATE OR REPLACE FUNCTION public.generate_otp(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  otp_code TEXT;
  normalized_email TEXT;
  otp_hash TEXT;
BEGIN
  -- Normalize email to lowercase and trim
  normalized_email := LOWER(TRIM(user_email));
  
  -- Generate 4-digit code
  otp_code := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  otp_hash := encode(digest(otp_code, 'sha256'), 'hex');
  
  -- Delete old codes for this email (case-insensitive)
  DELETE FROM public.otp_codes WHERE LOWER(email) = normalized_email;
  
  -- Insert new hashed code with 2-minute expiry
  INSERT INTO public.otp_codes (email, code_hash, expires_at)
  VALUES (normalized_email, otp_hash, NOW() + INTERVAL '2 minutes');
  
  -- Return plaintext code for delivery (never stored)
  RETURN otp_code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.verify_otp(user_email text, submitted_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  is_valid BOOLEAN := FALSE;
  normalized_email TEXT;
  submitted_hash TEXT;
BEGIN
  -- Normalize email to lowercase and trim
  normalized_email := LOWER(TRIM(user_email));
  submitted_hash := encode(digest(submitted_code, 'sha256'), 'hex');
  
  -- Check if code exists, is valid, not used, and not expired
  SELECT EXISTS(
    SELECT 1 FROM public.otp_codes 
    WHERE LOWER(email) = normalized_email 
      AND code_hash = submitted_hash 
      AND NOT used 
      AND expires_at > NOW()
  ) INTO is_valid;
  
  -- If valid, mark as used
  IF is_valid THEN
    UPDATE public.otp_codes 
    SET used = TRUE 
    WHERE LOWER(email) = normalized_email 
      AND code_hash = submitted_hash;
  END IF;
  
  RETURN is_valid;
END;
$function$;

-- 4) Indexes for performance and cleanup
CREATE INDEX IF NOT EXISTS idx_otp_email_lower ON public.otp_codes ((lower(email)));
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON public.otp_codes (expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_used ON public.otp_codes (used);

-- 5) Re-assert strict RLS and privileges (idempotent)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.otp_codes FROM PUBLIC;
REVOKE ALL ON TABLE public.otp_codes FROM anon;
REVOKE ALL ON TABLE public.otp_codes FROM authenticated;

-- 6) Create postgres-only RLS policies so only SECURITY DEFINER functions can access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'otp_codes' AND policyname = 'otp_postgres_select'
  ) THEN
    CREATE POLICY otp_postgres_select ON public.otp_codes FOR SELECT TO postgres USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'otp_codes' AND policyname = 'otp_postgres_insert'
  ) THEN
    CREATE POLICY otp_postgres_insert ON public.otp_codes FOR INSERT TO postgres WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'otp_codes' AND policyname = 'otp_postgres_update'
  ) THEN
    CREATE POLICY otp_postgres_update ON public.otp_codes FOR UPDATE TO postgres USING (true) WITH CHECK (true);
  END IF;
END$$;