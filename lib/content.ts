// All marketing copy, taken from the VILMS Product Brochure (2026).
// Components render from here; nothing on the site states a feature, price
// or claim that isn't in this file. Interface mockups are illustrative, as the
// brochure itself notes.

export const brand = {
  name: "VILMS",
  domain: "vilms.in",
  tagline: "Your students pay you. Not your software.",
  emails: { general: "hello@vilms.in", billing: "billing@vilms.in" },
};

export const hero = {
  eyebrow: "0% revenue share — always",
  titleTop: "Your students pay you.",
  titleBottom: "Not your software.",
  sub: "VILMS is the all-in-one learning platform for coaching institutes — courses, live classes, answer evaluation, payments and leads, all under your own brand.",
  trust: ["0% revenue share", "No card required", "Plans from ₹499/month"],
  strip: ["Courses", "Live classes", "Answer evaluation", "Payments", "Leads", "Certificates"],
};

export const facts = [
  { title: "0% of your fees", text: "Flat pricing per plan" },
  { title: "Your brand", text: "Your logo, colours & domain" },
  { title: "Online in ~60 seconds", text: "Pick a web address, start" },
  { title: "From ₹499/month", text: "14-day free trial, no card" },
];

export const problem = {
  eyebrow: "The problem",
  title: "Your institute runs on tools that don't talk to each other.",
  sub: "Most coaching institutes stitch together separate apps for leads, classes, tests and payments. Every gap costs time, students or money.",
  tools: ["WhatsApp", "Zoom / Meet", "Google Forms", "Spreadsheets", "Payment tools", "Separate LMS", "Manual follow-ups"],
  items: [
    { n: "01", title: "Leads live in WhatsApp", pain: "Enquiries get lost in chat threads, with no pipeline or follow-up trail.", fix: "Every enquiry, checkout and webinar RSVP lands in one pipeline." },
    { n: "02", title: "Classes happen on Zoom", pain: "Live sessions aren't linked to what a student enrolled in or paid for.", fix: "Live classes sit inside the course, with RSVPs and reminders." },
    { n: "03", title: "Tests run on Google Forms", pain: "Essay and handwritten answers can't be graded properly. Results end up scattered.", fix: "Rubric grading, AI-drafted evaluations and one evaluated-copy view." },
    { n: "04", title: "Payments live in Excel", pain: "Manual reconciliation, no receipts, no GST-ready records.", fix: "Razorpay checkout, UPI/bank fallback and GST-aware invoices." },
    { n: "05", title: "Your platform takes a cut", pain: "Many course platforms charge a monthly fee and a percentage of every enrolment.", fix: "Flat pricing per plan. 0% revenue share, on every plan." },
    { n: "06", title: "Ad clicks land on weak pages", pain: "Paid traffic hits a course listing buried three clicks deep.", fix: "Course landing pages built to convert paid traffic." },
  ],
  closing: "Four or five tools that don't talk to each other means lost leads, re-typed data, slow grading — and a software bill that can grow with every enrolment.",
};

export const solution = {
  eyebrow: "The VILMS solution",
  title: "One platform for the entire student lifecycle.",
  sub: "A lead becomes a student becomes a graduate — on one database, with nothing re-typed by hand along the way.",
  steps: [
    { title: "Lead captured", text: "Ads, webinars, free materials" },
    { title: "Student enrolled", text: "Pays via your Razorpay" },
    { title: "Course consumed", text: "Recorded, live or hybrid" },
    { title: "Answers graded", text: "Rubrics + AI-drafted" },
    { title: "Certificate issued", text: "Under your brand" },
    { title: "Cohort renewed", text: "Upsell the next batch" },
  ],
  institute: { title: "Your institute", text: "Online in about a minute on yourinstitute.vilms.in" },
  database: ["Courses", "Live classes", "Tests", "Materials", "Payments", "Lead CRM", "Certificates"],
  students: { title: "Your students", text: "See only your brand — never “VILMS”" },
  roles: [
    { title: "Owner / Admin", text: "Full access to everything." },
    { title: "Teacher", text: "Courses, grading and materials for their sections." },
    { title: "Sales / Counsellor", text: "Leads, roster and payments only." },
  ],
  integrations: ["Razorpay", "WhatsApp (Wati)", "Zoom / Google Meet", "Anthropic / OpenAI", "Your email provider", "Your video provider", "Your domain"],
};

