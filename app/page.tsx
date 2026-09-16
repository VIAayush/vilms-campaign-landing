import Link from "next/link";
import type { Metadata } from "next";
import { PLAN_TIERS, FEATURED_PLAN_CODE, inr } from "@/lib/plans-catalog";
import { Reveal, CountUp } from "./Reveal";
import { DashboardMock, PhoneFrame, CoursesMock, GradingMock, BillingMock, LeadsMock, StudentsMock, SiteMock } from "./ui";
import s from "./lp.module.css";

// Campaign landing page — visual redesign pass (see docs/PRICING_V2_ONBOARDING.md).
// Business logic, copy and CTA targets are unchanged from the previous version;
// only the visual composition and information hierarchy changed. See that doc
// for the section-by-section rationale.
export const metadata: Metadata = {
  title: "Your own coaching app and website — VILMS",
  description:
    "Get your own branded app and website for your coaching institute. Courses, live classes, tests, fee collection and enquiries in one place. 0% commission on your fees. Free for 14 days.",
  openGraph: {
    title: "Your own coaching app and website — VILMS",
    description: "Courses, live classes, tests, fee collection and enquiries — under your own brand. 0% commission, ever. 14-day free trial.",
    type: "website",
  },
};

const GROWTH = PLAN_TIERS.find((p) => p.code === "growth")!;
const BASE_TIER = PLAN_TIERS[0];
const TOP_TIER = PLAN_TIERS[PLAN_TIERS.length - 1];

// Identical worked example and arithmetic as the previous version — only the
// visual presentation changed. 200 students x Rs 15,000/yr fee income; a
// 10%-commission platform's cut alone is Rs 3,00,000, on top of its own
// platform fee, versus VILMS Growth's flat Rs 14,388/yr.
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
const OTHER_COMMISSION = Math.round((REVENUE * 10) / 100); // the headline 10%-platform figure the equation below builds toward
const VILMS_ANNUAL = GROWTH.monthlyInr * 12;
const SAVINGS = PRICIEST_ALTERNATIVE - totalFor(COMPARISON[COMPARISON.length - 1]);

const CAPABILITIES = [
  { n: "01", h: "Teach", p: "Recorded courses, live classes, or both — unlimited on every plan, including the cheapest one.", mock: <CoursesMock /> },
  { n: "02", h: "Assess", p: "Tests, mock tests, and answer evaluation — students upload a photo, AI drafts the grade, a mentor approves it.", mock: <GradingMock /> },
  { n: "03", h: "Collect", p: "Fees straight into your own Razorpay account, with your own GST invoices. The money never passes through us.", mock: <BillingMock /> },
  { n: "04", h: "Manage", p: "Students, faculty, branches and batches — who has enrolled, who has paid, who has gone quiet.", mock: <StudentsMock /> },
  { n: "05", h: "Grow", p: "Every enquiry, sign-up and webinar RSVP lands in one pipeline, with WhatsApp follow-up through your own account.", mock: <LeadsMock /> },
];

const ONBOARDING_STEPS = [
  { n: "01", h: "Pick your plan", p: "14-day free trial. No card required." },
  { n: "02", h: "Set up your institute", p: "Details, logo, colours." },
  { n: "03", h: "Add courses & students", p: "Your content, your students, your faculty." },
  { n: "04", h: "Go live", p: "Share your link. Students enrol and learn." },
];

// Short progression labels over each plan's real onboarding string (unchanged
// from lib/plans-catalog.ts) — a compact header, not a new claim.
const STAGE_LABEL: Record<string, string> = {
  starter: "Self-serve", growth: "Migration", scale: "Migration", enterprise: "Migration + training",
};

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

