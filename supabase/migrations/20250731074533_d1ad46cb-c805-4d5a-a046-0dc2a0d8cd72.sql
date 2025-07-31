-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'doctor', 'nurse', 'hospital', 'case-coordinator', 'finance', 'customer-care');

-- Create user status enum  
CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'inactive', 'suspended');

-- Create request status enum
CREATE TYPE public.request_status AS ENUM ('pending', 'in-progress', 'completed', 'cancelled', 'rejected');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'doctor',
  status user_status NOT NULL DEFAULT 'pending',
  specialty TEXT,
  hospital_code TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create medical requests table
CREATE TABLE public.medical_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  medical_condition TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital_code TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal',
  status request_status DEFAULT 'pending',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create request history table for audit trail
CREATE TABLE public.request_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.medical_requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status request_status,
  new_status request_status,
  notes TEXT,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create finance transactions table
CREATE TABLE public.finance_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.medical_requests(id),
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'SAR',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for internal communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.medical_requests(id),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  recipient_role user_role,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

-- Medical requests policies
CREATE POLICY "Users can view requests based on role" ON public.medical_requests
  FOR SELECT USING (
    CASE public.get_current_user_role()
      WHEN 'admin' THEN TRUE
      WHEN 'doctor' THEN created_by = auth.uid() OR assigned_to = auth.uid()
      WHEN 'nurse' THEN assigned_to = auth.uid()
      WHEN 'hospital' THEN TRUE -- Hospital users can see all requests
      WHEN 'case-coordinator' THEN TRUE
      WHEN 'finance' THEN TRUE
      WHEN 'customer-care' THEN TRUE
      ELSE FALSE
    END
  );

CREATE POLICY "Users can create requests" ON public.medical_requests
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authorized users can update requests" ON public.medical_requests
  FOR UPDATE USING (
    public.get_current_user_role() IN ('admin', 'case-coordinator', 'nurse') OR
    created_by = auth.uid() OR assigned_to = auth.uid()
  );

-- Request history policies
CREATE POLICY "Users can view request history they have access to" ON public.request_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.medical_requests mr 
      WHERE mr.id = request_id AND (
        CASE public.get_current_user_role()
          WHEN 'admin' THEN TRUE
          WHEN 'doctor' THEN mr.created_by = auth.uid() OR mr.assigned_to = auth.uid()
          WHEN 'nurse' THEN mr.assigned_to = auth.uid()
          ELSE TRUE
        END
      )
    )
  );

CREATE POLICY "Users can insert request history" ON public.request_history
  FOR INSERT WITH CHECK (changed_by = auth.uid());

-- Finance transactions policies
CREATE POLICY "Finance and admin can view all transactions" ON public.finance_transactions
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'finance'));

CREATE POLICY "Others can view transactions for their requests" ON public.finance_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.medical_requests mr 
      WHERE mr.id = request_id AND (mr.created_by = auth.uid() OR mr.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Finance users can manage transactions" ON public.finance_transactions
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'finance'))
  WITH CHECK (public.get_current_user_role() IN ('admin', 'finance'));

-- Messages policies
CREATE POLICY "Users can view messages sent to them or from them" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    (recipient_role IS NOT NULL AND public.get_current_user_role() = recipient_role) OR
    public.is_admin()
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid() OR sender_id = auth.uid());

-- Create function to handle new user registration
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_requests_updated_at
  BEFORE UPDATE ON public.medical_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create admin user approval function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;