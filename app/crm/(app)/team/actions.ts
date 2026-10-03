"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authorize, isOwner } from "@/lib/crm/dal";
import { createSessionClient } from "@/lib/supabase/server";

export type TeamState = { error?: string; ok?: string; tempPassword?: string; forEmail?: string } | null;

// Readable but strong: 18 chars from a 57-symbol alphabet (~105 bits).
function tempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length: 18 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

const ROLE = z.enum(["admin", "sales", "viewer"], "Choose a role");

const addSchema = z.object({
  full_name: z.string().trim().min(2, "Enter their name").max(100),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  role: ROLE,
});

// Database errors raised by our own RPCs carry a human-readable message.
function rpcError(error: { code?: string; message?: string }, fallback: string) {
  if (error.code === "23505") return "Someone with that email already has an account.";
  if (error.code === "22023" || error.code === "42501" || error.code === "P0002") return error.message ?? fallback;
  return fallback;
}

export async function addMember(_prev: TeamState, formData: FormData): Promise<TeamState> {
  const auth = await authorize(isOwner);
  if (!auth.ok) return { error: auth.error };
  const parsed = addSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const password = tempPassword();
  const supabase = await createSessionClient();
  const { error } = await supabase.rpc("crm_add_member", {
    p_email: parsed.data.email,
    p_full_name: parsed.data.full_name,
    p_role: parsed.data.role,
    p_password: password,
  });
  if (error) return { error: rpcError(error, "Couldn't add this member.") };

  revalidatePath("/crm/team");
  return { ok: `${parsed.data.full_name} can now sign in.`, tempPassword: password, forEmail: parsed.data.email };
}

const updateSchema = z.object({ member: z.uuid(), role: ROLE, is_active: z.enum(["true", "false"]) });

export async function updateMember(_prev: TeamState, formData: FormData): Promise<TeamState> {
  const auth = await authorize(isOwner);
  if (!auth.ok) return { error: auth.error };
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the role and access fields." };

  const supabase = await createSessionClient();
  const { error } = await supabase.rpc("crm_update_member", {
    p_member: parsed.data.member,
    p_role: parsed.data.role,
    p_is_active: parsed.data.is_active === "true",
  });
  if (error) return { error: rpcError(error, "Couldn't update this member.") };

  revalidatePath("/crm/team");
  return { ok: "Saved." };
}

export async function resetPassword(memberId: string, email: string): Promise<TeamState> {
  const auth = await authorize(isOwner);
  if (!auth.ok) return { error: auth.error };
  if (!z.uuid().safeParse(memberId).success) return { error: "Member not found." };

  const password = tempPassword();
  const supabase = await createSessionClient();
  const { error } = await supabase.rpc("crm_reset_member_password", { p_member: memberId, p_password: password });
  if (error) return { error: rpcError(error, "Couldn't reset the password.") };

  return { ok: "Password reset.", tempPassword: password, forEmail: email };
}
