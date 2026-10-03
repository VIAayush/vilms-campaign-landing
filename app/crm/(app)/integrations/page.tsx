import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IntegrationsBoard } from "@/components/crm/integrations/IntegrationsBoard";
import { PageHeader } from "@/components/crm/ui";
import { isAdmin, requireMember } from "@/lib/crm/dal";
import type { IntegrationLog, IntegrationRow } from "@/lib/integrations/catalog";
import { isEncryptionConfigured } from "@/lib/integrations/crypto";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "API & Integrations" };

// Columns the browser may see. Credentials live encrypted in a private table
// and are never selected here.
const ROW_COLUMNS =
  "id, provider, category, name, status, config, events, is_enabled, has_secret, secret_hint, last_verified_at, last_error, updated_at";

export default async function IntegrationsPage() {
  const member = await requireMember();
  if (!isAdmin(member.role)) redirect("/crm");

  const supabase = await createSessionClient();
  const [rowsRes, logsRes] = await Promise.all([
    supabase.from("integrations").select(ROW_COLUMNS).order("created_at"),
    supabase
      .from("integration_events")
      .select("id, created_at, provider, integration_name, event_type, status, response_summary")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <>
      <PageHeader
        title="API & Integrations"
        sub="Connect the services you use to automate lead follow-ups, emails, messaging and analytics."
      />
      <IntegrationsBoard
        rows={(rowsRes.data ?? []) as IntegrationRow[]}
        logs={(logsRes.data ?? []) as IntegrationLog[]}
        encryptionReady={isEncryptionConfigured()}
        loadError={Boolean(rowsRes.error || logsRes.error)}
      />
    </>
  );
}
