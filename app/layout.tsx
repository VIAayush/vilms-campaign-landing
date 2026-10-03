import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

const title = "VILMS — LMS for Coaching Institutes | Your students pay you. Not your software.";
const description =
  "VILMS is the all-in-one learning platform for coaching institutes: courses, live classes, answer evaluation, payments and a lead CRM under your own brand. 0% revenue share, plans from ₹499/month, 14-day free trial.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: "%s · VILMS" },
  description,
  applicationName: "VILMS",
  keywords: [
    "VILMS",
    "LMS for coaching institutes",
    "learning management system for coaching institutes",
    "coaching institute software",
    "online coaching platform",
    "white label LMS",
    "education management platform",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "VILMS",
    locale: "en_IN",
    title: "VILMS — Your students pay you. Not your software.",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "VILMS — Your students pay you. Not your software.",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A2E25",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
