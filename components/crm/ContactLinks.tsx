"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import { logContact } from "@/app/crm/(app)/leads/actions";
import { whatsappLink } from "@/lib/phone";

type Props = {
  leadId: string;
  phone: string;
  email: string;
  name: string;
  canLog: boolean;
  size?: "sm" | "md";
};

// Real links (tel:, wa.me, mailto:). A click also records the contact attempt
// on the lead's timeline; the link itself is never blocked on that.
export function ContactLinks({ leadId, phone, email, name, canLog, size = "md" }: Props) {
  const firstName = name.split(/\s+/)[0] ?? "";
  const log = (kind: "call" | "whatsapp" | "email") => () => {
    if (canLog) void logContact(leadId, kind);
  };
  const waText = `Hi ${firstName}, this is the VILMS team following up on your enquiry.`;

  const cls =
    size === "sm"
      ? "grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface text-ink-700 transition hover:border-ink/30 hover:bg-paper"
      : "inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[13.5px] font-semibold text-ink transition hover:border-ink/40 hover:bg-paper";
  const icon = size === "sm" ? "h-4 w-4" : "h-4 w-4";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <a href={`tel:${phone}`} onClick={log("call")} className={cls} aria-label={`Call ${name}`} title="Call">
        <Phone className={icon} aria-hidden />
        {size === "md" && "Call"}
      </a>
      <a
        href={whatsappLink(phone, waText)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={log("whatsapp")}
        className={cls}
        aria-label={`WhatsApp ${name}`}
        title="WhatsApp"
      >
        <MessageCircle className={icon} aria-hidden />
        {size === "md" && "WhatsApp"}
      </a>
      <a href={`mailto:${email}`} onClick={log("email")} className={cls} aria-label={`Email ${name}`} title="Email">
        <Mail className={icon} aria-hidden />
        {size === "md" && "Email"}
      </a>
    </div>
  );
}
