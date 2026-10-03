"use server";

// API & Integrations — admin-only. Every action re-checks the role here, and
// RLS / the database functions check it again. Credentials are encrypted
// before they leave this server and are never returned to the browser.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ADAPTERS, run, safeUrl } from "@/lib/integrations/adapters";
import { INTEGRATION_EVENTS, providerById, type IntegrationEvent, type ProviderDef } from "@/lib/integrations/catalog";
import { decryptSecrets, encryptSecrets, isEncryptionConfigured, secretHint } from "@/lib/integrations/crypto";
import { authorize, isAdmin } from "@/lib/crm/dal";
import { createSessionClient } from "@/lib/supabase/server";

export type IntegrationActionState = { ok?: string; error?: string; tested?: boolean } | null;

const PATH = "/crm/integrations";
const EVENT_IDS = INTEGRATION_EVENTS.map((e) => e.id) as string[];

type Row = { id: string; provider: string; config: Record<string, string>; has_secret: boolean };

function requiredMissing(def: ProviderDef, config: Record<string, string>, secrets: Record<string, string>) {
  return def.fields.filter((f) => f.required && !(f.type === "secret" ? secrets[f.key] : config[f.key])).map((f) => f.label);
}

/** Runs the provider test and records the outcome on the row and in the log. */
async function verify(row: Row, def: ProviderDef): Promise<{ ok: boolean; summary: string }> {
  const supabase = await createSessionClient();
  let secrets: Record<string, string> = {};
  if (row.has_secret) {
    const { data: cipher } = await supabase.rpc("crm_integration_secret", { p_integration: row.id });
    try {
      secrets = decryptSecrets(cipher as string | null);
    } catch {
      return { ok: false, summary: "Saved credentials can't be decrypted. Re-enter them (was INTEGRATIONS_ENCRYPTION_KEY changed?)." };
    }
  }
  const missing = requiredMissing(def, row.config, secrets);
  let result: { ok: boolean; summary: string };
  if (missing.length) {
    result = { ok: false, summary: `Missing: ${missing.join(", ")}` };
    await supabase.from("integrations").update({ status: "needs_configuration", last_error: result.summary }).eq("id", row.id);
  } else {
    result = await run(() => ADAPTERS[def.id].test({ config: row.config, secrets }));
    await supabase
      .from("integrations")
      .update(
        result.ok
          ? { status: "connected", last_verified_at: new Date().toISOString(), last_error: null }
          : { status: "error", last_error: result.summary.slice(0, 300) },
      )
      .eq("id", row.id);
  }
  await supabase.rpc("crm_log_integration_event", {
    p_integration: row.id,
    p_event: "connection_test",
    p_status: result.ok ? "success" : "failed",
    p_summary: result.summary,
    p_lead: null,
    p_metadata: {},
  });
  return result;
}

