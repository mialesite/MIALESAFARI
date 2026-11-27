import type { MetadataRoute } from "next";

const SITE_URL = "https://mialesafari.com";

// Only routes that resolve without a database read. The itinerary and
// destination detail pages are CMS-driven, so they join the sitemap once the
// live rows are confirmed.
const PAGES: { path: string; priority: number; changefreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changefreq: "weekly" },
  { path: "/destinations", priority: 0.9, changefreq: "weekly" },
  { path: "/itineraries", priority: 0.9, changefreq: "weekly" },
  { path: "/parks", priority: 0.8, changefreq: "weekly" },
  { path: "/about", priority: 0.7, changefreq: "monthly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/credits", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq,
    priority: page.priority,
  }));
}
