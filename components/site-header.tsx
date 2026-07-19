import Link from "next/link";
import { getLiveCategories } from "@/lib/listings";
import { CATEGORY_LABEL, CATEGORY_SLUG, SITE } from "@/lib/constants";

export function SiteHeader() {
  const cats = getLiveCategories();
  return (
    <header className="border-b border-channel-900/10 bg-sandbar-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-channel-900">
            havasu<span className="text-rock">.</span>boats
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-channel-900">
          {cats.map((c) => (
            <Link
              key={c}
              href={`/${CATEGORY_SLUG[c]}`}
              className="hover:text-rock"
            >
              {CATEGORY_LABEL[c]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
