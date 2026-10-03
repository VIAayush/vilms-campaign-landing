-- =============================================================================
-- API & Integrations: provider connections, encrypted credentials, event log.
-- =============================================================================
-- Security model:
--   * Only CRM admins (owner/admin) can see or change integrations (RLS).
--   * Credentials are encrypted by the app server (AES-256-GCM, key in the
--     server-only INTEGRATIONS_ENCRYPTION_KEY env var) BEFORE they reach the
--     database. Postgres stores ciphertext only, in the private schema, which
--     the API does not expose and no role has table grants on.
--   * public.integrations.config holds non-secret settings only (sender name,
--     endpoint URL, selected events…). The app never puts secrets in it.
--   * Automations run server-side through ingest-secret-gated functions, like
--     lead ingest, and only for integrations that are enabled AND verified.
--   * The event log never stores credentials; responses are short summaries.
-- =============================================================================

create table public.integrations (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  provider         text not null check (provider ~ '^[a-z0-9_]{2,40}$'),
  category         text not null check (category in ('email', 'messaging', 'automation', 'analytics', 'other')),
  name             text not null check (char_length(btrim(name)) between 1 and 80),
  status           text not null default 'needs_configuration'
                     check (status in ('not_connected', 'connected', 'error', 'needs_configuration')),
  config           jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  events           text[] not null default '{}'
                     check (events <@ array['new_lead', 'status_changed', 'demo_scheduled', 'trial_started', 'converted']::text[]),
  is_enabled       boolean not null default false,
  has_secret       boolean not null default false,
  secret_hint      text check (char_length(secret_hint) <= 40),
  last_verified_at timestamptz,
  last_error       text check (char_length(last_error) <= 300),
  created_by       uuid references public.crm_members (id) on delete set null
);
create index integrations_provider_idx on public.integrations (provider);

create trigger integrations_touch before update on public.integrations
  for each row execute function private.touch_updated_at();

-- Ciphertext only. No grants; reachable solely through the functions below.
create table private.integration_secrets (
  integration_id uuid primary key references public.integrations (id) on delete cascade,
  ciphertext     text not null check (char_length(ciphertext) <= 8000),
  updated_at     timestamptz not null default now()
);
alter table private.integration_secrets enable row level security;
revoke all on private.integration_secrets from public, anon, authenticated;

create table public.integration_events (
  id               bigint generated always as identity primary key,
  created_at       timestamptz not null default now(),
  integration_id   uuid references public.integrations (id) on delete set null,
  provider         text not null check (char_length(provider) <= 40),
  integration_name text check (char_length(integration_name) <= 80),
  event_type       text not null check (char_length(event_type) <= 40),
  status           text not null check (status in ('success', 'failed', 'skipped')),
  response_summary text check (char_length(response_summary) <= 500),
  lead_id          uuid references public.leads (id) on delete set null,
  metadata         jsonb not null default '{}'::jsonb,
  actor_id         uuid references public.crm_members (id) on delete set null
);
create index integration_events_created_idx on public.integration_events (created_at desc);
create index integration_events_integration_idx on public.integration_events (integration_id);

-- -----------------------------------------------------------------------------
-- RLS + privileges: admins only.
-- -----------------------------------------------------------------------------
alter table public.integrations enable row level security;
alter table public.integration_events enable row level security;
revoke all on public.integrations, public.integration_events from anon, authenticated;

grant select, delete on public.integrations to authenticated;
grant insert (provider, category, name, status, config, events, is_enabled, created_by) on public.integrations to authenticated;
grant update (name, status, config, events, is_enabled, last_verified_at, last_error) on public.integrations to authenticated;
grant select on public.integration_events to authenticated;

create policy "admins read integrations" on public.integrations
  for select to authenticated using ((select private.is_crm_admin()));
create policy "admins add integrations" on public.integrations
  for insert to authenticated with check ((select private.is_crm_admin()));
create policy "admins change integrations" on public.integrations
  for update to authenticated using ((select private.is_crm_admin())) with check ((select private.is_crm_admin()));
create policy "admins remove integrations" on public.integrations
  for delete to authenticated using ((select private.is_crm_admin()));
create policy "admins read integration log" on public.integration_events
  for select to authenticated using ((select private.is_crm_admin()));

