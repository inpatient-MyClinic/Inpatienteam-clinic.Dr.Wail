-- CLEAN OUT broken analytics objects (keeps your medical_requests table)
drop view if exists requests_v cascade;

drop function if exists import_excel_rows(text, jsonb) cascade;
drop function if exists kpi_conversion_rate(date, date, text[], text[], text[], text[]) cascade;
drop function if exists kpi_branch_counts(date, date, text[], text[], text[], text[]) cascade;
drop function if exists kpi_top_hospitals(date, date, text[], text[], text[], text[]) cascade;
drop function if exists kpi_top_specialties(date, date, text[], text[], text[], text[]) cascade;
drop function if exists kpi_loss_tree(date, date, text[], text[], text[], text[]) cascade;

drop table if exists excel_requests cascade;
drop table if exists excel_rows_raw cascade;
drop table if exists excel_uploads cascade;
drop table if exists sia_settings cascade;
drop table if exists hospitals cascade;

-- ====== REBUILD ======

-- Lookup (optional)
create table if not exists hospitals (
  code text primary key,
  name text not null
);

-- Ensure medical_requests has the columns analytics needs (no data loss)
alter table if exists medical_requests
  add column if not exists request_date date,
  add column if not exists branch_code text,
  add column if not exists hospital_code text,
  add column if not exists hospital_name text,
  add column if not exists specialty text,
  add column if not exists status text,
  add column if not exists loss_reason text,
  add column if not exists paid_amount numeric default 0;

-- Staging + Clean tables for Excel
create table excel_uploads (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  imported_at timestamptz default now()
);

create table excel_rows_raw (
  upload_id uuid references excel_uploads(id) on delete cascade,
  row_no int not null,
  "Date" text,
  "Branch" text,
  "Hospital Code" text,
  "Hospital Name" text,
  "Specialty" text,
  "Status" text,
  "Loss Reason" text,
  "Paid Amount" text,
  primary key (upload_id, row_no)
);

create table excel_requests (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid references excel_uploads(id) on delete cascade,
  row_no int not null,
  request_date date,
  branch_code text,
  hospital_code text,
  hospital_name text,
  specialty text,
  status text,
  loss_reason text,
  paid_amount numeric default 0,
  unique (upload_id, row_no)
);

-- Helpers for cleaning
create or replace function norm_text(t text)
returns text language sql immutable as $$
  select nullif(trim(both from t), '')
$$;

create or replace function norm_upper(t text)
returns text language sql immutable as $$
  select case when t is null then null else upper(trim(both from t)) end
$$;

create or replace function norm_status(s text)
returns text language sql immutable as $$
  select case upper(trim(both from coalesce(s,'')))
    when 'DONE' then 'Completed'
    when 'COMPLETED' then 'Completed'
    when 'SCHEDULED' then 'Scheduled'
    when 'PLANNED NVD' then 'Planned NVD'
    when 'NVD PLANNED' then 'Planned NVD'
    when 'CANCELLED' then 'Cancelled'
    when 'CANCELED' then 'Cancelled'
    when 'POLICY REJECTION' then 'Policy Rejection'
    when 'INSURANCE REJECTION' then 'Insurance Rejection'
    when 'PENDING' then 'Pending'
    when 'RESCHEDULED' then 'Reschedule'
    when 'RESCHEDULE' then 'Reschedule'
    when 'POSTPONED' then 'Postponed'
    when 'PRIVILEGE' then 'Privilege'
    else nullif(initcap(trim(both from s)),'')
  end
$$;

-- Indexes for speed (fix the problematic index)
create index if not exists ix_medreq_date on medical_requests (request_date);
create index if not exists ix_medreq_created on medical_requests (created_at);
create index if not exists ix_medreq_status on medical_requests (status);
create index if not exists ix_medreq_branch on medical_requests (branch_code);
create index if not exists ix_medreq_hosp on medical_requests (hospital_name);
create index if not exists ix_medreq_spec on medical_requests (specialty);

create index if not exists ix_excel_date on excel_requests (request_date);
create index if not exists ix_excel_status on excel_requests (status);
create index if not exists ix_excel_branch on excel_requests (branch_code);
create index if not exists ix_excel_hosp on excel_requests (hospital_name);
create index if not exists ix_excel_spec on excel_requests (specialty);

