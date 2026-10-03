"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSessionClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string };

const loginSchema = z.object({
  email: z.email("Enter your work email.").max(254),
  password: z.string().min(1, "Enter your password.").max(200),
});

// Only allow returning to a CRM page — never an arbitrary URL.
function safeNext(raw: FormDataEntryValue | null) {
  const v = typeof raw === "string" ? raw : "";
  return v.startsWith("/crm") && !v.startsWith("//") && !v.startsWith("/crm/login") ? v : "/crm";
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details.", email };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    const limited = error?.status === 429;
    return { error: limited ? "Too many attempts. Wait a few minutes and try again." : "Email or password is incorrect.", email };
  }

  // A valid Supabase account is not enough — it must be an active team member.
  // (Same client: it now carries the new session, so RLS sees this user.)
  const { data: member } = await supabase
    .from("crm_members")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!member?.is_active) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have access to the VILMS CRM.", email };
  }

  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/crm/login");
}
