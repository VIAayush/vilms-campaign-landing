import Link from "next/link";
import { ContactLinks } from "@/components/crm/ContactLinks";
import { Empty, StatusBadge } from "@/components/crm/ui";
import { requestNow, timeAgo } from "@/lib/crm/format";
import { instituteTypeLabel, studentCountLabel } from "@/lib/lead-options";
import type { LeadRow } from "@/lib/crm/types";

type Props = {
  leads: LeadRow[];
  empty: string;
  canLog: boolean;
  /** Which timestamp to show on the right. */
  when?: "created" | "follow_up";
};

export function LeadMiniList({ leads, empty, canLog, when = "created" }: Props) {
  if (!leads.length) return <Empty>{empty}</Empty>;
  const now = requestNow();
  return (
    <ul className="divide-y divide-line">
      {leads.map((l) => {
        const overdue = when === "follow_up" && l.next_follow_up_at && new Date(l.next_follow_up_at).getTime() < now;
        return (
          <li key={l.id} className="flex items-center gap-3 px-4 py-3">
            <Link href={`/crm/leads/${l.id}`} className="group min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink group-hover:underline">
                {l.full_name} <span className="font-normal text-muted">· {l.institute_name}</span>
              </p>
              <p className="mt-0.5 truncate text-[12.5px] text-muted">
                {l.city} · {instituteTypeLabel(l.institute_type)} · {studentCountLabel(l.student_count)} students
              </p>
            </Link>
            <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
              <StatusBadge status={l.status} />
              <span className={`text-[11.5px] ${overdue ? "font-semibold text-err" : "text-faint"}`}>
                {when === "follow_up" && l.next_follow_up_at
                  ? `${overdue ? "Overdue · " : "Due "}${timeAgo(l.next_follow_up_at, now)}`
                  : timeAgo(l.created_at, now)}
              </span>
            </div>
            <div className="shrink-0">
              <ContactLinks leadId={l.id} phone={l.phone} email={l.email} name={l.full_name} canLog={canLog} size="sm" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
