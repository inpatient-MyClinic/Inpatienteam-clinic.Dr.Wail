-- Lock down otp_codes: enable RLS and ensure no public policies exist
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Drop any permissive policies if they exist (defensive)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'otp_codes'
  ) THEN
    EXECUTE (
      SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(polname) || ' ON public.otp_codes;', ' ')
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'otp_codes'
    );
  END IF;
END $$;

-- Note: No SELECT/INSERT/UPDATE/DELETE policies are created intentionally.
-- Access to otp_codes is only via SECURITY DEFINER functions (generate_otp, verify_otp).
