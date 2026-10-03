"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type PasswordState } from "@/app/crm/(app)/account/actions";
import { FormMessage } from "@/components/crm/ui";

export function PasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="max-w-md space-y-3.5 p-4">
      {/* Lets password managers file the new password under the right account. */}
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <label className="block">
        <span className="field-label">Current password</span>
        <input type="password" name="current" autoComplete="current-password" required className="field-input" />
      </label>
      <label className="block">
        <span className="field-label">New password</span>
        <input type="password" name="next" autoComplete="new-password" minLength={12} required className="field-input" />
        <span className="mt-1 block text-[12px] text-faint">At least 12 characters. A short phrase works well.</span>
      </label>
      <label className="block">
        <span className="field-label">Confirm new password</span>
        <input type="password" name="confirm" autoComplete="new-password" minLength={12} required className="field-input" />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-ink min-h-[40px] text-[14px]" disabled={pending}>
          {pending ? "Saving…" : "Change password"}
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
