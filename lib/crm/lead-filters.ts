import "server-only";
import { istDayStart } from "@/lib/crm/format";
import { CHANNELS, CLOSED_STATUSES, INSTITUTE_TYPES, INTERESTS, LEAD_STATUSES, PRIORITIES, STUDENT_COUNTS } from "@/lib/lead-options";

export type LeadFilters = {
  q: string;
  status: string;
  channel: string;
  institute_type: string;
  student_count: string;
  interest: string;
  priority: string;
  assigned: string;
  from: string;
  to: string;
  follow_up: string;
  campaign: string;
  spam: string;
  sort: string;
  page: number;
};

const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const oneOf = (v: string, allowed: readonly string[]) => (allowed.includes(v) ? v : "");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "follow_up", label: "Follow-up date" },
  { value: "updated", label: "Recently updated" },
] as const;

/** Untrusted query string → a clean, whitelisted filter set. */
export function parseLeadFilters(sp: Record<string, string | string[] | undefined>): LeadFilters {
  const assigned = pick(sp.assigned);
  const page = Number.parseInt(pick(sp.page), 10);
  return {
    // Drop characters that have meaning in PostgREST filter syntax.
    q: pick(sp.q).replace(/[,()*%\\:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80),
    status: oneOf(pick(sp.status), LEAD_STATUSES.map((s) => s.value)),
    channel: oneOf(pick(sp.channel), Object.keys(CHANNELS)),
    institute_type: oneOf(pick(sp.institute_type), INSTITUTE_TYPES.map((s) => s.value)),
    student_count: oneOf(pick(sp.student_count), STUDENT_COUNTS.map((s) => s.value)),
    interest: oneOf(pick(sp.interest), INTERESTS.map((s) => s.value)),
    priority: oneOf(pick(sp.priority), PRIORITIES.map((s) => s.value)),
    assigned: assigned === "unassigned" || UUID.test(assigned) ? assigned : "",
    from: DAY.test(pick(sp.from)) ? pick(sp.from) : "",
    to: DAY.test(pick(sp.to)) ? pick(sp.to) : "",
    follow_up: oneOf(pick(sp.follow_up), ["due", "overdue", "scheduled", "none"]),
    campaign: pick(sp.campaign).replace(/[,()*%\\"']/g, "").trim().slice(0, 200),
    spam: pick(sp.spam) === "1" ? "1" : "",
    sort: oneOf(pick(sp.sort), SORTS.map((s) => s.value)) || "newest",
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1,
  };
}

/** Back to a query string, dropping defaults. `overrides` lets links tweak one value. */
export function filtersToQuery(f: LeadFilters, overrides: Partial<Record<keyof LeadFilters, string | number>> = {}) {
  const merged = { ...f, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === "" || v === undefined || v === null) continue;
    if (k === "sort" && v === "newest") continue;
    if (k === "page" && Number(v) === 1) continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function hasActiveFilters(f: LeadFilters) {
  return Boolean(
    f.q || f.status || f.channel || f.institute_type || f.student_count || f.interest || f.priority ||
      f.assigned || f.from || f.to || f.follow_up || f.campaign || f.spam,
  );
}

// The parts of the PostgREST builder used below. Typed loosely on purpose:
// matching supabase-js's deep generics here sends TypeScript into a loop, and
// every value passed in has already been whitelisted by parseLeadFilters.
type Builder = {
  eq(col: string, v: unknown): Builder;
  is(col: string, v: null | boolean): Builder;
  not(col: string, op: string, v: unknown): Builder;
  or(filters: string): Builder;
  gte(col: string, v: unknown): Builder;
  lt(col: string, v: unknown): Builder;
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }): Builder;
};

export function applyLeadFilters<T>(query: T, f: LeadFilters): T {
  return filter(query as unknown as Builder, f) as unknown as T;
}

function filter(query: Builder, f: LeadFilters): Builder {
  let q = query.eq("is_spam", f.spam === "1");
  if (f.q) {
    const term = `%${f.q}%`;
    const conditions = ["full_name", "institute_name", "email", "city", "campaign"].map((c) => `${c}.ilike.${term}`);
    // Phones are stored as +91XXXXXXXXXX, so match on digits ("98765 43210" works).
    const digits = f.q.replace(/\D/g, "");
    if (digits.length >= 4) conditions.push(`phone.ilike.%${digits}%`);
    q = q.or(conditions.join(","));
  }
  if (f.status) q = q.eq("status", f.status);
  if (f.channel) q = q.eq("channel", f.channel);
  if (f.institute_type) q = q.eq("institute_type", f.institute_type);
  if (f.student_count) q = q.eq("student_count", f.student_count);
  if (f.interest) q = q.eq("interest", f.interest);
  if (f.priority) q = q.eq("priority", f.priority);
  if (f.campaign) q = f.campaign === "(none)" ? q.is("campaign", null) : q.eq("campaign", f.campaign);
  if (f.assigned === "unassigned") q = q.is("assigned_to", null);
  else if (f.assigned) q = q.eq("assigned_to", f.assigned);
  if (f.from) q = q.gte("created_at", istDayStart(f.from));
  if (f.to) q = q.lt("created_at", new Date(new Date(istDayStart(f.to)!).getTime() + 86_400_000).toISOString());

  const open = `(${CLOSED_STATUSES.join(",")})`;
  if (f.follow_up === "due") {
    const tomorrow = new Date(new Date(istDayStart(new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10))!).getTime() + 86_400_000);
    q = q.lt("next_follow_up_at", tomorrow.toISOString()).not("status", "in", open);
  } else if (f.follow_up === "overdue") {
    q = q.lt("next_follow_up_at", new Date().toISOString()).not("status", "in", open);
  } else if (f.follow_up === "scheduled") {
    q = q.gte("next_follow_up_at", new Date().toISOString());
  } else if (f.follow_up === "none") {
    q = q.is("next_follow_up_at", null).not("status", "in", open);
  }

  switch (f.sort) {
    case "oldest":
      return q.order("created_at", { ascending: true });
    case "follow_up":
      return q.order("next_follow_up_at", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
    case "updated":
      return q.order("updated_at", { ascending: false });
    default:
      return q.order("created_at", { ascending: false });
  }
}
