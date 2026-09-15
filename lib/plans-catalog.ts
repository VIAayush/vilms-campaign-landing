export type PlanCode = "starter" | "growth" | "scale" | "enterprise";
export type PlanTier = {
  code: PlanCode; name: string; monthlyInr: number; students: number;
  staffLogins: number | null; liveClassMinutesPerMonth: number | null; storageGb: number;
  answerEvalsPerMonth: number; androidApp: boolean; iosApp: boolean; multiBranch: boolean;
  onboarding: string; support: string; blurb: string;
};
export const PLAN_TIERS: readonly PlanTier[] = [
  { code: "starter", name: "Base", monthlyInr: 499, students: 500, staffLogins: 3, liveClassMinutesPerMonth: null, storageGb: 25, answerEvalsPerMonth: 200, androidApp: false, iosApp: false, multiBranch: false, onboarding: "Self-serve + guided setup call", support: "Email, 48h", blurb: "Everything one institute needs to teach, test and get paid online." },
  { code: "growth", name: "Growth", monthlyInr: 1_199, students: 2_000, staffLogins: 10, liveClassMinutesPerMonth: 3_000, storageGb: 150, answerEvalsPerMonth: 1_000, androidApp: true, iosApp: false, multiBranch: true, onboarding: "Done-for-you migration", support: "Email + WhatsApp, 24h", blurb: "Live classes, your own Android app, and more than one batch to run." },
  { code: "scale", name: "Scale", monthlyInr: 2_499, students: 5_000, staffLogins: 25, liveClassMinutesPerMonth: 10_000, storageGb: 500, answerEvalsPerMonth: 4_000, androidApp: true, iosApp: true, multiBranch: true, onboarding: "Done-for-you migration", support: "Priority, 8h", blurb: "Both app stores, a bigger library, and priority support behind it." },
  { code: "enterprise", name: "Institute", monthlyInr: 4_999, students: 15_000, staffLogins: null, liveClassMinutesPerMonth: 30_000, storageGb: 2_048, answerEvalsPerMonth: 15_000, androidApp: true, iosApp: true, multiBranch: true, onboarding: "Done-for-you + faculty training", support: "Dedicated manager, 4h", blurb: "Unlimited staff, 2 TB of library, and a manager who knows your name." },
] as const;
export const FEATURED_PLAN_CODE: PlanCode = "growth";
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export function storageLabel(gb: number): string { return gb >= 1_024 ? `${+(gb / 1_024).toFixed(gb % 1_024 === 0 ? 0 : 1)} TB` : `${gb} GB`; }