-- Unified view (LIVE + EXCEL)
create or replace view requests_v as
select
  mr.id::text as uid,
  coalesce(mr.request_date, mr.created_at::date) as request_date,
  upper(nullif(mr.branch_code,'')) as branch_code,
  coalesce(mr.hospital_name, (select name from hospitals h where h.code = mr.hospital_code)) as hospital_name,
  nullif(mr.specialty,'') as specialty,
  nullif(mr.status,'') as status,
  nullif(mr.loss_reason,'') as loss_reason,
  coalesce(mr.paid_amount,0)::numeric as paid_amount
from medical_requests mr
union all
select
  concat('X-', er.id::text) as uid,
  er.request_date,
  upper(nullif(er.branch_code,'')) as branch_code,
  coalesce(er.hospital_name, (select name from hospitals h where h.code = er.hospital_code)) as hospital_name,
  er.specialty,
  er.status,
  er.loss_reason,
  coalesce(er.paid_amount,0)::numeric
from excel_requests er;

-- Settings table (for conversion/loss buckets)
create table sia_settings (
  id bigserial primary key,
  scope text default 'global',
  key text not null,
  value jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(scope,key)
);

create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_touch_sia_settings on sia_settings;
create trigger trg_touch_sia_settings
before update on sia_settings
for each row execute function touch_updated_at();

insert into sia_settings(scope,key,value) values
('global','numerator_statuses','["Completed","Scheduled","Planned NVD"]')
on conflict (scope,key) do nothing;

insert into sia_settings(scope,key,value) values
('global','loss_cancelled_statuses','["Cancelled","Policy Rejection","Insurance Rejection"]')
on conflict (scope,key) do nothing;

insert into sia_settings(scope,key,value) values
('global','loss_pending_statuses','["Pending","Reschedule","Postponed","Privilege"]')
on conflict (scope,key) do nothing;

-- Import RPC (Excel -> staging -> clean)
create or replace function import_excel_rows(p_source_file text, p_rows jsonb)
returns int language plpgsql as $$
declare v_upload uuid; v_count int;
begin
  insert into excel_uploads(source_file) values (p_source_file) returning id into v_upload;

  insert into excel_rows_raw(upload_id, row_no, "Date","Branch","Hospital Code","Hospital Name","Specialty","Status","Loss Reason","Paid Amount")
  select v_upload, (row->>'__row')::int,
         row->>'Date', row->>'Branch', row->>'Hospital Code', row->>'Hospital Name',
         row->>'Specialty', row->>'Status', row->>'Loss Reason', row->>'Paid Amount'
  from jsonb_to_recordset(p_rows) as row;

  insert into excel_requests(upload_id,row_no,request_date,branch_code,hospital_code,hospital_name,specialty,status,loss_reason,paid_amount)
  select
    v_upload,
    r.row_no,
    coalesce(nullif(r."Date",'')::date, to_date(r."Date",'DD/MM/YYYY'), to_date(r."Date",'MM/DD/YYYY')),
    norm_upper(r."Branch"),
    norm_text(r."Hospital Code"),
    norm_text(r."Hospital Name"),
    norm_text(r."Specialty"),
    norm_status(r."Status"),
    norm_text(r."Loss Reason"),
    case when trim(coalesce(r."Paid Amount",'')) ~ '^[0-9]+(\\.[0-9]+)?$' then (r."Paid Amount")::numeric else 0 end
  from excel_rows_raw r
  where r.upload_id = v_upload
  on conflict (upload_id,row_no) do update set
    request_date = excluded.request_date,
    branch_code  = excluded.branch_code,
    hospital_code= excluded.hospital_code,
    hospital_name= excluded.hospital_name,
    specialty    = excluded.specialty,
    status       = excluded.status,
    loss_reason  = excluded.loss_reason,
    paid_amount  = excluded.paid_amount;

  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- KPI RPCs (server calculations match your Excel pivot)
create or replace function kpi_conversion_rate(
  p_start date, p_end date,
  p_statuses text[] default null, p_hospitals text[] default null,
  p_specs text[] default null, p_branches text[] default null
) returns table(denominator int, numerator int, conversion_rate numeric)
language sql stable as $$
with cfg as (
  select array(select jsonb_array_elements_text(value))
  from sia_settings where key='numerator_statuses' and scope='global'
),
base as (
  select * from requests_v
  where request_date >= p_start and request_date < p_end
    and (p_statuses  is null or status        = any(p_statuses))
    and (p_hospitals is null or hospital_name = any(p_hospitals))
    and (p_specs     is null or specialty     = any(p_specs))
    and (p_branches  is null or branch_code   = any(p_branches))
)
select
  count(*)::int,
  count(*) filter (where status = any((select coalesce((select * from cfg limit 1), array[]::text[]))))::int,
  coalesce(round(100.0 * count(*) filter (where status = any((select coalesce((select * from cfg limit 1), array[]::text[]))))
    / nullif(count(*),0),2),0);
