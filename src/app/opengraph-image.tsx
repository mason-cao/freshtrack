import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FreshTrack. Stop throwing out groceries. Save money. Waste less food.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #faf6ef 0%, #f0ebde 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "640px",
            height: "640px",
            background:
              "radial-gradient(circle at top right, rgba(82, 122, 82, 0.18), transparent 60%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "#527a52",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
            }}
          >
            🌿
          </div>
          <div
            style={{
              fontSize: "44px",
              fontWeight: 700,
              color: "#1c1917",
              letterSpacing: "-0.02em",
            }}
          >
            FreshTrack
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 700,
              color: "#1c1917",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: "1000px",
            }}
          >
            Stop throwing out groceries.
          </div>
          <div
            style={{
              fontSize: "36px",
              color: "#57534e",
              lineHeight: 1.3,
              maxWidth: "900px",
            }}
          >
            A free pantry tracker that shows what&apos;s about to go bad, suggests recipes to use it up,
            and tracks the estimated value you&apos;ve saved.
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {[
            { label: "What needs attention", tone: "#92400e", bg: "#fef3c7" },
            { label: "Use-it-up recipes", tone: "#527a52", bg: "#e7f0e3" },
            { label: "Money saved", tone: "#57534e", bg: "#f5f1e8" },
          ].map((pill) => (
            <div
              key={pill.label}
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: pill.tone,
                background: pill.bg,
                padding: "14px 24px",
                borderRadius: "999px",
              }}
            >
              {pill.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
