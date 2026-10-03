"use client";

import { useActionState, useState } from "react";
import { submitKeepingValues } from "@/components/crm/form-utils";
import { updateDetails, type ActionState } from "@/app/crm/(app)/leads/actions";
import { FormMessage } from "@/components/crm/ui";
import { INSTITUTE_TYPES, INTERESTS, STUDENT_COUNTS, instituteTypeLabel, interestLabel, studentCountLabel } from "@/lib/lead-options";
import { formatPhone } from "@/lib/phone";

type Details = {
  full_name: string;
  institute_name: string;
  email: string;
  phone: string;
  city: string;
  institute_type: string;
  student_count: string;
  website: string | null;
  current_lms: string | null;
  interest: string;
  message: string | null;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2 text-[13.5px]">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-body">{children}</dd>
    </div>
  );
}

export function DetailsForm({ leadId, lead, canEdit }: { leadId: string; lead: Details; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const result = await updateDetails(leadId, prev, fd);
    if (result?.ok) setEditing(false);
    return result;
  }, null);

  if (!editing) {
    const site = lead.website ? (/^https?:\/\//i.test(lead.website) ? lead.website : `https://${lead.website}`) : null;
    return (
      <div className="p-4">
        <dl className="divide-y divide-line">
          <Row label="Name">{lead.full_name}</Row>
          <Row label="Institute">{lead.institute_name}</Row>
          <Row label="Email">{lead.email}</Row>
          <Row label="Phone">{formatPhone(lead.phone)}</Row>
          <Row label="City">{lead.city}</Row>
          <Row label="Type">{instituteTypeLabel(lead.institute_type)}</Row>
          <Row label="Students">{studentCountLabel(lead.student_count)}</Row>
          <Row label="Interested in">{interestLabel(lead.interest)}</Row>
          <Row label="Website">
            {site ? (
              <a href={site} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-ink-600 underline underline-offset-2">
                {lead.website}
              </a>
            ) : "—"}
          </Row>
          <Row label="Current LMS">{lead.current_lms || "—"}</Row>
          <Row label="Message">{lead.message ? <span className="whitespace-pre-wrap">{lead.message}</span> : "—"}</Row>
        </dl>
        <div className="mt-3 flex items-center gap-3">
          {canEdit && (
            <button type="button" onClick={() => setEditing(true)} className="btn-ghost min-h-[38px] text-[14px]">
              Edit details
            </button>
          )}
          <FormMessage state={state} />
        </div>
      </div>
    );
  }

  const input = (name: keyof Details, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="field-label">{label}</span>
      <input name={name} defaultValue={lead[name] ?? ""} className="field-input text-[14px]" {...props} />
    </label>
  );
  const select = (name: keyof Details, label: string, options: readonly { value: string; label: string }[]) => (
    <label className="block">
      <span className="field-label">{label}</span>
      <select name={name} defaultValue={lead[name] ?? ""} className="field-input text-[14px]">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );

  return (
    <form onSubmit={submitKeepingValues(action)} className="space-y-3 p-4">
      <fieldset disabled={pending} className="grid gap-3 sm:grid-cols-2">
        {input("full_name", "Name", { required: true, maxLength: 100 })}
        {input("institute_name", "Institute", { required: true, maxLength: 150 })}
        {input("email", "Email", { type: "email", required: true, maxLength: 254 })}
        {input("phone", "Phone", { type: "tel", required: true, maxLength: 20 })}
        {input("city", "City", { required: true, maxLength: 80 })}
        {select("institute_type", "Institute type", INSTITUTE_TYPES)}
        {select("student_count", "Students", STUDENT_COUNTS)}
        {select("interest", "Interested in", INTERESTS)}
        {input("website", "Website", { maxLength: 300 })}
        {input("current_lms", "Current LMS", { maxLength: 120 })}
        <label className="block sm:col-span-2">
          <span className="field-label">Message</span>
          <textarea name="message" defaultValue={lead.message ?? ""} rows={3} maxLength={2000} className="field-input text-[14px]" />
        </label>
      </fieldset>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className="btn-ink min-h-[38px] text-[14px]" disabled={pending}>
          {pending ? "Saving…" : "Save details"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="btn-ghost min-h-[38px] text-[14px]" disabled={pending}>
          Cancel
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
