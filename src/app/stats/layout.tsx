import type { Metadata } from "next";
import { seo } from "@/lib/seo";

// The page is a client component, which cannot export metadata, so it lives here.
export const metadata: Metadata = seo(
  "/stats/",
  "Stats · Atishay Jain",
  "Competitive programming ratings on Codeforces and LeetCode, and a year of coding activity, refreshed automatically.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
