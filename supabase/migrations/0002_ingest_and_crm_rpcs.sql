-- =============================================================================
-- Public ingest (lead form + page events), team management, CRM reporting
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ingest_lead — the ONLY way a lead row gets created.
-- Called by the website's server with the public key + the server-only ingest
-- secret. Field validation happens twice: zod on the server for friendly
-- errors, and the table's CHECK constraints as the final word.
-- Returns {status: created|merged|duplicate_submission|rate_limited, lead_id}.
-- -----------------------------------------------------------------------------
create function public.ingest_lead(p_secret text, p_ip_hash text, p_lead jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_submission  uuid := (p_lead->>'submission_id')::uuid;
  v_email       text := lower(btrim(p_lead->>'email'));
  v_phone       text := btrim(p_lead->>'phone');
  v_visitor     uuid := nullif(p_lead->>'visitor_id', '')::uuid;
  v_existing_id uuid;
  v_id          uuid;
  v_ok_short    boolean;
  v_ok_day      boolean;
begin
  perform private.assert_ingest_secret(p_secret);

  if coalesce(p_lead->>'consent', 'false') <> 'true' then
    raise exception 'Consent is required' using errcode = '22023';
  end if;

  -- 1. The same submission retried (double click, flaky network).
  select id into v_existing_id from public.leads where submission_id = v_submission;
  if found then
    return jsonb_build_object('status', 'duplicate_submission', 'lead_id', v_existing_id);
  end if;

  -- 2. Rate limits per (hashed) IP address.
  v_ok_short := private.hit_rate_limit('lead:10m:' || coalesce(p_ip_hash, 'none'), 5, interval '10 minutes');
  v_ok_day   := private.hit_rate_limit('lead:1d:'  || coalesce(p_ip_hash, 'none'), 25, interval '1 day');
  if not v_ok_short or not v_ok_day then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  -- 3. The same person enquiring again within 30 days is folded into their
  --    existing lead (with a timeline entry) instead of creating a duplicate.
  select id into v_existing_id
    from public.leads
   where (lower(email) = v_email or phone = v_phone)
     and created_at > now() - interval '30 days'
   order by created_at desc
   limit 1;
  if found then
    update public.leads
       set submit_count = submit_count + 1,
           last_submitted_at = now()
     where id = v_existing_id;
    insert into public.lead_activities (lead_id, type, body, meta)
    values (v_existing_id, 'resubmitted', nullif(btrim(p_lead->>'message'), ''),
            jsonb_strip_nulls(jsonb_build_object(
              'interest', p_lead->>'interest',
              'form_location', p_lead->>'form_location',
              'channel', p_lead->>'channel',
              'source', nullif(p_lead->>'source', ''),
              'campaign', nullif(p_lead->>'campaign', ''))));
    perform private.link_visitor(v_visitor, v_existing_id);
    return jsonb_build_object('status', 'merged', 'lead_id', v_existing_id);
  end if;

  -- 4. A new lead.
  insert into public.leads (
    full_name, institute_name, email, phone, city, institute_type, student_count,
    website, current_lms, interest, message, consent_at,
    channel, source, medium, campaign, term, content, gclid, fbclid,
    landing_page, referrer, form_location, first_visit_at, visitor_id, user_agent,
    submission_id
  ) values (
    btrim(p_lead->>'full_name'),
    btrim(p_lead->>'institute_name'),
    v_email,
    v_phone,
    btrim(p_lead->>'city'),
    p_lead->>'institute_type',
    p_lead->>'student_count',
    nullif(btrim(p_lead->>'website'), ''),
    nullif(btrim(p_lead->>'current_lms'), ''),
    coalesce(nullif(p_lead->>'interest', ''), 'book_demo'),
    nullif(btrim(p_lead->>'message'), ''),
    now(),
    coalesce(nullif(p_lead->>'channel', ''), 'direct'),
    nullif(p_lead->>'source', ''),
    nullif(p_lead->>'medium', ''),
    nullif(p_lead->>'campaign', ''),
    nullif(p_lead->>'term', ''),
    nullif(p_lead->>'content', ''),
    nullif(p_lead->>'gclid', ''),
    nullif(p_lead->>'fbclid', ''),
    nullif(p_lead->>'landing_page', ''),
    nullif(p_lead->>'referrer', ''),
    nullif(p_lead->>'form_location', ''),
    nullif(p_lead->>'first_visit_at', '')::timestamptz,
    v_visitor,
    left(nullif(p_lead->>'user_agent', ''), 400),
    v_submission
  )
  returning id into v_id;

  insert into public.lead_activities (lead_id, type, meta)
  values (v_id, 'created', jsonb_strip_nulls(jsonb_build_object(
            'interest', p_lead->>'interest',
            'form_location', p_lead->>'form_location',
            'channel', p_lead->>'channel')));

  perform private.link_visitor(v_visitor, v_id);
  return jsonb_build_object('status', 'created', 'lead_id', v_id);
end $$;

-- -----------------------------------------------------------------------------
-- ingest_events — first-party page/CTA events, batched.
-- -----------------------------------------------------------------------------
create function public.ingest_events(p_secret text, p_ip_hash text, p_visitor jsonb, p_events jsonb)
returns integer language plpgsql security definer set search_path = ''
as $$
declare
  v_visitor uuid := (p_visitor->>'id')::uuid;
  v_lead    uuid;
  v_count   integer;
begin
  perform private.assert_ingest_secret(p_secret);

  if jsonb_typeof(p_events) <> 'array' then
    return 0;
  end if;
  if not private.hit_rate_limit('ev:10m:' || coalesce(p_ip_hash, 'none'), 300, interval '10 minutes') then
    return 0;
  end if;

  insert into public.visitors (
    id, first_landing_page, first_referrer, first_channel, first_source, first_medium, first_campaign
  ) values (
    v_visitor,
    left(nullif(p_visitor->>'landing_page', ''), 300),
    left(nullif(p_visitor->>'referrer', ''), 300),
    left(nullif(p_visitor->>'channel', ''), 40),
    left(nullif(p_visitor->>'source', ''), 120),
    left(nullif(p_visitor->>'medium', ''), 120),
    left(nullif(p_visitor->>'campaign', ''), 200)
  )
  on conflict (id) do update set last_seen_at = now()
  returning lead_id into v_lead;

  insert into public.site_events (visitor_id, session_id, lead_id, name, path, label, channel, source, medium, campaign)
  select v_visitor,
         nullif(e->>'session_id', '')::uuid,
         v_lead,
         e->>'name',
         left(nullif(e->>'path', ''), 300),
         left(nullif(e->>'label', ''), 120),
         left(nullif(e->>'channel', ''), 40),
         left(nullif(e->>'source', ''), 120),
         left(nullif(e->>'medium', ''), 120),
         left(nullif(e->>'campaign', ''), 200)
    from jsonb_array_elements(p_events) with ordinality as t(e, n)
   where n <= 25
     and e->>'name' in ('page_view', 'cta_click', 'pricing_view', 'feature_view',
                        'demo_form_open', 'demo_form_submit', 'trial_click');
  get diagnostics v_count = row_count;
  return v_count;
end $$;

revoke all on function public.ingest_lead(text, text, jsonb) from public;
revoke all on function public.ingest_events(text, text, jsonb, jsonb) from public;
-- Callable with the public key, but useless without the server-only secret.
grant execute on function public.ingest_lead(text, text, jsonb) to anon, authenticated;
grant execute on function public.ingest_events(text, text, jsonb, jsonb) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Team management (owner only)
-- -----------------------------------------------------------------------------
-- Creates a confirmed email/password login directly. Used instead of email
-- invites because no SMTP provider is configured for this project; the owner
-- hands the temporary password to the new member, who changes it on first use.
create function private.create_auth_user(p_email text, p_password text, p_full_name text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_id    uuid := gen_random_uuid();
  v_email text := lower(btrim(p_email));
begin
  if exists (select 1 from auth.users where lower(email) = v_email) then
    raise exception 'An account with this email already exists' using errcode = '23505';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, reauthentication_token, phone_change, phone_change_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name), now(), now(),
    '', '', '', '', '', '', '', ''
  );

  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (v_id::text, v_id,
          jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
          'email', now(), now(), now());

  return v_id;
