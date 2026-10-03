import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AddMemberForm } from "@/components/crm/team/AddMemberForm";
import { MemberRow } from "@/components/crm/team/MemberRow";
import { PageHeader, Panel } from "@/components/crm/ui";
import { isOwner, requireMember } from "@/lib/crm/dal";
import type { TeamMember } from "@/lib/crm/types";
import { CRM_ROLES } from "@/lib/lead-options";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const member = await requireMember();
  if (!isOwner(member.role)) redirect("/crm");

  const supabase = await createSessionClient();
  const { data } = await supabase.from("crm_members").select("id, email, full_name, role, is_active").order("created_at");
  const team = (data ?? []) as TeamMember[];

  return (
    <>
      <PageHeader title="Team" sub="Who can sign in to the CRM, and what they can do." />

      <div className="space-y-5">
        <Panel title="Add a team member">
          <AddMemberForm />
        </Panel>

        <Panel title={`Members (${team.length})`}>
          <ul className="divide-y divide-line">
            {team.map((m) => (
              <MemberRow key={m.id} member={m} isSelf={m.id === member.id} />
            ))}
          </ul>
        </Panel>

        <Panel title="Roles">
          <dl className="divide-y divide-line">
            {CRM_ROLES.map((r) => (
              <div key={r.value} className="grid grid-cols-[100px_1fr] gap-3 px-4 py-2.5 text-[13.5px]">
                <dt className="font-semibold text-ink">{r.label}</dt>
                <dd className="text-muted">{r.description}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}
