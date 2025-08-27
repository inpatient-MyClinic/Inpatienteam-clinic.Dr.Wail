-- Fix the analyze_excel_cases_monthly function to work with existing data
CREATE OR REPLACE FUNCTION public.analyze_excel_cases_monthly(p_year integer, p_month integer)
RETURNS TABLE(total_cases bigint, status_breakdown jsonb, branch_breakdown jsonb, hospital_breakdown jsonb, specialty_breakdown jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    -- Return empty results if no Excel data uploaded
    RETURN QUERY SELECT 
      0::bigint,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb;
    RETURN;
  END IF;

  -- Try excel_rows_raw if available
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'excel_rows_raw') THEN
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
    ),
    aggregated AS (
      SELECT 
        count(*) as total_count,
        jsonb_object_agg(COALESCE(status_value, 'Unknown'), status_count) as status_agg,
        jsonb_object_agg(COALESCE(branch_value, 'Unknown'), branch_count) as branch_agg,
        jsonb_object_agg(COALESCE(hospital_name, 'Unknown'), hospital_count) as hospital_agg,
        jsonb_object_agg(COALESCE(specialty, 'Unknown'), specialty_count) as specialty_agg
      FROM (
        SELECT 
          status_value,
          count(*) as status_count,
          branch_value,
          count(*) as branch_count,
          hospital_name,
          count(*) as hospital_count,
          specialty,
          count(*) as specialty_count
        FROM month_filtered
        GROUP BY status_value, branch_value, hospital_name, specialty
      ) counts
    )
    SELECT total_count, status_agg, branch_agg, hospital_agg, specialty_agg
    INTO t, sb, bb, hb, spb
    FROM aggregated;
  ELSE
    -- Fallback: return empty results with notice
    RAISE NOTICE 'No excel_rows_raw table found - Excel data not properly imported';
    t := 0;
    sb := '{}'::jsonb;
    bb := '{}'::jsonb;
    hb := '{}'::jsonb;
    spb := '{}'::jsonb;
  END IF;

  -- Log debug information
  RAISE NOTICE 'Excel Monthly Analysis for %/% - Total results: %', p_month, p_year, COALESCE(t, 0);

  RETURN QUERY SELECT 
    COALESCE(t, 0),
    COALESCE(sb, '{}'::jsonb),
    COALESCE(bb, '{}'::jsonb),
    COALESCE(hb, '{}'::jsonb),
    COALESCE(spb, '{}'::jsonb);
END $$;