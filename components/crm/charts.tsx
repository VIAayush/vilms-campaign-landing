import Link from "next/link";
import { formatNumber, formatShortDate, pct } from "@/lib/crm/format";

export type BarItem = { key: string; label: string; count: number; href?: string };

/** Horizontal bars, largest first. Server-rendered, no chart library. */
export function BarList({ items, empty = "No data in this period." }: { items: BarItem[]; empty?: string }) {
  const total = items.reduce((s, i) => s + i.count, 0);
  const max = Math.max(1, ...items.map((i) => i.count));
  if (!items.length || total === 0) return <p className="px-4 py-6 text-center text-[13px] text-faint">{empty}</p>;
  return (
    <ul className="space-y-2.5 px-4 py-4">
      {items.map((i) => {
        const label = i.href ? (
          <Link href={i.href} className="truncate hover:underline">{i.label}</Link>
        ) : (
          <span className="truncate">{i.label}</span>
        );
        return (
          <li key={i.key}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="min-w-0 truncate font-medium text-ink">{label}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {formatNumber(i.count)} <span className="text-faint">· {pct(i.count, total)}</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper-2">
              <div className="h-full rounded-full bg-ink-500" style={{ width: `${(i.count / max) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Daily leads as SVG columns, with an accessible table fallback. */
export function DailyChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);
  const w = 720;
  const h = 180;
  const gap = data.length > 60 ? 1 : 3;
  const bw = Math.max(1, (w - gap * (data.length - 1)) / Math.max(1, data.length));
  const ticks = [0, Math.ceil(max / 2), max];

  return (
    <div className="px-4 py-4">
      {total === 0 ? (
        <p className="py-10 text-center text-[13px] text-faint">No leads in this period yet.</p>
      ) : (
        <svg viewBox={`0 0 ${w} ${h + 22}`} className="h-auto w-full" role="img" aria-label={`Leads per day, ${total} in total`}>
          {ticks.map((t) => {
            const y = h - (t / max) * h;
            return (
              <g key={t}>
                <line x1={0} x2={w} y1={y} y2={y} stroke="#E7E4DB" strokeDasharray={t === 0 ? undefined : "3 4"} />
                <text x={w} y={y - 3} textAnchor="end" fontSize="10" fill="#98A19C">{t}</text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const bh = (d.count / max) * h;
            const x = i * (bw + gap);
            return (
              <g key={d.day}>
                <rect x={x} y={h - bh} width={bw} height={Math.max(bh, d.count ? 2 : 0)} rx={Math.min(3, bw / 2)} fill="#2A6E59">
                  <title>{`${formatShortDate(`${d.day}T12:00:00+05:30`)}: ${d.count}`}</title>
                </rect>
              </g>
            );
          })}
          {data.length > 0 && (
            <>
              <text x={0} y={h + 16} fontSize="10.5" fill="#5F6B66">{formatShortDate(`${data[0].day}T12:00:00+05:30`)}</text>
              <text x={w} y={h + 16} fontSize="10.5" fill="#5F6B66" textAnchor="end">
                {formatShortDate(`${data[data.length - 1].day}T12:00:00+05:30`)}
              </text>
            </>
          )}
        </svg>
      )}
    </div>
  );
}

export type FunnelStep = { label: string; value: number };

export function Funnel({ title, steps }: { title?: string; steps: FunnelStep[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <div className="px-4 py-4">
    {title && <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-wide text-faint">{title}</p>}
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        return (
          <li key={s.label} className="grid grid-cols-[minmax(0,150px)_1fr_auto] items-center gap-3 text-[13px] sm:grid-cols-[180px_1fr_120px]">
            <span className="font-medium text-ink">{s.label}</span>
            <div className="h-7 overflow-hidden rounded-md bg-paper-2">
              <div
                className="h-full rounded-md bg-ink-600"
                style={{ width: `${Math.max((s.value / max) * 100, s.value ? 4 : 0)}%` }}
              />
            </div>
            <span className="text-right tabular-nums">
              <span className="font-semibold text-ink">{formatNumber(s.value)}</span>
              {prev !== null && <span className="block text-[11.5px] text-faint">{pct(s.value, prev)} of previous</span>}
            </span>
          </li>
        );
      })}
    </ol>
    </div>
  );
}
