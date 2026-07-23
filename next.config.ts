import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export, no server, deploys anywhere.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config) => {
    // transformers.js pulls in node-only deps it never uses in the browser;
    // stub them so the static build doesn't try to bundle them.
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
};

export default nextConfig;