end $$;

create function public.crm_add_member(p_email text, p_full_name text, p_role text, p_password text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_id    uuid;
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if private.crm_role() is distinct from 'owner' then
    raise exception 'Only the owner can add team members' using errcode = '42501';
  end if;
  if p_role not in ('admin', 'sales', 'viewer') then
    raise exception 'Role must be admin, sales or viewer' using errcode = '22023';
  end if;
  if v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then
    raise exception 'Enter a valid email address' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'Enter the member''s name' using errcode = '22023';
  end if;
  if char_length(coalesce(p_password, '')) < 12 then
    raise exception 'Temporary password must be at least 12 characters' using errcode = '22023';
  end if;

  v_id := private.create_auth_user(v_email, p_password, btrim(p_full_name));
  insert into public.crm_members (id, email, full_name, role)
  values (v_id, v_email, btrim(p_full_name), p_role);
  return v_id;
end $$;

create function public.crm_update_member(p_member uuid, p_role text, p_is_active boolean)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if private.crm_role() is distinct from 'owner' then
    raise exception 'Only the owner can change team members' using errcode = '42501';
  end if;
  if p_member = (select auth.uid()) then
    raise exception 'You can''t change your own role or access' using errcode = '42501';
  end if;
  if p_role not in ('admin', 'sales', 'viewer') then
    raise exception 'Role must be admin, sales or viewer' using errcode = '22023';
  end if;
  update public.crm_members
     set role = p_role, is_active = p_is_active
   where id = p_member and role <> 'owner';
  if not found then
    raise exception 'Team member not found' using errcode = 'P0002';
  end if;
end $$;

create function public.crm_reset_member_password(p_member uuid, p_password text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if private.crm_role() is distinct from 'owner' then
    raise exception 'Only the owner can reset passwords' using errcode = '42501';
  end if;
  if char_length(coalesce(p_password, '')) < 12 then
    raise exception 'Temporary password must be at least 12 characters' using errcode = '22023';
  end if;
  if not exists (select 1 from public.crm_members where id = p_member and role <> 'owner') then
    raise exception 'Team member not found' using errcode = 'P0002';
  end if;
  update auth.users
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
         updated_at = now()
   where id = p_member;
end $$;

revoke all on function public.crm_add_member(text, text, text, text) from public, anon;
revoke all on function public.crm_update_member(uuid, text, boolean) from public, anon;
revoke all on function public.crm_reset_member_password(uuid, text) from public, anon;
revoke all on function private.create_auth_user(text, text, text) from public, anon, authenticated;
grant execute on function public.crm_add_member(text, text, text, text) to authenticated;
grant execute on function public.crm_update_member(uuid, text, boolean) to authenticated;
grant execute on function public.crm_reset_member_password(uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Reporting. SECURITY INVOKER: RLS applies, so a non-member gets zeros.
-- "Today" / "this week" are India time.
-- -----------------------------------------------------------------------------
create function public.crm_dashboard()
returns jsonb language sql stable security invoker set search_path = ''
as $$
  with b as (
    select
      (date_trunc('day',  now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata') as today_start,
      ((date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '1 day') at time zone 'Asia/Kolkata') as tomorrow_start,
      (date_trunc('week', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata') as week_start
  ),
  l as (select * from public.leads where not is_spam)
  select jsonb_build_object(
    'total',                 (select count(*) from l),
    'new',                   (select count(*) from l where status = 'new'),
    'today',                 (select count(*) from l, b where l.created_at >= b.today_start),
    'this_week',             (select count(*) from l, b where l.created_at >= b.week_start),
    'demo_requests',         (select count(*) from l where interest = 'book_demo'),
    'demo_requests_waiting', (select count(*) from l where interest = 'book_demo' and max_stage < 2
                                and status not in ('not_interested', 'closed')),
    'trials_started',        (select count(*) from l where max_stage >= 4),
    'converted',             (select count(*) from l where status = 'converted'),
    'follow_ups_due',        (select count(*) from l, b where l.next_follow_up_at < b.tomorrow_start
                                and l.status not in ('converted', 'not_interested', 'closed')),
    'overdue',               (select count(*) from l where l.next_follow_up_at < now()
                                and l.status not in ('converted', 'not_interested', 'closed')),
    'spam',                  (select count(*) from public.leads where is_spam)
  )
$$;

create function public.crm_analytics(p_days integer default 30)
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
      'contacted',      (select count(*) from l where max_stage >= 1 or last_contacted_at is not null),
      'demo_scheduled', (select count(*) from l where max_stage >= 2),
      'trial_started',  (select count(*) from l where max_stage >= 4),
      'converted',      (select count(*) from l where max_stage >= 5)
    )
  )
$$;

revoke all on function public.crm_dashboard() from public, anon;
revoke all on function public.crm_analytics(integer) from public, anon;
grant execute on function public.crm_dashboard() to authenticated;
grant execute on function public.crm_analytics(integer) to authenticated;
