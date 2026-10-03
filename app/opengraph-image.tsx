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
          background: "linear-gradient(135deg, #0A2E25 0%, #14483A 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#F6F5F0",
              color: "#0A2E25",
              fontSize: 38,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            V
          </div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>VILMS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02 }}>Your students pay you.</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, color: "#E8A33D" }}>Not your software.</div>
        </div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
          Courses · Live classes · Answer evaluation · Payments · Leads — 0% revenue share
        </div>
      </div>
    ),
    size,
  );
}
