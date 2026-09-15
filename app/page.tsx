import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PLAN_TIERS, FEATURED_PLAN_CODE, inr, storageLabel } from "@/lib/plans-catalog";
import s from "./lp.module.css";

export const metadata: Metadata = {
  title: "Your own coaching app and website — VILMS",
  description: "Get your own branded app and website for your coaching institute. Courses, live classes, tests, fee collection and enquiries in one place. 0% commission on your fees. Free for 14 days.",
};

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");
const GROWTH = PLAN_TIERS.find((p) => p.code === "growth")!;
const BASE_TIER = PLAN_TIERS[0];
const TOP_TIER = PLAN_TIERS[PLAN_TIERS.length - 1];
const STUDENTS = 200;
const FEE_PER_STUDENT = 15_000;
const REVENUE = STUDENTS * FEE_PER_STUDENT;
const COMPARISON = [
  { name: "Commission-based plan", tier: "Entry tier", platform: 23_988, cutPct: 10, note: "Lower monthly fee, bigger cut" },
  { name: "Commission-based plan", tier: "Higher tier", platform: 1_19_988, cutPct: 5, note: "Higher monthly fee, smaller cut" },
  { name: "Fixed-fee plan", tier: "USD-priced", platform: 2_10_144, cutPct: 0, note: "No commission, but billed in USD" },
  { name: "VILMS", tier: GROWTH.name, platform: GROWTH.monthlyInr * 12, cutPct: 0, note: `Flat. Up to ${GROWTH.students.toLocaleString("en-IN")} students.`, us: true },
];
const totalFor = (r: { platform: number; cutPct: number }) => r.platform + Math.round((REVENUE * r.cutPct) / 100);
const PRICIEST_ALTERNATIVE = Math.max(...COMPARISON.filter((r) => !r.us).map(totalFor));
const SAVINGS = PRICIEST_ALTERNATIVE - totalFor(COMPARISON[COMPARISON.length - 1]);
const TRUST_ITEMS = [
  "Fees go straight into your own Razorpay account",
  "Your own domain, never ours",
  "Cancel anytime, no lock-in",
  "Built for Indian coaching institutes",
];
const PILLARS = [
  { n: "Own your brand", h: "Your logo. Your domain. Your app.", p: "Students enrol, pay and learn inside your institute's own identity — VILMS never appears anywhere they can see." },
  { n: "Keep your revenue", h: "0% commission, always.", p: "A flat monthly price and nothing else. Not a percentage today, not a percentage after you grow." },
  { n: "Run your institute", h: "One platform, not five tools.", p: "Courses, tests, live classes, fees and enquiries — in one place, instead of a website, an app, a payment link and a WhatsApp group." },
];
const WHAT_YOU_GET = [
  { h: "Your website", p: "A real website for your institute, not a profile page on someone else's site.", list: ["Course pages with fees and enrolment", "An enquiry form that fills your leads list", "Your own domain, or a free address to start on"] },
  { h: "Your branded app", p: "Your students download an app with your name and logo on it.", list: ["Classes, notes and tests inside the app", "Push notifications to your students", "Your brand on the icon and the splash screen"], note: `Branded Android app on ${GROWTH.name} and above. iOS app from ${PLAN_TIERS[2].name}. ${BASE_TIER.name} gives you the full platform and website, without a branded app.` },
  { h: "Your student portal", p: "One login where everything a student needs already lives.", list: ["Recorded classes on every plan; live classes from Growth", "Mock tests with instant results", "Notes, PDFs and past papers"] },
];
const FEATURES = [
  { h: "Courses, tests and mock tests", p: "Recorded, live or both. Unlimited courses, tests and mock tests on every plan — including the cheapest one." },
  { h: "Live classes", p: "Paste a Zoom or Meet link, take RSVPs and send reminders. Recordings stay inside your course, not on a public YouTube channel." },
  { h: "Answer evaluation with AI", p: "Students upload a photo of a handwritten answer sheet. AI drafts the marks and feedback; your teacher checks it and approves in one click." },
  { h: "Fee collection", p: "Students pay into your own Razorpay account, with your own GST invoices. The money never passes through us." },
  { h: "Enquiries and follow-up", p: "Every enquiry, sign-up and webinar RSVP lands in one list, with WhatsApp follow-up through your own Wati account." },
  { h: "Teachers and students", p: "Add teachers, assign batches, see who has enrolled, who has paid and who has gone quiet." },
];
const SUPPORT_LINE: Record<string, string> = {
  starter: "Self-serve, with a guided setup call if you want one.",
  growth: "Our team migrates your existing data for you.",
  scale: "Our team handles migration and advanced setup.",
  enterprise: "A dedicated manager, plus training for your faculty.",
};
type Row = { label: string; get: (p: (typeof PLAN_TIERS)[number]) => string };
const COMPARE_GROUPS: { group: string; rows: Row[] }[] = [
  { group: "Platform", rows: [
    { label: "Students", get: (p) => p.students.toLocaleString("en-IN") },
    { label: "Admin & faculty logins", get: (p) => (p.staffLogins === null ? "Unlimited" : String(p.staffLogins)) },
    { label: "Recorded courses", get: () => "Unlimited" },
    { label: "Tests & mock tests", get: () => "Unlimited" },
  ] },
  { group: "Live learning", rows: [
    { label: "Live-class minutes / month", get: (p) => (p.liveClassMinutesPerMonth === null ? "—" : `${p.liveClassMinutesPerMonth.toLocaleString("en-IN")} min`) },
  ] },
  { group: "Storage & evaluation", rows: [
    { label: "Video storage", get: (p) => storageLabel(p.storageGb) },
    { label: "Answer evaluations / month", get: (p) => p.answerEvalsPerMonth.toLocaleString("en-IN") },
  ] },
  { group: "Branding", rows: [
    { label: "Branded Android app", get: (p) => (p.androidApp ? "yes" : "no") },
    { label: "Branded iOS app", get: (p) => (p.iosApp ? "yes" : "no") },
  ] },
  { group: "Management", rows: [{ label: "Multi-branch / multi-batch", get: (p) => (p.multiBranch ? "yes" : "no") }] },
  { group: "Onboarding & support", rows: [
    { label: "Onboarding", get: (p) => p.onboarding },
    { label: "Support", get: (p) => p.support },
  ] },
];
const FAQ = [
  { q: "Do I need a card to start?", a: "No. The 14-day trial needs an email and a phone number, nothing else. Add a card only if you decide to keep going." },
  { q: "What happens when the trial ends?", a: `Nothing is deleted and nothing switches off in the middle of a class. Add a payment method to continue on your plan, or stay on ${BASE_TIER.name} at ${inr(BASE_TIER.monthlyInr)}/month.` },
  { q: "Can I use my own domain?", a: "Yes. Your logo, your colours, your domain — your students never see the word VILMS, not in the address and not in the emails." },
  { q: "Do I get my own branded app?", a: `The branded Android app is included from ${GROWTH.name} upward. ${BASE_TIER.name} gives you the full platform and your own website, without a branded app.` },
  { q: "Which plans include Android?", a: `${GROWTH.name}, ${PLAN_TIERS[2].name} and ${TOP_TIER.name}. Not ${BASE_TIER.name}.` },
  { q: "Which plans include iOS?", a: `${PLAN_TIERS[2].name} and ${TOP_TIER.name}. ${BASE_TIER.name} and ${GROWTH.name} don't include an iOS app.` },
  { q: "Can I change plans later?", a: "Yes, yourself, from the billing page. Upgrades apply immediately — no re-signup, no support ticket, nothing to move across." },
  { q: "Can you migrate my existing data?", a: `Yes, on ${GROWTH.name} and above — our team does the migration for you as part of onboarding. On ${BASE_TIER.name} you set up yourself, with a guided call if you want one.` },
  { q: "Do you provide faculty training?", a: `Yes, on ${TOP_TIER.name} — onboarding there includes training for your faculty, alongside a dedicated manager.` },
  { q: "How does fee collection work?", a: "Students pay directly into your own Razorpay account. We never touch the money, so there's nothing of yours for us to hold or delay." },
  { q: "Do you take a commission?", a: "No — on any plan, at any size, ever. That is the one promise this whole page is making." },
  { q: "Can I have multiple branches?", a: `Yes, from ${GROWTH.name} upward. ${BASE_TIER.name} is built for a single institute.` },
];

