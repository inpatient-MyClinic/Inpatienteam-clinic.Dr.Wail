-- Fix pre_approved_emails table constraint issue
-- Add unique constraint on email if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pre_approved_emails_email_key'
    ) THEN
        ALTER TABLE public.pre_approved_emails 
        ADD CONSTRAINT pre_approved_emails_email_key UNIQUE (email);
    END IF;
END $$;

-- Now safely insert test email
INSERT INTO public.pre_approved_emails (email, notes, added_at) 
VALUES ('test@example.com', 'Test email for QA', now())
ON CONFLICT (email) DO NOTHING;

-- Insert valid admin emails if they don't exist
INSERT INTO public.pre_approved_emails (email, notes, added_at) 
VALUES 
  ('admin@myclinic.com.sa', 'Admin email', now()),
  ('wail.ahmed@myclinic.com.sa', 'Admin email', now()),
  ('inpatienteam@gmail.com', 'Admin email', now())
ON CONFLICT (email) DO NOTHING;