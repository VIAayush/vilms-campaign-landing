"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitKeepingValues } from "@/components/crm/form-utils";
import { addMember, type TeamState } from "@/app/crm/(app)/team/actions";
import { FormMessage } from "@/components/crm/ui";
import { CRM_ROLES } from "@/lib/lead-options";
import { TempPassword } from "./TempPassword";

export function AddMemberForm() {
  const [state, action, pending] = useActionState<TeamState, FormData>(addMember, null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.tempPassword) formRef.current?.reset();
  }, [state]);

  return (
    <div className="space-y-3 p-4">
      <form ref={formRef} onSubmit={submitKeepingValues(action)} className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
        <label className="block">
          <span className="field-label">Name</span>
          <input name="full_name" required maxLength={100} className="field-input text-[14px]" />
        </label>
        <label className="block">
          <span className="field-label">Work email</span>
          <input name="email" type="email" required maxLength={254} className="field-input text-[14px]" />
        </label>
        <label className="block">
          <span className="field-label">Role</span>
          <select name="role" defaultValue="sales" className="field-input text-[14px]">
            {CRM_ROLES.filter((r) => r.value !== "owner").map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-ink min-h-[44px] text-[14px]" disabled={pending}>
          {pending ? "Adding…" : "Add member"}
        </button>
      </form>
      {state?.error && <FormMessage state={state} />}
      {state?.tempPassword && state.forEmail && (
        <>
          <FormMessage state={{ ok: state.ok }} />
          <TempPassword email={state.forEmail} password={state.tempPassword} />
        </>
      )}
    </div>
  );
}
