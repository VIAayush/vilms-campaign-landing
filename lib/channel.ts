import type { Channel } from "./lead-options";

const PAID_MEDIUMS = /^(cpc|ppc|paid|paid[_-]?social|paidsocial|paid[_-]?search|display|cpm|ads?|retargeting|remarketing)$/i;
const SEARCH_HOSTS = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|baidu)\./i;
const SOCIAL_HOSTS = /(^|\.)(facebook|fb|instagram|t|twitter|x|youtube|quora|reddit|pinterest|threads)\.(com|co|net)$/i;

function host(url?: string | null): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

// Turns UTM tags / ad click ids / the referrer into one reporting channel, so
// the CRM can answer "Google Ads -> Lead? Meta Ads -> Lead? Organic? Direct?".
export function deriveChannel(input: {
  source?: string | null;
  medium?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  referrer?: string | null;
  siteHost?: string;
}): Channel {
  const source = (input.source ?? "").trim().toLowerCase();
  const medium = (input.medium ?? "").trim().toLowerCase();
  const paid = PAID_MEDIUMS.test(medium);

  if (input.gclid || (/(google|adwords|gads)/.test(source) && paid)) return "google_ads";
  if (/(facebook|fb|instagram|ig|meta)/.test(source) && paid) return "meta_ads";
  if (/linkedin/.test(source)) return paid ? "linkedin_ads" : "linkedin";
  if (paid) return "other_paid";
  if (medium === "email" || source === "email" || source === "newsletter") return "email";
  if (source) return "campaign";

  const ref = host(input.referrer);
  if (!ref || (input.siteHost && ref === input.siteHost)) return input.fbclid ? "social" : "direct";
  if (SEARCH_HOSTS.test(ref)) return "organic_search";
  if (/linkedin\.com$|lnkd\.in$/.test(ref)) return "linkedin";
  if (SOCIAL_HOSTS.test(ref) || input.fbclid) return "social";
  return "referral";
}
