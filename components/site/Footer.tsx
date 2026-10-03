import Link from "next/link";
import { brand, nav } from "@/lib/content";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-ink-900 text-white/70">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed">
            The all-in-one learning platform for coaching institutes. {brand.tagline}
          </p>
        </div>
        <div>
          <p className="eyebrow-dark">Explore</p>
          <ul className="mt-4 space-y-2.5 text-[14.5px]">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-white">{n.label}</a>
              </li>
            ))}
            <li><Link href="/demo" className="hover:text-white">Book a demo</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow-dark">Contact</p>
          <ul className="mt-4 space-y-2.5 text-[14.5px]">
            <li>General &amp; support · <a href={`mailto:${brand.emails.general}`} className="text-white hover:text-brass-soft">{brand.emails.general}</a></li>
            <li>Billing · <a href={`mailto:${brand.emails.billing}`} className="text-white hover:text-brass-soft">{brand.emails.billing}</a></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-[12.5px] text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} VILMS · Built for Indian coaching institutes.</p>
          <p>All prices exclude 18% GST. Interface visuals are illustrative.</p>
        </div>
      </div>
    </footer>
  );
}
