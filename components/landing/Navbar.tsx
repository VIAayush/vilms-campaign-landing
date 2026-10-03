"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpen, ChevronDown, ClipboardCheck, IndianRupee, Menu, Palette, Users, UsersRound, X } from "lucide-react";
import { Cta } from "@/components/site/Cta";
import { SIGNIN_URL } from "@/lib/env";
import { navProduct } from "@/lib/landing";
import { useScrollFrame } from "./hooks";
import { LogoMark } from "./screens";

const ICONS = { teach: BookOpen, assess: ClipboardCheck, grow: Users, payments: IndianRupee, brand: Palette, manage: UsersRound } as const;

const MOBILE_LINKS = [
  { href: "/#solutions", label: "Solutions" },
  { href: "/#pricing", label: "Pricing" },
];
const MOBILE_LINK =
  "flex min-h-[60px] w-full items-center justify-between border-b border-white/10 text-left font-display text-[22px] font-medium tracking-tight text-white";

const LINKS = [
  { href: "/#solutions", label: "Solutions" },
  { href: "/#why", label: "Why VILMS" },
  { href: "/#pricing", label: "Pricing" },
];

/** Tells the product showcase which module to open (see Showcase.tsx). */
export function openShowcaseTab(tab: string) {
  window.dispatchEvent(new CustomEvent("vilms:showcase", { detail: tab }));
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [product, setProduct] = useState(false);
  const [features, setFeatures] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  useScrollFrame(() => {
    const y = window.scrollY;
    setScrolled(y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.current?.style.setProperty("transform", `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`);
  });

  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const productHref = pathname === "/" ? "#product" : "/#product";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
      <div
        className={`pointer-events-auto relative mx-auto flex max-w-[1240px] items-center gap-2 rounded-2xl border px-3 transition-all duration-300 sm:px-4 ${
          scrolled
            ? "h-[58px] border-white/10 bg-night/75 shadow-[0_20px_50px_-25px_rgba(0,0,0,.8)] backdrop-blur-xl"
            : "h-[66px] border-transparent bg-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 rounded-lg pr-2 text-white max-lg:min-h-[44px]" aria-label="VILMS home">
          <LogoMark className="h-8 w-8" />
          <span className="font-display text-[19px] font-semibold tracking-tight">VILMS</span>
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => {
              window.clearTimeout(closeTimer.current);
              setProduct(true);
            }}
            onMouseLeave={() => {
              closeTimer.current = window.setTimeout(() => setProduct(false), 140);
            }}
          >
            <button
              type="button"
              aria-expanded={product}
              aria-controls="nav-product"
              onClick={() => setProduct((v) => !v)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-[14.5px] font-medium text-white/75 transition hover:text-white"
            >
              Product <ChevronDown className={`h-3.5 w-3.5 transition ${product ? "rotate-180" : ""}`} aria-hidden />
            </button>
            <div
              id="nav-product"
              hidden={!product}
              className="absolute left-0 top-full w-[560px] pt-3"
              onKeyDown={(e) => e.key === "Escape" && setProduct(false)}
            >
              <div className="grid grid-cols-[1fr_190px] gap-2 rounded-2xl border border-white/10 bg-night-2/95 p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)] backdrop-blur-xl">
                <ul className="grid grid-cols-2 gap-1 p-1">
                  {navProduct.map((item) => {
                    const Icon = ICONS[item.tab];
                    return (
                      <li key={item.tab}>
                        <a
                          href={productHref}
                          onClick={() => {
                            openShowcaseTab(item.tab);
                            setProduct(false);
                          }}
                          className="group flex gap-3 rounded-xl p-3 transition hover:bg-white/[0.06]"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-iris-300 transition group-hover:text-aqua">
                            <Icon className="h-[18px] w-[18px]" aria-hidden />
                          </span>
                          <span>
                            <span className="block text-[14px] font-semibold text-white">{item.label}</span>
                            <span className="block text-[12.5px] leading-snug text-white/50">{item.text}</span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-col justify-between rounded-xl p-4" style={{ background: "linear-gradient(160deg, rgba(91,91,246,.35), rgba(34,211,238,.12))" }}>
                  <div>
                    <p className="font-display text-[16px] font-semibold leading-tight text-white">See it on your institute&apos;s setup</p>
                    <p className="mt-1.5 text-[12.5px] text-white/60">A 30-minute walkthrough of what moves over.</p>
                  </div>
                  <Cta intent="demo" location="nav_product_menu" className="b b-cta b-sm mt-4 w-full">
                    Book a Demo
                  </Cta>
                </div>
              </div>
            </div>
          </div>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-white/75 transition hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <a href={SIGNIN_URL} className="hidden rounded-lg px-3 py-2 text-[14px] font-medium text-white/75 transition hover:text-white md:block">
            Sign in
          </a>
          {/* Visibility lives on wrappers: the .b button class sets its own display. */}
          <span className="hidden sm:contents">
            <Cta intent="demo" location="nav" className="b b-cta b-sm">
              Book a Demo
            </Cta>
          </span>
          <span className="hidden xl:contents">
            <Cta intent="trial" location="nav_trial" className="b b-glass b-sm">
              Start Free Trial
            </Cta>
          </span>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl text-white lg:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="absolute inset-x-4 bottom-0 h-px overflow-hidden" aria-hidden>
          <div ref={bar} className={`h-px origin-left bg-gradient-to-r from-iris via-violet to-aqua transition-opacity ${scrolled ? "opacity-100" : "opacity-0"}`} style={{ transform: "scaleX(0)" }} />
        </div>
      </div>

      {/* Mobile menu (lg:hidden — the desktop nav above is unchanged) */}
      <div
        id="mobile-nav"
        inert={!menu}
        className={`fixed inset-0 top-0 -z-10 overflow-y-auto bg-night/[0.98] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[92px] backdrop-blur-xl transition-[opacity,transform] duration-300 ease-out lg:hidden ${
          menu ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex min-h-full flex-col">
          <ul className="border-t border-white/10">
            <li>
              <a href={productHref} onClick={() => setMenu(false)} className={MOBILE_LINK}>
                Product <ArrowRight className="h-5 w-5 text-white/35" aria-hidden />
              </a>
            </li>
            <li>
              <button type="button" aria-expanded={features} aria-controls="mobile-features" onClick={() => setFeatures((v) => !v)} className={MOBILE_LINK}>
                Features <ChevronDown className={`h-5 w-5 text-white/35 transition-transform duration-300 ${features ? "rotate-180" : ""}`} aria-hidden />
              </button>
              <div
                id="mobile-features"
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${features ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <ul className="grid min-h-0 grid-cols-2 gap-2 overflow-hidden pt-3" inert={!features}>
                  {navProduct.map((item) => {
                    const Icon = ICONS[item.tab];
                    return (
                      <li key={item.tab}>
                        <a
                          href={productHref}
                          onClick={() => {
                            openShowcaseTab(item.tab);
                            setMenu(false);
                          }}
                          className="flex min-h-[48px] items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[15px] font-medium text-white"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-aqua" aria-hidden /> {item.label}
                        </a>
                      </li>
                    );
                  })}
                  <li className="col-span-2 h-2" aria-hidden />
                </ul>
              </div>
            </li>
            {MOBILE_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} onClick={() => setMenu(false)} className={MOBILE_LINK}>
                  {l.label} <ArrowRight className="h-5 w-5 text-white/35" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <a href={SIGNIN_URL} className="mt-5 inline-flex min-h-[44px] items-center text-[15px] font-medium text-white/60">
            Already a customer? <span className="ml-1.5 text-white">Sign in</span>
          </a>
          {/* Close the menu as the lead form opens over it. */}
          <div className="mt-auto grid gap-2.5 pt-8" onClickCapture={() => setMenu(false)}>
            <Cta intent="demo" location="mobile_menu" className="b b-cta h-[54px] w-full text-[16px]" arrow>
              Book a Demo
            </Cta>
            <Cta intent="trial" location="mobile_menu_trial" className="b b-glass w-full">
              Start 14-Day Free Trial
            </Cta>
          </div>
        </nav>
      </div>
    </header>
  );
}
