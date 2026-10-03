import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import type { CrmRole } from "@/lib/lead-options";

export type CrmMember = {
  id: string;
  email: string;
  full_name: string;
  role: CrmRole;
};

export type Viewer =
  | { state: "signed_out" }
  | { state: "not_member"; email: string | null }
  | { state: "member"; member: CrmMember };

/**
 * Who is making this request. Verified with the Supabase Auth server (not just
 * the cookie), then matched to an *active* row in crm_members. Cached per request.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createSessionClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return { state: "signed_out" };

  const { data: member } = await supabase
    .from("crm_members")
    .select("id, email, full_name, role, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!member || !member.is_active) return { state: "not_member", email: userData.user.email ?? null };
  return {
    state: "member",
    member: { id: member.id, email: member.email, full_name: member.full_name, role: member.role as CrmRole },
  };
});

/** For pages: returns the member, or redirects away. */
export async function requireMember(): Promise<CrmMember> {
  const viewer = await getViewer();
  if (viewer.state === "signed_out") redirect("/crm/login");
  if (viewer.state === "not_member") redirect("/crm/login?error=no_access");
  return viewer.member;
}

export const canEdit = (role: CrmRole) => role === "owner" || role === "admin" || role === "sales";
export const isAdmin = (role: CrmRole) => role === "owner" || role === "admin";
export const isOwner = (role: CrmRole) => role === "owner";

/** For server actions: never redirects, returns an error the form can show. */
export async function authorize(
  check: (role: CrmRole) => boolean,
): Promise<{ ok: true; member: CrmMember } | { ok: false; error: string }> {
  const viewer = await getViewer();
  if (viewer.state !== "member") return { ok: false, error: "Your session has ended. Sign in again." };
  if (!check(viewer.member.role)) return { ok: false, error: "Your role doesn't allow this." };
  return { ok: true, member: viewer.member };
}
