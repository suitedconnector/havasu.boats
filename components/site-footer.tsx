import { SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-channel-900/10 bg-channel-900 text-sandbar-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="font-display text-xl font-bold">
              havasu<span className="text-buoy">.</span>boats
            </div>
            <p className="mt-2 max-w-sm text-sm text-sandbar-100/70">
              {SITE.description}
            </p>
          </div>
          <div className="font-mono text-[11px] tracking-chart uppercase text-sandbar-100/60">
            <div>34°29′00″N  114°20′00″W</div>
            <div className="mt-1">Lake Havasu · Colorado River</div>
          </div>
        </div>
        <div className="mt-10 border-t border-sandbar-100/10 pt-6 text-xs text-sandbar-100/50">
          Business owner? Contact us to claim or update your listing.
        </div>
      </div>
    </footer>
  );
}
