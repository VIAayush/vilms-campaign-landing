-- =============================================================================
-- VILMS marketing site + lead CRM — core schema
-- =============================================================================
-- Security model:
--   * RLS is enabled on every table, and `anon` holds no table privileges at all.
--   * Public writes (the lead form and page events) go ONLY through
--     public.ingest_lead / public.ingest_events. They run as SECURITY DEFINER and
--     refuse any call that does not carry the server-only ingest secret, so a
--     visitor holding the public API key cannot skip the website's validation,
--     honeypot or rate limits by calling the database directly.
--   * The CRM reads and writes with the signed-in team member's own session.
--     RLS checks membership/role on every row. Nothing uses the service-role key.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public;
-- RLS policies call private.* helpers as the querying role, so `authenticated`
-- needs USAGE. That does not expose the schema over the API (only the
-- PostgREST db_schemas setting does), and its tables stay ungranted.
grant usage on schema private to authenticated;

-- -----------------------------------------------------------------------------
-- Team members (who may use the CRM, and with what role)
-- -----------------------------------------------------------------------------
create table public.crm_members (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null check (char_length(btrim(full_name)) between 2 and 100),
  role        text not null default 'sales' check (role in ('owner', 'admin', 'sales', 'viewer')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index crm_members_email_key on public.crm_members (lower(email));

-- Role helpers. SECURITY DEFINER so policies on crm_members itself don't recurse.
create function private.crm_role()
returns text language sql stable security definer set search_path = ''
as $$
  select m.role from public.crm_members m
  where m.id = (select auth.uid()) and m.is_active
$$;

create function private.is_crm_member()
returns boolean language sql stable security definer set search_path = ''
as $$ select private.crm_role() is not null $$;

create function private.can_edit_leads()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(private.crm_role() in ('owner', 'admin', 'sales'), false) $$;

create function private.is_crm_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(private.crm_role() in ('owner', 'admin'), false) $$;

-- -----------------------------------------------------------------------------
-- Leads
-- -----------------------------------------------------------------------------
create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- What the visitor told us
  full_name         text not null check (char_length(btrim(full_name)) between 2 and 100),
  institute_name    text not null check (char_length(btrim(institute_name)) between 2 and 150),
  email             text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  phone             text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  city              text not null check (char_length(btrim(city)) between 2 and 80),
  institute_type    text not null check (institute_type in (
                      'coaching_institute', 'test_prep_centre', 'skill_academy', 'training_institute',
                      'school', 'college', 'online_academy', 'other')),
  student_count     text not null check (student_count in ('1-500', '501-2000', '2001-5000', '5001-15000', '15000+')),
  website           text check (char_length(website) <= 300),
  current_lms       text check (char_length(current_lms) <= 120),
  interest          text not null default 'book_demo' check (interest in (
                      'book_demo', 'free_trial', 'pricing', 'migration', 'white_label', 'lead_crm', 'other')),
  message           text check (char_length(message) <= 2000),
  consent_at        timestamptz not null,

  -- Sales pipeline
  status            text not null default 'new' check (status in (
                      'new', 'contacted', 'demo_scheduled', 'demo_completed', 'follow_up',
                      'interested', 'trial_started', 'converted', 'not_interested', 'closed')),
  -- Furthest pipeline stage ever reached (see private.lead_stage_rank). Kept so
  -- the funnel still counts a lead that reached "demo scheduled" and was later
  -- marked "not interested".
  max_stage         smallint not null default 0,
  priority          text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_to       uuid references public.crm_members (id) on delete set null,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  is_spam           boolean not null default false,

  -- Attribution (where the lead came from)
  channel           text not null default 'direct' check (char_length(channel) <= 40),
  source            text check (char_length(source) <= 120),
  medium            text check (char_length(medium) <= 120),
  campaign          text check (char_length(campaign) <= 200),
  term              text check (char_length(term) <= 200),
  content           text check (char_length(content) <= 200),
  gclid             text check (char_length(gclid) <= 300),
  fbclid            text check (char_length(fbclid) <= 300),
  landing_page      text check (char_length(landing_page) <= 300),
  referrer          text check (char_length(referrer) <= 300),
  form_location     text check (char_length(form_location) <= 60),
  first_visit_at    timestamptz,
  visitor_id        uuid,
  user_agent        text check (char_length(user_agent) <= 400),

  -- Submission bookkeeping (idempotency + repeat enquiries)
  submission_id     uuid not null unique,
  submit_count      integer not null default 1,
  last_submitted_at timestamptz not null default now()
);

create index leads_created_at_idx        on public.leads (created_at desc);
create index leads_status_idx            on public.leads (status);
create index leads_assigned_to_idx       on public.leads (assigned_to);
create index leads_next_follow_up_idx    on public.leads (next_follow_up_at) where next_follow_up_at is not null;
create index leads_email_idx             on public.leads (lower(email));
create index leads_phone_idx             on public.leads (phone);
create index leads_channel_idx           on public.leads (channel);
create index leads_campaign_idx          on public.leads (campaign);
create index leads_institute_type_idx    on public.leads (institute_type);
create index leads_last_submitted_idx    on public.leads (last_submitted_at desc);
create index leads_visitor_idx           on public.leads (visitor_id);

-- -----------------------------------------------------------------------------
-- Lead activity timeline (append-only audit trail)
-- -----------------------------------------------------------------------------
create table public.lead_activities (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  created_at  timestamptz not null default now(),
  actor_id    uuid references public.crm_members (id) on delete set null,
  type        text not null check (type in (
                'created', 'resubmitted', 'status_changed', 'assigned', 'priority_changed',
                'follow_up_set', 'note', 'contact_call', 'contact_whatsapp', 'contact_email',
                'updated', 'spam_flagged')),
  body        text check (char_length(body) <= 5000),
  meta        jsonb not null default '{}'::jsonb
);
create index lead_activities_lead_idx  on public.lead_activities (lead_id, created_at desc);
create index lead_activities_actor_idx on public.lead_activities (actor_id);

-- -----------------------------------------------------------------------------
-- First-party visitor / event tracking (no fingerprinting, no raw IPs)
-- -----------------------------------------------------------------------------
create table public.visitors (
  id                 uuid primary key,            -- random id from a first-party cookie
  first_seen_at      timestamptz not null default now(),
  last_seen_at       timestamptz not null default now(),
  first_landing_page text check (char_length(first_landing_page) <= 300),
  first_referrer     text check (char_length(first_referrer) <= 300),
  first_channel      text check (char_length(first_channel) <= 40),
  first_source       text check (char_length(first_source) <= 120),
  first_medium       text check (char_length(first_medium) <= 120),
  first_campaign     text check (char_length(first_campaign) <= 200),
  lead_id            uuid references public.leads (id) on delete set null
);
create index visitors_lead_idx on public.visitors (lead_id);

create table public.site_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  visitor_id  uuid not null references public.visitors (id) on delete cascade,
  session_id  uuid,
  lead_id     uuid references public.leads (id) on delete set null,
  name        text not null check (name in (
                'page_view', 'cta_click', 'pricing_view', 'feature_view',
                'demo_form_open', 'demo_form_submit', 'trial_click')),
  path        text check (char_length(path) <= 300),
  label       text check (char_length(label) <= 120),
  channel     text check (char_length(channel) <= 40),
  source      text check (char_length(source) <= 120),
  medium      text check (char_length(medium) <= 120),
  campaign    text check (char_length(campaign) <= 200)
);
create index site_events_created_idx on public.site_events (created_at desc);
create index site_events_visitor_idx on public.site_events (visitor_id, created_at);
create index site_events_name_idx    on public.site_events (name, created_at);
create index site_events_lead_idx    on public.site_events (lead_id);

