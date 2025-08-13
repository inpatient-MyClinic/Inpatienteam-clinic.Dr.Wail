-- Secure OTP codes with strict RLS so only SECURITY DEFINER functions (owned by postgres) can access
-- Enable and force RLS on the table
DO $$
BEGIN
  -- Enable RLS if not already
  EXECUTE 'ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY';
  -- Force RLS to apply to table owner as well
  EXECUTE 'ALTER TABLE public.otp_codes FORCE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN
  RAISE EXCEPTION 'Table public.otp_codes does not exist. Please create it before applying RLS.';
END$$;

-- Drop any existing policies to avoid permissive leftovers
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'otp_codes' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.otp_codes', p.policyname);
  END LOOP;
END$$;

-- Create a single deny-by-default policy that only allows the postgres role (function owner) to access via SECURITY DEFINER
CREATE POLICY "otp_codes access via postgres only" 
ON public.otp_codes
FOR ALL
TO postgres
USING (true)
WITH CHECK (true);

-- Revoke all direct privileges from common API roles
REVOKE ALL ON TABLE public.otp_codes FROM PUBLIC;
REVOKE ALL ON TABLE public.otp_codes FROM anon;
REVOKE ALL ON TABLE public.otp_codes FROM authenticated;

-- Optional: lock down sequence if the table has one (ignore if none exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S' AND n.nspname = 'public' AND c.relname = 'otp_codes_id_seq'
  ) THEN
    EXECUTE 'REVOKE ALL ON SEQUENCE public.otp_codes_id_seq FROM PUBLIC, anon, authenticated';
  END IF;
END$$;