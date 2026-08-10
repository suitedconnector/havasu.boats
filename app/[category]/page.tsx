import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getListingsByService,
  serviceFromSlug,
  getLiveCategories,
} from "@/lib/listings";
import {
  CATEGORY_LABEL,
  CATEGORY_INTRO,
  CATEGORY_SLUG,
  SITE,
} from "@/lib/constants";
import { ChartLabel } from "@/components/chart-label";
import { ListingCard } from "@/components/listing-card";
import { Breadcrumb } from "@/components/breadcrumb";

type Params = { category: string };

/** Pre-render one page per live category at build time. This is the pSEO
 *  spine: static HTML, indexed instantly, no runtime. */
export function generateStaticParams(): Params[] {
  return getLiveCategories().map((s) => ({ category: CATEGORY_SLUG[s] }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  const service = serviceFromSlug(category);
  if (!service) return {};
  return {
    title: `${CATEGORY_LABEL[service]} in Lake Havasu`,
    description: CATEGORY_INTRO[service],
    alternates: { canonical: `${SITE.url}/${category}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;
  const service = serviceFromSlug(category);
  if (!service) notFound();

  const listings = getListingsByService(service);

  return (
    <>
      <section className="border-b border-channel-900/10 bg-sandbar-50">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: CATEGORY_LABEL[service] }]} />
          <ChartLabel
            place="Lake Havasu"
            category={`${listings.length} listings`}
          />
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-channel-900">
            {CATEGORY_LABEL[service]}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-channel-700">
            {CATEGORY_INTRO[service]}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {listings.length === 0 ? (
          <p className="text-channel-700">No listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
