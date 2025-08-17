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

-- 5) Performance indexes (date-first to match month filters)
CREATE INDEX IF NOT EXISTS ix_medreq_date ON medical_requests ((coalesce(request_date, created_at::date)));
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
    coalesce(
      nullif(r."Date",'')::date,
      to_date(r."Date",'DD/MM/YYYY'),
      to_date(r."Date",'MM/DD/YYYY')
    ) as request_date,
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

-- 7) KPI Functions
CREATE OR REPLACE FUNCTION kpi_conversion_rate(
  p_start date, p_end date,
  p_statuses text[] DEFAULT NULL,
  p_hospitals text[] DEFAULT NULL,
  p_specs text[] DEFAULT NULL,
  p_branches text[] DEFAULT NULL
) RETURNS TABLE(denominator int, numerator int, conversion_rate numeric)
LANGUAGE sql STABLE AS $$
WITH cfg AS (
  SELECT array(
    SELECT jsonb_array_elements_text(value)
    FROM sia_settings WHERE key='numerator_statuses' AND scope='global'
  ) num
),
base AS (
  SELECT * FROM requests_v
  WHERE request_date >= p_start AND request_date < p_end
    AND (p_statuses  IS NULL OR status        = ANY(p_statuses))
    AND (p_hospitals IS NULL OR hospital_name = ANY(p_hospitals))
    AND (p_specs     IS NULL OR specialty     = ANY(p_specs))
    AND (p_branches  IS NULL OR branch_code   = ANY(p_branches))
)
SELECT
  count(*)::int,
  count(*) FILTER (WHERE status = ANY((SELECT num FROM cfg)))::int,
  coalesce(round(100.0 * count(*) FILTER (WHERE status = ANY((SELECT num FROM cfg))) / nullif(count(*),0),2),0)
$$;

CREATE OR REPLACE FUNCTION kpi_branch_counts(p_start date, p_end date,
  p_statuses text[] DEFAULT NULL,
  p_hospitals text[] DEFAULT NULL,
  p_specs text[] DEFAULT NULL,
  p_branches text[] DEFAULT NULL)
RETURNS TABLE(branch_code text, cnt int)
LANGUAGE sql STABLE AS $$
SELECT branch_code, count(*)::int
FROM requests_v
WHERE request_date >= p_start AND request_date < p_end
  AND (p_statuses  IS NULL OR status        = ANY(p_statuses))
  AND (p_hospitals IS NULL OR hospital_name = ANY(p_hospitals))
  AND (p_specs     IS NULL OR specialty     = ANY(p_specs))
  AND (p_branches  IS NULL OR branch_code   = ANY(p_branches))
GROUP BY branch_code;
$$;

CREATE OR REPLACE FUNCTION kpi_top_hospitals(p_start date, p_end date,
  p_statuses text[] DEFAULT NULL,
  p_hospitals text[] DEFAULT NULL,
  p_specs text[] DEFAULT NULL,
  p_branches text[] DEFAULT NULL)
RETURNS TABLE(hospital_name text, cnt int)
LANGUAGE sql STABLE AS $$
SELECT hospital_name, count(*)::int
FROM requests_v
WHERE request_date >= p_start AND request_date < p_end
  AND (p_statuses  IS NULL OR status        = ANY(p_statuses))
  AND (p_hospitals IS NULL OR hospital_name = ANY(p_hospitals))
  AND (p_specs     IS NULL OR specialty     = ANY(p_specs))
  AND (p_branches  IS NULL OR branch_code   = ANY(p_branches))
GROUP BY hospital_name
ORDER BY 2 DESC NULLS LAST
LIMIT 5;
$$;

CREATE OR REPLACE FUNCTION kpi_top_specialties(p_start date, p_end date,
  p_statuses text[] DEFAULT NULL,
  p_hospitals text[] DEFAULT NULL,
  p_specs text[] DEFAULT NULL,
  p_branches text[] DEFAULT NULL)
RETURNS TABLE(specialty text, cnt int)
LANGUAGE sql STABLE AS $$
SELECT specialty, count(*)::int
FROM requests_v
WHERE request_date >= p_start AND request_date < p_end
  AND (p_statuses  IS NULL OR status        = ANY(p_statuses))
  AND (p_hospitals IS NULL OR hospital_name = ANY(p_hospitals))
  AND (p_specs     IS NULL OR specialty     = ANY(p_specs))
  AND (p_branches  IS NULL OR branch_code   = ANY(p_branches))
GROUP BY specialty
ORDER BY 2 DESC NULLS LAST
LIMIT 5;
$$;

CREATE OR REPLACE FUNCTION kpi_loss_tree(p_start date, p_end date,
  p_statuses text[] DEFAULT NULL,
  p_hospitals text[] DEFAULT NULL,
  p_specs text[] DEFAULT NULL,
  p_branches text[] DEFAULT NULL)
RETURNS TABLE(cancelled_total int, pending_total int,
              cancelled_doc int, cancelled_medical int, cancelled_ins int, cancelled_other int,
              pending_doc int, pending_medical int, pending_ins int, pending_other int)
LANGUAGE sql STABLE AS $$
WITH cfg AS (
  SELECT
    array(SELECT jsonb_array_elements_text(value) FROM sia_settings WHERE key='loss_cancelled_statuses' AND scope='global') AS cancelled,
    array(SELECT jsonb_array_elements_text(value) FROM sia_settings WHERE key='loss_pending_statuses' AND scope='global')   AS pending
),
base AS (
  SELECT * FROM requests_v
  WHERE request_date >= p_start AND request_date < p_end
    AND (p_statuses  IS NULL OR status        = ANY(p_statuses))
    AND (p_hospitals IS NULL OR hospital_name = ANY(p_hospitals))
    AND (p_specs     IS NULL OR specialty     = ANY(p_specs))
    AND (p_branches  IS NULL OR branch_code   = ANY(p_branches))
)
SELECT
  sum((status = ANY((SELECT cancelled FROM cfg)))::int),
  sum((status = ANY((SELECT pending FROM cfg)))::int),

  sum(((status = ANY((SELECT cancelled FROM cfg))) AND loss_reason='Documentation')::int),
  sum(((status = ANY((SELECT cancelled FROM cfg))) AND loss_reason='Medical Criteria')::int),
  sum(((status = ANY((SELECT cancelled FROM cfg))) AND loss_reason='Insurance')::int),
  sum(((status = ANY((SELECT cancelled FROM cfg))) AND (loss_reason IS NULL OR loss_reason NOT IN ('Documentation','Medical Criteria','Insurance')))::int),

  sum(((status = ANY((SELECT pending FROM cfg))) AND loss_reason='Documentation')::int),
  sum(((status = ANY((SELECT pending FROM cfg))) AND loss_reason='Medical Criteria')::int),
  sum(((status = ANY((SELECT pending FROM cfg))) AND loss_reason='Insurance')::int),
  sum(((status = ANY((SELECT pending FROM cfg))) AND (loss_reason IS NULL OR loss_reason NOT IN ('Documentation','Medical Criteria','Insurance')))::int)
FROM base;
$$;