"use client";

import { useState } from "react";
import { audience } from "@/lib/content";
import { audienceVisual } from "@/lib/landing";
import { AppWindow, CertificateScreen, CheckItem, LiveClassScreen, ManageModule, MaterialsScreen, PaymentScreen, TestScreen } from "./screens";

const VISUALS = {
  batch: { url: "admin/live-classes", node: <LiveClassScreen /> },
  mock: { url: "admin/evaluations", node: <TestScreen /> },
  certificate: { url: "admin/certificates", node: <CertificateScreen /> },
  team: { url: "admin/team", node: <ManageModule /> },
  invoice: { url: "admin/payments", node: <PaymentScreen /> },
  materials: { url: "materials", node: <MaterialsScreen /> },
};

const short = (t: string) => t.replace(" — paid programmes", "").replace(" & exam-prep centres", "");

export function AudienceSection() {
  const [i, setI] = useState(0);
  const item = audience.items[i];
  const visual = VISUALS[audienceVisual[item.title]];

  return (
    <section id="solutions" aria-labelledby="aud-title" className="relative overflow-hidden py-24 max-sm:py-20 sm:py-32" style={{ background: "linear-gradient(180deg, #F6F7FB 0%, #EEF0FF 100%)" }}>
      <div className="wrap">
        <div className="max-w-[760px]">
          <p className="kicker" data-reveal>
            {audience.eyebrow}
          </p>
          <h2 id="aud-title" className="h2 mt-4" data-reveal="blur" data-delay="1">
            {audience.title}
          </h2>
          <p className="lead-text mt-4 max-w-[620px]" data-reveal data-delay="2">
            {audience.sub}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div role="tablist" aria-label="Who VILMS is for" aria-orientation="vertical" className="no-bar -mx-5 min-w-0 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
            {audience.items.map((a, idx) => {
              const on = idx === i;
              return (
                <button
                  key={a.title}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="aud-panel"
                  onClick={() => setI(idx)}
                  className={`group w-auto shrink-0 rounded-2xl text-left transition max-lg:min-h-[44px] lg:block lg:w-full ${
                    on ? "bg-night px-4 py-2.5 text-white lg:bg-white lg:p-5 lg:text-night lg:shadow-[0_24px_60px_-36px_rgba(11,16,32,.55)]" : "bg-white/60 px-4 py-2.5 text-slate-600 hover:bg-white lg:bg-transparent lg:px-5 lg:py-4"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`hidden font-mono text-[11px] lg:inline ${on ? "text-iris" : "text-slate-400"}`}>0{idx + 1}</span>
                    <span className={`whitespace-nowrap font-display font-semibold tracking-tight lg:whitespace-normal ${on ? "text-[15px] lg:text-[21px]" : "text-[15px] lg:text-[19px]"}`}>
                      {short(a.title)}
                    </span>
                  </span>
                  {on && (
                    <span className="pop mt-2 hidden pl-8 text-[14.5px] leading-relaxed text-slate-600 lg:block">{a.text}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div id="aud-panel" role="tabpanel" aria-label={item.title} className="min-w-0">
            <div key={item.title} className="pop">
              <p className="text-[16px] leading-relaxed text-slate-600 lg:hidden">{item.text}</p>
              <ul className="mt-4 flex flex-wrap gap-2 lg:mt-0">
                {item.tags.map((t) => (
                  <li key={t} className="rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-iris-600 ring-1 ring-iris-100">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="relative mt-6">
                <div aria-hidden className="absolute -inset-8 rounded-[40px] opacity-70 blur-2xl" style={{ background: "radial-gradient(60% 60% at 60% 40%, rgba(91,91,246,.25), transparent 70%)" }} />
                <AppWindow url={`yourinstitute.vilms.in/${visual.url}`} className="relative" bodyClass="min-h-[320px] bg-[#F7F8FC]">
                  {visual.node}
                </AppWindow>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-[28px] bg-night p-6 text-white sm:p-8" data-reveal="scale">
          <p className="font-display text-[20px] font-semibold tracking-tight">VILMS is a strong fit if…</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {audience.fit.map((f) => (
              <CheckItem key={f} dark>
                {f}
              </CheckItem>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
