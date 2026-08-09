import type { Listing, ServiceTag, Town } from "./types";
import { LAUNCH_CATEGORIES, CATEGORY_SLUG } from "./constants";
import listingsData from "@/data/listings-with-descriptions.json";

// ============================================================================
// The static data access layer. Every page reads from here — no runtime DB,
// no API. Pattern comes from haulagua's lib/location.ts.
// ============================================================================

const ALL_LISTINGS = listingsData as Listing[];

/** All listings that should render on the public site (isActive === true). */
export function getActiveListings(): Listing[] {
  return ALL_LISTINGS.filter((l) => l.isActive);
}

/** Listings for a given category page. */
export function getListingsByService(service: ServiceTag): Listing[] {
  return getActiveListings()
    .filter((l) => l.services.includes(service))
    .sort(byFeaturedThenRating);
}

/** Every listing's slug — for generateStaticParams. */
export function getAllSlugs(): string[] {
  return getActiveListings().map((l) => l.slug);
}

/** Look up a single listing by slug. */
export function getListingBySlug(slug: string): Listing | null {
  return getActiveListings().find((l) => l.slug === slug) ?? null;
}

/** Distinct towns present in the active data. Used for optional filters. */
export function getActiveTowns(): Town[] {
  const towns = new Set<Town>();
  for (const l of getActiveListings()) {
    if (l.town) towns.add(l.town);
  }
  return [...towns];
}

/** Categories that (a) are on the launch list AND (b) actually have listings. */
export function getLiveCategories(): ServiceTag[] {
  const withData = new Set<ServiceTag>();
  for (const l of getActiveListings()) {
    for (const s of l.services) withData.add(s);
  }
  return LAUNCH_CATEGORIES.filter((c) => withData.has(c));
}

/** Reverse lookup: URL slug → ServiceTag. */
export function serviceFromSlug(slug: string): ServiceTag | null {
  const entry = Object.entries(CATEGORY_SLUG).find(([, s]) => s === slug);
  return (entry?.[0] as ServiceTag) ?? null;
}

// ─── Sorting ────────────────────────────────────────────────────────────────

/** Featured first, then by (rating × log(reviewCount)) so businesses with
 *  many reviews outrank ones with three 5-stars. Nulls sink. */
function byFeaturedThenRating(a: Listing, b: Listing): number {
  if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
  return score(b) - score(a);
}

function score(l: Listing): number {
  const r = l.rating ?? 0;
  const n = l.reviewCount ?? 0;
  return r * Math.log10(n + 1);
}
