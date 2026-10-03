# VILMS — marketing site + lead CRM

A Next.js app with two halves:

- **Public site** (`/`, `/demo`, `/privacy`): the VILMS landing page (content from the VILMS brochure), one lead form used by every CTA, and first-party visit tracking.
- **CRM** (`/crm`): sign-in only. Dashboard, lead list and lead pages, pipeline, notes, follow-ups, contact actions, analytics, team management.

Data lives in Supabase (Postgres). **No service-role key is used anywhere.**

---

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill it in (see below)
npm run dev -- -p 3100       # http://localhost:3100  ·  CRM: http://localhost:3100/crm
```

Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Environment variables

| Variable | Where | Required | What it is |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | yes | Publishable (anon) key — public by design; RLS protects data |
| `LEAD_INGEST_SECRET` | **server only** | yes | Shared secret checked by the database's ingest functions. The DB stores only its SHA-256 hash |
| `NEXT_PUBLIC_SITE_URL` | both | yes | Canonical site URL (sitemap, OG tags) |
| `INTEGRATIONS_ENCRYPTION_KEY` | **server only** | for integrations | 32 random bytes (base64). Encrypts credentials saved in CRM → API & Integrations. Rotating it makes saved credentials unreadable — re-enter them |
| `NEXT_PUBLIC_SIGNIN_URL` | browser | no | Customer sign-in link in the nav (default: `/login` on the trial URL's host) |
| `NEXT_PUBLIC_TRIAL_URL` | browser | no | Where "Start your 14-day trial" goes (default `https://vilms.in/start`) |
| `NEXT_PUBLIC_DEMO_BOOKING_URL` | browser | no | A real scheduling link. Empty = success screen says the team will call |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | browser / server | no | Cloudflare Turnstile CAPTCHA. Both empty = no CAPTCHA (honeypot + timing + rate limits still apply) |
| `NEXT_PUBLIC_GA4_ID` | browser | no | GA4 measurement ID. Nothing loads when empty |
| `NEXT_PUBLIC_META_PIXEL_ID` | browser | no | Meta Pixel ID. Nothing loads when empty |

GA4 and the Pixel are skipped for visitors who send Global Privacy Control or Do Not Track.

## Database setup (new Supabase project)

