import type { MetadataRoute } from "next";

import { createCanonicalUrl, getSiteUrl } from "@/lib/seo/metadata";

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