export type FeatureItem = { title: string; text: string };
export type FeatureGroup = { title: string; items: FeatureItem[] };
export type FeatureTab = {
  id: string;
  label: string;
  title: string;
  sub: string;
  mock?: "builder" | "evaluation" | "pipeline" | "payments" | "brand" | "team" | "security";
  groups: FeatureGroup[];
};

export const features: FeatureTab[] = [
  {
    id: "teach",
    label: "Teach",
    title: "Teach the way you actually teach.",
    sub: "Recorded, live or hybrid courses — with live classes and video that stay inside your own platform.",
    mock: "builder",
    groups: [
      {
        title: "Courses",
        items: [
          { title: "Recorded, live & hybrid", text: "Build any format, or mix them in one course." },
          { title: "Drag-and-drop builder", text: "Arrange modules and lessons the way you teach." },
          { title: "Preview, drip & coming-soon", text: "Control when each lesson becomes available." },
          { title: "Attachments per lesson", text: "Add notes, PDFs and worksheets to any lesson." },
          { title: "Private recordings", text: "Recordings sit inside the course — not on public YouTube." },
        ],
      },
      {
        title: "Live classes & webinars",
        items: [
          { title: "Zoom or Meet links", text: "Paste a link; the class is tied to the course." },
          { title: "RSVPs & reminders", text: "Students confirm; reminders go out before class." },
          { title: "Public webinar sign-up", text: "Registration with no login needed." },
          { title: "Per-session branding", text: "Brand each masterclass on its own." },
          { title: "One-click upsell", text: "Move attendees into the paired paid course." },
        ],
      },
      {
        title: "Video",
        items: [
          { title: "Upload & play in VILMS", text: "No need to open your video provider's dashboard." },
          { title: "Quality per course", text: "480p default keeps delivery costs low." },
          { title: "Cost visibility", text: "Billing page shows storage and monthly delivery." },
          { title: "Spike alerts", text: "An email if usage jumps against your history." },
          { title: "Secure Video", text: "Expiring links, name watermark, device & stream limits." },
        ],
      },
    ],
  },
  {
    id: "assess",
    label: "Assess",
    title: "Grade real answers — not just MCQs.",
    sub: "Tests, handwritten answer evaluation and AI-assisted grading — with a mentor always in control.",
    mock: "evaluation",
    groups: [
      {
        title: "Tests & answer evaluation",
        items: [
          { title: "Tests & mock tests", text: "Auto-graded MCQs that mark themselves." },
          { title: "Long-form answers", text: "Subjective questions, not just multiple choice." },
          { title: "Photo answer uploads", text: "Students upload a photo of their written answer." },
          { title: "Rubric-based grading", text: "Mentors score against clear criteria." },
          { title: "AI-assisted evaluation", text: "AI drafts the evaluation; a mentor approves it." },
          { title: "Evaluated-copy view", text: "Marks, comments and rubric in one view." },
          { title: "Grades on the profile", text: "Every result saved to the student's record." },
        ],
      },
      {
        title: "AI, on your terms",
        items: [
          { title: "Your own AI key", text: "Connect Anthropic or OpenAI and pay them at cost — no markup." },
          { title: "Mentor always decides", text: "Nothing reaches a student until a mentor approves it." },
          { title: "Never used for training", text: "Your students' data is not used to train AI models." },
        ],
      },
      {
        title: "Study materials",
        items: [
          { title: "Public", text: "Free for anyone who visits your site." },
          { title: "Lead-magnet gated", text: "Free in exchange for contact details — builds your lead list." },
          { title: "Enrolled-only", text: "Reserved for students who have paid." },
          { title: "Unmetered storage", text: "PDFs and images are not counted against any limit." },
        ],
      },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    title: "Turn ad clicks into paid enrolments.",
    sub: "Every enquiry in one pipeline, WhatsApp follow-up, and students you can see clearly from first enquiry to renewal.",
    mock: "pipeline",
    groups: [
      {
        title: "Leads & CRM",
        items: [
          { title: "One lead pipeline", text: "Enquiries, checkouts and webinar RSVPs in one place." },
          { title: "Landing pages that convert", text: "Course pages built for paid traffic." },
          { title: "Lead-magnet materials", text: "Free resources that grow your lead list." },
          { title: "WhatsApp follow-up", text: "Through your own WhatsApp (Wati) account." },
          { title: "Your analytics & pixel", text: "Add your own tracking to your site." },
        ],
      },
      {
        title: "Students",
        items: [
          { title: "Batches & branches", text: "Who enrolled, who paid, who has gone quiet." },
          { title: "One student profile", text: "Grades, certificates and order history together." },
          { title: "Roster with lifetime value", text: "See what every student is worth over time." },
          { title: "Upsell & renew", text: "Move students into the next course or batch." },
          { title: "CSV export everywhere", text: "Take your data out whenever you want." },
        ],
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    title: "Fees paid straight into your own account.",
    sub: "Razorpay checkout on your account, UPI and bank fallback, and GST-aware invoices — with 0% revenue share.",
    mock: "payments",
    groups: [
      {
        title: "Payments",
        items: [
          { title: "Your Razorpay checkout", text: "Fees go straight to your own account." },
          { title: "UPI & bank fallback", text: "Accept manual UPI or bank transfers too." },
          { title: "GST-aware invoices", text: "Your own GST invoices and receipts." },
          { title: "Orders & refunds logged", text: "Every transaction on record." },
          { title: "0% revenue share", text: "VILMS never takes a cut of your fees." },
          { title: "No card data with VILMS", text: "Card details stay with your payment provider." },
        ],
      },
    ],
  },
  {
    id: "brand",
    label: "Branding",
    title: "Your brand in front.",
    sub: "White-label everything. Your logo, your colours, your domain — students never see VILMS.",
    mock: "brand",
    groups: [
      {
        title: "White-label branding",
        items: [
          { title: "Your logo, colours & emails", text: "Every screen and message carries your brand." },
          { title: "yourinstitute.vilms.in", text: "Your own website, online in about a minute." },
          { title: "Your own domain", text: "Connect your domain; students never see ours." },
          { title: "Branded certificates & receipts", text: "Issued in your institute's name." },
          { title: "Students never see “VILMS”", text: "Not in the URL, not in the emails." },
          { title: "Your own branded app", text: "Android from Growth; iOS too from Scale." },
        ],
      },
    ],
  },
  {
    id: "team",
    label: "Team",
    title: "Each role sees only what it should.",
    sub: "Give each person the right access — across branches, batches and faculty.",
    mock: "team",
    groups: [
      {
        title: "Team & roles",
        items: [
          { title: "Owner / Admin", text: "Full access to the platform." },
          { title: "Teacher", text: "Courses, grading and materials for their sections." },
          { title: "Sales / Counsellor", text: "Leads, roster and payments only." },
          { title: "Branches & faculty", text: "Multiple branches from Growth; unlimited staff on Institute." },
        ],
      },
      {
        title: "Platform & billing",
        items: [
          { title: "Bring your own accounts", text: "Razorpay, WhatsApp, AI, email and video." },
          { title: "Plan meters", text: "Students and staff logins vs. your plan." },
          { title: "Nothing switches off", text: "No class stops mid-way, even when a trial ends." },
          { title: "Ready-made templates", text: "Student terms and privacy notice to start from." },
          { title: "Onboarding by plan", text: "Setup call, migration or faculty training." },
        ],
      },
    ],
  },
  {
    id: "security",
    label: "Data & security",
    title: "Solid ground beneath.",
    sub: "Keep full control of your data.",
    mock: "security",
    groups: [
      {
        title: "Data & security",
        items: [
          { title: "Your data stays yours", text: "Never sold, never used to train AI." },
          { title: "Stored in India", text: "Primary data in the Mumbai region." },
          { title: "Encrypted", text: "In transit and at rest." },
          { title: "Isolated per institute", text: "Separated at the database level." },
          { title: "Export any time", text: "Students, enrolments and orders to CSV." },
          { title: "Encrypted integration keys", text: "Stored encrypted, used only server-side." },
        ],
      },
    ],
  },
];

export const whyVilms = {
  eyebrow: "Why VILMS",
  title: "Keep 100% of your students' fees.",
  sub: "Commission-based platforms take a cut of every enrolment. VILMS charges one flat monthly price — and nothing else.",
  rows: [
    { plan: "Commission-based — entry tier", note: "10% commission · lower fee", fee: "₹23,988", commission: "₹3,00,000", total: "₹3,23,988", value: 323988 },
    { plan: "Commission-based — higher tier", note: "5% commission · higher fee", fee: "₹1,19,988", commission: "₹1,50,000", total: "₹2,69,988", value: 269988 },
    { plan: "Fixed-fee, USD-priced", note: "0% commission · billed in USD", fee: "₹2,10,144", commission: "—", total: "₹2,10,144", value: 210144 },
    { plan: "VILMS — Growth", note: "0% commission · up to 2,000 students", fee: "₹14,388", commission: "—", total: "₹14,388", value: 14388, us: true },
  ],
  saving: "₹3,09,600",
  savingText: "kept in one year versus a 10%-commission plan at this size — and the gap widens with every student you add.",
  footnote:
    "Worked example: an institute with 200 students paying ₹15,000 a year (₹30,00,000 in fees). Other figures are the publicly listed prices of comparable platforms in each category (USD converted at ₹88). VILMS is the Growth plan (₹1,199/month), all-in, excluding GST.",
  reasons: [
    { title: "0% commission, ever", text: "On every plan, at any size. Students pay into your own account." },
    { title: "India-first payments", text: "Razorpay, UPI and bank fallback, GST-aware invoices." },
    { title: "Your own app & website", text: "Not a listing inside someone else's marketplace." },
    { title: "Fully white-labelled", text: "Your brand and domain. Students never see VILMS." },
    { title: "Flat price, falling per student", text: "From ₹499/month; as low as ₹0.33 per student." },
    { title: "Onboarding that scales", text: "Guided setup, done-for-you migration, faculty training." },
  ],
};

export const audience = {
  eyebrow: "Who it's for",
  title: "Built for institutes that teach — and sell — courses.",
  sub: "VILMS is designed for Indian coaching institutes. It also suits any education business that runs paid courses, live batches and tests.",
  items: [
    { title: "Coaching institutes", core: true, text: "Run cohort batches with live classes, recorded lessons and graded tests — and fill them through ads and webinars.", tags: ["Live batches", "Answer evaluation", "Lead pipeline"] },
    { title: "Test-prep & exam-prep centres", text: "Mock tests, long-form answer writing and mentor feedback, built around exam cycles.", tags: ["Auto-graded MCQs", "AI-assisted evaluation", "Drip lessons"] },
    { title: "Skill academies", text: "Hybrid programmes with branded certificates for every student who completes.", tags: ["Hybrid courses", "Certificates", "Webinars"] },
    { title: "Training institutes", text: "Sell recorded and live programmes under your own brand, across branches and batches, with each team member in the right role.", tags: ["White-label", "Razorpay checkout", "Team roles"] },
    { title: "Schools & colleges — paid programmes", text: "Run add-on programmes such as entrance prep or certificate courses online, with fees paid to your own account.", tags: ["Courses", "Tests", "GST invoices"] },
    { title: "Educators & online academies", text: "Start on Base at ₹499/month and grow to 15,000 students on the same platform.", tags: ["Free materials", "Webinars", "Flat pricing"] },
  ],
  fit: [
    "You run ads or webinars to find students",
    "You teach in batches or cohorts",
    "You evaluate written or handwritten answers",
    "You want to keep 100% of your fee income",
  ],
};

export const benefits = {
  eyebrow: "Benefits",
  title: "What changes when you move to VILMS.",
  sub: "Each outcome below follows directly from how the platform works — not from promises.",
  items: [
    { title: "Keep every rupee of fee income", text: "0% revenue share. Fees go to your own Razorpay account." },
    { title: "Fewer tools to juggle", text: "Courses, live classes, tests, payments and leads together." },
    { title: "Less manual work", text: "A lead becomes a student becomes a graduate — nothing re-typed." },
    { title: "Faster answer evaluation", text: "Mentors review AI-drafted evaluations instead of starting blank." },
    { title: "No more lost enquiries", text: "Every enquiry, checkout and RSVP lands in one pipeline." },
    { title: "A team that works in sync", text: "Owners, teachers and counsellors each see what they need." },
    { title: "Clear visibility", text: "Student profiles with grades, orders and lifetime value." },
    { title: "A brand students remember", text: "Your logo, domain, certificates and emails — never ours." },
    { title: "Costs fall as you grow", text: "From ₹1.00 to ₹0.33 per student a month as you move up." },
  ],
  closing: ["From first enquiry to certificate:", "one login for your team, one brand for your students."],
};

export type Plan = {
  id: "base" | "growth" | "scale" | "institute";
  stage: string;
  name: string;
  price: string;
  students: string;
  perStudent: string;
  blurb: string;
  points: string[];
  onboarding: string;
  featured?: boolean;
};

export const pricing = {
  eyebrow: "Pricing",
  title: "Pick a plan by how many students you teach.",
  plans: [
    { id: "base", stage: "Starting out", name: "Base", price: "₹499", students: "up to 500 students", perStudent: "₹1.00", blurb: "Everything one institute needs to teach, test and get paid online.", points: ["Full platform + your own website", "Single institute"], onboarding: "Self-serve + guided setup call" },
    { id: "growth", stage: "Growing institute", name: "Growth", price: "₹1,199", students: "up to 2,000 students", perStudent: "₹0.60", blurb: "Live classes, your own Android app, and more than one batch to run.", points: ["Your branded Android app", "Multiple branches"], onboarding: "Done-for-you migration", featured: true },
    { id: "scale", stage: "Established institute", name: "Scale", price: "₹2,499", students: "up to 5,000 students", perStudent: "₹0.50", blurb: "Both app stores, a bigger library, and priority support behind it.", points: ["Android + iOS apps", "Bigger library", "Priority support"], onboarding: "Done-for-you migration" },
    { id: "institute", stage: "Large operation", name: "Institute", price: "₹4,999", students: "up to 15,000 students", perStudent: "₹0.33", blurb: "Unlimited staff, 2 TB of library, and a manager who knows your name.", points: ["Android + iOS apps", "Unlimited staff · 2 TB library", "Dedicated manager"], onboarding: "Done-for-you migration + faculty training" },
  ] satisfies Plan[],
  everyPlan: [
    "0% commission on your fees",
    "Your logo, colours & domain",
    "Your own website",
    "Unlimited recorded & live courses",
    "Tests, mock tests & AI-assisted grading",
    "Fees to your own Razorpay + GST invoices",
    "Leads CRM with WhatsApp follow-up",
    "Change plans yourself, any time",
  ],
  trialNote: ["14-day free trial", "No card required", "0% revenue share"],
  footnote:
    "All prices exclude 18% GST. 14-day free trial with no card — after it, add a payment method or stay on Base at ₹499/month. Upgrades apply immediately from your billing page.",
};

export const finalCta = {
  eyebrow: "Let's talk",
  title: "Ready to bring your institute onto one platform?",
  sub: "Courses, live classes, answer evaluation, payments and leads — under your own brand, with 0% commission on your fees.",
  demo: {
    kicker: "Recommended · 30 minutes",
    title: "Book a VILMS demo",
    text: "We'll walk through your current setup and show exactly what moves over — courses, students and all.",
  },
  trial: { title: "Start your 14-day trial", text: "Free, no card needed. Plans from ₹499/month. Online in about a minute." },
  quote: { title: "Teaching 15,000+ students?", text: "Write to us for a custom quote for large operations." },
};

export const nav = [
  { href: "/#features", label: "Features" },
  { href: "/#why-vilms", label: "Why VILMS" },
  { href: "/#who-its-for", label: "Who it's for" },
  { href: "/#pricing", label: "Pricing" },
];
