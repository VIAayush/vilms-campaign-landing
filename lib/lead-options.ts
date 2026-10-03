// Every enum the form, the API, the database CHECK constraints and the CRM
// agree on. Change a value here and in supabase/migrations together.

export const INSTITUTE_TYPES = [
  { value: "coaching_institute", label: "Coaching Institute" },
  { value: "test_prep_centre", label: "Test Prep Centre" },
  { value: "skill_academy", label: "Skill Academy" },
  { value: "training_institute", label: "Training Institute" },
  { value: "school", label: "School" },
  { value: "college", label: "College" },
  { value: "online_academy", label: "Online Academy" },
  { value: "other", label: "Other" },
] as const;

export const STUDENT_COUNTS = [
  { value: "1-500", label: "1–500" },
  { value: "501-2000", label: "501–2,000" },
  { value: "2001-5000", label: "2,001–5,000" },
  { value: "5001-15000", label: "5,001–15,000" },
  { value: "15000+", label: "15,000+" },
] as const;

export const INTERESTS = [
  { value: "book_demo", label: "Book a Demo" },
  { value: "free_trial", label: "Start Free Trial" },
  { value: "pricing", label: "Pricing" },
  { value: "migration", label: "Migration" },
  { value: "white_label", label: "White-label Platform" },
  { value: "lead_crm", label: "Lead CRM" },
  { value: "other", label: "Other" },
] as const;

export const LEAD_STATUSES = [
  { value: "new", label: "New", tone: "info" },
  { value: "contacted", label: "Contacted", tone: "neutral" },
  { value: "demo_scheduled", label: "Demo Scheduled", tone: "brass" },
  { value: "demo_completed", label: "Demo Completed", tone: "brass" },
  { value: "follow_up", label: "Follow-up", tone: "warn" },
  { value: "interested", label: "Interested", tone: "ok" },
  { value: "trial_started", label: "Trial Started", tone: "ok" },
  { value: "converted", label: "Converted", tone: "okStrong" },
  { value: "not_interested", label: "Not Interested", tone: "muted" },
  { value: "closed", label: "Closed", tone: "muted" },
] as const;

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export const CRM_ROLES = [
  { value: "owner", label: "Owner", description: "Everything, including the team." },
  { value: "admin", label: "Admin", description: "All leads and analytics, can delete leads." },
  { value: "sales", label: "Sales", description: "Work leads: status, notes, follow-ups, contact." },
  { value: "viewer", label: "Viewer", description: "Read-only access to leads and analytics." },
] as const;

// Where a lead came from, derived from UTM tags / click ids / referrer.
export const CHANNELS = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  linkedin_ads: "LinkedIn Ads",
  other_paid: "Other paid",
  linkedin: "LinkedIn (organic)",
  organic_search: "Organic search",
  social: "Social (organic)",
  email: "Email",
  referral: "Referral",
  campaign: "Tagged campaign",
  direct: "Direct",
} as const;

export type InstituteType = (typeof INSTITUTE_TYPES)[number]["value"];
export type StudentCount = (typeof STUDENT_COUNTS)[number]["value"];
export type Interest = (typeof INTERESTS)[number]["value"];
export type LeadStatus = (typeof LEAD_STATUSES)[number]["value"];
export type Priority = (typeof PRIORITIES)[number]["value"];
export type CrmRole = (typeof CRM_ROLES)[number]["value"];
export type Channel = keyof typeof CHANNELS;

export const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((o) => o.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

function labelFrom(list: readonly { value: string; label: string }[], v: string | null | undefined) {
  return list.find((o) => o.value === v)?.label ?? v ?? "—";
}

export const instituteTypeLabel = (v?: string | null) => labelFrom(INSTITUTE_TYPES, v);
export const studentCountLabel = (v?: string | null) => labelFrom(STUDENT_COUNTS, v);
export const interestLabel = (v?: string | null) => labelFrom(INTERESTS, v);
export const statusLabel = (v?: string | null) => labelFrom(LEAD_STATUSES, v);
export const priorityLabel = (v?: string | null) => labelFrom(PRIORITIES, v);
export const roleLabel = (v?: string | null) => labelFrom(CRM_ROLES, v);
export const channelLabel = (v?: string | null) =>
  (v && v in CHANNELS ? CHANNELS[v as Channel] : v) ?? "—";

// Leads in these states are finished; follow-up reminders stop applying.
export const CLOSED_STATUSES: LeadStatus[] = ["converted", "not_interested", "closed"];