-- -----------------------------------------------------------------------------
-- Private internals (never exposed over the API)
-- -----------------------------------------------------------------------------
create table private.app_config (
  key   text primary key,
  value text not null
);

create table private.rate_limit_hits (
  id          bigint generated always as identity primary key,
  key         text not null,
  created_at  timestamptz not null default now()
);
create index rate_limit_hits_key_idx on private.rate_limit_hits (key, created_at);

revoke all on all tables in schema private from public, anon, authenticated;

create function private.assert_ingest_secret(p_secret text)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_hash text;
begin
  select value into v_hash from private.app_config where key = 'ingest_secret_sha256';
  if v_hash is null then
    raise exception 'Lead ingest is not configured' using errcode = 'P0001';
  end if;
  if p_secret is null or encode(extensions.digest(p_secret, 'sha256'), 'hex') <> v_hash then
    raise exception 'Unauthorized' using errcode = '28000';
  end if;
end $$;

-- Sliding-window counter. Returns false once `p_limit` hits are already
-- recorded for `p_key` inside `p_window`. Old rows are swept occasionally.
create function private.hit_rate_limit(p_key text, p_limit integer, p_window interval)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
  v_count integer;
begin
  if random() < 0.02 then
    delete from private.rate_limit_hits where created_at < now() - interval '2 days';
  end if;
  select count(*) into v_count
    from private.rate_limit_hits
   where key = p_key and created_at > now() - p_window;
  if v_count >= p_limit then
    return false;
  end if;
  insert into private.rate_limit_hits (key) values (p_key);
  return true;
