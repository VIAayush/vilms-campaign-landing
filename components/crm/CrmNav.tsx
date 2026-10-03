"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Gauge, Users, UserCog, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/crm", label: "Dashboard", icon: Gauge, exact: true },
  { href: "/crm/leads", label: "Leads", icon: Users },
  { href: "/crm/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/crm/team", label: "Team", icon: UserCog, ownerOnly: true },
  { href: "/crm/account", label: "Account", icon: UserRound },
];

export function CrmNav({ isOwner, layout }: { isOwner: boolean; layout: "side" | "top" }) {
  const pathname = usePathname();
  const items = ITEMS.filter((i) => !i.ownerOnly || isOwner);

  return (
    <nav aria-label="CRM" className={layout === "side" ? "flex flex-col gap-1" : "flex gap-1 overflow-x-auto"}>
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium transition ${
              active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
