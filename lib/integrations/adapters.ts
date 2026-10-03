import "server-only";
import { createHash, createHmac, randomUUID } from "crypto";
import { SITE_URL } from "@/lib/env";
import type { IntegrationEvent } from "./catalog";

// Provider adapters: one small object per provider with `test` (verify the
// credentials against the provider's API) and optionally `deliver` (act on a
// lead event). Nothing here ever returns or logs a credential.

export type LeadPayload = {
  id: string;
  full_name: string;
  institute_name: string;
  email: string;
  phone: string;
  city: string;
  institute_type: string;
  student_count: string;
  interest: string;
  status: string;
  previous_status?: string | null;
  channel: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  visitor_id: string | null;
  created_at: string;
};

export type Ctx = { config: Record<string, string>; secrets: Record<string, string> };
export type Result = { ok: boolean; summary: string; skipped?: boolean };
type Adapter = {
  test: (ctx: Ctx) => Promise<Result>;
  deliver?: (ctx: Ctx, event: IntegrationEvent, lead: LeadPayload) => Promise<Result>;
};

/* ------------------------------------------------------------------ */
/* Safe outbound HTTP                                                  */
/* ------------------------------------------------------------------ */

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|.*\.localhost|0\.0\.0\.0|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|169\.254\.\d+\.\d+|\[?::1\]?|\[?f[cd][0-9a-f]{2}:.*)$/i;

/** HTTPS only, and never to private/internal addresses (basic SSRF guard). */
export function safeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("Enter a valid URL");
  }
  if (url.protocol !== "https:") throw new Error("Only https:// URLs are allowed");
  if (PRIVATE_HOST.test(url.hostname)) throw new Error("Private or internal addresses are not allowed");
  if (url.username || url.password) throw new Error("Put credentials in the secret field, not the URL");
  return url;
}

function redact(text: string, secrets: Record<string, string>) {
  let out = text;
  for (const v of Object.values(secrets)) if (v && v.length >= 4) out = out.split(v).join("[redacted]");
  return out;
}

async function call(url: string, init: RequestInit, secrets: Record<string, string>): Promise<{ res: Response | null; body: string; error?: string }> {
  try {
    const res = await fetch(url, { ...init, redirect: "manual", signal: AbortSignal.timeout(10_000), cache: "no-store" });
    const body = (await res.text().catch(() => "")).slice(0, 4000);
    return { res, body };
  } catch (err) {
    const msg = err instanceof Error && err.name === "TimeoutError" ? "Timed out after 10s" : "Could not reach the provider";
    return { res: null, body: "", error: redact(msg, secrets) };
  }
}

