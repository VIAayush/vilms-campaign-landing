"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteLead, setSpam, type ActionState } from "@/app/crm/(app)/leads/actions";
import { FormMessage } from "@/components/crm/ui";

export function DangerZone({ leadId, isSpam, canEdit, canDelete }: { leadId: string; isSpam: boolean; canEdit: boolean; canDelete: boolean }) {
  const [spamState, setSpamState] = useState<ActionState>(null);
  const [spamPending, startSpam] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [delState, delAction, delPending] = useActionState<ActionState, FormData>(deleteLead.bind(null, leadId), null);

  return (
    <div className="space-y-4 p-4">
      {canEdit && (
        <div>
          <p className="text-[13.5px] text-muted">
            {isSpam ? "This lead is marked as spam and hidden from lists and reports." : "Junk or test submission? Hide it from lists and reports."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-ghost min-h-[38px] text-[14px]"
              disabled={spamPending}
              onClick={() => startSpam(async () => setSpamState(await setSpam(leadId, !isSpam)))}
            >
              {isSpam ? "Not spam — restore" : "Mark as spam"}
            </button>
            <FormMessage state={spamState} />
          </div>
        </div>
      )}

      {canDelete && (
        <div className="border-t border-line pt-4">
          {!confirming ? (
            <button type="button" onClick={() => setConfirming(true)} className="text-[13.5px] font-semibold text-err hover:underline">
              Delete this lead permanently…
            </button>
          ) : (
            <form action={delAction} className="space-y-2.5">
              <p className="text-[13.5px] text-body">
                This removes the lead and its whole timeline. It can&apos;t be undone. Type <strong>DELETE</strong> to confirm.
              </p>
              <input name="confirm" autoComplete="off" aria-label="Type DELETE to confirm" className="field-input max-w-[220px] text-[14px]" />
              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" className="btn min-h-[38px] bg-err text-[14px] text-white hover:opacity-90" disabled={delPending}>
                  {delPending ? "Deleting…" : "Delete lead"}
                </button>
                <button type="button" onClick={() => setConfirming(false)} className="btn-ghost min-h-[38px] text-[14px]">
                  Cancel
                </button>
                <FormMessage state={delState} />
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
