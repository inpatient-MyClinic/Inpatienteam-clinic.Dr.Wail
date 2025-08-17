-- Create excel_requests table for imported data
CREATE TABLE IF NOT EXISTS excel_requests (
  id BIGSERIAL PRIMARY KEY,
  request_date DATE,
  branch_code TEXT,
  hospital_name TEXT,
  specialty TEXT,
  status TEXT,
  loss_reason TEXT,
  paid_amount NUMERIC DEFAULT 0,
  patient_name TEXT,
  patient_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_data JSONB
);

-- Add missing columns to medical_requests
ALTER TABLE medical_requests 
ADD COLUMN IF NOT EXISTS request_date DATE,
ADD COLUMN IF NOT EXISTS branch_code TEXT,
ADD COLUMN IF NOT EXISTS hospital_name TEXT,
ADD COLUMN IF NOT EXISTS loss_reason TEXT,
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;

-- Update medical_requests with derived values
UPDATE medical_requests SET 
  request_date = COALESCE(request_date, created_at::date),
  hospital_name = COALESCE(hospital_name, hospital_code),
  branch_code = COALESCE(branch_code, hospital_code);

-- Create SIA settings table
CREATE TABLE IF NOT EXISTS sia_settings (
  id BIGSERIAL PRIMARY KEY,
  scope TEXT DEFAULT 'global',
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scope, key),
  CONSTRAINT sia_scope_chk CHECK (length(scope) > 0)
);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_touch_sia_settings ON sia_settings;
CREATE TRIGGER trg_touch_sia_settings
BEFORE UPDATE ON sia_settings
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Enable RLS on sia_settings
ALTER TABLE sia_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for sia_settings
CREATE POLICY "Admins can manage SIA settings"
ON sia_settings FOR ALL
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Users can view SIA settings"
ON sia_settings FOR SELECT USING (true);

-- Helper functions for settings
CREATE OR REPLACE FUNCTION get_sia_setting(setting_key TEXT, setting_scope TEXT DEFAULT 'global')
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v JSONB;
BEGIN
  SELECT value INTO v FROM sia_settings WHERE key = setting_key AND scope = setting_scope;
  RETURN COALESCE(v, '[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION update_sia_setting(setting_key TEXT, setting_value JSONB, setting_scope TEXT DEFAULT 'global')
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO sia_settings(scope, key, value, updated_at)
  VALUES (setting_scope, setting_key, setting_value, NOW())
  ON CONFLICT (scope, key)
  DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
END $$;

-- Create unified requests view with proper enum handling
CREATE OR REPLACE VIEW requests_v AS
SELECT
  id::text as uid,
  COALESCE(request_date::date, created_at::date) as request_date,
  UPPER(NULLIF(branch_code,'')) as branch_code,
  NULLIF(hospital_name,'') as hospital_name,
  NULLIF(specialty,'') as specialty,
  CASE WHEN status::text = '' THEN NULL ELSE status::text END as status,
  NULLIF(loss_reason,'') as loss_reason,
  COALESCE(paid_amount,0)::numeric as paid_amount,
  'medical' as source_type
FROM medical_requests
UNION ALL
SELECT
  CONCAT('X-', id::text) as uid,
  COALESCE(request_date::date, created_at::date) as request_date,
  UPPER(NULLIF(branch_code,'')) as branch_code,
  NULLIF(hospital_name,'') as hospital_name,
  NULLIF(specialty,'') as specialty,
  NULLIF(status,'') as status,
  NULLIF(loss_reason,'') as loss_reason,
  COALESCE(paid_amount,0)::numeric as paid_amount,
  'excel' as source_type
FROM excel_requests
WHERE excel_requests.id IS NOT NULL;

-- Performance indexes for medical_requests
CREATE INDEX IF NOT EXISTS ix_medreq_date ON medical_requests ((COALESCE(request_date::date, created_at::date)));
CREATE INDEX IF NOT EXISTS ix_medreq_status ON medical_requests(status);
CREATE INDEX IF NOT EXISTS ix_medreq_branch ON medical_requests(branch_code);
CREATE INDEX IF NOT EXISTS ix_medreq_hospital ON medical_requests(hospital_name);
CREATE INDEX IF NOT EXISTS ix_medreq_specialty ON medical_requests(specialty);

-- Performance indexes for excel_requests
CREATE INDEX IF NOT EXISTS ix_excel_date ON excel_requests ((COALESCE(request_date::date, created_at::date)));
CREATE INDEX IF NOT EXISTS ix_excel_status ON excel_requests(status);
CREATE INDEX IF NOT EXISTS ix_excel_branch ON excel_requests(branch_code);
CREATE INDEX IF NOT EXISTS ix_excel_hospital ON excel_requests(hospital_name);
CREATE INDEX IF NOT EXISTS ix_excel_specialty ON excel_requests(specialty);

-- Insert default SIA settings
INSERT INTO sia_settings(scope, key, value) VALUES
('global','numerator_statuses', '["Completed","Scheduled","Planned NVD"]')
ON CONFLICT (scope,key) DO NOTHING;

INSERT INTO sia_settings(scope, key, value) VALUES
('global','loss_cancelled_statuses', '["Cancelled","Policy Rejection","Cancelled decision","Insurance Rejection"]')
ON CONFLICT (scope,key) DO NOTHING;

INSERT INTO sia_settings(scope, key, value) VALUES
('global','loss_pending_statuses', '["Pending","Reschedule","Privilege","Postponed"]')
ON CONFLICT (scope,key) DO NOTHING;