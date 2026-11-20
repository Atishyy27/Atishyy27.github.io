import type { Metadata } from "next";
import { seo } from "@/lib/seo";

// The page is a client component, which cannot export metadata, so it lives here.
export const metadata: Metadata = seo(
  "/about/",
  "About · Atishay Jain",
  "Who I am, where I have worked, what I have published, and how to reach me. Mechanical engineering undergrad at SGSITS Indore who ships software.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