end $$;

create function private.lead_stage_rank(p_status text)
returns smallint language sql immutable set search_path = ''
as $$
  select (case p_status
    when 'contacted'      then 1
    when 'follow_up'      then 1
    when 'demo_scheduled' then 2
    when 'demo_completed' then 3
    when 'interested'     then 3
    when 'trial_started'  then 4
    when 'converted'      then 5
    else 0 end)::smallint
$$;

-- Attach a visitor's anonymous history to the lead they became.
create function private.link_visitor(p_visitor uuid, p_lead uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_visitor is null then
    return;
  end if;
  update public.visitors set lead_id = p_lead
   where id = p_visitor and (lead_id is null or lead_id = p_lead);
  update public.site_events set lead_id = p_lead
   where visitor_id = p_visitor and lead_id is null;
end $$;

-- -----------------------------------------------------------------------------
-- Triggers: timestamps, furthest stage, automatic activity log
-- -----------------------------------------------------------------------------
create function private.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger crm_members_touch before update on public.crm_members
  for each row execute function private.touch_updated_at();

create function private.leads_before_write()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.max_stage := private.lead_stage_rank(new.status);
    return new;
  end if;
  new.updated_at := now();
  if new.status is distinct from old.status then
    new.max_stage := greatest(old.max_stage, private.lead_stage_rank(new.status));
    if new.status = 'contacted' and new.last_contacted_at is null then
      new.last_contacted_at := now();
    end if;
  end if;
  return new;
end $$;

create trigger leads_before_write before insert or update on public.leads
  for each row execute function private.leads_before_write();

-- Logged here rather than by the app so the audit trail can't be skipped.
create function private.leads_log_changes()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_fields text[] := '{}';
begin
  if v_actor is not null and not exists (select 1 from public.crm_members where id = v_actor) then
    v_actor := null;
  end if;

  if new.status is distinct from old.status then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'status_changed', jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  if new.assigned_to is distinct from old.assigned_to then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'assigned', jsonb_build_object('from', old.assigned_to, 'to', new.assigned_to));
  end if;
  if new.priority is distinct from old.priority then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'priority_changed', jsonb_build_object('from', old.priority, 'to', new.priority));
  end if;
  if new.next_follow_up_at is distinct from old.next_follow_up_at then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'follow_up_set', jsonb_build_object('at', new.next_follow_up_at));
  end if;
  if new.is_spam is distinct from old.is_spam then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'spam_flagged', jsonb_build_object('is_spam', new.is_spam));
  end if;

  if new.full_name      is distinct from old.full_name      then v_fields := v_fields || 'full_name'; end if;
  if new.institute_name is distinct from old.institute_name then v_fields := v_fields || 'institute_name'; end if;
  if new.email          is distinct from old.email          then v_fields := v_fields || 'email'; end if;
  if new.phone          is distinct from old.phone          then v_fields := v_fields || 'phone'; end if;
  if new.city           is distinct from old.city           then v_fields := v_fields || 'city'; end if;
  if new.institute_type is distinct from old.institute_type then v_fields := v_fields || 'institute_type'; end if;
  if new.student_count  is distinct from old.student_count  then v_fields := v_fields || 'student_count'; end if;
  if new.website        is distinct from old.website        then v_fields := v_fields || 'website'; end if;
  if new.current_lms    is distinct from old.current_lms    then v_fields := v_fields || 'current_lms'; end if;
  if new.interest       is distinct from old.interest       then v_fields := v_fields || 'interest'; end if;
  if new.message        is distinct from old.message        then v_fields := v_fields || 'message'; end if;
  if cardinality(v_fields) > 0 then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'updated', jsonb_build_object('fields', to_jsonb(v_fields)));
  end if;

  return null;
