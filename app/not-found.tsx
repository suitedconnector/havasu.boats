import Link from "next/link";
import { ChartLabel } from "@/components/chart-label";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <ChartLabel category="404 · Off Chart" />
      <h1 className="mt-4 font-display text-5xl font-bold text-channel-900">
        Nothing here.
      </h1>
      <p className="mt-4 text-channel-700">
        That listing may have been removed, or the URL is wrong.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-sm bg-channel-900 px-5 py-3 font-medium text-paper hover:bg-rock"
      >
        Back to directory
      </Link>
    </section>
  );
}
