import type { Metadata } from "next";
import { brand } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How the VILMS website handles the details you share with us and the analytics we collect.",
  alternates: { canonical: "/privacy" },
};

// Plain-language notice for this marketing website. Have it reviewed by your
// legal advisor before relying on it.
export default function PrivacyPage() {
  return (
    <article>
      <header className="sec-dark noise overflow-hidden pb-16 pt-[130px]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="glow -left-24 -top-20 h-[420px] w-[420px] bg-iris/35" />
        </div>
        <div className="wrap max-w-3xl">
          <p className="kicker on-dark">Privacy</p>
          <h1 className="display mt-4 text-[clamp(38px,5vw,60px)]">Privacy policy</h1>
          <p className="mt-3 text-[14px] text-white/55">For the VILMS website ({brand.domain}). Last updated October 2026.</p>
        </div>
      </header>
      <div className="wrap max-w-3xl py-14 sm:py-20">
        <div className="space-y-8 text-[15.5px] leading-relaxed text-slate-600 [&_h2]:font-display [&_h2]:text-night">
          <section>
            <h2 className="text-[22px] font-bold">What we collect when you contact us</h2>
            <p className="mt-2">
              When you book a demo or ask to start a trial, we collect what you type into the form: your name, institute
              name, work email, phone number, city, institute type, number of students and any optional details you add.
              We also record when you submitted it and which page or advert brought you to us (for example a
              campaign tag in the link).
            </p>
          </section>
          <section>
            <h2 className="text-[22px] font-bold">Why we use it</h2>
            <p className="mt-2">
              Only to respond to your enquiry: a member of the VILMS team may call, WhatsApp or email you about it.
              We do not sell your details. You agree to this contact when you tick the consent box on the form.
            </p>
          </section>
          <section>
            <h2 className="text-[22px] font-bold">Website analytics</h2>
            <p className="mt-2">
              We measure how the site is used — pages viewed and buttons clicked — with a random identifier stored in
              your browser. We don&apos;t use fingerprinting and we don&apos;t store your IP address in readable form. If your
              browser sends a Global Privacy Control or Do Not Track signal, we don&apos;t record this activity.
            </p>
          </section>
          <section>
            <h2 className="text-[22px] font-bold">Where it&apos;s stored and who can see it</h2>
            <p className="mt-2">
              Enquiries are stored in a database hosted in India (Mumbai region). Only signed-in members of the VILMS
              team can view them.
            </p>
          </section>
          <section>
            <h2 className="text-[22px] font-bold">Your choices</h2>
            <p className="mt-2">
              To see, correct or delete the details you sent us, email{" "}
              <a href={`mailto:${brand.emails.general}`} className="font-semibold text-ink underline underline-offset-2">
                {brand.emails.general}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
