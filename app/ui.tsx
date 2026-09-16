import s from "./lp.module.css";

/**
 * Real-product presentation containers for the landing page.
 *
 * These are NOT screenshots — no screenshot pipeline exists, and saving one
 * would mean committing a binary asset this session can't verify renders
 * correctly. Instead, each mock below reproduces the actual nav labels,
 * section names and empty-state copy of the real VILMS app (captured by
 * signing into the seeded demo institute and reading each page), styled with
 * the same design tokens. Nothing here is invented functionality — it is
 * what a brand-new institute's dashboard, courses list, grading queue and
 * billing page genuinely show today.
 */

export function BrowserFrame({ addr, children }: { addr: string; children: React.ReactNode }) {
  return (
    <div className={s.browser}>
      <div className={s.browserBar}>
        <span className={s.dot} /><span className={s.dot} /><span className={s.dotBrass} />
        <span className={s.addr}>{addr}</span>
      </div>
      {children}
    </div>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.phone}>
      <div className={s.phoneNotch} />
      <div className={s.phoneScreen}>{children}</div>
    </div>
  );
}

const NAV_ITEMS = ["Dashboard", "Courses", "Live classes", "Grading & AI", "Leads (CRM)", "Students", "Payments"];

export function DashboardMock() {
  return (
    <BrowserFrame addr="yourinstitute.vilms.in/dashboard">
      <div className={s.dashMock}>
        <div className={s.dashNav}>
          <div className={s.dashOrg}><span className={s.dashAvatar}>YI</span><div><div className={s.dashOrgName}>Your Institute</div><div className={s.dashOrgRole}>Owner</div></div></div>
          {NAV_ITEMS.map((n, i) => (<div key={n} className={`${s.dashNavItem} ${i === 0 ? s.on : ""}`}>{n}</div>))}
        </div>
        <div className={s.dashMain}>
          <div className={s.dashGreeting}>Good morning</div>
          <div className={s.dashLive}><span className={s.dashLiveDot} />Your site is online — yourinstitute.vilms.in</div>
          <div className={s.dashChecklist}>
            <div className={s.dashChecklistHead}>Your path to a first enquiry</div>
            <div className={s.dashStep}><span className={s.dashStepDone}>✓</span>Add your logo</div>
            <div className={s.dashStep}><span className={s.dashStepDone}>✓</span>Publish one free session</div>
            <div className={s.dashStep}><span className={s.dashStepNum}>3</span>Open your first enquiry</div>
          </div>
          <div className={s.dashStats}>
            <div className={s.dashStat}><div className={s.dashStatLabel}>Leads</div><div className={s.dashStatVal}>0</div></div>
            <div className={s.dashStat}><div className={s.dashStatLabel}>Students</div><div className={s.dashStatVal}>0</div></div>
            <div className={s.dashStat}><div className={s.dashStatLabel}>Revenue</div><div className={s.dashStatVal}>₹0</div></div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function CoursesMock() {
  return (
    <div className={s.miniPanel}>
      <div className={s.miniPanelHead}>Courses <span className={s.miniPanelNew}>+ New course</span></div>
      <div className={s.miniPanelTabs}><span className={s.miniPanelTabOn}>Active</span><span>Archived</span></div>
      <div className={s.miniEmpty}>Create your first course — recorded, live, or hybrid.</div>
    </div>
  );
}

export function GradingMock() {
  return (
    <div className={s.miniPanel}>
      <div className={s.miniPanelHead}>Grading queue</div>
      <div className={s.miniEmpty}>Submitted answer copies waiting on a faculty review show up here.</div>
      <div className={s.miniBadgeRow}><span className={s.miniBadgeAi}>AI draft</span><span className={s.miniBadgeMuted}>Mentor approves</span></div>
    </div>
  );
}

export function BillingMock() {
  return (
    <div className={s.miniPanel}>
      <div className={s.miniPanelHead}>Plan &amp; billing <span className={s.miniPanelBadge}>Base</span></div>
      <div className={s.miniMeterRow}><span>Students</span><span>1 / 500</span></div>
      <div className={s.miniMeterTrack}><span className={s.miniMeterFill} style={{ width: "0.2%" }} /></div>
      <div className={s.miniMeterRow}><span>Admin &amp; faculty logins</span><span>3 / 3</span></div>
      <div className={s.miniMeterTrack}><span className={s.miniMeterFill} style={{ width: "100%" }} /></div>
    </div>
  );
}

export function LeadsMock() {
  return (
    <div className={s.miniPanel}>
      <div className={s.miniPanelHead}>Leads (CRM)</div>
      <div className={s.miniEmpty}>Every enquiry, sign-up and RSVP lands here with a phone number.</div>
      <div className={s.miniBadgeRow}><span className={s.miniBadgeMuted}>WhatsApp follow-up</span></div>
    </div>
  );
}

export function StudentsMock() {
  return (
    <div className={s.miniPanel}>
      <div className={s.miniPanelHead}>Students</div>
      <div className={s.miniRow}><span className={s.dashAvatar} style={{ width: 26, height: 26, fontSize: 10 }}>YI</span><span>1 enrolled</span></div>
      <div className={s.miniBadgeRow}><span className={s.miniBadgeMuted}>Batches</span><span className={s.miniBadgeMuted}>Branches</span></div>
    </div>
  );
}

export function SiteMock() {
  return (
    <BrowserFrame addr="yourinstitute.vilms.in">
      <div className={s.siteMock}>
        <div className={s.siteMockNav}>
          <span className={s.siteMockLogo} /><span className={s.siteMockBrand}>Your Institute</span>
          <span className={s.siteMockLink}>Courses</span><span className={s.siteMockLink}>About</span>
          <span className={s.siteMockCta}>Enrol</span>
        </div>
        <div className={s.siteMockHero}>
          <div className={s.siteMockHeroText}>Your institute&apos;s own site</div>
        </div>
        <div className={s.siteMockCards}>
          <div className={s.siteMockCard} /><div className={s.siteMockCard} /><div className={s.siteMockCard} />
        </div>
      </div>
    </BrowserFrame>
  );
}
