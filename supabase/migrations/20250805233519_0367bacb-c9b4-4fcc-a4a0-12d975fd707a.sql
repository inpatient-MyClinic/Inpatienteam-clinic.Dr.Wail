-- Create table for pre-approved emails (for non-@myclinic.com.sa domains)
CREATE TABLE public.pre_approved_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.pre_approved_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for pre_approved_emails
CREATE POLICY "Admins can view all pre-approved emails" 
ON public.pre_approved_emails 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert pre-approved emails" 
ON public.pre_approved_emails 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update pre-approved emails" 
ON public.pre_approved_emails 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete pre-approved emails" 
ON public.pre_approved_emails 
FOR DELETE 
USING (public.is_admin());

-- Create function to check if email is allowed to register
CREATE OR REPLACE FUNCTION public.is_email_allowed_to_register(check_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Normalize email
  check_email := LOWER(TRIM(check_email));
  
  -- Allow @myclinic.com.sa emails
  IF check_email LIKE '%@myclinic.com.sa' THEN
    RETURN true;
  END IF;
  
  -- Check if email is pre-approved
  RETURN EXISTS (
    SELECT 1 FROM public.pre_approved_emails 
    WHERE LOWER(email) = check_email
  );
END;
$$;