end $$;

create trigger leads_log_changes after update on public.leads
  for each row execute function private.leads_log_changes();

-- -----------------------------------------------------------------------------
-- Row Level Security + privileges
-- -----------------------------------------------------------------------------
alter table public.crm_members     enable row level security;
alter table public.leads           enable row level security;
alter table public.lead_activities enable row level security;
alter table public.visitors        enable row level security;
alter table public.site_events     enable row level security;
alter table private.app_config     enable row level security;
alter table private.rate_limit_hits enable row level security;

-- Start from nothing; Supabase's default privileges grant everything to anon/authenticated.
revoke all on public.crm_members, public.leads, public.lead_activities,
              public.visitors, public.site_events from anon, authenticated;

-- crm_members: the team can see the team (needed for assignment). Changes go through RPCs.
grant select on public.crm_members to authenticated;
create policy "team can read team" on public.crm_members
  for select to authenticated using ((select private.is_crm_member()));

-- leads
grant select, delete on public.leads to authenticated;
-- Only pipeline/contact fields are editable. Attribution, timestamps and
-- submission bookkeeping cannot be rewritten from the CRM.
grant update (full_name, institute_name, email, phone, city, institute_type, student_count,
              website, current_lms, interest, message, status, priority, assigned_to,
              last_contacted_at, next_follow_up_at, is_spam)
  on public.leads to authenticated;

create policy "team can read leads" on public.leads
  for select to authenticated using ((select private.is_crm_member()));
create policy "editors can update leads" on public.leads
  for update to authenticated
  using ((select private.can_edit_leads()))
  with check ((select private.can_edit_leads()));
create policy "admins can delete leads" on public.leads
  for delete to authenticated using ((select private.is_crm_admin()));

-- lead_activities: readable by the team; people may add notes and contact
-- logs as themselves. Everything else is written by triggers / ingest.
grant select, insert on public.lead_activities to authenticated;
create policy "team can read activity" on public.lead_activities
  for select to authenticated using ((select private.is_crm_member()));
create policy "editors can add notes and contact logs" on public.lead_activities
  for insert to authenticated
  with check (
    (select private.can_edit_leads())
    and actor_id = (select auth.uid())
    and type in ('note', 'contact_call', 'contact_whatsapp', 'contact_email')
  );

-- visitors / site_events: read-only for the team.
grant select on public.visitors, public.site_events to authenticated;
create policy "team can read visitors" on public.visitors
  for select to authenticated using ((select private.is_crm_member()));
create policy "team can read events" on public.site_events
  for select to authenticated using ((select private.is_crm_member()));

-- Helpers callable from policies/triggers by signed-in users only.
revoke all on all functions in schema private from public, anon;
grant execute on function private.crm_role(), private.is_crm_member(),
                          private.can_edit_leads(), private.is_crm_admin(),
                          private.lead_stage_rank(text), private.touch_updated_at()
  to authenticated;
grant execute on function private.leads_before_write() to authenticated;
