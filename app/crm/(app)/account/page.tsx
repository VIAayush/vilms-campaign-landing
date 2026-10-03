import type { Metadata } from "next";
import { PasswordForm } from "@/components/crm/PasswordForm";
import { PageHeader, Panel } from "@/components/crm/ui";
import { requireMember } from "@/lib/crm/dal";
import { CRM_ROLES, roleLabel } from "@/lib/lead-options";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const member = await requireMember();
  const role = CRM_ROLES.find((r) => r.value === member.role);

  return (
    <>
      <PageHeader title="Your account" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Profile">
          <dl className="divide-y divide-line px-4 py-2 text-[14px]">
            <div className="grid grid-cols-[90px_1fr] gap-3 py-2.5">
              <dt className="text-muted">Name</dt>
              <dd className="text-ink">{member.full_name}</dd>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-3 py-2.5">
              <dt className="text-muted">Email</dt>
              <dd className="break-all text-ink">{member.email}</dd>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-3 py-2.5">
              <dt className="text-muted">Role</dt>
              <dd className="text-ink">
                {roleLabel(member.role)} <span className="text-muted">— {role?.description}</span>
              </dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Change password">
          <PasswordForm email={member.email} />
        </Panel>
      </div>
    </>
  );
}
