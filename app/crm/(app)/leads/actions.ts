"use server";

// Every action re-checks the caller's role here, and the database re-checks it
// again through RLS (and column-level grants) — the UI hiding a button is never
// the only protection.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authorize, canEdit, isAdmin } from "@/lib/crm/dal";
import { fromIstInput } from "@/lib/crm/format";
import { LEAD_STATUSES, PRIORITIES, values } from "@/lib/lead-options";
import { leadFormSchema } from "@/lib/lead-schema";
import { normalizePhone } from "@/lib/phone";
import { createSessionClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; ok?: string } | null;

const idSchema = z.uuid();

function refresh(id: string) {
  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm/leads");
  revalidatePath("/crm");
}

const pipelineSchema = z.object({
  status: z.enum(values(LEAD_STATUSES), "Choose a status"),
  priority: z.enum(values(PRIORITIES), "Choose a priority"),
  assigned_to: z.union([z.uuid(), z.literal("")]),
  next_follow_up_at: z.string().trim().max(20),
});

export async function updatePipeline(leadId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorize(canEdit);
  if (!auth.ok) return { error: auth.error };
  if (!idSchema.safeParse(leadId).success) return { error: "Lead not found." };

  const parsed = pipelineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
  const followUp = fromIstInput(parsed.data.next_follow_up_at);
  if (followUp === undefined) return { error: "Enter a valid follow-up date and time." };

  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("leads")
    .update({
      status: parsed.data.status,
      priority: parsed.data.priority,
      assigned_to: parsed.data.assigned_to || null,
      next_follow_up_at: followUp,
    })
    .eq("id", leadId)
    .select("id");
  if (error || !data?.length) return { error: "Couldn't save. Refresh and try again." };

  refresh(leadId);
  return { ok: "Saved." };
}

const detailsSchema = leadFormSchema.omit({ consent: true });

export async function updateDetails(leadId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorize(canEdit);
  if (!auth.ok) return { error: auth.error };
  if (!idSchema.safeParse(leadId).success) return { error: "Lead not found." };

  const parsed = detailsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
  const d = parsed.data;
  const phone = normalizePhone(d.phone);
  if (!phone) return { error: "Enter a valid phone number." };

  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("leads")
    .update({
      full_name: d.full_name,
      institute_name: d.institute_name,
      email: d.email.toLowerCase(),
      phone,
      city: d.city,
      institute_type: d.institute_type,
      student_count: d.student_count,
      website: d.website || null,
      current_lms: d.current_lms || null,
      interest: d.interest,
      message: d.message || null,
    })
    .eq("id", leadId)
    .select("id");
  if (error || !data?.length) return { error: "Couldn't save. Refresh and try again." };

  refresh(leadId);
  return { ok: "Details updated." };
}

const noteSchema = z.object({ body: z.string().trim().min(1, "Write a note first.").max(5000, "Note is too long.") });

export async function addNote(leadId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorize(canEdit);
  if (!auth.ok) return { error: auth.error };
  if (!idSchema.safeParse(leadId).success) return { error: "Lead not found." };

  const parsed = noteSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("lead_activities")
    .insert({ lead_id: leadId, actor_id: auth.member.id, type: "note", body: parsed.data.body });
  if (error) return { error: "Couldn't add the note." };

  refresh(leadId);
  return { ok: "Note added." };
}

const CONTACT_TYPES = { call: "contact_call", whatsapp: "contact_whatsapp", email: "contact_email" } as const;

/** Logged when someone clicks Call / WhatsApp / Email on a lead. */
export async function logContact(leadId: string, kind: keyof typeof CONTACT_TYPES): Promise<ActionState> {
  const auth = await authorize(canEdit);
  if (!auth.ok) return { error: auth.error };
  if (!idSchema.safeParse(leadId).success || !(kind in CONTACT_TYPES)) return { error: "Invalid request." };

  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("lead_activities")
    .insert({ lead_id: leadId, actor_id: auth.member.id, type: CONTACT_TYPES[kind] });
  if (error) return { error: "Couldn't log the contact." };
  await supabase.from("leads").update({ last_contacted_at: new Date().toISOString() }).eq("id", leadId);

  refresh(leadId);
  return { ok: "Logged." };
}

export async function setSpam(leadId: string, isSpam: boolean): Promise<ActionState> {
  const auth = await authorize(canEdit);
  if (!auth.ok) return { error: auth.error };
  if (!idSchema.safeParse(leadId).success) return { error: "Lead not found." };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.from("leads").update({ is_spam: isSpam }).eq("id", leadId).select("id");
  if (error || !data?.length) return { error: "Couldn't update." };

  refresh(leadId);
  return { ok: isSpam ? "Marked as spam." : "Restored." };
}

export async function deleteLead(leadId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorize(isAdmin);
  if (!auth.ok) return { error: auth.error };
  if (!idSchema.safeParse(leadId).success) return { error: "Lead not found." };
  if (formData.get("confirm") !== "DELETE") return { error: "Type DELETE to confirm." };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.from("leads").delete().eq("id", leadId).select("id");
  if (error || !data?.length) return { error: "Couldn't delete this lead." };

  revalidatePath("/crm/leads");
  revalidatePath("/crm");
  redirect("/crm/leads?deleted=1");
}
