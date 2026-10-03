import {
  Award,
  BadgeCheck,
  Check,
  CircleDollarSign,
  Database,
  Download,
  FileText,
  GripVertical,
  KeyRound,
  Lock,
  MapPin,
  MessageCircle,
  Paperclip,
  PencilLine,
  Play,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

// Recreations of the brochure's illustrative interface visuals.

function Browser({ url, badge, children, className = "" }: { url: string; badge?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-surface shadow-float ${className}`}>
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="ml-2 flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-paper px-2.5 py-1 font-mono text-[11px] text-muted">
          <Lock aria-hidden className="h-3 w-3 shrink-0" />
          <span className="truncate">{url}</span>
        </span>
        {badge ? (
          <span className="hidden shrink-0 rounded-md bg-brass-tint px-2 py-1 font-mono text-[10.5px] text-brass-text sm:inline">{badge}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function AppShell({ active, children }: { active: string; children: React.ReactNode }) {
  const items = ["Courses", "Live classes", "Materials", "Tests", "Leads", "Payments"];
  return (
    <div className="grid overflow-hidden rounded-2xl border border-line bg-surface shadow-lift sm:grid-cols-[150px_1fr]">
      <aside className="hidden bg-ink p-3 text-[12px] text-white/70 sm:block">
        <div className="mb-3 flex items-center gap-2 px-1 font-display text-[13px] font-bold text-white">
          <span className="grid h-5 w-5 place-items-center rounded bg-paper text-[11px] text-ink">V</span> VILMS
        </div>
        {items.map((i) => (
          <div key={i} className={`mb-0.5 rounded-md px-2 py-1.5 ${i === active ? "bg-white/10 font-semibold text-white" : ""}`}>
            {i}
          </div>
        ))}
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function HeroMock() {
  const lessons = [
    { n: "01", t: "Orientation & study plan", tag: "Preview", tone: "bg-ok-bg text-ok" },
    { n: "02", t: "Polity essentials", tag: "Unlocks in 7 days", tone: "bg-brass-tint text-brass-text" },
    { n: "03", t: "Mock test 1 · answer writing", tag: "Coming soon", tone: "bg-paper-2 text-muted" },
  ];
  return (
    <div className="relative">
      <div className="absolute -right-2 -top-6 z-10 hidden animate-float-y items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-lift sm:flex">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-ok-bg text-ok"><Check aria-hidden className="h-4 w-4" /></span>
        <span className="text-left">
          <span className="block text-[13px] font-bold text-ink">Payment received · ₹15,000</span>
          <span className="block text-[12px] text-muted">Paid straight to your Razorpay</span>
        </span>
      </div>

      <Browser url="learn.youracademy.in" badge="Your brand · your domain">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-ink font-display text-[11px] font-bold text-white">YA</span>
          <span className="font-display text-[14px] font-bold text-ink">Your Academy</span>
          <span className="ml-auto hidden gap-4 text-[12px] text-muted md:flex">
            <span>Courses</span><span>Free materials</span><span>Webinars</span><span>Sign in</span>
          </span>
        </div>
        <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="inline-block rounded-md bg-ink-50 px-2 py-1 font-mono text-[10.5px] tracking-wider text-ink-600">HYBRID · RECORDED + LIVE</span>
            <p className="mt-3 font-display text-[22px] font-bold leading-tight text-ink">Prelims Foundation Batch</p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-muted">
              <li className="flex items-center gap-2"><Video aria-hidden className="h-3.5 w-3.5 text-ink-600" /> Weekly live classes, recordings inside</li>
              <li className="flex items-center gap-2"><PencilLine aria-hidden className="h-3.5 w-3.5 text-ink-600" /> Answer writing with mentor evaluation</li>
              <li className="flex items-center gap-2"><Award aria-hidden className="h-3.5 w-3.5 text-ink-600" /> Certificate on completion</li>
            </ul>
            <div className="mt-4 flex items-center gap-3">
              <span className="font-display text-[22px] font-bold text-ink">₹15,000</span>
              <span className="rounded-lg bg-ink px-3 py-2 text-[12px] font-semibold text-white">Enrol now</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative grid aspect-[16/8] place-items-center rounded-xl bg-gradient-to-br from-ink-600 to-ink-700">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90"><Play aria-hidden className="ml-0.5 h-4 w-4 fill-ink text-ink" /></span>
              <span className="absolute bottom-2 left-3 font-mono text-[10.5px] text-white/80">Free preview lesson</span>
            </div>
            {lessons.map((l) => (
              <div key={l.n} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2">
                <span className="font-mono text-[10.5px] text-faint">{l.n}</span>
                <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink">{l.t}</span>
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${l.tone}`}>{l.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </Browser>

      <div className="absolute -bottom-7 -left-3 z-10 hidden animate-float-y items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-lift [animation-delay:1.5s] sm:flex">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brass-tint text-brass-text"><Sparkles aria-hidden className="h-4 w-4" /></span>
        <span className="text-left">
          <span className="block text-[13px] font-bold text-ink">AI draft ready for review</span>
          <span className="block text-[12px] text-muted">Mentor approves before it&apos;s sent</span>
        </span>
      </div>
    </div>
  );
}

export function BuilderMock() {
  const modules = [
    { n: "01", t: "Orientation & study plan", s: "Recorded · 4 lessons", tag: "Preview", tone: "bg-ok-bg text-ok", clip: true },
    { n: "02", t: "Polity essentials", s: "Recorded · 9 lessons", tag: "Drip · unlocks day 7", tone: "bg-brass-tint text-brass-text", clip: true },
    { n: "03", t: "Weekly doubt-clearing", s: "Live · Google Meet", tag: "Thu 7:00 PM · RSVPs on", tone: "bg-ink-50 text-ink-600" },
    { n: "04", t: "Mock test 1 · answer writing", s: "Test · rubric graded", tag: "Coming soon", tone: "bg-paper-2 text-muted" },
  ];
  return (
    <AppShell active="Courses">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-faint">Courses / Course builder</p>
          <p className="font-display text-[15px] font-bold text-ink">Prelims Foundation Batch</p>
        </div>
        <span className="ml-auto rounded-full border border-ink-100 bg-ink-50 px-2.5 py-1 text-[11px] font-semibold text-ink-600">Hybrid</span>
        <span className="rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white">+ Add module</span>
      </div>
      <div className="space-y-2 p-3 sm:p-4">
        {modules.map((m) => (
          <div key={m.n} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5">
            <GripVertical aria-hidden className="h-4 w-4 shrink-0 text-line-strong" />
            <span className="font-mono text-[11px] text-faint">{m.n}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-ink">{m.t}</p>
              <p className="text-[11px] text-muted">{m.s}</p>
            </div>
            {m.clip ? <Paperclip aria-hidden className="hidden h-3.5 w-3.5 text-faint sm:block" /> : null}
            <span className={`shrink-0 rounded-md px-2 py-1 text-[10.5px] font-semibold ${m.tone}`}>{m.tag}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export function EvaluationMock() {
  const rubric = [
    { k: "Content", v: 6, of: 8 },
    { k: "Structure", v: 3, of: 4 },
    { k: "Examples", v: 1, of: 3 },
  ];
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-faint">Evaluated copy · Mock test 1</p>
          <p className="font-display text-[15px] font-bold text-ink">Q3 · Long answer (15 marks)</p>
        </div>
        <span className="shrink-0 rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-semibold text-ink-600">Handwritten upload</span>
      </div>
      <div className="space-y-2 bg-surface-2 px-5 py-5" aria-hidden>
        {[92, 78, 88, 64, 84, 70].map((w, i) => (
          <svg key={i} viewBox="0 0 300 10" className="h-2.5" style={{ width: `${w}%` }} preserveAspectRatio="none">
            <path d="M0 5 Q 12 0 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5 T 225 5 T 250 5 T 275 5 T 300 5" fill="none" stroke="#33628C" strokeWidth="1.6" opacity=".55" />
          </svg>
        ))}
      </div>
      <div className="space-y-2.5 border-t border-line px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-faint">Rubric</p>
        {rubric.map((r) => (
          <div key={r.k} className="flex items-center gap-3 text-[12.5px]">
            <span className="w-20 text-muted">{r.k}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-2">
              <span className="block h-full rounded-full bg-ink" style={{ width: `${(r.v / r.of) * 100}%` }} />
            </span>
            <span className="w-8 text-right font-mono text-ink">{r.v}/{r.of}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-brass/30 bg-brass-tint px-4 py-4">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-brass-text">
          <Sparkles aria-hidden className="h-3.5 w-3.5" /> AI draft · awaiting mentor approval
        </p>
        <p className="mt-1.5 text-[12.5px] text-ink">Clear on both causes. Add a recent example to support the second point.</p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-lg bg-ink px-3 py-1.5 text-[11.5px] font-semibold text-white">Approve</span>
          <span className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-[11.5px] font-semibold text-ink">Edit</span>
        </div>
      </div>
    </div>
  );
}

export function PipelineMock() {
  const cols = [
    { t: "New enquiry", n: 2, cards: [{ i: "PS", name: "Priya S.", s: "Ad lead form" }, { i: "AM", name: "Arjun M.", s: "Free notes download" }] },
    { t: "Webinar RSVP", n: 1, cards: [{ i: "NK", name: "Neha K.", s: "Masterclass · Sun" }] },
    { t: "Checkout started", n: 1, cards: [{ i: "RD", name: "Rahul D.", s: "Prelims Foundation", wa: true }] },
    { t: "Enrolled", n: 2, cards: [{ i: "SP", name: "Sana P.", s: "₹15,000 · Paid" }, { i: "VR", name: "Vikram R.", s: "₹15,000 · Paid" }] },
  ];
  return (
    <AppShell active="Leads">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-faint">Leads / Pipeline</p>
          <p className="font-display text-[15px] font-bold text-ink">From first enquiry to enrolment</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line-strong px-2.5 py-1.5 text-[11px] font-semibold text-ink">
          <Download aria-hidden className="h-3 w-3" /> Export CSV
        </span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto p-3">
        {cols.map((c) => (
          <div key={c.t} className="w-[150px] shrink-0 rounded-xl bg-paper-2 p-2">
            <p className="mb-2 flex justify-between px-1 text-[11.5px] font-bold text-ink">
              {c.t} <span className="font-mono font-normal text-faint">{c.n}</span>
            </p>
            <div className="space-y-2">
              {c.cards.map((card) => (
                <div key={card.name} className="rounded-lg border border-line bg-surface p-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-50 text-[9.5px] font-bold text-ink-600">{card.i}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11.5px] font-semibold text-ink">{card.name}</span>
                      <span className="block truncate text-[10.5px] text-muted">{card.s}</span>
                    </span>
                  </div>
                  {"wa" in card && card.wa ? (
                    <p className="mt-2 flex items-center gap-1 border-t border-dashed border-line pt-1.5 text-[10.5px] font-semibold text-ok">
                      <MessageCircle aria-hidden className="h-3 w-3" /> Follow up on WhatsApp
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export function PaymentsMock() {
  return (
    <div className="mx-auto max-w-md space-y-3">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-lift">
        <p className="font-mono text-[10px] uppercase tracking-wider text-faint">Checkout · Your Academy</p>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="font-display text-[16px] font-bold text-ink">Prelims Foundation Batch</p>
          <p className="font-display text-[18px] font-bold text-ink">₹15,000</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11.5px] font-semibold">
          <span className="rounded-lg border-2 border-ink bg-ink-50 px-2 py-2 text-ink">Razorpay</span>
          <span className="rounded-lg border border-line px-2 py-2 text-muted">UPI</span>
          <span className="rounded-lg border border-line px-2 py-2 text-muted">Bank transfer</span>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-ok-bg text-ok"><CircleDollarSign aria-hidden className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-ink">Paid straight to your account</span>
          <span className="block text-[12px] text-muted">0% revenue share · VILMS never holds the money</span>
        </span>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brass-tint text-brass-text"><Receipt aria-hidden className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-ink">GST invoice & receipt</span>
          <span className="block text-[12px] text-muted">Issued in your institute&apos;s name · order logged</span>
        </span>
      </div>
    </div>
  );
}

export function BrandMock() {
  return (
    <div className="mx-auto max-w-md space-y-3">
      <Browser url="learn.youracademy.in" badge="Your domain">
        <div className="p-5">
          <div className="rounded-xl border-2 border-dashed border-brass/50 bg-brass-tint/50 p-5 text-center">
            <BadgeCheck aria-hidden className="mx-auto h-7 w-7 text-brass-text" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-brass-text">Certificate of completion</p>
            <p className="mt-1 font-display text-[18px] font-bold text-ink">Your Academy</p>
            <p className="text-[12px] text-muted">Prelims Foundation Batch</p>
          </div>
        </div>
      </Browser>
      <div className="grid grid-cols-3 gap-2 text-center text-[11.5px] font-semibold text-ink">
        <span className="rounded-lg border border-line bg-surface px-2 py-2.5">Your logo</span>
        <span className="rounded-lg border border-line bg-surface px-2 py-2.5">Your colours</span>
        <span className="rounded-lg border border-line bg-surface px-2 py-2.5">Your emails</span>
      </div>
    </div>
  );
}

export function TeamMock() {
  const roles = [
    { r: "Owner / Admin", a: ["Everything"], icon: ShieldCheck },
    { r: "Teacher", a: ["Courses", "Grading", "Materials"], icon: PencilLine },
    { r: "Sales / Counsellor", a: ["Leads", "Roster", "Payments"], icon: Users },
  ];
  return (
    <div className="mx-auto max-w-md space-y-2.5">
      {roles.map(({ r, a, icon: Icon }) => (
        <div key={r} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-600"><Icon aria-hidden className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1 text-[13.5px] font-bold text-ink">{r}</span>
          <span className="flex flex-wrap justify-end gap-1">
            {a.map((x) => (
              <span key={x} className="rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-semibold text-muted">{x}</span>
            ))}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-3 text-[12.5px] text-muted">
        <MapPin aria-hidden className="h-4 w-4 text-ink-600" /> Multiple branches from Growth · unlimited staff on Institute
      </div>
    </div>
  );
}

export function SecurityMock() {
  const rows = [
    { icon: MapPin, t: "Stored in India", s: "Primary data in the Mumbai region" },
    { icon: Lock, t: "Encrypted", s: "In transit and at rest" },
    { icon: Database, t: "Isolated per institute", s: "Separated at the database level" },
    { icon: KeyRound, t: "Encrypted integration keys", s: "Used only server-side" },
    { icon: FileText, t: "Export any time", s: "Students, enrolments and orders to CSV" },
  ];
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
      {rows.map(({ icon: Icon, t, s }, i) => (
        <div key={t} className={`flex items-center gap-3 px-4 py-3 ${i ? "border-t border-line" : ""}`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-brass-soft"><Icon aria-hidden className="h-4 w-4" /></span>
          <span>
            <span className="block text-[13.5px] font-bold text-ink">{t}</span>
            <span className="block text-[12px] text-muted">{s}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export const MOCKS = {
  builder: BuilderMock,
  evaluation: EvaluationMock,
  pipeline: PipelineMock,
  payments: PaymentsMock,
  brand: BrandMock,
  team: TeamMock,
  security: SecurityMock,
} as const;
