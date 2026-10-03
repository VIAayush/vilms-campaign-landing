// Illustrative VILMS interfaces, drawn in HTML/CSS so they stay crisp, light
// and themeable (the --brand colour drives the institute's own branding).
// Sample names and amounts are mock data inside a UI, not claims.

import {
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Globe,
  GraduationCap,
  GripVertical,
  IndianRupee,
  Lock,
  MessageCircle,
  PlayCircle,
  Radio,
  Receipt,
  RefreshCw,
  Shield,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

type Div = { className?: string; children?: React.ReactNode };

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[10px] bg-night ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.14)" }}
    >
      <span className="absolute inset-0 opacity-90" style={{ background: "var(--gradient)" }} />
      <svg viewBox="0 0 24 24" className="relative h-[58%] w-[58%]" fill="none">
        <path d="M4 5h4.2L12 15.2 15.8 5H20l-6.1 14h-3.8z" fill="#fff" />
      </svg>
    </span>
  );
}

export function AppWindow({
  url,
  children,
  className = "",
  bodyClass = "",
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
  bodyClass?: string;
}) {
  return (
    <div className={`app ${className}`}>
      <div className="app-bar">
        <span className="app-dot" />
        <span className="app-dot" />
        <span className="app-dot" />
        <span className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md bg-white px-3 py-1 font-mono text-[10.5px] text-slate-500 ring-1 ring-black/5">
          <Lock className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{url}</span>
        </span>
        <span className="w-[42px]" />
      </div>
      <div className={bodyClass}>{children}</div>
    </div>
  );
}

const Brand = ({ name = "Your Institute", size = "sm" }: { name?: string; size?: "sm" | "md" }) => (
  <span className="flex min-w-0 items-center gap-2">
    <span
      className={`grid shrink-0 place-items-center rounded-md font-bold text-white ${size === "md" ? "h-7 w-7 text-[11px]" : "h-6 w-6 text-[10px]"}`}
      style={{ background: "var(--brand, #5B5BF6)" }}
    >
      {initials(name)}
    </span>
    <span className={`truncate font-semibold ${size === "md" ? "text-[13px]" : "text-[12px]"}`}>{name}</span>
  </span>
);

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "Y") + (parts[1]?.[0] ?? "")).toUpperCase();
}

const Card = ({ className = "", children }: Div) => (
  <div className={`rounded-xl border border-slate-200/80 bg-white ${className}`}>{children}</div>
);

const Label = ({ children }: Div) => <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{children}</p>;

/* ------------------------------------------------------------------ */
/* Hero dashboard                                                      */
/* ------------------------------------------------------------------ */

const NAV = [
  { icon: BookOpen, label: "Courses" },
  { icon: Radio, label: "Live classes" },
  { icon: ClipboardCheck, label: "Tests" },
  { icon: Sparkles, label: "Evaluations" },
  { icon: Users, label: "Leads" },
  { icon: IndianRupee, label: "Payments" },
  { icon: Award, label: "Certificates" },
  { icon: Globe, label: "Website" },
];

