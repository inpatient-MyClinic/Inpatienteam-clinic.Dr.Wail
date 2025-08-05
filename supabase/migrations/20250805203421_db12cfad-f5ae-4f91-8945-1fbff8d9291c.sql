-- Fix the trigger function that's causing the net schema error
CREATE OR REPLACE FUNCTION public.trigger_admin_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  admin_emails text[] := ARRAY[
    'wail.ahmed@myclinic.com.sa',
    'admin@myclinic.com.sa', 
    'inpatienteam@gmail.com'
  ];
BEGIN
  -- Only auto-approve admin emails, but don't try to call edge functions
  -- since net schema is not available
  IF NEW.email = ANY(admin_emails) THEN
    -- Just log that this is an admin user
    RAISE NOTICE 'Admin user created: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$function$;