import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Integration credentials are encrypted here, on the server, before they are
// sent to the database (AES-256-GCM, random 96-bit IV, authenticated). The key
// lives only in the server environment (INTEGRATIONS_ENCRYPTION_KEY), so the
// database — and anyone who can read it — only ever sees ciphertext.

const VERSION = "v1";

function key(): Buffer {
  const raw = process.env.INTEGRATIONS_ENCRYPTION_KEY?.trim();
  if (!raw) throw new Error("INTEGRATIONS_ENCRYPTION_KEY is not set");
  const buf = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (buf.length !== 32) throw new Error("INTEGRATIONS_ENCRYPTION_KEY must be 32 bytes (base64 or 64 hex chars)");
  return buf;
}

export function isEncryptionConfigured() {
  try {
    key();
    return true;
  } catch {
    return false;
  }
}

export function encryptSecrets(secrets: Record<string, string>): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(secrets), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ct.toString("base64url")].join(".");
}

export function decryptSecrets(payload: string | null | undefined): Record<string, string> {
  if (!payload) return {};
  const [version, iv, tag, ct] = payload.split(".");
  if (version !== VERSION || !iv || !tag || !ct) throw new Error("Unrecognised credential format");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  const pt = Buffer.concat([decipher.update(Buffer.from(ct, "base64url")), decipher.final()]).toString("utf8");
  const parsed = JSON.parse(pt) as unknown;
  return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
}

/** "••••1a2b" — enough to recognise a key, never enough to use it. */
export function secretHint(value: string) {
  const v = value.trim();
  return v.length <= 8 ? "••••" : `••••${v.slice(-4)}`;
}
