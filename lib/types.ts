// ============================================================================
// Listing types — mirrors the shape emitted by scripts/build-listings.py
// ============================================================================

/** Service tags. A listing can carry several. Each becomes a category page,
 *  but only tags in LAUNCH_CATEGORIES render pages at launch. */
export type ServiceTag =
  | "rentals"
  | "sales"
  | "marina"
  | "dry-storage"
  | "lot-storage"
  | "tours"
  | "repair"
  | "retail";

export type BoatType =
  | "pontoon"
  | "pwc"
  | "wakeboard-ski"
  | "kayak"
  | "paddleboard"
  | "fishing"
  | "houseboat"
  | "performance"
  | "cruiser";

/** Light geo layer — only towns that share the Havasu boating market. */
export type Town =
  | "lake-havasu-city"
  | "parker"
  | "bullhead-city"
  | "laughlin"
  | "needles";

export type Listing = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  town: Town | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  bookingUrl: string | null;
  hours: string | null;
  lat: number | null;
  lng: number | null;
  services: ServiceTag[];
  boatTypes: BoatType[];
  rating: number | null;
  reviewCount: number | null;
  photo: string | null;
  verified: boolean;
  isFeatured: boolean;
  isClaimed: boolean;
  /** false for imported-but-dormant listings (e.g. Storage, before that
   *  category launches). Filtered out of all public routes. */
  isActive: boolean;
};
