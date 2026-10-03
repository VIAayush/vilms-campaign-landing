// The integration catalogue. Safe to import in the browser: it only describes
// providers (fields, events, copy). Credentials and network calls live in
// server-only modules (adapters.ts, crypto.ts, dispatch.ts).
//
// To add a provider: add an entry here and an adapter in adapters.ts.

export const INTEGRATION_EVENTS = [
  { id: "new_lead", label: "New lead", hint: "A new enquiry arrives from the website form." },
  { id: "status_changed", label: "Lead status changed", hint: "Any status change in the CRM." },
  { id: "demo_scheduled", label: "Demo scheduled", hint: "A lead moves to Demo Scheduled." },
  { id: "trial_started", label: "Trial started", hint: "A lead moves to Trial Started." },
  { id: "converted", label: "Lead converted", hint: "A lead moves to Converted." },
] as const;
export type IntegrationEvent = (typeof INTEGRATION_EVENTS)[number]["id"];

export const CATEGORIES = {
  email: { label: "Email", description: "Notify your team by email when leads arrive or move." },
  messaging: { label: "Messaging", description: "WhatsApp and SMS to leads, through your own accounts." },
  automation: { label: "Automation", description: "Send lead data to Zapier, Make or your own systems." },
  analytics: { label: "Analytics", description: "Website analytics and ad-conversion tracking." },
  other: { label: "Other", description: "" },
} as const;
export type Category = keyof typeof CATEGORIES;

export type FieldType = "text" | "email" | "url" | "tel" | "secret" | "textarea";
export type ProviderField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  pattern?: string; // validated server-side as a RegExp
};

export type ProviderDef = {
  id: string;
  name: string;
  category: Category;
  tagline: string;
  /** What happens on a selected event (shown above the event checkboxes). */
  action?: string;
  /** Which events this provider can act on (empty = none, e.g. site analytics only). */
  events: readonly IntegrationEvent[];
  /** Several instances allowed (webhooks). */
  multiple?: boolean;
  fields: ProviderField[];
  docs?: string;
};

const NOTIFY_FIELD: ProviderField = {
  key: "notify_emails",
  label: "Send notifications to",
  type: "text",
  placeholder: "sales@yourinstitute.in, owner@yourinstitute.in",
  help: "Your team's addresses, comma-separated. Leads are never emailed automatically.",
};
const SENDER_FIELDS: ProviderField[] = [
  { key: "sender_name", label: "Sender name", type: "text", required: true, placeholder: "VILMS" },
  { key: "sender_email", label: "Sender email", type: "email", required: true, placeholder: "hello@vilms.in", help: "Must be a sender verified with the provider." },
];
const ALL_EVENTS = INTEGRATION_EVENTS.map((e) => e.id);

