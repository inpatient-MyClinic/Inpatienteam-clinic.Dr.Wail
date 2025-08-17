-- Fix the monthly analytics functions to use correct enum values

-- Drop and recreate functions with correct status values
DROP FUNCTION IF EXISTS public.get_monthly_branch_stats(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_monthly_hospital_stats(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_monthly_top_specialties(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_monthly_conversion_trends(integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_monthly_dashboard_data(integer, integer) CASCADE;

-- Recreate get_monthly_branch_stats with correct enum values
CREATE OR REPLACE FUNCTION public.get_monthly_branch_stats(target_month integer, target_year integer)
RETURNS TABLE(branch_code text, total_cases bigint, done_cases bigint, pending_cases bigint, conversion_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access analytics data';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(mr.branch_code, 'Unknown') as branch_code,
    COUNT(*) as total_cases,
    COUNT(*) FILTER (WHERE mr.status = 'completed') as done_cases,
    COUNT(*) FILTER (WHERE mr.status IN ('pending', 'in-progress')) as pending_cases,
    ROUND(
      (COUNT(*) FILTER (WHERE mr.status = 'completed')::numeric / 
       NULLIF(COUNT(*), 0)::numeric) * 100, 2
    ) as conversion_rate
  FROM medical_requests mr
  WHERE EXTRACT(MONTH FROM mr.request_date) = target_month
    AND EXTRACT(YEAR FROM mr.request_date) = target_year
  GROUP BY mr.branch_code
  ORDER BY total_cases DESC;
END;
$function$;

-- Recreate get_monthly_hospital_stats with correct enum values
CREATE OR REPLACE FUNCTION public.get_monthly_hospital_stats(target_month integer, target_year integer)
RETURNS TABLE(hospital_name text, hospital_code text, total_cases bigint, done_cases bigint, pending_cases bigint, specialty_breakdown jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access analytics data';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(mr.hospital_name, 'Unknown Hospital') as hospital_name,
    COALESCE(mr.hospital_code, 'UNK') as hospital_code,
    COUNT(*) as total_cases,
    COUNT(*) FILTER (WHERE mr.status = 'completed') as done_cases,
    COUNT(*) FILTER (WHERE mr.status IN ('pending', 'in-progress')) as pending_cases,
    jsonb_object_agg(
      COALESCE(mr.specialty, 'General'), 
      COUNT(*) FILTER (WHERE mr.specialty IS NOT NULL)
    ) as specialty_breakdown
  FROM medical_requests mr
  WHERE EXTRACT(MONTH FROM mr.request_date) = target_month
    AND EXTRACT(YEAR FROM mr.request_date) = target_year
  GROUP BY mr.hospital_name, mr.hospital_code
  ORDER BY total_cases DESC;
END;
$function$;

-- Recreate get_monthly_top_specialties with correct enum values
CREATE OR REPLACE FUNCTION public.get_monthly_top_specialties(target_month integer, target_year integer)
RETURNS TABLE(specialty text, case_count bigint, done_count bigint, success_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access analytics data';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(mr.specialty, 'General') as specialty,
    COUNT(*) as case_count,
    COUNT(*) FILTER (WHERE mr.status = 'completed') as done_count,
    ROUND(
      (COUNT(*) FILTER (WHERE mr.status = 'completed')::numeric / 
       NULLIF(COUNT(*), 0)::numeric) * 100, 2
    ) as success_rate
  FROM medical_requests mr
  WHERE EXTRACT(MONTH FROM mr.request_date) = target_month
    AND EXTRACT(YEAR FROM mr.request_date) = target_year
  GROUP BY mr.specialty
  ORDER BY case_count DESC
  LIMIT 10;
END;
$function$;

-- Recreate get_monthly_conversion_trends with correct enum values
CREATE OR REPLACE FUNCTION public.get_monthly_conversion_trends(target_year integer)
RETURNS TABLE(month_num integer, month_name text, total_cases bigint, completed_cases bigint, conversion_rate numeric, revenue_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access analytics data';
  END IF;

  RETURN QUERY
  SELECT 
    EXTRACT(MONTH FROM mr.request_date)::int as month_num,
    TO_CHAR(mr.request_date, 'Mon') as month_name,
    COUNT(*) as total_cases,
    COUNT(*) FILTER (WHERE mr.status = 'completed') as completed_cases,
    ROUND(
      (COUNT(*) FILTER (WHERE mr.status = 'completed')::numeric / 
       NULLIF(COUNT(*), 0)::numeric) * 100, 2
    ) as conversion_rate,
    COALESCE(SUM(mr.paid_amount), 0) as revenue_amount
  FROM medical_requests mr
  WHERE EXTRACT(YEAR FROM mr.request_date) = target_year
  GROUP BY EXTRACT(MONTH FROM mr.request_date), TO_CHAR(mr.request_date, 'Mon')
  ORDER BY month_num;
END;
$function$;

-- Recreate get_monthly_dashboard_data with correct enum values
CREATE OR REPLACE FUNCTION public.get_monthly_dashboard_data(target_month integer, target_year integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  branch_stats jsonb;
  hospital_stats jsonb;
  specialty_stats jsonb;
  status_breakdown jsonb;
  monthly_summary jsonb;
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access analytics data';
  END IF;

  -- Get branch statistics
  SELECT jsonb_agg(
    jsonb_build_object(
      'branch_code', branch_code,
      'total_cases', total_cases,
      'done_cases', done_cases,
      'pending_cases', pending_cases,
      'conversion_rate', conversion_rate
    )
  ) INTO branch_stats
  FROM get_monthly_branch_stats(target_month, target_year);

  -- Get hospital statistics
  SELECT jsonb_agg(
    jsonb_build_object(
      'hospital_name', hospital_name,
      'hospital_code', hospital_code,
      'total_cases', total_cases,
      'done_cases', done_cases,
      'pending_cases', pending_cases,
      'specialty_breakdown', specialty_breakdown
    )
  ) INTO hospital_stats
  FROM get_monthly_hospital_stats(target_month, target_year);

  -- Get top specialties
  SELECT jsonb_agg(
    jsonb_build_object(
      'specialty', specialty,
      'case_count', case_count,
      'done_count', done_count,
      'success_rate', success_rate
    )
  ) INTO specialty_stats
  FROM get_monthly_top_specialties(target_month, target_year);

  -- Get status breakdown directly here to avoid recursive calls
  SELECT jsonb_object_agg(
    COALESCE(status::text, 'unknown'),
    count
  ) INTO status_breakdown
  FROM (
    SELECT 
      mr.status,
      COUNT(*) as count
    FROM medical_requests mr
    WHERE EXTRACT(MONTH FROM mr.request_date) = target_month
      AND EXTRACT(YEAR FROM mr.request_date) = target_year
    GROUP BY mr.status
  ) status_counts;

  -- Get monthly summary directly here to avoid recursive calls
  SELECT jsonb_build_object(
    'total_cases', COUNT(*),
    'done_cases', COUNT(*) FILTER (WHERE status = 'completed'),
    'pending_cases', COUNT(*) FILTER (WHERE status IN ('pending', 'in-progress')),
    'cancelled_cases', COUNT(*) FILTER (WHERE status IN ('cancelled', 'rejected')),
    'total_revenue', COALESCE(SUM(paid_amount), 0),
    'average_case_value', COALESCE(AVG(paid_amount), 0),
    'conversion_rate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'completed')::numeric / 
       NULLIF(COUNT(*), 0)::numeric) * 100, 2
    )
  ) INTO monthly_summary
  FROM medical_requests mr
  WHERE EXTRACT(MONTH FROM mr.request_date) = target_month
    AND EXTRACT(YEAR FROM mr.request_date) = target_year;

  -- Combine all data
  result := jsonb_build_object(
    'month', target_month,
    'year', target_year,
    'summary', COALESCE(monthly_summary, '{}'::jsonb),
    'branches', COALESCE(branch_stats, '[]'::jsonb),
    'hospitals', COALESCE(hospital_stats, '[]'::jsonb),
    'top_specialties', COALESCE(specialty_stats, '[]'::jsonb),
    'status_breakdown', COALESCE(status_breakdown, '{}'::jsonb),
    'generated_at', to_jsonb(NOW())
  );

  RETURN result;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_monthly_branch_stats(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_hospital_stats(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_top_specialties(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_conversion_trends(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_dashboard_data(integer, integer) TO authenticated;