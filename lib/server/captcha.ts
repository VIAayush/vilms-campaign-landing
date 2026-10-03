import "server-only";

// CAPTCHA-ready: when TURNSTILE_SECRET_KEY is set the token is required and
// verified with Cloudflare; when it isn't, this is a no-op and the honeypot,
// timing check and rate limits carry the load. Adding Turnstile later needs
// only the two env vars — the form already renders the widget when the
// public site key is present.
export async function verifyCaptcha(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
