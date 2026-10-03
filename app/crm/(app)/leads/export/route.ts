import { NextResponse, type NextRequest } from "next/server";
import { getViewer, isAdmin } from "@/lib/crm/dal";
import { applyLeadFilters, parseLeadFilters } from "@/lib/crm/lead-filters";
import type { Lead, TeamMember } from "@/lib/crm/types";
import { channelLabel, instituteTypeLabel, interestLabel, priorityLabel, statusLabel, studentCountLabel } from "@/lib/lead-options";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_ROWS = 5000;

// Spreadsheet apps execute cells that start with these characters as formulas.
function cell(value: unknown) {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  // Route handlers don't pass through the CRM layout, so check access here too.
  const viewer = await getViewer();
  if (viewer.state !== "member") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(viewer.member.role)) return NextResponse.json({ error: "Only admins can export leads." }, { status: 403 });

  const sp = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = parseLeadFilters(sp);
  const supabase = await createSessionClient();

  const allColumns: string = "*";
  const [{ data, error }, { data: team }] = await Promise.all([
    applyLeadFilters(supabase.from("leads").select(allColumns), filters).range(0, MAX_ROWS - 1),
    supabase.from("crm_members").select("id, full_name"),
  ]);
  if (error) return NextResponse.json({ error: "Export failed" }, { status: 500 });

  const names = new Map(((team ?? []) as Pick<TeamMember, "id" | "full_name">[]).map((m) => [m.id, m.full_name]));
  const columns: [string, (l: Lead) => unknown][] = [
    ["Received", (l) => l.created_at],
    ["Name", (l) => l.full_name],
    ["Institute", (l) => l.institute_name],
    ["Email", (l) => l.email],
    ["Phone", (l) => l.phone],
    ["City", (l) => l.city],
    ["Institute type", (l) => instituteTypeLabel(l.institute_type)],
    ["Students", (l) => studentCountLabel(l.student_count)],
    ["Interested in", (l) => interestLabel(l.interest)],
    ["Website", (l) => l.website],
    ["Current LMS", (l) => l.current_lms],
    ["Message", (l) => l.message],
    ["Status", (l) => statusLabel(l.status)],
    ["Priority", (l) => priorityLabel(l.priority)],
    ["Assigned to", (l) => (l.assigned_to ? names.get(l.assigned_to) ?? "" : "")],
    ["Last contacted", (l) => l.last_contacted_at],
    ["Next follow-up", (l) => l.next_follow_up_at],
    ["Channel", (l) => channelLabel(l.channel)],
    ["UTM source", (l) => l.source],
    ["UTM medium", (l) => l.medium],
    ["UTM campaign", (l) => l.campaign],
    ["UTM term", (l) => l.term],
    ["UTM content", (l) => l.content],
    ["Landing page", (l) => l.landing_page],
    ["Referrer", (l) => l.referrer],
    ["Form", (l) => l.form_location],
    ["Times enquired", (l) => l.submit_count],
    ["Lead ID", (l) => l.id],
  ];

  const lines = [
    columns.map(([h]) => cell(h)).join(","),
    ...((data ?? []) as unknown as Lead[]).map((l) => columns.map(([, get]) => cell(get(l))).join(",")),
  ];
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(`﻿${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vilms-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
