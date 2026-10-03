import type { Metadata } from "next";
import Link from "next/link";
import { BarList, DailyChart, Funnel, type BarItem } from "@/components/crm/charts";
import { Kpi, PageHeader, Panel } from "@/components/crm/ui";
import { requireMember } from "@/lib/crm/dal";
import { formatDate, formatNumber, pct } from "@/lib/crm/format";
import type { Analytics, Bucket } from "@/lib/crm/types";
import {
  STUDENT_COUNTS,
  channelLabel,
  instituteTypeLabel,
  interestLabel,
  statusLabel,
  studentCountLabel,
} from "@/lib/lead-options";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Analytics" };

const RANGES = [7, 30, 90] as const;

const EVENT_ROWS = [
  { name: "page_view", label: "Page views" },
  { name: "cta_click", label: "CTA clicks" },
  { name: "trial_click", label: "Start Free Trial clicks" },
  { name: "pricing_view", label: "Pricing section views" },
  { name: "feature_view", label: "Feature tab views" },
  { name: "demo_form_open", label: "Form opens" },
  { name: "demo_form_submit", label: "Form submissions" },
];

function toItems(buckets: Bucket[] | undefined, label: (k: string) => string, href?: (k: string) => string): BarItem[] {
  return (buckets ?? []).map((b) => {
    const key = b.key ?? "(none)";
    return { key, label: key === "(none)" ? "(not set)" : label(key), count: Number(b.count), href: href?.(key) };
  });
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireMember();
  const { days: rawDays } = await searchParams;
  const days = RANGES.find((r) => String(r) === rawDays) ?? 30;

  const supabase = await createSessionClient();
  const { data, error } = await supabase.rpc("crm_analytics", { p_days: days });
  const a = (data ?? null) as Analytics | null;

  const f = a?.funnel;
  // Links into the lead list keep this period.
  const fromDay = a ? new Date(new Date(a.from).getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10) : "";
  const leadsLink = (param: string) => (k: string) => `/crm/leads?${param}=${encodeURIComponent(k)}&from=${fromDay}`;
  const studentOrder = STUDENT_COUNTS.map((s) => s.value as string);
  const byStudents = toItems(a?.by_student_count, studentCountLabel, leadsLink("student_count")).sort(
    (x, y) => studentOrder.indexOf(x.key) - studentOrder.indexOf(y.key),
  );

  return (
    <>
      <PageHeader
        title="Analytics"
        sub={a ? `${formatDate(a.from)} – today (India time). Spam excluded. All figures are live from the database.` : undefined}
        actions={
          <div className="inline-flex rounded-xl border border-line-strong bg-surface p-1" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/crm/analytics?days=${r}`}
                aria-current={r === days ? "true" : undefined}
                className={`rounded-lg px-3 py-1.5 text-[13.5px] font-semibold ${r === days ? "bg-ink text-white" : "text-ink-700 hover:bg-paper"}`}
              >
                {r} days
              </Link>
            ))}
          </div>
        }
      />

      {error || !a ? (
        <p role="alert" className="rounded-lg bg-err-bg px-3 py-2 text-[13.5px] text-err">Couldn&apos;t load analytics. Refresh to try again.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Kpi label="Leads" value={formatNumber(f!.leads)} />
            <Kpi label="Demo requests" value={formatNumber(a.demo_requests)} />
            <Kpi label="Unique visitors" value={formatNumber(f!.visitors)} hint="who allowed analytics" />
            <Kpi label="Visitor → lead" value={pct(f!.leads_tracked, f!.visitors)} hint="tracked visitors only" />
            <Kpi label="Converted" value={formatNumber(f!.converted)} hint={`${pct(f!.converted, f!.leads)} of leads`} tone="ok" />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Panel title="Leads per day">
              <DailyChart data={a.leads_by_day} />
            </Panel>
            <Panel title="Conversion funnel">
              <Funnel
                title="On the website — browsers that allowed analytics"
                steps={[
                  { label: "Visitors", value: f!.visitors },
                  { label: "Clicked a CTA", value: f!.cta_clicks },
                  { label: "Opened the form", value: f!.forms_opened },
                  { label: "Became a lead", value: f!.leads_tracked },
                ]}
              />
              <div className="border-t border-line" />
              <Funnel
                title="In the sales pipeline — all leads"
                steps={[
                  { label: "Leads", value: f!.leads },
                  { label: "Contacted", value: f!.contacted },
                  { label: "Demo scheduled", value: f!.demo_scheduled },
                  { label: "Trial started", value: f!.trial_started },
                  { label: "Converted", value: f!.converted },
                ]}
              />
              <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-faint">
                Website steps count unique browsers; visits with Do Not Track or Global Privacy Control aren&apos;t recorded, so
                the pipeline can hold more leads than the website shows. Pipeline steps count the furthest stage each lead has
                reached, even if it later closed.
              </p>
            </Panel>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Panel title="By source channel">
              <BarList items={toItems(a.by_channel, channelLabel, leadsLink("channel"))} />
            </Panel>
            <Panel title="By UTM source">
              <BarList items={toItems(a.by_source, (k) => k)} />
            </Panel>
            <Panel title="By campaign (top 15)">
              <BarList items={toItems(a.by_campaign, (k) => k, leadsLink("campaign"))} />
            </Panel>
            <Panel title="By institute type">
              <BarList items={toItems(a.by_institute_type, instituteTypeLabel, leadsLink("institute_type"))} />
            </Panel>
            <Panel title="By number of students">
              <BarList items={byStudents} />
            </Panel>
            <Panel title="By status">
              <BarList items={toItems(a.by_status, statusLabel, leadsLink("status"))} />
            </Panel>
            <Panel title="What they asked for">
              <BarList items={toItems(a.by_interest, interestLabel, leadsLink("interest"))} />
            </Panel>
            <Panel title="Website events" className="md:col-span-2 xl:col-span-2">
              <table className="w-full text-[13.5px]">
                <tbody className="divide-y divide-line">
                  {EVENT_ROWS.map((e) => (
                    <tr key={e.name}>
                      <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">{e.label}</th>
                      <td className="px-4 py-2.5 text-right tabular-nums text-body">{formatNumber(Number(a.events?.[e.name] ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