1. Run the migrations in order (`supabase/migrations/0001…0006`) — SQL editor or `supabase db push`.
2. Set the ingest secret hash. Generate a secret, put it in `LEAD_INGEST_SECRET`, then hash it locally:
   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "YOUR_SECRET"
   ```
   and store only the hash:
   ```sql
   insert into private.app_config (key, value) values ('ingest_secret_sha256', '<hex hash>')
   on conflict (key) do update set value = excluded.value;
   ```
   **Rotating:** generate a new secret, update the hash with the same statement, then update `LEAD_INGEST_SECRET` and redeploy. Forms fail with a generic error between the two steps, so do them together.
3. Create the first owner (SQL editor — there is deliberately no public sign-up):
   ```sql
   with u as (select private.create_auth_user('owner@yourdomain.com', 'a-long-temporary-password', 'Your Name') as id)
   insert into public.crm_members (id, email, full_name, role)
   select id, 'owner@yourdomain.com', 'Your Name', 'owner' from u;
   ```
   Sign in at `/crm/login`, then change the password under **Account**. Add everyone else from **Team**.
4. In Supabase **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up". (RLS already gives non-members nothing, but there's no reason to let strangers create accounts.) Turn on leaked-password protection if your plan has it.

## Security model

- **Public visitors can only submit a lead.** The `anon` role has no table privileges at all. The form posts to `/api/leads`, which validates with Zod, checks the honeypot and fill time, optionally verifies Turnstile, then calls `public.ingest_lead` with the server-only secret. Calling the RPC directly without the secret fails.
- **Rate limits** (in the database, per HMAC-hashed IP — raw IPs are never stored): 5 leads / 10 min and 25 / day; 300 events / 10 min.
- **Duplicates:** a replayed submission (same `submission_id`) is ignored; the same email or phone within 30 days is merged into the existing lead (`submit_count` goes up and a "submitted again" entry is logged).
- **CRM:** `proxy.ts` sends signed-out users to `/crm/login`; every page, server action and the CSV route re-check membership and role on the server (`lib/crm/dal.ts`); Postgres RLS enforces it again on every query.
- **Roles:** Owner (everything + team) · Admin (all leads, delete, CSV export) · Sales (work leads, notes, contact) · Viewer (read-only). Only pipeline/contact columns are updatable — attribution and timestamps can't be rewritten from the CRM.
- **Audit trail:** status, assignment, priority, follow-up, spam and field edits are logged by a database trigger, so the timeline can't be skipped.
- `/crm` responses are `no-store` and `noindex`; `/crm` and `/api` are disallowed in `robots.txt`.

**Supabase advisor notes (intentional):** `ingest_lead`/`ingest_events` are SECURITY DEFINER and callable by `anon` — they reject any call without the secret. `crm_add_member`/`crm_update_member`/`crm_reset_member_password` are callable by signed-in users — each checks the caller is the owner. `private.app_config`/`private.rate_limit_hits` have RLS with no policies on purpose: nothing outside the database functions may touch them, and the `private` schema isn't exposed by the API.

## API & Integrations (CRM → API & Integrations)

Owners and admins can connect services for lead automation. Sales and viewers don't see the tab, and RLS blocks them anyway.

| Category | Providers | What a selected event does |
|---|---|---|
| Email | Brevo, Resend, SendGrid | Emails **your team** (the "Send notifications to" addresses). Leads are never emailed automatically. |
| Messaging | WhatsApp · Wati, SMS · Twilio | Sends the lead your approved WhatsApp template / your SMS text. Nothing is sent until a template / message is set. |
| Automation | Webhook (any number; Zapier / Make compatible) | POSTs the lead as JSON. Optional `X-VILMS-Signature: sha256=HMAC(body)` with your signing secret. |
| Analytics | Google Analytics, Meta Pixel | Loads the tag on the website (env vars take precedence). With an API secret / access token, also sends a server-side lead event. |

Events: **New lead**, **Lead status changed**, **Demo scheduled**, **Trial started**, **Lead converted**. An automation runs only when the integration is **enabled**, its **connection test passed** (status *Connected*), and that **event is ticked**. New-lead automations run after the visitor's response (`after()`), so they never slow down or break the form. Every run, test and disconnect is written to *Activity / Logs*.

**How credentials are protected**

- The browser sends a credential once, to a server action. The server encrypts it with AES-256-GCM (`INTEGRATIONS_ENCRYPTION_KEY`) and stores only ciphertext, in `private.integration_secrets`. That schema isn't exposed by the API and no role has table grants on it.
- The CRM only ever sees a hint (`••••1a2b`). Credential fields are never pre-filled; leaving one blank keeps the saved value.
- `public.integrations.config` holds non-secret settings only. Logs hold short summaries such as `HTTP 401 · Key not found`; provider responses are scrubbed of any saved credential value.
- Outbound calls are HTTPS-only, don't follow redirects, refuse private/internal hosts, and time out after 10 s.
- Automations without a user session use secret-gated database functions (`integration_dispatch_targets`, `integration_log_event`, `site_analytics_ids`), the same pattern as lead ingest.
- (Supabase Vault was considered. App-level encryption was chosen so that even an admin calling the database directly only ever gets ciphertext.)

**Add a provider:** add an entry to `PROVIDERS` in `lib/integrations/catalog.ts` (fields, which are secret, which events it supports), and an adapter with `test` (and optionally `deliver`) in `lib/integrations/adapters.ts`. The CRM UI, storage, encryption, logging and dispatch need no changes.

**Test it:** in the CRM, open *API & Integrations* → *Add webhook*. Use a test receiver URL (e.g. a Zapier/Make catch hook, or https://httpbin.org/post), tick *New lead*, enable it, then *Save & test connection*. Submit the website form; a *New lead · Success* row appears in Activity / Logs. Change that lead's status to *Converted* to see *Lead status changed* and *Lead converted*. *Disconnect* deletes the integration and its encrypted credentials.

## Tracking

First-party only. A random visitor id (localStorage), a session id (sessionStorage), first/last-touch UTM + click-id attribution. Events: `page_view`, `cta_click`, `pricing_view`, `feature_view`, `demo_form_open`, `demo_form_submit`, `trial_click`, sent with `sendBeacon` to `/api/track`. No fingerprinting. GPC / Do Not Track → no events stored (their form submissions still carry the UTM tags of the page they're on).

To tag a campaign: `https://your-site/?utm_source=google&utm_medium=cpc&utm_campaign=jee-batch-oct`. Google `gclid` / Meta `fbclid` are captured automatically.

## Deploy (Vercel)

1. Import the repo as a Vercel project (framework: Next.js, no build overrides).
2. Add every variable from the table above for **Production** (and Preview if you use it). `LEAD_INGEST_SECRET` and `TURNSTILE_SECRET_KEY` must not be prefixed `NEXT_PUBLIC_`.
3. Set `NEXT_PUBLIC_SITE_URL` to the real domain.
4. Deploy, then submit a test lead, check it appears in `/crm`, and delete it (Lead → Housekeeping → Delete).

## CSV export

Admins/owner can export the current filtered list. Cells beginning with `=`, `+`, `-`, `@` are prefixed with `'` so spreadsheets don't run them as formulas — that's why phone numbers appear as `'+91…`.
