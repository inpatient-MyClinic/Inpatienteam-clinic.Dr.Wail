-- Lightweight reset of analytics objects (keeps your data)
DROP VIEW IF EXISTS requests_v CASCADE;
DROP TABLE IF EXISTS excel_requests, excel_rows_raw, excel_uploads, sia_settings CASCADE;
DROP FUNCTION IF EXISTS import_excel_rows(text,jsonb), 
                       kpi_conversion_rate(date,date,text[],text[],text[],text[]),
                       kpi_branch_counts(date,date,text[],text[],text[],text[]),
                       kpi_top_hospitals(date,date,text[],text[],text[],text[]),
                       kpi_top_specialties(date,date,text[],text[],text[],text[]),
                       kpi_loss_tree(date,date,text[],text[],text[],text[]),
                       health_ping() CASCADE;

-- Minimal health function to confirm the link from Lovable
CREATE OR REPLACE FUNCTION health_ping()
RETURNS TABLE(db text, now_utc timestamptz)
LANGUAGE SQL STABLE AS $$
  SELECT current_database(), now();
$$;