"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { features } from "@/lib/content";
import { track } from "@/lib/client/tracking";
import { MOCKS } from "../mocks";
import { Cta } from "../Cta";
import { TrackView } from "../TrackView";

export function Features() {
  const [active, setActive] = useState(features[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = features.find((f) => f.id === active) ?? features[0];
  const Mock = tab.mock ? MOCKS[tab.mock] : null;

  const select = (id: string, focus = false) => {
    setActive(id);
    track("feature_view", id);
    if (focus) tabRefs.current[features.findIndex((f) => f.id === id)]?.focus();
  };

  // Arrow-key navigation, per the WAI-ARIA tabs pattern.
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = features.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    select(features[next].id, true);
  };

  return (
    <section id="features" className="bg-paper py-20 sm:py-28" aria-labelledby="features-title">
      <TrackView name="feature_view" label="section" />
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" data-reveal>
          <div className="max-w-2xl">
            <p className="eyebrow">04 — Features</p>
            <h2 id="features-title" className="h-section mt-3">Everything your institute runs on. In one place.</h2>
            <p className="lede mt-4">
              You enrol, teach, evaluate, follow up and get paid — from one login, under your own brand.
            </p>
          </div>
          <Cta intent="demo" location="features" className="btn-ink shrink-0" arrow>
            See it in a demo
          </Cta>
        </div>

        <div
          role="tablist"
          aria-label="Feature categories"
          className="mt-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {features.map((f, i) => {
            const selected = f.id === active;
            return (
              <button
                key={f.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${f.id}`}
                aria-selected={selected}
                aria-controls={`panel-${f.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(f.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-[14px] font-semibold transition ${
                  selected ? "bg-ink text-white shadow-lift" : "border border-line bg-surface text-ink hover:border-ink/30"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          tabIndex={0}
          className="mt-6 grid animate-fade-up gap-10 rounded-xl2 border border-line bg-surface p-5 shadow-card sm:p-8 lg:grid-cols-[1fr_1.05fr]"
        >
          <div>
            <h3 className="text-[26px] font-bold leading-tight sm:text-[32px]">{tab.title}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">{tab.sub}</p>
            <div className="mt-6 space-y-7">
              {tab.groups.map((g) => (
                <div key={g.title}>
                  <p className="flex items-center gap-2 font-display text-[16px] font-bold text-ink">
                    {g.title}
                    <span className="rounded-full bg-brass-tint px-2 py-0.5 font-mono text-[11px] font-medium text-brass-text">
                      {String(g.items.length).padStart(2, "0")}
                    </span>
                  </p>
                  <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {g.items.map((it) => (
                      <li key={it.title} className="flex gap-2.5">
                        <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-ok" />
                        <span>
                          <span className="block text-[14.5px] font-semibold text-ink">{it.title}</span>
                          <span className="block text-[13.5px] leading-snug text-muted">{it.text}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            {Mock ? <Mock /> : null}
            <p className="mt-4 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Illustrative interface</p>
          </div>
        </div>
      </div>
    </section>
  );
}
