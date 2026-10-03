"use server";

import { z } from "zod";
import { authorize } from "@/lib/crm/dal";
import { createSessionClient } from "@/lib/supabase/server";

export type PasswordState = { error?: string; ok?: string } | null;

const schema = z
  .object({
    current: z.string().min(1, "Enter your current password.").max(200),
    next: z.string().min(12, "Use at least 12 characters.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "The new passwords don't match.", path: ["confirm"] })
  .refine((v) => v.next !== v.current, { message: "Choose a password you haven't used here.", path: ["next"] });

export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const auth = await authorize(() => true);
  if (!auth.ok) return { error: auth.error };
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createSessionClient();
  // Prove it's really them before changing anything.
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: auth.member.email, password: parsed.data.current });
  if (verifyError) return { error: "Your current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.next });
  if (error) return { error: error.message || "Couldn't change your password." };
  return { ok: "Password changed." };
}
