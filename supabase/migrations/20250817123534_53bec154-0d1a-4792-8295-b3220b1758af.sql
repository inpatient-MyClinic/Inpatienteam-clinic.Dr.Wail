-- Fix security issues: Enable RLS and add policies

-- Enable RLS on new tables
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_rows_raw ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hospitals table
CREATE POLICY "Anyone can view hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Admins can manage hospitals" ON hospitals FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Create RLS policies for excel_uploads table
CREATE POLICY "Admins can view excel uploads" ON excel_uploads FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage excel uploads" ON excel_uploads FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Create RLS policies for excel_rows_raw table  
CREATE POLICY "Admins can view excel rows raw" ON excel_rows_raw FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage excel rows raw" ON excel_rows_raw FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Add missing search_path to functions
ALTER FUNCTION norm_text(text) SET search_path = '';
ALTER FUNCTION norm_upper(text) SET search_path = '';
ALTER FUNCTION norm_status(text) SET search_path = '';
ALTER FUNCTION import_excel_rows(text, jsonb) SET search_path = 'public';

-- Create the unified view and KPI functions
CREATE OR REPLACE VIEW requests_v AS
SELECT
  mr.id::text as uid,
  COALESCE(mr.request_date, mr.created_at::date) as request_date,
  upper(nullif(mr.branch_code,'')) as branch_code,
  COALESCE(mr.hospital_name, (SELECT name FROM hospitals h WHERE h.code = mr.hospital_code)) as hospital_name,
  nullif(mr.specialty,'') as specialty,
  nullif(mr.status,'') as status,
  nullif(mr.loss_reason,'') as loss_reason,
  COALESCE(mr.paid_amount,0)::numeric as paid_amount
FROM medical_requests mr
UNION ALL
SELECT
  concat('X-', er.id::text) as uid,
  er.request_date,
  upper(nullif(er.branch_code,'')) as branch_code,
  COALESCE(er.hospital_name, (SELECT name FROM hospitals h WHERE h.code = er.hospital_code)) as hospital_name,
  er.specialty,
  er.status,
  er.loss_reason,
  COALESCE(er.paid_amount,0)::numeric
FROM excel_requests er;

-- KPI Functions with search_path
CREATE OR REPLACE FUNCTION kpi_conversion_rate(
  p_start date, p_end date,
  p_statuses text[] DEFAULT NULL,
  p_hospitals text[] DEFAULT NULL,
  p_specs text[] DEFAULT NULL,
  p_branches text[] DEFAULT NULL
) RETURNS TABLE(denominator int, numerator int, conversion_rate numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
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
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
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
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
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
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
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
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
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