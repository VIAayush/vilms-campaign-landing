import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "CRM", template: "%s · VILMS CRM" },
  robots: { index: false, follow: false, nocache: true },
};

export default function CrmRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper">{children}</div>;
}
