"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitKeepingValues } from "@/components/crm/form-utils";
import { addNote, type ActionState } from "@/app/crm/(app)/leads/actions";
import { FormMessage } from "@/components/crm/ui";

export function NoteForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addNote.bind(null, leadId), null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} onSubmit={submitKeepingValues(action)} className="space-y-2.5 border-b border-line p-4">
      <label htmlFor="note-body" className="sr-only">Add a note</label>
      <textarea
        id="note-body"
        name="body"
        rows={3}
        maxLength={5000}
        required
        placeholder="What happened on the call? What's the next step?"
        className="field-input resize-y text-[14px]"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-ink min-h-[38px] text-[14px]" disabled={pending}>
          {pending ? "Adding…" : "Add note"}
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
