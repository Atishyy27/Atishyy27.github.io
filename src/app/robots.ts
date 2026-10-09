import type { MetadataRoute } from "next";

// output: "export" needs this, or the route is treated as dynamic.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin is a local-only editor with nothing behind it worth indexing,
        // and the empty-state placeholders are not content.
        disallow: ["/admin/", "/journal/none/", "/journal/tag/none/"],
      },
    ],
    sitemap: "https://atishay.tech/sitemap.xml",
    host: "https://atishay.tech",
  };
}