-- -----------------------------------------------------------------------------
-- Admin functions (called by CRM server actions with the admin's session).
-- -----------------------------------------------------------------------------
create function public.crm_save_integration_secret(p_integration uuid, p_ciphertext text, p_hint text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_crm_admin() then
    raise exception 'Only admins can manage integrations' using errcode = '42501';
  end if;
  if not exists (select 1 from public.integrations where id = p_integration) then
    raise exception 'Integration not found' using errcode = 'P0002';
  end if;
  insert into private.integration_secrets (integration_id, ciphertext, updated_at)
  values (p_integration, p_ciphertext, now())
  on conflict (integration_id) do update set ciphertext = excluded.ciphertext, updated_at = now();
  update public.integrations set has_secret = true, secret_hint = left(p_hint, 40) where id = p_integration;
end $$;

-- Returns ciphertext (useless without the server's key) for Test Connection.
create function public.crm_integration_secret(p_integration uuid)
returns text language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_crm_admin() then
    raise exception 'Only admins can manage integrations' using errcode = '42501';
  end if;
  return (select ciphertext from private.integration_secrets where integration_id = p_integration);
end $$;

create function public.crm_log_integration_event(
  p_integration uuid, p_event text, p_status text, p_summary text, p_lead uuid, p_metadata jsonb
)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_crm_admin() then
    raise exception 'Only admins can manage integrations' using errcode = '42501';
  end if;
  insert into public.integration_events (integration_id, provider, integration_name, event_type, status, response_summary, lead_id, metadata, actor_id)
  select p_integration, coalesce(i.provider, 'unknown'), i.name, left(p_event, 40), p_status, left(p_summary, 500), p_lead,
         coalesce(p_metadata, '{}'::jsonb), (select auth.uid())
    from (select 1) one left join public.integrations i on i.id = p_integration;
end $$;

-- -----------------------------------------------------------------------------
-- Server-side automation (no user session; gated by the ingest secret).
-- -----------------------------------------------------------------------------
create function public.integration_dispatch_targets(p_secret text, p_event text)
returns table (id uuid, provider text, name text, config jsonb, ciphertext text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.assert_ingest_secret(p_secret);
  return query
    select i.id, i.provider, i.name, i.config, s.ciphertext
      from public.integrations i
      left join private.integration_secrets s on s.integration_id = i.id
     where i.is_enabled and i.status = 'connected' and p_event = any (i.events);
end $$;

create function public.integration_log_event(
  p_secret text, p_integration uuid, p_event text, p_status text, p_summary text, p_lead uuid, p_metadata jsonb
)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_ingest_secret(p_secret);
  insert into public.integration_events (integration_id, provider, integration_name, event_type, status, response_summary, lead_id, metadata)
  select p_integration, coalesce(i.provider, 'unknown'), i.name, left(p_event, 40), p_status, left(p_summary, 500), p_lead, coalesce(p_metadata, '{}'::jsonb)
    from (select 1) one left join public.integrations i on i.id = p_integration;
  if p_status = 'failed' then
    update public.integrations set status = 'error', last_error = left(p_summary, 300) where id = p_integration;
  end if;
end $$;

-- Public tracking IDs (GA4 measurement ID / Meta Pixel ID) for the website tag.
-- These are public by nature — they appear in every page's HTML.
create function public.site_analytics_ids(p_secret text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.assert_ingest_secret(p_secret);
  return jsonb_strip_nulls(jsonb_build_object(
    'ga4', (select config->>'measurement_id' from public.integrations
             where provider = 'ga4' and is_enabled and status = 'connected' order by updated_at desc limit 1),
    'pixel', (select config->>'pixel_id' from public.integrations
               where provider = 'meta_pixel' and is_enabled and status = 'connected' order by updated_at desc limit 1)
  ));
end $$;

revoke all on function public.crm_save_integration_secret(uuid, text, text) from public, anon;
revoke all on function public.crm_integration_secret(uuid) from public, anon;
revoke all on function public.crm_log_integration_event(uuid, text, text, text, uuid, jsonb) from public, anon;
grant execute on function public.crm_save_integration_secret(uuid, text, text) to authenticated;
grant execute on function public.crm_integration_secret(uuid) to authenticated;
grant execute on function public.crm_log_integration_event(uuid, text, text, text, uuid, jsonb) to authenticated;

revoke all on function public.integration_dispatch_targets(text, text) from public, authenticated;
revoke all on function public.integration_log_event(text, uuid, text, text, text, uuid, jsonb) from public, authenticated;
revoke all on function public.site_analytics_ids(text) from public, authenticated;
grant execute on function public.integration_dispatch_targets(text, text) to anon;
grant execute on function public.integration_log_event(text, uuid, text, text, text, uuid, jsonb) to anon;
grant execute on function public.site_analytics_ids(text) to anon;
