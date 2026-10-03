"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ExternalLink, Lock, Plus, X } from "lucide-react";
import {
  disconnectIntegration,
  saveIntegration,
  setIntegrationEnabled,
  testIntegration,
  type IntegrationActionState,
} from "@/app/crm/(app)/integrations/actions";
import { submitKeepingValues } from "@/components/crm/form-utils";
import { Empty, FormMessage, Panel } from "@/components/crm/ui";
import { formatDateTime } from "@/lib/crm/format";
import {
  CATEGORIES,
  INTEGRATION_EVENTS,
  PROVIDERS,
  STATUS_LABEL,
  type Category,
  type IntegrationLog,
  type IntegrationRow,
  type IntegrationStatus,
  type ProviderDef,
} from "@/lib/integrations/catalog";

const STATUS_TONE: Record<IntegrationStatus, string> = {
  not_connected: "bg-paper-2 text-faint",
  connected: "bg-ok-bg text-ok",
  error: "bg-err-bg text-err",
  needs_configuration: "bg-warn-bg text-warn",
};
const LOG_TONE = { success: "bg-ok-bg text-ok", failed: "bg-err-bg text-err", skipped: "bg-paper-2 text-faint" } as const;
const EVENT_LABEL: Record<string, string> = {
  ...Object.fromEntries(INTEGRATION_EVENTS.map((e) => [e.id, e.label])),
  connection_test: "Connection test",
  disconnected: "Disconnected",
};

function Badge({ status }: { status: IntegrationStatus }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}

type Editing = { def: ProviderDef; row: IntegrationRow | null } | null;

