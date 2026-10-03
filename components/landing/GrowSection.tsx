"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Download, FileDown, LayoutTemplate, MessageCircle, Workflow, type LucideIcon } from "lucide-react";
import { Cta } from "@/components/site/Cta";
import { grow } from "@/lib/landing";
import { useInView, useReducedMotion } from "./hooks";

type Lead = { name: string; source: string };
const LEADS: Lead[] = [
  { name: "Rahul K.", source: "Google Ads" },
  { name: "Sneha P.", source: "Free PDF" },
  { name: "Aman V.", source: "Meta ad" },
  { name: "Isha M.", source: "Webinar" },
  { name: "Karan S.", source: "Landing page" },
  { name: "Divya R.", source: "Google Ads" },
  { name: "Arjun T.", source: "Free PDF" },
];
const START = [0, 0, 0, 1, 2, 3, 0];
const FEATURE_ICONS: LucideIcon[] = [Workflow, MessageCircle, FileDown, LayoutTemplate, BarChart3, Download];
const COL_DOT = ["bg-iris", "bg-violet", "bg-aqua", "bg-emerald-500"];
const CARD_H = 58;
const GAP = 8;
const MAX_ROWS = 5;

type Board = { col: number[]; order: number[]; seq: number; last: { lead: number; to: number } | null };
const initial = (): Board => ({ col: [...START], order: START.map((_, i) => i), seq: LEADS.length, last: null });

// Moves the most-advanced lead that isn't enrolled yet; resets when everyone is.
function step(b: Board): Board {
  const candidates = b.col.map((c, i) => ({ c, i })).filter((x) => x.c < 3);
  if (!candidates.length || b.col.filter((c) => c === 3).length >= MAX_ROWS) return initial();
  candidates.sort((x, y) => y.c - x.c || b.order[x.i] - b.order[y.i]);
  const { i } = candidates[0];
  const col = [...b.col];
  col[i] += 1;
  const order = [...b.order];
  order[i] = b.seq;
  return { col, order, seq: b.seq + 1, last: { lead: i, to: col[i] } };
}

const NOTE = ["", "WhatsApp reminder sent for the webinar", "Checkout link opened · ₹15,000", "Paid via your Razorpay · enrolled"];

