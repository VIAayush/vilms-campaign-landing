import "server-only";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

export function ingestSecret(): string {
  const secret = process.env.LEAD_INGEST_SECRET;
  if (!secret) throw new Error("LEAD_INGEST_SECRET is not set");
  return secret;
}

// A sessionless client: the ingest functions are authorised by the shared
// secret, never by a user session or the service-role key.
export function ingestClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client IP, hashed with a server secret so raw IPs are never stored. */
export function ipHash(headers: Headers): string {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  return createHmac("sha256", ingestSecret()).update(`ip:${ip}`).digest("hex").slice(0, 32);
}

export type IngestLeadResult =
  | { status: "created" | "merged" | "duplicate_submission"; lead_id: string }
  | { status: "rate_limited" };

export async function ingestLead(ip: string, lead: Record<string, unknown>): Promise<IngestLeadResult> {
  const { data, error } = await ingestClient().rpc("ingest_lead", {
    p_secret: ingestSecret(),
    p_ip_hash: ip,
    p_lead: lead,
  });
  if (error) throw new Error(`ingest_lead failed: ${error.message}`);
  return data as IngestLeadResult;
}

export async function ingestEvents(ip: string, visitor: Record<string, unknown>, events: Record<string, unknown>[]) {
  const { data, error } = await ingestClient().rpc("ingest_events", {
    p_secret: ingestSecret(),
    p_ip_hash: ip,
    p_visitor: visitor,
    p_events: events,
  });
  if (error) throw new Error(`ingest_events failed: ${error.message}`);
  return data as number;
}

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|curl|wget|python-requests|httpclient/i;
export const isLikelyBot = (ua: string | null) => !ua || BOT_UA.test(ua);
