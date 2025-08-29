-- Fix the analyze_excel_cases_monthly function completely
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

  -- Count total cases for the month using correct date parsing
  SELECT COUNT(*) INTO t
  FROM excel_rows_raw err
  WHERE err.raw_data->>'Status of operation' IS NOT NULL 
    AND err.raw_data->>'Date of Request:' IS NOT NULL
    AND err.raw_data->>'Date of Request:' != ''
    AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
    AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
    AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year;
  
  -- Get status breakdown with proper normalization
  WITH status_data AS (
    SELECT 
      err.raw_data->>'Status of operation' as status_value,
      COUNT(*) as count_value
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
      AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year
    GROUP BY err.raw_data->>'Status of operation'
    ORDER BY COUNT(*) DESC
  )
  SELECT jsonb_object_agg(
    COALESCE(norm_status(status_value), 'Unknown'),
    count_value
  ) INTO sb FROM status_data;
  
  -- Get branch breakdown with normalization
  WITH branch_data AS (
    SELECT 
      err.raw_data->>'My Clinic Branch' as branch_value,
      COUNT(*) as count_value
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
      AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year
    GROUP BY err.raw_data->>'My Clinic Branch'
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
  
  -- Get hospital breakdown  
  WITH hospital_data AS (
    SELECT 
      err.raw_data->>'Referred Hospital' as hospital_name,
      COUNT(*) as count_value
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
      AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year
    GROUP BY err.raw_data->>'Referred Hospital'
    ORDER BY COUNT(*) DESC
  )
  SELECT jsonb_object_agg(
    COALESCE(norm_text(hospital_name), 'Unknown'),
    count_value
  ) INTO hb FROM hospital_data;
  
  -- Get specialty breakdown
  WITH specialty_data AS (
    SELECT 
      err.raw_data->>'Specialty' as specialty,
      COUNT(*) as count_value
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
      AND parse_excel_date(err.raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(err.raw_data->>'Date of Request:')) = p_year
    GROUP BY err.raw_data->>'Specialty'
    ORDER BY COUNT(*) DESC
  )
  SELECT jsonb_object_agg(
    COALESCE(norm_text(specialty), 'Unknown'),
    count_value
  ) INTO spb FROM specialty_data;

  -- Debug logging
  RAISE NOTICE 'Excel Monthly Analysis for %/% - Total results: % (Raw rows: %)', 
    p_month, p_year, COALESCE(t, 0), (SELECT COUNT(*) FROM excel_rows_raw);

  RETURN QUERY SELECT 
    COALESCE(t, 0),
    COALESCE(sb, '{}'::jsonb),
    COALESCE(bb, '{}'::jsonb), 
    COALESCE(hb, '{}'::jsonb),
    COALESCE(spb, '{}'::jsonb);
END $function$;