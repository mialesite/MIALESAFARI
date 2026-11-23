import type { MetadataRoute } from "next";

const SITE_URL = "https://mialesafari.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/shop",
          "/checkout",
          "/profile",
          "/beekeeping",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
