// Phone numbers are stored as E.164 (+919876543210).
//
// Indian numbers are the main case, typed in every form people actually use:
// "98765 43210", "09876543210", "+91 98765-43210", "919876543210". Anything
// starting with "+" (or "00") is treated as international and only checked
// for E.164 shape. Returns null when the number can't be a real phone.
export function normalizePhone(raw: string): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;

  const international = trimmed.startsWith("+") || trimmed.startsWith("00");
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("00")) digits = digits.slice(2);

  if (international) {
    if (digits.startsWith("91")) return indian(digits.slice(2));
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }

  if (digits.length === 12 && digits.startsWith("91")) return indian(digits.slice(2));
  if (digits.length === 11 && digits.startsWith("0")) return indian(digits.slice(1));
  return indian(digits);
}

function indian(ten: string): string | null {
  // Indian mobiles are 10 digits starting 6-9.
  return /^[6-9]\d{9}$/.test(ten) ? `+91${ten}` : null;
}

/** "+919876543210" -> "+91 98765 43210" for display. */
export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return "—";
  const m = e164.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}

/** Digits only, as wa.me expects. */
export function whatsappLink(e164: string, text?: string): string {
  const base = `https://wa.me/${e164.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
