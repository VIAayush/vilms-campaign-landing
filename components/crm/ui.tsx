import Link from "next/link";
import { LEAD_STATUSES, priorityLabel, statusLabel } from "@/lib/lead-options";

const TONES: Record<string, string> = {
  info: "bg-info-bg text-info",
  neutral: "bg-paper-2 text-ink-700",
  brass: "bg-brass-tint text-brass-text",
  warn: "bg-warn-bg text-warn",
  ok: "bg-ok-bg text-ok",
  okStrong: "bg-ok text-white",
  muted: "bg-paper-2 text-faint",
  err: "bg-err-bg text-err",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = LEAD_STATUSES.find((s) => s.value === status)?.tone ?? "neutral";
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${TONES[tone]}`}>
      {statusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone = priority === "high" ? TONES.err : priority === "low" ? TONES.muted : TONES.neutral;
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${tone}`}>
      {priorityLabel(priority)}
    </span>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-bold leading-tight sm:text-[30px]">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Kpi({ label, value, hint, href, tone }: { label: string; value: React.ReactNode; hint?: string; href?: string; tone?: "warn" | "err" | "ok" }) {
  const toneCls = tone === "err" ? "text-err" : tone === "warn" ? "text-warn" : tone === "ok" ? "text-ok" : "text-ink";
  const body = (
    <>
      <p className="text-[12.5px] font-medium text-muted">{label}</p>
      <p className={`mt-1 font-display text-[28px] font-bold leading-none ${toneCls}`}>{value}</p>
      {hint && <p className="mt-1.5 text-[12px] text-faint">{hint}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="card block p-4 transition hover:border-ink/30 hover:shadow-lift">
      {body}
    </Link>
  ) : (
    <div className="card p-4">{body}</div>
  );
}

export function Panel({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="font-sans text-[14.5px] font-semibold tracking-normal text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-8 text-center text-[13.5px] text-faint">{children}</p>;
}

export function FormMessage({ state }: { state?: { error?: string; ok?: string } | null }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={`rounded-lg px-3 py-2 text-[13px] font-medium ${state.error ? "bg-err-bg text-err" : "bg-ok-bg text-ok"}`}
    >
      {state.error ?? state.ok}
    </p>
  );
}
