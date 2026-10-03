import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { getViewer } from "@/lib/crm/dal";
import { isSupabaseConfigured } from "@/lib/env";
import { signOut } from "./actions";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function CrmLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const viewer = isSupabaseConfigured() ? await getViewer() : ({ state: "signed_out" } as const);
  if (viewer.state === "member") redirect("/crm");

  const safeNext = next && next.startsWith("/crm") && !next.startsWith("//") ? next : "/crm";

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="mb-8 inline-flex" aria-label="VILMS home">
          <Logo tone="dark" />
        </Link>
        <div className="card p-6 sm:p-7">
          <h1 className="text-[26px] font-bold">Sign in to the CRM</h1>
          <p className="mt-1.5 text-[14px] text-muted">For the VILMS team only. Accounts are created by the CRM owner.</p>

          {!isSupabaseConfigured() ? (
            <p className="mt-5 rounded-lg bg-warn-bg px-3 py-2 text-[13.5px] text-warn">
              The CRM isn&apos;t connected to its database yet. Set the Supabase environment variables (see README).
            </p>
          ) : viewer.state === "not_member" ? (
            <div className="mt-5 space-y-3">
              <p role="alert" className="rounded-lg bg-err-bg px-3 py-2 text-[13.5px] font-medium text-err">
                {viewer.email ?? "This account"} isn&apos;t an active member of the CRM team.
              </p>
              <form action={signOut}>
                <button type="submit" className="btn-ghost w-full">Sign out and use another account</button>
              </form>
            </div>
          ) : (
            <div className="mt-5">
              <LoginForm
                next={safeNext}
                initialError={error === "no_access" ? "This account doesn't have access to the VILMS CRM." : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
