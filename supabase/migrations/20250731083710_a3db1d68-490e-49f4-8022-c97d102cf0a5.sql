-- Fix security warnings by setting search_path for all functions

-- Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

-- Update is_admin function  
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'doctor'),
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Update approve_user function
CREATE OR REPLACE FUNCTION public.approve_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve users';
  END IF;
  
  UPDATE public.profiles 
  SET status = 'active', approved_by = auth.uid(), approved_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';