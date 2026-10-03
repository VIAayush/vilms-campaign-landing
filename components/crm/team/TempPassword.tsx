"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Shown once, right after the password is generated. It's never stored in the app. */
export function TempPassword({ email, password }: { email: string; password: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-brass/40 bg-brass-tint p-3.5 text-[13.5px]">
      <p className="font-semibold text-ink">Temporary password for {email}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="rounded-md bg-surface px-2.5 py-1.5 font-mono text-[14px] text-ink">{password}</code>
        <button
          type="button"
          className="btn-ghost min-h-[34px] px-3 text-[13px]"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(password);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-[12.5px] text-brass-text">
        Shown only once. Share it privately (not in a group chat) and ask them to change it under Account after signing in at /crm/login.
      </p>
    </div>
  );
}
