import type { MetadataRoute } from "next";

import { createCanonicalUrl, getSiteUrl } from "@/lib/seo/metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: createCanonicalUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
