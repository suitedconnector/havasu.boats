import type { MetadataRoute } from "next";
import {
  getActiveListings,
  getLiveCategories,
} from "@/lib/listings";
import { SITE, CATEGORY_SLUG } from "@/lib/constants";

/** Programmatic sitemap. Every page rendered by generateStaticParams also
 *  appears here — one guaranteed source of truth for the search crawler. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...getLiveCategories().map((c) => ({
      url: `${SITE.url}/${CATEGORY_SLUG[c]}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...getActiveListings().map((l) => ({
      url: `${SITE.url}/listing/${l.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
