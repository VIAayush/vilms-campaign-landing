import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { CollapsibleFilters } from "@/components/crm/CollapsibleFilters";
import { ContactLinks } from "@/components/crm/ContactLinks";
import { PageHeader, PriorityBadge, StatusBadge } from "@/components/crm/ui";
import { canEdit, isAdmin, requireMember } from "@/lib/crm/dal";
import { formatDateTime, formatNumber, requestNow, timeAgo } from "@/lib/crm/format";
import { applyLeadFilters, filtersToQuery, hasActiveFilters, parseLeadFilters, SORTS } from "@/lib/crm/lead-filters";
import { LEAD_ROW_COLUMNS, type LeadRow, type TeamMember } from "@/lib/crm/types";
import {
  CHANNELS,
  INSTITUTE_TYPES,
  INTERESTS,
  LEAD_STATUSES,
  PRIORITIES,
  STUDENT_COUNTS,
  channelLabel,
  instituteTypeLabel,
  studentCountLabel,
} from "@/lib/lead-options";
import { formatPhone } from "@/lib/phone";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 25;

function Select({ name, label, value, options }: { name: string; label: string; value: string; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold text-muted">{label}</span>
      <select name={name} defaultValue={value} className="field-input py-2 text-[14px]">
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const member = await requireMember();
  const sp = await searchParams;
  const f = parseLeadFilters(sp);
  const supabase = await createSessionClient();
  const editable = canEdit(member.role);

  const offset = (f.page - 1) * PAGE_SIZE;
  const [leadsRes, teamRes] = await Promise.all([
    applyLeadFilters(supabase.from("leads").select(LEAD_ROW_COLUMNS, { count: "exact" }), f).range(offset, offset + PAGE_SIZE - 1),
    supabase.from("crm_members").select("id, email, full_name, role, is_active").order("full_name"),
  ]);

  const leads = (leadsRes.data ?? []) as LeadRow[];
  // Past the last page (e.g. after filtering or deleting): start again at page 1.
  if (f.page > 1 && leads.length === 0) redirect(`/crm/leads${filtersToQuery(f, { page: 1 })}`);
  const total = leadsRes.count ?? 0;
  const team = (teamRes.data ?? []) as TeamMember[];
  const nameOf = (id: string | null) => (id ? team.find((m) => m.id === id)?.full_name ?? "—" : "Unassigned");
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const active = hasActiveFilters(f);
  const activeCount = [f.status, f.follow_up, f.channel, f.institute_type, f.student_count, f.interest, f.assigned, f.priority, f.from, f.to].filter(Boolean).length;
  const now = requestNow();

  return (
    <>
      <PageHeader
        title={f.spam ? "Spam" : "Leads"}
        sub={
          leadsRes.error
            ? "Couldn't load leads. Refresh to try again."
            : active
              ? `${formatNumber(total)} ${total === 1 ? "lead matches" : "leads match"} these filters`
              : `${formatNumber(total)} ${total === 1 ? "lead" : "leads"}`
        }
        actions={
          isAdmin(member.role) && total > 0 ? (
            <a href={`/crm/leads/export${filtersToQuery(f, { page: 1 })}`} className="btn-ghost">
              <Download className="h-4 w-4" aria-hidden /> Export CSV
            </a>
          ) : undefined
        }
      />
      {sp.deleted === "1" && (
        <p role="status" className="mb-4 rounded-lg bg-ok-bg px-3 py-2 text-[13.5px] font-medium text-ok">Lead deleted.</p>
      )}

      <form method="get" className="card mb-5 p-4" role="search" aria-label="Filter leads">
        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold text-muted">Search</span>
          <input
            name="q"
            type="search"
            defaultValue={f.q}
            placeholder="Name, institute, email, phone, city, campaign"
            className="field-input py-2 text-[14px]"
          />
        </label>
        <CollapsibleFilters activeCount={activeCount}>
          <Select name="status" label="Status" value={f.status} options={[...LEAD_STATUSES]} />
          <Select
            name="follow_up"
            label="Follow-up"
            value={f.follow_up}
            options={[
              { value: "due", label: "Due today or overdue" },
              { value: "overdue", label: "Overdue" },
              { value: "scheduled", label: "Scheduled (future)" },
              { value: "none", label: "None set (open leads)" },
            ]}
          />
          <Select name="channel" label="Source channel" value={f.channel} options={Object.entries(CHANNELS).map(([value, label]) => ({ value, label }))} />
          <Select name="institute_type" label="Institute type" value={f.institute_type} options={[...INSTITUTE_TYPES]} />
          <Select name="student_count" label="Students" value={f.student_count} options={[...STUDENT_COUNTS]} />
          <Select name="interest" label="Interested in" value={f.interest} options={[...INTERESTS]} />
          <Select
            name="assigned"
            label="Assigned to"
            value={f.assigned}
            options={[{ value: "unassigned", label: "Unassigned" }, ...team.map((m) => ({ value: m.id, label: m.full_name }))]}
          />
          <Select name="priority" label="Priority" value={f.priority} options={[...PRIORITIES]} />
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-muted">From</span>
            <input type="date" name="from" defaultValue={f.from} className="field-input py-2 text-[14px]" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-muted">To</span>
            <input type="date" name="to" defaultValue={f.to} className="field-input py-2 text-[14px]" />
          </label>
        </CollapsibleFilters>
        {f.campaign && <input type="hidden" name="campaign" value={f.campaign} />}
        {f.spam && <input type="hidden" name="spam" value="1" />}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <label className="flex items-center gap-2 text-[13px] text-muted">
            Sort
            <select name="sort" defaultValue={f.sort} className="field-input w-auto py-1.5 text-[13.5px]">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {f.campaign && (
              <span className="chip">Campaign: {f.campaign}</span>
            )}
            <Link href={f.spam ? "/crm/leads" : "/crm/leads?spam=1"} className="btn-ghost min-h-[40px] text-[14px]">
              {f.spam ? "Back to leads" : "View spam"}
            </Link>
            {active && (
              <Link href={f.spam ? "/crm/leads?spam=1" : "/crm/leads"} className="btn-ghost min-h-[40px] text-[14px]">Clear filters</Link>
            )}
            <button type="submit" className="btn-ink min-h-[40px] text-[14px]">Apply</button>
          </div>
        </div>
      </form>

      {leads.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-[20px] font-bold">{active ? "No leads match" : "No leads yet"}</p>
          <p className="mt-1 text-[14px] text-muted">
            {active ? "Try removing a filter." : "Leads from the website form will appear here."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-[13.5px]">
              <thead className="border-b border-line bg-surface-2 text-[12px] uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Lead</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Contact</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Institute</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Source</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Owner</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Follow-up</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((l) => {
                  const overdue = l.next_follow_up_at && new Date(l.next_follow_up_at).getTime() < now;
                  return (
                    <tr key={l.id} className="align-top hover:bg-surface-2">
                      <td className="px-4 py-3">
                        <Link href={`/crm/leads/${l.id}`} className="font-semibold text-ink hover:underline">{l.full_name}</Link>
                        <p className="text-muted">{l.institute_name}</p>
                        {l.submit_count > 1 && <p className="text-[12px] text-brass-text">Enquired {l.submit_count}×</p>}
                      </td>
                      <td className="px-3 py-3">
                        <p className="whitespace-nowrap text-body">{formatPhone(l.phone)}</p>
                        <p className="max-w-[200px] truncate text-muted">{l.email}</p>
                        <div className="mt-1.5">
                          <ContactLinks leadId={l.id} phone={l.phone} email={l.email} name={l.full_name} canLog={editable} size="sm" />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p>{instituteTypeLabel(l.institute_type)}</p>
                        <p className="text-muted">{studentCountLabel(l.student_count)} students · {l.city}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p>{channelLabel(l.channel)}</p>
                        {l.campaign && <p className="max-w-[160px] truncate text-muted" title={l.campaign}>{l.campaign}</p>}
                      </td>
                      <td className="space-y-1 px-3 py-3">
                        <StatusBadge status={l.status} />
                        {l.priority !== "medium" && <div><PriorityBadge priority={l.priority} /></div>}
                      </td>
                      <td className="px-3 py-3 text-muted">{nameOf(l.assigned_to)}</td>
                      <td className={`whitespace-nowrap px-3 py-3 ${overdue ? "font-semibold text-err" : "text-muted"}`}>
                        {l.next_follow_up_at ? formatDateTime(l.next_follow_up_at) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted" title={formatDateTime(l.created_at)}>
                        {timeAgo(l.created_at, now)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {leads.map((l) => (
              <li key={l.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/crm/leads/${l.id}`} className="min-w-0">
                    <p className="truncate font-semibold text-ink">{l.full_name}</p>
                    <p className="truncate text-[13px] text-muted">{l.institute_name} · {l.city}</p>
                  </Link>
                  <StatusBadge status={l.status} />
                </div>
                <p className="mt-2 text-[12.5px] text-muted">
                  {instituteTypeLabel(l.institute_type)} · {studentCountLabel(l.student_count)} students · {channelLabel(l.channel)}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <ContactLinks leadId={l.id} phone={l.phone} email={l.email} name={l.full_name} canLog={editable} size="sm" />
                  <span className="text-[12px] text-faint">{timeAgo(l.created_at, now)}</span>
                </div>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3 text-[13.5px]">
              <span className="text-muted">
                Page {f.page} of {pages}
              </span>
              <div className="flex gap-2">
                {f.page > 1 ? (
                  <Link href={`/crm/leads${filtersToQuery(f, { page: f.page - 1 })}`} className="btn-ghost min-h-[40px]">
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Previous
                  </Link>
                ) : null}
                {f.page < pages ? (
                  <Link href={`/crm/leads${filtersToQuery(f, { page: f.page + 1 })}`} className="btn-ghost min-h-[40px]">
                    Next <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
            </nav>
          )}
        </>
      )}
    </>
  );
}
