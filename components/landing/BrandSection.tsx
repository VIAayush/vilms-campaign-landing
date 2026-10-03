"use client";

import { useId, useRef, useState } from "react";
import { Check, Lock } from "lucide-react";
import { Cta } from "@/components/site/Cta";
import { brandStudio } from "@/lib/landing";
import { useInView } from "./hooks";
import { AppWindow, CertificateScreen, EmailScreen, PhoneApp, SiteScreen, slugify } from "./screens";

type Surface = (typeof brandStudio.surfaces)[number]["id"];

export function BrandSection() {
  const [name, setName] = useState("Your Institute");
  const [color, setColor] = useState<string>(brandStudio.swatches[0]);
  const [surface, setSurface] = useState<Surface>("site");
  const [ownDomain, setOwnDomain] = useState(false);
  const id = useId();
  const stamp = useRef<HTMLParagraphElement>(null);
  const struck = useInView(stamp, { once: true, margin: "-20% 0px" });

  const display = name.trim() || "Your Institute";
  const slug = slugify(display);
  const host = ownDomain ? `learn.${slug}.in` : `${slug}.vilms.in`;

  // The live preview. Desktop shows it in the right column (unchanged); phones
  // show it right under the heading so the effect of typing is visible.
  const preview = (phone: boolean) => (
    <>
          <div role="tablist" aria-label="Branded surfaces" className={phone ? "no-bar -mx-5 mb-4 flex gap-1.5 overflow-x-auto px-5" : "mb-5 flex flex-wrap gap-1.5"}>
            {brandStudio.surfaces.map((s) => (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={surface === s.id}
                onClick={() => setSurface(s.id)}
                className={`rounded-full px-4 py-2 text-[14px] font-semibold transition ${phone ? "min-h-[44px] shrink-0" : ""} ${surface === s.id ? "bg-night text-white" : "bg-snow text-slate-500 hover:text-night"}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className={phone ? "relative min-h-[340px]" : "relative min-h-[420px]"}>
            {surface === "site" && (
              <AppWindow key="site" url={host} className="pop">
                <SiteScreen name={display} />
              </AppWindow>
            )}
            {surface === "certificate" && (
              <div key="cert" className="pop app mx-auto max-w-[520px] bg-[#F7F8FC]">
                <CertificateScreen name={display} />
                <p className="flex items-center justify-center gap-1.5 pb-4 font-mono text-[11px] text-slate-400">
                  <Lock className="h-3 w-3" aria-hidden /> Verified at {host}
                </p>
              </div>
            )}
            {surface === "email" && (
              <div key="email" className="pop app mx-auto max-w-[560px] bg-[#F7F8FC]">
                <EmailScreen name={display} />
              </div>
            )}
            {surface === "app" && (
              <div key="app" className="pop py-4">
                <PhoneApp name={display} />
                <p className="mt-4 text-center text-[12.5px] text-slate-500">Your own branded app — Android from Growth, iOS too from Scale.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[12px] text-slate-400">Illustrative preview · nothing you type is saved</p>
            <Cta intent="trial" location="brand_studio" className={phone ? "b b-cta w-full" : "b b-cta b-sm"}>
              Put my brand on VILMS
            </Cta>
          </div>
    </>
  );

  return (
    <section id="brand" aria-labelledby="brand-title" className="relative overflow-hidden bg-white py-24 max-sm:py-20 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full opacity-25 blur-[100px]" style={{ background: color, transition: "background 0.6s" }} />
      <div className="wrap relative grid items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0">
          <p className="kicker" data-reveal>
            {brandStudio.kicker}
          </p>
          <h2 id="brand-title" className="h2 mt-4" data-reveal="blur" data-delay="1">
            {brandStudio.titleTop}
            <br />
            <span className="text-slate-300">{brandStudio.titleBottom}</span>
          </h2>
          <p className="lead-text mt-5 max-w-[500px]" data-reveal data-delay="2">
            {brandStudio.sub}
          </p>

          <div className="mt-8 lg:hidden" style={{ "--brand": color } as React.CSSProperties}>
            {preview(true)}
          </div>

          <div className="mt-9 rounded-[24px] border border-slate-200 bg-snow p-5 sm:p-6" data-reveal="scale">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">Try it with your brand</p>
            <label htmlFor={`${id}-name`} className="mt-4 block text-[13.5px] font-semibold">
              Your institute&apos;s name
            </label>
            <input
              id={`${id}-name`}
              value={name}
              maxLength={32}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] outline-none max-sm:min-h-[48px] max-sm:text-[16px] transition focus:border-iris focus:ring-4 focus:ring-iris-100"
            />
            <fieldset className="mt-4">
              <legend className="text-[13.5px] font-semibold">Brand colour</legend>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {brandStudio.swatches.map((c) => (
                  <label key={c} className="relative cursor-pointer">
                    <input type="radio" name={`${id}-color`} value={c} checked={color === c} onChange={() => setColor(c)} className="peer sr-only" />
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full ring-offset-2 transition peer-checked:ring-2 peer-checked:ring-slate-400 peer-focus-visible:ring-2 peer-focus-visible:ring-aqua"
                      style={{ background: c }}
                    >
                      {color === c && <Check className="h-4 w-4 text-white" aria-hidden />}
                    </span>
                    <span className="sr-only">{c}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mt-4 flex items-center gap-2.5 text-[14px]">
              <input type="checkbox" checked={ownDomain} onChange={(e) => setOwnDomain(e.target.checked)} className="h-4 w-4 accent-iris" />
              Use my own domain
            </label>
          </div>

          <p ref={stamp} className="mt-8 flex flex-wrap items-center gap-3 text-[15px] text-slate-500">
            <span className="relative font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Powered by VILMS
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-rose-400 transition-[width] duration-700 ease-out"
                style={{ width: struck ? "100%" : "0%" }}
              />
            </span>
            <span className="font-semibold text-night">Students never see VILMS.</span>
          </p>
        </div>

        <div className="max-lg:hidden" style={{ "--brand": color } as React.CSSProperties}>
          {preview(false)}
        </div>
      </div>
    </section>
  );
}
