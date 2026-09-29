import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export, no server, deploys anywhere.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
