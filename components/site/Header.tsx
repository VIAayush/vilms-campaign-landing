"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { nav } from "@/lib/content";
import { Logo } from "./Logo";
import { Cta } from "./Cta";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled ? "border-white/10 bg-ink/95 backdrop-blur-md" : "border-transparent bg-ink"
      }`}
    >
      <div className="container-x flex h-[68px] items-center gap-6">
        <Link href="/" aria-label="VILMS home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-[14.5px] font-medium text-white/75 transition hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Cta intent="trial" location="header_trial" className="hidden text-[14.5px] font-semibold text-white/85 transition hover:text-white md:inline-flex">
            Start free trial
          </Cta>
          <Cta intent="demo" location="header" className="btn-brass min-h-[40px] px-4 text-[14px]">
            Book a Demo
          </Cta>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/10 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" hidden={!open} className="border-t border-white/10 bg-ink lg:hidden">
        <nav aria-label="Mobile" className="container-x flex flex-col py-3">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-[16px] font-medium text-white/85 hover:bg-white/5"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-2 grid gap-2 border-t border-white/10 pt-4" onClick={() => setOpen(false)}>
            <Cta intent="trial" location="mobile_menu_trial" className="btn-ghost-dark w-full">
              Start your 14-day free trial
            </Cta>
          </div>
        </nav>
      </div>
    </header>
  );
}
