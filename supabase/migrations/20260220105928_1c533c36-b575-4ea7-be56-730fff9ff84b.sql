
CREATE TABLE public.nps_monthly_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_name TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  total_patients_done INTEGER NOT NULL DEFAULT 0,
  total_surveys_sent INTEGER NOT NULL DEFAULT 0,
  total_responses INTEGER NOT NULL DEFAULT 0,
  promoters INTEGER NOT NULL DEFAULT 0,
  passives INTEGER NOT NULL DEFAULT 0,
  detractors INTEGER NOT NULL DEFAULT 0,
  nps_score NUMERIC GENERATED ALWAYS AS (
    CASE WHEN total_responses > 0 
      THEN ROUND(((promoters - detractors)::NUMERIC / total_responses) * 100, 1)
      ELSE 0 
    END
  ) STORED,
  specialty TEXT DEFAULT '',
  doctor_name TEXT DEFAULT '',
  complaints_count INTEGER NOT NULL DEFAULT 0,
  complaints_closed INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hospital_name, month, year, specialty, doctor_name)
);

ALTER TABLE public.nps_monthly_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage NPS entries"
ON public.nps_monthly_entries FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customer care manage NPS entries"
ON public.nps_monthly_entries FOR ALL
USING (has_role(auth.uid(), 'customer-care'::app_role));

CREATE POLICY "Finance view NPS entries"
ON public.nps_monthly_entries FOR SELECT
USING (has_role(auth.uid(), 'finance'::app_role));

CREATE POLICY "Hospital view NPS entries"
ON public.nps_monthly_entries FOR SELECT
USING (has_role(auth.uid(), 'hospital'::app_role));

CREATE POLICY "Doctor view NPS entries"
ON public.nps_monthly_entries FOR SELECT
USING (has_role(auth.uid(), 'doctor'::app_role));

CREATE TRIGGER update_nps_entries_updated_at
BEFORE UPDATE ON public.nps_monthly_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
