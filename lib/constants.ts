import type { ServiceTag, Town, BoatType } from "./types";

// ============================================================================
// Site-wide constants. Edit here to rebrand or change launch scope.
// ============================================================================

export const SITE = {
  name: "havasu.boats",
  tagline: "The Lake Havasu boat directory.",
  url: "https://havasu.boats",
  description:
    "Boat rentals, dealers, and marinas around Lake Havasu — from the Channel to Parker.",
} as const;

/** Which categories render a public landing page. Others are dormant
 *  (imported into the data but no page generated yet). */
export const LAUNCH_CATEGORIES: readonly ServiceTag[] = [
  "rentals",
  "sales",
  "marina",
] as const;

/** URL slugs for each category page. */
export const CATEGORY_SLUG: Record<ServiceTag, string> = {
  rentals: "rentals",
  sales: "dealers",
  marina: "marinas",
  "dry-storage": "dry-storage",
  "lot-storage": "storage-lots",
  tours: "tours",
  repair: "repair",
  retail: "retail",
};

export const CATEGORY_LABEL: Record<ServiceTag, string> = {
  rentals: "Boat & PWC Rentals",
  sales: "Boat Dealers",
  marina: "Marinas",
  "dry-storage": "Dry Storage",
  "lot-storage": "Storage Lots",
  tours: "Tours & Charters",
  repair: "Repair & Service",
  retail: "Retail",
};

/** Short one-liner shown on the category page hero.
 *  Written for humans, in the site's voice. */
export const CATEGORY_INTRO: Record<ServiceTag, string> = {
  rentals:
    "Pontoons, jet skis, wakeboard boats, kayaks. Book the boat, hit the Channel.",
  sales:
    "New and used boats around Havasu — dealers, brokers, and consignment shops.",
  marina:
    "Full-service marinas on the lake — slips, fuel, ramps, and dry stack.",
  "dry-storage": "Indoor and covered storage for boats around Havasu.",
  "lot-storage": "Outdoor lots for trailered boats and RVs.",
  tours: "Guided boat tours and charters on Lake Havasu and the Colorado River.",
  repair: "Marine mechanics, service, and repair shops.",
  retail: "Watersport gear, parts, and accessories.",
};

export const TOWN_LABEL: Record<Town, string> = {
  "lake-havasu-city": "Lake Havasu City",
  parker: "Parker",
  "bullhead-city": "Bullhead City",
  laughlin: "Laughlin",
  needles: "Needles",
};

export const BOAT_TYPE_LABEL: Record<BoatType, string> = {
  pontoon: "Pontoon",
  pwc: "Jet Ski / PWC",
  "wakeboard-ski": "Wakeboard / Ski",
  kayak: "Kayak",
  paddleboard: "Paddleboard",
  fishing: "Fishing",
  houseboat: "Houseboat",
  performance: "Performance",
  cruiser: "Cruiser",
};
