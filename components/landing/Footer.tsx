import Link from "next/link";
import { brand } from "@/lib/content";
import { SIGNIN_URL } from "@/lib/env";
import { LogoMark } from "./screens";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#product", label: "Platform overview" },
      { href: "/#teach", label: "Courses & live classes" },
      { href: "/#ai", label: "AI-assisted evaluation" },
      { href: "/#crm", label: "Lead CRM" },
      { href: "/#brand", label: "White-label" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#solutions", label: "Who it's for" },
      { href: "/#why", label: "0% revenue share" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/demo", label: "Book a demo" },
      { href: SIGNIN_URL, label: "Sign in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night text-white/65">
      <div className="hairline" />
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" className="flex w-fit items-center gap-2.5 text-white" aria-label="VILMS home">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-[21px] font-semibold tracking-tight">VILMS</span>
          </Link>
          <p className="mt-5 max-w-[300px] text-[14.5px] leading-relaxed">The all-in-one learning platform for coaching institutes.</p>
          <p className="mt-3 font-display text-[16px] font-medium tracking-tight text-white">{brand.tagline}</p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-[14.5px]">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") && !l.href.includes("#") ? (
                    <Link href={l.href} className="transition hover:text-white">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="transition hover:text-white">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">Contact</p>
          <ul className="mt-4 space-y-2.5 text-[14.5px]">
            <li>
              General &amp; support ·{" "}
              <a href={`mailto:${brand.emails.general}`} className="text-white hover:text-aqua">
                {brand.emails.general}
              </a>
            </li>
            <li>
              Billing ·{" "}
              <a href={`mailto:${brand.emails.billing}`} className="text-white hover:text-aqua">
                {brand.emails.billing}
              </a>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:text-white">
                Privacy policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-6 text-[12.5px] text-white/40 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} VILMS · Built for Indian coaching institutes.</p>
          <p>All prices exclude 18% GST. Interface visuals are illustrative.</p>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none select-none text-center font-display text-[22vw] font-semibold leading-[0.8] tracking-[-0.06em] text-white/[0.03]">
        VILMS
      </p>
    </footer>
  );
}
