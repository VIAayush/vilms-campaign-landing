import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContactLinks } from "@/components/crm/ContactLinks";
import { DangerZone } from "@/components/crm/lead/DangerZone";
import { DetailsForm } from "@/components/crm/lead/DetailsForm";
import { NoteForm } from "@/components/crm/lead/NoteForm";
import { PipelineForm } from "@/components/crm/lead/PipelineForm";
import { Empty, Panel, PriorityBadge, StatusBadge } from "@/components/crm/ui";
import { canEdit, isAdmin, requireMember } from "@/lib/crm/dal";
import { formatDateTime, requestNow, timeAgo, toIstInput } from "@/lib/crm/format";
import type { Activity, Lead, TeamMember } from "@/lib/crm/types";
import { channelLabel, interestLabel, priorityLabel } from "@/lib/lead-options";
import { formatPhone } from "@/lib/phone";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Lead" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EVENT_LABELS: Record<string, string> = {
  page_view: "Viewed a page",
  cta_click: "Clicked a call-to-action",
  pricing_view: "Viewed pricing",
  feature_view: "Viewed a feature",
  demo_form_open: "Opened the form",
  demo_form_submit: "Submitted the form",
  trial_click: "Clicked Start Free Trial",
};

const FIELD_LABELS: Record<string, string> = {
  full_name: "name",
  institute_name: "institute",
  email: "email",
  phone: "phone",
  city: "city",
  institute_type: "institute type",
  student_count: "student count",
  website: "website",
  current_lms: "current LMS",
  interest: "interest",
  message: "message",
};

function describe(a: Activity, nameOf: (id: string | null) => string): React.ReactNode {
  const m = a.meta ?? {};
  switch (a.type) {
    case "created":
      return `Submitted the ${m.form_location ? `“${String(m.form_location)}” ` : ""}form${m.channel ? ` via ${channelLabel(String(m.channel))}` : ""}`;
    case "resubmitted":
      return `Submitted the form again${m.interest ? ` (${interestLabel(String(m.interest))})` : ""}`;
    case "status_changed":
      return (
        <>
          Status <StatusBadge status={String(m.from)} /> → <StatusBadge status={String(m.to)} />
        </>
      );
    case "assigned":
      return m.to ? `Assigned to ${nameOf(String(m.to))}` : "Unassigned";
    case "priority_changed":
      return `Priority ${priorityLabel(String(m.from))} → ${priorityLabel(String(m.to))}`;
    case "follow_up_set":
      return m.at ? `Follow-up set for ${formatDateTime(String(m.at))}` : "Follow-up cleared";
    case "note":
      return "Note";
    case "contact_call":
      return "Started a call";
    case "contact_whatsapp":
      return "Opened WhatsApp";
    case "contact_email":
      return "Opened an email";
    case "updated": {
      const fields = Array.isArray(m.fields) ? (m.fields as string[]).map((f) => FIELD_LABELS[f] ?? f) : [];
      return `Edited ${fields.join(", ") || "details"}`;
    }
    case "spam_flagged":
      return m.is_spam ? "Marked as spam" : "Restored from spam";
    default:
      return a.type;
  }
}