/** "HTTP 401 · Key not found" — short, useful, never contains a credential. */
function summarize(res: Response | null, body: string, secrets: Record<string, string>, error?: string) {
  if (!res) return error ?? "No response";
  let detail = "";
  try {
    const j = JSON.parse(body) as Record<string, unknown>;
    const pick = j.message ?? j.error ?? j.detail ?? j.info ?? (Array.isArray(j.errors) ? (j.errors[0] as { message?: string })?.message : undefined);
    detail = typeof pick === "string" ? pick : typeof pick === "object" && pick ? JSON.stringify(pick) : "";
  } catch {
    detail = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return redact(`HTTP ${res.status}${detail ? ` · ${detail.slice(0, 160)}` : ""}`, secrets);
}

const done = (ok: boolean, summary: string): Result => ({ ok, summary });
const skip = (summary: string): Result => ({ ok: true, skipped: true, summary });

/* ------------------------------------------------------------------ */
/* Message content                                                     */
/* ------------------------------------------------------------------ */

const EVENT_TITLE: Record<IntegrationEvent, string> = {
  new_lead: "New lead",
  status_changed: "Lead status changed",
  demo_scheduled: "Demo scheduled",
  trial_started: "Trial started",
  converted: "Lead converted",
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? "";

function emailContent(event: IntegrationEvent, lead: LeadPayload) {
  const subject = `${EVENT_TITLE[event]}: ${lead.full_name} (${lead.institute_name})`;
  const rows: [string, string][] = [
    ["Name", lead.full_name],
    ["Institute", lead.institute_name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["City", lead.city],
    ["Students", lead.student_count],
    ["Interested in", lead.interest],
    ["Status", lead.previous_status ? `${lead.previous_status} → ${lead.status}` : lead.status],
    ["Source", [lead.channel, lead.campaign].filter(Boolean).join(" · ") || "—"],
  ];
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0b1020">
<h2 style="margin:0 0 12px">${esc(subject)}</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="color:#5b6478">${esc(k)}</td><td><b>${esc(v || "—")}</b></td></tr>`).join("")}</table>
<p><a href="${esc(`${SITE_URL}/crm/leads/${lead.id}`)}">Open in the VILMS CRM</a></p></div>`;
  return { subject, html };
}

const recipients = (config: Record<string, string>) =>
  (config.notify_emails ?? "")
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))
    .slice(0, 10);

const fill = (tpl: string, lead: LeadPayload) => tpl.replace(/\{\{\s*name\s*\}\}/g, firstName(lead.full_name)).replace(/\{\{\s*institute\s*\}\}/g, lead.institute_name);
const sha256 = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

/* ------------------------------------------------------------------ */
/* Adapters                                                            */
/* ------------------------------------------------------------------ */

const brevo: Adapter = {
  async test({ secrets }) {
    const { res, body, error } = await call("https://api.brevo.com/v3/account", { headers: { "api-key": secrets.api_key ?? "", accept: "application/json" } }, secrets);
    return res?.ok ? done(true, "Brevo account verified") : done(false, summarize(res, body, secrets, error));
  },
  async deliver({ config, secrets }, event, lead) {
    const to = recipients(config);
    if (!to.length) return skip("No notification address set");
    const { subject, html } = emailContent(event, lead);
    const { res, body, error } = await call(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: { "api-key": secrets.api_key ?? "", "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender: { name: config.sender_name, email: config.sender_email }, to: to.map((email) => ({ email })), subject, htmlContent: html }),
      },
      secrets,
    );
    return res?.ok ? done(true, `Email sent to ${to.length} recipient(s)`) : done(false, summarize(res, body, secrets, error));
  },
};

const resend: Adapter = {
  async test({ secrets }) {
    const { res, body, error } = await call("https://api.resend.com/domains", { headers: { authorization: `Bearer ${secrets.api_key ?? ""}` } }, secrets);
    if (res?.ok) return done(true, "Resend API key verified");
    // Sending-only keys can't list domains, but they are valid keys.
    if (res?.status === 401 && body.includes("restricted_api_key")) return done(true, "Resend sending key verified");
    return done(false, summarize(res, body, secrets, error));
  },
  async deliver({ config, secrets }, event, lead) {
    const to = recipients(config);
    if (!to.length) return skip("No notification address set");
    const { subject, html } = emailContent(event, lead);
    const { res, body, error } = await call(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: { authorization: `Bearer ${secrets.api_key ?? ""}`, "content-type": "application/json" },
        body: JSON.stringify({ from: `${config.sender_name} <${config.sender_email}>`, to, subject, html }),
      },
      secrets,
    );
    return res?.ok ? done(true, `Email sent to ${to.length} recipient(s)`) : done(false, summarize(res, body, secrets, error));
  },
};

