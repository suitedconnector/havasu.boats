import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/types";
import { CATEGORY_LABEL, TOWN_LABEL, BOAT_TYPE_LABEL } from "@/lib/constants";
import { ChartLabel } from "./chart-label";

type Props = { listing: Listing };

export function ListingCard({ listing }: Props) {
  const primaryService = listing.services[0];
  const town = listing.town ? TOWN_LABEL[listing.town] : null;
  const boatTypes = listing.boatTypes
    .slice(0, 3)
    .map((t) => BOAT_TYPE_LABEL[t])
    .join(" · ");

  return (
    <Link
      href={`/listing/${listing.slug}`}
      className="group block overflow-hidden rounded-sm border border-channel-900/10 bg-paper transition hover:border-channel-500"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-sandbar-100">
        {listing.photo ? (
          <Image
            src={listing.photo}
            alt={listing.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-channel-300">
            <span className="font-mono text-xs uppercase tracking-chart">
              No photo
            </span>
          </div>
        )}
        {listing.isFeatured && (
          <div className="absolute left-3 top-3 rounded-sm bg-buoy px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-chart text-ink">
            Featured
          </div>
        )}
      </div>

      <div className="p-5">
        <ChartLabel
          lat={listing.lat}
          lng={listing.lng}
          place={town}
          category={primaryService ? CATEGORY_LABEL[primaryService] : null}
        />
        <h3 className="mt-2 font-display text-lg font-semibold leading-tight text-channel-900 group-hover:text-rock">
          {listing.name}
        </h3>
        {boatTypes && (
          <p className="mt-2 text-sm text-channel-500">{boatTypes}</p>
        )}
        {listing.rating != null && listing.reviewCount != null && (
          <div className="mt-3 flex items-center gap-2 text-xs text-channel-700">
            <span className="font-semibold text-ink">
              ★ {listing.rating.toFixed(1)}
            </span>
            <span className="text-channel-500">
              ({listing.reviewCount} reviews)
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
