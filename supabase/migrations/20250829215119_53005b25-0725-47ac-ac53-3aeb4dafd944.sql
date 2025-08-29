-- Fix the debug_excel_data_for_month function to avoid nested aggregate functions
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
  total_rows_count bigint;
  has_date_count bigint;
  parseable_dates_count bigint;
  target_month_count bigint;
  raw_method_count bigint;
  old_method_count bigint;
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
  
  -- Get date parsing statistics using separate queries to avoid nested aggregates
  SELECT COUNT(*) INTO total_rows_count FROM excel_rows_raw;
  
  SELECT COUNT(*) INTO has_date_count 
  FROM excel_rows_raw 
  WHERE raw_data->>'Date of Request:' IS NOT NULL;
  
  SELECT COUNT(*) INTO parseable_dates_count 
  FROM excel_rows_raw 
  WHERE parse_excel_date(raw_data->>'Date of Request:') IS NOT NULL;
  
  SELECT COUNT(*) INTO target_month_count 
  FROM excel_rows_raw 
  WHERE parse_excel_date(raw_data->>'Date of Request:') IS NOT NULL
    AND EXTRACT(MONTH FROM parse_excel_date(raw_data->>'Date of Request:')) = p_month
    AND EXTRACT(YEAR FROM parse_excel_date(raw_data->>'Date of Request:')) = p_year;
  
  -- Build date stats object
  SELECT jsonb_build_object(
    'total_rows', total_rows_count,
    'has_date_of_request', has_date_count,
    'parseable_dates', parseable_dates_count,
    'target_month_year', target_month_count
  ) INTO date_stats;
  
  -- Status mapping analysis - use subquery to avoid nested aggregates
  WITH status_counts AS (
    SELECT 
      COALESCE(raw_data->>'Status of operation', 'NULL') as status_val,
      COUNT(*) as count_val
    FROM excel_rows_raw
    WHERE parse_excel_date(raw_data->>'Date of Request:') IS NOT NULL
      AND EXTRACT(MONTH FROM parse_excel_date(raw_data->>'Date of Request:')) = p_month
      AND EXTRACT(YEAR FROM parse_excel_date(raw_data->>'Date of Request:')) = p_year
    GROUP BY raw_data->>'Status of operation'
  )
  SELECT jsonb_object_agg(status_val, count_val) INTO status_stats
  FROM status_counts;
  
  -- Compare different counting methods using separate queries
  SELECT COUNT(*) INTO raw_method_count 
  FROM excel_rows_raw
  WHERE parse_excel_date(raw_data->>'Date of Request:') IS NOT NULL
    AND EXTRACT(MONTH FROM parse_excel_date(raw_data->>'Date of Request:')) = p_month
    AND EXTRACT(YEAR FROM parse_excel_date(raw_data->>'Date of Request:')) = p_year;
    
  SELECT COUNT(*) INTO old_method_count 
  FROM excel_rows_raw
  WHERE parse_excel_date("Date") IS NOT NULL
    AND EXTRACT(MONTH FROM parse_excel_date("Date")) = p_month
    AND EXTRACT(YEAR FROM parse_excel_date("Date")) = p_year;
  
  SELECT jsonb_build_object(
    'raw_data_method', raw_method_count,
    'old_column_method', old_method_count
  ) INTO totals;
  
  RETURN QUERY SELECT sample_data, date_stats, status_stats, totals;
END $function$;