const sendgrid: Adapter = {
  async test({ secrets }) {
    const { res, body, error } = await call("https://api.sendgrid.com/v3/scopes", { headers: { authorization: `Bearer ${secrets.api_key ?? ""}` } }, secrets);
    return res?.ok ? done(true, "SendGrid API key verified") : done(false, summarize(res, body, secrets, error));
  },
  async deliver({ config, secrets }, event, lead) {
    const to = recipients(config);
    if (!to.length) return skip("No notification address set");
    const { subject, html } = emailContent(event, lead);
    const { res, body, error } = await call(
      "https://api.sendgrid.com/v3/mail/send",
      {
        method: "POST",
        headers: { authorization: `Bearer ${secrets.api_key ?? ""}`, "content-type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: to.map((email) => ({ email })) }],
          from: { email: config.sender_email, name: config.sender_name },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      },
      secrets,
    );
    return res?.ok ? done(true, `Email sent to ${to.length} recipient(s)`) : done(false, summarize(res, body, secrets, error));
  },
};

const watiAuth = (token = "") => `Bearer ${token.replace(/^Bearer\s+/i, "")}`;
const wati: Adapter = {
  async test({ config, secrets }) {
    const base = safeUrl(config.api_endpoint ?? "").toString().replace(/\/$/, "");
    const { res, body, error } = await call(`${base}/api/v1/getContacts?pageSize=1&pageNumber=1`, { headers: { authorization: watiAuth(secrets.api_token) } }, secrets);
    return res?.ok ? done(true, "Wati API verified") : done(false, summarize(res, body, secrets, error));
  },
  async deliver({ config, secrets }, _event, lead) {
    if (!config.template_name) return skip("No WhatsApp template set");
    const base = safeUrl(config.api_endpoint ?? "").toString().replace(/\/$/, "");
    const number = lead.phone.replace(/\D/g, "");
    const { res, body, error } = await call(
      `${base}/api/v1/sendTemplateMessage?whatsappNumber=${encodeURIComponent(number)}`,
      {
        method: "POST",
        headers: { authorization: watiAuth(secrets.api_token), "content-type": "application/json" },
        body: JSON.stringify({
          template_name: config.template_name,
          broadcast_name: config.broadcast_name || "vilms_leads",
          parameters: [{ name: "name", value: firstName(lead.full_name) }],
        }),
      },
      secrets,
    );
    const rejected = body.includes('"result":false');
    return res?.ok && !rejected ? done(true, "WhatsApp template sent") : done(false, summarize(res, body, secrets, error));
  },
};

const twilioAuth = (c: Ctx) => `Basic ${Buffer.from(`${c.config.account_sid}:${c.secrets.auth_token ?? ""}`).toString("base64")}`;
const twilio_sms: Adapter = {
  async test(ctx) {
    const sid = encodeURIComponent(ctx.config.account_sid ?? "");
    const { res, body, error } = await call(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, { headers: { authorization: twilioAuth(ctx) } }, ctx.secrets);
    return res?.ok ? done(true, "Twilio account verified") : done(false, summarize(res, body, ctx.secrets, error));
  },
  async deliver(ctx, _event, lead) {
    if (!ctx.config.message) return skip("No SMS message set");
    const sid = encodeURIComponent(ctx.config.account_sid ?? "");
    const { res, body, error } = await call(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: { authorization: twilioAuth(ctx), "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ To: lead.phone, From: ctx.config.from_number ?? "", Body: fill(ctx.config.message, lead).slice(0, 640) }),
      },
      ctx.secrets,
    );
    return res?.ok ? done(true, "SMS sent") : done(false, summarize(res, body, ctx.secrets, error));
  },
};

async function postWebhook({ config, secrets }: Ctx, event: string, payload: unknown): Promise<Result> {
  const url = safeUrl(config.url ?? "");
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": "VILMS-CRM-Webhook/1.0",
    "x-vilms-event": event,
    "x-vilms-delivery": randomUUID(),
  };
  if (secrets.secret) headers["x-vilms-signature"] = `sha256=${createHmac("sha256", secrets.secret).update(body).digest("hex")}`;
  const { res, body: resBody, error } = await call(url.toString(), { method: "POST", headers, body }, secrets);
  return res && res.status >= 200 && res.status < 300 ? done(true, `Delivered · HTTP ${res.status}`) : done(false, summarize(res, resBody, secrets, error));
}
const webhook: Adapter = {
  test: (ctx) => postWebhook(ctx, "test", { event: "test", sent_at: new Date().toISOString(), message: "Test delivery from the VILMS CRM" }),
  deliver: (ctx, event, lead) => postWebhook(ctx, event, { event, occurred_at: new Date().toISOString(), lead: { ...lead, crm_url: `${SITE_URL}/crm/leads/${lead.id}` } }),
};

