-- Create an admin user with proper credentials
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@myclinic.com.sa',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('Admin123!', gen_salt('bf')),
  updated_at = now();

-- Update pre-approved emails to allow test email
INSERT INTO public.pre_approved_emails (email, created_at) 
VALUES ('test@example.com', now())
ON CONFLICT (email) DO NOTHING;