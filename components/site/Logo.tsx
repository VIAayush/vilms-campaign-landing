export function Logo({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const onDark = tone === "light";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className={`grid h-9 w-9 place-items-center rounded-[10px] font-display text-[18px] font-extrabold ${
          onDark ? "bg-paper text-ink" : "bg-ink text-paper"
        }`}
      >
        V
      </span>
      <span className={`font-display text-[20px] font-extrabold tracking-tight ${onDark ? "text-white" : "text-ink"}`}>
        VILMS
      </span>
    </span>
  );
}
