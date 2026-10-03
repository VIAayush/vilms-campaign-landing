import "server-only";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import { ingestClient, ingestSecret } from "@/lib/server/ingest";
import { ADAPTERS, run, type LeadPayload } from "./adapters";
import type { IntegrationEvent } from "./catalog";
import { decryptSecrets } from "./crypto";

type Target = { id: string; provider: string; name: string; config: Record<string, string>; ciphertext: string | null };

async function log(integration: string | null, event: string, status: "success" | "failed" | "skipped", summary: string, lead: string | null) {
  const { error } = await ingestClient().rpc("integration_log_event", {
    p_secret: ingestSecret(),
    p_integration: integration,
    p_event: event,
    p_status: status,
    p_summary: summary.slice(0, 500),
    p_lead: lead,
    p_metadata: {},
  });
  if (error) console.error("[integrations] log failed", error.message);
}

/**
 * Sends a lead event to every integration that is enabled, verified
 * (status "connected") and subscribed to that event. Never throws: an
 * automation failure must not break lead capture or the CRM. Run it after the
 * response with `after()`.
 */
export async function dispatchLeadEvents(events: IntegrationEvent[], lead: LeadPayload) {
  for (const event of events) {
    try {
      const { data, error } = await ingestClient().rpc("integration_dispatch_targets", { p_secret: ingestSecret(), p_event: event });
      if (error) throw new Error(error.message);
      const targets = (data ?? []) as Target[];
      await Promise.allSettled(
        targets.map(async (t) => {
          const adapter = ADAPTERS[t.provider];
          if (!adapter?.deliver) return log(t.id, event, "skipped", "This provider has no automation for lead events", lead.id);
          let secrets: Record<string, string>;
          try {
            secrets = decryptSecrets(t.ciphertext);
          } catch {
            return log(t.id, event, "failed", "Could not decrypt the saved credentials (check INTEGRATIONS_ENCRYPTION_KEY)", lead.id);
          }
          const result = await run(() => adapter.deliver!({ config: t.config ?? {}, secrets }, event, lead));
          await log(t.id, event, result.skipped ? "skipped" : result.ok ? "success" : "failed", result.summary, lead.id);
        }),
      );
    } catch (err) {
      console.error("[integrations] dispatch failed", event, err instanceof Error ? err.message : err);
    }
  }
}

/** Lead status → the extra integration events it triggers. */
export function eventsForStatusChange(previous: string, next: string): IntegrationEvent[] {
  if (previous === next) return [];
  const extra: Partial<Record<string, IntegrationEvent>> = { demo_scheduled: "demo_scheduled", trial_started: "trial_started", converted: "converted" };
  return ["status_changed", ...(extra[next] ? [extra[next]!] : [])];
}

/**
 * Public GA4 / Meta Pixel IDs configured in the CRM, for the website tag.
 * Cached for 5 minutes; on any problem the site simply loads no tag.
 */
export async function getSiteAnalyticsIds(): Promise<{ ga4?: string; pixel?: string }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !process.env.LEAD_INGEST_SECRET) return {};
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/site_analytics_ids`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${SUPABASE_ANON_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ p_secret: ingestSecret() }),
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return {};
    const ids = (await res.json()) as { ga4?: string; pixel?: string };
    return {
      ga4: /^G-[A-Z0-9]{4,15}$/.test(ids.ga4 ?? "") ? ids.ga4 : undefined,
      pixel: /^[0-9]{6,20}$/.test(ids.pixel ?? "") ? ids.pixel : undefined,
    };
  } catch {
    return {};
  }
}
