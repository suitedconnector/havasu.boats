import Link from "next/link";
import { getLiveCategories, getListingsByService } from "@/lib/listings";
import { CATEGORY_LABEL, CATEGORY_SLUG, CATEGORY_INTRO, SITE } from "@/lib/constants";
import { ChartLabel } from "@/components/chart-label";

export default function Home() {
  const cats = getLiveCategories();
  return (
    <>
      {/* Hero. The thesis: a directory framed as a chart of the lake. */}
      <section className="border-b border-channel-900/10 bg-sandbar-50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <ChartLabel
            lat={34.4839}
            lng={-114.3224}
            place="Lake Havasu · Colorado River"
            category="Directory · Est. 2026"
          />
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-channel-900 sm:text-6xl">
            Every boat on the lake — rentals, dealers, marinas — in one place.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-channel-700">
            {SITE.description} Curated locally. Free to browse. No signup.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {cats.map((c) => (
              <Link
                key={c}
                href={`/${CATEGORY_SLUG[c]}`}
                className="rounded-sm bg-channel-900 px-5 py-3 font-medium text-paper transition hover:bg-rock"
              >
                {CATEGORY_LABEL[c]} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category preview strips */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-16">
          {cats.map((c) => {
            const items = getListingsByService(c).slice(0, 3);
            return (
              <div key={c}>
                <div className="mb-6 flex items-baseline justify-between">
                  <div>
                    <ChartLabel category={`${items.length}+ listings`} />
                    <h2 className="mt-1 font-display text-3xl font-bold text-channel-900">
                      {CATEGORY_LABEL[c]}
                    </h2>
                    <p className="mt-1 max-w-xl text-channel-700">
                      {CATEGORY_INTRO[c]}
                    </p>
                  </div>
                  <Link
                    href={`/${CATEGORY_SLUG[c]}`}
                    className="font-mono text-xs uppercase tracking-chart text-channel-500 hover:text-rock"
                  >
                    See all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((l) => (
                    <PreviewCard key={l.id} name={l.name} slug={l.slug} town={l.town} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function PreviewCard({
  name,
  slug,
  town,
}: {
  name: string;
  slug: string;
  town: string | null;
}) {
  return (
    <Link
      href={`/listing/${slug}`}
      className="block rounded-sm border border-channel-900/10 bg-paper p-5 transition hover:border-channel-500"
    >
      <div className="font-mono text-[11px] uppercase tracking-chart text-channel-500">
        {town?.replace(/-/g, " ") ?? "—"}
      </div>
      <div className="mt-2 font-display text-lg font-semibold text-channel-900">
        {name}
      </div>
    </Link>
  );
}
