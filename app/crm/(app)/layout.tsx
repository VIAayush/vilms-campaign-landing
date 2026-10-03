import Link from "next/link";
import { LogOut } from "lucide-react";
import { CrmNav } from "@/components/crm/CrmNav";
import { Logo } from "@/components/site/Logo";
import { isAdmin, requireMember } from "@/lib/crm/dal";
import { roleLabel } from "@/lib/lead-options";
import { signOut } from "../login/actions";

// Every page under here is personal, per-request data.
export const dynamic = "force-dynamic";

export default async function CrmAppLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember();
  const isOwner = member.role === "owner";

  const who = (
    <div className="min-w-0">
      <p className="truncate text-[13.5px] font-semibold text-white">{member.full_name}</p>
      <p className="truncate text-[12px] text-white/55">{roleLabel(member.role)}</p>
    </div>
  );
  const signOutButton = (
    <form action={signOut}>
      <button type="submit" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-medium text-white/65 hover:bg-white/5 hover:text-white">
        <LogOut className="h-4 w-4" aria-hidden />
        Sign out
      </button>
    </form>
  );

  return (
    <div className="lg:flex">
      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col justify-between bg-ink px-3 py-5 lg:flex">
        <div>
          <Link href="/crm" className="mb-7 flex items-center gap-2 px-2">
            <Logo />
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-brass-soft">CRM</span>
          </Link>
          <CrmNav isOwner={isOwner} isAdmin={isAdmin(member.role)} layout="side" />
        </div>
        <div className="space-y-2 border-t border-white/10 px-2 pt-4">
          {who}
          <div className="-mx-2">{signOutButton}</div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 bg-ink px-4 pb-2 pt-3 lg:hidden">
        <div className="mb-2 flex items-center justify-between gap-3">
          <Link href="/crm" className="flex items-center gap-2">
            <Logo />
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-brass-soft">CRM</span>
          </Link>
          {signOutButton}
        </div>
        <CrmNav isOwner={isOwner} isAdmin={isAdmin(member.role)} layout="top" />
      </header>

      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1240px]">{children}</div>
      </main>
    </div>
  );
}
