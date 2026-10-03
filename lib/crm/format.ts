// Dates in the CRM are always shown in India time, whatever the server's zone.
const TZ = "Asia/Kolkata";

const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short" });
const numberFmt = new Intl.NumberFormat("en-IN");

/** The time this request is being rendered. CRM pages are server components,
 *  rendered once per request, so a single "now" keeps a page consistent. */
export const requestNow = () => Date.now();

export const formatDateTime =(iso?: string | null) => (iso ? dateTimeFmt.format(new Date(iso)) : "—");
export const formatDate = (iso?: string | null) => (iso ? dateFmt.format(new Date(iso)) : "—");
export const formatShortDate = (iso?: string | null) => (iso ? shortDateFmt.format(new Date(iso)) : "—");
export const formatNumber = (n: number) => numberFmt.format(n);

export function timeAgo(iso?: string | null, now = Date.now()) {
  if (!iso) return "—";
  const diff = Math.round((now - new Date(iso).getTime()) / 1000);
  const future = diff < 0;
  const s = Math.abs(diff);
  const unit =
    s < 60 ? "just now"
    : s < 3600 ? `${Math.floor(s / 60)}m`
    : s < 86400 ? `${Math.floor(s / 3600)}h`
    : s < 86400 * 30 ? `${Math.floor(s / 86400)}d`
    : null;
  if (unit === null) return formatDate(iso);
  if (unit === "just now") return unit;
  return future ? `in ${unit}` : `${unit} ago`;
}

/** ISO timestamp → value for <input type="datetime-local">, in India time. */
export function toIstInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value (India time) → ISO timestamp, or null. */
export function fromIstInput(value?: string | null) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return undefined;
  const d = new Date(`${value}:00+05:30`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Start of a calendar day in India time, as ISO. `yyyy-mm-dd` in, ISO out. */
export function istDayStart(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  return new Date(`${day}T00:00:00+05:30`).toISOString();
}

export function pct(part: number, whole: number) {
  if (!whole) return "—";
  const v = (part / whole) * 100;
  return `${v >= 10 || v === 0 ? Math.round(v) : v.toFixed(1)}%`;
}