export function GrowSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduced = useReducedMotion();
  const [board, setBoard] = useState<Board>(initial);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setBoard(step), 1700);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  // Row of each card within its column, by arrival order.
  const rows = useMemo(() => {
    const r: number[] = [];
    for (let c = 0; c < 4; c++) {
      board.col
        .map((col, i) => ({ col, i }))
        .filter((x) => x.col === c)
        .sort((a, b) => board.order[a.i] - board.order[b.i])
        .forEach((x, row) => (r[x.i] = row));
    }
    return r;
  }, [board]);
  const counts = [0, 1, 2, 3].map((c) => board.col.filter((x) => x === c).length);

  return (
    <section id="crm" aria-labelledby="crm-title" className="relative overflow-hidden bg-snow py-24 max-sm:py-20 sm:py-32">
      <div aria-hidden className="grid-bg-light pointer-events-none absolute inset-0" />
      <div className="wrap relative">
        <div className="grid items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="kicker" data-reveal>
              {grow.kicker}
            </p>
            <h2 id="crm-title" className="h2 mt-4 max-w-[720px]" data-reveal="blur" data-delay="1">
              {grow.title}
            </h2>
          </div>
          <div data-reveal data-delay="2">
            <p className="lead-text">{grow.sub}</p>
            <Cta intent="demo" location="crm_section" className="b b-dark mt-6 max-sm:w-full" arrow>
              Book a Demo
            </Cta>
          </div>
        </div>

        <div ref={ref} className="relative mt-14" data-reveal="scale">
          {/* Phones: the same pipeline as a vertical stage list */}
          <ol className="space-y-2.5 md:hidden" aria-label="Lead pipeline (illustrative)">
            {grow.columns.map((c, ci) => (
              <li key={c} className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_16px_40px_-30px_rgba(11,16,32,.5)]">
                <p className="flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${COL_DOT[ci]}`} /> {c}
                  <span className="ml-auto rounded-full bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-400 ring-1 ring-slate-200">{counts[ci]}</span>
                </p>
                <ul className="mt-2.5 flex min-h-[36px] flex-wrap gap-1.5">
                  {LEADS.map((l, i) =>
                    board.col[i] === ci ? (
                      <li
                        key={`${l.name}-${board.order[i]}`}
                        className={`m-pop flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[13px] font-medium ring-1 ${
                          board.last?.lead === i ? "bg-iris-50 text-iris-600 ring-iris-300" : "bg-slate-50 text-slate-700 ring-slate-200"
                        }`}
                      >
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[10px] font-semibold text-iris-600 ring-1 ring-iris-100">
                          {l.name.slice(0, 1)}
                          {l.name.split(" ")[1]?.[0]}
                        </span>
                        {l.name}
                      </li>
                    ) : null,
                  )}
                </ul>
              </li>
            ))}
          </ol>
          {board.last && NOTE[board.last.to] ? (
            <p key={`m-${board.seq}`} className="m-pop mt-3 flex items-center gap-2 text-[13px] text-slate-600 md:hidden" aria-hidden>
              <MessageCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                <span className="font-semibold text-night">{LEADS[board.last.lead].name}</span> · {NOTE[board.last.to]}
              </span>
            </p>
          ) : null}

          <div className="no-bar overflow-x-auto rounded-[28px] border border-slate-200/80 bg-white p-3 shadow-[0_40px_90px_-50px_rgba(11,16,32,.5)] max-md:hidden sm:p-4">
            <div className="relative min-w-[720px]" style={{ height: 52 + MAX_ROWS * (CARD_H + GAP) }}>
              {grow.columns.map((c, ci) => (
                <div key={c} className="absolute top-0 h-full px-1.5" style={{ left: `${ci * 25}%`, width: "25%" }}>
                  <div className="h-full rounded-2xl bg-slate-50/80">
                    <p className="flex items-center gap-2 px-3 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                      <span className={`h-2 w-2 rounded-full ${COL_DOT[ci]}`} /> {c}
                      <span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-slate-400 ring-1 ring-slate-200">{counts[ci]}</span>
                    </p>
                  </div>
                </div>
              ))}
              {LEADS.map((l, i) => {
                const moved = board.last?.lead === i;
                return (
                  <div
                    key={l.name}
                    className="absolute px-3 transition-[left,top] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                    style={{ left: `${board.col[i] * 25}%`, top: 44 + rows[i] * (CARD_H + GAP), width: "25%", height: CARD_H }}
                  >
                    <div
                      className={`flex h-full items-center gap-2.5 rounded-xl border bg-white px-3 shadow-sm transition-shadow duration-500 ${
                        moved ? "border-iris-300 shadow-[0_12px_30px_-12px_rgba(91,91,246,.55)]" : "border-slate-200/80"
                      }`}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-iris-50 text-[11px] font-semibold text-iris-600">
                        {l.name.slice(0, 1)}
                        {l.name.split(" ")[1]?.[0]}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold">{l.name}</span>
                        <span className="block truncate text-[11px] text-slate-500">{l.source}</span>
                      </span>
                      {board.col[i] >= 1 && <MessageCircle className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-500" aria-label="WhatsApp follow-up sent" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {board.last && NOTE[board.last.to] ? (
            <div key={board.seq} className="toast pop absolute -bottom-5 right-4 flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] max-md:hidden sm:right-8" aria-hidden>
              <span className={`h-2 w-2 rounded-full ${COL_DOT[board.last.to]}`} />
              <span className="font-semibold">{LEADS[board.last.lead].name}</span>
              <span className="text-slate-500">{NOTE[board.last.to]}</span>
            </div>
          ) : null}
          <p className="mt-8 text-[12px] text-slate-400">Illustrative pipeline · sample leads</p>
        </div>

        <ul className="mt-14 grid gap-x-10 gap-y-8 max-sm:mt-10 max-sm:gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {grow.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <li key={f.title} className="flex gap-4" data-reveal data-delay={String((i % 3) + 1)}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-iris shadow-[0_10px_30px_-16px_rgba(91,91,246,.6)] ring-1 ring-slate-200/70">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-[17px] font-semibold tracking-tight">{f.title}</span>
                  <span className="mt-1 block text-[14.5px] text-slate-600">{f.text}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
