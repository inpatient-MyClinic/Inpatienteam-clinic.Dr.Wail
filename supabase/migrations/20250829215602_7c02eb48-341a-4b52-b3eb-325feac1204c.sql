-- Fix the analytics function to remove duplicates and match manual count
CREATE OR REPLACE FUNCTION public.analyze_excel_cases_monthly(p_year integer, p_month integer)
 RETURNS TABLE(total_cases bigint, status_breakdown jsonb, branch_breakdown jsonb, hospital_breakdown jsonb, specialty_breakdown jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE 
  t bigint := 0; 
  sb jsonb := '{}'::jsonb; 
  bb jsonb := '{}'::jsonb; 
  hb jsonb := '{}'::jsonb; 
  spb jsonb := '{}'::jsonb;
  has_excel_data boolean := false;
BEGIN
  -- Check if we have any uploaded Excel data
  SELECT count(*) > 0 INTO has_excel_data FROM excel_upload_batches;
  
  IF NOT has_excel_data THEN
    RAISE NOTICE 'No Excel upload batches found';
    RETURN QUERY SELECT 
      0::bigint,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb;
    RETURN;
  END IF;

  -- Count total cases for the month, removing duplicates based on key fields
  WITH deduplicated_data AS (
    SELECT DISTINCT ON (
      raw_data->>'Patient''s Name:', 
      raw_data->>'Date of Request:', 
      raw_data->>'Status of operation',
      raw_data->>'Referred Hospital'
    )
      raw_data->>'Status of operation' as status_value,
      raw_data->>'My Clinic Branch' as branch_value,
      raw_data->>'Referred Hospital' as hospital_name,
      raw_data->>'Specialty' as specialty
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
      AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year
  )
  SELECT COUNT(*) INTO t FROM deduplicated_data;
  
  -- Get status breakdown with deduplication
  WITH deduplicated_data AS (
    SELECT DISTINCT ON (
      raw_data->>'Patient''s Name:', 
      raw_data->>'Date of Request:', 
      raw_data->>'Status of operation',
      raw_data->>'Referred Hospital'
    )
      raw_data->>'Status of operation' as status_value
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
      AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year
  ),
  status_data AS (
    SELECT 
      status_value,
      COUNT(*) as count_value
    FROM deduplicated_data
    GROUP BY status_value
    ORDER BY COUNT(*) DESC
  )
  SELECT jsonb_object_agg(
    COALESCE(norm_status(status_value), 'Unknown'),
    count_value
  ) INTO sb FROM status_data;
  
  -- Get branch breakdown with deduplication
  WITH deduplicated_data AS (
    SELECT DISTINCT ON (
      raw_data->>'Patient''s Name:', 
      raw_data->>'Date of Request:', 
      raw_data->>'Status of operation',
      raw_data->>'Referred Hospital'
    )
      raw_data->>'My Clinic Branch' as branch_value
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
      AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year
  ),
  branch_data AS (
    SELECT 
      branch_value,
      COUNT(*) as count_value
    FROM deduplicated_data
    GROUP BY branch_value
    ORDER BY COUNT(*) DESC
  )
  SELECT jsonb_object_agg(
    CASE 
      WHEN branch_value ILIKE '%MCJ%1%' OR branch_value ILIKE '%MY CLINIC JEDDAH 1%' THEN 'MCJ1'
      WHEN branch_value ILIKE '%MCJ%2%' OR branch_value ILIKE '%MY CLINIC JEDDAH 2%' THEN 'MCJ2'
      ELSE COALESCE(norm_upper(branch_value), 'Unknown')
    END,
    count_value
  ) INTO bb FROM branch_data;
  
  -- Get hospital breakdown with deduplication
  WITH deduplicated_data AS (
    SELECT DISTINCT ON (
      raw_data->>'Patient''s Name:', 
      raw_data->>'Date of Request:', 
      raw_data->>'Status of operation',
      raw_data->>'Referred Hospital'
    )
      raw_data->>'Referred Hospital' as hospital_name
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
      AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year
  ),
  hospital_data AS (
    SELECT 
      hospital_name,
      COUNT(*) as count_value
    FROM deduplicated_data
    GROUP BY hospital_name
    ORDER BY COUNT(*) DESC
  )
  SELECT jsonb_object_agg(
    COALESCE(norm_text(hospital_name), 'Unknown'),
    count_value
  ) INTO hb FROM hospital_data;
  
  -- Get specialty breakdown with deduplication
  WITH deduplicated_data AS (
    SELECT DISTINCT ON (
      raw_data->>'Patient''s Name:', 
      raw_data->>'Date of Request:', 
      raw_data->>'Status of operation',
      raw_data->>'Referred Hospital'
    )
      raw_data->>'Specialty' as specialty
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
      AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year
  ),
  specialty_data AS (
    SELECT 
      specialty,
      COUNT(*) as count_value
    FROM deduplicated_data
    GROUP BY specialty
    ORDER BY COUNT(*) DESC
  )
  SELECT jsonb_object_agg(
    COALESCE(norm_text(specialty), 'Unknown'),
    count_value
  ) INTO spb FROM specialty_data;

  -- Debug logging
  RAISE NOTICE 'Excel Monthly Analysis for %/% - Total results: % (After deduplication)', 
    p_month, p_year, COALESCE(t, 0);

  RETURN QUERY SELECT 
    COALESCE(t, 0),
    COALESCE(sb, '{}'::jsonb),
    COALESCE(bb, '{}'::jsonb), 
    COALESCE(hb, '{}'::jsonb),
    COALESCE(spb, '{}'::jsonb);
END $function$;