function ConfigDialog({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<IntegrationActionState, FormData>(saveIntegration, null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (editing && !d.open) d.showModal();
    if (!editing && d.open) d.close();
  }, [editing]);

  // After every save attempt, clear typed credentials from the form: once
  // submitted, a secret is never shown again (only its last-4 hint).
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state) return;
    formRef.current?.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((i) => (i.value = ""));
  }, [state]);

  const def = editing?.def;
  const row = editing?.row ?? null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="int-dialog-title"
      className="m-auto max-h-[92dvh] w-[min(560px,calc(100vw-24px))] overflow-y-auto rounded-2xl bg-surface p-0 text-body shadow-float"
    >
      {def ? (
        <form ref={formRef} onSubmit={submitKeepingValues(action)} className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{CATEGORIES[def.category].label}</p>
              <h2 id="int-dialog-title" className="text-[22px] font-bold">
                {row ? `Configure ${row.name}` : `Connect ${def.name}`}
              </h2>
            </div>
            <button type="button" onClick={() => ref.current?.close()} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-paper-2" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <input type="hidden" name="provider" value={def.id} />
          <input type="hidden" name="id" value={row?.id ?? ""} />

          {def.fields.map((f) => {
            const id = `int-${f.key}`;
            const saved = f.type === "secret" && row?.has_secret;
            return (
              <label key={f.key} htmlFor={id} className="block">
                <span className="field-label">
                  {f.label} {f.required ? null : <span className="font-normal text-faint">(optional)</span>}
                </span>
                {f.type === "textarea" ? (
                  <textarea id={id} name={`f_${f.key}`} rows={3} maxLength={1000} defaultValue={row?.config?.[f.key] ?? ""} placeholder={f.placeholder} className="field-input text-[14px]" />
                ) : (
                  <input
                    id={id}
                    name={`f_${f.key}`}
                    type={f.type === "secret" ? "password" : f.type === "tel" ? "tel" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={500}
                    defaultValue={f.type === "secret" ? "" : (row?.config?.[f.key] ?? "")}
                    placeholder={saved ? `Saved (${row?.secret_hint ?? "••••"}) — leave blank to keep` : f.placeholder}
                    required={f.required && !(f.type === "secret" && saved)}
                    className="field-input text-[14px]"
                  />
                )}
                {f.type === "secret" ? (
                  <span className="mt-1 flex items-center gap-1 text-[12px] text-faint">
                    <Lock className="h-3 w-3" aria-hidden /> Encrypted on the server. Never shown again after saving.
                  </span>
                ) : f.help ? (
                  <span className="mt-1 block text-[12px] text-faint">{f.help}</span>
                ) : null}
              </label>
            );
          })}

          {def.events.length ? (
            <fieldset className="rounded-xl border border-line p-3.5">
              <legend className="px-1 text-[13.5px] font-semibold text-ink">Events</legend>
              {def.action ? <p className="mb-2 text-[12.5px] text-muted">{def.action}</p> : null}
              <div className="space-y-1.5">
                {INTEGRATION_EVENTS.filter((e) => (def.events as readonly string[]).includes(e.id)).map((e) => (
                  <label key={e.id} className="flex items-start gap-2.5 text-[14px]">
                    <input type="checkbox" name="events" value={e.id} defaultChecked={row?.events?.includes(e.id) ?? false} className="mt-1 h-4 w-4 accent-ink" />
                    <span>
                      {e.label} <span className="text-[12.5px] text-faint">— {e.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <label className="flex items-center gap-2.5 text-[14px] font-medium">
            <input type="checkbox" name="is_enabled" defaultChecked={row?.is_enabled ?? false} className="h-4 w-4 accent-ink" />
            Enabled — run the selected events automatically
          </label>
          <p className="text-[12px] text-faint">Nothing is sent until this is enabled, events are selected and the connection test passes.</p>

          <FormMessage state={state} />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {def.docs ? (
              <a href={def.docs} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-600 hover:underline">
                Where do I find these? <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => ref.current?.close()} className="btn-ghost min-h-[40px] text-[14px]">
                Close
              </button>
              <button type="submit" disabled={pending} className="btn-ink min-h-[40px] text-[14px]">
                {pending ? "Saving & testing…" : "Save & test connection"}
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}

function IntegrationCard({ def, row, onConfigure }: { def: ProviderDef; row: IntegrationRow | null; onConfigure: () => void }) {
  const [msg, setMsg] = useState<IntegrationActionState>(null);
  const [pending, start] = useTransition();
  const status: IntegrationStatus = row?.status ?? "not_connected";
  const events = row?.events?.map((e) => EVENT_LABEL[e] ?? e) ?? [];

  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15.5px] font-semibold text-ink">{row?.name ?? def.name}</p>
          <p className="truncate text-[13px] text-muted">{def.multiple && row ? def.name : def.tagline}</p>
        </div>
        <Badge status={status} />
      </div>

      <div className="mt-3 space-y-1 text-[12.5px] text-muted">
        {row?.status === "connected" && row.last_verified_at ? <p>Last verified: {formatDateTime(row.last_verified_at)}</p> : null}
        {row?.last_error && row.status !== "connected" ? <p className="text-err">{row.last_error}</p> : null}
        {row?.has_secret ? (
          <p className="flex items-center gap-1">
            <Lock className="h-3 w-3" aria-hidden /> Credentials saved {row.secret_hint ? `(${row.secret_hint})` : ""}
          </p>
        ) : null}
        {row && def.events.length ? <p>{events.length ? `Events: ${events.join(", ")}` : "No events selected"}</p> : null}
      </div>

      {row ? (
        <label className="mt-3 flex items-center gap-2 text-[13.5px] font-medium text-ink">
          <input
            type="checkbox"
            checked={row.is_enabled}
            disabled={pending}
            onChange={(e) => {
              const v = e.target.checked;
              start(async () => setMsg(await setIntegrationEnabled(row.id, v)));
            }}
            className="h-4 w-4 accent-ink"
          />
          {row.is_enabled ? "Enabled" : "Disabled"}
        </label>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <button type="button" onClick={onConfigure} className={`${row ? "btn-ghost" : "btn-ink"} min-h-[38px] px-3.5 text-[13.5px]`}>
          {row ? "Configure" : def.category === "automation" || def.category === "analytics" ? "Configure" : "Connect"}
        </button>
        {row ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => start(async () => setMsg(await testIntegration(row.id)))}
              className="btn-ghost min-h-[38px] px-3.5 text-[13.5px]"
            >
              {pending ? "Testing…" : "Test"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (window.confirm(`Disconnect ${row.name}? Its saved credentials are deleted.`)) start(async () => setMsg(await disconnectIntegration(row.id)));
              }}
              className="min-h-[38px] rounded-xl px-3 text-[13.5px] font-semibold text-err hover:bg-err-bg"
            >
              Disconnect
            </button>
          </>
        ) : null}
      </div>
      {msg ? (
        <div className="mt-3">
          <FormMessage state={msg} />
        </div>
      ) : null}
    </div>
  );
}

export function IntegrationsBoard({ rows, logs, encryptionReady, loadError }: { rows: IntegrationRow[]; logs: IntegrationLog[]; encryptionReady: boolean; loadError: boolean }) {
  const [editing, setEditing] = useState<Editing>(null);
  const categories = Object.keys(CATEGORIES).filter((c) => PROVIDERS.some((p) => p.category === c)) as Category[];

  return (
    <div className="space-y-6">
      {loadError ? (
        <p role="alert" className="rounded-lg bg-err-bg px-3 py-2 text-[13.5px] text-err">
          Couldn&apos;t load integrations. Refresh to try again.
        </p>
      ) : null}
      {!encryptionReady ? (
        <p role="alert" className="rounded-lg bg-warn-bg px-3 py-2.5 text-[13.5px] text-warn">
          <strong>INTEGRATIONS_ENCRYPTION_KEY</strong> isn&apos;t set on the server, so credentials can&apos;t be saved yet. Add it to the
          environment (see README → API &amp; Integrations), then redeploy.
        </p>
      ) : null}

      {categories.map((cat) => {
        const providers = PROVIDERS.filter((p) => p.category === cat);
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`}>
            <div className="mb-3">
              <h2 id={`cat-${cat}`} className="text-[18px] font-bold">
                {CATEGORIES[cat].label}
              </h2>
              <p className="text-[13.5px] text-muted">{CATEGORIES[cat].description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {providers.flatMap((def) => {
                const mine = rows.filter((r) => r.provider === def.id);
                if (def.multiple) {
                  return [
                    ...mine.map((row) => <IntegrationCard key={row.id} def={def} row={row} onConfigure={() => setEditing({ def, row })} />),
                    <button
                      key={`add-${def.id}`}
                      type="button"
                      onClick={() => setEditing({ def, row: null })}
                      className="card flex min-h-[150px] flex-col items-center justify-center gap-2 border-dashed p-4 text-center text-muted transition hover:border-ink/30 hover:text-ink"
                    >
                      <Plus className="h-5 w-5" aria-hidden />
                      <span className="text-[14.5px] font-semibold">Add {def.name.toLowerCase()}</span>
                      <span className="text-[12.5px]">{def.tagline}</span>
                    </button>,
                  ];
                }
                const row = mine[0] ?? null;
                return [<IntegrationCard key={def.id} def={def} row={row} onConfigure={() => setEditing({ def, row })} />];
              })}
            </div>
          </section>
        );
      })}

      <Panel title="Activity / Logs">
        {logs.length === 0 ? (
          <Empty>No activity yet. Connection tests and automation runs appear here.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13.5px]">
              <thead className="border-b border-line bg-surface-2 text-[12px] uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Time</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Integration</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Event</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((l) => (
                  <tr key={l.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted">{formatDateTime(l.created_at)}</td>
                    <td className="px-3 py-2.5 font-medium text-ink">{l.integration_name ?? l.provider}</td>
                    <td className="px-3 py-2.5">{EVENT_LABEL[l.event_type] ?? l.event_type}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-semibold capitalize ${LOG_TONE[l.status]}`}>{l.status}</span>
                    </td>
                    <td className="max-w-[360px] px-3 py-2.5 text-muted">{l.response_summary ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Keyed so each open starts with a fresh form and message. */}
      <ConfigDialog key={editing ? `${editing.def.id}-${editing.row?.id ?? "new"}` : "closed"} editing={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