function Attr({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-1.5 text-[13px]">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-all text-body">{value || "—"}</dd>
    </div>
  );
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const member = await requireMember();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createSessionClient();
  const [leadRes, actRes, teamRes, eventsRes] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    supabase.from("lead_activities").select("id, created_at, actor_id, type, body, meta").eq("lead_id", id).order("created_at", { ascending: false }).limit(200),
    supabase.from("crm_members").select("id, email, full_name, role, is_active").order("full_name"),
    supabase.from("site_events").select("id, created_at, name, path, label").eq("lead_id", id).order("created_at", { ascending: false }).limit(40),
  ]);

  const lead = leadRes.data as Lead | null;
  if (!lead) notFound();

  const activities = (actRes.data ?? []) as Activity[];
  const team = (teamRes.data ?? []) as TeamMember[];
  const events = (eventsRes.data ?? []) as { id: number; created_at: string; name: string; path: string | null; label: string | null }[];
  const nameOf = (uid: string | null) => (uid ? team.find((t) => t.id === uid)?.full_name ?? "Former member" : "Website");
  const editable = canEdit(member.role);
  const now = requestNow();
  const overdue = lead.next_follow_up_at && new Date(lead.next_follow_up_at).getTime() < now;

  const eventCounts = events.reduce<Record<string, number>>((acc, e) => ((acc[e.name] = (acc[e.name] ?? 0) + 1), acc), {});

  return (
    <>
      <Link href="/crm/leads" className="mb-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All leads
      </Link>

      <header className="card mb-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[26px] font-bold leading-tight">{lead.full_name}</h1>
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
              {lead.is_spam && <span className="rounded-full bg-err-bg px-2 py-0.5 text-[11.5px] font-semibold text-err">Spam</span>}
            </div>
            <p className="mt-1 text-[15px] text-muted">
              {lead.institute_name} · {lead.city}
            </p>
            <p className="mt-2 text-[13px] text-faint">
              Received {formatDateTime(lead.created_at)}
              {lead.submit_count > 1 && ` · enquired ${lead.submit_count}× (last ${timeAgo(lead.last_submitted_at, now)})`}
              {" · "}
              {lead.last_contacted_at ? `last contacted ${timeAgo(lead.last_contacted_at, now)}` : "not contacted yet"}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <ContactLinks leadId={lead.id} phone={lead.phone} email={lead.email} name={lead.full_name} canLog={editable} />
            <p className="text-[13px] text-muted">
              {formatPhone(lead.phone)} · {lead.email}
            </p>
          </div>
        </div>
        {lead.next_follow_up_at && (
          <p className={`mt-3 inline-flex rounded-lg px-3 py-1.5 text-[13px] font-medium ${overdue ? "bg-err-bg text-err" : "bg-brass-tint text-brass-text"}`}>
            {overdue ? "Follow-up overdue — was due " : "Next follow-up "}
            {formatDateTime(lead.next_follow_up_at)}
          </p>
        )}
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel title="Pipeline">
            <PipelineForm
              key={`${lead.status}-${lead.priority}-${lead.assigned_to}-${lead.next_follow_up_at}`}
              leadId={lead.id}
              status={lead.status}
              priority={lead.priority}
              assignedTo={lead.assigned_to}
              followUpLocal={toIstInput(lead.next_follow_up_at)}
              team={team}
              disabled={!editable}
            />
          </Panel>

          <Panel title="Notes & activity">
            {editable && <NoteForm leadId={lead.id} />}
            {activities.length === 0 ? (
              <Empty>No activity yet.</Empty>
            ) : (
              <ol className="divide-y divide-line">
                {activities.map((a) => (
                  <li key={a.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[13.5px]">
                      <span className="flex flex-wrap items-center gap-1.5 font-medium text-ink">{describe(a, nameOf)}</span>
                      <span className="text-[12px] text-faint" title={formatDateTime(a.created_at)}>
                        {nameOf(a.actor_id)} · {timeAgo(a.created_at, now)}
                      </span>
                    </div>
                    {a.body && (
                      <p className={`mt-1.5 whitespace-pre-wrap text-[14px] ${a.type === "note" ? "rounded-lg bg-surface-2 px-3 py-2 text-body" : "text-muted"}`}>
                        {a.body}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Details">
            <DetailsForm
              key={lead.updated_at}
              leadId={lead.id}
              canEdit={editable}
              lead={{
                full_name: lead.full_name,
                institute_name: lead.institute_name,
                email: lead.email,
                phone: lead.phone,
                city: lead.city,
                institute_type: lead.institute_type,
                student_count: lead.student_count,
                website: lead.website,
                current_lms: lead.current_lms,
                interest: lead.interest,
                message: lead.message,
              }}
            />
          </Panel>

          <Panel title="Where they came from">
            <dl className="px-4 py-3">
              <Attr label="Channel" value={channelLabel(lead.channel)} />
              <Attr label="UTM source" value={lead.source} />
              <Attr label="UTM medium" value={lead.medium} />
              <Attr label="UTM campaign" value={lead.campaign} />
              <Attr label="UTM term" value={lead.term} />
              <Attr label="UTM content" value={lead.content} />
              <Attr label="Ad click ID" value={lead.gclid ? "Google (gclid)" : lead.fbclid ? "Meta (fbclid)" : null} />
              <Attr label="Landing page" value={lead.landing_page} />
              <Attr label="Referrer" value={lead.referrer} />
              <Attr label="Form" value={lead.form_location} />
              <Attr label="First visit" value={lead.first_visit_at ? formatDateTime(lead.first_visit_at) : null} />
              <Attr label="Consent given" value={formatDateTime(lead.consent_at)} />
            </dl>
          </Panel>

          <Panel title="Website activity">
            {events.length === 0 ? (
              <Empty>No tracked visits linked to this lead (the visitor may have opted out of analytics).</Empty>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 border-b border-line px-4 py-3">
                  {Object.entries(eventCounts).map(([name, n]) => (
                    <span key={name} className="chip">
                      {EVENT_LABELS[name] ?? name}: {n}
                    </span>
                  ))}
                </div>
                <ol className="max-h-[320px] divide-y divide-line overflow-y-auto">
                  {events.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2 text-[13px]">
                      <span className="min-w-0 truncate">
                        {EVENT_LABELS[e.name] ?? e.name}
                        {e.label && <span className="text-muted"> · {e.label}</span>}
                        {e.path && <span className="text-faint"> · {e.path}</span>}
                      </span>
                      <span className="shrink-0 text-[12px] text-faint">{timeAgo(e.created_at, now)}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </Panel>

          {(editable || isAdmin(member.role)) && (
            <Panel title="Housekeeping">
              <DangerZone leadId={lead.id} isSpam={lead.is_spam} canEdit={editable} canDelete={isAdmin(member.role)} />
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