const ga4: Adapter = {
  async test({ config, secrets }) {
    if (!/^G-[A-Z0-9]{4,15}$/.test(config.measurement_id ?? "")) return done(false, "Measurement ID should look like G-XXXXXXXXXX");
    if (!secrets.api_secret) return done(true, "Measurement ID looks valid (add an API secret to verify with Google)");
    const q = new URLSearchParams({ measurement_id: config.measurement_id, api_secret: secrets.api_secret });
    const { res, body, error } = await call(
      `https://www.google-analytics.com/debug/mp/collect?${q}`,
      { method: "POST", body: JSON.stringify({ client_id: "vilms-crm.test", events: [{ name: "generate_lead" }] }) },
      secrets,
    );
    const valid = res?.ok && !/"validationMessages"\s*:\s*\[\s*\{/.test(body);
    return valid ? done(true, "Google Analytics verified") : done(false, summarize(res, body, secrets, error));
  },
  async deliver({ config, secrets }, _event, lead) {
    if (!secrets.api_secret) return skip("No API secret — website tag only");
    const q = new URLSearchParams({ measurement_id: config.measurement_id, api_secret: secrets.api_secret });
    const { res, body, error } = await call(
      `https://www.google-analytics.com/mp/collect?${q}`,
      { method: "POST", body: JSON.stringify({ client_id: lead.visitor_id ?? lead.id, events: [{ name: "generate_lead", params: { lead_source: lead.channel ?? "direct" } }] }) },
      secrets,
    );
    return res?.ok ? done(true, "generate_lead recorded") : done(false, summarize(res, body, secrets, error));
  },
};

const GRAPH = "https://graph.facebook.com/v21.0";
const meta_pixel: Adapter = {
  async test({ config, secrets }) {
    if (!/^[0-9]{6,20}$/.test(config.pixel_id ?? "")) return done(false, "Pixel ID should be digits only");
    if (!secrets.access_token) return done(true, "Pixel ID looks valid (add an access token to verify with Meta)");
    const q = new URLSearchParams({ fields: "id,name", access_token: secrets.access_token });
    const { res, body, error } = await call(`${GRAPH}/${config.pixel_id}?${q}`, {}, secrets);
    return res?.ok ? done(true, "Meta Pixel verified") : done(false, summarize(res, body, secrets, error));
  },
  async deliver({ config, secrets }, _event, lead) {
    if (!secrets.access_token) return skip("No access token — website pixel only");
    const q = new URLSearchParams({ access_token: secrets.access_token });
    const { res, body, error } = await call(
      `${GRAPH}/${config.pixel_id}/events?${q}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              event_source_url: SITE_URL,
              event_id: lead.id,
              user_data: { em: [sha256(lead.email)], ph: [sha256(lead.phone.replace(/\D/g, ""))] },
            },
          ],
        }),
      },
      secrets,
    );
    return res?.ok ? done(true, "Lead event sent") : done(false, summarize(res, body, secrets, error));
  },
};

export const ADAPTERS: Record<string, Adapter> = { brevo, resend, sendgrid, wati, twilio_sms, webhook, ga4, meta_pixel };

/** Runs an adapter call, turning thrown validation errors into a failed result. */
export async function run(fn: () => Promise<Result>): Promise<Result> {
  try {
    return await fn();
  } catch (err) {
    return { ok: false, summary: err instanceof Error ? err.message.slice(0, 200) : "Unexpected error" };
  }
}