export async function saveIntegration(_prev: IntegrationActionState, formData: FormData): Promise<IntegrationActionState> {
  const auth = await authorize(isAdmin);
  if (!auth.ok) return { error: auth.error };

  const def = providerById(String(formData.get("provider") ?? ""));
  if (!def || !ADAPTERS[def.id]) return { error: "Unknown provider." };
  const idRaw = String(formData.get("id") ?? "");
  const id = idRaw ? z.uuid().safeParse(idRaw) : null;
  if (id && !id.success) return { error: "Integration not found." };

  const supabase = await createSessionClient();
  let existing: Row | null = null;
  if (id?.success) {
    const { data } = await supabase.from("integrations").select("id, provider, config, has_secret").eq("id", id.data).maybeSingle();
    if (!data || data.provider !== def.id) return { error: "Integration not found." };
    existing = data as Row;
  } else if (!def.multiple) {
    const { data } = await supabase.from("integrations").select("id").eq("provider", def.id).limit(1);
    if (data?.length) return { error: `${def.name} is already set up. Use Configure to change it.` };
  }

  // Split the submitted fields into non-secret config and secrets.
  const config: Record<string, string> = {};
  const newSecrets: Record<string, string> = {};
  for (const f of def.fields) {
    const v = String(formData.get(`f_${f.key}`) ?? "").trim();
    if (v.length > (f.type === "textarea" ? 1000 : 500)) return { error: `${f.label} is too long.` };
    if (f.type === "secret") {
      if (v) newSecrets[f.key] = v;
      continue;
    }
    if (!v) continue;
    if (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)) return { error: `${f.label}: enter a valid email.` };
    if (f.type === "url") {
      try {
        safeUrl(v);
      } catch (err) {
        return { error: `${f.label}: ${err instanceof Error ? err.message : "invalid URL"}.` };
      }
    }
    if (f.pattern && !new RegExp(f.pattern).test(v)) return { error: `${f.label} doesn't look right.` };
    config[f.key] = v;
  }
  const events = formData.getAll("events").map(String).filter((e) => EVENT_IDS.includes(e) && (def.events as readonly string[]).includes(e)) as IntegrationEvent[];
  const isEnabled = formData.get("is_enabled") === "on";
  const name = (def.multiple ? config.name : undefined) || def.name;

  if (Object.keys(newSecrets).length && !isEncryptionConfigured()) {
    return { error: "INTEGRATIONS_ENCRYPTION_KEY is not set on the server, so credentials can't be stored safely. See README → Integrations." };
  }

  // Save the row (config never contains secrets).
  let rowId = existing?.id;
  if (existing) {
    const { error } = await supabase.from("integrations").update({ name, config, events, is_enabled: isEnabled }).eq("id", existing.id);
    if (error) return { error: "Couldn't save the integration." };
  } else {
    const { data, error } = await supabase
      .from("integrations")
      .insert({ provider: def.id, category: def.category, name, config, events, is_enabled: isEnabled, status: "needs_configuration", created_by: auth.member.id })
      .select("id")
      .single();
    if (error || !data) return { error: "Couldn't save the integration." };
    rowId = data.id as string;
  }

  // Merge new secrets with any already stored (blank field = keep the old one).
  let hasSecret = existing?.has_secret ?? false;
  if (Object.keys(newSecrets).length) {
    let merged = newSecrets;
    if (existing?.has_secret) {
      const { data: cipher } = await supabase.rpc("crm_integration_secret", { p_integration: rowId });
      try {
        merged = { ...decryptSecrets(cipher as string | null), ...newSecrets };
      } catch {
        merged = newSecrets;
      }
    }
    const primary = def.fields.find((f) => f.type === "secret" && merged[f.key]);
    const { error } = await supabase.rpc("crm_save_integration_secret", {
      p_integration: rowId,
      p_ciphertext: encryptSecrets(merged),
      p_hint: primary ? secretHint(merged[primary.key]) : "••••",
    });
    if (error) return { error: "Saved the settings, but couldn't store the credentials." };
    hasSecret = true;
  }

  // Verify straight away so the status is truthful.
  const result = await verify({ id: rowId!, provider: def.id, config, has_secret: hasSecret }, def);
  revalidatePath(PATH);
  return result.ok ? { ok: `Saved · Connection successful — ${result.summary}`, tested: true } : { error: `Saved, but the connection failed: ${result.summary}` };
}

export async function testIntegration(id: string): Promise<IntegrationActionState> {
  const auth = await authorize(isAdmin);
  if (!auth.ok) return { error: auth.error };
  if (!z.uuid().safeParse(id).success) return { error: "Integration not found." };
  const supabase = await createSessionClient();
  const { data } = await supabase.from("integrations").select("id, provider, config, has_secret").eq("id", id).maybeSingle();
  const def = data ? providerById(data.provider as string) : undefined;
  if (!data || !def) return { error: "Integration not found." };
  const result = await verify(data as Row, def);
  revalidatePath(PATH);
  return result.ok ? { ok: `Connection successful — ${result.summary}`, tested: true } : { error: `Connection failed — ${result.summary}` };
}

export async function setIntegrationEnabled(id: string, enabled: boolean): Promise<IntegrationActionState> {
  const auth = await authorize(isAdmin);
  if (!auth.ok) return { error: auth.error };
  if (!z.uuid().safeParse(id).success) return { error: "Integration not found." };
  const supabase = await createSessionClient();
  const { data, error } = await supabase.from("integrations").update({ is_enabled: enabled }).eq("id", id).select("id");
  if (error || !data?.length) return { error: "Couldn't update the integration." };
  revalidatePath(PATH);
  return { ok: enabled ? "Enabled." : "Disabled." };
}

/** Removes the integration and its encrypted credentials (log entries stay). */
export async function disconnectIntegration(id: string): Promise<IntegrationActionState> {
  const auth = await authorize(isAdmin);
  if (!auth.ok) return { error: auth.error };
  if (!z.uuid().safeParse(id).success) return { error: "Integration not found." };
  const supabase = await createSessionClient();
  await supabase.rpc("crm_log_integration_event", {
    p_integration: id,
    p_event: "disconnected",
    p_status: "success",
    p_summary: "Integration and its credentials removed",
    p_lead: null,
    p_metadata: {},
  });
  const { data, error } = await supabase.from("integrations").delete().eq("id", id).select("id");
  if (error || !data?.length) return { error: "Couldn't disconnect." };
  revalidatePath(PATH);
  return { ok: "Disconnected." };
}
