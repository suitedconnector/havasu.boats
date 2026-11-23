import type { MetadataRoute } from "next";
import {
  getActiveListings,
  getLiveCategories,
} from "@/lib/listings";
import { SITE, CATEGORY_SLUG } from "@/lib/constants";

/** Programmatic sitemap. Every page rendered by generateStaticParams also
 *  appears here — one guaranteed source of truth for the search crawler.
 *  No lastModified: listings carry no real update date, and stamping every
 *  URL with "now" sends crawlers a false freshness signal. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "weekly", priority: 1 },
    ...getLiveCategories().map((c) => ({
      url: `${SITE.url}/${CATEGORY_SLUG[c]}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...getActiveListings().map((l) => ({
      url: `${SITE.url}/listing/${l.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
