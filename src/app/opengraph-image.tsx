import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.name;
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
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(circle at 30% 20%, #134e4a 0%, #000 65%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 30, color: "#5eead4", letterSpacing: 2 }}>{site.name.toUpperCase()}</div>
        <div style={{ marginTop: 20, fontSize: 96, fontWeight: 700 }}>Master your music</div>
        <div style={{ marginTop: 24, fontSize: 34, color: "#cbd5e1", maxWidth: 900 }}>{site.description}</div>
      </div>
    ),
    size
  );
}