export default function CampaignLanding() {
  return (
    <div className={s.wrap}>
      {/* --------------------------------------------------------- nav --- */}
      <header className={s.bar}>
        <div className={s.logo}><span className={s.logoMark}>V</span><span className={s.logoText}>VILMS</span></div>
        <div className={s.navCtas}>
          <a href="#pricing" className={s.navGhost}>See pricing</a>
          <Link href={`/start?plan=${FEATURED_PLAN_CODE}`} className="btn btn-brass">Start free trial</Link>
        </div>
      </header>

      {/* -------------------------------------------------------- hero --- */}
      <section className={s.hero}>
        <div className={s.aurora} aria-hidden>
          <span className={s.auroraBlob1} />
          <span className={s.auroraBlob2} />
          <span className={s.auroraBlob3} />
        </div>
        <div className={s.heroTop}>
          {/* Never fades: the hero headline is the first thing a visitor sees
              and must never depend on JS/observer timing to become visible. */}
          <div className={s.heroCopy}>
            <h1 className={s.h1}>
              Your own coaching app<br />and website. <em>Live today.</em>
            </h1>
            <p className={s.heroSub}>
              Run your courses, tests, live classes and fee collection under your own brand —
              with your own website, app and domain. Not a listing inside ours.
            </p>
            <div className={s.ctaRow}>
              <Link href={`/start?plan=${FEATURED_PLAN_CODE}`} className="btn btn-brass btn-lg">Start your 14-day free trial →</Link>
              <a href="#pricing" className={s.ctaGhostDark}>See pricing</a>
            </div>
            <p className={s.microTrust}>No card required · 14 days free · 0% commission</p>
          </div>
        </div>

        <Reveal className={s.statStrip} delay={100}>
          <div className={s.statCell}>
            <div className={s.statBig}><CountUp value={0} suffix="%" /></div>
            <div className={s.statTag}>Commission</div>
          </div>
          <div className={s.statDiv} />
          <div className={s.statCell}>
            <div className={s.statBig}>{inr(BASE_TIER.monthlyInr)}</div>
            <div className={s.statTag}>Starting price</div>
          </div>
          <div className={s.statDiv} />
          <div className={s.statCell}>
            <div className={s.statBig}>~60 sec</div>
            <div className={s.statTag}>To get started</div>
          </div>
        </Reveal>

        <Reveal className={s.heroShowcase} delay={150}>
          <div className={s.showcaseMain}><DashboardMock /></div>
          <div className={s.showcaseSideA}><PhoneFrame><CoursesMock /></PhoneFrame></div>
          <div className={s.showcaseSideB}><BillingMock /></div>
        </Reveal>
      </section>

      {/* ---------------------------------------------- three propositions -- */}
      <section className={s.band}>
        <div className={s.section}>
          <Reveal className={s.propRow}>
            <div className={s.propLabel}>01</div>
            <div className={s.propText}>
              <h2 className={s.propHead}>Own your brand</h2>
              <p className={s.propBody}>Your logo. Your domain. Your app. Students enrol, pay and learn inside your institute&apos;s own identity — VILMS never appears anywhere they can see.</p>
            </div>
            <div className={s.propVisual}><SiteMock /></div>
          </Reveal>

          <Reveal className={`${s.propRow} ${s.propRowAlt}`} delay={80}>
            <div className={s.propLabel}>02</div>
            <div className={s.propText}>
              <h2 className={s.propHead}>Keep your revenue</h2>
              <p className={s.propBody}>A flat monthly price and nothing else. Not a percentage today, not a percentage after you grow.</p>
            </div>
            <div className={s.propVisualNum}>0%</div>
          </Reveal>

          <Reveal className={s.propRow} delay={160}>
            <div className={s.propLabel}>03</div>
            <div className={s.propText}>
              <h2 className={s.propHead}>Run your institute</h2>
              <p className={s.propBody}>One platform, not five disconnected tools — courses, tests, live classes, fees and enquiries in one place.</p>
            </div>
            <div className={s.propChain}>
              {["Courses", "Tests", "Live classes", "Payments", "Leads"].map((n, i, arr) => (
                <span key={n} className={s.propChainItem}>{n}{i < arr.length - 1 && <span className={s.propChainArrow}>→</span>}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------- 0% commission story -- */}
      <section className={s.dark}>
        <div className={s.section}>
          <Reveal>
            <span className={s.eyebrowDark}>0% commission, on every plan</span>
            <h2 className={`${s.h2} ${s.h2Light}`}>Keep 100% of your students&apos; fees.</h2>
          </Reveal>

          <Reveal className={s.equation} delay={80}>
            <div className={s.eqBlock}><div className={s.eqNum}><CountUp value={STUDENTS} /></div><div className={s.eqLabel}>Your students</div></div>
            <div className={s.eqOp}>×</div>
            <div className={s.eqBlock}><div className={s.eqNum}>{inr(FEE_PER_STUDENT)}</div><div className={s.eqLabel}>Annual fee</div></div>
            <div className={s.eqOp}>=</div>
            <div className={s.eqBlock}><div className={s.eqNum}>{inr(REVENUE)}</div><div className={s.eqLabel}>Fees collected</div></div>
          </Reveal>

          <Reveal className={s.versus} delay={140}>
            <div className={s.versusSide}>
              <div className={s.versusLabel}>Other platform</div>
              <div className={s.versusVal}>{inr(OTHER_COMMISSION)}</div>
              <div className={s.versusNote}>10% commission, on top of its own fee</div>
            </div>
            <div className={s.versusMid}>vs</div>
            <div className={`${s.versusSide} ${s.versusUs}`}>
              <div className={s.versusLabel}>VILMS, {GROWTH.name}</div>
              <div className={s.versusVal}>{inr(VILMS_ANNUAL)}<span className={s.versusPerYear}>/year, flat</span></div>
              <div className={s.versusNote}>No commission. Ever.</div>
            </div>
          </Reveal>

          <Reveal className={s.conclusion} delay={200}>
            <div className={s.conclusionNum}>{inr(SAVINGS)}</div>
            <p className={s.conclusionText}>kept in one year, at this size — and the gap widens every student you add.</p>
          </Reveal>

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
                          <td className={s.num}>{inr(r.platform)}</td>
                          <td className={s.num}>{cut ? inr(cut) : "—"}</td>
                          <td className={`${s.num} ${s.totalCol}`}>{inr(r.platform + cut)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className={s.tableNote}>Worked for an institute with <strong>{STUDENTS} students</strong> paying <strong>{inr(FEE_PER_STUDENT)} a year</strong>. Other figures are the publicly listed prices of comparable platforms in each category (USD converted at ₹88). VILMS is the {GROWTH.name} plan, all-in.</p>
            </div>
          </details>
        </div>
      </section>

      {/* ------------------------------------------ own-brand showcase --- */}
      <section className={s.band}>
        <div className={s.section}>
          <Reveal className={s.showcaseHead}>
            <h2 className={s.h2}>Everything your students see<br />has your name on it.</h2>
            <p className={s.lede}>Not a listing inside someone else&apos;s marketplace. Your institute, your address, your app.</p>
          </Reveal>
          <Reveal className={s.brandShowcase} delay={100}>
            <div className={s.brandShowcaseMain}><SiteMock /></div>
            <div className={s.brandShowcaseSide}><PhoneFrame><CoursesMock /></PhoneFrame></div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------- onboarding timeline -- */}
      <section className={s.bandAlt}>
        <div className={s.section}>
          <Reveal>
            <span className={s.eyebrow}>How it works</span>
            <h2 className={s.h2}>Set up today. Teach tomorrow.</h2>
          </Reveal>
          <Reveal className={s.timeline} delay={80}>
            {ONBOARDING_STEPS.map((step, i) => (
              <div key={step.n} className={s.timelineStep}>
                <div className={s.timelineNum}>{step.n}</div>
                <h3>{step.h}</h3>
                <p>{step.p}</p>
                {i < ONBOARDING_STEPS.length - 1 && <div className={s.timelineLine} aria-hidden />}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------- product showcase --- */}
      <section className={s.dark}>
        <div className={s.section}>
          <Reveal>
            <span className={s.eyebrowDark}>One platform, everything connected</span>
            <h2 className={`${s.h2} ${s.h2Light}`}>What&apos;s actually running underneath.</h2>
          </Reveal>
          <Reveal className={s.bigShowcase} delay={100}>
            <div className={s.bigShowcaseMain}><DashboardMock /></div>
            <div className={s.bigShowcaseGrid}>
              <CoursesMock /><GradingMock /><BillingMock /><LeadsMock />
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------- capabilities --- */}
      <section className={s.band}>
        <div className={s.section}>
          <Reveal>
            <h2 className={s.h2}>Everything your institute needs.<br />One platform.</h2>
          </Reveal>
          <div className={s.capList}>
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.n} className={`${s.capRow} ${i % 2 === 1 ? s.capRowAlt : ""}`} delay={i * 60}>
                <div className={s.capText}>
                  <div className={s.capNum}>{c.n}</div>
                  <h3 className={s.capHead}>{c.h}</h3>
                  <p className={s.capBody}>{c.p}</p>
                </div>
                <div className={s.capVisual}>{c.mock}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- pricing --- */}
      <section id="pricing" className={s.bandAlt}>
        <div className={s.section}>
          <Reveal>
            <span className={s.eyebrow}>All four plans, no commission on any</span>
            <h2 className={s.h2}>Pick a plan by how many<br />students you teach.</h2>
          </Reveal>

          <Reveal className={s.priceRow} delay={80}>
            {PLAN_TIERS.map((p, i) => {
              const featured = p.code === FEATURED_PLAN_CODE;
              const stage = ["Starting out", "Growing institute", "Established institute", "Large operation"][i];
              return (
                <div key={p.code} className={`${s.priceCol} ${featured ? s.priceColFeatured : ""}`}>
                  <div className={s.priceStage}>{stage}</div>
                  <div className={s.priceName}>{p.name}</div>
                  <div className={s.priceNum}>{inr(p.monthlyInr)}<span className={s.pricePer}>/mo</span></div>
                  <div className={s.priceMeta}>up to {p.students.toLocaleString("en-IN")} students</div>
                  <p className={s.priceBlurb}>{p.blurb}</p>
                  <Link href={`/start?plan=${p.code}`} className={`btn btn-block ${featured ? "btn-brass" : "btn-ghost"}`}>Start on {p.name}</Link>
                </div>
              );
            })}
          </Reveal>
          <p className={s.tableNote}>All prices exclude 18% GST. Teaching more than {TOP_TIER.students.toLocaleString("en-IN")} students? <a href="mailto:hello@vilms.in">Write to us for a quote</a>.</p>
        </div>
      </section>

      {/* --------------------------------------------- cost per student --- */}
      <section className={s.band}>
        <div className={s.section}>
          <Reveal>
            <span className={s.eyebrow}>What it costs per student</span>
            <h2 className={s.h2}>The bigger you are, the cheaper it gets.</h2>
          </Reveal>
          <Reveal className={s.perStudentRow} delay={80}>
            {PLAN_TIERS.map((p, i) => (
              <div key={p.code} className={s.perStudentCell}>
                <div className={s.perStudentNum}>₹{(p.monthlyInr / p.students).toFixed(2)}</div>
                <div className={s.perStudentLabel}>{p.name}</div>
                {i < PLAN_TIERS.length - 1 && <div className={s.perStudentDiv} />}
              </div>
            ))}
          </Reveal>
          <p className={s.tableNote} style={{ marginTop: 8 }}>Rupees per student, per month, at each plan&apos;s own student limit.</p>
        </div>
      </section>

      {/* ------------------------------------------- plan onboarding --- */}
      <section className={s.bandAlt}>
        <div className={s.section}>
          <Reveal>
            <span className={s.eyebrow}>Onboarding</span>
            <h2 className={s.h2}>Start instantly. Get the onboarding<br />support your institute needs.</h2>
          </Reveal>
          <Reveal className={s.onboardProgress} delay={80}>
            {PLAN_TIERS.map((p, i, arr) => (
              <div key={p.code} className={s.onboardStage}>
                <div className={s.onboardStageLabel}>{STAGE_LABEL[p.code]}</div>
                <div className={s.onboardStagePlan}>{p.name}</div>
                <div className={s.onboardStageText}>{p.onboarding}</div>
                {i < arr.length - 1 && <div className={s.onboardArrow} aria-hidden>→</div>}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- faq --- */}
      <section className={s.band}>
        <div className={s.narrow}>
          <Reveal><h2 className={s.h2}>Questions institutes usually ask</h2></Reveal>
          <Reveal className={s.faqList} delay={80}>
            {FAQ.map((f) => (
              <details key={f.q} className={s.faqItem}>
                <summary className={s.faqQ}>{f.q}</summary>
                <p className={s.faqA}>{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- close --- */}
      <section className={`${s.dark} ${s.close}`}>
        <div className={s.section}>
          <Reveal>
            <h2 className={`${s.h2} ${s.h2Light} ${s.closeH2}`}>Your institute can be online<br />in about a minute.</h2>
            <p className={s.ledeLight}>14 days free. No card. No commission on your fees — ever.</p>
            <div className={s.ctaRow} style={{ justifyContent: "center" }}>
              <Link href={`/start?plan=${FEATURED_PLAN_CODE}`} className="btn btn-brass btn-lg">Start your 14-day free trial →</Link>
              <a href="#pricing" className={s.ctaGhostDark}>See pricing</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ footer --- */}
      <footer className={s.footer}>
        <div className={s.footInner}>© {new Date().getFullYear()} VILMS · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="mailto:hello@vilms.in">hello@vilms.in</a></div>
      </footer>

      <div className={s.stickyBar}>
        <Link href={`/start?plan=${FEATURED_PLAN_CODE}`} className="btn btn-brass btn-lg btn-block">Start your 14-day free trial</Link>
      </div>
    </div>
  );
}
