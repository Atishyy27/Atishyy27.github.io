// The site declared twitter.card = "summary_large_image" and then shipped no
// image, so every link to atishay.tech rendered as a bare text card: on X, on
// LinkedIn, in Slack, and in whatever an application tracking system shows a
// recruiter. This generates the card at build time.
//
// Drawn, not photographed: no font file is fetched and no image is read from
// disk, so the build cannot break on a missing asset or an offline CDN. The
// palette is the one in globals.css.
//
// Next renders this during `next build` even under output: "export", because
// the route has no dynamic input. The same component backs the Twitter card,
// so there is one image to keep correct rather than two.

import { ImageResponse } from "next/og";
import { person, proof } from "@/content/site";

// Required under output: "export". Without it Next treats the route as a
// request-time handler and refuses to build at all.
export const dynamic = "force-static";

export const alt = `${person.name}, ${person.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0a0a0b";
const FG = "#ededee";
const MUTED = "#8c8c92";
const ACCENT = "#5eb3b3";
const LINE = "#ffffff1f";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: FG,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: ACCENT, letterSpacing: 4 }}>ATISHAY.TECH</div>
          <div style={{ fontSize: 86, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
            {person.name}
          </div>
          <div style={{ fontSize: 38, color: MUTED, marginTop: 14 }}>{person.tagline}</div>
        </div>

        <div style={{ display: "flex", gap: 56, borderTop: `1px solid ${LINE}`, paddingTop: 32 }}>
          {proof.slice(0, 3).map((p) => (
            <div key={p.stat} style={{ display: "flex", flexDirection: "column", maxWidth: 320 }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: ACCENT }}>{p.stat}</div>
              <div style={{ fontSize: 21, color: MUTED, marginTop: 8, lineHeight: 1.3 }}>{p.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
