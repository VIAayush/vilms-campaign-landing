"use client";

import { useActionState, useState, useTransition } from "react";
import { submitKeepingValues } from "@/components/crm/form-utils";
import { resetPassword, updateMember, type TeamState } from "@/app/crm/(app)/team/actions";
import { FormMessage } from "@/components/crm/ui";
import { CRM_ROLES, roleLabel } from "@/lib/lead-options";
import { TempPassword } from "./TempPassword";

type Member = { id: string; email: string; full_name: string; role: string; is_active: boolean };

export function MemberRow({ member, isSelf }: { member: Member; isSelf: boolean }) {
  const [state, action, pending] = useActionState<TeamState, FormData>(updateMember, null);
  const [reset, setReset] = useState<TeamState>(null);
  const [resetting, startReset] = useTransition();
  const locked = isSelf || member.role === "owner";

  return (
    <li className="space-y-3 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            {member.full_name} {isSelf && <span className="font-normal text-faint">(you)</span>}
            {!member.is_active && <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-[11.5px] font-semibold text-faint">Inactive</span>}
          </p>
          <p className="truncate text-[13px] text-muted">{member.email}</p>
        </div>
        {locked ? (
          <span className="chip">{roleLabel(member.role)}</span>
        ) : (
          <form onSubmit={submitKeepingValues(action)} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="member" value={member.id} />
            <label className="sr-only" htmlFor={`role-${member.id}`}>Role</label>
            <select id={`role-${member.id}`} name="role" defaultValue={member.role} className="field-input w-auto py-1.5 text-[13.5px]">
              {CRM_ROLES.filter((r) => r.value !== "owner").map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`active-${member.id}`}>Access</label>
            <select id={`active-${member.id}`} name="is_active" defaultValue={String(member.is_active)} className="field-input w-auto py-1.5 text-[13.5px]">
              <option value="true">Active</option>
              <option value="false">No access</option>
            </select>
            <button type="submit" className="btn-ink min-h-[36px] px-3.5 text-[13.5px]" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn-ghost min-h-[36px] px-3.5 text-[13.5px]"
              disabled={resetting}
              onClick={() => {
                if (window.confirm(`Reset ${member.full_name}'s password? Their current password stops working.`)) {
                  startReset(async () => setReset(await resetPassword(member.id, member.email)));
                }
              }}
            >
              {resetting ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}
      </div>
      <FormMessage state={state} />
      {reset?.error && <FormMessage state={reset} />}
      {reset?.tempPassword && reset.forEmail && <TempPassword email={reset.forEmail} password={reset.tempPassword} />}
    </li>
  );
}
