-- Helper: robust Excel date parser (serials + common strings)
create or replace function public.parse_excel_date(raw text)
returns date
language plpgsql immutable as $$
declare
  d date;
  n numeric;
begin
  if raw is null or length(trim(raw))=0 then
    return null;
  end if;

  -- Excel serial (e.g., 45839)
  begin
    n := raw::numeric;
    if n > 25000 then
      return date '1900-01-01' + (n - 2)::int; -- 1900 leap bug
    end if;
  exception when others then
    -- not numeric
  end;

  -- ISO yyyy-mm-dd
  begin d := raw::date; return d; exception when others then end;

  -- Try common formats
  begin return to_date(raw, 'MM/DD/YYYY'); exception when others then end;
  begin return to_date(raw, 'DD/MM/YYYY'); exception when others then end;
  begin return to_date(raw, 'MM/DD/YY');   exception when others then end;
  begin return to_date(raw, 'DD/MM/YY');   exception when others then end;

  return null;
end $$;

-- View: normalize your uploaded Excel rows (using upload_id + row_no as key)
create or replace view public.excel_cases_clean as
select
  upload_id,
  row_no,
  coalesce("Status")::text                                      as status,
  coalesce("Branch")::text                                      as branch,
  parse_excel_date(coalesce("Date"))                            as case_date,
  coalesce("Hospital Name")::text                               as hospital,
  coalesce("Specialty")::text                                   as specialty,
  coalesce("Paid Amount")::text                                 as paid_amount_text
from excel_rows_raw
where coalesce("Status") is not null
  and coalesce("Date") is not null;

-- RPC: exact monthly analysis from Excel only
create or replace function public.analyze_excel_cases_monthly(p_year int, p_month int)
returns table(
  total_cases bigint,
  status_breakdown jsonb,
  branch_breakdown jsonb,
  hospital_breakdown jsonb,
  specialty_breakdown jsonb
) language plpgsql security definer as $$
declare
  t bigint;
  sb jsonb;
  bb jsonb;
  hb jsonb;
  spb jsonb;
begin
  with m as (
    select *
    from public.excel_cases_clean
    where case_date is not null
      and extract(year  from case_date) = p_year
      and extract(month from case_date) = p_month
  )
  select count(*) into t from m;

  select jsonb_object_agg(status, cnt) into sb
  from (select status, count(*) cnt from m group by status order by count(*) desc) s;

  select jsonb_object_agg(coalesce(branch,'Unknown'), cnt) into bb
  from (select branch, count(*) cnt from m group by branch order by count(*) desc) b;

  select jsonb_object_agg(coalesce(hospital,'Unknown'), cnt) into hb
  from (select hospital, count(*) cnt from m group by hospital order by count(*) desc) h;

  select jsonb_object_agg(coalesce(specialty,'Unknown'), cnt) into spb
  from (select specialty, count(*) cnt from m group by specialty order by count(*) desc) sp;

  return query select
    coalesce(t,0),
    coalesce(sb, '{}'::jsonb),
    coalesce(bb, '{}'::jsonb),
    coalesce(hb, '{}'::jsonb),
    coalesce(spb,'{}'::jsonb);
end $$;