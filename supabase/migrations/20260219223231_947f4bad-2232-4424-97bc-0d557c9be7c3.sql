
-- Doctor payment split configuration
CREATE TABLE public.doctor_payment_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_name TEXT NOT NULL,
  doctor_type TEXT NOT NULL DEFAULT 'part_time' CHECK (doctor_type IN ('part_time', 'full_time')),
  split_percentage NUMERIC(5,2) NOT NULL DEFAULT 85.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.doctor_payment_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage doctor splits" ON public.doctor_payment_splits FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Finance can view doctor splits" ON public.doctor_payment_splits FOR SELECT USING (public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Hospital can view doctor splits" ON public.doctor_payment_splits FOR SELECT USING (public.has_role(auth.uid(), 'hospital'));

-- Billing statements (submitted by hospital)
CREATE TABLE public.billing_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_name TEXT NOT NULL,
  submitted_by TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  month TEXT NOT NULL,
  year INT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'partially_agreed', 'all_agreed', 'vat_issued', 'pending_payment', 'paid', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage billing statements" ON public.billing_statements FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Finance manage billing statements" ON public.billing_statements FOR ALL USING (public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Hospital view own statements" ON public.billing_statements FOR SELECT USING (public.has_role(auth.uid(), 'hospital'));
CREATE POLICY "Hospital insert statements" ON public.billing_statements FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'hospital'));
CREATE POLICY "Hospital update own statements" ON public.billing_statements FOR UPDATE USING (public.has_role(auth.uid(), 'hospital'));

-- Billing items (line items in a statement)
CREATE TABLE public.billing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES public.billing_statements(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  doctor_name TEXT NOT NULL,
  specialty TEXT,
  procedure_name TEXT NOT NULL,
  procedure_date DATE NOT NULL,
  gross_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  patient_share NUMERIC(12,2) NOT NULL DEFAULT 0,
  insurance_share NUMERIC(12,2) NOT NULL DEFAULT 0,
  agreed_split_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  hospital_price NUMERIC(12,2),
  doctor_split_percentage NUMERIC(5,2) DEFAULT 85.00,
  doctor_payment_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'agreed', 'flagged', 'justified', 'resolved')),
  flag_reason TEXT,
  justification TEXT,
  finance_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage billing items" ON public.billing_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Finance manage billing items" ON public.billing_items FOR ALL USING (public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Hospital view own items" ON public.billing_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.billing_statements s WHERE s.id = statement_id AND public.has_role(auth.uid(), 'hospital'))
);
CREATE POLICY "Hospital insert items" ON public.billing_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.billing_statements s WHERE s.id = statement_id AND public.has_role(auth.uid(), 'hospital'))
);
CREATE POLICY "Hospital update items" ON public.billing_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.billing_statements s WHERE s.id = statement_id AND public.has_role(auth.uid(), 'hospital'))
);

-- VAT invoices
CREATE TABLE public.vat_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  statement_id UUID NOT NULL REFERENCES public.billing_statements(id),
  hospital_name TEXT NOT NULL,
  month TEXT NOT NULL,
  year INT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'sent', 'pending_payment', 'paid', 'cancelled')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vat_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage vat invoices" ON public.vat_invoices FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Finance manage vat invoices" ON public.vat_invoices FOR ALL USING (public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Hospital view own invoices" ON public.vat_invoices FOR SELECT USING (public.has_role(auth.uid(), 'hospital'));

-- Finance KPI settings
CREATE TABLE public.finance_kpi_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name TEXT NOT NULL UNIQUE,
  kpi_label TEXT NOT NULL,
  target_days INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_kpi_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage KPI settings" ON public.finance_kpi_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Finance view KPI settings" ON public.finance_kpi_settings FOR SELECT USING (public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Hospital view KPI settings" ON public.finance_kpi_settings FOR SELECT USING (public.has_role(auth.uid(), 'hospital'));

-- Insert default KPI settings
INSERT INTO public.finance_kpi_settings (kpi_name, kpi_label, target_days) VALUES
  ('statement_to_agreement', 'Statement to Agreement', 5),
  ('agreement_to_vat', 'Agreement to VAT Invoice', 5),
  ('vat_to_payment', 'VAT Invoice to Payment', 42),
  ('doctor_payment', 'Doctor Payment Processing', 42);

-- Triggers for updated_at
CREATE TRIGGER update_billing_statements_updated_at BEFORE UPDATE ON public.billing_statements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_billing_items_updated_at BEFORE UPDATE ON public.billing_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctor_payment_splits_updated_at BEFORE UPDATE ON public.doctor_payment_splits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_kpi_settings_updated_at BEFORE UPDATE ON public.finance_kpi_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default doctor split rules
INSERT INTO public.doctor_payment_splits (doctor_name, doctor_type, split_percentage) VALUES
  ('Default Part-Time', 'part_time', 85.00),
  ('Default Full-Time', 'full_time', 15.00);