function DashboardPreview() {
  return (
    <div className={s.browser}>
      <div className={s.browserBar}><span className={s.dot} /><span className={s.dot} /><span className={s.dotBrass} /><span className={s.addr}>yourinstitute.vilms.in/dashboard</span></div>
      <div className={s.previewBody}>
        <div className={s.previewNav}>
          <div className={s.previewOrg}><span className={s.previewAvatar}>YI</span><div><div className={s.previewOrgName}>Your Institute</div><div className={s.previewOrgRole}>Owner</div></div></div>
          <div className={s.previewNavGroup}>Academy</div>
          <div className={`${s.previewNavItem} ${s.on}`}>Dashboard</div>
          <div className={s.previewNavItem}>Courses</div>
          <div className={s.previewNavItem}>Live classes</div>
          <div className={s.previewNavItem}>Grading &amp; AI</div>
          <div className={s.previewNavGroup}>Grow</div>
          <div className={s.previewNavItem}>Leads (CRM)</div>
          <div className={s.previewNavItem}>Messages</div>
        </div>
        <div className={s.previewMain}>
          <div className={s.previewBanner}>14 days left in your trial. No card on file yet.</div>
          <div className={s.previewGreeting}>Good morning</div>
          <div className={s.previewCard}><div className={s.previewCardTitle}>Your path to a first enquiry</div><div className={s.previewCardSub}>Add your logo → publish a free session → put your site online</div></div>
          <div className={s.previewMeters}>
            <div className={s.previewMeter}><div className={s.previewMeterLabel}>Leads</div><div className={s.previewMeterVal}>0</div></div>
            <div className={s.previewMeter}><div className={s.previewMeterLabel}>Students</div><div className={s.previewMeterVal}>0</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignLanding() {
  return (
    <div className={s.wrap}>
      <header className={s.bar}>
        <div className={s.logo}><span className={s.logoMark}>V</span><span className={s.logoText}>VILMS</span></div>
        <div className={s.navCtas}>
          <a href="#pricing" className={s.navGhost}>See pricing</a>
          <Link href={`/start?plan=${FEATURED_PLAN_CODE}`} className="btn btn-brass">Start free trial</Link>
        </div>
      </header>
      <section className={s.darkFade}>
        <div className={`${s.section} ${s.hero}`}>
          <div className={s.heroGrid}>
            <div>
              <span className={s.eyebrow}>◆ Built for coaching institutes</span>
              <h1 className={s.h1}>Your own coaching app<br />and website. <em>Live today.</em></h1>
              <p className={s.sub}>Run your courses, tests, live classes and fee collection under your own brand — with your own website, app and domain. Not a listing inside ours.</p>
              <div className={s.ctaRow}>
                <Link href={`/start?plan=${FEATURED_PLAN_CODE}`} className="btn btn-brass btn-lg">Start your 14-day free trial →</Link>
                <a href="#pricing" className={s.ctaGhostDark}>See pricing</a>
              </div>
              <div className={s.microTrust}><span>No card required</span><span>·</span><span>14 days free</span><span>·</span><span>0% commission</span></div>
              <div className={s.statRow}>
                <div className={s.stat}><div className={s.statNum}>0%</div><div className={s.statLabel}>Commission on your fees</div></div>
                <div className={s.stat}><div className={s.statNum}>{inr(BASE_TIER.monthlyInr)}</div><div className={s.statLabel}>To start, flat per month</div></div>
                <div className={s.stat}><div className={s.statNum}>~60s</div><div className={s.statLabel}>To get your address live</div></div>
              </div>
            </div>
            <div className={s.heroPreview}><DashboardPreview /></div>
          </div>
        </div>
        <div className={s.trustStrip}>{TRUST_ITEMS.map((t) => (<span key={t} className={s.trustItem}>{t}</span>))}</div>
      </section>
      <section className={s.band}>
        <div className={s.section}>
          <div className={s.pillars}>{PILLARS.map((p) => (<div key={p.n} className={s.pillar}><div className={s.pillarNum}>{p.n}</div><h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--ink)", margin: "0 0 10px" }}>{p.h}</h2><p>{p.p}</p></div>))}</div>
        </div>
      </section>
      <section className={s.bandAlt}>
        <div className={s.section}>
          <div className={s.kicker}><span className={s.eyebrowLight}>◆ 0% commission, on every plan</span></div>
          <h2 className={s.h2}>Keep 100% of your students&apos; fees.</h2>
          <p className={s.lede}>Most coaching platforms charge you a monthly fee <em>and</em> take 5–10% of every enrolment on top. We never take a cut. Not on any plan, not at any size.</p>
          <div className={s.bigStat}><div className={s.bigStatNum}>{rupees(SAVINGS)}</div><p className={s.bigStatLabel}>What an institute with {STUDENTS} students keeps in one year, on the {GROWTH.name} plan, by paying no commission — versus the priciest commission-based plan compared below.</p></div>
          <details className={s.tableDetails}>
            <summary className={s.tableSummary}>See the exact math</summary>
            <div className={s.tableCard}>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Plan type</th><th className={s.num} style={{ textAlign: "right" }}>Platform fee</th><th className={s.num} style={{ textAlign: "right" }}>Commission taken</th><th className={`${s.num} ${s.totalCol}`} style={{ textAlign: "right" }}>Total, year one</th></tr></thead>
                  <tbody>
                    {COMPARISON.map((r) => {
                      const cut = Math.round((REVENUE * r.cutPct) / 100);
                      return (
                        <tr key={`${r.name}-${r.tier}`} className={r.us ? s.rowUs : undefined}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span>{r.name} <span style={{ color: "var(--muted)", fontWeight: 400 }}>— {r.tier}</span></span>
                              <span className={s.cutChip} style={r.cutPct ? { background: "var(--warn-bg)", color: "var(--warn)" } : { background: "var(--ok-bg)", color: "var(--ok)" }}>{r.cutPct ? `${r.cutPct}% commission` : "0% commission"}</span>
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{r.note}</div>
                          </td>
                          <td className={s.num}>{rupees(r.platform)}</td>
                          <td className={s.num}>{cut ? rupees(cut) : "—"}</td>
                          <td className={`${s.num} ${s.totalCol}`}>{rupees(r.platform + cut)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className={s.tableNote}>Worked for an institute with <strong>{STUDENTS} students</strong> paying <strong>{rupees(FEE_PER_STUDENT)} a year</strong> — {rupees(REVENUE)} of fee income. Other figures are the publicly listed prices of comparable platforms in each category (USD converted at ₹88). VILMS is the {GROWTH.name} plan, all-in.</p>
          </details>
        </div>
      </section>
      <section className={s.band}>
        <div className={s.section}>
          <div className={s.kicker}><span className={s.eyebrowLight}>◆ How it works</span></div>
          <h2 className={s.h2}>Set up today. Teach tomorrow.</h2>
          <p className={s.lede}>Start instantly — then get the level of onboarding help your institute needs.</p>
          <div className={s.steps}>
            <div className={s.step}><div className={s.stepNum}>1</div><h3>Pick your plan</h3><p>{BASE_TIER.name}, {GROWTH.name}, {PLAN_TIERS[2].name} or {TOP_TIER.name}. 14 days free on any of them, no card needed.</p></div>
            <div className={s.step}><div className={s.stepNum}>2</div><h3>Set up your institute</h3><p>Add your details, your logo and your colours. Your address is ready in about a minute.</p></div>
            <div className={s.step}><div className={s.stepNum}>3</div><h3>Add courses &amp; students</h3><p>Add your content and invite students — or let our team migrate what you already have.</p></div>
            <div className={s.step}><div className={s.stepNum}>4</div><h3>Go live</h3><p>Share your institute&apos;s link. Students enrol, pay and start learning the same day.</p></div>
          </div>
        </div>
      </section>
      <section className={s.bandAlt}>
        <div className={s.section}>
          <div className={s.kicker}><span className={s.eyebrowLight}>◆ What you actually get</span></div>
          <h2 className={s.h2}>Everything your students see<br />has your name on it.</h2>
          <p className={s.lede}>Not a listing inside someone else&apos;s marketplace. Your institute, your address, your app.</p>
          <div className={s.grid}>
            {WHAT_YOU_GET.map((f) => (
              <div key={f.h} className={s.feat}>
                <h3>{f.h}</h3><p>{f.p}</p>
                <ul className={s.featList}>{f.list.map((li) => <li key={li}>{li}</li>)}</ul>
                {f.note && <p className={s.featNote}>{f.note}</p>}
              </div>
            ))}
          </div>
          <div className={s.grid} style={{ marginTop: 20 }}>
            {FEATURES.map((f) => (<div key={f.h} className={s.feat}><h3>{f.h}</h3><p>{f.p}</p></div>))}
          </div>
        </div>
      </section>
      <section id="pricing" className={s.band}>
        <div className={s.section}>
          <div className={s.kicker}><span className={s.eyebrowLight}>◆ All four plans, no commission on any</span></div>
          <h2 className={s.h2}>Pick a plan by how many<br />students you teach.</h2>
          <p className={s.lede}>Billed monthly. No lock-in. Same flat price at 100 students or {TOP_TIER.students.toLocaleString("en-IN")}.</p>
          <div className={s.plans}>
            {PLAN_TIERS.map((p) => {
              const featured = p.code === FEATURED_PLAN_CODE;
              return (
                <div key={p.code} className={`${s.plan} ${featured ? s.planFeatured : ""}`}>
                  {featured && <span className={s.planBadge}>Most popular</span>}
                  <div className={s.planName}>{p.name}</div><p className={s.planBlurb}>{p.blurb}</p>
                  <div className={s.planPrice}>{inr(p.monthlyInr)}</div>
                  <div className={s.planUnit}>/month · up to {p.students.toLocaleString("en-IN")} students</div>
                  <div className={s.planCta}><Link href={`/start?plan=${p.code}`} className={`btn btn-block btn-sm ${featured ? "btn-brass" : "btn-ghost"}`}>Start on {p.name}</Link></div>
                </div>
              );
            })}
          </div>
          <p className={s.tableNote}>All prices exclude 18% GST. Teaching more than {TOP_TIER.students.toLocaleString("en-IN")} students? <a href="mailto:hello@vilms.in">Write to us for a quote</a>.</p>
        </div>
      </section>
      <section className={s.bandAlt}>
        <div className={s.section}>
          <div className={s.kicker}><span className={s.eyebrowLight}>◆ Every detail, side by side</span></div>
          <h2 className={s.h2}>Compare all four plans</h2>
          <p className={s.lede}>The same numbers as the cards above, broken down in full.</p>
          <div className={s.tableCard}>
            <div className={s.tableWrap}>
              <table className={s.compareTable}>
                <thead><tr><th scope="col">Plan</th>{PLAN_TIERS.map((p) => (<th scope="col" key={p.code} className={p.code === FEATURED_PLAN_CODE ? s.featuredCol : undefined}>{p.name}</th>))}</tr></thead>
                <tbody>
                  {COMPARE_GROUPS.map((g) => (
                    <Fragment key={g.group}>
                      <tr className={s.compareGroupRow}><td colSpan={PLAN_TIERS.length + 1}>{g.group}</td></tr>
                      {g.rows.map((row) => (
                        <tr key={row.label}>
                          <th scope="row">{row.label}</th>
                          {PLAN_TIERS.map((p) => {
                            const val = row.get(p);
                            const featured = p.code === FEATURED_PLAN_CODE;
                            if (val === "yes") return <td key={p.code} className={featured ? s.featuredCol : undefined}><span className={s.yes}>✓</span></td>;
                            if (val === "no") return <td key={p.code} className={featured ? s.featuredCol : undefined}><span className={s.no}>—</span></td>;
                            return <td key={p.code} className={featured ? s.featuredCol : undefined}>{val}</td>;
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <section className={s.band}>
        <div className={s.section}>
          <div className={s.kicker}><span className={s.eyebrowLight}>◆ Onboarding</span></div>
          <h2 className={s.h2}>Start instantly. Get the onboarding<br />support your institute needs.</h2>
          <p className={s.lede}>Every plan starts the moment you sign up. What differs is how much of the setup we do for you.</p>
          <div className={s.onboardGrid}>
            {PLAN_TIERS.map((p) => {
              const featured = p.code === FEATURED_PLAN_CODE;
              return (
                <div key={p.code} className={`${s.onboardCard} ${featured ? s.featured : ""}`}>
                  <div className={s.onboardPlan}>{p.name}</div>
                  <div className={s.onboardText}>{p.onboarding}</div>
                  <div className={s.onboardSupport}>{SUPPORT_LINE[p.code]} Support: {p.support}.</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className={s.bandAlt}>
        <div className={s.narrow}>
          <div className={s.kicker}><span className={s.eyebrowLight}>◆ Before you start</span></div>
          <h2 className={s.h2}>Questions institutes usually ask</h2>
          <div className={s.faq} style={{ marginTop: 36 }}>{FAQ.map((f) => (<div key={f.q} className={s.faqItem}><h3>{f.q}</h3><p>{f.a}</p></div>))}</div>
        </div>
      </section>
      <section className={`${s.dark} ${s.close}`}>
        <div className={s.section}>
          <h2 className={`${s.h2} ${s.h2Light}`}>Your institute can be online<br />in about a minute.</h2>
          <p className={s.ledeLight} style={{ marginBottom: 30 }}>14 days free. No card. No commission on your fees — ever.</p>
          <div className={s.ctaRow} style={{ justifyContent: "center" }}>
            <Link href={`/start?plan=${FEATURED_PLAN_CODE}`} className="btn btn-brass btn-lg">Start your 14-day free trial →</Link>
            <a href="#pricing" className={s.ctaGhostDark}>See pricing</a>
          </div>
        </div>
      </section>
      <footer className={s.footer}><div className={s.footInner}>© {new Date().getFullYear()} VILMS · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="mailto:hello@vilms.in">hello@vilms.in</a></div></footer>
      <div className={s.stickyBar}><Link href={`/start?plan=${FEATURED_PLAN_CODE}`} className="btn btn-brass btn-lg btn-block">Start your 14-day free trial</Link></div>
    </div>
  );
}
