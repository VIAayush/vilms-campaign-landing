import { ImageResponse } from "next/og";

export const alt = "VILMS — Your students pay you. Not your software.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "white",
          fontFamily: "sans-serif",
          background:
            "radial-gradient(900px 500px at 10% 0%, rgba(91,91,246,.55), transparent 60%), radial-gradient(700px 480px at 100% 30%, rgba(139,92,246,.4), transparent 60%), radial-gradient(600px 400px at 60% 110%, rgba(34,211,238,.25), transparent 60%), #070B1A",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(115deg, #5B5BF6, #8B5CF6 50%, #22D3EE)",
              fontSize: 36,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            V
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>VILMS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>Your students pay you.</div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -3,
              backgroundImage: "linear-gradient(115deg, #8183FF, #C4B5FD 50%, #7DEBF8)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Not your software.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 26, color: "rgba(255,255,255,0.72)" }}>
          Courses · Live classes · Answer evaluation · Payments · Leads — 0% revenue share
        </div>
      </div>
    ),
    size,
  );
}
