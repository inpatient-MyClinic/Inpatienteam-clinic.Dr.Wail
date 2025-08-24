-- Robust Excel-date parser
CREATE OR REPLACE FUNCTION public.parse_excel_date(raw text)
RETURNS date LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE 
  d date; 
  n numeric;
BEGIN
  IF raw IS NULL OR length(trim(raw)) = 0 THEN 
    RETURN NULL; 
  END IF;
  
  -- Excel serial (e.g., 45839)
  BEGIN 
    n := raw::numeric; 
    IF n > 25000 THEN 
      RETURN date '1900-01-01' + (n - 2)::int; -- 1900 leap bug
    END IF; 
  EXCEPTION WHEN others THEN 
    -- not numeric
  END;
  
  -- Try various date formats
  BEGIN 
    d := raw::date; 
    RETURN d; 
  EXCEPTION WHEN others THEN 
  END;
  
  BEGIN 
    RETURN to_date(raw, 'MM/DD/YYYY'); 
  EXCEPTION WHEN others THEN 
  END;
  
  BEGIN 
    RETURN to_date(raw, 'DD/MM/YYYY'); 
  EXCEPTION WHEN others THEN 
  END;
  
  BEGIN 
    RETURN to_date(raw, 'MM/DD/YY'); 
  EXCEPTION WHEN others THEN 
  END;
  
  BEGIN 
    RETURN to_date(raw, 'DD/MM/YY'); 
  EXCEPTION WHEN others THEN 
  END;
  
  RETURN NULL;
END $$;

-- Normalized view over uploaded Excel rows (using actual column names)
CREATE OR REPLACE VIEW public.excel_cases_clean AS
SELECT
  upload_id,
  row_no,
  "Status"::text AS status,
  "Branch"::text AS branch,
  parse_excel_date("Date") AS case_date,
  "Hospital Name"::text AS hospital,
  "Specialty"::text AS specialty,
  "Paid Amount"::text AS paid_amount_text
FROM excel_rows_raw
WHERE "Status" IS NOT NULL
  AND "Date" IS NOT NULL;

-- Excel-only monthly analysis function
CREATE OR REPLACE FUNCTION public.analyze_excel_cases_monthly(p_year int, p_month int)
RETURNS TABLE(
  total_cases bigint,
  status_breakdown jsonb,
  branch_breakdown jsonb,
  hospital_breakdown jsonb,
  specialty_breakdown jsonb
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
  t bigint; 
  sb jsonb; 
  bb jsonb; 
  hb jsonb; 
  spb jsonb;
BEGIN
  WITH m AS (
    SELECT * 
    FROM public.excel_cases_clean
    WHERE case_date IS NOT NULL
      AND extract(year FROM case_date) = p_year
      AND extract(month FROM case_date) = p_month
  )
  SELECT count(*) INTO t FROM m;

  SELECT jsonb_object_agg(status, cnt) INTO sb 
  FROM (SELECT status, count(*) cnt FROM m GROUP BY status ORDER BY count(*) DESC) s;

  SELECT jsonb_object_agg(coalesce(branch,'Unknown'), cnt) INTO bb 
  FROM (SELECT branch, count(*) cnt FROM m GROUP BY branch ORDER BY count(*) DESC) b;

  SELECT jsonb_object_agg(coalesce(hospital,'Unknown'), cnt) INTO hb 
  FROM (SELECT hospital, count(*) cnt FROM m GROUP BY hospital ORDER BY count(*) DESC) h;

  SELECT jsonb_object_agg(coalesce(specialty,'Unknown'), cnt) INTO spb 
  FROM (SELECT specialty, count(*) cnt FROM m GROUP BY specialty ORDER BY count(*) DESC) sp;

  RETURN QUERY SELECT 
    coalesce(t,0),
    coalesce(sb, '{}'::jsonb),
    coalesce(bb, '{}'::jsonb),
    coalesce(hb, '{}'::jsonb),
    coalesce(spb,'{}'::jsonb);
END $$;