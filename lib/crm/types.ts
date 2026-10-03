export type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  institute_name: string;
  email: string;
  phone: string;
  city: string;
  institute_type: string;
  student_count: string;
  website: string | null;
  current_lms: string | null;
  interest: string;
  message: string | null;
  consent_at: string;
  status: string;
  max_stage: number;
  priority: string;
  assigned_to: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  is_spam: boolean;
  channel: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
  gclid: string | null;
  fbclid: string | null;
  landing_page: string | null;
  referrer: string | null;
  form_location: string | null;
  first_visit_at: string | null;
  visitor_id: string | null;
  user_agent: string | null;
  submit_count: number;
  last_submitted_at: string;
};

/** Columns a list row needs — keeps list queries small. */
export const LEAD_ROW_COLUMNS =
  "id, created_at, full_name, institute_name, email, phone, city, institute_type, student_count, interest, status, priority, assigned_to, last_contacted_at, next_follow_up_at, channel, campaign, submit_count";

export type LeadRow = Pick<
  Lead,
  | "id"
  | "created_at"
  | "full_name"
  | "institute_name"
  | "email"
  | "phone"
  | "city"
  | "institute_type"
  | "student_count"
  | "interest"
  | "status"
  | "priority"
  | "assigned_to"
  | "last_contacted_at"
  | "next_follow_up_at"
  | "channel"
  | "campaign"
  | "submit_count"
>;

export type Activity = {
  id: string;
  created_at: string;
  actor_id: string | null;
  type: string;
  body: string | null;
  meta: Record<string, unknown>;
};

export type TeamMember = { id: string; email: string; full_name: string; role: string; is_active: boolean };

export type Dashboard = {
  total: number;
  new: number;
  today: number;
  this_week: number;
  demo_requests: number;
  demo_requests_waiting: number;
  trials_started: number;
  converted: number;
  follow_ups_due: number;
  overdue: number;
  spam: number;
};

export type Bucket = { key: string | null; count: number };

export type Analytics = {
  from: string;
  days: number;
  leads_by_day: { day: string; count: number }[];
  by_channel: Bucket[];
  by_source: Bucket[];
  by_campaign: Bucket[];
  by_institute_type: Bucket[];
  by_student_count: Bucket[];
  by_status: Bucket[];
  by_interest: Bucket[];
  demo_requests: number;
  events: Record<string, number>;
  funnel: {
    visitors: number;
    cta_clicks: number;
    forms_opened: number;
    leads: number;
    leads_tracked: number;
    contacted: number;
    demo_scheduled: number;
    trial_started: number;
    converted: number;
  };
};
