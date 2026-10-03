// Copy for the 2026 landing page, arranged as a story. Every product fact
// here restates lib/content.ts (the VILMS brochure); nothing new is claimed.
// Names, amounts and counts that appear *inside* interface illustrations are
// sample data in a mock UI, and the page labels them as illustrative.

export const heroEvents = [
  { id: "lead", icon: "lead", title: "New lead captured", meta: "Google Ads · JEE crash course page", tone: "iris" },
  { id: "enrol", icon: "enrol", title: "Student enrolled", meta: "Prelims Foundation Batch", tone: "aqua" },
  { id: "purchase", icon: "cart", title: "Course purchased", meta: "Hybrid · recorded + live", tone: "violet" },
  { id: "live", icon: "live", title: "Live class starting in 10 min", meta: "Polity · Batch A · Zoom", tone: "rose" },
  { id: "eval", icon: "eval", title: "Answer evaluation ready", meta: "AI draft · awaiting mentor", tone: "violet" },
  { id: "pay", icon: "pay", title: "₹15,000 payment received", meta: "Razorpay → your account", tone: "emerald" },
  { id: "cert", icon: "cert", title: "Certificate issued", meta: "Under your institute's name", tone: "sun" },
  { id: "webinar", icon: "webinar", title: "New webinar registration", meta: "No login needed", tone: "aqua" },
] as const;

export type HeroEvent = (typeof heroEvents)[number];

export const lifecycleChain = ["Lead captured", "Student enrolled", "Course purchased", "Live class", "Answer evaluated", "Payment received", "Certificate issued"];

export const oldWay = {
  kicker: "The old way",
  title: "Your institute shouldn't run across seven different tools.",
  tools: [
    { label: "WhatsApp", pain: "Enquiries lost in chats" },
    { label: "Zoom / Meet", pain: "Classes not tied to courses" },
    { label: "Google Forms", pain: "Can't grade written answers" },
    { label: "Spreadsheets", pain: "Re-typed data" },
    { label: "Payment tools", pain: "Manual reconciliation" },
    { label: "Separate LMS", pain: "A cut of every enrolment" },
    { label: "Manual follow-ups", pain: "No pipeline, no trail" },
  ],
  meet: "Meet VILMS.",
  meetSub: "Courses, live classes, tests, payments and leads — one platform, one database.",
  modules: ["Courses", "Live classes", "Tests", "Materials", "Payments", "Lead CRM", "Certificates"],
};

export const lifecycle = {
  kicker: "One student lifecycle",
  title: "One platform for the entire student lifecycle.",
  sub: "A lead becomes a student becomes a graduate — on one database, with nothing re-typed by hand along the way.",
  stages: [
    { id: "lead", label: "Lead", title: "Lead captured", text: "From ads, webinars and free materials — straight into one pipeline." },
    { id: "student", label: "Student", title: "Student enrolled", text: "One profile with batch, branch, grades, certificates and orders." },
    { id: "course", label: "Course", title: "Course consumed", text: "Recorded, live or hybrid — with drip, previews and attachments." },
    { id: "class", label: "Class", title: "Live class", text: "Zoom or Meet links tied to the course, with RSVPs and reminders." },
    { id: "test", label: "Test", title: "Answers graded", text: "Mock tests, photo answer uploads, rubrics and AI-drafted evaluation." },
    { id: "payment", label: "Payment", title: "Fees collected", text: "Your Razorpay checkout, UPI/bank fallback and GST-aware invoices." },
    { id: "certificate", label: "Certificate", title: "Certificate issued", text: "Branded certificates and receipts, in your institute's name." },
    { id: "renewal", label: "Renewal", title: "Cohort renewed", text: "Upsell the next course or batch to students you already know." },
  ],
};

export const showcase = {
  kicker: "The platform",
  title: "Everything your institute runs on. In one place.",
  sub: "You enrol, teach, evaluate, follow up and get paid — from one login, under your own brand.",
  tabs: [
    {
      id: "teach",
      label: "Teach",
      title: "Teach the way you actually teach.",
      text: "Recorded, live or hybrid courses — with live classes and video inside your own platform.",
      points: ["Recorded, live & hybrid courses", "Drag-and-drop course builder", "Zoom / Meet live classes with RSVPs", "Secure video with watermark", "Notes, PDFs and worksheets"],
    },
    {
      id: "assess",
      label: "Assess",
      title: "Grade real answers — not just MCQs.",
      text: "Tests, handwritten answer evaluation and AI-assisted grading — with a mentor always in control.",
      points: ["Auto-graded tests & mock tests", "Photo answer uploads", "Rubric-based grading", "AI-assisted evaluation", "Evaluated-copy view"],
    },
    {
      id: "grow",
      label: "Grow",
      title: "Turn ad clicks into paid enrolments.",
      text: "Every enquiry in one pipeline, WhatsApp follow-up, and every student visible from first enquiry to renewal.",
      points: ["One lead pipeline", "Landing pages that convert", "WhatsApp follow-up (Wati)", "Roster with lifetime value", "CSV export everywhere"],
    },
    {
      id: "payments",
      label: "Get paid",
      title: "Fees paid straight into your own account.",
      text: "Razorpay checkout on your account, UPI and bank fallback, GST-aware invoices — 0% revenue share.",
      points: ["Your Razorpay checkout", "UPI & bank fallback", "GST-aware invoices", "Orders & refunds logged", "No card data with VILMS"],
    },
    {
      id: "brand",
      label: "Brand",
      title: "Your brand in front.",
      text: "White-label everything. Your logo, your colours, your domain — students never see VILMS.",
      points: ["Your logo, colours & emails", "yourinstitute.vilms.in or your own domain", "Branded certificates & receipts", "Your own branded app"],
    },
    {
      id: "manage",
      label: "Manage",
      title: "Each role sees only what it should.",
      text: "The right access for owners, teachers and counsellors — across branches, batches and faculty.",
      points: ["Owner, Teacher and Sales roles", "Branches & faculty", "Plan meters", "Data stored in India, encrypted", "Export any time"],
    },
  ],
} as const;

