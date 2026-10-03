import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { leadSubmissionSchema } from "@/lib/lead-schema";
import { normalizePhone } from "@/lib/phone";
import { deriveChannel } from "@/lib/channel";
import { SITE_URL } from "@/lib/env";
import { ingestLead, ipHash } from "@/lib/server/ingest";
import { verifyCaptcha } from "@/lib/server/captcha";

// Faster than any person fills seven required fields.
const MIN_FILL_MS = 2500;

const ok = () => NextResponse.json({ ok: true });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = leadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", fields: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // Bots: answer exactly like a success so they learn nothing, store nothing.
  if (data.company_fax) return ok();
  if (data.elapsed_ms !== undefined && data.elapsed_ms < MIN_FILL_MS) return ok();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  if (!(await verifyCaptcha(data.turnstile_token, ip))) {
    return NextResponse.json({ ok: false, error: "Please complete the verification and try again." }, { status: 400 });
  }

  const phone = normalizePhone(data.phone);
  if (!phone) {
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", fields: { phone: ["Enter a valid phone number"] } },
      { status: 422 },
    );
  }

  const a = data.attribution ?? {};
  const siteHost = (() => {
    try {
      return new URL(SITE_URL).hostname;
    } catch {
      return undefined;
    }
  })();

  try {
    const result = await ingestLead(ipHash(req.headers), {
      submission_id: data.submission_id,
      full_name: data.full_name,
      institute_name: data.institute_name,
      email: data.email.toLowerCase(),
      phone,
      city: data.city,
      institute_type: data.institute_type,
      student_count: data.student_count,
      website: data.website || null,
      current_lms: data.current_lms || null,
      interest: data.interest,
      message: data.message || null,
      consent: "true",
      channel: deriveChannel({ ...a, siteHost }),
      source: a.source ?? null,
      medium: a.medium ?? null,
      campaign: a.campaign ?? null,
      term: a.term ?? null,
      content: a.content ?? null,
      gclid: a.gclid ?? null,
      fbclid: a.fbclid ?? null,
      landing_page: a.landing_page ?? null,
      referrer: a.referrer ?? null,
      first_visit_at: a.first_visit_at ?? null,
      visitor_id: a.visitor_id ?? null,
      form_location: data.form_location ?? null,
      user_agent: req.headers.get("user-agent")?.slice(0, 400) ?? null,
    });

    if (result.status === "rate_limited") {
      return NextResponse.json(
        { ok: false, error: "We've received several requests from your connection. Please try again in a few minutes." },
        { status: 429 },
      );
    }
    return ok();
  } catch (err) {
    console.error("[api/leads]", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong on our side. Please try again, or email hello@vilms.in." },
      { status: 500 },
    );
  }
}
