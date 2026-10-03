import { z } from "zod";
import { INSTITUTE_TYPES, INTERESTS, STUDENT_COUNTS, values } from "./lead-options";
import { normalizePhone } from "./phone";

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} is too long`).optional().or(z.literal(""));

const WEBSITE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;

// The fields a visitor fills in. Shared by the browser (react-hook-form) and
// the server (which re-validates everything — the browser is never trusted).
export const leadFormSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100, "Name is too long"),
  institute_name: z.string().trim().min(2, "Enter your institute's name").max(150, "Institute name is too long"),
  email: z
    .string()
    .trim()
    .max(254, "Email is too long")
    .pipe(z.email("Enter a valid work email")),
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number")
    .refine((v) => normalizePhone(v) !== null, "Enter a valid 10-digit mobile number (or +country code)"),
  city: z.string().trim().min(2, "Enter your city").max(80, "City is too long"),
  institute_type: z.enum(values(INSTITUTE_TYPES), "Choose your institute type"),
  student_count: z.enum(values(STUDENT_COUNTS), "Choose how many students you teach"),
  website: optionalText(300, "Website").refine((v) => !v || WEBSITE.test(v), "Enter a valid website, e.g. yourinstitute.in"),
  current_lms: optionalText(120, "Current platform"),
  interest: z.enum(values(INTERESTS), "Choose what you're interested in"),
  message: optionalText(2000, "Message"),
  consent: z.literal(true, "Please agree so we can contact you"),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

const shortText = (max: number) => z.string().trim().max(max).optional().nullable();

// Everything the browser sends alongside the form fields.
export const leadSubmissionSchema = leadFormSchema.extend({
  submission_id: z.uuid(),
  form_location: z.string().trim().max(60).optional(),
  elapsed_ms: z.number().int().nonnegative().max(86_400_000).optional(),
  // Honeypot: hidden from people, irresistible to form-filling bots.
  company_fax: z.string().max(200).optional(),
  turnstile_token: z.string().max(2048).optional(),
  attribution: z
    .object({
      source: shortText(120),
      medium: shortText(120),
      campaign: shortText(200),
      term: shortText(200),
      content: shortText(200),
      gclid: shortText(300),
      fbclid: shortText(300),
      landing_page: shortText(300),
      referrer: shortText(300),
      first_visit_at: z.iso.datetime().optional().nullable(),
      visitor_id: z.uuid().optional().nullable(),
    })
    .optional(),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

// First-party analytics events.
export const EVENT_NAMES = [
  "page_view",
  "cta_click",
  "pricing_view",
  "feature_view",
  "demo_form_open",
  "demo_form_submit",
  "trial_click",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export const trackPayloadSchema = z.object({
  visitor: z.object({
    id: z.uuid(),
    landing_page: shortText(300),
    referrer: shortText(300),
    source: shortText(120),
    medium: shortText(120),
    campaign: shortText(200),
    gclid: shortText(300),
    fbclid: shortText(300),
  }),
  events: z
    .array(
      z.object({
        name: z.enum(EVENT_NAMES),
        session_id: z.uuid().optional().nullable(),
        path: shortText(300),
        label: shortText(120),
      }),
    )
    .min(1)
    .max(25),
});

export type TrackPayload = z.infer<typeof trackPayloadSchema>;
