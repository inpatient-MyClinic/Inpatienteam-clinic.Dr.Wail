-- Create a temporary admin bypass for login issues
-- This will allow the admin to login with a known temporary password

-- Update the admin user to allow temporary login
UPDATE auth.users 
SET encrypted_password = crypt('TempAdmin123!', gen_salt('bf'))
WHERE email = 'admin@myclinic.com.sa';

-- Also update the profile to ensure no password change is required immediately
UPDATE public.profiles 
SET must_change_password = FALSE,
    force_password_change = FALSE,
    password_expires_at = NOW() + INTERVAL '7 days'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@myclinic.com.sa');