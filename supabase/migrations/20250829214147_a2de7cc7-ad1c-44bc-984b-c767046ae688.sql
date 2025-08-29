-- Fix the analyze_excel_cases_monthly function to use correct Excel columns from raw_data
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

  -- Use correct raw_data fields for Excel analysis
  WITH filtered_excel AS (
    SELECT 
      err.raw_data->>'Status of operation' as status_value,
      err.raw_data->>'My Clinic Branch' as branch_value,
      err.raw_data->>'Date of Request:' as date_value,
      err.raw_data->>'Referred Hospital' as hospital_name,
      err.raw_data->>'Specialty' as specialty,
      err.raw_data->>'Paid Amount' as paid_amount,
      -- Parse Excel date using the proper column
      parse_excel_date(err.raw_data->>'Date of Request:') as parsed_date
    FROM excel_rows_raw err
    WHERE err.raw_data->>'Status of operation' IS NOT NULL 
      AND err.raw_data->>'Date of Request:' IS NOT NULL
      AND err.raw_data->>'Date of Request:' != ''
  ),
  month_filtered AS (
    SELECT *
    FROM filtered_excel
    WHERE parsed_date IS NOT NULL
      AND EXTRACT(MONTH FROM parsed_date) = p_month
      AND EXTRACT(YEAR FROM parsed_date) = p_year
  )
  
  -- Get total count
  SELECT COUNT(*) INTO t FROM month_filtered;
  
  -- Get status breakdown with proper normalization
  SELECT jsonb_object_agg(
    COALESCE(norm_status(status_value), 'Unknown'),
    count_value
  ) INTO sb
  FROM (
    SELECT 
      status_value,
      COUNT(*) as count_value
    FROM month_filtered
    GROUP BY status_value
    ORDER BY COUNT(*) DESC
  ) status_counts;
  
  -- Get branch breakdown with normalization
  SELECT jsonb_object_agg(
    CASE 
      WHEN branch_value ILIKE '%MCJ%1%' OR branch_value ILIKE '%MY CLINIC JEDDAH 1%' THEN 'MCJ1'
      WHEN branch_value ILIKE '%MCJ%2%' OR branch_value ILIKE '%MY CLINIC JEDDAH 2%' THEN 'MCJ2'
      ELSE COALESCE(norm_upper(branch_value), 'Unknown')
    END,
    count_value
  ) INTO bb
  FROM (
    SELECT 
      branch_value,
      COUNT(*) as count_value
    FROM month_filtered
    GROUP BY branch_value
    ORDER BY COUNT(*) DESC
  ) branch_counts;
  
  -- Get hospital breakdown  
  SELECT jsonb_object_agg(
    COALESCE(norm_text(hospital_name), 'Unknown'),
    count_value
  ) INTO hb
  FROM (
    SELECT 
      hospital_name,
      COUNT(*) as count_value
    FROM month_filtered
    GROUP BY hospital_name
    ORDER BY COUNT(*) DESC
  ) hospital_counts;
  
  -- Get specialty breakdown
  SELECT jsonb_object_agg(
    COALESCE(norm_text(specialty), 'Unknown'),
    count_value
  ) INTO spb
  FROM (
    SELECT 
      specialty,
      COUNT(*) as count_value
    FROM month_filtered
    GROUP BY specialty
    ORDER BY COUNT(*) DESC
  ) specialty_counts;

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

-- Create a validation function to debug data discrepancies
CREATE OR REPLACE FUNCTION public.debug_excel_data_for_month(p_year integer, p_month integer)
 RETURNS TABLE(
   raw_data_sample jsonb,
   date_parsing_stats jsonb,
   status_mapping jsonb,
   total_by_method jsonb
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  sample_data jsonb;
  date_stats jsonb;
  status_stats jsonb;
  totals jsonb;
BEGIN
  -- Get sample raw data
  SELECT jsonb_agg(
    jsonb_build_object(
      'date_of_request', raw_data->>'Date of Request:',
      'status_of_operation', raw_data->>'Status of operation',
      'branch', raw_data->>'My Clinic Branch',
      'parsed_date', parse_excel_date(raw_data->>'Date of Request:'),
      'row_number', row_number
    )
  ) INTO sample_data
  FROM excel_rows_raw 
  WHERE raw_data->>'Date of Request:' IS NOT NULL
  LIMIT 10;
  
  -- Date parsing statistics
  SELECT jsonb_build_object(
    'total_rows', COUNT(*),
    'has_date_of_request', COUNT(*) FILTER (WHERE raw_data->>'Date of Request:' IS NOT NULL),
    'parseable_dates', COUNT(*) FILTER (WHERE parse_excel_date(raw_data->>'Date of Request:') IS NOT NULL),
    'target_month_year', COUNT(*) FILTER (WHERE 
      parse_excel_date(raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(raw_data->>'Date of Request:')) = p_year
    )
  ) INTO date_stats
  FROM excel_rows_raw;
  
  -- Status mapping analysis
  SELECT jsonb_object_agg(
    COALESCE(raw_data->>'Status of operation', 'NULL'),
    COUNT(*)
  ) INTO status_stats
  FROM excel_rows_raw
  WHERE parse_excel_date(raw_data->>'Date of Request:') IS NOT NULL
    AND EXTRACT(MONTH FROM parse_excel_date(raw_data->>'Date of Request:')) = p_month
    AND EXTRACT(YEAR FROM parse_excel_date(raw_data->>'Date of Request:')) = p_year;
  
  -- Compare different counting methods
  SELECT jsonb_build_object(
    'raw_data_method', (
      SELECT COUNT(*) FROM excel_rows_raw
      WHERE parse_excel_date(raw_data->>'Date of Request:') IS NOT NULL
        AND EXTRACT(MONTH FROM parse_excel_date(raw_data->>'Date of Request:')) = p_month
        AND EXTRACT(YEAR FROM parse_excel_date(raw_data->>'Date of Request:')) = p_year
    ),
    'old_column_method', (
      SELECT COUNT(*) FROM excel_rows_raw
      WHERE parse_excel_date("Date") IS NOT NULL
        AND EXTRACT(MONTH FROM parse_excel_date("Date")) = p_month
        AND EXTRACT(YEAR FROM parse_excel_date("Date")) = p_year
    )
  ) INTO totals;
  
  RETURN QUERY SELECT sample_data, date_stats, status_stats, totals;
END $function$;