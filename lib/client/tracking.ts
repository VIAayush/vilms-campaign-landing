"use client";

import type { EventName } from "@/lib/lead-schema";

// Lightweight first-party tracking:
//   * a random visitor id (no fingerprinting, no third-party cookies)
//   * first-touch and last-touch attribution from UTM tags / ad click ids
//   * page and CTA events, batched to /api/track with sendBeacon
// Browsers sending Global Privacy Control or Do Not Track are not tracked;
// their form submissions still carry the UTM tags of the page they're on.

const VISITOR_KEY = "vilms_vid";
const FIRST_KEY = "vilms_first_touch";
const LAST_KEY = "vilms_last_touch";
const SESSION_KEY = "vilms_sid";
const LAST_TOUCH_DAYS = 30;

type Touch = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  at?: string;
};

export type Attribution = Omit<Touch, "at"> & {
  first_visit_at?: string | null;
  visitor_id?: string | null;
};

const memory = new Map<string, string>();

function store(kind: "local" | "session") {
  try {
    const s = kind === "local" ? window.localStorage : window.sessionStorage;
    const probe = "__vilms";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

function read(key: string, kind: "local" | "session" = "local"): string | null {
  return store(kind)?.getItem(key) ?? memory.get(key) ?? null;
}

function write(key: string, value: string, kind: "local" | "session" = "local") {
  const s = store(kind);
  if (s) s.setItem(key, value);
  else memory.set(key, value);
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // RFC 4122 v4 fallback for very old browsers.
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
  );
}

export function privacyOptOut(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || navigator.doNotTrack === "1";
}

const clip = (v: string | null, n: number) => (v ? v.slice(0, n) : null);

function externalReferrer(): string | null {
  if (!document.referrer) return null;
  try {
    const ref = new URL(document.referrer);
    return ref.host === window.location.host ? null : clip(`${ref.origin}${ref.pathname}`, 300);
  } catch {
    return null;
  }
}

function touchFromUrl(): Touch {
  const p = new URLSearchParams(window.location.search);
  return {
    source: clip(p.get("utm_source"), 120),
    medium: clip(p.get("utm_medium"), 120),
    campaign: clip(p.get("utm_campaign"), 200),
    term: clip(p.get("utm_term"), 200),
    content: clip(p.get("utm_content"), 200),
    gclid: clip(p.get("gclid"), 300),
    fbclid: clip(p.get("fbclid"), 300),
    landing_page: clip(window.location.pathname, 300),
    referrer: externalReferrer(),
    at: new Date().toISOString(),
  };
}

const hasCampaign = (t: Touch) => Boolean(t.source || t.medium || t.campaign || t.gclid || t.fbclid);

function parse(raw: string | null): Touch | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Touch;
  } catch {
    return null;
  }
}

/** Records first/last touch for this page view. Call once per navigation. */
export function captureTouch(): void {
  if (typeof window === "undefined") return;
  const current = touchFromUrl();
  const optOut = privacyOptOut();
  const kind = optOut ? "session" : "local";

  if (!parse(read(FIRST_KEY, kind))) write(FIRST_KEY, JSON.stringify(current), kind);
  if (hasCampaign(current)) write(LAST_KEY, JSON.stringify(current), kind);
}

/** Attribution to attach to a lead submission. */
export function getAttribution(): Attribution {
  const optOut = privacyOptOut();
  const kind = optOut ? "session" : "local";
  const first = parse(read(FIRST_KEY, kind)) ?? touchFromUrl();
  let last = parse(read(LAST_KEY, kind));
  if (last?.at && Date.now() - new Date(last.at).getTime() > LAST_TOUCH_DAYS * 86_400_000) last = null;

  // The campaign that brought them most recently wins; the first visit keeps
  // its landing page, referrer and timestamp.
  const touch = last && hasCampaign(last) ? last : first;
  return {
    source: touch.source ?? null,
    medium: touch.medium ?? null,
    campaign: touch.campaign ?? null,
    term: touch.term ?? null,
    content: touch.content ?? null,
    gclid: touch.gclid ?? null,
    fbclid: touch.fbclid ?? null,
    landing_page: first.landing_page ?? null,
    referrer: first.referrer ?? touch.referrer ?? null,
    first_visit_at: first.at ?? null,
    visitor_id: optOut ? null : getVisitorId(),
  };
}

export function getVisitorId(): string {
  let id = read(VISITOR_KEY);
  if (!id) {
    id = uuid();
    write(VISITOR_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  let id = read(SESSION_KEY, "session");
  if (!id) {
    id = uuid();
    write(SESSION_KEY, id, "session");
  }
  return id;
}

type QueuedEvent = { name: EventName; label?: string | null; path: string; session_id: string };
const queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  timer = null;
  if (!queue.length) return;
  const events = queue.splice(0, 25);
  const first = parse(read(FIRST_KEY)) ?? touchFromUrl();
  const last = parse(read(LAST_KEY));
  const touch = last && hasCampaign(last) ? last : first;
  const body = JSON.stringify({
    visitor: {
      id: getVisitorId(),
      landing_page: first.landing_page ?? null,
      referrer: first.referrer ?? null,
      source: touch.source ?? null,
      medium: touch.medium ?? null,
      campaign: touch.campaign ?? null,
      gclid: touch.gclid ?? null,
      fbclid: touch.fbclid ?? null,
    },
    events,
  });
  const sent =
    typeof navigator !== "undefined" &&
    "sendBeacon" in navigator &&
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  if (!sent) {
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(
      () => undefined,
    );
  }
  if (queue.length) flush();
}

type GtagFn = (...args: unknown[]) => void;

/** Records an event first-party, and mirrors it to GA4 / Meta Pixel when configured. */
export function track(name: EventName, label?: string | null) {
  if (typeof window === "undefined" || privacyOptOut()) return;

  queue.push({ name, label: label ? label.slice(0, 120) : null, path: window.location.pathname.slice(0, 300), session_id: getSessionId() });
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, name === "page_view" ? 0 : 400);

  const w = window as Window & { gtag?: GtagFn; fbq?: GtagFn };
  if (name !== "page_view") w.gtag?.("event", name, { event_label: label ?? undefined });
  if (name === "demo_form_submit") w.fbq?.("track", "Lead");
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => flush());
}
