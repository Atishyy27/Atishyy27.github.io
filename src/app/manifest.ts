import type { MetadataRoute } from "next";
import { person } from "@/content/site";

export const dynamic = "force-static";

// Makes the site installable and, more usefully, controls the colours the
// browser chrome uses on Android so the address bar stops being white on a
// near-black page.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${person.name} · ${person.tagline}`,
    short_name: person.name,
    description: person.blurb,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
  };
}
