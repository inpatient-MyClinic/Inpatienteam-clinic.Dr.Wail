-- Fix the analyze_excel_cases_monthly function for better error handling and debugging
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
  total_rows bigint := 0;
  parsed_rows bigint := 0;
BEGIN
  -- Debug: Check total rows in excel_cases_clean
  SELECT count(*) INTO total_rows FROM public.excel_cases_clean;
  
  -- If excel_cases_clean is empty, try excel_rows_raw with better date parsing
  IF total_rows = 0 THEN
    WITH parsed_excel AS (
      SELECT 
        err."Status" as status_value,
        err."Branch" as branch_value,
        err."Hospital Name" as hospital_name,
        err."Specialty" as specialty,
        -- Enhanced date parsing for Excel serial numbers and various formats
        CASE 
          -- Excel serial date conversion (common range 40000-50000 for 2009-2037)
          WHEN err."Date" ~ '^[0-9]+$' AND err."Date"::integer BETWEEN 25000 AND 60000 THEN
            ('1900-01-01'::date + (err."Date"::integer - 2)::integer)
          -- ISO format YYYY-MM-DD
          WHEN err."Date" ~ '^\d{4}-\d{2}-\d{2}$' THEN 
            err."Date"::date
          -- US format MM/DD/YYYY
          WHEN err."Date" ~ '^\d{1,2}/\d{1,2}/\d{4}$' THEN 
            to_date(err."Date", 'MM/DD/YYYY')
          -- European format DD/MM/YYYY
          WHEN err."Date" ~ '^\d{1,2}/\d{1,2}/\d{4}$' AND 
               split_part(err."Date", '/', 1)::int <= 12 AND 
               split_part(err."Date", '/', 2)::int <= 31 THEN
            to_date(err."Date", 'DD/MM/YYYY')
          -- Short year MM/DD/YY
          WHEN err."Date" ~ '^\d{1,2}/\d{1,2}/\d{2}$' THEN 
            to_date(err."Date", 'MM/DD/YY')
          ELSE NULL
        END as parsed_date
      FROM excel_rows_raw err
      WHERE err."Date" IS NOT NULL 
        AND err."Status" IS NOT NULL
    ),
    month_filtered AS (
      SELECT *
      FROM parsed_excel
      WHERE parsed_date IS NOT NULL
        AND EXTRACT(MONTH FROM parsed_date) = p_month
        AND EXTRACT(YEAR FROM parsed_date) = p_year
    )
    
    -- Get aggregated data from excel_rows_raw
    SELECT 
      count(*),
      COALESCE(jsonb_object_agg(COALESCE(status_value, 'Unknown'), status_count), '{}'::jsonb),
      COALESCE(jsonb_object_agg(COALESCE(branch_value, 'Unknown'), branch_count), '{}'::jsonb),
      COALESCE(jsonb_object_agg(COALESCE(hospital_name, 'Unknown'), hospital_count), '{}'::jsonb),
      COALESCE(jsonb_object_agg(COALESCE(specialty, 'Unknown'), specialty_count), '{}'::jsonb)
    INTO t, sb, bb, hb, spb
    FROM (
      SELECT 
        status_value, count(*) as status_count,
        branch_value, count(*) as branch_count,
        hospital_name, count(*) as hospital_count,
        specialty, count(*) as specialty_count
      FROM month_filtered
      GROUP BY status_value, branch_value, hospital_name, specialty
    ) aggregated;
    
  ELSE
    -- Use excel_cases_clean if available
    WITH m AS (
      SELECT * 
      FROM public.excel_cases_clean
      WHERE case_date IS NOT NULL
        AND extract(year FROM case_date) = p_year
        AND extract(month FROM case_date) = p_month
    )
    SELECT 
      count(*),
      COALESCE(jsonb_object_agg(status, cnt), '{}'::jsonb),
      COALESCE(jsonb_object_agg(coalesce(branch,'Unknown'), cnt2), '{}'::jsonb),
      COALESCE(jsonb_object_agg(coalesce(hospital,'Unknown'), cnt3), '{}'::jsonb),
      COALESCE(jsonb_object_agg(coalesce(specialty,'Unknown'), cnt4), '{}'::jsonb)
    INTO t, sb, bb, hb, spb
    FROM (
      SELECT 
        status, count(*) cnt,
        branch, count(*) cnt2,
        hospital, count(*) cnt3,
        specialty, count(*) cnt4
      FROM m 
      GROUP BY status, branch, hospital, specialty
    ) aggregated;
  END IF;

  -- Log debug information
  RAISE NOTICE 'Excel Monthly Analysis for %/% - Total rows in excel_cases_clean: %, Filtered results: %', 
    p_month, p_year, total_rows, COALESCE(t, 0);

  RETURN QUERY SELECT 
    COALESCE(t, 0),
    COALESCE(sb, '{}'::jsonb),
    COALESCE(bb, '{}'::jsonb),
    COALESCE(hb, '{}'::jsonb),
    COALESCE(spb, '{}'::jsonb);
END $function$