export function DashboardScreen({ feed }: { feed?: React.ReactNode }) {
  return (
    <div className="grid min-h-[430px] grid-cols-1 bg-[#F7F8FC] text-[12px] md:grid-cols-[176px_1fr]">
      <aside className="hidden flex-col gap-1 border-r border-slate-200/70 bg-white p-3 md:flex">
        <div className="mb-3 px-1">
          <Brand />
        </div>
        <span className="flex items-center gap-2 rounded-lg bg-iris-50 px-2.5 py-2 font-semibold text-iris-600">
          <span className="h-3.5 w-3.5 rounded bg-iris/80" /> Dashboard
        </span>
        {NAV.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-500">
            <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
          </span>
        ))}
      </aside>
      <div className="min-w-0 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-slate-400">Good evening</p>
            <p className="font-display text-[17px] font-semibold tracking-tight">Today at your institute</p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-600 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {[
            { k: "New leads", v: "38", d: "this week", c: "text-iris-600" },
            { k: "Enrolments", v: "21", d: "this week", c: "text-aqua-600" },
            { k: "Fees collected", v: "₹3.1L", d: "to your account", c: "text-emerald-600" },
            { k: "To evaluate", v: "14", d: "AI drafts ready", c: "text-violet" },
          ].map((s) => (
            <Card key={s.k} className="p-3">
              <p className="text-[10.5px] text-slate-500">{s.k}</p>
              <p className={`mt-1 font-display text-[20px] font-semibold tracking-tight ${s.c}`}>{s.v}</p>
              <p className="text-[10px] text-slate-400">{s.d}</p>
            </Card>
          ))}
        </div>
        <div className="mt-3 grid gap-2.5 lg:grid-cols-[1.25fr_1fr]">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <Label>Lead pipeline</Label>
              <span className="text-[10px] text-slate-400">Ads · webinars · free PDFs</span>
            </div>
            <div className="mt-2.5 grid grid-cols-4 gap-1.5">
              {[
                ["New", 12, "bg-iris"],
                ["RSVP", 9, "bg-violet"],
                ["Checkout", 5, "bg-aqua"],
                ["Enrolled", 21, "bg-emerald-500"],
              ].map(([k, n, c]) => (
                <div key={k as string} className="rounded-lg bg-slate-50 p-2">
                  <p className="text-[9.5px] text-slate-500">{k}</p>
                  <p className="font-display text-[15px] font-semibold">{n}</p>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-200">
                    <div className={`h-1 rounded-full ${c}`} style={{ width: `${Math.min(100, (n as number) * 4.5)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                ["Live · Polity · Batch A", "7:00 PM", "bg-rose-500"],
                ["Mock test 4 · results out", "Today", "bg-violet"],
              ].map(([t, w, c]) => (
                <div key={t} className="flex items-center gap-2 rounded-lg border border-slate-100 px-2.5 py-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${c}`} />
                  <span className="truncate">{t}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-slate-400">{w}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-3">
            <Label>Activity</Label>
            <div className="mt-2">{feed}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lifecycle stage screens                                             */
/* ------------------------------------------------------------------ */

export function LeadScreen() {
  return (
    <div className="space-y-3 p-5">
      <Label>Lead pipeline · new</Label>
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-iris-50 font-semibold text-iris-600">RK</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Rahul Kumar</p>
            <p className="text-[11px] text-slate-500">Asked about the JEE crash course</p>
          </div>
          <span className="chip-ui bg-iris-50 text-iris-600">New</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip-ui bg-slate-100 text-slate-600">Google Ads</span>
          <span className="chip-ui bg-slate-100 text-slate-600">Course landing page</span>
          <span className="chip-ui bg-emerald-50 text-emerald-600">
            <MessageCircle className="h-3 w-3" /> WhatsApp sent
          </span>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-2 text-center">
        {["Webinar RSVP", "Free PDF", "Checkout"].map((s) => (
          <Card key={s} className="px-2 py-2.5 text-[10.5px] text-slate-500">
            {s}
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StudentScreen() {
  return (
    <div className="p-5">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-aqua-50 font-semibold text-aqua-600">RK</span>
          <div>
            <p className="font-semibold">Rahul Kumar</p>
            <p className="text-[11px] text-slate-500">Prelims Foundation · Batch A · Main branch</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["Grades", "4 tests"],
            ["Certificates", "1"],
            ["Orders", "2"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">{k}</p>
              <p className="text-[13px] font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-[11px]">
          <span className="text-slate-500">Lifetime value</span>
          <span className="font-semibold">₹15,000</span>
        </div>
      </Card>
    </div>
  );
}

export function CourseBuilderScreen({ compact = false }: { compact?: boolean }) {
  const modules = [
    { t: "Orientation & study plan", tag: "Preview", c: "bg-emerald-50 text-emerald-600", icon: PlayCircle },
    { t: "Polity essentials", tag: "Unlocks in 7 days", c: "bg-sun-50 text-amber-700", icon: Video },
    { t: "Weekly doubt-clearing", tag: "Live · Thu 7 PM", c: "bg-rose-50 text-rose-600", icon: Radio },
    { t: "Mock test 1 — answer writing", tag: "Coming soon", c: "bg-slate-100 text-slate-500", icon: FileText },
  ];
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>Course builder</Label>
          <p className="mt-1 font-display text-[16px] font-semibold tracking-tight">Prelims Foundation Batch</p>
        </div>
        <div className="flex gap-1">
          {["Recorded", "Live", "Hybrid"].map((f, i) => (
            <span key={f} className={`chip-ui ${i === 2 ? "bg-night text-white" : "bg-slate-100 text-slate-500"}`}>
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {modules.slice(0, compact ? 3 : 4).map(({ t, tag, c, icon: Icon }) => (
          <div key={t} className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm">
            <GripVertical className="h-3.5 w-3.5 text-slate-300" aria-hidden />
            <Icon className="h-4 w-4 text-slate-400" aria-hidden />
            <span className="truncate text-[12px] font-medium">{t}</span>
            <span className={`chip-ui ml-auto ${c}`}>{tag}</span>
          </div>
        ))}
      </div>
      {!compact && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-iris-300 bg-iris-50/60 px-3 py-2.5 text-[11.5px] text-iris-600">
          <FileText className="h-3.5 w-3.5" aria-hidden /> Notes.pdf · Worksheet 1.pdf attached to lesson 2
        </div>
      )}
    </div>
  );
}

export function LiveClassScreen() {
  return (
    <div className="space-y-3 p-5">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 text-[11px] font-semibold text-rose-600">
          <span className="relative h-2 w-2 rounded-full bg-rose-500 text-rose-500 pulse-ring" /> Starts in 10 min
        </div>
        <div className="p-4">
          <p className="font-display text-[15px] font-semibold tracking-tight">Polity · Batch A · Live class</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Part of Prelims Foundation Batch · Zoom link attached</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {["bg-iris", "bg-aqua", "bg-violet", "bg-sun"].map((c) => (
                <span key={c} className={`h-6 w-6 rounded-full border-2 border-white ${c}`} />
              ))}
            </div>
            <span className="text-[11px] text-slate-500">42 RSVPs</span>
            <span className="b b-sm ml-auto !min-h-[30px] bg-night !px-3 !text-[11px] text-white">Join class</span>
          </div>
        </div>
      </Card>
      <Card className="flex items-center gap-2.5 px-3.5 py-2.5 text-[11px]">
        <Bell className="h-3.5 w-3.5 text-iris" aria-hidden /> Reminder sent to 42 students before class
      </Card>
    </div>
  );
}

// Pseudo-handwriting: each line is a run of "words" — short joined loops of
// varying width and height — so it reads as script, not a pattern.
function scriptLine(y: number, seed: number, width: number) {
  let x = 4 + (seed % 3);
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let d = "";
  while (x < width) {
    const letters = 2 + Math.floor(rnd() * 5);
    d += `M${x.toFixed(1)} ${y}`;
    for (let i = 0; i < letters && x < width; i++) {
      const w = 3 + rnd() * 2.6;
      const h = 2.2 + rnd() * 2.8 + (rnd() > 0.82 ? 3 : 0);
      d += ` q ${(w / 2).toFixed(1)} ${(-h).toFixed(1)} ${w.toFixed(1)} 0`;
      x += w;
    }
    x += 3 + rnd() * 3;
  }
  return d;
}

export function AnswerSheet({ scanning = false }: { scanning?: boolean }) {
  const lines = [176, 190, 150, 184, 128, 188, 160, 140, 172, 110];
  return (
    <div className="relative h-full overflow-hidden rounded-xl bg-[#FBFAF4] p-4 shadow-inner ring-1 ring-black/5">
      <div className="mb-2 flex items-center justify-between text-[10px] text-slate-400">
        <span className="font-mono">Q3 · Answer sheet · page 1</span>
        <span className="font-mono">Rahul K.</span>
      </div>
      <svg viewBox="0 0 200 150" className="w-full" aria-hidden>
        {lines.map((w, i) => (
          <g key={i}>
            <line x1="0" x2="200" y1={14 + i * 13.4} y2={14 + i * 13.4} stroke="#E8E5D8" strokeWidth=".6" />
            <path d={scriptLine(Math.round(12 + i * 13.4), i * 7919 + 13, w)} stroke="#2B3A67" strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
      </svg>
      {scanning && (
        <span
          className="pointer-events-none absolute inset-x-3 h-8 rounded-md"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(139,92,246,.28), transparent)",
            animation: "v2-scan 1.8s ease-in-out infinite alternate",
          }}
        />
      )}
    </div>
  );
}

export function TestScreen() {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-3 p-5">
      <AnswerSheet />
      <div className="space-y-2">
        <Label>Rubric</Label>
        {[
          ["Content", "6/8"],
          ["Structure", "3/4"],
          ["Examples", "3/4"],
          ["Language", "3/4"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px]">
            <span className="text-slate-500">{k}</span>
            <span className="font-semibold">{v}</span>
          </div>
        ))}
        <span className="chip-ui bg-violet/10 text-violet">
          <Sparkles className="h-3 w-3" /> AI draft · mentor approves
        </span>
      </div>
    </div>
  );
}

export function PaymentScreen() {
  return (
    <div className="space-y-3 p-5">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Label>Order #2041</Label>
          <span className="chip-ui bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </span>
        </div>
        <p className="mt-2 font-display text-[26px] font-semibold tracking-tight">₹15,000</p>
        <p className="text-[11px] text-slate-500">Prelims Foundation Batch · via your Razorpay</p>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
          {["Razorpay", "UPI", "Bank transfer"].map((m, i) => (
            <span key={m} className={`rounded-lg px-2 py-1.5 ${i === 0 ? "bg-night text-white" : "bg-slate-100 text-slate-500"}`}>
              {m}
            </span>
          ))}
        </div>
      </Card>
      <Card className="flex items-center gap-2.5 px-3.5 py-2.5 text-[11px]">
        <Receipt className="h-3.5 w-3.5 text-aqua-600" aria-hidden /> GST invoice INV-2041 sent · 0% revenue share
      </Card>
    </div>
  );
}

export function CertificateScreen({ name = "Your Institute" }: { name?: string }) {
  return (
    <div className="p-5">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
        <div className="absolute inset-2 rounded-lg border" style={{ borderColor: "color-mix(in srgb, var(--brand, #5B5BF6) 35%, transparent)" }} />
        <div className="relative">
          <div className="mx-auto w-fit">
            <Brand name={name} size="md" />
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">Certificate of completion</p>
          <p className="mt-1 font-display text-[18px] font-semibold tracking-tight">Rahul Kumar</p>
          <p className="text-[11px] text-slate-500">Prelims Foundation Batch</p>
          <div className="mx-auto mt-3 flex w-fit items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: "var(--brand, #5B5BF6)" }}>
            <BadgeCheck className="h-3.5 w-3.5" /> Issued by {name}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RenewalScreen() {
  return (
    <div className="space-y-3 p-5">
      <Card className="p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-iris-600">
          <RefreshCw className="h-3.5 w-3.5" /> Next batch
        </div>
        <p className="mt-1.5 font-display text-[15px] font-semibold tracking-tight">Mains Answer-Writing Batch</p>
        <p className="text-[11px] text-slate-500">Offered to students who completed Prelims Foundation</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="b b-sm !min-h-[30px] bg-night !px-3 !text-[11px] text-white">Upsell to cohort</span>
          <span className="text-[11px] text-slate-500">36 students eligible</span>
        </div>
      </Card>
      <Card className="flex items-center gap-2.5 px-3.5 py-2.5 text-[11px]">
        <GraduationCap className="h-3.5 w-3.5 text-aqua-600" aria-hidden /> Same profile, same database — nothing re-typed
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teach panels                                                        */
/* ------------------------------------------------------------------ */

export function VideoScreen() {
  return (
    <div className="p-5">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-night">
        <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(60% 80% at 30% 30%, rgba(91,91,246,.55), transparent 60%), radial-gradient(50% 60% at 80% 80%, rgba(34,211,238,.35), transparent 60%)" }} />
        <PlayCircle className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-white/90" aria-hidden />
        <span className="absolute right-3 top-3 font-mono text-[10px] text-white/45">Rahul K. · watermark</span>
        <div className="absolute inset-x-3 bottom-3">
          <div className="h-1 rounded-full bg-white/20">
            <div className="h-1 w-2/5 rounded-full bg-aqua" />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[9.5px] text-white/60">
            <span>12:40 / 31:05</span>
            <span>480p</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Expiring link", "Name watermark", "Device limit", "Stream limit"].map((t) => (
          <span key={t} className="chip-ui bg-slate-100 text-slate-600">
            <Shield className="h-3 w-3" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WebinarScreen() {
  return (
    <div className="p-5">
      <Card className="overflow-hidden">
        <div className="p-4" style={{ background: "linear-gradient(120deg, color-mix(in srgb, var(--brand,#5B5BF6) 14%, white), white)" }}>
          <span className="chip-ui bg-white text-rose-600 ring-1 ring-rose-100">
            <CalendarClock className="h-3 w-3" /> Free masterclass · Sun 6 PM
          </span>
          <p className="mt-2 font-display text-[16px] font-semibold tracking-tight">How to plan your first 90 days of prep</p>
          <p className="text-[11px] text-slate-500">Register in seconds — no login needed</p>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2 p-3">
          <span className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-400">Name, phone, email</span>
          <span className="b b-sm !min-h-[34px] !px-3 !text-[11px] text-white" style={{ background: "var(--brand,#5B5BF6)" }}>
            Register
          </span>
        </div>
      </Card>
      <Card className="mt-3 flex items-center gap-2.5 px-3.5 py-2.5 text-[11px]">
        <Sparkles className="h-3.5 w-3.5 text-violet" aria-hidden /> One-click upsell → Prelims Foundation Batch
      </Card>
    </div>
  );
}

export function MaterialsScreen() {
  const rows = [
    { t: "Syllabus breakdown.pdf", tag: "Public", c: "bg-emerald-50 text-emerald-600" },
    { t: "Topper's notes — Polity.pdf", tag: "Lead-magnet gated", c: "bg-sun-50 text-amber-700" },
    { t: "Batch A worksheet 4.pdf", tag: "Enrolled only", c: "bg-iris-50 text-iris-600" },
  ];
  return (
    <div className="space-y-2 p-5">
      <Label>Study materials</Label>
      {rows.map((r) => (
        <div key={r.t} className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
          <FileText className="h-4 w-4 text-slate-400" aria-hidden />
          <span className="truncate text-[12px] font-medium">{r.t}</span>
          <span className={`chip-ui ml-auto ${r.c}`}>{r.tag}</span>
        </div>
      ))}
      <p className="pt-1 text-[11px] text-slate-500">PDFs and images aren&apos;t counted against any limit.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Showcase modules                                                    */
/* ------------------------------------------------------------------ */

export function GrowModule() {
  const cols = [
    { k: "New enquiry", c: "bg-iris", items: ["Rahul K. · Google Ads", "Sneha P. · Free PDF"] },
    { k: "Webinar RSVP", c: "bg-violet", items: ["Aman V. · Masterclass"] },
    { k: "Checkout", c: "bg-aqua", items: ["Isha M. · ₹15,000"] },
    { k: "Enrolled", c: "bg-emerald-500", items: ["Karan S.", "Divya R."] },
  ];
  return (
    <div className="p-5">
      <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2">
        {cols.map((col) => (
          <div key={col.k} className="min-w-0 rounded-xl bg-slate-50 p-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <span className={`h-1.5 w-1.5 rounded-full ${col.c}`} /> <span className="truncate">{col.k}</span>
            </p>
            <div className="mt-2 space-y-1.5">
              {col.items.map((it) => (
                <div key={it} className="truncate rounded-lg bg-white px-2 py-1.5 text-[10.5px] shadow-sm ring-1 ring-black/5">
                  {it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-[11px] text-emerald-700">
        <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp follow-up sent to Aman V. · via your Wati
        <Download className="ml-auto h-3.5 w-3.5 text-slate-400" aria-label="CSV export" />
      </div>
    </div>
  );
}

export function BrandModule({ name = "Your Institute" }: { name?: string }) {
  return (
    <div className="grid gap-3 p-5 sm:grid-cols-[1fr_1.1fr]">
      <div className="space-y-2.5">
        <Label>Branding</Label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
          <Brand name={name} size="md" />
        </div>
        <div className="flex gap-1.5">
          {["#5B5BF6", "#0EA5E9", "#10B981", "#F43F5E"].map((c, i) => (
            <span key={c} className={`h-6 w-6 rounded-full ${i === 0 ? "ring-2 ring-offset-2 ring-slate-300" : ""}`} style={{ background: c }} />
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-[10.5px] text-slate-500">
          yourinstitute.vilms.in → <span className="text-slate-800">learn.yourinstitute.in</span>
        </div>
      </div>
      <CertificateScreen name={name} />
    </div>
  );
}

export function ManageModule() {
  const roles = [
    { r: "Owner / Admin", a: "Everything", c: "bg-night text-white" },
    { r: "Teacher", a: "Courses · grading · materials", c: "bg-iris-50 text-iris-600" },
    { r: "Sales / Counsellor", a: "Leads · roster · payments", c: "bg-aqua-50 text-aqua-600" },
  ];
  return (
    <div className="space-y-3 p-5">
      <Label>Team & roles</Label>
      {roles.map((r) => (
        <div key={r.r} className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
          <span className={`chip-ui ${r.c}`}>{r.r}</span>
          <span className="truncate text-[11px] text-slate-500">{r.a}</span>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <p className="text-[10px] text-slate-500">Students on plan</p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100">
            <div className="h-1.5 w-[62%] rounded-full bg-iris" />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Plan meter</p>
        </Card>
        <Card className="p-3 text-[10.5px]">
          <p className="flex items-center gap-1.5 font-semibold">
            <Shield className="h-3.5 w-3.5 text-emerald-600" /> Stored in India
          </p>
          <p className="mt-1 text-slate-500">Encrypted · export any time</p>
        </Card>
      </div>
    </div>
  );
}

export function EmailScreen({ name = "Your Institute" }: { name?: string }) {
  const slug = slugify(name);
  return (
    <div className="p-5">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-2.5 text-[11px]">
          <p>
            <span className="text-slate-400">From</span> {name} &lt;hello@{slug}.in&gt;
          </p>
          <p className="truncate">
            <span className="text-slate-400">Subject</span> Your receipt for Prelims Foundation Batch
          </p>
        </div>
        <div className="p-4">
          <Brand name={name} size="md" />
          <p className="mt-3 text-[12px]">Hi Rahul, thanks for enrolling. Your receipt and GST invoice are attached.</p>
          <span className="b b-sm mt-3 !min-h-[32px] !px-3.5 !text-[11px] text-white" style={{ background: "var(--brand,#5B5BF6)" }}>
            Start learning
          </span>
        </div>
      </Card>
    </div>
  );
}

export function PhoneApp({ name = "Your Institute" }: { name?: string }) {
  return (
    <div className="mx-auto w-[210px] rounded-[30px] bg-night p-2 shadow-2xl">
      <div className="overflow-hidden rounded-[24px] bg-[#F7F8FC] text-night">
        <div className="px-4 pb-4 pt-5 text-white" style={{ background: "var(--brand,#5B5BF6)" }}>
          <p className="text-[10px] opacity-80">Welcome back, Rahul</p>
          <p className="mt-0.5 truncate font-display text-[15px] font-semibold">{name}</p>
        </div>
        <div className="space-y-2 p-3">
          {[
            [PlayCircle, "Continue · Polity essentials"],
            [Radio, "Live at 7:00 PM"],
            [FileText, "Mock test 4 results"],
          ].map(([Icon, t]) => {
            const I = Icon as typeof PlayCircle;
            return (
              <div key={t as string} className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[10.5px] shadow-sm">
                <I className="h-3.5 w-3.5" style={{ color: "var(--brand,#5B5BF6)" }} aria-hidden /> {t as string}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SiteScreen({ name = "Your Institute" }: { name?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <Brand name={name} />
        <div className="hidden gap-3 text-[10.5px] text-slate-500 sm:flex">
          <span>Courses</span>
          <span>Free materials</span>
          <span>Webinars</span>
        </div>
        <span className="b b-sm !min-h-[28px] !px-3 !text-[10.5px] text-white" style={{ background: "var(--brand,#5B5BF6)" }}>
          Enrol now
        </span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="chip-ui" style={{ background: "color-mix(in srgb, var(--brand,#5B5BF6) 12%, white)", color: "var(--brand,#5B5BF6)" }}>
            Hybrid · recorded + live
          </span>
          <p className="mt-2 font-display text-[19px] font-semibold leading-tight tracking-tight">Prelims Foundation Batch</p>
          <p className="mt-1 text-[11px] text-slate-500">Weekly live classes, answer writing with mentor evaluation, certificate on completion.</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-display text-[17px] font-semibold">₹15,000</span>
            <span className="b b-sm !min-h-[30px] !px-3 !text-[11px] text-white" style={{ background: "var(--brand,#5B5BF6)" }}>
              Enrol
            </span>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl" style={{ background: "linear-gradient(135deg, var(--brand,#5B5BF6), color-mix(in srgb, var(--brand,#5B5BF6) 40%, #070B1A))" }}>
          <PlayCircle className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-white/90" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "yourinstitute";
}

/* ------------------------------------------------------------------ */
/* Small shared bits                                                   */
/* ------------------------------------------------------------------ */

export function CheckItem({ children, dark = false, className = "" }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <li className={`flex items-start gap-2.5 text-[15px] ${dark ? "text-white/80" : "text-slate-700"} ${className}`}>
      <span className={`mt-[3px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full ${dark ? "bg-aqua/15 text-aqua" : "bg-iris-50 text-iris"}`}>
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
      </span>
      {children}
    </li>
  );
}
