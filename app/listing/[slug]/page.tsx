import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getListingBySlug } from "@/lib/listings";
import {
  CATEGORY_LABEL,
  CATEGORY_SLUG,
  TOWN_LABEL,
  BOAT_TYPE_LABEL,
  SITE,
} from "@/lib/constants";
import { ChartLabel } from "@/components/chart-label";
import { LeadForm } from "@/components/lead-form";

type Params = { slug: string };

/** Pre-generate every active listing at build time. */
export function generateStaticParams(): Params[] {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const l = getListingBySlug(slug);
  if (!l) return {};
  const town = l.town ? TOWN_LABEL[l.town] : "Lake Havasu";
  const primary = l.services[0];
  const primaryLabel = primary ? CATEGORY_LABEL[primary] : "Boat Business";
  return {
    title: `${l.name} — ${primaryLabel} in ${town}`,
    description:
      l.description ?? `${l.name}, ${primaryLabel} in ${town}, Arizona.`,
    alternates: { canonical: `${SITE.url}/listing/${l.slug}` },
    openGraph: l.photo
      ? { images: [{ url: l.photo, width: 800, height: 500 }] }
      : undefined,
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const l = getListingBySlug(slug);
  if (!l) notFound();

  const town = l.town ? TOWN_LABEL[l.town] : null;
  const primary = l.services[0];
  const primaryLabel = primary ? CATEGORY_LABEL[primary] : null;

  return (
    <>
      {/* Structured data — LocalBusiness JSON-LD makes listings eligible
          for rich results. This is a real SEO win at zero UI cost. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(l)),
        }}
      />

      <article className="mx-auto max-w-6xl px-6 py-12">
        {/* Breadcrumb / chart eyebrow */}
        <ChartLabel
          lat={l.lat}
          lng={l.lng}
          place={town}
          category={primaryLabel}
        />

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-display text-4xl font-bold tracking-tight text-channel-900 sm:text-5xl">
            {l.name}
          </h1>
          {l.rating != null && l.reviewCount != null && (
            <div className="font-mono text-sm text-channel-700">
              ★ {l.rating.toFixed(1)}
              <span className="ml-2 text-channel-500">
                ({l.reviewCount} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Hero photo */}
        {l.photo && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-sm bg-sandbar-100">
            <Image
              src={l.photo}
              alt={l.name}
              fill
              sizes="(max-width: 1200px) 100vw, 1152px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          {/* Main content */}
          <div>
            {l.description && (
              <p className="max-w-prose text-lg leading-relaxed text-channel-900">
                {l.description}
              </p>
            )}

            {l.longDescription && (
              <div className="mt-12 max-w-3xl">
                <h2 className="text-2xl font-semibold text-channel-900">
                  About {l.name}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-channel-700">
                  {l.longDescription.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Services + boat types */}
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {l.services.length > 0 && (
                <InfoBlock label="Services">
                  <div className="flex flex-wrap gap-2">
                    {l.services.map((s) => (
                      <Link
                        key={s}
                        href={`/${CATEGORY_SLUG[s]}`}
                        className="rounded-sm border border-channel-500 px-3 py-1 text-sm text-channel-700 hover:bg-channel-100"
                      >
                        {CATEGORY_LABEL[s]}
                      </Link>
                    ))}
                  </div>
                </InfoBlock>
              )}
              {l.boatTypes.length > 0 && (
                <InfoBlock label="Boat types">
                  <div className="flex flex-wrap gap-2">
                    {l.boatTypes.map((t) => (
                      <span
                        key={t}
                        className="rounded-sm bg-sandbar-100 px-3 py-1 text-sm text-channel-900"
                      >
                        {BOAT_TYPE_LABEL[t]}
                      </span>
                    ))}
                  </div>
                </InfoBlock>
              )}
            </div>

            {/* Contact details */}
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {l.address && <InfoBlock label="Address">{l.address}</InfoBlock>}
              {l.hours && <InfoBlock label="Hours">{l.hours}</InfoBlock>}
              {l.phone && (
                <InfoBlock label="Phone">
                  <a
                    href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}
                    className="text-channel-700 hover:text-rock"
                  >
                    {l.phone}
                  </a>
                </InfoBlock>
              )}
              {l.website && (
                <InfoBlock label="Website">
                  <a
                    href={l.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-channel-700 hover:text-rock"
                  >
                    {new URL(l.website).hostname.replace(/^www\./, "")}
                  </a>
                </InfoBlock>
              )}
            </div>
          </div>

          {/* Right rail: lead form */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-sm border border-channel-900/10 bg-paper p-6">
              <LeadForm listingName={l.name} listingSlug={l.slug} />
            </div>
            {l.bookingUrl && (
              <a
                href={l.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block rounded-sm border border-channel-700 py-3 text-center font-medium text-channel-700 hover:bg-channel-100"
              >
                Book directly →
              </a>
            )}
          </aside>
        </div>
      </article>
    </>
  );
}

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-chart text-channel-500">
        {label}
      </div>
      <div className="mt-1 text-channel-900">{children}</div>
    </div>
  );
}

// ── JSON-LD LocalBusiness schema for rich results ──────────────────────────
function buildJsonLd(l: ReturnType<typeof getListingBySlug> & object) {
  const type =
    l.services[0] === "sales"
      ? "AutoDealer"
      : l.services[0] === "marina"
        ? "TouristAttraction"
        : "LocalBusiness";
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: l.name,
    ...(l.description && { description: l.description }),
    ...(l.website && { url: l.website }),
    ...(l.phone && { telephone: l.phone }),
    ...(l.photo && { image: l.photo }),
    ...(l.address && {
      address: { "@type": "PostalAddress", streetAddress: l.address },
    }),
    ...(l.lat != null && l.lng != null && {
      geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng },
    }),
    ...(l.rating != null && l.reviewCount != null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: l.rating,
        reviewCount: l.reviewCount,
      },
    }),
  };
}
