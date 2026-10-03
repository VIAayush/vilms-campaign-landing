-- Analytics: add funnel.leads_tracked (leads whose visit was recorded) so the
-- website conversion rate compares like with like. Leads from browsers that opt
-- out of analytics (GPC / Do Not Track) still count everywhere else.

create or replace function public.crm_analytics(p_days integer default 30)
returns jsonb language sql stable security invoker set search_path = ''
as $$
  with b as (
    select ((date_trunc('day', now() at time zone 'Asia/Kolkata')
             - make_interval(days => greatest(1, least(coalesce(p_days, 30), 366)) - 1))
            at time zone 'Asia/Kolkata') as from_ts
  ),
  l as (select l.* from public.leads l, b where l.created_at >= b.from_ts and not l.is_spam),
  e as (select e.* from public.site_events e, b where e.created_at >= b.from_ts),
  days as (
    select generate_series(
             date_trunc('day', (select from_ts from b) at time zone 'Asia/Kolkata'),
             date_trunc('day', now() at time zone 'Asia/Kolkata'),
             interval '1 day')::date as d
  )
  select jsonb_build_object(
    'from', (select from_ts from b),
    'days', greatest(1, least(coalesce(p_days, 30), 366)),
    'leads_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('day', days.d, 'count', coalesce(c.n, 0)) order by days.d), '[]'::jsonb)
        from days
        left join (select (created_at at time zone 'Asia/Kolkata')::date as d, count(*) as n from l group by 1) c
          on c.d = days.d),
    'by_channel', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by n desc, k), '[]'::jsonb)
        from (select channel as k, count(*) as n from l group by 1) x),
    'by_source', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by n desc, k), '[]'::jsonb)
        from (select coalesce(source, '(none)') as k, count(*) as n from l group by 1) x),
    'by_campaign', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by n desc, k), '[]'::jsonb)
        from (select coalesce(campaign, '(none)') as k, count(*) as n from l group by 1 order by 2 desc limit 15) x),
    'by_institute_type', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by n desc, k), '[]'::jsonb)
        from (select institute_type as k, count(*) as n from l group by 1) x),
    'by_student_count', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by k), '[]'::jsonb)
        from (select student_count as k, count(*) as n from l group by 1) x),
    'by_status', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by n desc, k), '[]'::jsonb)
        from (select status as k, count(*) as n from l group by 1) x),
    'by_interest', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by n desc, k), '[]'::jsonb)
        from (select interest as k, count(*) as n from l group by 1) x),
    'demo_requests', (select count(*) from l where interest = 'book_demo'),
    'events', (
      select coalesce(jsonb_object_agg(name, n), '{}'::jsonb)
        from (select name, count(*) as n from e group by 1) x),
    'funnel', jsonb_build_object(
      'visitors',       (select count(distinct visitor_id) from e where name = 'page_view'),
      'cta_clicks',     (select count(distinct visitor_id) from e where name in ('cta_click', 'trial_click')),
      'forms_opened',   (select count(distinct visitor_id) from e where name = 'demo_form_open'),
      'leads',          (select count(*) from l),
      -- Unique tracked browsers that became a lead (same unit as `visitors`).
      'leads_tracked',  (select count(distinct l.visitor_id) from l where exists (
                          select 1 from e where e.visitor_id = l.visitor_id)),
      'contacted',      (select count(*) from l where max_stage >= 1 or last_contacted_at is not null),
      'demo_scheduled', (select count(*) from l where max_stage >= 2),
      'trial_started',  (select count(*) from l where max_stage >= 4),
      'converted',      (select count(*) from l where max_stage >= 5)
    )
  )
$$;
