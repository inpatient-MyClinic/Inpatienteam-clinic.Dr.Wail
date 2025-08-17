-- 1) Optional lookup to standardize hospital names
CREATE TABLE IF NOT EXISTS hospitals (
  code text PRIMARY KEY,
  name text NOT NULL
);

-- 2) Canonical table for live requests (ensure required columns exist)
ALTER TABLE IF EXISTS medical_requests
  ADD COLUMN IF NOT EXISTS request_date date,
  ADD COLUMN IF NOT EXISTS branch_code text,
  ADD COLUMN IF NOT EXISTS hospital_code text,
  ADD COLUMN IF NOT EXISTS hospital_name text,
  ADD COLUMN IF NOT EXISTS specialty text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS loss_reason text,
  ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0;

-- 3) STAGING for Excel uploads (raw rows)
CREATE TABLE IF NOT EXISTS excel_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file text NOT NULL,
  imported_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS excel_rows_raw (
  upload_id uuid REFERENCES excel_uploads(id) ON DELETE CASCADE,
  row_no int NOT NULL,
  "Date" text,
  "Branch" text,
  "Hospital Code" text,
  "Hospital Name" text,
  "Specialty" text,
  "Status" text,
  "Loss Reason" text,
  "Paid Amount" text,
  PRIMARY KEY (upload_id, row_no)
);

-- 4) Normalization helpers
CREATE OR REPLACE FUNCTION norm_text(t text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT nullif(trim(both from t), '')
$$;

CREATE OR REPLACE FUNCTION norm_upper(t text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT case when t is null then null else upper(trim(both from t)) end
$$;

CREATE OR REPLACE FUNCTION norm_status(s text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT case upper(trim(both from coalesce(s,'')))
    when 'DONE' then 'Completed'
    when 'COMPLETED' then 'Completed'
    when 'SCHEDULED' then 'Scheduled'
    when 'PLANNED NVD' then 'Planned NVD'
    when 'NVD PLANNED' then 'Planned NVD'
    when 'CANCELLED' then 'Cancelled'
    when 'CANCELED' then 'Cancelled'
    when 'POLICY REJECTION' then 'Policy Rejection'
    when 'INSURANCE REJECTION' then 'Insurance Rejection'
    when 'PENDING' then 'Pending'
    when 'RESCHEDULE' then 'Reschedule'
    when 'RESCHEDULED' then 'Reschedule'
    when 'POSTPONED' then 'Postponed'
    when 'PRIVILEGE' then 'Privilege'
    else nullif(initcap(trim(both from s)),'')
  end
$$;

-- 5) Performance indexes
CREATE INDEX IF NOT EXISTS ix_medreq_request_date ON medical_requests (request_date);
CREATE INDEX IF NOT EXISTS ix_medreq_created_date ON medical_requests (created_at);
CREATE INDEX IF NOT EXISTS ix_medreq_status ON medical_requests (status);
CREATE INDEX IF NOT EXISTS ix_medreq_branch ON medical_requests (branch_code);
CREATE INDEX IF NOT EXISTS ix_medreq_hosp ON medical_requests (hospital_name);
CREATE INDEX IF NOT EXISTS ix_medreq_spec ON medical_requests (specialty);

CREATE INDEX IF NOT EXISTS ix_excel_date ON excel_requests (request_date);
CREATE INDEX IF NOT EXISTS ix_excel_status ON excel_requests (status);
CREATE INDEX IF NOT EXISTS ix_excel_branch ON excel_requests (branch_code);
CREATE INDEX IF NOT EXISTS ix_excel_hosp ON excel_requests (hospital_name);
CREATE INDEX IF NOT EXISTS ix_excel_spec ON excel_requests (specialty);

-- 6) RPC to upsert raw rows then normalize into excel_requests
CREATE OR REPLACE FUNCTION import_excel_rows(p_source_file text, p_rows jsonb)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE 
  v_upload uuid; 
  v_count int;
BEGIN
  INSERT INTO excel_uploads(source_file) VALUES (p_source_file) RETURNING id INTO v_upload;

  -- 1) raw
  INSERT INTO excel_rows_raw(upload_id, row_no, "Date","Branch","Hospital Code","Hospital Name","Specialty","Status","Loss Reason","Paid Amount")
  SELECT v_upload, (row->>'__row')::int,
         row->>'Date', row->>'Branch', row->>'Hospital Code', row->>'Hospital Name',
         row->>'Specialty', row->>'Status', row->>'Loss Reason', row->>'Paid Amount'
  FROM jsonb_to_recordset(p_rows) as row;

  -- 2) clean/normalize into excel_requests
  INSERT INTO excel_requests(upload_id,row_no,request_date,branch_code,hospital_code,hospital_name,specialty,status,loss_reason,paid_amount)
  SELECT
    v_upload,
    r.row_no,
    -- robust date parsing: try ISO, then DD/MM/YYYY, then MM/DD/YYYY
    CASE 
      WHEN r."Date" ~ '^\d{4}-\d{2}-\d{2}$' THEN r."Date"::date
      WHEN r."Date" ~ '^\d{2}/\d{2}/\d{4}$' THEN to_date(r."Date",'DD/MM/YYYY')
      WHEN r."Date" ~ '^\d{1,2}/\d{1,2}/\d{4}$' THEN to_date(r."Date",'MM/DD/YYYY')
      ELSE NULL
    END as request_date,
    nullif(norm_upper(r."Branch"),'') as branch_code,
    norm_text(r."Hospital Code") as hospital_code,
    norm_text(r."Hospital Name") as hospital_name,
    norm_text(r."Specialty") as specialty,
    norm_status(r."Status") as status,
    norm_text(r."Loss Reason") as loss_reason,
    case
      when trim(coalesce(r."Paid Amount",'')) ~ '^[0-9]+(\.[0-9]+)?$' then (r."Paid Amount")::numeric
      else 0
    end as paid_amount
  FROM excel_rows_raw r
  WHERE r.upload_id = v_upload
  ON CONFLICT (upload_id, row_no) DO UPDATE SET
    request_date = EXCLUDED.request_date,
    branch_code  = EXCLUDED.branch_code,
    hospital_code= EXCLUDED.hospital_code,
    hospital_name= EXCLUDED.hospital_name,
    specialty    = EXCLUDED.specialty,
    status       = EXCLUDED.status,
    loss_reason  = EXCLUDED.loss_reason,
    paid_amount  = EXCLUDED.paid_amount;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;