$$;

create or replace function kpi_branch_counts(p_start date, p_end date,
  p_statuses text[] default null, p_hospitals text[] default null,
  p_specs text[] default null, p_branches text[] default null)
returns table(branch_code text, cnt int)
language sql stable as $$
select branch_code, count(*)::int
from requests_v
where request_date >= p_start and request_date < p_end
  and (p_statuses  is null or status        = any(p_statuses))
  and (p_hospitals is null or hospital_name = any(p_hospitals))
  and (p_specs     is null or specialty     = any(p_specs))
  and (p_branches  is null or branch_code   = any(p_branches))
group by branch_code;
$$;

create or replace function kpi_top_hospitals(p_start date, p_end date,
  p_statuses text[] default null, p_hospitals text[] default null,
  p_specs text[] default null, p_branches text[] default null)
returns table(hospital_name text, cnt int)
language sql stable as $$
select hospital_name, count(*)::int
from requests_v
where request_date >= p_start and request_date < p_end
  and (p_statuses  is null or status        = any(p_statuses))
  and (p_hospitals is null or hospital_name = any(p_hospitals))
  and (p_specs     is null or specialty     = any(p_specs))
  and (p_branches  is null or branch_code   = any(p_branches))
group by hospital_name
order by 2 desc nulls last
limit 5;
$$;

create or replace function kpi_top_specialties(p_start date, p_end date,
  p_statuses text[] default null, p_hospitals text[] default null,
  p_specs text[] default null, p_branches text[] default null)
returns table(specialty text, cnt int)
language sql stable as $$
select specialty, count(*)::int
from requests_v
where request_date >= p_start and request_date < p_end
  and (p_statuses  is null or status        = any(p_statuses))
  and (p_hospitals is null or hospital_name = any(p_hospitals))
  and (p_specs     is null or specialty     = any(p_specs))
  and (p_branches  is null or branch_code   = any(p_branches))
group by specialty
order by 2 desc nulls last
limit 5;
$$;

create or replace function kpi_loss_tree(p_start date, p_end date,
  p_statuses text[] default null, p_hospitals text[] default null,
  p_specs text[] default null, p_branches text[] default null)
returns table(cancelled_total int, pending_total int,
              cancelled_doc int, cancelled_medical int, cancelled_ins int, cancelled_other int,
              pending_doc int, pending_medical int, pending_ins int, pending_other int)
language sql stable as $$
with cfg as (
  select
    array(select jsonb_array_elements_text(value) from sia_settings where key='loss_cancelled_statuses' and scope='global') as cancelled,
    array(select jsonb_array_elements_text(value) from sia_settings where key='loss_pending_statuses' and scope='global')   as pending
),
base as (
  select * from requests_v
  where request_date >= p_start and request_date < p_end
    and (p_statuses  is null or status        = any(p_statuses))
    and (p_hospitals is null or hospital_name = any(p_hospitals))
    and (p_specs     is null or specialty     = any(p_specs))
    and (p_branches  is null or branch_code   = any(p_branches))
)
select
  sum((status = any((select cancelled from cfg)))::int),
  sum((status = any((select pending from cfg)))::int),

  sum(((status = any((select cancelled from cfg))) and loss_reason='Documentation')::int),
  sum(((status = any((select cancelled from cfg))) and loss_reason='Medical Criteria')::int),
  sum(((status = any((select cancelled from cfg))) and loss_reason='Insurance')::int),
  sum(((status = any((select cancelled from cfg))) and (loss_reason is null or loss_reason not in ('Documentation','Medical Criteria','Insurance')))::int),

  sum(((status = any((select pending from cfg))) and loss_reason='Documentation')::int),
  sum(((status = any((select pending from cfg))) and loss_reason='Medical Criteria')::int),
  sum(((status = any((select pending from cfg))) and loss_reason='Insurance')::int),
  sum(((status = any((select pending from cfg))) and (loss_reason is null or loss_reason not in ('Documentation','Medical Criteria','Insurance')))::int)
from base;
$$;