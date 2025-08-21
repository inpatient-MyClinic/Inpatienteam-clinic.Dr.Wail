-- Create a function to analyze Excel data directly from raw uploads
CREATE OR REPLACE FUNCTION public.analyze_excel_data_by_month(
  target_month integer,
  target_year integer
)
RETURNS TABLE(
  total_cases bigint,
  status_breakdown jsonb,
  branch_breakdown jsonb,
  raw_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result_total bigint;
  result_status jsonb;
  result_branch jsonb;
  result_raw jsonb;
BEGIN
  -- Direct analysis from excel_rows_raw table
  -- Column AP = Date, Column AI = Status
  
  WITH filtered_excel AS (
    SELECT 
      err."Status" as status_value,
      err."Branch" as branch_value,
      err."Date" as date_value,
      err."Hospital Name" as hospital_name,
      err."Specialty" as specialty,
      err."Paid Amount" as paid_amount,
      -- Parse Excel date (handle both serial numbers and text dates)
      CASE 
        -- Excel serial date conversion (if it's a number > 25000)
        WHEN err."Date" ~ '^[0-9]+$' AND err."Date"::integer > 25000 THEN
          '1900-01-01'::date + (err."Date"::integer - 2)::integer
        -- Try to parse as date string
        WHEN err."Date" ~ '^\d{4}-\d{2}-\d{2}$' THEN 
          err."Date"::date
        WHEN err."Date" ~ '^\d{1,2}/\d{1,2}/\d{4}$' THEN 
          to_date(err."Date", 'MM/DD/YYYY')
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
      AND EXTRACT(MONTH FROM parsed_date) = target_month
      AND EXTRACT(YEAR FROM parsed_date) = target_year
  )
  
  -- Get total count
  SELECT COUNT(*) INTO result_total FROM month_filtered;
  
  -- Get status breakdown (Column AI)
  SELECT jsonb_object_agg(
    COALESCE(status_value, 'Unknown'),
    count_value
  ) INTO result_status
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
  ) INTO result_branch
  FROM (
    SELECT 
      branch_value,
      COUNT(*) as count_value
    FROM month_filtered
    GROUP BY branch_value
    ORDER BY COUNT(*) DESC
  ) branch_counts;
  
  -- Get sample raw data for debugging
  SELECT jsonb_agg(
    jsonb_build_object(
      'status', status_value,
      'branch', branch_value,
      'date_raw', date_value,
      'date_parsed', parsed_date,
      'hospital', hospital_name,
      'specialty', specialty
    )
  ) INTO result_raw
  FROM (
    SELECT * FROM month_filtered LIMIT 10
  ) sample_data;
  
  -- Return results
  RETURN QUERY SELECT 
    result_total,
    COALESCE(result_status, '{}'::jsonb),
    COALESCE(result_branch, '{}'::jsonb),
    COALESCE(result_raw, '[]'::jsonb);
    
END;
$$;