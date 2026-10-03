import { NextResponse, type NextRequest } from "next/server";
import { trackPayloadSchema } from "@/lib/lead-schema";
import { deriveChannel } from "@/lib/channel";
import { SITE_URL } from "@/lib/env";
import { ingestEvents, ipHash, isLikelyBot } from "@/lib/server/ingest";

// First-party analytics. Always answers 204 so tracking can never break the
// page, and never reveals whether an event was stored.
export async function POST(req: NextRequest) {
  const done = () => new NextResponse(null, { status: 204 });
  if (isLikelyBot(req.headers.get("user-agent"))) return done();
  // Honour browser privacy signals.
  if (req.headers.get("sec-gpc") === "1" || req.headers.get("dnt") === "1") return done();

  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return done();
  }
  const parsed = trackPayloadSchema.safeParse(body);
  if (!parsed.success) return done();

  const { visitor, events } = parsed.data;
  let siteHost: string | undefined;
  try {
    siteHost = new URL(SITE_URL).hostname;
  } catch {}
  const channel = deriveChannel({ ...visitor, siteHost });

  try {
    await ingestEvents(
      ipHash(req.headers),
      {
        id: visitor.id,
        landing_page: visitor.landing_page,
        referrer: visitor.referrer,
        channel,
        source: visitor.source,
        medium: visitor.medium,
        campaign: visitor.campaign,
      },
      events.map((e) => ({
        ...e,
        channel,
        source: visitor.source ?? null,
        medium: visitor.medium ?? null,
        campaign: visitor.campaign ?? null,
      })),
    );
  } catch (err) {
    console.error("[api/track]", err);
  }
  return done();
}
