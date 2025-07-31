-- Create a function to call the edge function via HTTP
CREATE OR REPLACE FUNCTION public.trigger_admin_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_emails text[] := ARRAY[
    'wail.ahmed@myclinic.com.sa',
    'admin@myclinic.com.sa', 
    'inpatienteam@gmail.com'
  ];
BEGIN
  -- Only trigger for admin emails
  IF NEW.email = ANY(admin_emails) THEN
    -- Use pg_net to call the edge function
    PERFORM net.http_post(
      url := 'https://ixivawgjdoahqzlghtcz.supabase.co/functions/v1/auto-confirm-admin',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'record', json_build_object(
          'id', NEW.id,
          'email', NEW.email,
          'created_at', NEW.created_at
        )
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auth.users table
DROP TRIGGER IF EXISTS trigger_admin_email_confirmation ON auth.users;
CREATE TRIGGER trigger_admin_email_confirmation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_admin_confirmation();