export const PROVIDERS: ProviderDef[] = [
  {
    id: "brevo",
    name: "Brevo",
    category: "email",
    tagline: "Email & SMS",
    action: "Emails your team about each selected event.",
    events: ALL_EVENTS,
    fields: [{ key: "api_key", label: "API key", type: "secret", required: true, placeholder: "xkeysib-…" }, ...SENDER_FIELDS, NOTIFY_FIELD],
    docs: "https://help.brevo.com/hc/en-us/articles/209467485",
  },
  {
    id: "resend",
    name: "Resend",
    category: "email",
    tagline: "Transactional email",
    action: "Emails your team about each selected event.",
    events: ALL_EVENTS,
    fields: [{ key: "api_key", label: "API key", type: "secret", required: true, placeholder: "re_…" }, ...SENDER_FIELDS, NOTIFY_FIELD],
    docs: "https://resend.com/docs/dashboard/api-keys/introduction",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    category: "email",
    tagline: "Transactional email",
    action: "Emails your team about each selected event.",
    events: ALL_EVENTS,
    fields: [{ key: "api_key", label: "API key", type: "secret", required: true, placeholder: "SG.…" }, ...SENDER_FIELDS, NOTIFY_FIELD],
    docs: "https://www.twilio.com/docs/sendgrid/ui/account-and-settings/api-keys",
  },
  {
    id: "wati",
    name: "WhatsApp · Wati",
    category: "messaging",
    tagline: "WhatsApp messaging",
    action: "Sends your approved WhatsApp template to the lead. Nothing is sent until a template name is set.",
    events: ["new_lead", "demo_scheduled", "trial_started", "converted"],
    fields: [
      { key: "api_endpoint", label: "API endpoint", type: "url", required: true, placeholder: "https://live-mt-server.wati.io/123456", help: "From Wati → API Docs." },
      { key: "api_token", label: "API token", type: "secret", required: true, placeholder: "eyJhbGciOi…" },
      { key: "sender_phone", label: "Sender / phone", type: "tel", placeholder: "+91 98765 43210" },
      { key: "template_name", label: "Template name", type: "text", placeholder: "lead_welcome", help: "An approved template. Its {{name}} parameter gets the lead's first name." },
      { key: "broadcast_name", label: "Broadcast name", type: "text", placeholder: "vilms_leads" },
    ],
    docs: "https://docs.wati.io/reference/introduction",
  },
  {
    id: "twilio_sms",
    name: "SMS · Twilio",
    category: "messaging",
    tagline: "SMS messaging",
    action: "Texts the lead your message. Nothing is sent until a message is set.",
    events: ["new_lead", "demo_scheduled", "trial_started", "converted"],
    fields: [
      { key: "account_sid", label: "Account SID", type: "text", required: true, placeholder: "AC…", pattern: "^AC[0-9a-fA-F]{32}$" },
      { key: "auth_token", label: "Auth token", type: "secret", required: true },
      { key: "from_number", label: "From number", type: "tel", required: true, placeholder: "+1 555 010 0000" },
      { key: "message", label: "Message", type: "textarea", placeholder: "Hi {{name}}, thanks for your interest in VILMS. Our team will call you shortly.", help: "{{name}} and {{institute}} are replaced. Indian numbers may need DLT-registered templates." },
    ],
    docs: "https://www.twilio.com/docs/sms",
  },
  {
    id: "webhook",
    name: "Webhook",
    category: "automation",
    tagline: "Send lead data to another system (Zapier, Make, your API)",
    action: "POSTs the lead as JSON to your URL for each selected event.",
    events: ALL_EVENTS,
    multiple: true,
    fields: [
      { key: "name", label: "Webhook name", type: "text", required: true, placeholder: "Zapier — new leads" },
      { key: "url", label: "Webhook URL", type: "url", required: true, placeholder: "https://hooks.zapier.com/hooks/catch/…", help: "HTTPS only. Works with Zapier “Catch Hook” and Make “Custom webhook”." },
      { key: "secret", label: "Signing secret (optional)", type: "secret", help: "If set, each request carries X-VILMS-Signature: sha256=HMAC(body)." },
    ],
  },
  {
    id: "ga4",
    name: "Google Analytics",
    category: "analytics",
    tagline: "Website analytics",
    action: "With an API secret, also records a server-side generate_lead event.",
    events: ["new_lead"],
    fields: [
      { key: "measurement_id", label: "Measurement ID", type: "text", required: true, placeholder: "G-XXXXXXXXXX", pattern: "^G-[A-Z0-9]{4,15}$", help: "Loads GA4 on the website (unless NEXT_PUBLIC_GA4_ID is set)." },
      { key: "api_secret", label: "Measurement Protocol API secret (optional)", type: "secret" },
    ],
  },
  {
    id: "meta_pixel",
    name: "Meta Pixel",
    category: "analytics",
    tagline: "Ad conversion tracking",
    action: "With an access token, also sends a Lead event through the Conversions API.",
    events: ["new_lead"],
    fields: [
      { key: "pixel_id", label: "Pixel ID", type: "text", required: true, placeholder: "123456789012345", pattern: "^[0-9]{6,20}$", help: "Loads the Pixel on the website (unless NEXT_PUBLIC_META_PIXEL_ID is set)." },
      { key: "access_token", label: "Conversions API access token (optional)", type: "secret" },
    ],
  },
];

export const providerById = (id: string) => PROVIDERS.find((p) => p.id === id);

export const STATUS_LABEL = {
  not_connected: "Not connected",
  connected: "Connected",
  error: "Error",
  needs_configuration: "Needs configuration",
} as const;
export type IntegrationStatus = keyof typeof STATUS_LABEL;

/** A saved integration as the CRM sees it — never includes credentials. */
export type IntegrationRow = {
  id: string;
  provider: string;
  category: Category;
  name: string;
  status: IntegrationStatus;
  config: Record<string, string>;
  events: IntegrationEvent[];
  is_enabled: boolean;
  has_secret: boolean;
  secret_hint: string | null;
  last_verified_at: string | null;
  last_error: string | null;
  updated_at: string;
};

export type IntegrationLog = {
  id: number;
  created_at: string;
  provider: string;
  integration_name: string | null;
  event_type: string;
  status: "success" | "failed" | "skipped";
  response_summary: string | null;
};