export type ShowcaseTabId = (typeof showcase.tabs)[number]["id"];

export const teach = {
  kicker: "Teach",
  title: "Teach the way you actually teach.",
  sub: "Recorded, live or hybrid — with live classes and video that stay inside your own platform.",
  panels: [
    { id: "builder", n: "01", title: "Course builder", text: "Build recorded, live or hybrid courses. Drag modules and lessons into place; preview, drip and coming-soon per lesson." },
    { id: "video", n: "02", title: "Recorded lessons & secure video", text: "Upload and play inside VILMS. Expiring links, name watermark, device and stream limits. 480p default keeps delivery costs low." },
    { id: "live", n: "03", title: "Live classes", text: "Paste a Zoom or Meet link and the class is tied to the course. Students RSVP; reminders go out before class." },
    { id: "webinar", n: "04", title: "Webinars", text: "Public sign-up with no login, per-session branding, and a one-click upsell into the paired paid course." },
    { id: "materials", n: "05", title: "Study materials", text: "Public, lead-magnet gated or enrolled-only. PDFs and images aren't counted against any limit." },
  ],
};

export const assess = {
  kicker: "Assess · AI-assisted evaluation",
  titleTop: "AI assists.",
  titleBottom: "Your mentor stays in control.",
  sub: "Students upload a photo of their handwritten answer. AI drafts the evaluation against your rubric. A mentor reviews, edits and approves — nothing reaches a student before that.",
  steps: [
    { id: "upload", label: "Answer uploaded", text: "A photo of the written answer, straight from the student's phone." },
    { id: "draft", label: "AI draft", text: "AI drafts rubric scores and comments." },
    { id: "review", label: "Mentor reviews", text: "The mentor checks every score and edits what needs changing." },
    { id: "approve", label: "Approve", text: "Nothing reaches the student until a mentor approves." },
    { id: "result", label: "Evaluated copy", text: "Marks, comments and rubric in one view — saved to the profile." },
  ],
  facts: [
    { title: "Your own AI key", text: "Connect Anthropic or OpenAI and pay them at cost — no markup." },
    { title: "Mentor always decides", text: "Nothing reaches a student until a mentor approves it." },
    { title: "Never used for training", text: "Your students' data is not used to train AI models." },
  ],
  tests: ["Auto-graded MCQs", "Mock tests", "Long-form answers", "Photo answer uploads", "Rubric-based grading", "Grades on the profile"],
};

export const grow = {
  kicker: "Grow · Lead CRM",
  title: "Turn ad clicks into paid enrolments.",
  sub: "Enquiries, checkouts and webinar RSVPs land in one pipeline — and nobody falls through a WhatsApp thread again.",
  columns: ["New enquiry", "Webinar RSVP", "Checkout started", "Enrolled"],
  features: [
    { title: "One lead pipeline", text: "Enquiries, checkouts and webinar RSVPs in one place." },
    { title: "WhatsApp follow-up", text: "Through your own WhatsApp (Wati) account." },
    { title: "Lead magnets", text: "Free resources that grow your lead list." },
    { title: "Landing pages", text: "Course pages built for paid traffic." },
    { title: "Your analytics & pixel", text: "Add your own tracking to your site." },
    { title: "CSV export", text: "Take your data out whenever you want." },
  ],
};

export const payments = {
  kicker: "Get paid",
  title: "Fees go straight to your account.",
  sub: "Razorpay checkout on your own account, UPI and bank fallback, GST-aware invoices. VILMS never takes a cut of your fees.",
  points: ["Your Razorpay checkout", "UPI & bank fallback", "GST-aware invoices", "Orders & refunds logged", "No card data with VILMS"],
};

export const brandStudio = {
  kicker: "White-label",
  titleTop: "Your brand in front.",
  titleBottom: "VILMS underneath.",
  sub: "Your logo, colours and domain on every screen, certificate and email. Students never see VILMS — not in the URL, not in the emails.",
  surfaces: [
    { id: "site", label: "Website" },
    { id: "certificate", label: "Certificate" },
    { id: "email", label: "Email" },
    { id: "app", label: "App" },
  ],
  swatches: ["#5B5BF6", "#0EA5E9", "#10B981", "#F43F5E", "#F59E0B", "#111827"],
};

export const audienceVisual: Record<string, "batch" | "mock" | "certificate" | "team" | "invoice" | "materials"> = {
  "Coaching institutes": "batch",
  "Test-prep & exam-prep centres": "mock",
  "Skill academies": "certificate",
  "Training institutes": "team",
  "Schools & colleges — paid programmes": "invoice",
  "Educators & online academies": "materials",
};

export const navProduct = [
  { tab: "teach", label: "Teach", text: "Courses, live classes, video" },
  { tab: "assess", label: "Assess", text: "Tests & AI-assisted evaluation" },
  { tab: "grow", label: "Grow", text: "Lead CRM & WhatsApp follow-up" },
  { tab: "payments", label: "Get paid", text: "Razorpay, UPI, GST invoices" },
  { tab: "brand", label: "Brand", text: "White-label site, app, certificates" },
  { tab: "manage", label: "Manage", text: "Roles, branches, data" },
] as const;
