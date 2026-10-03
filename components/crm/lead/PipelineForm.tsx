"use client";

import { useActionState } from "react";
import { submitKeepingValues } from "@/components/crm/form-utils";
import { updatePipeline, type ActionState } from "@/app/crm/(app)/leads/actions";
import { FormMessage } from "@/components/crm/ui";
import { LEAD_STATUSES, PRIORITIES } from "@/lib/lead-options";

type Props = {
  leadId: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  followUpLocal: string;
  team: { id: string; full_name: string; is_active: boolean }[];
  disabled: boolean;
};

export function PipelineForm({ leadId, status, priority, assignedTo, followUpLocal, team, disabled }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePipeline.bind(null, leadId), null);

  return (
    <form onSubmit={submitKeepingValues(action)} className="space-y-3.5 p-4">
      <fieldset disabled={disabled || pending} className="grid gap-3.5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Status</span>
          <select name="status" defaultValue={status} className="field-input">
            {LEAD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Priority</span>
          <select name="priority" defaultValue={priority} className="field-input">
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Assigned to</span>
          <select name="assigned_to" defaultValue={assignedTo ?? ""} className="field-input">
            <option value="">Unassigned</option>
            {team
              .filter((m) => m.is_active || m.id === assignedTo)
              .map((m) => (
                <option key={m.id} value={m.id}>{m.full_name}{m.is_active ? "" : " (inactive)"}</option>
              ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Next follow-up <span className="font-normal text-faint">(IST)</span></span>
          <input type="datetime-local" name="next_follow_up_at" defaultValue={followUpLocal} className="field-input" />
        </label>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        {!disabled && (
          <button type="submit" className="btn-ink min-h-[40px] text-[14px]" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        )}
        <FormMessage state={state} />
        {disabled && <p className="text-[13px] text-faint">Viewers can&apos;t change leads.</p>}
      </div>
    </form>
  );
}
