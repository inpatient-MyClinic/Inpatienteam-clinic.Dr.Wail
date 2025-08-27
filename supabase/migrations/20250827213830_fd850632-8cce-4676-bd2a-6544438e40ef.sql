-- Fix date parsing in analyze_excel_cases_monthly function
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

  -- Enhanced Excel date parsing and filtering
  WITH filtered_excel AS (
    SELECT 
      err."Status" as status_value,
      err."Branch" as branch_value,
      err."Date" as date_value,
      err."Hospital Name" as hospital_name,
      err."Specialty" as specialty,
      err."Paid Amount" as paid_amount,
      -- Enhanced Excel date parsing
      CASE 
        -- Excel serial date conversion for common range (handles decimals too)
        WHEN err."Date" ~ '^[0-9]+(\.[0-9]+)?$' AND err."Date"::numeric BETWEEN 25000 AND 60000 THEN
          date '1900-01-01' + (floor(err."Date"::numeric) - 2)::integer
        -- ISO format YYYY-MM-DD
        WHEN err."Date" ~ '^\d{4}-\d{2}-\d{2}$' THEN 
          err."Date"::date
        -- Try MM/DD/YYYY format first
        WHEN err."Date" ~ '^\d{1,2}/\d{1,2}/\d{4}$' THEN 
          COALESCE(
            to_date(err."Date", 'MM/DD/YYYY'),
            to_date(err."Date", 'DD/MM/YYYY')
          )
        -- Try MM/DD/YY format
        WHEN err."Date" ~ '^\d{1,2}/\d{1,2}/\d{2}$' THEN 
          to_date(err."Date", 'MM/DD/YY')
        ELSE NULL
      END as parsed_date
    FROM excel_rows_raw err
    WHERE err."Status" IS NOT NULL 
      AND err."Date" IS NOT NULL
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
  
  -- Get status breakdown
  SELECT jsonb_object_agg(
    COALESCE(status_value, 'Unknown'),
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
  
  -- Get branch breakdown
  SELECT jsonb_object_agg(
    COALESCE(branch_value, 'Unknown'),
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
    COALESCE(hospital_name, 'Unknown'),
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
    COALESCE(specialty, 'Unknown'),
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