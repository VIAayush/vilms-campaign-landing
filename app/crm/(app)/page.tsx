import type { Metadata } from "next";
import Link from "next/link";
import { LeadMiniList } from "@/components/crm/LeadMiniList";
import { Kpi, PageHeader, Panel } from "@/components/crm/ui";
import { canEdit, requireMember } from "@/lib/crm/dal";
import { formatNumber, istDayStart } from "@/lib/crm/format";
import { LEAD_ROW_COLUMNS, type Dashboard, type LeadRow } from "@/lib/crm/types";
import { CLOSED_STATUSES } from "@/lib/lead-options";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

const OPEN = `(${CLOSED_STATUSES.join(",")})`;

function todayIst() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export default async function CrmDashboard() {
  const member = await requireMember();
  const supabase = await createSessionClient();
  const editable = canEdit(member.role);

  const today = todayIst();
  const todayStart = istDayStart(today)!;
  const tomorrowStart = new Date(new Date(todayStart).getTime() + 86_400_000).toISOString();

  const base = () => supabase.from("leads").select(LEAD_ROW_COLUMNS).eq("is_spam", false);

  const [dash, followUps, fresh, demos, cameToday, hot, converted, mine] = await Promise.all([
    supabase.rpc("crm_dashboard"),
    base().lt("next_follow_up_at", tomorrowStart).not("status", "in", OPEN).order("next_follow_up_at").limit(8),
    base().eq("status", "new").order("created_at", { ascending: false }).limit(8),
    base().eq("interest", "book_demo").lt("max_stage", 2).not("status", "in", "(not_interested,closed)").order("created_at", { ascending: false }).limit(8),
    base().gte("created_at", todayStart).order("created_at", { ascending: false }).limit(8),
    base().or("status.eq.interested,priority.eq.high").not("status", "in", OPEN).order("updated_at", { ascending: false }).limit(8),
    base().eq("status", "converted").order("updated_at", { ascending: false }).limit(5),
    base().eq("assigned_to", member.id).not("status", "in", OPEN).order("next_follow_up_at", { nullsFirst: false }).limit(8),
  ]);

  const d = (dash.data ?? {}) as Partial<Dashboard>;
  const n = (k: keyof Dashboard) => formatNumber(Number(d[k] ?? 0));
  const rows = (r: { data: unknown }) => (r.data ?? []) as LeadRow[];
  const hasAny = Number(d.total ?? 0) > 0;

  return (
    <>
      <PageHeader
        title={`Hello, ${member.full_name.split(" ")[0]}`}
        sub="Everything below is live from the leads database."
        actions={<Link href="/crm/leads" className="btn-ink">All leads</Link>}
      />

      {dash.error && (
        <p role="alert" className="mb-5 rounded-lg bg-err-bg px-3 py-2 text-[13.5px] text-err">
          Couldn&apos;t load the numbers. Refresh to try again.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <Kpi label="New today" value={n("today")} hint={`${n("this_week")} this week`} href={`/crm/leads?from=${today}`} />
        <Kpi label="Not contacted yet" value={n("new")} href="/crm/leads?status=new" tone={Number(d.new) > 0 ? "warn" : undefined} />
        <Kpi label="Demo requests waiting" value={n("demo_requests_waiting")} hint={`${n("demo_requests")} demo requests in total`} href="/crm/leads?interest=book_demo" />
        <Kpi label="Follow-ups due today" value={n("follow_ups_due")} hint={`${n("overdue")} overdue`} href="/crm/leads?follow_up=due" tone={Number(d.overdue) > 0 ? "err" : undefined} />
        <Kpi label="Trials started" value={n("trials_started")} href="/crm/leads?status=trial_started" />
        <Kpi label="Converted" value={n("converted")} href="/crm/leads?status=converted" tone="ok" />
        <Kpi label="Total leads" value={n("total")} hint={Number(d.spam) ? `${n("spam")} marked spam (excluded)` : undefined} href="/crm/leads" />
      </div>

      {!hasAny && !dash.error && (
        <div className="card mt-6 p-6 text-center">
          <p className="font-display text-[20px] font-bold">No leads yet</p>
          <p className="mt-1 text-[14px] text-muted">
            When someone submits the form on the website, they&apos;ll appear here within seconds.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Call next — follow-ups due" action={<Link href="/crm/leads?follow_up=due" className="text-[13px] font-semibold text-ink-600 hover:underline">View all</Link>}>
          <LeadMiniList leads={rows(followUps)} canLog={editable} when="follow_up" empty="No follow-ups due. Set one from any lead." />
        </Panel>
        <Panel title="New — not contacted yet" action={<Link href="/crm/leads?status=new" className="text-[13px] font-semibold text-ink-600 hover:underline">View all</Link>}>
          <LeadMiniList leads={rows(fresh)} canLog={editable} empty="No uncontacted leads." />
        </Panel>
        <Panel title="Demo requests waiting">
          <LeadMiniList leads={rows(demos)} canLog={editable} empty="No demo requests waiting to be scheduled." />
        </Panel>
        <Panel title="Came in today">
          <LeadMiniList leads={rows(cameToday)} canLog={editable} empty="No new leads today yet." />
        </Panel>
        {editable && (
          <Panel title="Assigned to me" action={<Link href={`/crm/leads?assigned=${member.id}`} className="text-[13px] font-semibold text-ink-600 hover:underline">View all</Link>}>
            <LeadMiniList leads={rows(mine)} canLog={editable} when="follow_up" empty="Nothing assigned to you right now." />
          </Panel>
        )}
        <Panel title="Hot — interested or high priority">
          <LeadMiniList leads={rows(hot)} canLog={editable} empty="No interested or high-priority leads open." />
        </Panel>
        <Panel title="Recently converted">
          <LeadMiniList leads={rows(converted)} canLog={editable} empty="No conversions yet." />
        </Panel>
      </div>
    </>
  );
}
