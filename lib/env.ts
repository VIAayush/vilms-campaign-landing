// Public configuration (safe in the browser). Server secrets are read where
// they're used, inside server-only modules.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vilms.in").replace(/\/$/, "");
export const TRIAL_URL = process.env.NEXT_PUBLIC_TRIAL_URL || "https://vilms.in/start";
// Where institute owners sign in to their VILMS account (not the sales CRM).
export const SIGNIN_URL = process.env.NEXT_PUBLIC_SIGNIN_URL || new URL("/login", TRIAL_URL).toString();
export const DEMO_BOOKING_URL = process.env.NEXT_PUBLIC_DEMO_BOOKING_URL || "";
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
